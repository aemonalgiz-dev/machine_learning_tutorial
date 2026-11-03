import { test, expect } from "@playwright/test";
import { NextRequest } from "next/server";
import { GET, PUT, POST } from "../app/account-api/[...path]/route";

test("learning endpoints keep authenticated account headers and remain no-store", async () => {
  const previous = process.env.OOP_ML_ACCOUNTS_URL, original = globalThis.fetch;
  process.env.OOP_ML_ACCOUNTS_URL = "https://accounts.example.test";
  const calls: { url: string; headers: Headers; method: string }[] = [];
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), headers: new Headers(init?.headers), method: init?.method ?? "GET" });
    return Response.json({ account: "reader" });
  };
  try {
    for (const [path, method, handler] of [["streak", "GET", GET], ["activity", "POST", POST], ["learning-preferences", "GET", GET], ["learning-preferences", "PUT", PUT]] as const) {
      const response = await handler(new NextRequest(`https://perceptronlab.example/account-api/${path}`, { method,
        headers: { cookie: "session=reader", origin: "https://perceptronlab.example", "x-fitlab-account": "reader", authorization: "must-not-forward" },
        ...(method === "GET" ? {} : { body: "{}" }),
      }), { params: Promise.resolve({ path: [path] }) });
      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store");
    }
    expect(calls).toHaveLength(4);
    for (const call of calls) {
      expect(call.headers.get("cookie")).toBe("session=reader");
      expect(call.headers.get("x-fitlab-account")).toBe("reader");
      expect(call.headers.get("authorization")).toBeNull();
    }
  } finally {
    globalThis.fetch = original;
    if (previous === undefined) delete process.env.OOP_ML_ACCOUNTS_URL; else process.env.OOP_ML_ACCOUNTS_URL = previous;
  }
});

test("unsubscribe transports only its token and explicit confirmation, without account cookies", async () => {
  const previous = process.env.OOP_ML_ACCOUNTS_URL, original = globalThis.fetch;
  process.env.OOP_ML_ACCOUNTS_URL = "https://accounts.example.test";
  const calls: { url: string; headers: Headers; body: string; method: string }[] = [];
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), headers: new Headers(init?.headers), body: init?.body ? new TextDecoder().decode(init.body as Uint8Array) : "", method: init?.method ?? "GET" });
    return Response.json({ ok: true }, { headers: { "Set-Cookie": "must-not-alter-session=1" } });
  };
  try {
    for (const [method, handler] of [["GET", GET], ["POST", POST]] as const) {
      const response = await handler(new NextRequest("https://perceptronlab.example/account-api/reminders/unsubscribe?token=fixture-token", {
        method, headers: { cookie: "session=other-reader", "x-fitlab-account": "other-reader", "content-type": "application/x-www-form-urlencoded" },
        ...(method === "POST" ? { body: "confirm=unsubscribe" } : {}),
      }), { params: Promise.resolve({ path: ["reminders", "unsubscribe"] }) });
      expect(response.status).toBe(200);
      expect(response.headers.getSetCookie()).toEqual([]);
      expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    }
    expect(calls.map(call => call.method)).toEqual(["GET", "POST"]);
    expect(calls.map(call => call.body)).toEqual(["", "confirm=unsubscribe"]);
    for (const call of calls) {
      expect(call.url).toBe("https://accounts.example.test/reminders/unsubscribe?token=fixture-token");
      expect(call.headers.get("cookie")).toBeNull();
      expect(call.headers.get("x-fitlab-account")).toBeNull();
    }
  } finally {
    globalThis.fetch = original;
    if (previous === undefined) delete process.env.OOP_ML_ACCOUNTS_URL; else process.env.OOP_ML_ACCOUNTS_URL = previous;
  }
});

test("public reminder transport rejects oversized requests and unlisted methods before forwarding", async () => {
  const previous = process.env.OOP_ML_ACCOUNTS_URL, original = globalThis.fetch;
  process.env.OOP_ML_ACCOUNTS_URL = "https://accounts.example.test";
  let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({}); };
  const params = { params: Promise.resolve({ path: ["reminders", "unsubscribe"] }) };
  try {
    const query = await GET(new NextRequest(`https://perceptronlab.example/account-api/reminders/unsubscribe?token=${"x".repeat(4097)}`), params);
    expect(query.status).toBe(413);
    const body = await POST(new NextRequest("https://perceptronlab.example/account-api/reminders/unsubscribe", { method: "POST", body: "x".repeat(4097) }), params);
    expect(body.status).toBe(413);
    expect((await PUT(new NextRequest("https://perceptronlab.example/account-api/reminders/unsubscribe", { method: "PUT" }), params)).status).toBe(404);
    expect((await POST(new NextRequest("https://perceptronlab.example/account-api/streak", { method: "POST" }), { params: Promise.resolve({ path: ["streak"] }) })).status).toBe(404);
    expect(calls).toBe(0);
  } finally {
    globalThis.fetch = original;
    if (previous === undefined) delete process.env.OOP_ML_ACCOUNTS_URL; else process.env.OOP_ML_ACCOUNTS_URL = previous;
  }
});
