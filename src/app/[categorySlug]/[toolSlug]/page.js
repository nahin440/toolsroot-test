import { notFound } from "next/navigation";

import { getTool, getCategoryBySlug, getRelatedTools, TOOLS, CATEGORIES } from "@/lib/registry/tools";
import { ToolPageLayout } from "@/components/tool-page/tool-page-layout";
import { ToolPageClient } from "@/components/tool-page/tool-page-client";
import { getToolContent } from "@/lib/registry/tool-content";

const SITE_URL = "https://toolsroot.com";

export function generateStaticParams() {
  return TOOLS.map((tool) => ({
    categorySlug: CATEGORIES[tool.category].slug,
    toolSlug: tool.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { categorySlug, toolSlug } = await params;
  const tool = getTool(toolSlug);
  const category = getCategoryBySlug(categorySlug);
  if (!tool || !category || tool.category !== category.key) return {};

  // Google's search-result title display is roughly 60 characters before
  // truncation. The full suffix fits every tool name except a handful of
  // longer ones (the All-in-One converters, Extract Audio from Video), so
  // those fall back to the shorter suffix instead of risking "No Sign-Up"
  // or similar getting cut off mid-word in search results.
  const fullSuffix = " Online Free — No Upload, No Sign-Up";
  const shortSuffix = " — Free, No Upload";
  const suffix = tool.name.length + fullSuffix.length <= 60 ? fullSuffix : shortSuffix;
  const richTitle = `${tool.name}${suffix}`;

  return {
    title: richTitle,
    description: tool.description,
    alternates: { canonical: `/${category.slug}/${tool.slug}` },
    openGraph: {
      title: `${richTitle} | Tools Root`,
      description: tool.description,
    },
  };
}

export default async function ToolPage({ params }) {
  const { categorySlug, toolSlug } = await params;
  const tool = getTool(toolSlug);
  const category = getCategoryBySlug(categorySlug);

  if (!tool || !category || tool.category !== category.key) {
    notFound();
  }

  const content = getToolContent(toolSlug);
  const relatedTools = getRelatedTools(toolSlug, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (runs in web browser)",
    url: `${SITE_URL}/${category.slug}/${tool.slug}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const faqJsonLd = content.faq?.length
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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: category.label, item: `${SITE_URL}/${category.slug}` },
      { "@type": "ListItem", position: 3, name: tool.name, item: `${SITE_URL}/${category.slug}/${tool.slug}` },
    ],
  };

  const howToJsonLd = content.howItWorks?.steps?.length
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: content.howItWorks.title,
        step: content.howItWorks.steps.map((step, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          text: step,
        })),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {howToJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      )}
      <ToolPageLayout
        tool={tool}
        category={category}
        shell={<ToolPageClient toolSlug={tool.slug} toolName={tool.name} />}
        howItWorks={content.howItWorks}
        faq={content.faq}
        longDescription={content.longDescription}
        relatedTools={relatedTools}
      />
    </>
  );
}
