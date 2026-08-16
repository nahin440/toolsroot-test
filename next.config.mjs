import { createRequire } from "module";
import { fileURLToPath } from "url";

const emptyModulePath = fileURLToPath(new URL("./src/lib/empty-module.js", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Every blog post's hero/thumb image (src/lib/registry/blog-content.js,
    // new-blog-content.js) is a verified free Unsplash photo, always under
    // the /photo-<id> path Unsplash serves actual images from — scoped to
    // that pathname (rather than a bare hostname allow) so this doesn't
    // inadvertently trust some other Unsplash subpath this site never uses.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-**",
      },
    ],
    // These images never change once a post is published — the URL is
    // fixed per post in the registry, not user-uploaded or refreshed —
    // so Next's 60-second default cache would re-fetch and re-encode the
    // same source photo from Unsplash on almost every unique request in
    // any real traffic pattern. 30 days matches the effectively-static
    // nature of this content without being literally infinite (so a
    // future content correction, e.g. swapping a broken photo URL, still
    // clears out within a bounded window rather than needing a manual
    // cache purge).
    minimumCacheTTL: 2592000,
  },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:(fs|https)$/, (resource) => {
          resource.request = emptyModulePath;
        })
      );

      config.resolve.alias = {
        ...config.resolve.alias,
        module: false,
      };
    }

    return config;
  },

  async headers() {
    return [
      // Cross-origin isolation (COOP + COEP) is only needed on the
      // individual tool pages — they're the sole consumers of
      // SharedArrayBuffer, via ffmpeg.wasm/onnxruntime-web/tesseract.js
      // (see src/lib/engines/media/ffmpeg-loader.js, media-core.js,
      // image-upscaler.js, all reached through
      // src/components/tool-page/tool-page-shell.jsx). The category
      // listing pages (/pdf-tools, one path segment) and every other
      // route (/, /about, /blog, /admin, etc.) never touch that code
      // path. Scoping the source to the two-segment tool route
      // (":categorySlug/:toolSlug", matching the
      // src/app/[categorySlug]/[toolSlug] folder) instead of the
      // previous sitewide "/:path*" means those other documents no
      // longer declare themselves cross-origin-isolated for no reason
      // — which is what was putting every no-cors cross-origin embed on
      // them (e.g. the gtag.js analytics script, loaded without a
      // `crossorigin` attribute and without Google guaranteeing a
      // Cross-Origin-Resource-Policy response header) under CORP
      // scrutiny and surfacing as the "Specify a Cross-Origin Resource
      // Policy" DevTools Issue on pages that had no actual need for
      // isolation. Same-origin resources (this site's own /vendor/*
      // engine files, /_next/*, etc.) were never affected by CORP
      // either way — CORP only ever gates cross-origin/cross-site
      // no-cors loads — so nothing here changes how those load.
      {
        source: "/:categorySlug/:toolSlug",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
      {
        source: "/vendor/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;