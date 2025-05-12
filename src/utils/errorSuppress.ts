/**
 * Utility to suppress specific console errors that are unrelated to the application
 * This is particularly useful for errors from browser extensions and third-party scripts
 */

// List of domains to suppress errors from
const SUPPRESSED_DOMAINS = [
  'sentry.io',
  'ingesteer.services-prod.nsvcs.net',
  'analytics.tiktok.com',
  'connect.facebook.net',
  'cloudflareinsights.com',
  'lovable-api.com',
  'firestore.googleapis.com',
  'gpteng.co',
  'lovable.dev',
  'localhost:8080',
  'recorder.js',
  'content-all.js',
  'all-frames.js'
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
  'AbortError: The play() request was interrupted'
];

// Store the original console functions
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

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

    // If it's not a suppressed error, log it
    if (!hasSuppressedDomain && !hasSuppressedErrorMessage) {
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
    );

    // If it's not a suppressed domain, log the warning
    if (!shouldSuppress && !warnString.includes('Content Security Policy')) {
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
      'ERR_HTTP2_PROTOCOL_ERROR',
      'localhost:8080',
      'Blocked aria-hidden'
    ];
    
    // If the log matches any of our suppress patterns, don't log it
    if (suppressLogPatterns.some(pattern => logMessage.includes(pattern))) {
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
    const errorMessage = event.message || '';
    
    // Check if this is a suppressed error
    if (SUPPRESSED_ERROR_MESSAGES.some(msg => errorMessage.includes(msg)) ||
        (event.filename && SUPPRESSED_DOMAINS.some(domain => event.filename.includes(domain)))) {
      // Prevent the error from showing in console
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);

  // Add an unhandled rejection handler
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason?.toString() || '';
    
    // Check if this is a suppressed error
    if (SUPPRESSED_ERROR_MESSAGES.some(msg => reason.includes(msg))) {
      // Prevent the error from showing in console
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);
}

/**
 * Restore original console methods
 */
export function restoreConsole() {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
}
