import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_ORIGIN, SITE_SOCIAL } from "./site";

/** Canonicals describe a public path, never the current host or a reader's query. */
export function canonicalUrl(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) throw Error("Use a site-relative canonical path.");
  const url = new URL(path, SITE_ORIGIN);
  if (url.origin !== SITE_ORIGIN) throw Error("Canonical URLs must use the site's production origin.");
  url.search = "";
  url.hash = "";
  return url.href;
}

export function pageMetadata(path: string, metadata: Metadata = {}): Metadata {
  const url = canonicalUrl(path);
  const title = typeof metadata.title === "string" ? { title: metadata.title } : {};
  const description = typeof metadata.description === "string" ? { description: metadata.description } : {};
  return {
    ...metadata,
    alternates: { ...metadata.alternates, canonical: url },
    openGraph: { ...SITE_SOCIAL, ...title, ...description, ...metadata.openGraph, url },
    twitter: { card: "summary_large_image", images: SITE_SOCIAL.images, ...title, ...description, ...metadata.twitter },
  };
}

export const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": canonicalUrl("/") + "#website",
  name: SITE_NAME,
  url: canonicalUrl("/"),
  description: SITE_DESCRIPTION,
  inLanguage: "en-US",
};
