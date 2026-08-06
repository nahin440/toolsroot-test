import { notFound } from "next/navigation";
import { HiOutlineCheckCircle } from "react-icons/hi2";

import { getCategoryBySlug, getToolsByCategory, CATEGORIES } from "@/lib/registry/tools";
import { getCategoryContent } from "@/lib/registry/category-content";
import { getBlogPostsByCategory } from "@/lib/registry/blog-content";
import { ToolCard } from "@/components/home/tool-card";
import { CategoryHero } from "@/components/category-page/category-hero";
import { BlogPostCard } from "@/components/shared/blog-post-card";

const SITE_URL = "https://toolsroot.com";

export function generateStaticParams() {
  return Object.values(CATEGORIES).map((cat) => ({ categorySlug: cat.slug }));
}

export async function generateMetadata({ params }) {
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return {};

  const richTitle = `${category.label}: Free, No Sign-Up`;

  return {
    title: richTitle,
    description: category.description,
    alternates: { canonical: `/${category.slug}` },
    openGraph: {
      title: `${richTitle} | Tools Root`,
      description: category.description,
      url: `${SITE_URL}/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }) {
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const tools = getToolsByCategory(category.key);
  const content = getCategoryContent(category.key);
  const relatedPosts = getBlogPostsByCategory(category.key, 3);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: category.label, item: `${SITE_URL}/${category.slug}` },
    ],
  };

  const faqJsonLd = content.faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: content.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }
    : null;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <CategoryHero
        category={category}
        toolCount={tools.length}
        representativeSlug={tools[0]?.slug}
      />

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>

      {content.intro && (
        <div className="glossy-card mt-16 max-w-3xl rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            About {category.label}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{content.intro}</p>
        </div>
      )}

      {content.benefits.length > 0 && (
        <div className="mt-12 max-w-3xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Why use these tools
          </h2>
          <ul className="mt-4 space-y-3">
            {content.benefits.map((benefit, i) => (
              <li
                key={i}
                className="glossy-card flex gap-3 rounded-xl border border-border/70 bg-card p-4 text-base leading-relaxed text-muted-foreground"
              >
                <span className="metallic-emerald mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white">
                  <HiOutlineCheckCircle className="size-3.5" />
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {relatedPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Related articles
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((post) => (
              <BlogPostCard key={post.slug} post={post} headingLevel="h3" />
            ))}
          </div>
        </div>
      )}

      {content.faq.length > 0 && (
        <div className="mt-12 max-w-3xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <div className="mt-4 space-y-3">
            {content.faq.map((item, i) => (
              <div key={i} className="glossy-card rounded-xl border border-border/70 bg-card p-4">
                <h3 className="font-medium text-foreground">{item.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
