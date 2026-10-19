import { randomBytes } from "node:crypto";
import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { verifiedImageRuntime } from "./scripts/native-image-runtime.mjs";

const nextConfig: NextConfig = {
  // The salt behind the anonymous visitor key in app/site-activity/route.ts.
  // A fresh one is made for every build, so visitor keys cannot be joined
  // across deploys. Only that server route reads it, so it is inlined into the
  // server bundle and never shipped to a browser.
  env: {
    FITLAB_INSIGHTS_SALT: process.env.FITLAB_INSIGHTS_SALT ?? randomBytes(32).toString("hex"),
    // The compute API's address, for app/backend/[...path]/route.ts. Amplify
    // gives its environment variables to the build and not to the running
    // server, so it is fixed here at build, as the rewrite that route replaced
    // fixed it. Empty means the local API on port 8000.
    OOP_ML_API_URL: process.env.OOP_ML_API_URL ?? "",
  },

  // Production source maps are unnecessary for serving lessons and add about
  // 30 MiB to the server output. Keep Amplify's deployment budget for content.
  productionBrowserSourceMaps: false,
  enablePrerenderSourceMaps: false,
  // Pin the workspace root to this repository. Without it Turbopack walks up
  // the tree looking for a lockfile and finds an unrelated one in the home
  // directory, then warns; this repo is self-contained, so its own directory
  // is the root.
  turbopack: {
    root: __dirname,
  },

  // Hosts other than localhost that may load this dev server's own chunks.
  //
  // Next refuses to serve its development JavaScript cross-origin, which is
  // right by default and silently fatal when the site is reached through a
  // tunnel: the page renders, every chunk is refused, and no widget ever
  // fetches anything. Comma separated in OOP_ML_DEV_ORIGINS, empty when unset.
  allowedDevOrigins: (process.env.OOP_ML_DEV_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  experimental: {
    serverSourceMaps: false,
  },

  async redirects() {
    // Resolve this old workshop address before first-visit page generation.
    return [{ source: "/lab/neurons-and-activations", destination: "/lab/neuron", permanent: false }];
  },
};

export default async function config(phase: string): Promise<NextConfig> {
  if (phase !== PHASE_PRODUCTION_BUILD) return nextConfig;
  const nativeImages = await verifiedImageRuntime();
  console.log(`Native image test passed: ${nativeImages.runtime}. Retaining ${nativeImages.keptPackages.join(", ")}.`);
  return {
    ...nextConfig,
    outputFileTracingIncludes: { "/*": nativeImages.includes },
    outputFileTracingExcludes: {
      "/*": nativeImages.excludes,
      // The Next server's own trace is separate from individual route traces.
      "next-server": nativeImages.excludes,
    },
  };
}
