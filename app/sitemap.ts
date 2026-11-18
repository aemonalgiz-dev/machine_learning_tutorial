import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/seo";
import { publicSitePaths } from "@/lib/seo-routes";

export default function sitemap(): MetadataRoute.Sitemap {
  // Omit lastModified until an actual content-modification date is recorded.
  // A new build is not evidence that every lesson changed.
  return publicSitePaths().map(path => ({ url: canonicalUrl(path) }));
}
