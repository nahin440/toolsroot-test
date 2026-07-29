import Link from "next/link";
import { HiArrowRight, HiOutlineCalendar, HiOutlineClock } from "react-icons/hi2";

import { CATEGORIES } from "@/lib/registry/tools";

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function BlogPostCard({ post, headingLevel = "h3" }) {
  const category = CATEGORIES[post.category];
  const Heading = headingLevel;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-subtle transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-card"
    >
      <span className="inline-flex w-fit items-center rounded-full bg-accent-tint px-2.5 py-1 text-xs font-medium text-accent">
        {category.shortLabel}
      </span>
      <Heading className="mt-3 font-semibold text-foreground">{post.title}</Heading>
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.description}</p>
      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <HiOutlineCalendar className="size-3.5" />
          {formatDate(post.publishedAt)}
        </span>
        <span className="inline-flex items-center gap-1">
          <HiOutlineClock className="size-3.5" />
          {post.readingTime}
        </span>
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
        Read article
        <HiArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
