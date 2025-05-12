// This script must be the first script to run
window.z = {};

// Monkey patch the vendor script that has the issue
(function() {
  // Define z immediately
  window.z = window.z || {};

  // Create a proxy for the z variable to handle any access
  window.z = new Proxy(window.z, {
    get: function(target, prop) {
      return target[prop];
    },
    set: function(target, prop, value) {
      target[prop] = value;
      return true;
    }
  });

  // Monkey patch any scripts that might access z
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.apply(document, arguments);
    
    if (tagName.toLowerCase() === 'script') {
      // For script elements, add our z variable at the beginning
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name === 'src' && value && (value.includes('vendor-') || value.includes('.js'))) {
          // Make sure this script runs after z is defined
          element.addEventListener('beforeload', function() {
            if (typeof window.z === 'undefined') {
              window.z = {};
            }
          });
        }
        return originalSetAttribute.apply(this, arguments);
      };
    }
    
    return element;
  };
  
  // Add z definition to document head as inline script
  const ensureZScript = document.createElement('script');
  ensureZScript.textContent = "window.z = window.z || {};";
  
  // Insert at the very beginning of head
  if (document.head.firstChild) {
    document.head.insertBefore(ensureZScript, document.head.firstChild);
  } else {
    document.head.appendChild(ensureZScript);
  }
  
  // Observer to detect when vendor scripts are added
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.tagName === 'SCRIPT' && node.src && node.src.includes('vendor-')) {
            // Add z definition before vendor script
            const zScript = document.createElement('script');
            zScript.textContent = "window.z = window.z || {};";
            node.parentNode.insertBefore(zScript, node);
          }
        }
      }
    }
  });
  
  // Start observing the document
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
