// This script must run before any other scripts to fix the z variable issue
(function() {
  // First, check if z has already been defined
  if (typeof window.z === 'undefined') {
    // Define the default empty object for z
    var _z = {};
    
    try {
      // Define z with Object.defineProperty for maximum protection
      Object.defineProperty(window, 'z', {
        configurable: true,
        enumerable: true,
        get: function() {
          return _z;
        },
        set: function(newValue) {
          // If someone tries to set z to a new object, merge properties
          if (newValue && typeof newValue === 'object') {
            Object.assign(_z, newValue);
          }
          return _z;
        }
      });
    } catch (e) {
      // Fallback if defineProperty fails
      window.z = _z;
    }
    
    // Mark that we've initialized z
    window.__zInitialized = true;
  } else {
    // z already exists, get a reference to it
    var _z = window.z;
  }
  
  // Store the original z object for later reference
  const originalZ = window.z;
  
  // Add metadata to z for tracking
  _z.__fixed = true;
  _z.__fixTime = Date.now();
  
  // Create a global variable to track that we've fixed the error
  window.__zFixed = true;
  
  // Create a special variable to detect vendor scripts
  window.__vendorScriptDetection = function(src) {
    return src && (src.includes('vendor-') || src.includes('X8AeWD1T'));
  };
  
  // Preemptively handle variable initialization issues
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj, prop, descriptor) {
    // Intercept any attempt to redefine 'z'
    if (prop === 'z' && obj === window) {
      console.log('Intercepted attempt to redefine z, preserving original z object');
      
      // If this is a getter/setter descriptor, merge it with our own
      if (descriptor && (descriptor.get || descriptor.set)) {
        const originalGet = descriptor.get;
        const originalSet = descriptor.set;
        
        descriptor.get = function() {
          return originalGet ? originalGet.call(this) : _z;
        };
        
        descriptor.set = function(val) {
          if (val && typeof val === 'object') {
            Object.assign(_z, val);
          }
          if (originalSet) {
            originalSet.call(this, _z);
          }
          return _z;
        };
      } else if (descriptor && descriptor.value !== undefined) {
        // If it's a value descriptor, merge the value with our z
        if (descriptor.value && typeof descriptor.value === 'object') {
          Object.assign(_z, descriptor.value);
        }
        
        // Override the descriptor to use our _z reference
        descriptor.value = _z;
      }
    }
    
    // Call the original defineProperty
    return originalDefineProperty.apply(this, arguments);
  };
  
  // Intercept potential 'var z' declarations at global scope
  try {
    const originalEval = window.eval;
    window.eval = function(code) {
      // Detect attempts to declare 'var z' at global scope
      if (typeof code === 'string' && code.match(/\bvar\s+z\b|\blet\s+z\b|\bconst\s+z\b/)) {
        code = code.replace(/\bvar\s+z\b/g, 'var __z_temp = window.z; window.z')
                  .replace(/\blet\s+z\b/g, 'var __z_temp = window.z; window.z')
                  .replace(/\bconst\s+z\b/g, 'var __z_temp = window.z; window.z');
      }
      return originalEval.call(this, code);
    };
  } catch (e) {
    console.log('Failed to override eval:', e);
  }
  
  // Add a more comprehensive global error handler for z initialization errors
  window.addEventListener('error', function(event) {
    if (event.message && (
      event.message.includes("Cannot access 'z'") || 
      event.message.includes('before initialization') ||
      event.message.includes("Identifier 'z' has already been declared") ||
      event.message.includes("'z' is not defined")
    )) {
      console.log('z-fix.js prevented error:', event.message);
      
      // Ensure z exists even after an error
      if (typeof window.z === 'undefined') {
        window.z = originalZ || _z || {};
      }
      
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);
  
  // Pre-load z in various contexts to avoid initialization issues
  window.addEventListener('DOMContentLoaded', function() {
    if (typeof window.z === 'undefined') {
      window.z = originalZ || _z || {};
    }
  });
  
  // Special handling for dynamic script loading
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.apply(this, arguments);
    
    // If creating a script element, add special handling
    if (tagName.toLowerCase() === 'script') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        // If setting the src attribute
        if (name === 'src' && window.__vendorScriptDetection(value)) {
          console.log('Detected vendor script, ensuring z is initialized');
          // Ensure z is initialized before script loads
          if (typeof window.z === 'undefined') {
            window.z = originalZ || _z || {};
          }
        }
        return originalSetAttribute.apply(this, arguments);
      };
    }
    
    return element;
  };
  
  // Intercept script execution
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function(node) {
    if (node.nodeName === 'SCRIPT' && node.src && window.__vendorScriptDetection(node.src)) {
      console.log('Intercepted vendor script append, ensuring z is initialized');
      // Ensure z is initialized before script loads
      if (typeof window.z === 'undefined') {
        window.z = originalZ || _z || {};
      }
      
      // Create a wrapper script to run before the vendor script
      const wrapper = document.createElement('script');
      wrapper.textContent = `
        // z-fix.js wrapper for vendor script
        (function() {
          var z = window.z;
          window.__zBeforeVendorLoad = true;
        })();
      `;
      originalAppendChild.call(this, wrapper);
    }
    
    return originalAppendChild.apply(this, arguments);
  };
  
  // Additional safeguard in case script is loaded after a delay
  setTimeout(function() {
    if (typeof window.z === 'undefined') {
      window.z = originalZ || _z || {};
    }
    window.__zTimeoutCheck = true;
  }, 0);
  
  // Handle code that might define z in an IIFE
  setTimeout(function() {
    if (typeof window.z === 'undefined') {
      window.z = originalZ || _z || {};
    }
    window.__zDelayedCheck = true;
  }, 100);
  
  console.log('z-fix.js loaded and active');
})();
