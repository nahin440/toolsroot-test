import Link from "next/link";
import { HiArrowRight } from "react-icons/hi2";
import { createElement } from "react";

import { getToolIcon } from "@/lib/registry/tool-icons";
import { CATEGORIES } from "@/lib/registry/tools";
import { cn } from "@/lib/utils";

export function ToolCard({ tool, className }) {
  const category = CATEGORIES[tool.category];

  return (
    <Link
      href={`/${category.slug}/${tool.slug}`}
      className={cn(
        // transition-all replaced with the explicit properties actually
        // changing on hover (transform, colors, box-shadow, border-color)
        // per the Vercel Web Interface Guidelines: transition: all forces
        // the browser to watch every animatable property for changes
        // instead of just the ones this card actually touches. This is a
        // frequent, repeated-many-times-per-page element (tool grids),
        // so per the motion skill's frequency gate the hover stays a
        // quick, subtle lift rather than gaining new decorative motion.
        "group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-subtle transition-[transform,border-color,box-shadow] duration-150 ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-card",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex size-11 items-center justify-center rounded-xl bg-accent-tint text-accent transition-[background-color,color,box-shadow] duration-150 ease-[var(--ease-standard)] group-hover:bg-accent group-hover:text-accent-foreground group-hover:shadow-accent-glow">
          {createElement(getToolIcon(tool.slug), { className: "size-5" })}
        </div>
        <HiArrowRight className="size-4 text-muted-foreground opacity-0 transition-[transform,opacity] duration-150 ease-[var(--ease-standard)] group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{tool.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tool.description}</p>
      </div>
    </Link>
  );
}
