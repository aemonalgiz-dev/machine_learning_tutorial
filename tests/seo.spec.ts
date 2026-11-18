import { expect, test } from "@playwright/test";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import { canonicalHostRedirects } from "../lib/seo-redirects";
import sitemap from "../app/sitemap";
import robots from "../app/robots";
import { canonicalUrl, pageMetadata, websiteStructuredData } from "../lib/seo";
import { publicSitePaths } from "../lib/seo-routes";
import { SITE_NAME, SITE_ORIGIN } from "../lib/site";
import { CURRICULUM } from "../lib/curriculum";
import { courseSectionHref, lessonHrefs } from "../lib/course-navigation";

test("SEO contract: canonicals use the production origin without private queries or fragments", () => {
  expect(canonicalUrl("/sections/agents?source=bookmark#tools")).toBe(SITE_ORIGIN + "/sections/agents");
  expect(canonicalUrl("/")).toBe(SITE_ORIGIN + "/");
  expect(canonicalUrl("/concepts/centring-on-the-mean")).toBe(SITE_ORIGIN + "/concepts/centring-on-the-mean");
  for (const invalid of ["https://www.fitlab.dev/sections/agents", "//other.example/path", "/\\other.example/path"]) {
    expect(() => canonicalUrl(invalid)).toThrow();
  }
});

test("SEO contract: each page keeps its own metadata and canonical social URL", () => {
  const metadata = pageMetadata("/sections/agents", {
    title: "AI Agents · Perceptron Lab",
    description: "The agent section description.",
    robots: { index: false, follow: true },
    openGraph: { images: [{ url: "/custom.png" }] },
  });
  expect(metadata.title).toBe("AI Agents · Perceptron Lab");
  expect(metadata.description).toBe("The agent section description.");
  expect(metadata.robots).toEqual({ index: false, follow: true });
  expect(metadata.alternates?.canonical).toBe(SITE_ORIGIN + "/sections/agents");
  expect(metadata.openGraph).toMatchObject({
    url: SITE_ORIGIN + "/sections/agents", siteName: SITE_NAME,
    title: "AI Agents · Perceptron Lab", images: [{ url: "/custom.png" }],
  });
});

test("SEO contract: the sitemap includes every published lesson and section only once", () => {
  const entries = sitemap(), urls = new Set(entries.map(entry => entry.url));
  expect(urls.size).toBe(entries.length);
  for (const section of CURRICULUM) {
    expect(urls.has(canonicalUrl(courseSectionHref(section)))).toBe(true);
    for (const lesson of lessonHrefs(section)) expect(urls.has(canonicalUrl(lesson))).toBe(true);
  }
  expect(urls.has(canonicalUrl("/sections/agents"))).toBe(true);
  expect(urls.has(canonicalUrl("/lab/neuron"))).toBe(true);
  expect(urls.has(canonicalUrl("/lab/neurons-and-activations"))).toBe(false);
  for (const entry of entries) {
    const url = new URL(entry.url);
    expect(url.origin).toBe(SITE_ORIGIN);
    expect(url.search + url.hash).toBe("");
    expect(url.pathname).not.toMatch(/^\/(?:account|account-api|backend|search)(?:\/|$)/);
    expect(url.pathname).not.toMatch(/^\/practice\//);
    expect(url.pathname).not.toBe("/lab/neuron/bench");
    expect(entry.lastModified).toBeUndefined();
  }
  expect(publicSitePaths()).toEqual([...publicSitePaths()].sort());
});

test("SEO contract: robots allows the public course and advertises the canonical sitemap", () => {
  const policy = robots();
  expect(policy.sitemap).toBe(SITE_ORIGIN + "/sitemap.xml");
  expect(policy.rules).toEqual({
    userAgent: "*", allow: "/", disallow: ["/account-api/", "/backend/", "/site-activity"],
  });
});

test("SEO contract: the homepage identifies the current website name", () => {
  expect(websiteStructuredData).toMatchObject({
    "@context": "https://schema.org", "@type": "WebSite",
    name: "Perceptron Lab", url: SITE_ORIGIN + "/",
  });
  expect(JSON.stringify(websiteStructuredData)).not.toMatch(/fitlab\.dev|FitLab/);
});

test("SEO contract: native page metadata declares its own path rather than inheriting the homepage", async () => {
  async function pages(folder: string): Promise<string[]> {
    const found: string[] = [];
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const name = path.join(folder, entry.name);
      if (entry.isDirectory()) found.push(...await pages(name));
      else if (entry.name === "page.tsx") found.push(name);
    }
    return found;
  }
  let checked = 0;
  for (const file of await pages("app")) {
    const route = path.dirname(file).replaceAll("\\", "/").replace(/^app/, "") || "/";
    if (route.includes("[") || route === "/account") continue;
    const text = await readFile(file, "utf8");
    const syntax = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const statement = syntax.statements.find(item => ts.isVariableStatement(item)
      && item.declarationList.declarations.some(declaration => declaration.name.getText(syntax) === "metadata"));
    expect(statement, file).toBeTruthy();
    if (!statement || !ts.isVariableStatement(statement)) continue;
    const declaration = statement.declarationList.declarations.find(item => item.name.getText(syntax) === "metadata")!;
    const expression = declaration.initializer;
    expect(expression && ts.isCallExpression(expression), file).toBe(true);
    if (!expression || !ts.isCallExpression(expression)) continue;
    expect(expression.expression.getText(syntax), file).toBe("pageMetadata");
    expect(expression.arguments[0]?.getText(syntax), file).toBe(JSON.stringify(route));
    checked++;
  }
  expect(checked).toBeGreaterThan(100);
});

