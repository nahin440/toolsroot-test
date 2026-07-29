import { createRequire } from "module";
import { fileURLToPath } from "url";

const emptyModulePath = fileURLToPath(new URL("./src/lib/empty-module.js", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
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