import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

// Safe ref processing with recursion protection
const useRecursionSafeRef = <T,>(ref: React.Ref<T>) => {
  const localRef = React.useRef<T>(null);
  
  React.useEffect(() => {
    // Skip if ref is null or undefined
    if (!ref) return;
    
    try {
      if (typeof ref === 'function') {
        ref(localRef.current);
      } else if (ref && typeof ref === 'object' && 'current' in ref) {
        (ref as React.MutableRefObject<T>).current = localRef.current;
      }
    } catch (error) {
      console.warn('Safe ref assignment failed:', error);
    }
  }, [ref]);
  
  return localRef;
};

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  // Create safe ref
  const safeRef = useRecursionSafeRef<React.ElementRef<typeof TooltipPrimitive.Content>>(ref);
  
  // Apply runtime protection to newly created elements
  React.useLayoutEffect(() => {
    if (safeRef.current) {
      try {
        // Mark the element to prevent toString recursion
        Object.defineProperty(safeRef.current, 'toString', {
          value: function() { return '[TooltipContent]'; },
          writable: false,
          configurable: true
        });
      } catch (error) {
        console.warn('Failed to patch tooltip element:', error);
      }
    }
  }, []);
  
  return (
    <TooltipPrimitive.Content
      ref={safeRef}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  )
})
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