test("SEO contract: host redirects match only retired or www aliases", () => {
  const redirects = canonicalHostRedirects();
  const hostRules = redirects.filter(rule => rule.has?.some(condition => condition.type === "host"));
  for (const host of ["fitlab.dev", "www.fitlab.dev", "www.perceptronlab.dev"]) {
    const matches = hostRules.filter(rule => rule.has?.some(condition =>
      condition.type === "host" && new RegExp("^(?:" + condition.value + ")$").test(host)));
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({ source: "/:path*", destination: SITE_ORIGIN + "/:path*", permanent: true });
  }
  for (const host of ["localhost", "127.0.0.1", "perceptronlab.dev", "fitlab.dev.other.example"]) {
    expect(hostRules.some(rule => rule.has?.some(condition =>
      condition.type === "host" && new RegExp("^(?:" + condition.value + ")$").test(host)))).toBe(false);
  }
});

test("SEO HTTP: native and generated content emit self-canonicals and matching social URLs", async ({ request }) => {
  for (const pathname of ["/", "/sections/agents", "/learn/mathematics-and-programming", "/concepts/logistic-regression", "/concepts/python-pydantic-models", "/lab/python-fail-fast"]) {
    const response = await request.get(pathname);
    expect(response.status(), pathname).toBe(200);
    const html = await response.text(), url = canonicalUrl(pathname);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    const socialUrl = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
    expect(canonical, pathname).toBeTruthy();
    expect(socialUrl, pathname).toBeTruthy();
    expect(new URL(canonical!).href, pathname).toBe(url);
    expect(new URL(socialUrl!).href, pathname).toBe(url);
    expect(html, pathname).toContain('<meta property="og:site_name" content="Perceptron Lab"');
    if (pathname === "/") {
      const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .map(match => JSON.parse(match[1]));
      expect(blocks.filter(block => block["@type"] === "WebSite")).toEqual([websiteStructuredData]);
    }
  }
});

test("SEO HTTP: sitemap and robots are real public metadata endpoints", async ({ request }) => {
  const xml = await request.get("/sitemap.xml");
  expect(xml.status()).toBe(200);
  expect(xml.headers()["content-type"]).toContain("xml");
  const body = await xml.text();
  expect(body).toContain("<loc>" + SITE_ORIGIN + "/sections/agents</loc>");
  expect(body).not.toContain("fitlab.dev");
  expect(body).not.toContain("<lastmod>");
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("Sitemap: " + SITE_ORIGIN + "/sitemap.xml");
});

test("SEO HTTP: account and internal search pages are not indexing targets", async ({ request }) => {
  for (const pathname of ["/account", "/search?q=attention", "/account/reminders/unsubscribe?token=not-a-real-token"]) {
    const response = await request.get(pathname);
    expect(response.status(), pathname).toBe(200);
    expect(await response.text(), pathname).toMatch(/<meta name="robots" content="[^"]*noindex/);
  }
});

test("SEO HTTP: legacy-host fallback preserves the requested path and query", async ({ request }) => {
  for (const host of ["fitlab.dev", "www.fitlab.dev", "www.perceptronlab.dev"]) {
    const response = await request.get("/sections/agents?source=bookmark", { headers: { Host: host }, maxRedirects: 0 });
    expect(response.status(), host).toBe(308);
    expect(response.headers().location, host).toBe(SITE_ORIGIN + "/sections/agents?source=bookmark");
  }
});
