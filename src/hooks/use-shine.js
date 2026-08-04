"use client";

import { useCallback, useRef } from "react";

/**
 * Drives the .shine-sweep utility's one-shot specular highlight (see
 * globals.css): a diagonal light sweep across a metallic surface,
 * triggered on hover/focus and motivated by feedback ("this button just
 * responded to you"), not looped forever as ambient decoration. Motion's
 * own reduced-motion CSS handles turning the animation off; this hook
 * only handles the retrigger mechanics.
 *
 * Returns the props to spread onto the element carrying the
 * `shine-sweep` class: { onMouseEnter, onFocus, "data-shine" via ref }.
 *
 * Usage:
 *   const shine = useShineOnHover();
 *   <button className="shine-sweep" {...shine}>...</button>
 */
export function useShineOnHover() {
  const elRef = useRef(null);
  const timeoutRef = useRef(null);

  const trigger = useCallback((e) => {
    const el = e.currentTarget;
    elRef.current = el;
    // Force a reflow before re-adding the attribute so re-hovering
    // mid-animation restarts the sweep rather than being a no-op
    // (CSS animations don't restart just by re-setting an attribute
    // that's already present).
    el.removeAttribute("data-shine");
    el.offsetWidth;
    el.setAttribute("data-shine", "active");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      el.removeAttribute("data-shine");
    }, 1200);
  }, []);

  return {
    ref: elRef,
    onMouseEnter: trigger,
    onFocus: trigger,
  };
}
