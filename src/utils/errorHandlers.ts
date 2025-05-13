/**
 * Error handling utilities for React components
 */

// Flag to prevent recursive error reporting
let isHandlingError = false;

/**
 * Creates a safe toString function that prevents recursion
 */
export function createSafeToString(componentName: string) {
  return function() {
    return `[${componentName}]`;
  };
}

/**
 * Patches native functions on an object to prevent recursion
 * Especially useful for React components and DOM elements
 */
export function patchObjectFunctions(obj: any, name: string = 'ReactComponent') {
  if (!obj) return obj;
  
  try {
    // Safe toString to prevent call stack recursion
    Object.defineProperty(obj, 'toString', {
      value: createSafeToString(name),
      writable: false,
      configurable: true
    });
    
    // Safe valueOf to prevent recursion
    if (typeof obj.valueOf === 'function') {
      Object.defineProperty(obj, 'valueOf', {
        value: function() { return obj; },
        writable: false,
        configurable: true
      });
    }
    
    // For React components, also patch inspect and toJSON
    if (typeof obj.inspect === 'function') {
      Object.defineProperty(obj, 'inspect', {
        value: function() { return `<${name} />`; },
        writable: false,
        configurable: true
      });
    }
    
    if (typeof obj.toJSON === 'function') {
      Object.defineProperty(obj, 'toJSON', {
        value: function() { return { type: name }; },
        writable: false,
        configurable: true
      });
    }
  } catch (e) {
    // Silently fail to avoid breaking components
  }
  
  return obj;
}

/**
 * Safely handles errors without causing infinite recursion
 */
export function safeErrorHandler(error: Error, info?: React.ErrorInfo) {
  // Prevent recursive error handling
  if (isHandlingError) return;
  
  try {
    isHandlingError = true;
    
    // Check for stack overflow errors
    if (error.message && error.message.includes('Maximum call stack size exceeded')) {
      console.warn('Caught maximum call stack error:', error.message.substring(0, 100));
      return; // Suppress stack overflow errors
    }
    
    // Log the error without causing more issues
    console.error('React error handled:', {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
      componentStack: info?.componentStack?.split('\n').slice(0, 5).join('\n')
    });
  } catch (e) {
    // Last resort fallback
    console.error('Error in error handler');
  } finally {
    isHandlingError = false;
  }
}

/**
 * Installs global error handlers to prevent Maximum call stack size errors
 */
export function installGlobalErrorHandlers() {
  try {
    // Create protection for Function.prototype.toString
    const originalFunctionToString = Function.prototype.toString;
    
    Function.prototype.toString = function(...args: any[]) {
      try {
        // Return a safe string for any suspicious functions
        if (this === Function.prototype.toString || 
            this === Object.prototype.toString ||
            this === Object.prototype.valueOf) {
          return '[native code]';
        }
        
        // Otherwise use the original toString
        return originalFunctionToString.apply(this, args);
      } catch (e) {
        return '[function]';
      }
    };
    
    // Patch window.onerror to catch maximum call stack errors
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (message && message.toString().includes('Maximum call stack size exceeded')) {
        console.warn('Global handler caught stack overflow');
        return true; // Prevent default handling
      }
      
      // Otherwise use original handler if it exists
      if (typeof originalOnError === 'function') {
        return originalOnError.apply(window, [message, source, lineno, colno, error]);
      }
      return false;
    };
  } catch (e) {
    console.error('Failed to install global error handlers', e);
  }
}

// Install global handlers when this module is imported
installGlobalErrorHandlers(); 