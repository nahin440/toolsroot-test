import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Roboto_Slab } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "@/components/ui/sonner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { SOCIAL_LINKS } from "@/components/shared/social-links";

// Sitewide display/body font — Roboto Slab, self-hosted at build time via
// next/font/google (previously loaded at runtime from a Google Fonts
// <link rel="stylesheet"> in <head>; see git history). next/font
// downloads the font files during the build, serves them from this
// site's own origin, and inlines the @font-face rules directly into the
// page — so there's no separate render-blocking request out to
// fonts.googleapis.com/fonts.gstatic.com on every visit, no dependency on
// Google's CDN being fast (or reachable) for first paint, and no CLS from
// the swap: next/font auto-calculates a fallback-font size-adjustment so
// the fallback serif reserves the same box the real font will occupy.
// `variable` (not a fixed class) exposes it as --font-roboto-slab on
// <html> below, and globals.css's --font-display / --font-body tokens
// point at that CSS variable, so every heading, paragraph, button, and
// label sitewide keeps picking it up with no per-component changes.
const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-roboto-slab",
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
    default: "Tools Root: Free Online Utility Tools Hub",
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
    title: "Tools Root: Free Online Utility Tools Hub",
    description:
      "Merge, split, compress, and convert PDFs, images, documents, audio, and video. Free, private, and no install required.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tools Root: Free Online Utility Tools Hub",
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
      className={`${GeistSans.variable} ${GeistMono.variable} ${robotoSlab.variable} h-full antialiased`}
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
