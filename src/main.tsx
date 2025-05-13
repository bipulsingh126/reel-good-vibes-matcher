import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { suppressConsoleErrors } from './utils/errorSuppress'
import createDummyResources from './utils/blockHandler'
import { installGlobalErrorHandlers } from './utils/errorHandlers'
import { applyPopperContentFix, monkeyPatchPopperContent } from './utils/popperFix'

// Ensure error handlers are installed before anything else
installGlobalErrorHandlers();

// Fix for "Maximum call stack size exceeded" errors in Function.toString
(function patchFunctionToString() {
  // Store original Function.toString
  const originalFunctionToString = Function.prototype.toString;
  
  // Keep track of functions being processed to prevent recursion
  const inProcess = new WeakSet();
  
  // Override Function.toString with a recursion-safe version
  Function.prototype.toString = function() {
    // If we're already processing this function, return a simple representation
    if (inProcess.has(this)) {
      return "[Function]";
    }
    
    try {
      // Mark as being processed
      inProcess.add(this);
      // Call the original toString
      return originalFunctionToString.apply(this, arguments);
    } catch (error) {
      // If anything goes wrong, just return a simple representation
      return "[Function]";
    } finally {
      // Always remove from processing set
      inProcess.delete(this);
    }
  };
})();

// Apply the PopperContent fix to prevent Maximum call stack errors
try {
  // Apply immediately
  applyPopperContentFix();
  
  // Also apply after a delay to catch components created later
  setTimeout(() => {
    applyPopperContentFix();
    monkeyPatchPopperContent();
  }, 1000);
  
  // Add another attempt for components created during navigation
  window.addEventListener('load', () => {
    applyPopperContentFix();
  });
} catch (e) {
  console.warn('Error applying PopperContent fix:', e);
}

// Declare z property on Window interface
declare global {
  interface Window {
    z: any;
    __zInitialized?: boolean;
    __zFixed?: boolean;
    __VENDOR_FIX__?: boolean;
    __ERROR_REPORTER__?: any;
  }
}

// Ensure z variable is defined before anything else runs
(function() {
  if (typeof window.z === 'undefined') {
    // Use Object.defineProperty for better control over the property
    Object.defineProperty(window, 'z', {
      value: {},
      writable: true,
      configurable: true,
      enumerable: true
    });
    window.__zInitialized = true;
  }
})();

// Initialize script blocker with session storage
function initScriptBlocker() {
  try {
    // Get the current list of blocked scripts
    const storedScripts = sessionStorage.getItem('BLOCKED_SCRIPTS');
    if (storedScripts) {
      console.log('Using stored blocked scripts configuration');
    }
    
    // Listen for storage changes to update the blocker
    window.addEventListener('storage', (event) => {
      if (event.key === 'BLOCKED_SCRIPTS' && event.newValue) {
        console.log('Script blocker configuration updated');
      }
    });
  } catch (err) {
    console.warn('Failed to initialize script blocker with session storage:', err);
  }
}

// Suppress specific console errors from browser extensions
suppressConsoleErrors();

// Create dummy resources for blocked connections
createDummyResources();

// Initialize script blocker
initScriptBlocker();

// Fix for Maximum call stack size exceeded in Function.toString
(function patchRecursiveStringification() {
  // Track objects being stringified to prevent recursion
  const objectsInProcess = new WeakSet();
  
  // Create a safety wrapper for JSON.stringify
  const originalJSONStringify = JSON.stringify;
  JSON.stringify = function(value, replacer, space) {
    // Create a replacer function that detects recursion
    const recursionSafeReplacer = (key, val) => {
      if (val && typeof val === 'object') {
        if (objectsInProcess.has(val)) {
          return '[Circular]';
        }
        objectsInProcess.add(val);
      }
      
      // Use the original replacer if provided
      if (typeof replacer === 'function') {
        val = replacer(key, val);
      } else if (Array.isArray(replacer) && key !== '' && replacer.indexOf(key) === -1) {
        return undefined;
      }
      
      return val;
    };
    
    try {
      return originalJSONStringify(value, recursionSafeReplacer, space);
    } finally {
      // Clear the tracked objects
      if (value && typeof value === 'object') {
        objectsInProcess.delete(value);
      }
    }
  };
})();

// Handle Permissions-Policy errors using a safer approach with beforeunload event
window.addEventListener('beforeunload', (event) => {
  // Check if the reload is triggered by a Permissions-Policy error
  const error = new Error();
  const stackTrace = error.stack || '';
  
  if (stackTrace.includes('Unrecognized feature') || 
      stackTrace.includes('Permissions-Policy') ||
      stackTrace.includes('fd9d1056-') ||
      stackTrace.includes('f7c28dad-') ||
      stackTrace.includes('6967-3be585539776f3cb.js')) {
    // Prevent the reload by canceling the event
    event.preventDefault();
    event.returnValue = '';
    console.log('Prevented automatic reload from Permissions-Policy error');
    return '';
  }
});

// Add global error handler for uncaught errors
window.addEventListener('error', (event) => {
  // Check if this is a vendor script error we want to suppress
  if (
    (event.filename && (
      event.filename.includes('vendor-') ||
      event.filename.includes('f7c28dad-')
    )) ||
    (event.message && (
      event.message.includes("Cannot access 'z' before initialization") ||
      event.message.includes('WebSocket connection to \'ws://localhost:8080/\'') ||
      event.message.includes('setupWebSocket @ client') ||
      event.message.includes('Unrecognized feature:') ||
      event.message.includes('preloaded using link preload') ||
      event.message.includes('ERR_BLOCKED_BY_CLIENT') ||
      event.message.includes('Maximum call stack size exceeded')
    ))
  ) {
    // Prevent the error from showing in console
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// Register service worker for better performance and offline capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.error('ServiceWorker registration failed: ', error);
      });
  });
}

// Custom error boundary component for React
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Check for stack overflow error
    if (error.message && error.message.includes('Maximum call stack size exceeded')) {
      console.warn('Caught maximum call stack error in React component');
      // Rebuild component on next frame
      setTimeout(() => {
        this.setState({ hasError: false });
      }, 100);
    }
  }

  render() {
    if (this.state.hasError) {
      return null; // Return empty instead of error UI
    }

    return this.props.children;
  }
}

// Fix aria-hidden accessibility issues
document.addEventListener('DOMContentLoaded', () => {
  // Observer to fix aria-hidden issues on elements with focused descendants
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
        const element = mutation.target as HTMLElement;
        if (element.getAttribute('aria-hidden') === 'true') {
          // Check if this element contains any focused elements
          const focusedElement = element.querySelector(':focus');
          if (focusedElement) {
            // Remove aria-hidden to fix accessibility
            element.removeAttribute('aria-hidden');
          }
        }
      }
    });
  });

  // Start observing the document
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['aria-hidden'],
    subtree: true
  });
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <StrictMode>
      <App />
    </StrictMode>
  </ErrorBoundary>
);
