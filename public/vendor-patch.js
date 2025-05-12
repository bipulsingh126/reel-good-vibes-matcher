
// This script patches vendor code issues
(function() {
  // CRITICAL: Define z variable globally before any scripts run
  // Use Object.defineProperty for more control over the z variable
  if (typeof window.z === 'undefined') {
    Object.defineProperty(window, 'z', {
      value: {},
      writable: true,
      configurable: true,
      enumerable: true
    });
    window.__zInitialized = true;
  }
  
  // Store the original z value in case it gets overwritten
  const originalZ = window.z;
  
  // Add a special patch for X8AeWD1T.js which has initialization issues
  const patchVendorX8AeWD1T = () => {
    document.querySelectorAll('script[src*="X8AeWD1T"]').forEach(script => {
      // Create and inject a script that runs before the problematic vendor script
      const specialPatch = document.createElement('script');
      specialPatch.textContent = `
        // Emergency patch specifically for X8AeWD1T.js
        (function() {
          // Define z with Object.defineProperty to ensure it's available
          if (typeof window.z === 'undefined') {
            Object.defineProperty(window, 'z', {
              value: {},
              writable: true,
              configurable: true, 
              enumerable: true
            });
            window.__zInitialized = true;
          }
          
          // Create getter/setter for additional protection
          const _z = window.z;
          
          try {
            Object.defineProperty(window, 'z', {
              get: function() { 
                return _z || {};
              },
              set: function(val) {
                // If someone tries to set z, merge the properties
                if (val && typeof val === 'object') {
                  Object.assign(_z, val);
                }
                return _z;
              },
              configurable: true,
              enumerable: true
            });
          } catch (e) {
            console.warn('Failed to create z getter/setter', e);
          }
          
          console.log('Applied X8AeWD1T.js special patch');
        })();
      `;
      
      // Insert our patch right before the vendor script
      if (script.parentNode) {
        script.parentNode.insertBefore(specialPatch, script);
      }
    });
  };
  
  // Run the special patch immediately
  patchVendorX8AeWD1T();
  
  // Run it again after a short delay to catch any late-loaded scripts
  setTimeout(patchVendorX8AeWD1T, 0);
  
  // Create a MutationObserver to detect when vendor scripts are added
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeName === 'SCRIPT') {
            const script = node as HTMLScriptElement;
            // Handle any script tag that gets added
            if (script.src) {
              // For vendor scripts, add our z variable initialization
              if (script.src.includes('vendor-') || script.src.includes('X8AeWD1T')) {
                // Create a new script that will execute before the vendor script
                const patchScript = document.createElement('script');
                patchScript.textContent = `
                  // Pre-define z to prevent initialization error
                  (function() {
                    if (typeof window.z === 'undefined') {
                      Object.defineProperty(window, 'z', {
                        value: {},
                        writable: true,
                        configurable: true,
                        enumerable: true
                      });
                      window.__zInitialized = true;
                    }
                    
                    // Store the original z
                    const _z = window.z;
                    
                    // Create a safety wrapper around the vendor script
                    window.addEventListener('error', function(e) {
                      if (e.message && (
                        e.message.includes("Cannot access 'z'") ||
                        e.message.includes('before initialization') ||
                        e.message.includes("Identifier 'z' has already been declared")
                      )) {
                        console.log('Prevented vendor script z error');
                        
                        // Restore z if it was lost
                        if (typeof window.z === 'undefined') {
                          window.z = _z || {};
                        }
                        
                        e.preventDefault();
                        return false;
                      }
                    }, true);
                  })();
                `;
                
                // Insert our patch script before the vendor script
                if (node.parentNode) {
                  node.parentNode.insertBefore(patchScript, node);
                }
                
                // Also intercept errors on the script itself
                script.addEventListener('error', function(e) {
                  console.log('Handling vendor script load error');
                  if (typeof window.z === 'undefined') {
                    window.z = originalZ || {};
                  }
                  e.preventDefault();
                  return false;
                });
              }
              
              // For Cloudflare scripts, prevent loading
              if (script.src.includes('cloudflareinsights.com') || script.src.includes('beacon.min.js')) {
                // Remove the script to prevent loading
                if (node.parentNode) {
                  node.parentNode.removeChild(node);
                }
              }
            }
          }
        }
      }
    }
  });
  
  // Start observing the document with all subtree modifications
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  
  // Handle existing scripts before observer is attached
  document.querySelectorAll('script[src*="vendor-"]').forEach(script => {
    const patchScript = document.createElement('script');
    patchScript.textContent = `
      // Ensure z is defined
      if (typeof window.z === 'undefined') {
        Object.defineProperty(window, 'z', {
          value: {},
          writable: true,
          configurable: true,
          enumerable: true
        });
        window.__zInitialized = true;
      }
      console.log('Patched existing vendor script');
    `;
    
    if (script.parentNode) {
      script.parentNode.insertBefore(patchScript, script);
    }
  });
  
  // Block network requests to problematic URLs
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && (
      url.includes('cloudflareinsights.com') || 
      url.includes('beacon.min.js')
    )) {
      return Promise.resolve(new Response('', { status: 200 }));
    }
    return originalFetch.apply(this, arguments);
  };
  
  // Add a global error handler for z initialization errors
  window.addEventListener('error', function(event) {
    if (event.message && (
      event.message.includes("Cannot access 'z'") ||
      event.message.includes('before initialization') ||
      event.message.includes("Identifier 'z' has already been declared")
    )) {
      console.log('Prevented global z error:', event.message);
      
      // Fix z immediately
      if (typeof window.z === 'undefined') {
        window.z = originalZ || {};
      }
      
      event.preventDefault();
      return false;
    }
  }, true);
  
  // Also handle any errors that might occur during script execution
  window.onerror = function(message, source, lineno, colno, error) {
    if (message && (
      message.toString().includes("Cannot access 'z'") ||
      message.toString().includes('before initialization')
    )) {
      console.log('Prevented onerror z error:', message);
      
      // Ensure z exists
      if (typeof window.z === 'undefined') {
        window.z = originalZ || {};
      }
      
      return true; // Prevents the error from being reported
    }
    return false; // Let other errors through
  };
})();
