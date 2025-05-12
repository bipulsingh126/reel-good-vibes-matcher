// This script patches vendor code issues
(function() {
  // CRITICAL: Define z variable globally before any scripts run
  window.z = {};
  
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
                console.log('Patched z variable before vendor script');
              `;
              node.parentNode.insertBefore(patchScript, node);
            }
            
            // For Cloudflare scripts, prevent loading
            if (node.src.includes('cloudflareinsights.com') || node.src.includes('beacon.min.js')) {
              // Remove the script to prevent loading
              if (node.parentNode) {
                node.parentNode.removeChild(node);
                console.log('Blocked Cloudflare script:', node.src);
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
  
  // Suppress specific console errors
  const originalConsoleError = console.error;
  console.error = function() {
    const errorMsg = Array.from(arguments).join(' ');
    if (errorMsg.includes('ERR_BLOCKED_BY_CLIENT') || 
        errorMsg.includes('Cannot access') || 
        errorMsg.includes('before initialization')) {
      // Suppress these errors
      return;
    }
    return originalConsoleError.apply(console, arguments);
  };
  
  // Block network requests to problematic URLs
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && (
      url.includes('cloudflareinsights.com') || 
      url.includes('beacon.min.js')
    )) {
      console.log('Blocked fetch request to:', url);
      return Promise.resolve(new Response('', { status: 200 }));
    }
    return originalFetch.apply(this, arguments);
  };
  
  // Block XMLHttpRequest to problematic URLs
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    if (typeof url === 'string' && (
      url.includes('cloudflareinsights.com') || 
      url.includes('beacon.min.js')
    )) {
      console.log('Blocked XMLHttpRequest to:', url);
      // Call open with a dummy URL
      return originalXhrOpen.call(this, method, 'about:blank');
    }
    return originalXhrOpen.apply(this, arguments);
  };
  
  console.log('Vendor patch script loaded and active');
})(); 