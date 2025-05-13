import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

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

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
  // Create safe ref
  const safeRef = useRecursionSafeRef<React.ElementRef<typeof PopoverPrimitive.Content>>(ref);
  
  // Apply runtime protection to newly created elements
  React.useLayoutEffect(() => {
    if (safeRef.current) {
      try {
        // Mark the element to prevent toString recursion
        Object.defineProperty(safeRef.current, 'toString', {
          value: function() { return '[PopoverContent]'; },
          writable: false,
          configurable: true
        });
      } catch (error) {
        console.warn('Failed to patch popover element:', error);
      }
    }
  }, []);
  
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={safeRef}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
