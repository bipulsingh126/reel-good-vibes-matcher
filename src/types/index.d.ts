/**
 * Global TypeScript declarations
 */

// Social media and tracking pixels 
interface Window {
  // Facebook Pixel
  fbq: any;
  FB?: any;
  
  // Google Analytics
  ga?: any;
  gtag?: any;
  dataLayer?: any[];
  
  // HubSpot
  _hsq?: any[];
  
  // Internal utility flags
  __zInitialized?: boolean;
  __zFixed?: boolean;
  __VENDOR_FIX__?: boolean;
  __ERROR_REPORTER__?: any;
  __zSetupTime?: number;
  __debugZ?: () => any;
  __checkZ?: () => any;
  
  // Firebase
  firebase?: any;
  
  // Custom scripts
  f7c28dadFunctions?: any;
  setupWebSocket?: any;
  
  // z variable (for vendor scripts)
  z: any;
} 