import { createElement } from "react";
import { HiOutlineCheckCircle } from "react-icons/hi2";

import { getToolIcon } from "@/lib/registry/tool-icons";
import { HeroIconFloat } from "@/components/shared/hero-icon-float";
import { FloatingPaths } from "@/components/ui/background-paths";
import { OrganicBlobs } from "@/components/illustrations/organic-blobs";

/**
 * Full-bleed metallic-emerald hero for a category listing page — same v4
 * design system as ToolHero (see tool-page/tool-hero.jsx): the
 * metallic-emerald-loud gradient mesh with a slow ambient breathe, the
 * organic blob backdrop, the animated white path lines behind everything
 * (previously missing on this specific hero — added here so every hero
 * sitewide shares the same background-animation layer, per the redesign
 * brief), a single floating icon on the right, white text on the left,
 * hidden on mobile.
 *
 * Server Component: resolves the representative tool's icon here (via
 * getToolIcon) and passes only the rendered element to the client-only
 * HeroIconFloat wrapper. This mirrors the existing convention already used
 * on the homepage's "Browse by category" grid (getToolIcon(tools[0]?.slug))
 * rather than introducing a new way to choose a category icon, and avoids
 * pulling the full tool-icons registry into this route's client bundle.
 * FloatingPaths/OrganicBlobs are Client Components rendered as children,
 * same pattern as HeroIconFloat — this file itself stays a Server
 * Component.
 *
 * The H1/description/tool-count badge text is unchanged from the previous
 * plain layout — only the container styling changed, so the BreadcrumbList
 * and FAQPage JSON-LD built from this page's content stay accurate.
 */
export function CategoryHero({ category, toolCount, representativeSlug }) {
  const CategoryIcon = getToolIcon(representativeSlug);

  return (
    <section className="relative isolate overflow-hidden rounded-3xl">
      {/* Animated background isolated to its own layer — metal-breathe
          animates `filter`, and animating filter on an element that
          also parents the real text content forces the browser to
          repaint that whole subtree every frame, which shows up as the
          entire section (gradient + text) flickering rather than a
          smooth breathing glow. Keeping it on this empty absolutely-
          positioned div means only this decorative layer repaints. */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl metallic-emerald-loud metallic-breathe"
        aria-hidden="true"
      />
      <OrganicBlobs tone="on-accent" />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <FloatingPaths position={1} colorRgb="255, 255, 255" />
        <FloatingPaths position={-1} colorRgb="255, 255, 255" />
      </div>
      <HeroIconFloat>{createElement(CategoryIcon, { className: "size-1/2" })}</HeroIconFloat>

      <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:max-w-[65%] lg:py-16">
        <span className="glass-panel inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white">
          <HiOutlineCheckCircle className="size-3.5" />
          {toolCount} free tools
        </span>
        <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {category.label}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-white/85">{category.description}</p>
      </div>
    </section>
  );
}
