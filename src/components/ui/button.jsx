"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { useShineOnHover } from "@/hooks/use-shine";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-150 ease-[var(--ease-standard)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary action = the single accent color, per product palette rule.
        // shine-sweep (globals.css) adds a one-shot specular highlight on
        // hover/focus, wired up by useShineOnHover in each usage site — see
        // src/hooks/use-shine.js for why this is a triggered one-shot, not
        // an infinite loop. Reserved for THIS variant specifically: it's
        // the button rendered directly on the metallic-emerald surface
        // (or as the emerald surface itself), so "catching the light" on
        // interaction reads as an extension of that surface's material,
        // not a random flourish tacked onto every button sitewide.
        accent:
          "shine-sweep bg-accent text-accent-foreground shadow-[0_1px_2px_rgba(10,10,10,0.06)] hover:bg-accent-hover hover:shadow-accent-glow",
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

function Button({ className, variant, size, asChild = false, onMouseEnter, onFocus, ...props }) {
  const Comp = asChild ? Slot : "button";
  const shine = useShineOnHover();
  // buttonVariants (cva's return value) is a plain closure with no
  // attached metadata — defaultVariants isn't readable off of it, so the
  // actual configured default ("primary", see defaultVariants above) is
  // hardcoded here to resolve which variant actually renders when the
  // caller doesn't pass one.
  const resolvedVariant = variant ?? "primary";
  const isAccent = resolvedVariant === "accent";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      // Shine trigger only actually does anything on the accent variant
      // (the only one carrying the shine-sweep class in its variant
      // string above); on every other variant this is inert extra event
      // handlers wrapping the caller's own, still called correctly via
      // the composed handlers below so nothing a caller passed is lost.
      onMouseEnter={
        isAccent
          ? (e) => {
              shine.onMouseEnter(e);
              onMouseEnter?.(e);
            }
          : onMouseEnter
      }
      onFocus={
        isAccent
          ? (e) => {
              shine.onFocus(e);
              onFocus?.(e);
            }
          : onFocus
      }
      {...props}
    />
  );
}

export { Button, buttonVariants };
