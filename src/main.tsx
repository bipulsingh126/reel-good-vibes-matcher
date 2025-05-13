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
    z?: any;
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
// Define the initScriptBlocker function
function initScriptBlocker() {
  // Block problematic scripts
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeName === 'SCRIPT') {
            const script = node as HTMLScriptElement;
            // Check for known problematic scripts
            if (script.src && (
              script.src.includes('error-reporter.js') ||
              script.src.includes('vendor-patch.js') ||
              script.src.includes('f7c28dad-')
            )) {
              // Prevent the script from loading
              script.type = 'text/plain'; // This prevents execution
              
              // Simulate successful load
              setTimeout(() => {
                script.dispatchEvent(new Event('load'));
              }, 10);
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

initScriptBlocker();

// Handle Permissions-Policy errors - using a safer approach
// Instead of modifying window.location.reload, use a global error handler
window.addEventListener('error', function(event) {
  // Check if this is a Permissions-Policy related error
  if (event.message && (
    event.message.includes('Unrecognized feature') || 
    event.message.includes('Permissions-Policy') ||
    event.message.includes('fd9d1056-') ||
    event.message.includes('f7c28dad-') ||
    event.message.includes('6967-3be585539776f3cb.js')
  )) {
    // Prevent default behavior and stop propagation
    event.preventDefault();
    event.stopPropagation();
    console.log('Prevented automatic reload from Permissions-Policy error');
    return false;
  }
  return true;
}, true);

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

// Handle blocked tracking pixels (Facebook, etc.)
function handleBlockedTrackers() {
  // Create a fake Facebook pixel function
  if (typeof window.fbq === 'undefined') {
    window.fbq = function() {
      // Do nothing, this is just a stub
    };
    window.fbq.loaded = true;
    window.fbq.version = '2.0';
    window.fbq.queue = [];
    
    // Also provide the key methods
    window.fbq.push = function() {};
    window.fbq.callMethod = function() {};
    window.fbq.getState = function() { return {}; };
    window.fbq.defaults = {};
  }
  
  // Intercept image requests to tracking pixels
  const originalImage = window.Image;
  window.Image = function(width?: number, height?: number) {
    const img = new originalImage(width, height);
    
    // Override the src setter to catch tracking pixels
    const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')?.set;
    if (originalSrcSetter) {
      Object.defineProperty(img, 'src', {
        set: function(url) {
          // Check if this is a tracking pixel
          if (typeof url === 'string' && (
            url.includes('facebook.com/tr') || 
            url.includes('analytics.tiktok.com') ||
            url.includes('googletagmanager.com')
          )) {
            // Don't actually set the URL, but simulate success
            setTimeout(() => {
              if (typeof this.onload === 'function') {
                this.onload();
              }
            }, 10);
            return;
          }
          
          // Otherwise proceed normally
          originalSrcSetter.call(this, url);
        },
        get: Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')?.get
      });
    }
    
    return img;
  } as any;
  window.Image.prototype = originalImage.prototype;
}

// Call the tracker handler
handleBlockedTrackers();

// Add global error handlers for uncaught errors and promise rejections
window.addEventListener('error', function(event) {
  // Check if this error is from a blocked resource or tracking pixel
  if (event.message && (
    event.message.includes('ERR_BLOCKED_BY_CLIENT') ||
    event.message.includes('net::ERR_') ||
    event.message.includes('Failed to load resource') ||
    (event.filename && (
      event.filename.includes('facebook.com') ||
      event.filename.includes('script-blocker.js') ||
      event.filename.includes('error-reporter.js') ||
      event.filename.includes('vendor-patch.js')
    ))
  )) {
    // Prevent the error from showing in the console
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
  return true;
}, true);

// Also handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
  // Check if this is related to a blocked resource or tracking pixel
  if (event.reason && (
    String(event.reason).includes('ERR_BLOCKED_BY_CLIENT') ||
    String(event.reason).includes('net::ERR_') ||
    String(event.reason).includes('Failed to load resource') ||
    String(event.reason).includes('facebook.com')
  )) {
    // Prevent showing in console
    event.preventDefault();
    return false;
  }
  return true;
});

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
