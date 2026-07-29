"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HiOutlineDocumentText,
  HiOutlinePhoto,
  HiOutlineMusicalNote,
  HiOutlineFilm,
  HiOutlineArchiveBox,
  HiOutlineArrowPath,
  HiChevronDown,
  HiChevronRight,
  HiBars3,
  HiXMark,
} from "react-icons/hi2";
import { HiDocumentDuplicate } from "react-icons/hi2";

import { LogoMark } from "./logo";
import { CATEGORIES, getToolsByCategory } from "@/lib/registry/tools";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CATEGORY_ICONS = {
  pdf: HiDocumentDuplicate,
  image: HiOutlinePhoto,
  imageConverter: HiOutlineArrowPath,
  document: HiOutlineDocumentText,
  audio: HiOutlineMusicalNote,
  audioConverter: HiOutlineArrowPath,
  video: HiOutlineFilm,
  videoConverter: HiOutlineArrowPath,
  archive: HiOutlineArchiveBox,
};

// Ordered by tool count (see tools.js) — the 4 busiest categories stay as
// top-level nav buttons; everything else nests under "More" so the header
// never has enough top-level items to overflow horizontally regardless of
// viewport width.
const PRIMARY_CATEGORY_KEYS = ["pdf", "imageConverter", "document", "image"];
const MORE_CATEGORY_KEYS = ["video", "audioConverter", "videoConverter", "audio", "archive"];

function CategoryMegaMenu({ categoryKey, onClose, align = "center" }) {
  const category = CATEGORIES[categoryKey];
  const tools = getToolsByCategory(categoryKey);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "absolute top-full z-40 mt-2 w-[560px] rounded-2xl border border-border bg-popover p-4 shadow-dropdown",
        align === "center" && "left-1/2 -translate-x-1/2",
        align === "left" && "left-0"
      )}
    >
      <div className="grid grid-cols-2 gap-1">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/${category.slug}/${tool.slug}`}
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-accent-tint hover:text-accent-active"
          >
            <span className="truncate font-medium">{tool.name}</span>
          </Link>
        ))}
      </div>
      <div className="mt-2 border-t border-border pt-2 px-3">
        <Link
          href={`/${category.slug}`}
          onClick={onClose}
          className="text-sm font-medium text-accent hover:underline"
        >
          View all {category.label} →
        </Link>
      </div>
    </motion.div>
  );
}

// Nested submenu used inside "More" — sits to the side of the trigger row
// rather than below it, since it's already inside a dropdown panel.
function MoreCategorySubmenu({ categoryKey, onClose }) {
  const category = CATEGORIES[categoryKey];
  const tools = getToolsByCategory(categoryKey);

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -6 }}
      transition={{ duration: 0.15 }}
      className="absolute top-0 left-full z-40 ml-2 w-[280px] rounded-2xl border border-border bg-popover p-2 shadow-dropdown"
    >
      <div className="max-h-[320px] overflow-y-auto">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/${category.slug}/${tool.slug}`}
            onClick={onClose}
            className="flex items-center rounded-xl px-3 py-2 text-sm transition-colors hover:bg-accent-tint hover:text-accent-active"
          >
            <span className="truncate font-medium">{tool.name}</span>
          </Link>
        ))}
      </div>
      <div className="mt-1 border-t border-border pt-1 px-3 pb-1">
        <Link
          href={`/${category.slug}`}
          onClick={onClose}
          className="text-sm font-medium text-accent hover:underline"
        >
          View all {category.label} →
        </Link>
      </div>
    </motion.div>
  );
}

function MoreMegaMenu({ onClose }) {
  const [activeSubcategory, setActiveSubcategory] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full right-0 z-40 mt-2 w-[240px] rounded-2xl border border-border bg-popover p-2 shadow-dropdown"
      onMouseLeave={() => setActiveSubcategory(null)}
    >
      {MORE_CATEGORY_KEYS.map((key) => {
        const cat = CATEGORIES[key];
        const Icon = CATEGORY_ICONS[key];
        return (
          <div key={key} className="relative" onMouseEnter={() => setActiveSubcategory(key)}>
            <button
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground",
                activeSubcategory === key && "bg-secondary text-foreground"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="size-4" />
                {cat.shortLabel}
              </span>
              <HiChevronRight className="size-3.5 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {activeSubcategory === key && (
                <MoreCategorySubmenu categoryKey={key} onClose={onClose} />
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </motion.div>
  );
}

export function SiteHeader() {
  const [openCategory, setOpenCategory] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <LogoMark />
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          onMouseLeave={() => setOpenCategory(null)}
        >
          {PRIMARY_CATEGORY_KEYS.map((key) => {
            const cat = CATEGORIES[key];
            const Icon = CATEGORY_ICONS[key];
            return (
              <div key={key} className="relative" onMouseEnter={() => setOpenCategory(key)}>
                <button
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground",
                    openCategory === key && "bg-secondary text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {cat.shortLabel}
                  <HiChevronDown className={cn("size-3.5 transition-transform", openCategory === key && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {openCategory === key && (
                    <CategoryMegaMenu categoryKey={key} onClose={() => setOpenCategory(null)} align={key === "pdf" ? "left" : "center"} />
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          <div className="relative" onMouseEnter={() => setOpenCategory("more")}>
            <button
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground",
                openCategory === "more" && "bg-secondary text-foreground"
              )}
            >
              More
              <HiChevronDown className={cn("size-3.5 transition-transform", openCategory === "more" && "rotate-180")} />
            </button>
            <AnimatePresence>
              {openCategory === "more" && <MoreMegaMenu onClose={() => setOpenCategory(null)} />}
            </AnimatePresence>
          </div>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/blog">Blog</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/pricing">Pricing</Link>
          </Button>
          <Button asChild variant="accent" size="sm">
            <Link href="/#categories">Get started</Link>
          </Button>
        </div>

        <button
          className="flex size-10 items-center justify-center rounded-full text-foreground lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <HiXMark className="size-6" /> : <HiBars3 className="size-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border lg:hidden"
          >
            <div className="max-h-[70vh] space-y-1 overflow-y-auto px-4 py-4">
              {PRIMARY_CATEGORY_KEYS.map((key) => (
                <Link
                  key={key}
                  href={`/${CATEGORIES[key].slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  {CATEGORIES[key].label}
                </Link>
              ))}

              <button
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                onClick={() => setMobileMoreOpen((v) => !v)}
              >
                More
                <HiChevronDown className={cn("size-3.5 transition-transform", mobileMoreOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {mobileMoreOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-3"
                  >
                    {MORE_CATEGORY_KEYS.map((key) => (
                      <Link
                        key={key}
                        href={`/${CATEGORIES[key].slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary"
                      >
                        {CATEGORIES[key].label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <Link
                href="/blog"
                onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Blog
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Pricing
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
