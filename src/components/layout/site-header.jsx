"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
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

const PRIMARY_CATEGORY_KEYS = ["pdf", "imageConverter", "document", "image"];
const MORE_CATEGORY_KEYS = ["video", "audioConverter", "videoConverter", "audio", "archive"];

// Individual category menu component
function CategoryMenu({ categoryKey, onClose }) {
  const category = CATEGORIES[categoryKey];
  const tools = getToolsByCategory(categoryKey);
  const Icon = CATEGORY_ICONS[categoryKey];

  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      className="absolute top-full left-0 z-50 mt-1 min-w-[480px] rounded-xl border border-border/40 bg-popover/95 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12),0_2px_8px_-4px_rgba(0,0,0,0.06)] backdrop-blur-md p-2"
    >
      <div className="grid grid-cols-2 gap-0.5">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/${category.slug}/${tool.slug}`}
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 hover:bg-secondary/80 hover:text-foreground"
          >
            <span className="truncate font-medium">{tool.name}</span>
          </Link>
        ))}
      </div>
      <div className="mt-1.5 border-t border-border/60 pt-1.5 px-2">
        <Link
          href={`/${category.slug}`}
          onClick={onClose}
          className="text-sm font-medium text-accent/90 hover:text-accent transition-colors duration-150"
        >
          View all {category.label} →
        </Link>
      </div>
    </motion.div>
  );
}

// More dropdown with nested submenus
function MoreDropdown({ onClose }) {
  const [activeSub, setActiveSub] = useState(null);
  const timeoutRef = useRef(null);

  const handleSubEnter = useCallback((key) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveSub(key);
  }, []);

  const handleSubLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setActiveSub(null);
    }, 100);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      className="absolute top-full right-0 z-50 mt-1 min-w-[200px] rounded-xl border border-border/40 bg-popover/95 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12),0_2px_8px_-4px_rgba(0,0,0,0.06)] backdrop-blur-md p-1.5"
      onMouseLeave={() => {
        handleSubLeave();
        onClose();
      }}
    >
      {MORE_CATEGORY_KEYS.map((key) => {
        const cat = CATEGORIES[key];
        const Icon = CATEGORY_ICONS[key];
        const isActive = activeSub === key;

        return (
          <div
            key={key}
            className="relative"
            onMouseEnter={() => handleSubEnter(key)}
            onMouseLeave={handleSubLeave}
          >
            <button
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-150",
                isActive 
                  ? "bg-secondary/80 text-foreground" 
                  : "text-foreground/80 hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="size-4 shrink-0" />
                {cat.shortLabel}
              </span>
              <HiChevronRight className="size-3.5 text-muted-foreground/60" />
            </button>

            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.1 }}
                  className="absolute top-0 left-full z-50 ml-1 min-w-[220px] rounded-xl border border-border/40 bg-popover/95 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12),0_2px_8px_-4px_rgba(0,0,0,0.06)] backdrop-blur-md p-1.5"
                  onMouseEnter={() => handleSubEnter(key)}
                  onMouseLeave={handleSubLeave}
                >
                  <div className="max-h-[320px] overflow-y-auto">
                    {getToolsByCategory(key).map((tool) => (
                      <Link
                        key={tool.slug}
                        href={`/${cat.slug}/${tool.slug}`}
                        onClick={onClose}
                        className="flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-150 hover:bg-secondary/80 hover:text-foreground"
                      >
                        <span className="truncate font-medium">{tool.name}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-1.5 border-t border-border/60 pt-1.5 px-2">
                    <Link
                      href={`/${cat.slug}`}
                      onClick={onClose}
                      className="text-sm font-medium text-accent/90 hover:text-accent transition-colors duration-150"
                    >
                      View all {cat.label} →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </motion.div>
  );
}

export function SiteHeader() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const timeoutRef = useRef(null);
  const headerRef = useRef(null);

  const handleMouseEnter = useCallback((key) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(key);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  }, []);

  const handleDropdownEnter = useCallback((key) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(key);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <header 
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-accent/10 bg-background/80 shadow-[0_1px_0_0_rgba(5,150,105,0.06),0_8px_24px_-16px_rgba(5,150,105,0.25)] backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Tools Root — Home">
          <LogoMark />
        </Link>

        {/* Desktop Navigation */}
        <nav 
          className="hidden items-center gap-0.5 lg:flex"
          onMouseLeave={handleMouseLeave}
        >
          {PRIMARY_CATEGORY_KEYS.map((key) => {
            const cat = CATEGORIES[key];
            const Icon = CATEGORY_ICONS[key];
            const isOpen = activeDropdown === key;

            return (
              <div 
                key={key} 
                className="relative"
                onMouseEnter={() => handleMouseEnter(key)}
              >
                <button
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200",
                    isOpen 
                      ? "bg-secondary/80 text-foreground" 
                      : "text-foreground/80 hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{cat.shortLabel}</span>
                  <HiChevronDown className={cn(
                    "size-3.5 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <div 
                      onMouseEnter={() => handleDropdownEnter(key)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <CategoryMenu categoryKey={key} onClose={() => setActiveDropdown(null)} />
                    </div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* More Button */}
          <div 
            className="relative"
            onMouseEnter={() => handleMouseEnter("more")}
          >
            <button
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200",
                activeDropdown === "more" 
                  ? "bg-secondary/80 text-foreground" 
                  : "text-foreground/80 hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <span>More</span>
              <HiChevronDown className={cn(
                "size-3.5 transition-transform duration-200",
                activeDropdown === "more" && "rotate-180"
              )} />
            </button>

            <AnimatePresence>
              {activeDropdown === "more" && (
                <div 
                  onMouseEnter={() => handleDropdownEnter("more")}
                  onMouseLeave={handleDropdownLeave}
                >
                  <MoreDropdown onClose={() => setActiveDropdown(null)} />
                </div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="sm" className="transition-all duration-200">
            <Link href="/blog">Blog</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="transition-all duration-200">
            <Link href="/pricing">Pricing</Link>
          </Button>
          <Button asChild variant="accent" size="sm" className="transition-all duration-200">
            <Link href="/#categories">Get started</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary/50 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <HiXMark className="size-6" /> : <HiBars3 className="size-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-accent/10 bg-background/95 backdrop-blur-md lg:hidden"
          >
            <div className="max-h-[70vh] space-y-0.5 overflow-y-auto px-4 py-4">
              {PRIMARY_CATEGORY_KEYS.map((key) => (
                <Link
                  key={key}
                  href={`/${CATEGORIES[key].slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
                >
                  {CATEGORIES[key].label}
                </Link>
              ))}

              <button
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
                onClick={() => setMobileMoreOpen((v) => !v)}
              >
                <span>More</span>
                <HiChevronDown className={cn(
                  "size-3.5 transition-transform duration-200",
                  mobileMoreOpen && "rotate-180"
                )} />
              </button>

              <AnimatePresence>
                {mobileMoreOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden pl-3"
                  >
                    {MORE_CATEGORY_KEYS.map((key) => (
                      <Link
                        key={key}
                        href={`/${CATEGORIES[key].slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary/80"
                      >
                        {CATEGORIES[key].label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-2 border-t border-border/60 pt-2">
                <Link
                  href="/blog"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
                >
                  Blog
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
                >
                  Pricing
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}