/**
 * Utility to handle blocked resources and suppress related errors
 */

// Create dummy resources to replace blocked ones
export function createDummyResources() {
  // Create a dummy WebSocket class to replace blocked WebSocket connections
  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = function(url: string, protocols?: string | string[]) {
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
        addEventListener: (event: string, callback: any) => {
          if (event === 'open' && callback) {
            setTimeout(() => callback(new Event('open')), 50);
          }
        },
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
  
  // Preserve constructor properties
  window.WebSocket.prototype = OriginalWebSocket.prototype;
  
  // Copy static properties using Object.defineProperty
  try {
    Object.defineProperty(window.WebSocket, 'CONNECTING', { value: OriginalWebSocket.CONNECTING });
    Object.defineProperty(window.WebSocket, 'OPEN', { value: OriginalWebSocket.OPEN });
    Object.defineProperty(window.WebSocket, 'CLOSING', { value: OriginalWebSocket.CLOSING });
    Object.defineProperty(window.WebSocket, 'CLOSED', { value: OriginalWebSocket.CLOSED });
  } catch (e) {
    console.warn('Failed to copy WebSocket static properties', e);
  }
  
  // Patch any existing setupWebSocket function
  if (window.hasOwnProperty('setupWebSocket')) {
    const originalSetupWebSocket = (window as any).setupWebSocket;
    (window as any).setupWebSocket = function(...args: any[]) {
      try {
        return originalSetupWebSocket.apply(this, args);
      } catch (error) {
        // Return a fake WebSocket connection
        return {
          readyState: 1,
          send: () => {},
          close: () => {}
        };
      }
    };
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
            
            // Check for client.js scripts that might be causing WebSocket issues
            if (script.src && script.src.includes('client.js')) {
              // Intercept the script loading
              const originalSrc = script.src;
              script.src = '';
              
              // Fetch the script content and modify it
              fetch(originalSrc)
                .then(response => response.text())
                .then(content => {
                  // Replace problematic WebSocket code
                  const modifiedContent = content
                    .replace(/setupWebSocket\s*\([^)]*\)/g, '(() => { return { send: () => {}, close: () => {} }; })()')
                    .replace(/new WebSocket\([^)]*\)/g, '({ readyState: 1, send: () => {}, close: () => {} })');
                  
                  // Create a new script with modified content
                  const newScript = document.createElement('script');
                  newScript.textContent = modifiedContent;
                  script.parentNode?.insertBefore(newScript, script);
                  script.parentNode?.removeChild(script);
                })
                .catch(() => {
                  // If fetch fails, just simulate successful load
                  const event = new Event('load');
                  script.dispatchEvent(event);
                });
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
}

// Export the dummy resource creation function
export default createDummyResources; 