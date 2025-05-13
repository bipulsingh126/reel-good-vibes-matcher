/**
 * Script blocker utility
 * Prevents loading of problematic scripts
 */

(function() {
  // List of script patterns to block
  const BLOCKED_SCRIPTS = [
    'error-reporter.js',
    'vendor-patch.js',
    'f7c28dad-',
    'facebook.com/tr',
    'analytics.tiktok.com',
    'sentry.io'
  ];
  
  // Create a MutationObserver to detect script additions
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeName === 'SCRIPT') {
            const script = node;
            // Check if this script should be blocked
            if (script.src && BLOCKED_SCRIPTS.some(pattern => script.src.includes(pattern))) {
              // Set script type to prevent execution
              script.type = 'text/plain';
              
              // Create a fake load event
              setTimeout(() => {
                script.dispatchEvent(new Event('load'));
              }, 10);
              
              console.log('Blocked script:', script.src);
            }
          }
        }
      }
    }
  });
  
  // Start observing
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  
  console.log('Script blocker initialized');
})(); 