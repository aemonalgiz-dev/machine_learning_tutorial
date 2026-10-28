import { test, expect, type Page } from "@playwright/test";

const guestKey = "oop_ml.progress.v1";
const lesson = "/concepts/k-means";
const other = "/concepts/pca";
type Progress = { done: Record<string, string[]>; required: Record<string, number> };
const empty = (): Progress => ({ done: {}, required: {} });

async function accountService(page: Page, initial: string | null = "alice") {
  const service = { user: initial, fail: false, registrationEnabled: true, authFails: true, authRequests: [] as string[], uploads: [] as { user: string; data: Progress }[], records: {} as Record<string, Progress> };
  await page.route("**/account-api/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/session")) return route.fulfill({ json: {
      enabled: true, registrationEnabled: service.registrationEnabled, user: service.user ? { id: service.user, name: service.user, email: null } : null,
    } });
    if (path.endsWith("/auth/login") || path.endsWith("/auth/register")) {
      service.authRequests.push(path);
      const intent = path.endsWith("/register") ? "registration" : "sign-in";
      if (!service.authFails) service.user = "new-learner";
      return route.fulfill({ status: 303, headers: { Location: service.authFails ? `/account?error=${intent}` : "/account" } });
    }
    if (path.endsWith("/auth/logout")) {
      service.user = null;
      return route.fulfill({ json: { signedOut: true, redirect: null } });
    }
    if (path.endsWith("/learner-state")) return route.fulfill({ json: { records: [] } });
    if (path.endsWith("/progress")) {
      if (service.fail) return route.fulfill({ status: 503, json: { detail: "Unavailable" } });
      const user = route.request().headers()["x-fitlab-account"];
      if (user !== service.user) return route.fulfill({ status: 409, json: {} });
      if (route.request().method() === "GET") return route.fulfill({ json: service.records[user] ?? empty() });
      const data = route.request().postDataJSON() as Progress;
      service.uploads.push({ user, data });
      const record = service.records[user] ?? empty();
      for (const [key, sections] of Object.entries(data.done)) record.done[key] = [...new Set([...(record.done[key] ?? []), ...sections])];
      record.required = { ...record.required, ...data.required };
      service.records[user] = record;
      return route.fulfill({ json: record });
    }
    return route.fulfill({ status: 404 });
  });
  return service;
}

test("legacy guest completion is ignored and sign-in stays optional", async ({ page }, testInfo) => {
  const service = await accountService(page, null);
  await page.addInitScript(({ key, lesson }) => localStorage.setItem(key, JSON.stringify({ done: { [lesson]: ["quiz"] }, required: { [lesson]: 1 } })), { key: guestKey, lesson });
  await page.goto("/account");
  await expect(page.getByRole("button", { name: "Create account", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^0 of .* lessons finished$/ })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), guestKey)).toBeNull();
  expect(service.uploads).toHaveLength(0);
  await page.screenshot({ path: testInfo.outputPath("registration-desktop.png"), fullPage: true });
});

test("account sync hydrates remote completion before uploading and ignores legacy guest results", async ({ page }) => {
  const service = await accountService(page);
  service.records.alice = { done: { [other]: ["practice"] }, required: { [other]: 1 } };
  await page.addInitScript(({ key, lesson }) => localStorage.setItem(key, JSON.stringify({ done: { [lesson]: ["quiz"] }, required: { [lesson]: 1 } })), { key: guestKey, lesson });
  await page.goto("/account");
  await expect(page.getByText("All work synced", { exact: true })).toBeVisible();
  expect(service.records.alice.done[lesson]).toBeUndefined();
  expect(service.uploads[0].data.done[other]).toEqual(["practice"]);
  await expect(page.getByRole("heading", { name: /^1 of .* lessons finished$/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add my guest progress" })).toHaveCount(0);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^0 of .* lessons finished$/ })).toBeVisible();
});

test("registration retry does not restore or import legacy guest work", async ({ page }) => {
  const service = await accountService(page, null);
  const guest = { done: { [lesson]: ["quiz"] }, required: { [lesson]: 1 } };
  await page.goto("/account");
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: guestKey, value: guest });
  await page.reload();
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page).toHaveURL(/\/account\?error=registration$/);
  await expect(page.getByRole("region", { name: "Account", exact: true }).getByRole("alert")).toContainText("We could not finish creating your account.");
  await expect(page.getByRole("region", { name: "Account", exact: true }).getByRole("alert")).toContainText("If you already verified your email, try signing in.");
  expect(await page.evaluate(key => localStorage.getItem(key), guestKey)).toBeNull();
  expect(service.uploads).toHaveLength(0);

  service.authFails = false;
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page.getByText("All work synced", { exact: true })).toBeVisible();
  expect(service.authRequests).toEqual(["/account-api/auth/register", "/account-api/auth/register"]);
  expect(service.records["new-learner"].done).toEqual({});
  await expect(page.getByRole("button", { name: "Add my guest progress" })).toHaveCount(0);
  expect(await page.evaluate(key => localStorage.getItem(key), guestKey)).toBeNull();
});

