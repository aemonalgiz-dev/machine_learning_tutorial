// Receives reading activity from instrumentation-client.ts and writes it as one
// log line per event. Amplify sends this server's output to the CloudWatch log
// group the Perceptron Lab dashboard queries, so the log line is the whole record.
// app/privacy/page.tsx tells readers what is kept, and must change with this.
//
// What is kept is deliberately small: the path without its query, the
// referring site's host name, a device class, the country CloudFront reports,
// and two keys. The visitor key is a hash of the connection's address and
// browser with the day and a salt; the visit key is a hash of the tab's random
// visit id with the same day and salt. Both change at UTC midnight, and the
// salt changes with every build, so neither can be followed from one day to
// the next. The cost of that is a reader active both before and after a
// deploy counts as two visitors that day. No address, browser string or cookie
// is stored.

import { createHash } from "node:crypto";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const LONGEST_BODY = 1024;
const LONGEST_REPORT_MS = 30 * 60_000;
// "bot/" and "bot;" catch Googlebot/2.1 and friends without catching phone
// models such as the Cubot, whose name merely ends in those letters.
const BOTS =
  /bot\/|bot;|\bbot\b|crawl|spider|slurp|facebookexternalhit|headless|lighthouse|preview|monitor|curl|wget|python-|httpclient/i;
const SALT = process.env.FITLAB_INSIGHTS_SALT ?? "";

function done() {
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

function token(value: unknown, pattern: RegExp, longest: number): string {
  if (typeof value !== "string" || value.length === 0 || value.length > longest || !pattern.test(value)) return "-";
  return value;
}

function keyed(...parts: string[]): string {
  return createHash("sha256").update([SALT, ...parts].join("|")).digest("hex").slice(0, 16);
}

function deviceClass(userAgent: string, width: unknown, touch: unknown): string {
  if (/ipad|tablet|kindle|silk/i.test(userAgent)) return "tablet";
  // iPadOS asks for desktop pages with a Mac user agent; only the iPad has touch.
  if (/macintosh/i.test(userAgent) && touch === true) return "tablet";
  if (/android/i.test(userAgent) && !/mobile/i.test(userAgent)) return "tablet";
  if (/mobi|iphone|android/i.test(userAgent)) return "mobile";
  if (touch === true && typeof width === "number" && width > 0 && width < 768) return "mobile";
  return "desktop";
}

// CloudFront's own record of the connection, with the port removed, is
// preferred to X-Forwarded-For, whose first entry the client can write.
function connectionAddress(request: NextRequest): string {
  const viewer = request.headers.get("cloudfront-viewer-address");
  if (viewer) return viewer.slice(0, viewer.lastIndexOf(":") > 0 ? viewer.lastIndexOf(":") : undefined);
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
}

export async function POST(request: NextRequest) {
  try {
    if (request.headers.get("sec-gpc") === "1" || request.headers.get("dnt") === "1") return done();
    const site = request.headers.get("sec-fetch-site");
    if (site && site !== "same-origin") return done();
    const userAgent = request.headers.get("user-agent") ?? "";
    if (!userAgent || BOTS.test(userAgent)) return done();
    if (Number(request.headers.get("content-length") ?? 0) > LONGEST_BODY) return done();

    const text = await request.text();
    if (text.length > LONGEST_BODY) return done();
    const report = JSON.parse(text) as Record<string, unknown>;

    const kind = report.kind;
    if (kind !== "view" && kind !== "time" && kind !== "finish") return done();
    const path = token(report.path, /^\/[A-Za-z0-9/_.\-]*$/, 200);
    if (path === "-") return done();
    const ms = kind === "time" && typeof report.ms === "number" && Number.isFinite(report.ms)
      ? Math.max(0, Math.min(Math.round(report.ms), LONGEST_REPORT_MS))
      : 0;
    if (kind === "time" && ms === 0) return done();
    const referrer = kind === "view" ? token(report.referrer, /^[a-z0-9.\-]+$/, 100) : "-";
    const section = kind === "finish" ? token(report.section, /^[A-Za-z0-9_.\-]+$/, 80) : "-";

    const day = new Date().toISOString().slice(0, 10);
    const visitor = keyed(day, connectionAddress(request), userAgent);
    const visitId = token(report.visit, /^[0-9a-f-]{36}$/, 36);
    const visit = visitId === "-" ? "-" : keyed(day, "visit", visitId);
    const country = token(request.headers.get("cloudfront-viewer-country") ?? undefined, /^[A-Z]{2}$/, 2);
    const device = deviceClass(userAgent, report.width, report.touch);

    console.log(
      `fitlab-activity v=1 kind=${kind} path=${path} visitor=${visitor} visit=${visit} ms=${ms} ` +
        `device=${device} country=${country} referrer=${referrer} section=${section}`,
    );
  } catch {
    // A malformed report is dropped; the reader never sees an error from this.
  }
  return done();
}
