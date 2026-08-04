import { createElement } from "react";
import { HiOutlineCheckCircle } from "react-icons/hi2";

import { getToolIcon } from "@/lib/registry/tool-icons";
import { HeroIconFloat } from "@/components/shared/hero-icon-float";

/**
 * Full-bleed metallic-emerald hero for a category listing page — same v3
 * design system as ToolHero (see tool-page/tool-hero.jsx): the
 * metallic-emerald-soft gradient mesh with a slow ambient breathe instead
 * of the old flat --accent fill, a single floating icon on the right,
 * white text on the left, hidden on mobile.
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
    <section className="relative isolate overflow-hidden rounded-3xl metallic-emerald-soft metallic-breathe">
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
