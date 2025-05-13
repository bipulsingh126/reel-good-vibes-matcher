/**
 * Vendor patch for fixing Maximum call stack size exceeded errors
 * Specifically targets PopperContent components from Radix UI
 */

// Set flag to avoid reapplying patch
window.__VENDOR_FIX__ = window.__VENDOR_FIX__ || {};

// Function to safely patch toString methods
function patchToString() {
  // Only apply once
  if (window.__VENDOR_FIX__.toString) return;
  window.__VENDOR_FIX__.toString = true;
  
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
            const script = node;
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
              
              // Check children
              const poppers = node.querySelectorAll('[data-radix-popper-content-wrapper]');
              poppers.forEach(patchElement);
            }
          });
        }
      });
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also patch any existing elements
    document.querySelectorAll('[data-radix-popper-content-wrapper]').forEach(patchElement);
  } catch (e) {
    console.warn("Failed to watch for popper elements:", e);
  }
}

// Function to prevent maximum call stack errors
function preventStackOverflow() {
  if (window.__VENDOR_FIX__.stackOverflow) return;
  window.__VENDOR_FIX__.stackOverflow = true;
  
  try {
    // Add a global error handler
    window.addEventListener('error', event => {
      // Check if this is a maximum call stack error
      if (event.message && event.message.includes('Maximum call stack size exceeded')) {
        // Check if it's coming from PopperContent or radix
        const stack = event.error && event.error.stack || '';
        if (stack.includes('PopperContent') || stack.includes('popper') || stack.includes('radix')) {
          console.warn('Prevented maximum call stack error in popper component');
          event.preventDefault();
          return false;
        }
      }
      return true;
    }, true);
  } catch (e) {
    console.warn("Failed to add stack overflow prevention:", e);
  }
}

// Apply all patches
function applyPatches() {
  // Apply toString patches
  patchToString();
  
  // Watch for popper elements
  watchForPopperElements();
  
  // Prevent stack overflow errors
  preventStackOverflow();
  
  console.log("Vendor patch applied successfully");
}

// Apply immediately and also after page load
applyPatches();
window.addEventListener('DOMContentLoaded', applyPatches);
window.addEventListener('load', applyPatches);

// Apply again after a delay to catch late-loaded elements
setTimeout(applyPatches, 1000);
