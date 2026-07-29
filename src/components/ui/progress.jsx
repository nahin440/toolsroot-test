"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

function Progress({ className, value, indeterminate = false, ...props }) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn("bg-secondary relative h-2 w-full overflow-hidden rounded-full", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "bg-accent h-full w-full flex-1 rounded-full transition-transform duration-300 ease-[var(--ease-standard)]",
          indeterminate && "animate-progress-indeterminate w-1/3"
        )}
        style={!indeterminate ? { transform: `translateX(-${100 - (value || 0)}%)` } : undefined}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
