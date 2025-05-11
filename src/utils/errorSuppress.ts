/**
 * Utility to suppress specific console errors that are unrelated to the application
 * This is particularly useful for errors from browser extensions
 */

export const suppressConsoleErrors = () => {
  // Store the original console.error function
  const originalConsoleError = console.error;

  // Override console.error to filter out specific errors
  console.error = function(...args) {
    // Check if the error message matches the pattern we want to suppress
    const errorMessage = args.join(' ');
    
    const suppressPatterns = [
      'Could not establish connection. Receiving end does not exist',
      'The play() request was interrupted by a call to pause'
    ];
    
    // If the error matches any of our suppress patterns, don't log it
    if (suppressPatterns.some(pattern => errorMessage.includes(pattern))) {
      return;
    }
    
    // Otherwise, pass through to the original console.error
    originalConsoleError.apply(console, args);
  };
};

// Export a function to restore the original console behavior if needed
export const restoreConsole = () => {
  if ((console as any)._originalError) {
    console.error = (console as any)._originalError;
  }
}; 