"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

function Slider({ className, defaultValue, value, min = 0, max = 100, ...props }) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn("relative flex w-full touch-none items-center select-none", className)}
      {...props}
    >
      <SliderPrimitive.Track className="bg-secondary relative grow overflow-hidden rounded-full h-1.5 w-full">
        <SliderPrimitive.Range className="bg-accent absolute h-full" />
      </SliderPrimitive.Track>
      {(Array.isArray(value ?? defaultValue) ? (value ?? defaultValue) : [value ?? defaultValue ?? 0]).map(
        (_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className="border-accent bg-background block size-4 shrink-0 rounded-full border-2 shadow-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50"
          />
        )
      )}
    </SliderPrimitive.Root>
  );
}

export { Slider };
