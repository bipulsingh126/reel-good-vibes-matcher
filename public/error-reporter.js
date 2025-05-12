/**
 * Error Reporter - Tracks console errors and logs them for analysis
 */
(function() {
  // Store the original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Set up an error log
  const errorLog = [];
  const MAX_ERRORS = 50; // Limit the number of errors logged
  
  // Track problematic scripts
  const problematicScripts = new Set();
  
  // Create a wrapper for console.error
  console.error = function() {
    // Get the error message
    const errorMessage = Array.from(arguments).join(' ');
    
    // Log the error and stack trace
    const errorInfo = {
      message: errorMessage,
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    };
    
    // Add to log
    if (errorLog.length >= MAX_ERRORS) {
      errorLog.shift(); // Remove oldest entry
    }
    errorLog.push(errorInfo);
    
    // Check for problematic script patterns
    if (errorMessage.includes('f7c28dad-7381-4ae7-a718-86da73f3ba98') ||
        errorMessage.includes('facebook.com/tr') ||
        errorMessage.includes('Unrecognized feature') ||
        errorMessage.includes('preloaded using link preload')) {
      
      // Extract the script URL if possible
      const urlMatch = errorMessage.match(/https?:\/\/[^\s'"]+/);
      if (urlMatch) {
        problematicScripts.add(urlMatch[0]);
      }
      
      // Don't pass this error to the original console
      return;
    }
    
    // Pass through to original console.error
    originalConsoleError.apply(console, arguments);
  };
  
  // Create a wrapper for console.warn
  console.warn = function() {
    // Get the warning message
    const warnMessage = Array.from(arguments).join(' ');
    
    // Check for problematic script patterns
    if (warnMessage.includes('f7c28dad-7381-4ae7-a718-86da73f3ba98') ||
        warnMessage.includes('facebook.com/tr') ||
        warnMessage.includes('Unrecognized feature') ||
        warnMessage.includes('preloaded using link preload')) {
      // Don't pass this warning to the original console
      return;
    }
    
    // Pass through to original console.warn
    originalConsoleWarn.apply(console, arguments);
  };
  
  // Add a global error handler
  window.addEventListener('error', function(event) {
    // Check for specific error patterns
    if (event.message &&
        (event.message.includes('Unrecognized feature') ||
         event.message.includes('preloaded using link preload'))) {
      
      // Prevent the error from propagating
      event.preventDefault();
      event.stopPropagation();
      
      // Extract the script URL if possible
      if (event.filename) {
        problematicScripts.add(event.filename);
      }
      
      return false;
    }
  }, true);
  
  // Expose API for retrieving the error log
  window.__ERROR_REPORTER__ = {
    getErrorLog: function() {
      return [...errorLog];
    },
    getProblematicScripts: function() {
      return [...problematicScripts];
    },
    clearErrorLog: function() {
      errorLog.length = 0;
      return true;
    }
  };
})(); 