import { createElement } from "react";
import { HiOutlineCheckCircle } from "react-icons/hi2";

import { getToolIcon } from "@/lib/registry/tool-icons";
import { HeroIconFloat } from "@/components/shared/hero-icon-float";

/**
 * Full-bleed emerald-600 hero for a category listing page. Same pattern as
 * ToolHero (see tool-page/tool-hero.jsx) — a single floating icon on the
 * right, white text on the left, hidden on mobile.
 *
 * Server Component: resolves the representative tool's icon here (via
 * getToolIcon) and passes only the rendered element to the client-only
 * HeroIconFloat wrapper. This mirrors the existing convention already used
 * on the homepage's "Browse by category" grid (getToolIcon(tools[0]?.slug))
 * rather than introducing a new way to choose a category icon, and avoids
 * pulling the full tool-icons registry into this route's client bundle.
 *
 * The H1/description/tool-count badge text is unchanged from the previous
 * plain layout — only the container styling changed, so the BreadcrumbList
 * and FAQPage JSON-LD built from this page's content stay accurate.
 */
export function CategoryHero({ category, toolCount, representativeSlug }) {
  const CategoryIcon = getToolIcon(representativeSlug);

  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-accent">
      <HeroIconFloat>{createElement(CategoryIcon, { className: "size-1/2" })}</HeroIconFloat>

      <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:max-w-[65%] lg:py-16">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
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
