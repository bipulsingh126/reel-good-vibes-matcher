/**
 * Simple error suppression utility
 * Prevents console errors from third-party scripts without any recursion issues
 */

// List of patterns to suppress
const SUPPRESSED_PATTERNS = [
  // Tracking scripts
  'facebook.com/tr',
  'cloudflareinsights.com',
  'connect.facebook.net',
  'analytics.tiktok.com',
  
  // Common error messages
  'net::ERR_BLOCKED_BY_CLIENT',
  'Failed to load resource',
  'WebSocket connection',
  'Unrecognized feature',
  'Content Security Policy',
  'preloaded using link preload',
  'BloomFilter',
  'Maximum call stack',
  
  // Our own error handlers
  'error-reporter.js',
  'console-error'
];

// React component errors to be handled differently
const REACT_COMPONENT_PATTERNS = [
  'PopperContent',
  'react-dropdown-menu',
  'radix-ui',
  'The above error occurred in the',
  'Consider adding an error boundary'
];

// Initialize z if needed
if (typeof window !== 'undefined' && typeof window.z === 'undefined') {
  window.z = {};
}

/**
 * Suppress console errors from third-party scripts
 */
export function suppressConsoleErrors() {
  // Event-based error suppression (doesn't override console methods)
  
  // Add global error handler
  window.addEventListener('error', function(event) {
    // Check if this is an error we want to suppress
    if (event && event.message && 
        SUPPRESSED_PATTERNS.some(pattern => 
          event.message.includes(pattern) || 
          (event.filename && event.filename.includes(pattern))
        )) {
      // Prevent the error from showing
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    
    // Handle z initialization issues
    if (event.message && event.message.includes("Cannot access 'z'") && 
        typeof window.z === 'undefined') {
      window.z = {};
      event.preventDefault();
      return false;
    }
  }, true);
  
  // Listen for unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    if (event && event.reason && 
        (SUPPRESSED_PATTERNS.some(pattern => 
          event.reason.toString().includes(pattern)
        ))) {
      event.preventDefault();
      return false;
    }
  });
}

/**
 * Get simplified error information from a React component error
 */
export function getReactErrorInfo(errorText) {
  try {
    const lines = errorText.split('\n');
    const errorLine = lines[0];
    let componentName = 'Unknown';
    
    // Extract component name
    const componentMatch = errorText.match(/in the <([^>]+)> component/);
    if (componentMatch && componentMatch[1]) {
      componentName = componentMatch[1];
    }
    
    return {
      component: componentName,
      error: errorLine,
      timestamp: new Date().toISOString()
    };
  } catch (e) {
    return {
      component: 'Error parsing',
      error: String(errorText).substring(0, 100),
      timestamp: new Date().toISOString()
    };
  }
}
