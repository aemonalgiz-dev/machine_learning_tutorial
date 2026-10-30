import { test, expect } from "@playwright/test";
import { execFile, spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { once } from "node:events";
import { createInterface } from "node:readline";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";
import { NextRequest } from "next/server";
import { GET, PUT, POST } from "../app/account-api/[...path]/route";
import { journeyFor } from "../lib/builds/journey";
import { assemble, evaluate, same } from "../lib/builds/engine";
import { TOOLS } from "../lib/builds/tools";
import { workshopRecordKey } from "../lib/builds/workshop-session";
import { fingerprint } from "../lib/learner-state";
import { FREE_MEMBERSHIP } from "../lib/membership";

const root = path.resolve(process.env.FITLAB_BACKEND_PATH ?? "../backend");
const python = process.env.FITLAB_BACKEND_PYTHON ?? path.join(root, ".venv", process.platform === "win32" ? "Scripts/python.exe" : "bin/python");
const harness = path.join(root, "tests", "proxy_harness.py");
const origin = "http://localhost:3000";
const providerOrigin = "https://fitlab-cognito-test.example.test";
let service: ChildProcessWithoutNullStreams;
let previous: string | undefined;
let backend = "";

test.describe("real account backend through the website proxy", () => {
  test.skip(!existsSync(python) || !existsSync(harness), "Requires the private backend checkout and its test dependencies. Set FITLAB_BACKEND_PATH and FITLAB_BACKEND_PYTHON if needed.");

  test.beforeAll(async () => {
    previous = process.env.OOP_ML_ACCOUNTS_URL;
    service = spawn(python, [harness, "--site-origin", origin], {
      cwd: root, windowsHide: true, stdio: "pipe",
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
    });
    // This process has test-only credentials and a disposable database.
    let diagnostics = "";
    service.stderr.on("data", chunk => { diagnostics = (diagnostics + String(chunk)).slice(-4000); });
    backend = await new Promise<string>((resolve, reject) => {
      const lines = createInterface({ input: service.stdout });
      const timeout = setTimeout(() => { lines.close(); reject(new Error(`Backend test harness did not start. ${diagnostics}`)); }, 25_000);
      const fail = (message: string) => { clearTimeout(timeout); lines.close(); reject(new Error(`${message}. ${diagnostics}`)); };
      service.once("error", error => fail(error.message));
      service.once("exit", code => fail(`Backend test harness exited with ${code}`));
      lines.on("line", line => {
        try {
          const ready = JSON.parse(line);
          if (!Number.isInteger(ready.port) || ready.port < 1 || ready.port > 65535 || ready.siteOrigin !== origin) return;
          clearTimeout(timeout); lines.close(); resolve(`http://127.0.0.1:${ready.port}`);
        } catch { /* Only the readiness JSON is part of the harness protocol. */ }
      });
    });
    process.env.OOP_ML_ACCOUNTS_URL = backend;
  });

  test.afterAll(async () => {
    if (previous === undefined) delete process.env.OOP_ML_ACCOUNTS_URL;
    else process.env.OOP_ML_ACCOUNTS_URL = previous;
    if (service && service.exitCode === null) {
      const exited = once(service, "exit");
      service.stdin.end();
      const timeout = setTimeout(() => service.kill(), 5000);
      await exited;
      clearTimeout(timeout);
    }
  });

  function device() {
    const cookies = new Map<string, string>();
    let account: string | undefined;
    async function request(method: "GET" | "PUT" | "POST", endpoint: string, value?: unknown, overrides?: HeadersInit) {
      const headers = new Headers(overrides);
      if (method !== "GET" && !headers.has("origin")) headers.set("origin", origin);
      if (account && !headers.has("x-fitlab-account")) headers.set("x-fitlab-account", account);
      if (cookies.size) headers.set("cookie", [...cookies].map(([key, value]) => `${key}=${value}`).join("; "));
      if (value !== undefined) headers.set("content-type", "application/json");
      const url = new URL(`/account-api/${endpoint}`, origin);
      const response = await ({ GET, PUT, POST })[method](new NextRequest(url, {
        method, headers, ...(value === undefined ? {} : { body: JSON.stringify(value) }),
      }), { params: Promise.resolve({ path: url.pathname.slice("/account-api/".length).split("/") }) });
      for (const cookie of response.headers.getSetCookie()) {
        const pair = cookie.split(";", 1)[0], equals = pair.indexOf("=");
        const key = pair.slice(0, equals), value = pair.slice(equals + 1);
        if (/max-age=0(?:;|$)/i.test(cookie)) cookies.delete(key);
        else cookies.set(key, value);
      }
      return response;
    }
    async function beginAuthorization(registration = false) {
      const login = await request("GET", registration ? "auth/register" : "auth/login");
      expect(login.status).toBe(302);
      const authorize = new URL(login.headers.get("location")!);
      expect(authorize.origin).toBe(providerOrigin);
      expect(authorize.pathname).toBe(registration ? "/signup" : "/oauth2/authorize");
      expect(authorize.searchParams.get("client_id")).toBe("fitlab-proxy-test");
      expect(authorize.searchParams.get("redirect_uri")).toBe(`${origin}/account-api/auth/callback`);
      expect(authorize.searchParams.get("response_type")).toBe("code");
      expect(authorize.searchParams.get("code_challenge_method")).toBe("S256");
      expect(authorize.searchParams.get("code_challenge")).toMatch(/^[\w-]{43}$/);
      expect(authorize.searchParams.get("nonce")).toBeTruthy();
      expect(authorize.searchParams.get("state")).toBeTruthy();
      expect(authorize.searchParams.get("prompt")).toBe("login");
      expect(login.headers.getSetCookie().some(cookie => cookie.startsWith("fitlab_oauth=") && /HttpOnly/i.test(cookie))).toBe(true);
      return authorize;
    }
    async function completeAuthorization(authorize: URL, subject: string) {
      // Only this disposable test provider is mapped to loopback. The application
      // validates matching HTTPS origins before returning either provider URL.
      expect(authorize.origin).toBe(providerOrigin);
      expect(["/signup", "/oauth2/authorize"]).toContain(authorize.pathname);
      const localProvider = new URL(authorize.pathname + authorize.search, backend);
      localProvider.searchParams.set("subject", subject);
      const provider = await fetch(localProvider, { redirect: "manual" });
      expect([302, 303]).toContain(provider.status);
      const callback = new URL(provider.headers.get("location")!);
      expect(callback.origin).toBe(origin);
      expect(callback.pathname).toBe("/account-api/auth/callback");
      expect(callback.searchParams.get("state")).toBe(authorize.searchParams.get("state"));
      return request("GET", `auth/callback${callback.search}`);
    }
    async function authenticate(subject: string, registration = false) {
      const authorize = await beginAuthorization(registration);
      const complete = await completeAuthorization(authorize, subject);
      expect(complete.status).toBe(303);
      expect(complete.headers.get("location")).toBe(`${origin}/account`);
      const session = await request("GET", "session");
      const result = await session.json();
      expect(result.enabled).toBe(true);
      expect(result.registrationEnabled).toBe(true);
      expect(result.user.name).toBe(subject);
      account = result.user.id;
      return account;
    }
    return {
      request, beginAuthorization, completeAuthorization,
      signIn: (subject: string) => authenticate(subject),
      register: (subject: string) => authenticate(subject, true),
    };
  }

  test("connection diagnostic reaches the real service without exposing configuration", async () => {
    const result = await promisify(execFile)(process.execPath, ["scripts/check-account-backend.mjs"], {
      cwd: path.resolve("."), windowsHide: true, env: process.env, timeout: 25_000,
    });
    expect(result.stdout).toContain("PASS: account backend and database connection.");
    expect(result.stdout).toContain("PASS: backend session endpoint.");
    expect(result.stdout).not.toContain(backend);
    expect(result.stderr).not.toContain(backend);
  });

  test("Cognito registration creates an account whose saved work survives logout and sign-in", async () => {
    const newcomer = device();
    expect(await (await newcomer.request("GET", "session")).json()).toEqual({ enabled: true, registrationEnabled: true, membership: FREE_MEMBERSHIP, user: null });
    expect((await newcomer.request("GET", "learner-state")).status).toBe(401);
    const account = await newcomer.register("new-learner");
    const session = await (await newcomer.request("GET", "session")).json();
    expect(session.user.email).toBe("new-learner@example.test");
    expect(await (await newcomer.request("GET", "learner-state")).json()).toEqual({ records: [] });
    const record = {
      key: "practice:/primers/statistics:registration",
      value: { card: 0, attempts: [{ code: "import numpy as np\ncounts = np.array([28, 36, 32])\nprint(counts.mean())", solved: true, hintsShown: 0, solutionShown: false }] },
    };
    const saved = await newcomer.request("PUT", "learner-state", { ...record, revision: 0, mutationId: randomUUID() });
    expect(saved.status).toBe(200);
    expect((await saved.json()).revision).toBe(1);
    const logout = await newcomer.request("POST", "auth/logout");
    expect(logout.status).toBe(200);
    const signedOut = await logout.json();
    expect(signedOut.signedOut).toBe(true);
    const destination = new URL(signedOut.redirect);
    expect(destination.origin).toBe(providerOrigin);
    expect(destination.pathname).toBe("/logout");
    expect(destination.searchParams.get("logout_uri")).toBe(`${origin}/account`);
    expect((await newcomer.request("GET", "learner-state")).status).toBe(401);

    const returning = device();
    expect(await returning.signIn("new-learner")).toBe(account);
    const restored = await (await returning.request("GET", "learner-state")).json();
    expect(restored.records).toHaveLength(1);
    expect(restored.records[0]).toMatchObject({ ...record, revision: 1 });
  });

  test("registration rejects a callback from another browser and a changed PKCE challenge", async () => {
    const first = device(), unrelated = device();
    const pending = await first.beginAuthorization(true);
    const wrongBrowser = await unrelated.completeAuthorization(pending, "new-learner");
    expect(wrongBrowser.status).toBe(303);
    expect(wrongBrowser.headers.get("location")).toBe(`${origin}/account?error=sign-in`);
    expect((await (await unrelated.request("GET", "session")).json()).user).toBeNull();

    const tampered = await first.beginAuthorization(true);
    tampered.searchParams.set("code_challenge", "A".repeat(43));
    const rejected = await first.completeAuthorization(tampered, "new-learner");
    expect(rejected.status).toBe(303);
    expect(rejected.headers.get("location")).toBe(`${origin}/account?error=registration`);
    expect((await (await first.request("GET", "session")).json()).user).toBeNull();
    expect((await first.request("GET", "learner-state")).status).toBe(401);
  });

  test("journey, quiz and Python work restore after a new authenticated session", async () => {
    const first = device();
    const account = await first.signIn("alice");
    const data = journeyFor("statistics");
    const graph = assemble(data.build.recipe, TOOLS);
    const version = fingerprint({ recipe: data.build.recipe, cases: data.build.cases });
    const records = [
      { key: `journey-path:statistics:${version}:v1`, value: { stage: "investigation", graph, built: true, varied: false, supported: false, explanation: "The shorter report needs its own count of weeks." } },
      { key: `journey-question:statistics:${fingerprint(data.plan!.investigation)}`, value: { prediction: "32", committedPrediction: "32", choice: -1, committedChoice: -1, revealed: true, explored: true } },
      { key: workshopRecordKey(data.build, `journey-statistics-${version}-construction-case-${data.plan!.investigation.caseIndex}`), value: { graph, undo: [], redo: [], caseIndex: 0, results: { 0: true, 1: true }, hintsShown: 0, example: false } },
      { key: "quiz:/primers/statistics:questions-on-sections-1-to-5:integration", value: { card: 1, attempts: [{ picked: [2], answered: true }, { picked: [], answered: false }] } },
      { key: "practice:/primers/statistics:integration", value: { card: 0, attempts: [{ code: "import numpy as np\ncounts = np.array([28, 36, 32])\nprint(np.sum(counts) / counts.size)", solved: true, hintsShown: 1, solutionShown: false }] } },
    ];
    for (const record of records) {
      const response = await first.request("PUT", "learner-state", { ...record, revision: 0, mutationId: randomUUID() });
      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect((await response.json()).revision).toBe(1);
    }
    const progress = { done: { "/primers/statistics": ["questions-on-sections-1-to-5"] }, required: { "/primers/statistics": 3 } };
    expect((await first.request("PUT", "progress", progress)).status).toBe(200);
    expect((await first.request("POST", "auth/logout")).status).toBe(200);
    expect((await first.request("GET", "learner-state")).status).toBe(401);

    const fresh = device();
    expect(await fresh.signIn("alice")).toBe(account);
    const restored = await (await fresh.request("GET", "learner-state")).json();
    expect(restored.records).toHaveLength(records.length);
    for (const record of records) expect(restored.records.find((entry: { key: string }) => entry.key === record.key)?.value).toEqual(record.value);
    const restoredGraph = restored.records.find((entry: { key: string }) => entry.key === records[0].key).value.graph;
    for (const example of data.build.cases) expect(same(evaluate(restoredGraph, example.data, TOOLS).output, example.expected)).toBe(true);
    expect(await (await fresh.request("GET", "progress")).json()).toEqual(progress);
  });

  test("the real proxy preserves conflict responses and account boundaries", async () => {
    const one = device(), two = device(), other = device();
    const owner = await one.signIn("alice");
    expect(await two.signIn("alice")).toBe(owner);
    const key = "journey-question:bagging:integration";
    const incoming = { key, value: { committedChoice: 1, revealed: true }, revision: 0, mutationId: randomUUID() };
    const saved = await (await one.request("PUT", "learner-state", incoming)).json();
    expect(saved.revision).toBe(1);
    expect(await (await one.request("PUT", "learner-state", incoming)).json()).toEqual(saved);
    const conflict = await two.request("PUT", "learner-state", { ...incoming, mutationId: randomUUID(), value: { committedChoice: 0, revealed: true } });
    expect(conflict.status).toBe(409);
    expect((await conflict.json()).current).toEqual(saved);
    expect((await one.request("PUT", "learner-state", incoming, { Origin: "https://unrelated.example" })).status).toBe(403);
    await other.signIn("bob");
    expect(await (await other.request("GET", "learner-state")).json()).toEqual({ records: [] });
    expect((await other.request("GET", "learner-state", undefined, { "X-FitLab-Account": owner! })).status).toBe(409);
    expect((await one.request("POST", "auth/logout")).status).toBe(200);
    expect((await one.request("GET", "learner-state")).status).toBe(401);
    expect((await two.request("GET", "learner-state")).status).toBe(200);
  });
});
