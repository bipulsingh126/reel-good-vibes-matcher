/**
 * This script fixes initialization issues in vendor scripts
 * It pre-defines variables that might be accessed before initialization
 */

// Define common variables that might be accessed before initialization
window.__VENDOR_FIX__ = true;

// Define 'z' variable that's being accessed before initialization
if (typeof window.z === 'undefined') {
  window.z = null;
}

// Define other common variables that might cause similar issues
const commonVars = ['z', '__REACT_DEVTOOLS_GLOBAL_HOOK__', '__VUE_DEVTOOLS_GLOBAL_HOOK__', 'ga', 'gtag', 'fbq'];
commonVars.forEach(varName => {
  if (typeof window[varName] === 'undefined') {
    window[varName] = null;
  }
});

console.log('Vendor fix script loaded'); 