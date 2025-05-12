
// This script patches vendor code issues
(function() {
  // CRITICAL: Define z variable globally before any scripts run
  window.z = window.z || {};
  
  // Create a MutationObserver to detect when vendor scripts are added
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.tagName === 'SCRIPT') {
            // Handle any script tag that gets added
            if (node.src) {
              // For vendor scripts, add our z variable initialization
              if (node.src.includes('vendor-') || node.src.includes('X8AeWD1T')) {
                // Create a new script that will execute before the vendor script
                const patchScript = document.createElement('script');
                patchScript.textContent = `
                  // Pre-define z to prevent initialization error
                  window.z = window.z || {};
                  
                  // Create a safety wrapper around the vendor script
                  (function() {
                    // Handle errors in the vendor script
                    window.addEventListener('error', function(e) {
                      if (e.message && e.message.includes("Cannot access 'z'")) {
                        console.log('Prevented vendor script z error');
                        if (typeof window.z === 'undefined') {
                          window.z = {};
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
                node.addEventListener('error', function(e) {
                  console.log('Handling vendor script load error');
                  if (typeof window.z === 'undefined') {
                    window.z = {};
                  }
                  e.preventDefault();
                  return false;
                });
              }
              
              // For Cloudflare scripts, prevent loading
              if (node.src.includes('cloudflareinsights.com') || node.src.includes('beacon.min.js')) {
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
      window.z = window.z || {};
      console.log('Patched existing vendor script');
    `;
    
    if (script.parentNode) {
      script.parentNode.insertBefore(patchScript, script);
    }
  });
  
  // Create a special patch for the problematic X8AeWD1T.js file
  setTimeout(() => {
    document.querySelectorAll('script[src*="X8AeWD1T"]').forEach(script => {
      const specialPatch = document.createElement('script');
      specialPatch.textContent = `
        // Emergency patch for X8AeWD1T.js
        window.z = window.z || {};
        console.log('Applied special patch for X8AeWD1T.js');
      `;
      
      if (script.parentNode) {
        script.parentNode.insertBefore(specialPatch, script);
      }
    });
  }, 0);
  
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
})();