test("sign-in uses its own route and reports its own failure", async ({ page }) => {
  const service = await accountService(page, null);
  await page.goto("/account");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/account\?error=sign-in$/);
  await expect(page.getByRole("region", { name: "Account", exact: true }).getByRole("alert")).toContainText("We could not finish signing you in.");
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  expect(service.authRequests).toEqual(["/account-api/auth/login"]);
});

test("providers without direct registration keep their sign-in entry", async ({ page }) => {
  const service = await accountService(page, null);
  service.registrationEnabled = false;
  await page.goto("/account");
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create account", exact: true })).toHaveCount(0);
  await expect(page.getByText(/Use your email or username and password/)).toHaveCount(0);
});

test("registration outage leaves the retry controls usable on mobile", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await accountService(page, null);
  await page.goto("/account?error=registration-unavailable");
  await expect(page.getByRole("region", { name: "Account", exact: true }).getByRole("alert")).toContainText("Account registration could not be reached.");
  await expect(page.getByRole("button", { name: "Create account", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("registration-mobile.png"), fullPage: true });
});

test("unknown and inherited error names do not become account messages", async ({ page }) => {
  await accountService(page, null);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const code of ["unknown", "__proto__", "constructor", "toString"]) {
    await page.goto(`/account?error=${encodeURIComponent(code)}`);
    await expect(page.getByRole("button", { name: "Create account", exact: true })).toBeVisible();
    await expect(page.getByRole("region", { name: "Account", exact: true }).getByRole("alert")).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test("a legacy account completion cache waits for hydration before it migrates", async ({ page }) => {
  const service = await accountService(page);
  service.fail = true;
  await page.addInitScript(({ key, lesson }) => localStorage.setItem(key + ":account:alice", JSON.stringify({ done: { [lesson]: ["quiz"] }, required: { [lesson]: 1 } })), { key: guestKey, lesson });
  await page.goto("/account");
  await expect(page.getByText(/Sync will retry/)).toBeVisible();
  await expect(page.getByRole("heading", { name: /^0 of .* lessons finished$/ })).toBeVisible();
  expect(service.uploads).toHaveLength(0);
  expect(await page.evaluate(key => localStorage.getItem(key + ":account:alice"), guestKey)).not.toBeNull();
  service.fail = false;
  await page.getByRole("button", { name: "Sync now" }).click();
  await expect(page.getByText("All work synced", { exact: true })).toBeVisible();
  expect(service.records.alice.done[lesson]).toEqual(["quiz"]);
  expect(await page.evaluate(key => localStorage.getItem(key + ":account:alice"), guestKey)).toBeNull();
});

test("switching accounts does not import the previous user's completion", async ({ page }) => {
  const service = await accountService(page);
  service.records.alice = { done: { [lesson]: ["quiz"] }, required: { [lesson]: 1 } };
  await page.goto("/account");
  await expect(page.getByText("All work synced", { exact: true })).toBeVisible();
  service.user = "bob";
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByText("bob", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^0 of .* lessons finished$/ })).toBeVisible();
  await expect.poll(() => service.uploads.filter(upload => upload.user === "bob").length).toBeGreaterThan(0);
  expect(service.records.bob.done).toEqual({});
});

test("an unavailable backend leaves guest learning available on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/account-api/session", route => route.fulfill({ status: 503, json: {} }));
  await page.goto("/account");
  await expect(page.getByText(/Accounts are temporarily unavailable/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore the course" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("a response from the previous account cannot enter the new account cache", async ({ page }) => {
  let user = "alice";
  let release: () => void = () => {};
  const gate = new Promise<void>(resolve => { release = resolve; });
  let aliceStarted = false;
  await page.route("**/account-api/session", route => route.fulfill({ json: {
    enabled: true, user: { id: user, name: user, email: null },
  } }));
  await page.route("**/account-api/learner-state*", route => route.fulfill({ json: { records: [] } }));
  await page.route("**/account-api/progress", async route => {
    const owner = route.request().headers()["x-fitlab-account"];
    if (owner === "alice") {
      aliceStarted = true;
      await gate;
      await route.fulfill({ json: { done: { [lesson]: ["quiz"] }, required: { [lesson]: 1 } } });
    } else {
      if (route.request().method() === "PUT") expect(route.request().postDataJSON().done).toEqual({});
      await route.fulfill({ json: empty() });
    }
  });
  await page.goto("/account");
  await expect.poll(() => aliceStarted).toBe(true);
  user = "bob";
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByText("bob", { exact: true })).toBeVisible();
  release();
  await expect(page.getByText("All work synced", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^0 of .* lessons finished$/ })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key + ":account:bob"), guestKey)).toBeNull();
});
