
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
    
    // Add z variable definition at the beginning of the file
    const patchedContent = `/* Patched to fix z initialization */
window.z = window.z || {};
(function(){
  // Ensure z exists before the module runs
  if (typeof window.z === 'undefined') {
    window.z = {};
  }
})();
${content}`;
    
    // Write the patched content back
    fs.writeFileSync(filePath, patchedContent);
    console.log(`Successfully patched ${file}`);
  });
  
  console.log('All vendor files patched successfully');
} catch (error) {
  console.error('Error patching vendor files:', error);
} 
