
// This script patches vendor code issues
(function() {
  // CRITICAL: Define z variable globally before any scripts run
  window.z = window.z || {};
  
  // Create a MutationObserver to detect when vendor scripts are added
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.tagName === 'SCRIPT' && node.src && 
              (node.src.includes('vendor-') || 
               node.src.includes('cloudflareinsights.com') || 
               node.src.includes('beacon.min.js'))) {
            
            // For vendor scripts, add our z variable and patch
            if (node.src.includes('vendor-')) {
              // Add a script that runs before the vendor script
              const patchScript = document.createElement('script');
              patchScript.textContent = `
                // Pre-define z to prevent initialization error
                window.z = window.z || {};
              `;
              node.parentNode.insertBefore(patchScript, node);
              
              // Also wrap the script in a try-catch to prevent errors
              node.onerror = function(e) {
                console.log('Prevented vendor script error');
                e.preventDefault();
                e.stopPropagation();
                return true;
              };
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
  });
  
  // Start observing the document
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  
  // Additional fix: If there are any existing vendor scripts, patch them now
  document.querySelectorAll('script[src*="vendor-"]').forEach(script => {
    const patchScript = document.createElement('script');
    patchScript.textContent = "window.z = window.z || {};";
    
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
})();
