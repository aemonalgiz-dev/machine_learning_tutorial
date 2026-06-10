import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

  // Serve the compute API from this site's own origin, under /backend.
  //
  // The widgets fetch from the browser, so when the site is reached through a
  // tunnel or any other host, "localhost:8000" means the visitor's machine
  // rather than the one running the API. Proxying through the site fixes that
  // and removes the cross-origin question with it, since the browser now only
  // ever talks to one origin. Set NEXT_PUBLIC_API_BASE_URL to /backend to use
  // it; unset, the site still calls the API directly, which is what a local
  // developer wants.
  // How long the /backend proxy waits for an answer before giving up.
  //
  // The default is 30 seconds, and a few pages train several small networks
  // on their first visit after the API starts. Asked for together while cold
  // they can take longer than that, the proxy answers 500 while the API is
  // still working, and the widget reports a failure for a page that is fine.
  // The API warms those answers as it starts, so this only matters in the
  // first minute or two, but that is exactly when a visitor arrives after a
  // deploy.
  experimental: {
    proxyTimeout: 120_000,
  },

  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${process.env.OOP_ML_API_URL ?? "http://localhost:8000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
