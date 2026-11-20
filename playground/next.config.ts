import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gallery screenshots are cached by the browser for a year: their URLs carry `?v=<updatedAt>`, so a
  // recaptured screenshot gets a new URL. `private` keeps them out of shared caches (the site is password-gated).
  async headers() {
    return [{ source: "/thumbnails/:path*", headers: [{ key: "Cache-Control", value: "private, max-age=31536000, immutable" }] }];
  },
  // Cache Components is off on purpose: prototypes should not need Suspense boundaries
  // around every params/searchParams read. Turn it on per need, not by default.
  turbopack: {
    // This app sits inside a larger repo with other lockfiles; pin the root to this folder.
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
