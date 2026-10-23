import { NextRequest } from "next/server";
import { accountProxy } from "@/lib/server/account-transport";
import { catalog, getActivity } from "@/lib/practice-bank/catalog.mjs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", Vary: "Cookie, X-FitLab-Account", "X-Content-Type-Options": "nosniff" };
export async function GET(request: NextRequest, context: {
    params: Promise<{
        path: string[];
    }>;
}) {
    // The backend validates its opaque session cookie. Browser state and a
    // claimed account ID cannot independently grant access to exercise content.
    const session = await accountProxy(request, { params: Promise.resolve({ path: ["session"] }) });
    if (!session.ok)
        return Response.json({ error: "Account verification is temporarily unavailable." }, { status: 503, headers });
    let identity;
    try {
        identity = await session.json();
    }
    catch {
        return Response.json({ error: "Account verification is temporarily unavailable." }, { status: 503, headers });
    }
    if (!identity.enabled)
        return Response.json({ error: "Accounts are not configured on this server yet." }, { status: 503, headers });
    if (!identity.user || typeof identity.user.id !== "string" || !identity.user.id)
        return Response.json({ error: "Sign in to open account practice." }, { status: 401, headers });
    if (request.headers.get("x-fitlab-account") !== identity.user.id)
        return Response.json({ error: "The signed-in account changed. Check your session and try again." }, { status: 409, headers });
    const parts = (await context.params).path;
    if (!(parts.length === 1 && parts[0] === "catalog") && !(parts.length === 2 && parts[0] === "activity"))
        return Response.json({ error: "Practice not found." }, { status: 404, headers });
    // Exercise definitions stay out of public pages and browser bundles.
    const result = parts[0] === "catalog" ? catalog : getActivity(parts[1]);
    return result ? Response.json({ account: identity.user.id, data: result }, { headers }) : Response.json({ error: "Practice not found." }, { status: 404, headers });
}
