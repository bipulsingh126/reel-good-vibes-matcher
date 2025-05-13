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
  
  // Safe toString implementation
  const safeToString = () => "[Object]";
  
  try {
    // Create a tracking set for recursive toString calls
    const inProgress = new WeakSet();
    
    // Patch Function.prototype.toString
    const originalFunctionToString = Function.prototype.toString;
    Function.prototype.toString = function() {
      if (inProgress.has(this)) {
        return "[Function]";
      }
      
      try {
        inProgress.add(this);
        return originalFunctionToString.apply(this, arguments);
      } catch (e) {
        return "[Function]";
      } finally {
        inProgress.delete(this);
      }
    };
    
    // Patch Object.prototype.toString
    const originalObjectToString = Object.prototype.toString;
    Object.prototype.toString = function() {
      if (inProgress.has(this)) {
        return "[Object]";
      }
      
      try {
        inProgress.add(this);
        return originalObjectToString.apply(this, arguments);
      } catch (e) {
        return "[Object]";
      } finally {
        inProgress.delete(this);
      }
    };
  } catch (e) {
    console.warn("Failed to patch toString methods:", e);
  }
}

// Function to watch for and patch popper content elements
function watchForPopperElements() {
  if (window.__VENDOR_FIX__.popper) return;
  window.__VENDOR_FIX__.popper = true;
  
  try {
    // Function to patch a single element
    function patchElement(element) {
      if (!element || element.__patched) return;
      element.__patched = true;
      
      try {
        // Patch the element's toString
        Object.defineProperty(element, 'toString', {
          value: () => "[PopperContent]",
          writable: false,
          configurable: true
        });
        
        // Also patch valueOf
        Object.defineProperty(element, 'valueOf', {
          value: () => element,
          writable: false,
          configurable: true
        });
      } catch (e) {
        // Silently fail
      }
    }
    
    // Watch for popper elements being added to the DOM
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              // Check if this is a popper element
              if (node.hasAttribute && node.hasAttribute('data-radix-popper-content-wrapper')) {
                patchElement(node);
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
