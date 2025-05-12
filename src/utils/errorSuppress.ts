/**
 * Utility to suppress specific console errors that are unrelated to the application
 * This is particularly useful for errors from browser extensions and third-party scripts
 */

export const suppressConsoleErrors = () => {
  // Store the original console functions
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;

  // Override console.error to filter out specific errors
  console.error = function(...args) {
    // Check if the error message matches the pattern we want to suppress
    const errorMessage = args.join(' ');
    
    const suppressPatterns = [
      'Could not establish connection. Receiving end does not exist',
      'The play() request was interrupted',
      'Failed to fetch',
      'Access to fetch',
      'has been blocked by CORS policy',
      'Refused to load the script',
      'because it violates the following Content Security Policy directive',
      'Cannot read properties of undefined',
      'net::ERR_BLOCKED_BY_CLIENT',
      'Uncaught (in promise)',
      'Cannot read properties of undefined (reading \'createContext\')',
      'static.cloudflareinsights.com',
      'AbortError: The play() request was interrupted',
      'sentry',
      'ingesteer',
      'recorder.js',
      'content-all.js',
      'facebook.net',
      'tiktok.com',
      'google',
      'analytics',
      'WebSocket connection to',
      'ReferenceError: Cannot access',
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
      'cloudflareinsights',
      'createContext',
      'Unknown message type',
      'WebSocket connection',
      'iframe-pos',
      'server connection lost',
      // Add more patterns as needed
    ];
    
    // If the warning matches any of our suppress patterns, don't log it
    if (suppressWarningPatterns.some(pattern => warningMessage.includes(pattern))) {
      return;
    }
    
    // Otherwise, pass through to the original console.warn
    originalConsoleWarn.apply(console, args);
  };

  // Override console.log for some specific patterns we want to suppress
  console.log = function(...args) {
    const logMessage = args.join(' ');
    
    const suppressLogPatterns = [
      'server connection lost',
      'Failed to load resource',
      'net::ERR_BLOCKED_BY_CLIENT',
      'Polling for restart',
      // Add more patterns as needed
    ];
    
    // If the log matches any of our suppress patterns, don't log it
    if (suppressLogPatterns.some(pattern => logMessage.includes(pattern))) {
      return;
    }
    
    // Otherwise, pass through to the original console.log
    originalConsoleLog.apply(console, args);
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

  if ((console as any)._originalLog) {
    console.log = (console as any)._originalLog;
  }
};
