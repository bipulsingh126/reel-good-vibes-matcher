/**
 * Global type declarations for the application
 */

interface Window {
  /**
   * Safe error reporting function that won't cause recursion
   */
  __safeErrorReport?: (type: string, message: string, details?: any) => any;
  
  /**
   * Error logs array
   */
  __errorLogs?: Array<{
    time: string;
    type: string;
    message: string;
    [key: string]: any;
  }>;
  
  /**
   * Global z variable used in various components
   */
  z?: any;
} 