import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { NextRequest } from "next/server";
import { GET, PUT, POST } from "../app/account-api/[...path]/route";
import { sign } from "../lib/aws-request-signing";

test("production refuses an HTTP account backend before forwarding session cookies", async () => {
  const environment = process.env as Record<string, string | undefined>;
  const previousUrl = environment.OOP_ML_ACCOUNTS_URL, previousMode = environment.NODE_ENV;
  const originalFetch = globalThis.fetch;
  let contacted = false;
  environment.NODE_ENV = "production";
  environment.OOP_ML_ACCOUNTS_URL = "http://localhost:8001";
  globalThis.fetch = async () => { contacted = true; throw new Error("Unexpected HTTP request"); };
  try {
    const response = await GET(new NextRequest("https://perceptronlab.example/account-api/session", {
      headers: { Cookie: "fitlab_session=must-stay-here" },
    }), { params: Promise.resolve({ path: ["session"] }) });
    expect(response.status).toBe(503);
    expect(contacted).toBe(false);
  } finally {
    globalThis.fetch = originalFetch;
    if (previousUrl === undefined) delete environment.OOP_ML_ACCOUNTS_URL;
    else environment.OOP_ML_ACCOUNTS_URL = previousUrl;
    if (previousMode === undefined) delete environment.NODE_ENV;
    else environment.NODE_ENV = previousMode;
  }
});

