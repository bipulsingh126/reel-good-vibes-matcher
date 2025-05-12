
import React, { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { suppressConsoleErrors } from './utils/errorSuppress'
import createDummyResources from './utils/blockHandler'

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

// Add global error handler for uncaught errors
window.addEventListener('error', (event) => {
  // Check if this is a vendor script z error we want to suppress
  if (event.message && (
    event.message.includes("Cannot access 'z' before initialization") ||
    (event.filename && event.filename.includes('vendor-'))
  )) {
    console.log('Prevented z error in main.tsx:', event.message);
    
    // Ensure z is defined after catching the error
    if (typeof window.z === 'undefined') {
      Object.defineProperty(window, 'z', {
        value: {},
        writable: true,
        configurable: true,
        enumerable: true
      });
      window.__zInitialized = true;
    }
    
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
  <StrictMode>
    <App />
  </StrictMode>
);
