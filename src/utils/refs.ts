import * as React from "react";

/**
 * Utility to safely combine refs
 * This helps prevent "getComputedStyle" errors by ensuring the refs are handled correctly
 */
export function useCombinedRefs<T>(...refs: React.Ref<T>[]) {
  const targetRef = React.useRef<T>(null);

  React.useEffect(() => {
    refs.forEach(ref => {
      if (!ref) return;
      
      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        try {
          // Only set if ref is an object with current property
          if (ref && typeof ref === 'object' && 'current' in ref) {
            (ref as React.MutableRefObject<T>).current = targetRef.current;
          }
        } catch (error) {
          console.error('Error setting ref:', error);
        }
      }
    });
  }, [refs]);

  return targetRef;
}

/**
 * Creates a safe ref to use in components
 * Combines a forwarded ref with a local ref
 */
export function useSafeRef<T>(forwardedRef: React.Ref<T>) {
  const localRef = React.useRef<T>(null);
  return useCombinedRefs(forwardedRef, localRef);
}

/**
 * Utility to check if a DOM element exists and is valid
 */
export function isValidElement(element: any): element is Element {
  return element && element instanceof Element;
} 