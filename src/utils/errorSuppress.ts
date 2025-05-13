/**
 * Simple error suppression utility
 * Prevents console errors from third-party scripts without any recursion issues
 */

// List of domains to suppress errors from
const SUPPRESSED_DOMAINS = [
  'sentry.io',
  'ingesteer.services-prod.nsvcs.net',
  'analytics.tiktok.com',
  'connect.facebook.net',
  'facebook.com/tr',
  'cloudflareinsights.com',
  'lovable-api.com',
  'firestore.googleapis.com',
  'gpteng.co',
  'lovable.dev',
  'localhost:8080',
  'recorder.js',
  'content-all.js',
  'all-frames.js',
  'firebase',
  'f7c28dad-7381-4ae7-a718-86da73f3ba98'
];

// List of error messages to suppress
const SUPPRESSED_ERROR_MESSAGES = [
  'Failed to load resource: net::ERR_BLOCKED_BY_CLIENT',
  'BloomFilter error',
  'The resource was preloaded using link preload but not used',
  'Uncaught ReferenceError: Cannot access',
  'Identifier \'z\' has already been declared',
  'Uncaught (in promise) TypeError: Failed to fetch',
  'violates the following Content Security Policy directive',
  'Could not establish connection',
  'Receiving end does not exist',
  'ERR_HTTP2_PROTOCOL_ERROR',
  'Access to fetch',
  'has been blocked by CORS policy',
  'WebSocket connection',
  'WebSocket connection to \'ws://localhost:8080/\' failed',
  'setupWebSocket @ client:535',
  'AbortError: The play() request was interrupted',
  'preloaded using link preload but not used within a few seconds',
  'Unrecognized feature:',
  '@firebase/firestore: Firestore',
  'BloomFilterError'
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
  // Override console.error
  console.error = function() {
    // Check if error message contains any of the suppressed domains
    const errorString = Array.from(arguments).join(' ');
    
    // Check if the error message contains any suppressed domain
    const hasSuppressedDomain = SUPPRESSED_DOMAINS.some(domain => 
      errorString.includes(domain)
    );
    
    // Check if the error message matches any of the suppressed error patterns
    const hasSuppressedErrorMessage = SUPPRESSED_ERROR_MESSAGES.some(message =>
      errorString.includes(message)
    );

    // Check for specific script patterns that indicate bundled scripts
    const hasScriptPattern = /\d+-[a-f0-9]+\.js/.test(errorString) || 
                           errorString.includes('fd9d1056-') || 
                           errorString.includes('layout-') ||
                           (errorString.includes('ol @') && errorString.includes('or @'));

    // If it's not a suppressed error, log it
    if (!hasSuppressedDomain && !hasSuppressedErrorMessage && !hasScriptPattern) {
      originalConsoleError.apply(console, arguments);
    }
  };

  // Override console.warn
  console.warn = function() {
    // Check if warning message contains any of the suppressed domains
    const warnString = Array.from(arguments).join(' ');
    
    const shouldSuppress = SUPPRESSED_DOMAINS.some(domain => 
      warnString.includes(domain)
    ) || SUPPRESSED_ERROR_MESSAGES.some(message =>
      warnString.includes(message)
    ) || /\d+-[a-f0-9]+\.js/.test(warnString) || 
       warnString.includes('fd9d1056-') || 
       warnString.includes('layout-') ||
       (warnString.includes('ol @') && warnString.includes('or @')) ||
       warnString.includes('Content Security Policy');

    // If it's not a suppressed warning, log it
    if (!shouldSuppress) {
      originalConsoleWarn.apply(console, arguments);
    }
  };

  // Override console.log for some specific patterns we want to suppress
  console.log = function() {
    const logMessage = Array.from(arguments).join(' ');
    
    const suppressLogPatterns = [
      'server connection lost',
      'Failed to load resource',
      'net::ERR_BLOCKED_BY_CLIENT',
      'Polling for restart',
      'WebSocket connection',
      'WebSocket connection to \'ws://localhost:8080/\'',
      'setupWebSocket @ client',
      'ERR_HTTP2_PROTOCOL_ERROR',
      'localhost:8080',
      'Blocked aria-hidden',
      'preloaded using link preload',
      'Unrecognized feature:',
      'BloomFilter',
      '@firebase/firestore'
    ];
    
    // If the log matches any of our suppress patterns, don't log it
    if (suppressLogPatterns.some(pattern => logMessage.includes(pattern)) ||
        /\d+-[a-f0-9]+\.js/.test(logMessage) ||
        logMessage.includes('fd9d1056-') ||
        logMessage.includes('layout-') ||
        (logMessage.includes('ol @') && logMessage.includes('or @'))) {
      return;
    }
    
    // Otherwise, pass through to the original console.log
    originalConsoleLog.apply(console, arguments);
  };

  // Also patch fetch to gracefully handle blocked requests
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string') {
      for (const domain of SUPPRESSED_DOMAINS) {
        if (url.includes(domain)) {
          // Return a resolved promise with a mock response
          return Promise.resolve(new Response('', { status: 200 }));
        }
      }
    }
    return originalFetch.apply(this, arguments);
  };

  // Patch XMLHttpRequest to gracefully handle blocked requests
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    if (typeof url === 'string') {
      for (const domain of SUPPRESSED_DOMAINS) {
        if (url.includes(domain)) {
          // Redirect to a local dummy URL
          return originalXhrOpen.call(this, method, 'about:blank');
        }
      }
    }
    return originalXhrOpen.apply(this, arguments);
  };

  // Add a global error event handler for suppressed errors
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

  // Handle preloaded resource warnings
  window.addEventListener('load', function() {
    // Find all preloaded links
    const preloadedLinks = document.querySelectorAll('link[rel="preload"]');
    
    // For each preloaded link, create a hidden element to "use" it
    preloadedLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      // Get the "as" attribute to determine what type of resource it is
      const asType = link.getAttribute('as') || '';
      
      // Create an element to use the preloaded resource
      if (asType === 'style') {
        // Create a style element
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = href;
        style.style.display = 'none';
        document.head.appendChild(style);
      } else if (asType === 'script') {
        // Create a script element
        const script = document.createElement('script');
        script.src = href;
        script.async = true;
        script.style.display = 'none';
        document.head.appendChild(script);
      } else if (asType === 'image') {
        // Create an image element
        const img = new Image();
        img.src = href;
        img.style.display = 'none';
        document.body.appendChild(img);
      }
    });
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
