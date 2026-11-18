import { SITE_ORIGIN } from "./site";

export function canonicalHostRedirects() {
  return ["(?:www\\.)?fitlab\\.dev", "www\\.perceptronlab\\.dev"].map(host => ({
    source: "/:path*",
    has: [{ type: "host" as const, value: host }],
    destination: SITE_ORIGIN + "/:path*",
    permanent: true,
  }));
}
