import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Low-memory local builds can skip the in-build type check (Next's memory guide) with
  // SKIP_BUILD_TYPECHECK=1, after running `npm run typecheck` on its own. Vercel and CI
  // never set it, so they still type-check.
  typescript: { ignoreBuildErrors: process.env.SKIP_BUILD_TYPECHECK === "1" },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
