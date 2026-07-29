import { cn } from "@/lib/utils";

/**
 * Loading placeholder. Uses the site's existing .skeleton-shimmer utility
 * (defined in globals.css, already built on the --muted/--accent-tint
 * tokens) rather than introducing a separate animation — this formalizes
 * a pattern that was already hand-rolled in tool-page-client.jsx into a
 * single reusable component.
 */
function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn("skeleton-shimmer rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
