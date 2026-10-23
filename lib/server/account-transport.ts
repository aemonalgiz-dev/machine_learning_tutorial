// Same-origin transport. Authentication and database access live in backend.
import { NextRequest } from "next/server";
import { canonicalQuery, lambdaUrlRegion, runtimeCredentials, signedRequestHeaders } from "@/lib/aws-request-signing";
const routes: Record<string, string[]> = {
    session: ["GET"], progress: ["GET", "PUT"], "learner-state": ["GET", "PUT"],
    "auth/login": ["GET"], "auth/register": ["GET"], "auth/callback": ["GET"], "auth/logout": ["POST"],
};
const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };
function unavailable(path: string) {
    if (["auth/login", "auth/register", "auth/callback"].includes(path)) {
        const intent = path === "auth/register" ? "registration" : "sign-in";
        return new Response(null, { status: 303, headers: { ...headers, Location: `/account?error=${intent}-unavailable` } });
    }
    return Response.json({ detail: "Accounts temporarily unavailable" }, { status: 503, headers });
}
export async function accountProxy(request: NextRequest, context: {
    params: Promise<{
        path: string[];
    }>;
}) {
    const path = (await context.params).path.join("/");
    if (!Object.hasOwn(routes, path) || !routes[path].includes(request.method))
        return new Response(null, { status: 404, headers });
    const base = process.env.OOP_ML_ACCOUNTS_URL?.trim();
    if (!base)
        return path === "session"
            ? Response.json({ enabled: false, user: null }, { headers })
            : unavailable(path);
    try {
        const url = new URL(base);
        if (url.username || url.password || url.search || url.hash || !["http:", "https:"].includes(url.protocol))
            throw new Error("Invalid backend origin");
        if (process.env.NODE_ENV === "production" && url.protocol !== "https:")
            throw new Error("Production backend requires HTTPS");
        // A Lambda function URL with AWS_IAM auth checks a signature over the query it receives, so the query
        // is sent in the canonical form that was signed.
        const region = lambdaUrlRegion(url), query = region ? canonicalQuery(request.nextUrl.searchParams) : "";
        const target = `${base.replace(/\/$/, "")}/${path}${region ? query && `?${query}` : request.nextUrl.search}`;
        const forwarded = new Headers();
        for (const name of ["cookie", "origin", "content-type", "x-fitlab-account"]) {
            const value = request.headers.get(name);
            if (value)
                forwarded.set(name, value);
        }
        let body: Uint8Array | undefined;
        if (request.method !== "GET") {
            const chunks: Uint8Array[] = [];
            const reader = request.body?.getReader();
            let size = 0;
            if (reader)
                while (true) {
                    const chunk = await reader.read();
                    if (chunk.done)
                        break;
                    size += chunk.value.length;
                    if (size > (path === "learner-state" ? 1048576 : 131072)) {
                        await reader.cancel();
                        return new Response(null, { status: 413, headers });
                    }
                    chunks.push(chunk.value);
                }
            body = new Uint8Array(size);
            let offset = 0;
            for (const chunk of chunks) {
                body.set(chunk, offset);
                offset += chunk.length;
            }
        }
        if (region) {
            const credentials = await runtimeCredentials();
            if (!credentials) {
                console.error("fitlab-accounts-proxy: no AWS credentials in the server runtime");
                return unavailable(path);
            }
            const signed = signedRequestHeaders({ method: request.method, url: new URL(target), body, credentials, region, service: "lambda", now: new Date() });
            for (const [name, value] of Object.entries(signed))
                forwarded.set(name, value);
        }
        const upstream = await fetch(target, {
            method: request.method, headers: forwarded, body: body as BodyInit | undefined,
            redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(15000),
        });
        // Lambda's own refusal (a bad signature or a missing permission) carries x-amzn-ErrorType; the backend's does not.
        const refusal = region && upstream.status === 403 ? upstream.headers.get("x-amzn-errortype") : null;
        if (refusal) {
            console.error(`fitlab-accounts-proxy: Lambda refused the request with ${upstream.status} ${refusal}`);
            await upstream.body?.cancel();
            return unavailable(path);
        }
        if (upstream.status >= 400 && ["auth/login", "auth/register", "auth/callback"].includes(path)) {
            const response = unavailable(path);
            for (const cookie of upstream.headers.getSetCookie())
                response.headers.append("set-cookie", cookie);
            await upstream.body?.cancel();
            return response;
        }
        const resultHeaders = new Headers(headers);
        for (const name of ["content-type", "location"]) {
            const value = upstream.headers.get(name);
            if (value)
                resultHeaders.set(name, value);
        }
        for (const cookie of upstream.headers.getSetCookie())
            resultHeaders.append("set-cookie", cookie);
        return new Response(upstream.body, { status: upstream.status, headers: resultHeaders });
    }
    catch {
        return unavailable(path);
    }
}
