"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { HiCheck } from "react-icons/hi";

import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-border data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground data-[state=checked]:border-accent size-4 shrink-0 rounded-[6px] border shadow-xs transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <HiCheck className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
