"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { motion, AnimatePresence } from "motion/react";

import { searchTools } from "@/lib/registry/search-tools";
import { cn } from "@/lib/utils";

export function ToolSearchBar({ className }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);

  const results = useMemo(() => searchTools(query), [query]);
  const showResults = isFocused && query.trim().length > 0;

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-xl", className)}>
      <div className="relative rounded-4xl border-2 border-accent">
        <HiMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search 70 tools: merge PDF, compress image, convert video…"
          className="h-14 w-full rounded-full border border-border bg-card pl-12 pr-4 text-base text-foreground shadow-card outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
        />
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 z-30 mt-2 w-full rounded-2xl border border-border bg-popover shadow-dropdown"
          >
            {results.length ? (
              <ul className="max-h-80 overflow-y-auto p-2">
                {results.map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={tool.href}
                      className="flex flex-col gap-0.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-accent-tint"
                    >
                      <span className="text-sm font-medium text-foreground">{tool.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{tool.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-sm text-muted-foreground">No tools found for &ldquo;{query}&rdquo;.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
