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
  'gpteng.co'
];

// List of error messages to suppress
const SUPPRESSED_ERROR_MESSAGES = [
  'Failed to load resource: net::ERR_BLOCKED_BY_CLIENT',
  'BloomFilter error',
  'The resource was preloaded using link preload but not used'
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
  console.error = function(...args: any[]) {
    // Check if error message contains any of the suppressed domains
    const errorString = args.join(' ');
    
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
      originalConsoleError.apply(console, args);
    }
  };

  // Override console.warn
  console.warn = function(...args: any[]) {
    // Check if warning message contains any of the suppressed domains
    const warnString = args.join(' ');
    const shouldSuppress = SUPPRESSED_DOMAINS.some(domain => 
      warnString.includes(domain)
    );

    // If it's not a suppressed domain, log the warning
    if (!shouldSuppress && !warnString.includes('Content Security Policy')) {
      originalConsoleWarn.apply(console, args);
    }
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
}

/**
 * Restore original console methods
 */
export function restoreConsole() {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;

  if ((console as any)._originalLog) {
    console.log = (console as any)._originalLog;
  }
}
