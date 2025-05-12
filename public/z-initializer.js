// This script must be the first script to run
(function() {
  // Only define z if it doesn't exist yet
  if (typeof window.z === 'undefined') {
    window.z = {};
  }

  // Monkey patch the vendor script that has the issue
  (function() {
    // Find and patch the problematic vendor script
    const patchVendorScript = () => {
      const scripts = document.querySelectorAll('script[src*="vendor-"]');
      scripts.forEach(script => {
        // Create a new script element that will run before the vendor script
        const patchScript = document.createElement('script');
        patchScript.textContent = `
          // Make absolutely sure z is defined before vendor script runs
          if (typeof window.z === 'undefined') {
            window.z = {};
          }
          
          // Create a proxy for the z variable to handle any access
          window.z = new Proxy(window.z || {}, {
            get: function(target, prop) {
              return target[prop];
            },
            set: function(target, prop, value) {
              target[prop] = value;
              return true;
            }
          });
        `;
        
        // Insert the patch script before the vendor script
        if (script.parentNode) {
          script.parentNode.insertBefore(patchScript, script);
        }
      });
    };
    
    // Run immediately and also when DOM is ready
    patchVendorScript();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', patchVendorScript);
    }
  })();
})();
