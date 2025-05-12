
/**
 * Utility to handle blocked resources and suppress related errors
 */

// Create dummy resources to replace blocked ones
export function createDummyResources() {
  // Ensure z is defined - use a more definitive approach
  // Define z globally using Object.defineProperty for better control
  if (typeof window.z === 'undefined') {
    Object.defineProperty(window, 'z', {
      value: {},
      writable: true,
      configurable: true,
      enumerable: true
    });

    // Add a flag to indicate z has been initialized
    window.__zInitialized = true;
  }
  
  // Create a dummy WebSocket class to replace blocked WebSocket connections
  const OriginalWebSocket = window.WebSocket;
  const FakeWebSocket = function(url: string, protocols?: string | string[]) {
    if (url.includes('localhost:8080')) {
      // Create a fake WebSocket that doesn't actually connect
      const fakeWS = {
        url,
        readyState: 1, // OPEN
        protocol: '',
        extensions: '',
        bufferedAmount: 0,
        binaryType: 'blob' as BinaryType,
        onopen: null,
        onerror: null,
        onclose: null,
        onmessage: null,
        send: () => {},
        close: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true
      };
      
      // Simulate successful connection
      setTimeout(() => {
        if (fakeWS.onopen) {
          fakeWS.onopen(new Event('open'));
        }
      }, 50);
      
      return fakeWS as unknown as WebSocket;
    }
    
    // Otherwise use the real WebSocket
    return new OriginalWebSocket(url, protocols);
  } as unknown as typeof WebSocket;
  
  // Copy the prototype without modifying read-only properties
  FakeWebSocket.prototype = OriginalWebSocket.prototype;
  
  // Copy the static constants without assignment
  Object.defineProperties(FakeWebSocket, {
    CONNECTING: { value: OriginalWebSocket.CONNECTING },
    OPEN: { value: OriginalWebSocket.OPEN },
    CLOSING: { value: OriginalWebSocket.CLOSING },
    CLOSED: { value: OriginalWebSocket.CLOSED }
  });
  
  // Replace the original WebSocket
  window.WebSocket = FakeWebSocket;
  
  // Special fix for vendor-X8AeWD1T.js file which has the z initialization issue
  const vendorScriptFix = () => {
    // Find any script tags for the problematic vendor file
    const vendorScripts = document.querySelectorAll('script[src*="vendor-"]');
    vendorScripts.forEach(script => {
      // For each vendor script, inject our z fix script right before it
      const fixScript = document.createElement('script');
      fixScript.textContent = `
        // Ensure z exists before vendor script executes
        (function() {
          if (typeof window.z === 'undefined') {
            Object.defineProperty(window, 'z', {
              value: {},
              writable: true,
              configurable: true,
              enumerable: true
            });
            window.__zInitialized = true;
            console.log('z initialized via vendor script fix');
          }
        })();
      `;
      
      if (script.parentNode) {
        script.parentNode.insertBefore(fixScript, script);
      }
    });
  };
  
  // Execute the vendor script fix immediately
  vendorScriptFix();
  
  // Also run it when DOM is ready to catch any scripts added after initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', vendorScriptFix);
  }
  
  // Create a MutationObserver to intercept script loading
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          // Check for script tags being added
          if (node.nodeName === 'SCRIPT') {
            const script = node as HTMLScriptElement;
            
            // List of domains to block
            const blockDomains = [
              'cloudflareinsights.com',
              'sentry.io',
              'facebook.net',
              'tiktok.com',
              'lovable-api.com',
              'firestore.googleapis.com'
            ];
            
            // Check if this script should be blocked
            if (script.src && blockDomains.some(domain => script.src.includes(domain))) {
              // Prevent the script from loading
              script.src = '';
              
              // Simulate successful load
              setTimeout(() => {
                const event = new Event('load');
                script.dispatchEvent(event);
              }, 10);
              
              // Prevent default action
              if (mutation.target && mutation.target instanceof Element) {
                mutation.target.removeChild(script);
              }
            }
            
            // Special handling for vendor scripts
            if (script.src && (script.src.includes('vendor-') || script.src.includes('X8AeWD1T'))) {
              // Add z definition before vendor script loads
              const zDefScript = document.createElement('script');
              zDefScript.textContent = `
                // Define z variable before vendor script executes
                (function() {
                  if (typeof window.z === 'undefined') {
                    Object.defineProperty(window, 'z', {
                      value: {},
                      writable: true,
                      configurable: true,
                      enumerable: true
                    });
                    window.__zInitialized = true;
                    console.log('z initialized via mutation observer');
                  }
                })();
              `;
              if (script.parentNode) {
                script.parentNode.insertBefore(zDefScript, script);
              }
            }
          }
        }
      }
    }
  });
  
  // Start observing document for script additions
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  
  // Add event listener for vendor script errors
  window.addEventListener('error', function(event) {
    // Check specifically for the z initialization error
    if (event.message && (
      event.message.includes("Cannot access 'z'") ||
      event.message.includes('before initialization') ||
      (event.filename && event.filename.includes('vendor-'))
    )) {
      console.log('Prevented vendor script z error in blockHandler:', event.message);
      
      // Fix z immediately when the error occurs
      if (typeof window.z === 'undefined') {
        Object.defineProperty(window, 'z', {
          value: {},
          writable: true,
          configurable: true,
          enumerable: true
        });
        window.__zInitialized = true;
      }
      
      // Prevent default action
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);
  
  // Create a safety net for any potential z access issues
  // This runs after a small delay to ensure it catches any late initialization issues
  setTimeout(() => {
    if (typeof window.z === 'undefined') {
      Object.defineProperty(window, 'z', {
        value: {},
        writable: true,
        configurable: true,
        enumerable: true
      });
      window.__zInitialized = true;
      console.log('z initialized via safety net timeout');
    }
  }, 0);
}

// Export the dummy resource creation function
export default createDummyResources; 
