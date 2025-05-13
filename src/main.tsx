import React, { StrictMode, useEffect } from 'react'
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

// Suppress specific console errors from browser extensions
suppressConsoleErrors();

// Create dummy resources to handle blocked resources
createDummyResources();

// Initialize script blocker
initScriptBlocker();

// Handle Permissions-Policy errors
const originalReload = window.location.reload;
window.location.reload = function(...args) {
  // Check the stack trace for Permissions-Policy related errors
  const stackTrace = new Error().stack || '';
  if (stackTrace.includes('Unrecognized feature') || 
      stackTrace.includes('Permissions-Policy') ||
      stackTrace.includes('fd9d1056-') ||
      stackTrace.includes('f7c28dad-') ||
      stackTrace.includes('6967-3be585539776f3cb.js')) {
    // Prevent the reload
    console.log('Prevented automatic reload from Permissions-Policy error');
    return undefined as any;
  }
  return originalReload.apply(this, args);
} as any;

// Add global error handler for uncaught errors
window.addEventListener('error', (event) => {
  // Check if this is a vendor script error we want to suppress
  if (
    event.filename && (
      event.filename.includes('vendor-') ||
      event.filename.includes('f7c28dad-') ||
      event.message.includes("Cannot access 'z' before initialization")
    ) ||
    event.message.includes('WebSocket connection to \'ws://localhost:8080/\'') ||
    event.message.includes('setupWebSocket @ client') ||
    event.message.includes('Unrecognized feature:') ||
    event.message.includes('preloaded using link preload')
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
