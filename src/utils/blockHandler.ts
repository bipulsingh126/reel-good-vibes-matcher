
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
           event.message.includes('facebook.com/tr'))) {
        // Prevent the error
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }, true);
    
    // Handle Facebook Pixel
    const handleFacebookPixel = () => {
      // Create a dummy image to satisfy the preload requirement
      const img = new Image();
      img.src = 'https://www.facebook.com/tr?id=9151671744940732&ev=PageView&noscript=1';
      img.style.display = 'none';
      document.body.appendChild(img);
      
      // Create a dummy function for fbq
      if (!window.hasOwnProperty('fbq')) {
        Object.defineProperty(window, 'fbq', {
          value: function() {
            // Do nothing, just a stub
            return true;
          },
          writable: true,
          configurable: true
        });
      }
    };
    
    // Run the Facebook Pixel handler
    handleFacebookPixel();
    
    // Find all preloaded resources and handle them
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    preloadLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      if (href.includes('facebook.com/tr')) {
        handleFacebookPixel();
      } else {
        // For other preloaded resources, create an appropriate element
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
        } else if (asType === 'image') {
          const img = new Image();
          img.src = href;
          img.style.display = 'none';
          document.body.appendChild(img);
        }
      }
    });
  }, 500);
}

// Export the dummy resource creation function
export default createDummyResources; 