test("registration preserves the provider signup redirect and OAuth cookies", async () => {
  const previous = process.env.OOP_ML_ACCOUNTS_URL;
  let calls = 0;
  const server = createServer((request, response) => {
    calls++;
    expect(request.method).toBe("GET");
    expect(request.url).toBe("/auth/register");
    response.writeHead(302, {
      Location: "https://identity.example.test/signup?state=transaction&code_challenge=challenge",
      "Set-Cookie": ["fitlab_oauth=signed-transaction; HttpOnly; SameSite=Lax; Path=/", "old=; Max-Age=0; Path=/"],
    }).end();
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing address");
  process.env.OOP_ML_ACCOUNTS_URL = `http://127.0.0.1:${address.port}`;
  try {
    const response = await GET(new NextRequest("http://localhost:3000/account-api/auth/register"), { params: Promise.resolve({ path: ["auth", "register"] }) });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://identity.example.test/signup?state=transaction&code_challenge=challenge");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.getSetCookie()).toEqual(["fitlab_oauth=signed-transaction; HttpOnly; SameSite=Lax; Path=/", "old=; Max-Age=0; Path=/"]);
    const wrongMethod = await POST(new NextRequest("http://localhost:3000/account-api/auth/register", { method: "POST" }), { params: Promise.resolve({ path: ["auth", "register"] }) });
    expect(wrongMethod.status).toBe(404);
    expect(calls).toBe(1);
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
    if (previous === undefined) delete process.env.OOP_ML_ACCOUNTS_URL;
    else process.env.OOP_ML_ACCOUNTS_URL = previous;
  }
});

test("an unavailable auth service returns learners to the appropriate retry screen", async () => {
  const previous = process.env.OOP_ML_ACCOUNTS_URL;
  const originalFetch = globalThis.fetch;
  try {
    for (const entry of ["register", "login", "callback"] as const) {
      const intent = entry === "register" ? "registration" : "sign-in";
      for (const failure of ["unconfigured", "network", "upstream"] as const) {
        if (failure === "unconfigured") delete process.env.OOP_ML_ACCOUNTS_URL;
        else process.env.OOP_ML_ACCOUNTS_URL = "https://accounts.example.test";
        globalThis.fetch = async () => {
          if (failure !== "upstream") throw new Error("Unavailable");
          return new Response("Provider unavailable", { status: 503, headers: { "Set-Cookie": "fitlab_oauth=; Max-Age=0; Path=/" } });
        };
        const response = await GET(new NextRequest(`http://localhost:3000/account-api/auth/${entry}`), { params: Promise.resolve({ path: ["auth", entry] }) });
        expect(response.status).toBe(303);
        expect(response.headers.get("location")).toBe(`/account?error=${intent}-unavailable`);
        expect(response.headers.get("cache-control")).toBe("no-store");
        if (failure === "upstream") expect(response.headers.getSetCookie()).toEqual(["fitlab_oauth=; Max-Age=0; Path=/"]);
      }
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (previous === undefined) delete process.env.OOP_ML_ACCOUNTS_URL;
    else process.env.OOP_ML_ACCOUNTS_URL = previous;
  }
});

test("unconfigured accounts return a guest session and reject unknown routes", async () => {
  const previous = process.env.OOP_ML_ACCOUNTS_URL;
  delete process.env.OOP_ML_ACCOUNTS_URL;
  try {
    const session = await GET(new NextRequest("http://localhost:3000/account-api/session"), { params: Promise.resolve({ path: ["session"] }) });
    expect(await session.json()).toEqual({ enabled: false, user: null });
    expect(session.headers.get("cache-control")).toBe("no-store");
    const unknown = await GET(new NextRequest("http://localhost:3000/account-api/admin"), { params: Promise.resolve({ path: ["admin"] }) });
    expect(unknown.status).toBe(404);
  } finally {
    if (previous === undefined) delete process.env.OOP_ML_ACCOUNTS_URL;
    else process.env.OOP_ML_ACCOUNTS_URL = previous;
  }
});

test("proxy preserves OAuth redirects and distinct cookies; limits request bodies", async () => {
  const previous = process.env.OOP_ML_ACCOUNTS_URL;
  let calls = 0;
  const server = createServer((request, response) => {
    calls++;
    expect(request.headers.authorization).toBeUndefined();
    expect(request.headers.cookie).toBe("fitlab_session=test");
    response.writeHead(303, {
      Location: "https://identity.example.test/login",
      "Set-Cookie": ["a=one; HttpOnly; Path=/", "b=two; HttpOnly; Path=/"],
    }).end();
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing address");
  process.env.OOP_ML_ACCOUNTS_URL = `http://127.0.0.1:${address.port}`;
  try {
    const response = await GET(new NextRequest("http://localhost:3000/account-api/auth/login", {
      headers: { Cookie: "fitlab_session=test", Authorization: "must-not-forward" },
    }), { params: Promise.resolve({ path: ["auth", "login"] }) });
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://identity.example.test/login");
    expect(response.headers.getSetCookie()).toHaveLength(2);
    const oversized = await PUT(new NextRequest("http://localhost:3000/account-api/progress", {
      method: "PUT", body: "x".repeat(131073),
    }), { params: Promise.resolve({ path: ["progress"] }) });
    expect(oversized.status).toBe(413);
    expect(calls).toBe(1);
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
    if (previous === undefined) delete process.env.OOP_ML_ACCOUNTS_URL;
    else process.env.OOP_ML_ACCOUNTS_URL = previous;
  }
});

const LAMBDA_URL = "https://abc123.lambda-url.us-east-2.on.aws";
const SIGNING_ENVIRONMENT = { AWS_ACCESS_KEY_ID: "ASIAPROXYTEST", AWS_SECRET_ACCESS_KEY: "proxy-test-secret", AWS_SESSION_TOKEN: "proxy-test-session" };
const ACCOUNT_ENVIRONMENT = [
  "OOP_ML_ACCOUNTS_URL", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_SESSION_TOKEN", "AWS_CONTAINER_CREDENTIALS_FULL_URI",
  "AWS_CONTAINER_CREDENTIALS_RELATIVE_URI", "AWS_CONTAINER_AUTHORIZATION_TOKEN", "AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE",
];
type Forwarded = { url: URL; method: string; headers: Headers; body?: Uint8Array };

async function throughProxy(environment: Record<string, string>, upstream: () => Response, run: (sent: Forwarded[], logged: string[]) => Promise<void>) {
  const previous = ACCOUNT_ENVIRONMENT.map(name => [name, process.env[name]] as const);
  const originalFetch = globalThis.fetch, originalError = console.error;
  const sent: Forwarded[] = [], logged: string[] = [];
  for (const name of ACCOUNT_ENVIRONMENT) delete process.env[name];
  Object.assign(process.env, environment);
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    sent.push({ url: new URL(String(input)), method: init?.method ?? "GET", headers: new Headers(init?.headers), body: init?.body as Uint8Array | undefined });
    return upstream();
  };
  console.error = (...values: unknown[]) => { logged.push(values.join(" ")); };
  try {
    await run(sent, logged);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
    for (const [name, value] of previous) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

function resignedAuthorization(forwarded: Forwarded) {
  const header = (name: string) => forwarded.headers.get(name) ?? "";
  return sign({
    method: forwarded.method, path: forwarded.url.pathname, query: forwarded.url.searchParams,
    headers: ["host", "x-amz-content-sha256", "x-amz-date", "x-amz-security-token"].map(name => [name, name === "host" ? forwarded.url.host : header(name)]),
    payloadHash: header("x-amz-content-sha256"), credentials: { accessKeyId: "ASIAPROXYTEST", secretAccessKey: "proxy-test-secret" },
    region: "us-east-2", service: "lambda", amzDate: header("x-amz-date"),
  }).authorization;
}

test("a Lambda function URL backend receives signed requests in canonical form", async () => {
  await throughProxy({ OOP_ML_ACCOUNTS_URL: LAMBDA_URL, ...SIGNING_ENVIRONMENT }, () => new Response(null, { status: 302, headers: { Location: "/account" } }), async sent => {
    const session = await GET(new NextRequest("http://localhost:3000/account-api/session", {
      headers: { Cookie: "fitlab_session=signed", Origin: "http://localhost:3000", Authorization: "must-not-forward" },
    }), { params: Promise.resolve({ path: ["session"] }) });
    expect(session.status).toBe(302);
    const body = '{"completed":["linear-regression"]}';
    await PUT(new NextRequest("http://localhost:3000/account-api/progress", {
      method: "PUT", body, headers: { Cookie: "fitlab_session=signed", "Content-Type": "application/json", "X-FitLab-Account": "1" },
    }), { params: Promise.resolve({ path: ["progress"] }) });
    await GET(new NextRequest("http://localhost:3000/account-api/auth/callback?state=s+t&code=abc&Code=Z"), { params: Promise.resolve({ path: ["auth", "callback"] }) });
    expect(sent.map(entry => entry.url.href)).toEqual([
      `${LAMBDA_URL}/session`, `${LAMBDA_URL}/progress`, `${LAMBDA_URL}/auth/callback?Code=Z&code=abc&state=s%20t`,
    ]);
    for (const forwarded of sent) {
      const date = forwarded.headers.get("x-amz-date") ?? "";
      expect(date).toMatch(/^\d{8}T\d{6}Z$/);
      expect(forwarded.headers.get("x-amz-security-token")).toBe("proxy-test-session");
      expect(forwarded.headers.get("authorization")).toMatch(new RegExp(`^AWS4-HMAC-SHA256 Credential=ASIAPROXYTEST/${date.slice(0, 8)}/us-east-2/lambda/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=[0-9a-f]{64}$`));
      expect(forwarded.headers.get("authorization")).toBe(resignedAuthorization(forwarded));
    }
    expect(sent[0].headers.get("x-amz-content-sha256")).toBe(createHash("sha256").update("").digest("hex"));
    expect(sent[0].headers.get("cookie")).toBe("fitlab_session=signed");
    expect(sent[0].headers.get("origin")).toBe("http://localhost:3000");
    expect(new TextDecoder().decode(sent[1].body)).toBe(body);
    expect(sent[1].headers.get("x-amz-content-sha256")).toBe(createHash("sha256").update(body).digest("hex"));
    expect(sent[1].headers.get("cookie")).toBe("fitlab_session=signed");
    expect(sent[1].headers.get("x-fitlab-account")).toBe("1");
  });
});

test("billing checkout and portal preserve the authenticated account and origin", async () => {
  await throughProxy({ OOP_ML_ACCOUNTS_URL: "https://accounts.example.test" }, () => Response.json({ url: "https://checkout.stripe.com/c/pay/example" }), async sent => {
    await GET(new NextRequest("https://perceptronlab.example/account-api/billing", {
      headers: { Cookie: "fitlab_session=member", "X-FitLab-Account": "alice" },
    }), { params: Promise.resolve({ path: ["billing"] }) });
    for (const path of ["checkout", "portal"]) {
      const body = path === "checkout" ? '{"interval":"annual"}' : "{}";
      const response = await POST(new NextRequest(`https://perceptronlab.example/account-api/billing/${path}`, {
        method: "POST", body, headers: { Cookie: "fitlab_session=member", Origin: "https://perceptronlab.example", "Content-Type": "application/json", "X-FitLab-Account": "alice", Authorization: "caller-secret", "stripe-signature": "caller-signature" },
      }), { params: Promise.resolve({ path: ["billing", path] }) });
      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store");
    }
    expect(sent.map(entry => entry.url.pathname)).toEqual(["/billing", "/billing/checkout", "/billing/portal"]);
    for (const entry of sent) {
      expect(entry.headers.get("cookie")).toBe("fitlab_session=member");
      expect(entry.headers.get("x-fitlab-account")).toBe("alice");
      expect(entry.headers.has("authorization")).toBe(false);
      expect(entry.headers.has("stripe-signature")).toBe(false);
    }
    expect(sent[1].headers.get("origin")).toBe("https://perceptronlab.example");
    expect(new TextDecoder().decode(sent[1].body)).toBe('{"interval":"annual"}');
    const refused = await PUT(new NextRequest("https://perceptronlab.example/account-api/billing", { method: "PUT", body: "{}" }), { params: Promise.resolve({ path: ["billing"] }) });
    expect(refused.status).toBe(404); expect(sent).toHaveLength(3);
  });
});

test("Stripe webhooks retain their signed raw bytes through the private backend proxy", async () => {
  await throughProxy({ OOP_ML_ACCOUNTS_URL: LAMBDA_URL, ...SIGNING_ENVIRONMENT }, () => Response.json({ received: true }), async sent => {
    const body = '{\n  "id": "evt_example", "data": {"note": "Botie café"}\n}\n';
    const response = await POST(new NextRequest("https://perceptronlab.example/account-api/billing/webhook", {
      method: "POST", body, headers: { "Content-Type": "application/json", "stripe-signature": "t=123,v1=signature", Cookie: "must-not-forward", Origin: "https://untrusted.example", "X-FitLab-Account": "forged", Authorization: "must-not-forward" },
    }), { params: Promise.resolve({ path: ["billing", "webhook"] }) });
    expect(response.status).toBe(200); expect(sent).toHaveLength(1);
    const entry = sent[0];
    expect(entry.url.pathname).toBe("/billing/webhook");
    expect(new TextDecoder().decode(entry.body)).toBe(body);
    expect(entry.headers.get("stripe-signature")).toBe("t=123,v1=signature");
    expect(entry.headers.get("x-amz-content-sha256")).toBe(createHash("sha256").update(body).digest("hex"));
    expect(entry.headers.get("authorization")).toBe(resignedAuthorization(entry));
    for (const name of ["cookie", "origin", "x-fitlab-account"]) expect(entry.headers.has(name)).toBe(false);
    const wrongMethod = await GET(new NextRequest("https://perceptronlab.example/account-api/billing/webhook"), { params: Promise.resolve({ path: ["billing", "webhook"] }) });
    expect(wrongMethod.status).toBe(404); expect(sent).toHaveLength(1);
  });
});

test("oversized Stripe webhook bodies never reach the account backend", async () => {
  await throughProxy({ OOP_ML_ACCOUNTS_URL: "https://accounts.example.test" }, () => Response.json({ received: true }), async sent => {
    const response = await POST(new NextRequest("https://perceptronlab.example/account-api/billing/webhook", {
      method: "POST", body: "x".repeat(1048577), headers: { "stripe-signature": "t=123,v1=signature" },
    }), { params: Promise.resolve({ path: ["billing", "webhook"] }) });
    expect(response.status).toBe(413); expect(sent).toHaveLength(0);
  });
});

test("without AWS credentials a Lambda backend is unavailable and never contacted", async () => {
  await throughProxy({ OOP_ML_ACCOUNTS_URL: LAMBDA_URL }, () => new Response(null), async (sent, logged) => {
    const session = await GET(new NextRequest("http://localhost:3000/account-api/session"), { params: Promise.resolve({ path: ["session"] }) });
    expect(session.status).toBe(503);
    const login = await GET(new NextRequest("http://localhost:3000/account-api/auth/login"), { params: Promise.resolve({ path: ["auth", "login"] }) });
    expect(login.status).toBe(303);
    expect(login.headers.get("location")).toBe("/account?error=sign-in-unavailable");
    expect(sent).toHaveLength(0);
    expect(logged).toEqual(Array(2).fill("fitlab-accounts-proxy: no AWS credentials in the server runtime"));
  });
});

test("Lambda's own 403 makes accounts unavailable; the backend's 403 passes through", async () => {
  const refusal = () => Response.json({ Message: "Forbidden" }, { status: 403, headers: { "x-amzn-ErrorType": "AccessDeniedException" } });
  await throughProxy({ OOP_ML_ACCOUNTS_URL: LAMBDA_URL, ...SIGNING_ENVIRONMENT }, refusal, async (sent, logged) => {
    const session = await GET(new NextRequest("http://localhost:3000/account-api/session"), { params: Promise.resolve({ path: ["session"] }) });
    expect(session.status).toBe(503);
    const progress = await PUT(new NextRequest("http://localhost:3000/account-api/progress", { method: "PUT", body: "{}" }), { params: Promise.resolve({ path: ["progress"] }) });
    expect(progress.status).toBe(503);
    const login = await GET(new NextRequest("http://localhost:3000/account-api/auth/login"), { params: Promise.resolve({ path: ["auth", "login"] }) });
    expect(login.status).toBe(303);
    expect(login.headers.get("location")).toBe("/account?error=sign-in-unavailable");
    expect(sent).toHaveLength(3);
    expect(logged).toEqual(Array(3).fill("fitlab-accounts-proxy: Lambda refused the request with 403 AccessDeniedException"));
  });
  const originRefusal = () => Response.json({ detail: "Origin not allowed" }, { status: 403 });
  await throughProxy({ OOP_ML_ACCOUNTS_URL: LAMBDA_URL, ...SIGNING_ENVIRONMENT }, originRefusal, async (_sent, logged) => {
    const session = await GET(new NextRequest("http://localhost:3000/account-api/session"), { params: Promise.resolve({ path: ["session"] }) });
    expect(session.status).toBe(403);
    expect(await session.json()).toEqual({ detail: "Origin not allowed" });
    expect(logged).toHaveLength(0);
  });
});

test("a backend that is not a Lambda function URL is called unsigned, with its query as given", async () => {
  const upstream = () => Response.json({ detail: "refused" }, { status: 403, headers: { "x-amzn-ErrorType": "AccessDeniedException" } });
  await throughProxy({ OOP_ML_ACCOUNTS_URL: "https://accounts.example.test", ...SIGNING_ENVIRONMENT }, upstream, async sent => {
    const session = await GET(new NextRequest("http://localhost:3000/account-api/session?b=2&a=1", {
      headers: { Cookie: "fitlab_session=plain" },
    }), { params: Promise.resolve({ path: ["session"] }) });
    expect(session.status).toBe(403);
    expect(sent[0].url.href).toBe("https://accounts.example.test/session?b=2&a=1");
    expect(sent[0].headers.get("cookie")).toBe("fitlab_session=plain");
    for (const name of ["authorization", "x-amz-date", "x-amz-content-sha256", "x-amz-security-token"]) expect(sent[0].headers.get(name)).toBeNull();
  });
});
