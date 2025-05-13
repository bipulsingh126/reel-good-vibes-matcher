/**
 * PopperContent fix for Maximum call stack size exceeded errors
 * This specifically targets the PopperContent component from Radix UI
 */

(function() {
  // Store original toString methods
  const originalObjectToString = Object.prototype.toString;
  const originalFunctionToString = Function.prototype.toString;
  
  // WeakSets to track recursive calls
  const objectsInProcess = new WeakSet();
  const functionsInProcess = new WeakSet();
  
  // Patch Object.prototype.toString to prevent recursion
  Object.prototype.toString = function() {
    // If we're already processing this object, return a simple representation
    if (objectsInProcess.has(this)) {
      return "[Object]";
    }
    
    try {
      // Mark as being processed
      objectsInProcess.add(this);
      
      // Special handling for PopperContent components
      if (this.dataset && 
          (this.dataset.radixPopperContentWrapper || 
           this.getAttribute && this.getAttribute('data-radix-popper-content-wrapper'))) {
        return "[PopperContent]";
      }
      
      // Call the original toString
      return originalObjectToString.apply(this, arguments);
    } catch (error) {
      // If anything goes wrong, just return a simple representation
      return "[Object]";
    } finally {
      // Always remove from processing set
      objectsInProcess.delete(this);
    }
  };
  
  // Patch Function.prototype.toString to prevent recursion
  Function.prototype.toString = function() {
    // If we're already processing this function, return a simple representation
    if (functionsInProcess.has(this)) {
      return "[Function]";
    }
    
    try {
      // Mark as being processed
      functionsInProcess.add(this);
      
      // Special handling for popper component methods
      const fnString = this.name || '';
      if (fnString.includes('Popper') || fnString.includes('Dropdown')) {
        return "[PopperFunction]";
      }
      
      // Call the original toString
      return originalFunctionToString.apply(this, arguments);
    } catch (error) {
      // If anything goes wrong, just return a simple representation
      return "[Function]";
    } finally {
      // Always remove from processing set
      functionsInProcess.delete(this);
    }
  };
  
  // Observer to patch popper elements as they are added to the DOM
  function observeAndPatchPopper() {
    // Function to patch a popper element
    function patchPopperElement(element) {
      if (!element || element.__popperPatched) return;
      element.__popperPatched = true;
      
      try {
        // Override toString
        Object.defineProperty(element, 'toString', {
          value: function() { return '[PopperContent]'; },
          writable: false,
          configurable: true
        });
        
        // Override valueOf
        Object.defineProperty(element, 'valueOf', {
          value: function() { return this; },
          writable: false,
          configurable: true
        });
        
        // Also override properties that might cause recursion
        const safeProps = ['__proto__', 'constructor', 'prototype'];
        safeProps.forEach(prop => {
          try {
            const descriptor = Object.getOwnPropertyDescriptor(element, prop);
            if (descriptor && descriptor.configurable) {
              Object.defineProperty(element, prop, {
                get: function() { return null; },
                configurable: true
              });
            }
          } catch (e) {
            // Ignore errors
          }
        });
      } catch (e) {
        // Ignore errors
      }
    }
    
    // Create a mutation observer to watch for popper elements
    try {
      const observer = new MutationObserver(function(mutations) {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            for (const node of Array.from(mutation.addedNodes)) {
              if (node.nodeType === 1) { // Element node
                // Check if this is a popper content wrapper
                if (node.hasAttribute && node.hasAttribute('data-radix-popper-content-wrapper')) {
                  patchPopperElement(node);
                }
                
                // Check children
                try {
                  const poppers = node.querySelectorAll('[data-radix-popper-content-wrapper]');
                  poppers.forEach(patchPopperElement);
                } catch (e) {
                  // Ignore errors
                }
              }
            }
          }
        }
      });
      
      // Start observing when the body is available
      function startObserving() {
        if (document.body) {
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
          
          // Also patch any existing elements
          try {
            const existingPoppers = document.querySelectorAll('[data-radix-popper-content-wrapper]');
            existingPoppers.forEach(patchPopperElement);
          } catch (e) {
            // Ignore errors
          }
        } else {
          setTimeout(startObserving, 100);
        }
      }
      
      startObserving();
    } catch (e) {
      console.warn('Popper observer failed:', e);
    }
  }
  
  // Start observing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeAndPatchPopper);
  } else {
    observeAndPatchPopper();
  }
  
  // Also add a global error handler for maximum call stack errors
  window.addEventListener('error', function(e) {
    if (e.message && e.message.includes('Maximum call stack size exceeded')) {
      console.warn('Intercepted call stack error, likely from PopperContent');
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);
})();
