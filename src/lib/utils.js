import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names safely, resolving conflicting utility
 * classes (e.g. "px-2 px-4" -> "px-4") the way shadcn/ui components
 * expect. Used by every component in components/ui.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
