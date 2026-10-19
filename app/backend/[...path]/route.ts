// The compute API, served from this site's own origin under /backend.
//
// The widgets fetch from the browser, so when the site is reached through a
// tunnel or any other host, "localhost:8000" means the visitor's machine
// rather than the one running the API. Answering here fixes that and removes
// the cross-origin question with it, since the browser only ever talks to one
// origin. Set NEXT_PUBLIC_API_BASE_URL to /backend to use it; unset, the site
// calls the API directly, which is what a local developer wants.
//
// A rewrite in next.config.ts used to do this, and it forwarded every request
// header, the reader's account cookies among them, and copied the API's
// Set-Cookie headers back onto this origin. The compute API reads nothing but
// the JSON it is sent, so only the two headers that describe that JSON go out,
// and only the headers a widget can use come back. The static routes beside
// this one (docs, docs/oauth2-redirect, redoc) are matched before this
// catch-all, so the API's interactive documentation is never proxied.
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const FORWARDED_REQUEST_HEADERS = ["content-type", "accept"];
const RETURNED_RESPONSE_HEADERS = ["content-type", "cache-control"];
// Every answer is JSON read by fetch, never a page. Should the API ever send a
// page, these keep it from running anything on this origin.
const headers = { "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox" };
// How long the API may go without sending anything before the request is
// given up. A few pages train several small networks on their first visit
// after the API starts, and asked for together while it is cold they can take
// well over a minute. The API warms those answers as it starts, so this only
// matters in the first minute or two, but that is exactly when a visitor
// arrives after a deploy. It is silence rather than total time, as the
// rewrite's proxyTimeout was, so a long answer that keeps arriving is not cut.
const LONGEST_SILENCE_MS = 120_000;
// A Lambda function URL refuses a request body over 6 MB, so nothing larger
// is worth holding in memory.
const LONGEST_BODY = 6 * 1024 * 1024;

function refused(status: number) {
  return new Response(null, { status, headers: { ...headers, "Cache-Control": "no-store" } });
}

// The whole request body, or null once it passes LONGEST_BODY. It is held
// rather than streamed so the API receives a Content-Length, as it did from
// the browser.
async function boundedBody(request: NextRequest): Promise<Uint8Array | null> {
  const chunks: Uint8Array[] = [];
  const reader = request.body?.getReader();
  let size = 0;
  if (reader) while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.length;
    if (size > LONGEST_BODY) { await reader.cancel(); return null; }
    chunks.push(chunk.value);
  }
  return Buffer.concat(chunks);
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const segments = (await context.params).path;
  // Each segment is encoded again so that a decoded "/", "?" or "#" stays
  // inside its segment, and dot segments are refused so the path cannot climb
  // out of the API's base.
  if (segments.some(segment => segment === "." || segment === "..")) return refused(404);
  const path = segments.map(encodeURIComponent).join("/");
  // next.config.ts fixes this at build, because Amplify gives its environment
  // variables to the build and not to the running server.
  const base = (process.env.OOP_ML_API_URL || "http://localhost:8000").replace(/\/+$/, "");
  const forwarded = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) forwarded.set(name, value);
  }
  let body: Uint8Array | undefined;
  if (request.method === "POST") {
    const bounded = await boundedBody(request);
    if (!bounded) return refused(413);
    body = bounded;
  }
  const silence = new AbortController();
  const timer = setTimeout(() => silence.abort(), LONGEST_SILENCE_MS);
  let upstream: Response;
  try {
    upstream = await fetch(`${base}/${path}${request.nextUrl.search}`, {
      method: request.method, headers: forwarded, body: body as BodyInit | undefined,
      redirect: "manual", cache: "no-store", signal: AbortSignal.any([request.signal, silence.signal]),
    });
  } catch {
    clearTimeout(timer);
    if (silence.signal.aborted) {
      console.error(`fitlab-backend-proxy: the compute API sent nothing for ${LONGEST_SILENCE_MS / 1000} s on ${request.method} /${path}`);
      return refused(504);
    }
    if (!request.signal.aborted) console.error(`fitlab-backend-proxy: the compute API could not be reached for ${request.method} /${path}`);
    return refused(502);
  }
  const returned = new Headers(headers);
  for (const name of RETURNED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) returned.set(name, value);
  }
  if (!upstream.body) {
    clearTimeout(timer);
    return new Response(null, { status: upstream.status, headers: returned });
  }
  // Passed on as it arrives rather than held, so a large answer starts
  // reaching the reader at once. Each piece restarts the silence timer.
  const streamed = upstream.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) { timer.refresh(); controller.enqueue(chunk); },
    flush() { clearTimeout(timer); },
  }));
  return new Response(streamed, { status: upstream.status, headers: returned });
}

export { proxy as GET, proxy as POST };
