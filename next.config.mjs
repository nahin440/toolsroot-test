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
      {
        source: "/:path*",
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