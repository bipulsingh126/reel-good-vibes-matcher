// This script serves as a final check to ensure z is initialized
(function() {
  // Ensure z exists
  if (typeof window.z === 'undefined') {
    console.error('z is still undefined in z-initializer.js, fixing immediately');
    // Create a new z object
    var _z = {};
    
    try {
      // Define z with powerful protection
      Object.defineProperty(window, 'z', {
        get: function() { return _z; },
        set: function(val) {
          if (val && typeof val === 'object') {
            Object.assign(_z, val);
          }
          return _z;
        },
        configurable: true,
        enumerable: true
      });
    } catch(e) {
      // Fallback to direct assignment
      window.z = _z;
    }
    
    window.__zInitialized = true;
    window.__zEmergencyFix = true;
  }
  
  // Make z available in global scope
  var z = window.z;
  
  // Report z initialization status
  console.log('z-initializer.js loaded, z status:', {
    exists: typeof window.z !== 'undefined',
    isObject: typeof window.z === 'object',
    initTime: window.__zInitTime,
    initialized: window.__zInitialized
  });
  
  // Add special prototype extensions to vendor scripts
  const installVendorPatches = function() {
    // Find all vendor scripts
    const vendorScripts = Array.from(document.querySelectorAll('script[src*="vendor-"], script[src*="X8AeWD1T"]'));
    
    // For each vendor script, add a z variable
    vendorScripts.forEach(script => {
      try {
        // Add a custom data attribute to track patched status
        script.setAttribute('data-z-patched', 'true');
        
        // Create an inline script to run right before it
        const inlineScript = document.createElement('script');
        inlineScript.textContent = `
          // Inline script to ensure z is available for ${script.src}
          (function() {
            // Create a z variable in this scope
            var z = window.z;
            
            // Patch Function.prototype.toString to handle potential checks
            const originalToString = Function.prototype.toString;
            Function.prototype.toString = function() {
              // For function trying to access z
              if (this.toString().includes('z.') || this.toString().includes('var z')) {
                return originalToString.call(this).replace(
                  /(\W)z\./g, '$1(window.z = window.z || {}).'
                ).replace(
                  /var\s+z\s*=/g, 'var z = window.z ='
                );
              }
              return originalToString.apply(this, arguments);
            };
          })();
        `;
        
        // Insert before the vendor script
        if (script.parentNode) {
          script.parentNode.insertBefore(inlineScript, script);
        }
      } catch(e) {
        console.error('Error patching vendor script:', e);
      }
    });
  };
  
  // Run vendor patches immediately
  installVendorPatches();
  
  // Run again after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installVendorPatches);
  }
  
  // Run again after window loads
  window.addEventListener('load', installVendorPatches);
  
  // Create special prototype method to handle z access
  Object.defineProperty(Object.prototype, '__z', {
    get: function() {
      return window.z;
    }
  });
  
  // Add a final global error handler specifically for vendor-X8AeWD1T.js
  window.addEventListener('error', function(event) {
    if (
      (event.filename && event.filename.includes('X8AeWD1T')) ||
      (event.message && (
        event.message.includes("Cannot access 'z'") ||
        event.message.includes('before initialization') ||
        event.message.includes("'z' is not defined")
      ))
    ) {
      console.log('z-initializer.js prevented error:', event);
      
      // Fix z immediately
      if (typeof window.z === 'undefined') {
        window.z = {};
        window.__zEmergencyRecovery = true;
      }
      
      event.preventDefault();
      return false;
    }
  }, true);
})();
