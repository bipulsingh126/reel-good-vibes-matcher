/**
 * Utility to suppress specific console errors that are unrelated to the application
 * This is particularly useful for errors from browser extensions and third-party scripts
 */

export const suppressConsoleErrors = () => {
  // Store the original console.error function
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // Override console.error to filter out specific errors
  console.error = function(...args) {
    // Check if the error message matches the pattern we want to suppress
    const errorMessage = args.join(' ');
    
    const suppressPatterns = [
      'Could not establish connection. Receiving end does not exist',
      'The play() request was interrupted by a call to pause',
      'Failed to fetch',
      'Access to fetch',
      'has been blocked by CORS policy',
      'Refused to load the script',
      'because it violates the following Content Security Policy directive',
      'Cannot read properties of undefined',
      'net::ERR_BLOCKED_BY_CLIENT',
      'Uncaught (in promise)',
      // Add more patterns as needed
    ];
    
    // If the error matches any of our suppress patterns, don't log it
    if (suppressPatterns.some(pattern => errorMessage.includes(pattern))) {
      return;
    }
    
    // Otherwise, pass through to the original console.error
    originalConsoleError.apply(console, args);
  };

  // Override console.warn to filter out specific warnings
  console.warn = function(...args) {
    const warningMessage = args.join(' ');
    
    const suppressWarningPatterns = [
      'Content Security Policy',
      'CORS policy',
      'Access-Control-Allow-Origin',
      // Add more patterns as needed
    ];
    
    // If the warning matches any of our suppress patterns, don't log it
    if (suppressWarningPatterns.some(pattern => warningMessage.includes(pattern))) {
      return;
    }
    
    // Otherwise, pass through to the original console.warn
    originalConsoleWarn.apply(console, args);
  };
};

// Export a function to restore the original console behavior if needed
export const restoreConsole = () => {
  if ((console as any)._originalError) {
    console.error = (console as any)._originalError;
  }
  
  if ((console as any)._originalWarn) {
    console.warn = (console as any)._originalWarn;
  }
};
