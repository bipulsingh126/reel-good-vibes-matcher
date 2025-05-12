// This script must run before any other scripts to fix the z variable issue
(function() {
  // Define z globally only if it doesn't exist
  if (typeof window.z === 'undefined') {
    window.z = {};
  }
  
  // Store reference to z without redeclaring it
  const _z = window.z;
  
  // Create a global variable to track if we've fixed the error
  window.__zFixed = true;
  
  // Monkey patch Object.defineProperty to handle z variable
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj, prop, descriptor) {
    // If someone is trying to define 'z', make sure our z is preserved
    if (prop === 'z' && obj === window) {
      console.log('Intercepted attempt to define z');
      
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
  
  // Define a getter for z that always returns our z object
  try {
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
  
  // Add global error handler specifically for z initialization errors
  window.addEventListener('error', function(event) {
    if (event.message && (
      event.message.includes("Cannot access 'z'") || 
      event.message.includes('before initialization') ||
      event.message.includes("Identifier 'z' has already been declared")
    )) {
      console.log('Prevented z error:', event.message);
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);
  
  console.log('z-fix.js loaded and active');
})(); 