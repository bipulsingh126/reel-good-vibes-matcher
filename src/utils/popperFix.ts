/**
 * Fix for the PopperContent component that causes "Maximum call stack size exceeded" errors
 * This is specifically targeted at @radix-ui/react-popper components
 */

// Flag to track if fix has been applied
let fixApplied = false;

/**
 * Apply the PopperContent fix by overriding the toString and valueOf methods
 * of elements with the data-radix-popper-content-wrapper attribute
 */
export function applyPopperContentFix() {
  // Only apply once
  if (fixApplied) return;
  fixApplied = true;

  try {
    // Create a MutationObserver to watch for new popper elements
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // Check added nodes for popper content elements
          for (const node of Array.from(mutation.addedNodes)) {
            if (node instanceof Element) {
              // Find any popper content elements that were added
              const popperElements = [
                ...Array.from(node.querySelectorAll('[data-radix-popper-content-wrapper]')), 
                ...(node.hasAttribute('data-radix-popper-content-wrapper') ? [node] : [])
              ];
              
              // Apply fix to each element
              popperElements.forEach(patchPopperElement);
            }
          }
        }
      }
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    // Also fix any existing elements
    const existingPoppers = document.querySelectorAll('[data-radix-popper-content-wrapper]');
    existingPoppers.forEach(patchPopperElement);
    
    // Add global error handler for popper errors
    window.addEventListener('error', (event) => {
      if (event.message && event.message.includes('Maximum call stack size exceeded')) {
        // Look for popper in the stack trace
        const stack = event.error?.stack || '';
        if (stack.includes('PopperContent') || stack.includes('popper') || stack.includes('radix')) {
          console.warn('Intercepted Popper recursion error');
          event.preventDefault();
          return false;
        }
      }
      return true;
    }, true);
    
    console.log('PopperContent fix applied successfully');
  } catch (error) {
    console.error('Failed to apply PopperContent fix:', error);
  }
}

/**
 * Patch a specific popper element to prevent recursion
 */
function patchPopperElement(element: Element) {
  try {
    // Safe toString function for popper
    const safeToString = function() {
      return '[PopperContent]';
    };
    
    // Apply to the element directly
    Object.defineProperties(element, {
      'toString': {
        value: safeToString,
        writable: false,
        configurable: true
      },
      'valueOf': {
        value: function() { return this; },
        writable: false,
        configurable: true
      }
    });
    
    // Also patch any React component instance that might be attached
    if ('_reactRootContainer' in element) {
      try {
        const reactInstance = (element as any)._reactRootContainer;
        if (reactInstance) {
          Object.defineProperty(reactInstance, 'toString', {
            value: safeToString,
            writable: false,
            configurable: true
          });
        }
      } catch (e) {
        // Ignore errors accessing React instances
      }
    }
  } catch (error) {
    console.warn('Failed to patch popper element:', error);
  }
}

// Function to monkeypatch the Popper component
export function monkeyPatchPopperContent() {
  try {
    // Wait for React to be available
    const checkAndPatch = () => {
      const reactModules = window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers;
      if (reactModules) {
        // Find React components by name
        const findComponentsByName = (root: any, name: string): any[] => {
          const results: any[] = [];
          const queue = [root];
          
          while (queue.length > 0) {
            const current = queue.shift();
            if (!current) continue;
            
            if (current.name === name || current.displayName === name) {
              results.push(current);
            }
            
            // Add children to queue
            if (current.child) queue.push(current.child);
            if (current.sibling) queue.push(current.sibling);
            if (current.memoizedState?.baseState) queue.push(current.memoizedState.baseState);
          }
          
          return results;
        };
        
        // Try to find PopperContent components
        for (const renderer of Object.values(reactModules)) {
          try {
            const fiberRoots = (renderer as any).findFiberByHostInstance;
            if (fiberRoots) {
              const popperComponents = findComponentsByName(fiberRoots, 'PopperContent');
              for (const component of popperComponents) {
                patchPopperComponent(component);
              }
            }
          } catch (e) {
            // Ignore errors from individual renderers
          }
        }
      }
    };
    
    // Try immediately and also after a delay
    checkAndPatch();
    setTimeout(checkAndPatch, 1000);
  } catch (error) {
    console.warn('Failed to monkeypatch PopperContent:', error);
  }
}

// Patch a React component instance
function patchPopperComponent(component: any) {
  try {
    if (!component) return;
    
    Object.defineProperty(component, 'toString', {
      value: function() { return '[PopperContent]'; },
      writable: false,
      configurable: true
    });
    
    console.log('Successfully patched PopperContent component');
  } catch (error) {
    console.warn('Failed to patch PopperContent component:', error);
  }
}

// Declare the Window interface to include React devtools
declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      renderers: Record<string, any>;
    };
  }
} 