// This script must run before any vendor scripts
(function() {
  // Define z variable to prevent initialization error
  window.z = {};
  
  // Create a proxy for console.error to filter out specific errors
  const originalConsoleError = console.error;
  console.error = function() {
    const errorMsg = Array.from(arguments).join(' ');
    if (
      errorMsg.includes('ERR_BLOCKED_BY_CLIENT') || 
      errorMsg.includes('Cannot access') || 
      errorMsg.includes('before initialization') ||
      errorMsg.includes('cloudflareinsights')
    ) {
      // Suppress these specific errors
      return;
    }
    return originalConsoleError.apply(console, arguments);
  };

  // Intercept script loading to prevent problematic scripts
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.apply(document, arguments);
    
    if (tagName.toLowerCase() === 'script') {
      // Watch for script src attribute changes
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name === 'src' && (
          value.includes('cloudflareinsights') || 
          value.includes('beacon.min.js')
        )) {
          // Don't actually set problematic script sources
          console.log('Blocked loading of:', value);
          return element;
        }
        return originalSetAttribute.apply(this, arguments);
      };
    }
    
    return element;
  };
})(); 