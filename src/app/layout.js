import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "@/components/ui/sonner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { SOCIAL_LINKS } from "@/components/shared/social-links";

// Sitewide display serif — Cormorant, the exact variable family/weight
// range requested (300-700, upright + italic). Self-hosted via
// next/font/local rather than next/font/google's runtime <link> tags:
// same font, but vendored under public/fonts/cormorant (mirroring this
// project's existing convention of self-hosting every large asset —
// pdf.js, tesseract, ffmpeg all live under public/vendor, see README),
// so there's no round-trip to fonts.googleapis.com/fonts.gstatic.com,
// no dependency on Google Fonts uptime, automatic font-display: swap,
// and no layout shift while it loads. The two files are the official
// Google Fonts variable-weight sources for Cormorant (OFL-licensed —
// public/fonts/cormorant/LICENSE.txt), so this is the identical
// typeface next/font/google would have fetched, just fetched once at
// vendoring time instead of on every build. Exposed as --font-cormorant
// so globals.css's existing --font-display token (already wired through
// every "font-display" utility class sitewide, see the @theme inline
// block) can simply point at it instead of Geist Sans — every heading
// in the app picks this up with no per-component changes needed.
const cormorant = localFont({
  src: [
    {
      path: "../../public/fonts/cormorant/Cormorant-Variable.woff2",
      style: "normal",
      weight: "300 700",
    },
    {
      path: "../../public/fonts/cormorant/Cormorant-Italic-Variable.woff2",
      style: "italic",
      weight: "300 700",
    },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

const SITE_URL = "https://toolsroot.com";

export const metadata = {
  metadataBase: new URL(SITE_URL),

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  title: {
    default: "Tools Root: Free Online File Converter & PDF Tools",
    template: "%s | Tools Root",
  },
  description:
    "Merge, split, compress, and convert PDFs, images, documents, audio, and video. Free, private, and no install required. Every file is processed in your browser.",
  keywords: [
    "pdf converter",
    "merge pdf",
    "compress pdf",
    "pdf to word",
    "image converter",
    "file converter online",
  ],
  openGraph: {
    type: "website",
    siteName: "Tools Root",
    title: "Tools Root: Free Online File Converter & PDF Tools",
    description:
      "Merge, split, compress, and convert PDFs, images, documents, audio, and video. Free, private, and no install required.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tools Root: Free Online File Converter & PDF Tools",
    description: "Free, private file conversion that runs entirely in your browser.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tools Root",
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    description:
      "A free, privacy-first file conversion and editing platform. Every tool runs entirely in the browser via JavaScript and WebAssembly. No file is ever uploaded to a server.",
    sameAs: SOCIAL_LINKS.map((link) => link.href),
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Tools Root",
    url: SITE_URL,
    description:
      "Merge, split, compress, and convert PDFs, images, documents, audio, and video. Free, private, and no install required.",
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <SiteHeader />
        
        <main className="flex-1">{children}</main>
        
        <SiteFooter />
        <Toaster />
      </body>
    </html>
  );
}
