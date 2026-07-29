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
        "group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-subtle transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-card",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex size-11 items-center justify-center rounded-xl bg-accent-tint text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
          {createElement(getToolIcon(tool.slug), { className: "size-5" })}
        </div>
        <HiArrowRight className="size-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{tool.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tool.description}</p>
      </div>
    </Link>
  );
}
