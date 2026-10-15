import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { NextRequest } from "next/server";
import { GET, PUT, POST } from "../app/account-api/[...path]/route";

test("production refuses an HTTP account backend before forwarding session cookies", async () => {
  const environment = process.env as Record<string, string | undefined>;
  const previousUrl = environment.OOP_ML_ACCOUNTS_URL, previousMode = environment.NODE_ENV;
  const originalFetch = globalThis.fetch;
  let contacted = false;
  environment.NODE_ENV = "production";
  environment.OOP_ML_ACCOUNTS_URL = "http://localhost:8001";
  globalThis.fetch = async () => { contacted = true; throw new Error("Unexpected HTTP request"); };
  try {
    const response = await GET(new NextRequest("https://fitlab.example/account-api/session", {
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
