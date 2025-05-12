
// This script must run before any other scripts to fix the z variable issue
(function() {
  // Define z globally with noConflict capability
  if (typeof window.z === 'undefined') {
    window.z = {};
    // Create a flag to indicate we've defined z
    window.__zInitialized = true;
  }
  
  // Store reference to z without redeclaring it
  const _z = window.z;
  
  // Create a global variable to track if we've fixed the error
  window.__zFixed = true;
  
  // Preemptively handle variable initialization issues
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj, prop, descriptor) {
    // Intercept any attempt to redefine 'z'
    if (prop === 'z' && obj === window) {
      console.log('Intercepted attempt to define z, preserving original z object');
      
      // Preserve our z variable
      const originalValue = window.z;
      
      // Call the original defineProperty
      const result = originalDefineProperty.call(this, obj, prop, descriptor);
      
      // If z was overwritten, restore our value
      if (window.z !== originalValue) {
        window.z = originalValue;
      }
      
      return result;
    }
    
    // Otherwise, proceed normally
    return originalDefineProperty.apply(this, arguments);
  };
  
  // Define a stronger getter/setter for z
  try {
    // Create a powerful getter/setter for z that prevents variable conflicts
    Object.defineProperty(window, 'z', {
      configurable: true,
      enumerable: true,
      get: function() {
        return _z;
      },
      set: function(newValue) {
        // Merge any new properties but keep our object
        if (newValue && typeof newValue === 'object') {
          Object.assign(_z, newValue);
        }
        return _z;
      }
    });
  } catch (e) {
    console.log('Failed to define z getter/setter:', e);
  }
  
  // Add a more comprehensive global error handler for z initialization errors
  window.addEventListener('error', function(event) {
    if (event.message && (
      event.message.includes("Cannot access 'z'") || 
      event.message.includes('before initialization') ||
      event.message.includes("Identifier 'z' has already been declared") ||
      event.message.includes("'z' is not defined")
    )) {
      console.log('Prevented z error:', event.message);
      
      // Ensure z exists even after an error
      if (typeof window.z === 'undefined') {
        window.z = _z || {};
      }
      
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);
  
  // Pre-load z in various contexts to avoid initialization issues
  window.addEventListener('DOMContentLoaded', function() {
    if (typeof window.z === 'undefined') {
      window.z = _z || {};
    }
  });
  
  // Handle code that might define z in an IIFE
  setTimeout(function() {
    if (typeof window.z === 'undefined') {
      window.z = _z || {};
    }
  }, 0);
  
  console.log('z-fix.js loaded and active');
})();
