/**
 * Utility to handle blocked resources and suppress related errors
 */

// Add TypeScript declarations
declare global {
  interface Window {
    fbq: any;
    firebase?: any;
    f7c28dadFunctions?: any;
    WebSocket: any;
  }
}

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
  
  // Handle Firebase BloomFilter errors
  setTimeout(() => {
    // Check if Firebase is loaded
    if (window.hasOwnProperty('firebase') || 
        document.querySelector('script[src*="firebase"]') || 
        document.querySelector('script[src*="firestore"]')) {
      // Create a patch for BloomFilter errors
      const patchScript = document.createElement('script');
      patchScript.textContent = `
        (function() {
          // Wait for Firebase to be fully loaded
          const checkInterval = setInterval(() => {
            try {
              // Check if firebase exists in the window
              if (window.firebase && window.firebase.firestore) {
                clearInterval(checkInterval);
                
                // Patch the BloomFilter functionality
                const originalFirestore = window.firebase.firestore;
                
                // Create a wrapper with error handling
                const wrappedFirestore = function() {
                  try {
                    return originalFirestore.apply(this, arguments);
                  } catch (e) {
                    if (e && e.name === 'BloomFilterError') {
                      console.log('Suppressed BloomFilter error');
                      return {
                        collection: () => ({
                          doc: () => ({
                            get: () => Promise.resolve({}),
                            set: () => Promise.resolve({}),
                            update: () => Promise.resolve({})
                          })
                        })
                      };
                    }
                    throw e;
                  }
                };
                
                // Copy all properties from the original
                for (const prop in originalFirestore) {
                  if (originalFirestore.hasOwnProperty(prop)) {
                    wrappedFirestore[prop] = originalFirestore[prop];
                  }
                }
                
                // Replace the original method
                window.firebase.firestore = wrappedFirestore;
                
                console.log('Firebase BloomFilter patches applied');
              }
            } catch (e) {
              console.warn('Error patching Firebase:', e);
            }
          }, 100);
          
          // Stop trying after 10 seconds
          setTimeout(() => clearInterval(checkInterval), 10000);
        })();
      `;
      
      document.head.appendChild(patchScript);
    }
  }, 1000);

  // Handle specific problem scripts
  setTimeout(() => {
    // Find all scripts on the page
    document.querySelectorAll('script').forEach(script => {
      const src = script.getAttribute('src') || '';
      
      // Handle specific problematic scripts by ID
      if (src.includes('f7c28dad-7381-4ae7-a718-86da73f3ba98')) {
        // Prevent the script from executing
        script.removeAttribute('src');
        
        // Create a dummy version with necessary functions
        const dummyScript = document.createElement('script');
        dummyScript.textContent = `
          // Dummy script to replace problematic f7c28dad script
          (function() {
            console.log('Applied dummy version of f7c28dad script');
            
            // Define any needed functions from the original script
            window.f7c28dadFunctions = {
              reload: function() { return true; },
              // Add other functions as needed
            };
          })();
        `;
        
        // Replace the original script
        if (script.parentNode) {
          script.parentNode.insertBefore(dummyScript, script);
          script.parentNode.removeChild(script);
        }
      }
    });
  }, 100);

  // Handle preloaded resources not being used
  setTimeout(() => {
    // Create a global error handler for specific resource-related errors
    window.addEventListener('error', (event) => {
      if (event.message && 
          (event.message.includes('preloaded using link preload') || 
           event.message.includes('facebook.com/tr') ||
           event.message.includes('ERR_BLOCKED_BY_CLIENT'))) {
        // Prevent the error
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }, true);
    
    // Handle Facebook Pixel
    const handleFacebookPixel = () => {
      try {
        // First make sure fbq is defined as a no-op function before doing anything else
        if (typeof window.fbq === 'undefined') {
          // Create a mock fbq function using simple approach to avoid Proxy issues
          window.fbq = function() { return window.fbq; } as any;
          
          // Add common methods to the mock fbq
          window.fbq.queue = [];
          window.fbq.push = function() { return window.fbq; };
          window.fbq.loaded = true;
          window.fbq.version = '2.0';
          window.fbq.agent = 'tmgr';
          window.fbq.disablePushState = true;
          window.fbq.track = function() { return window.fbq; };
          window.fbq.trackCustom = function() { return window.fbq; };
          window.fbq.trackSingle = function() { return window.fbq; };
          window.fbq.trackSingleCustom = function() { return window.fbq; };
          window.fbq.init = function() { return window.fbq; };
          window.fbq.event = function() { return window.fbq; };
          
          console.debug('Mock Facebook Pixel initialized');
        }
      } catch (error) {
        // Silent catch - don't log anything to avoid additional console errors
      }
    };
    
    // Run the Facebook Pixel handler
    handleFacebookPixel();
    
    // Find all preloaded resources and handle them
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    preloadLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      
      try {
        if (href.includes('facebook.com/tr')) {
          // Just call the handler, don't try to load anything
          handleFacebookPixel();
        } else if (!href.includes('cloudflare') && 
                  !href.includes('beacon') && 
                  !href.includes('facebook') &&
                  !href.includes('fbevents')) {
          // For other non-tracking preloaded resources, create an appropriate element
          const asType = link.getAttribute('as') || '';
          if (asType === 'script') {
            const script = document.createElement('script');
            script.src = href;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
          } else if (asType === 'style') {
            const style = document.createElement('link');
            style.rel = 'stylesheet';
            style.href = href;
            document.head.appendChild(style);
          }
          // Skip image loading as this might trigger network requests
        }
      } catch (e) {
        // Silently catch any errors to avoid console pollution
      }
    });
  }, 500);
}

// Export the dummy resource creation function
export default createDummyResources; 