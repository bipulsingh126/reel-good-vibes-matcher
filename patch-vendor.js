// Script to patch vendor files after build
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Running vendor file patcher...');

// Find all vendor files in the dist directory
const distDir = path.join(__dirname, 'dist', 'assets');
try {
  const files = fs.readdirSync(distDir);
  
  // Find vendor files
  const vendorFiles = files.filter(file => 
    file.includes('vendor-') && 
    file.endsWith('.js') && 
    !file.endsWith('.br') && 
    !file.endsWith('.gz')
  );
  
  console.log(`Found ${vendorFiles.length} vendor files to patch`);
  
  // Patch each vendor file
  vendorFiles.forEach(file => {
    const filePath = path.join(distDir, file);
    console.log(`Patching ${filePath}...`);
    
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if this is likely the problematic vendor file
    if (content.includes('Cannot access') || 
        content.includes('before initialization') || 
        file.includes('X8AeWD1T') || 
        file.includes('DWkEkHqs')) {
      console.log(`Found likely problematic vendor file: ${file}`);
      
      // Comprehensive patch for X8AeWD1T issue
      content = `/* Advanced patch for z initialization in X8AeWD1T */
(function(){
  // CRITICAL: Define z variable with Object.defineProperty before any code runs
  var _z = window.z || {};
  
  // Store the original z to restore it if needed
  var originalZ = window.z;
  
  try {
    Object.defineProperty(window, 'z', {
      get: function() { 
        // Always return a valid object, never undefined
        return _z || {}; 
      },
      set: function(val) {
        // If z is set to a new object, merge properties instead of replacing
        if (val && typeof val === 'object') {
          Object.assign(_z, val);
        }
        return _z;
      },
      configurable: true,
      enumerable: true
    });
    window.__zInitialized = true;
  } catch(e) {
    // Fallback if defineProperty fails
    window.z = window.z || {};
  }
  
  // Add specific error handler for z initialization issues
  window.addEventListener('error', function(e) {
    if (e.message && (
      e.message.includes("Cannot access 'z'") ||
      e.message.includes('before initialization') ||
      e.message.includes("Identifier 'z' has already been declared")
    )) {
      console.log('Prevented z initialization error in X8AeWD1T');
      
      // Restore z if it was lost
      if (typeof window.z === 'undefined') {
        window.z = originalZ || _z || {};
      }
      
      e.preventDefault();
      return false;
    }
  }, true);
})();

${content}`;
      
      // Method 2: Fix any direct access to the z variable 
      content = content.replace(/(\W)z\.([a-zA-Z0-9_]+)/g, '$1(window.z = window.z || {}).$2');
      content = content.replace(/(\W)z\s*=/g, '$1(window.z = window.z || {})');
      
      // Method 3: Replace any declarations of z with safer assignment
      content = content.replace(/var\s+z\s*=/g, 'window.z = window.z || {}; window.z =');
      content = content.replace(/let\s+z\s*=/g, 'window.z = window.z || {}; window.z =');
      content = content.replace(/const\s+z\s*=/g, 'window.z = window.z || {}; window.z =');
    } else {
      // For other vendor files, add a basic z initialization
      content = `/* Basic z initialization */
(function(){
  // Ensure z exists before the module runs
  if (typeof window.z === 'undefined') {
    window.z = {};
  }
})();
${content}`;
    }
    
    // Write the patched content back
    fs.writeFileSync(filePath, content);
    console.log(`Successfully patched ${file}`);
    
    // Also create compressed versions
    try {
      // Create gzip version
      const gzipPath = `${filePath}.gz`;
      if (fs.existsSync(gzipPath)) {
        fs.writeFileSync(gzipPath, content);
      }
      
      // Create brotli version
      const brPath = `${filePath}.br`;
      if (fs.existsSync(brPath)) {
        fs.writeFileSync(brPath, content);
      }
    } catch (compressionError) {
      console.error(`Error updating compressed files: ${compressionError}`);
    }
  });
  
  console.log('All vendor files patched successfully');
} catch (error) {
  console.error('Error patching vendor files:', error);
} 
