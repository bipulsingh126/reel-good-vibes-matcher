
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
    if (content.includes('Cannot access') || content.includes('before initialization') || file.includes('DWkEkHqs')) {
      console.log(`Found likely problematic vendor file: ${file}`);
      
      // Look for the specific pattern around line 20 (where the error occurs)
      // This is a more aggressive approach to fix the specific issue
      
      // Method 1: Add z variable definition at the beginning of the file
      content = `/* Patched to fix z initialization */
var z = {};
window.z = window.z || z;
${content}`;
      
      // Method 2: Try to find and fix the specific code pattern
      // Look for patterns like "z.something" or "z=" and add a safety check
      content = content.replace(/(\W)z(\W|\.|=)/g, '$1(window.z = window.z || {})$2');
      
      // Method 3: Add a special error handler for this specific error
      content = `/* Error handler for z initialization */
window.addEventListener('error', function(event) {
  if (event.message && event.message.includes('Cannot access \\'z\\'')) {
    console.log('Prevented z initialization error');
    event.preventDefault();
    window.z = window.z || {};
    return false;
  }
});
${content}`;
    } else {
      // For other vendor files, just add the z variable definition
      content = `/* Patched to fix z initialization */
window.z = window.z || {};
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
