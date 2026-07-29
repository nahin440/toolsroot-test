import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "@/components/ui/sonner";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const SITE_URL = "https://toolsroot.com";

export const metadata = {
  metadataBase: new URL(SITE_URL),

   icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  title: {
    default: "Tools Root — Free Online File Converter & PDF Tools",
    template: "%s | Tools Root",
  },
  description:
    "Merge, split, compress, and convert PDFs, images, documents, audio, and video — free, private, and no install required. Every file is processed in your browser.",
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
    title: "Tools Root — Free Online File Converter & PDF Tools",
    description:
      "Merge, split, compress, and convert PDFs, images, documents, audio, and video — free, private, and no install required.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tools Root — Free Online File Converter & PDF Tools",
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
      "A free, privacy-first file conversion and editing platform. Every tool runs entirely in the browser via JavaScript and WebAssembly — no file is ever uploaded to a server.",
    sameAs: [],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Tools Root",
    url: SITE_URL,
    description:
      "Merge, split, compress, and convert PDFs, images, documents, audio, and video — free, private, and no install required.",
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
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
