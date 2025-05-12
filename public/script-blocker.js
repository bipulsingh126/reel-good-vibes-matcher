/**
 * Script Blocker - Removes problematic scripts before they can cause errors
 * This should be loaded very early in the page lifecycle
 */
(function() {
  console.log("Script blocker initialized");
  
  // Get blocked scripts from sessionStorage if available
  let BLOCKED_SCRIPTS = [
    'f7c28dad-7381-4ae7-a718-86da73f3ba98',
    'facebook.com/tr'
  ];
  
  // Try to get blocked scripts from sessionStorage
  try {
    const storedBlockedScripts = sessionStorage.getItem('BLOCKED_SCRIPTS');
    if (storedBlockedScripts) {
      const parsedScripts = JSON.parse(storedBlockedScripts);
      if (Array.isArray(parsedScripts) && parsedScripts.length > 0) {
        BLOCKED_SCRIPTS = parsedScripts;
        console.log('Loaded blocked scripts from sessionStorage:', BLOCKED_SCRIPTS);
      }
    }
  } catch (error) {
    console.warn('Failed to load blocked scripts from sessionStorage:', error);
  }
  
  // Create a mutation observer to catch scripts as they're added
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeName === 'SCRIPT') {
            const script = node;
            const src = script.src || '';
            
            // Check if this script matches any blocked patterns
            if (BLOCKED_SCRIPTS.some(pattern => src.includes(pattern))) {
              console.log('Blocked script:', src);
              
              // Prevent script from loading
              script.src = '';
              
              // Remove script if possible
              if (script.parentNode) {
                script.parentNode.removeChild(script);
              }
            }
          } else if (node.nodeName === 'LINK') {
            const link = node;
            const href = link.href || '';
            const rel = link.rel || '';
            
            // Block preload links for Facebook tracking pixel
            if (rel === 'preload' && BLOCKED_SCRIPTS.some(pattern => href.includes(pattern))) {
              console.log('Blocked preload link:', href);
              
              // Remove the link
              if (link.parentNode) {
                link.parentNode.removeChild(link);
              }
            }
          }
        }
      }
    }
  });
  
  // Start observing document for script additions
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  
  // Define no-op functions for known error-causing features
  window.fbq = window.fbq || function() { 
    console.log('Intercepted fbq call:', arguments);
    return true; 
  };
  
  // Handle any existing problematic scripts
  document.addEventListener('DOMContentLoaded', () => {
    // Remove existing problematic scripts
    document.querySelectorAll('script').forEach(script => {
      const src = script.src || '';
      if (BLOCKED_SCRIPTS.some(pattern => src.includes(pattern))) {
        console.log('Removed existing script:', src);
        script.src = '';
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }
    });
    
    // Remove existing preload links
    document.querySelectorAll('link[rel="preload"]').forEach(link => {
      const href = link.href || '';
      if (BLOCKED_SCRIPTS.some(pattern => href.includes(pattern))) {
        console.log('Removed existing preload link:', href);
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      }
    });
    
    // Create a direct link to the diagnostic page
    const createDiagnosticLink = () => {
      // Add diagnostic button to the page
      const diagButton = document.createElement('button');
      diagButton.innerText = 'Error Diagnostic';
      diagButton.style.position = 'fixed';
      diagButton.style.bottom = '20px';
      diagButton.style.right = '20px';
      diagButton.style.zIndex = '9999';
      diagButton.style.background = '#4CAF50';
      diagButton.style.color = 'white';
      diagButton.style.border = 'none';
      diagButton.style.padding = '8px 16px';
      diagButton.style.borderRadius = '4px';
      diagButton.style.cursor = 'pointer';
      diagButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      
      diagButton.addEventListener('click', () => {
        // Open diagnostic page in a new window
        window.open('/diagnostic.html', '_blank');
      });
      
      document.body.appendChild(diagButton);
    };
    
    // Add diagnostic button in development mode
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
      createDiagnosticLink();
    }
  });
  
  // Global error handler for specific errors
  window.addEventListener('error', event => {
    // Check for specific error patterns
    if (event.message && (
      event.message.includes('Unrecognized feature') ||
      event.message.includes('preloaded using link preload')
    )) {
      console.log('Suppressed error:', event.message);
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);
  
  console.log("Script blocker fully initialized");
})(); 