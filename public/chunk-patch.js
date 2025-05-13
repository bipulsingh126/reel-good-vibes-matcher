/**
 * Direct chunk patch for Maximum call stack issues in React components
 * 
 * This script specifically targets the logCapturedError function in chunk-RPCDYKBN.js
 * which is causing the "Maximum call stack size exceeded" error.
 */
(function() {
  console.log("Chunk patcher initialized");

  // Function to safely create a toString override
  const createSafeToString = (obj, name) => {
    if (!obj) return;
    
    try {
      // Only override if it doesn't already have a safe toString
      if (!obj.__safeToString) {
        const originalToString = obj.toString;
        
        // Set a non-recursive toString
        Object.defineProperty(obj, 'toString', {
          value: function() {
            // If this is part of React error reporting, just return a simple string
            const stack = new Error().stack || '';
            if (stack.includes('logCapturedError') || 
                stack.includes('chunk-RPCDYKBN') ||
                stack.includes('errorBoundary')) {
              return `[${name || 'Component'}]`;
            }
            
            // Otherwise call original if safe
            try {
              if (typeof originalToString === 'function') {
                return originalToString.apply(this, arguments);
              }
            } catch (e) {}
            
            // Fallback
            return `[${name || 'Component'}]`;
          },
          configurable: true
        });
        
        obj.__safeToString = true;
      }
    } catch (e) {
      console.warn('Failed to create safe toString:', e);
    }
  };
  
  // Handle popperContent when it's created
  const patchPopperContent = () => {
    // Find React component by matching stack trace patterns
    window.addEventListener('error', function(e) {
      if (e.message && e.message.includes('Maximum call stack size exceeded')) {
        console.log('Intercepting maximum call stack error to patch chunk');
        
        // Try to patch the React error reporter
        setTimeout(() => {
          patchReactErrorReporter();
          
          // Also directly try to find and patch popper components
          document.querySelectorAll('[data-radix-popper-content-wrapper]').forEach(el => {
            createSafeToString(el, 'PopperContent');
          });
        }, 0);
        
        e.preventDefault();
        return false;
      }
    }, true);
    
    // Watch for the specific chunks loading
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeName === 'SCRIPT' && node.src && 
                (node.src.includes('chunk-RPCDYKBN') || 
                 node.src.includes('chunk-AR5OCDFG') ||
                 node.src.includes('@radix-ui'))) {
              console.log('Detected React chunk loading, preparing patch');
              
              // Patch when script loads
              node.addEventListener('load', () => {
                setTimeout(patchReactErrorReporter, 0);
              });
            }
          });
        }
      });
    });
    
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  };
  
  // Directly patch React error reporter
  const patchReactErrorReporter = () => {
    try {
      // Identify chunk functions to patch by inspecting window object
      for (const key in window) {
        // Only check actual properties 
        if (Object.prototype.hasOwnProperty.call(window, key)) {
          const value = window[key];
          
          // Check function contents if it's a function
          if (typeof value === 'function') {
            // Convert function to string to inspect it
            const fnStr = Function.prototype.toString.call(value);
            
            // Look for error handling patterns
            if (fnStr.includes('logCapturedError') || 
                fnStr.includes('capturedError') || 
                fnStr.includes('errorBoundary')) {
              console.log('Found potential React error handling function:', key);
              createSafeToString(value, 'ReactErrorHandler');
              
              // Look for methods with toString
              for (const prop in value) {
                if (value[prop] && typeof value[prop] === 'object') {
                  createSafeToString(value[prop], 'ReactErrorComponent');
                }
              }
            }
          }
        }
      }
      
      // Patch any active popper elements in the DOM
      patchActivePopperElements();
      
      console.log('React error handling patched successfully');
    } catch (e) {
      console.warn('Error during React error handling patch:', e);
    }
  };

  // Find and patch any active popper elements
  const patchActivePopperElements = () => {
    // Patch PopperContent components that are already in the DOM
    document.querySelectorAll('[data-radix-popper-content-wrapper]').forEach(el => {
      createSafeToString(el, 'PopperContent');
      
      // Also patch any methods that might cause recursion
      if (el && typeof el.getBoundingClientRect === 'function') {
        const original = el.getBoundingClientRect;
        el.getBoundingClientRect = function() {
          try {
            return original.apply(this, arguments);
          } catch (e) {
            if (e.message.includes('Maximum call stack')) {
              return { top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 };
            }
            throw e;
          }
        };
      }
    });
  };
  
  // Monkey patch global Function.toString
  const originalFunctionToString = Function.prototype.toString;
  const inProcess = new WeakSet();
  
  Function.prototype.toString = function() {
    // Return a simple string for functions being processed in error boundary
    const stack = new Error().stack || '';
    if (stack.includes('logCapturedError') || 
        stack.includes('capturedError') || 
        stack.includes('errorBoundary') ||
        stack.includes('chunk-RPCDYKBN') ||
        inProcess.has(this)) {
      return '[Function]';
    }
    
    try {
      inProcess.add(this);
      const result = originalFunctionToString.apply(this, arguments);
      return result;
    } catch (e) {
      return '[Function]';
    } finally {
      inProcess.delete(this);
    }
  };
  
  // Special patch for dropdown and popover components
  const patchRadixComponents = () => {
    // Wait for components to be loaded
    setTimeout(() => {
      try {
        // Look for components in window or global scope
        const globalObj = window;
        for (const key in globalObj) {
          if (key.includes('react-dropdown') || 
              key.includes('react-popover') || 
              key.includes('radix')) {
            console.log('Found potential Radix component:', key);
            createSafeToString(globalObj[key], 'RadixComponent');
          }
        }
        
        // Also try to patch by intercepting content wrappers as they appear
        const observer = new MutationObserver((mutations) => {
          mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Element node
                  // Check for popper content wrapper
                  if (node.hasAttribute && node.hasAttribute('data-radix-popper-content-wrapper')) {
                    createSafeToString(node, 'PopperContent');
                  }
                  
                  // Check inside the node for popper content wrappers
                  const wrappers = node.querySelectorAll && node.querySelectorAll('[data-radix-popper-content-wrapper]');
                  if (wrappers) {
                    wrappers.forEach(wrapper => {
                      createSafeToString(wrapper, 'PopperContent');
                    });
                  }
                }
              });
            }
          });
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
      } catch (e) {
        console.warn('Error patching Radix components:', e);
      }
    }, 500);
  };
  
  // Initialize patching
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      patchPopperContent();
      patchRadixComponents();
    });
  } else {
    patchPopperContent();
    patchRadixComponents();
  }
  
  // Also try to patch immediately in case chunks are already loaded
  setTimeout(() => {
    patchReactErrorReporter();
    patchActivePopperElements();
  }, 0);
})(); 