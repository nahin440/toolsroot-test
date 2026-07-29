import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-150 ease-[var(--ease-standard)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary action = the single accent color, per product palette rule
        accent:
          "bg-accent text-accent-foreground shadow-[0_1px_2px_rgba(10,10,10,0.06)] hover:bg-accent-hover hover:shadow-accent-glow",
        // High-emphasis but neutral (ink) action, per style reference's "primary filled button"
        primary:
          "bg-primary text-primary-foreground hover:opacity-90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-secondary",
        // For buttons placed directly on a solid --accent background (hero,
        // CTA bands) — an "accent" variant button would be invisible there,
        // since it'd be the same color as the section behind it.
        "on-accent":
          "bg-white text-accent-ink shadow-[0_1px_2px_rgba(10,10,10,0.06)] hover:bg-white/90",
        ghost: "bg-transparent text-foreground hover:bg-secondary",
        link: "text-accent underline-offset-4 hover:underline rounded-none px-0",
        destructive:
          "bg-primary text-primary-foreground hover:opacity-90",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
