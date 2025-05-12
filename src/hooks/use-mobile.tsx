
import React, { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize with undefined to prevent hydration mismatch
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    // Function to determine if the screen is mobile-sized
    const checkIsMobile = () => {
      return window.innerWidth < MOBILE_BREAKPOINT;
    };

    // Set the initial value
    setIsMobile(checkIsMobile());

    // Create and use media query for changes
    try {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      
      // Modern event listener approach
      const handleChange = () => setIsMobile(checkIsMobile());
      
      mql.addEventListener("change", handleChange);
      
      // Clean up
      return () => {
        mql.removeEventListener("change", handleChange);
      };
    } catch (err) {
      // Fallback for browsers that don't support matchMedia or addEventListener
      const handleResize = () => setIsMobile(checkIsMobile());
      
      window.addEventListener('resize', handleResize);
      
      // Clean up
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [])

  // Return false as default when undefined (e.g., during SSR)
  return isMobile ?? false;
}
