import { expect, test } from "@playwright/test";
import type { SavedRecord } from "../lib/learner-state";

const intro = "Start by connecting something";
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(done => { resolve = done; });
  return { promise, resolve };
}
function recent(title: string, id: string): SavedRecord {
  return { key: "journey-recent:v1", revision: 1, mutationId: `saved-${id}`, value: {
    id, title, href: `/lab/${id}`, stage: "Construction", lastVisitedAt: Date.now(),
  } };
}

test("a new guest sees the introduction and building replaces it with their saved workshop", async ({ page, context }) => {
  await context.route("**/account-api/session", route => route.fulfill({ json: { enabled: false, user: null } }));
  await page.goto("/lab");
  await expect(page.getByRole("heading", { name: intro, exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Continue with Botie", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Build your first machine →", exact: true })).toHaveAttribute("href", "/lab/workshop-guide");

  await page.goto("/lab/statistics");
  await page.getByRole("button", { name: "Deaths recorded each week", exact: true }).click();
  await page.goto("/lab");
  await expect(page.getByRole("heading", { name: "Continue with Botie", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: intro, exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Return to your workshop →", exact: true })).toHaveAttribute("href", "/lab/statistics");
  await expect(page.getByRole("link", { name: "Workshop controls guide", exact: true })).toHaveAttribute("href", "/lab/workshop-guide");
  await page.screenshot({ path: "page_feedback/workshop-returning-learner.png" });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Continue with Botie", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to your workshop →", exact: true })).toHaveAttribute("href", "/lab/statistics");
});

test("delayed account work never flashes a new-user introduction or another account's workshop", async ({ page, context }) => {
  let user = "alice";
  const session = deferred();
  let work = deferred();
  let workRequested = deferred();
  const records: Record<string, SavedRecord[]> = {
    alice: [recent("Alice's city records", "statistics")],
    bob: [recent("Bob's customer bills", "linear-algebra")],
    carol: [],
  };
  await context.route("**/account-api/**", async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    if (path.endsWith("/session")) {
      await session.promise;
      return route.fulfill({ json: { enabled: true, user: { id: user, name: user, email: null } } });
    }
    const owner = request.headers()["x-fitlab-account"];
    if (owner !== user) return route.fulfill({ status: 409, json: {} });
    if (path.endsWith("/progress")) return route.fulfill({ json: request.postDataJSON() });
    if (path.endsWith("/learner-state")) {
      if (request.method() === "GET") {
        workRequested.resolve();
        await work.promise;
        return route.fulfill({ json: { records: records[owner] ?? [] } });
      }
      const sent = request.postDataJSON() as SavedRecord;
      return route.fulfill({ json: { ...sent, revision: sent.revision + 1 } });
    }
    return route.fulfill({ status: 404, json: {} });
  });
  await page.addInitScript(guest => {
    const storage = `fitlab.learning.v1:guest:${guest.key}`;
    localStorage.setItem(storage, JSON.stringify({ ...guest, dirty: false }));
    const state = window as typeof window & { introObserved?: boolean };
    state.introObserved = false;
    new MutationObserver(() => {
      if (document.getElementById("start-workshop")) state.introObserved = true;
    }).observe(document, { childList: true, subtree: true });
  }, recent("Guest's earlier workshop", "attention"));

  await page.goto("/lab");
  await expect(page.getByRole("heading", { name: "Botie's workshop", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: intro, exact: true })).toHaveCount(0);
  await expect(page.getByText("Guest's earlier workshop", { exact: true })).toHaveCount(0);
  session.resolve();
  await workRequested.promise;
  await expect(page.getByRole("heading", { name: intro, exact: true })).toHaveCount(0);
  work.resolve();
  await expect(page.getByText("Alice's city records", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as typeof window & { introObserved?: boolean }).introObserved)).toBe(false);

  user = "bob";
  work = deferred(); workRequested = deferred();
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await workRequested.promise;
  await expect(page.getByText("Alice's city records", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: intro, exact: true })).toHaveCount(0);
  work.resolve();
  await expect(page.getByText("Bob's customer bills", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as typeof window & { introObserved?: boolean }).introObserved)).toBe(false);

  user = "carol";
  work = deferred(); workRequested = deferred();
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await workRequested.promise;
  await expect(page.getByRole("heading", { name: intro, exact: true })).toHaveCount(0);
  work.resolve();
  await expect(page.getByRole("heading", { name: intro, exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Continue with Botie", exact: true })).toHaveCount(0);
});

for (const failure of ["session", "learner-state"] as const) {
  test(`the introduction stays available without saved work when ${failure} cannot load`, async ({ page, context }) => {
    if (failure === "session") await page.addInitScript(() => {
      sessionStorage.setItem("fitlab.account.last", JSON.stringify({ id: "offline-reader", name: "Reader", email: null }));
    });
    await context.route("**/account-api/**", async route => {
      const request = route.request(), path = new URL(request.url()).pathname;
      if (path.endsWith(`/${failure}`)) return route.fulfill({ status: 503, json: {} });
      if (path.endsWith("/session")) return route.fulfill({ json: { enabled: true, user: { id: "new-reader", name: "Reader", email: null } } });
      if (path.endsWith("/progress")) return route.fulfill({ json: request.postDataJSON() });
      return route.fulfill({ status: 404, json: {} });
    });
    await page.goto("/lab");
    await expect(page.getByRole("heading", { name: intro, exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Build your first machine →", exact: true })).toHaveAttribute("href", "/lab/workshop-guide");
  });
}
