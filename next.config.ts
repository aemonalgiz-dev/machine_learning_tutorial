import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this repository. Without it Turbopack walks up
  // the tree looking for a lockfile and finds an unrelated one in the home
  // directory, then warns; this repo is self-contained, so its own directory
  // is the root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
