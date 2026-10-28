import { expect, test, type Page } from "@playwright/test";
import { FREE_MEMBERSHIP, type PracticeMembership } from "../lib/membership";
import { catalog, getActivity } from "../lib/practice-bank/catalog.mjs";
import { waitForAccountReady } from "./helpers/account-backend";

const paid = (): PracticeMembership => ({ practiceAccess: true, plan: "practice", status: "active", validUntil: Math.floor(Date.now() / 1000) + 86400 });
function deferred() { let resolve!: () => void; const promise = new Promise<void>(done => { resolve = done; }); return { promise, resolve }; }

async function billingService(page: Page, initialUser: string | null = "alice") {
  const state = {
    user: initialUser,
    membership: { alice: { ...FREE_MEMBERSHIP }, bob: { ...FREE_MEMBERSHIP } } as Record<string, PracticeMembership>,
    configured: true, checkoutAvailable: true, portalAvailable: false, responseOwner: null as string | null,
    billingDelay: null as Promise<void> | null, checkoutDelay: null as Promise<void> | null,
    checkoutUrl: "https://checkout.stripe.com/c/pay/cs_test_browser_fixture",
    portalUrl: "https://billing.stripe.com/p/session/browser_fixture",
    billingOwners: [] as string[], practiceLoads: [] as string[], denyPractice: false,
    actions: [] as { owner: string; action: string; body: unknown; origin: string | undefined }[],
  };
  await page.route("https://checkout.stripe.com/**", route => route.fulfill({ contentType: "text/html", body: "<h1>Mock Stripe checkout</h1>" }));
  await page.route("https://billing.stripe.com/**", route => route.fulfill({ contentType: "text/html", body: "<h1>Mock Stripe billing portal</h1>" }));
  await page.route("**/account-api/**", async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    if (path.endsWith("/session")) return route.fulfill({ json: { enabled: true, registrationEnabled: true,
      user: state.user ? { id: state.user, name: state.user, email: null } : null,
      membership: state.user ? state.membership[state.user] ?? FREE_MEMBERSHIP : FREE_MEMBERSHIP } });
    if (path.endsWith("/auth/login") || path.endsWith("/auth/register")) { state.user = "alice"; return route.fulfill({ status: 303, headers: { location: "/account" } }); }
    const owner = request.headers()["x-fitlab-account"];
    if (!state.user || owner !== state.user) return route.fulfill({ status: 409, json: {} });
    if (path.endsWith("/progress")) return route.fulfill({ json: { done: {}, required: {} } });
    if (path.endsWith("/learner-state")) return route.fulfill({ json: request.method() === "GET" ? { records: [], nextCursor: null } : { ...request.postDataJSON(), revision: request.postDataJSON().revision + 1 } });
    if (path.endsWith("/billing")) {
      state.billingOwners.push(owner);
      const snapshot = { account: state.responseOwner ?? owner, configured: state.configured,
        membership: structuredClone(state.membership[owner] ?? FREE_MEMBERSHIP), checkoutAvailable: state.configured && state.checkoutAvailable,
        offers: state.configured ? [{ interval: "monthly", amount: 900, currency: "usd" }, { interval: "annual", amount: 9000, currency: "usd" }] : [],
        portalAvailable: state.portalAvailable };
      if (state.billingDelay) await state.billingDelay;
      return route.fulfill({ json: snapshot });
    }
    if (path.endsWith("/billing/checkout") || path.endsWith("/billing/portal")) {
      const action = path.endsWith("/checkout") ? "checkout" : "portal";
      state.actions.push({ owner, action, body: request.postDataJSON(), origin: request.headers().origin });
      if (action === "checkout" && state.checkoutDelay) await state.checkoutDelay;
      return route.fulfill({ json: { url: action === "checkout" ? state.checkoutUrl : state.portalUrl } });
    }
    return route.fulfill({ status: 404, json: {} });
  });
  await page.route("**/practice-api/**", async route => {
    const request = route.request(); state.practiceLoads.push(request.url());
    if (!state.user) return route.fulfill({ status: 401, json: { error: "Sign in to continue." } });
    if (state.denyPractice || !state.membership[state.user]?.practiceAccess) return route.fulfill({ status: 403, json: { code: "practice_subscription_required", error: "Practice membership is required." } });
    const suffix = new URL(request.url()).pathname.slice("/practice-api/".length);
    const data = suffix === "catalog" ? catalog : getActivity(decodeURIComponent(suffix.slice("activity/".length)));
    return route.fulfill({ json: { account: state.user, data } });
  });
  return state;
}

test("guests sign in before billing loads and return to membership without purchasing", async ({ page }) => {
  const state = await billingService(page, null);
  await page.goto("/membership");
  await expect(page.getByRole("link", { name: "Sign in or create an account", exact: true })).toBeVisible();
  expect(state.billingOwners).toEqual([]); expect(state.practiceLoads).toEqual([]);
  await page.getByRole("link", { name: "Sign in or create an account", exact: true }).click();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/membership$/);
  await expect(page.getByRole("button", { name: "Continue with monthly", exact: true })).toBeVisible();
  expect(state.actions).toEqual([]);
});

test("free accounts keep saving and see verified monthly and annual offers without loading premium data", async ({ page }, info) => {
  const state = await billingService(page);
  await page.goto("/practice"); await waitForAccountReady(page);
  await expect(page.getByText("$9.00", { exact: false })).toBeVisible();
  await expect(page.getByText("$90.00", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with annual", exact: true })).toBeVisible();
  expect(state.practiceLoads).toEqual([]); expect(state.actions).toEqual([]);
  await page.screenshot({ path: info.outputPath("membership-wide.png"), fullPage: true });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const interval of ["monthly", "annual"]) {
      const choice = page.getByRole("button", { name: `Continue with ${interval}`, exact: true });
      await choice.scrollIntoViewIfNeeded();
      const bounds = (await choice.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
      expect(await choice.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.locator("h1")).toBeInViewport();
    await page.screenshot({ path: info.outputPath(`membership-${width}.png`), fullPage: true });
  }
  await page.goto("/account");
  await expect(page.getByText("All work synced", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your free account", exact: true })).toBeVisible();
});

for (const interval of ["monthly", "annual"] as const) test(`the ${interval} choice sends only its interval to authenticated Stripe checkout`, async ({ page }) => {
  const state = await billingService(page);
  await page.goto("/membership");
  const origin = new URL(page.url()).origin;
  await page.getByRole("button", { name: `Continue with ${interval}`, exact: true }).click();
  await expect(page).toHaveURL(state.checkoutUrl);
  expect(state.actions).toEqual([{ owner: "alice", action: "checkout", body: { interval }, origin }]);
  await expect(page.getByRole("heading", { name: "Mock Stripe checkout", exact: true })).toBeVisible();
});

test("unconfigured billing has no purchase controls or invented prices", async ({ page }) => {
  const state = await billingService(page); state.configured = false;
  await page.goto("/membership");
  await expect(page.getByText(/Practice membership cannot be purchased right now/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Continue with/ })).toHaveCount(0);
  await expect(page.getByText(/\$9/)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Continue the free course →", exact: true })).toBeVisible();
  expect(state.actions).toEqual([]);
});

test("an inactive subscription can open its portal without starting another checkout", async ({ page }) => {
  const state = await billingService(page); state.portalAvailable = true; state.checkoutAvailable = false;
  await page.goto("/membership");
  await expect(page.getByText(/Your subscription needs attention/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Continue with/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Manage or cancel membership", exact: true }).click();
  await expect(page).toHaveURL(state.portalUrl);
  expect(state.actions.map(action => [action.action, action.body])).toEqual([["portal", {}]]);
});

test("active membership opens practice while cancellation management keeps saved course work free", async ({ page }) => {
  const state = await billingService(page); state.membership.alice = { ...paid(), validUntil: 4102444800 }; state.portalAvailable = true; state.checkoutAvailable = false;
  await page.goto("/membership");
  await expect(page.getByText("Your practice membership is active.", { exact: true })).toBeVisible();
  await expect(page.getByText("Current paid period ends January 1, 2100 at 12:00 AM UTC.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Continue with/ })).toHaveCount(0);
  await expect(page.getByText(/Your saved course work remains with your free account/)).toBeVisible();
  await page.getByRole("link", { name: "Open extra practice →", exact: true }).click();
  await expect(page.getByText(/3,456 activities across 48 problem families/)).toBeVisible();
});

test("verified existing access remains available when new billing is unconfigured", async ({ page }) => {
  const state = await billingService(page); state.membership.alice = paid(); state.configured = false;
  await page.goto("/membership");
  await expect(page.getByText("Your practice membership is active.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Continue with/ })).toHaveCount(0);
  await page.getByRole("link", { name: "Open extra practice →", exact: true }).click();
  await expect(page.getByText(/3,456 activities across 48 problem families/)).toBeVisible();
});

test("a forged success query does not grant premium access and a 403 becomes the membership gate", async ({ page }) => {
  const state = await billingService(page);
  await page.goto("/practice?billing=success&practiceAccess=true");
  await expect(page.getByRole("button", { name: "Continue with monthly", exact: true })).toBeVisible();
  expect(state.practiceLoads).toEqual([]);
  state.membership.alice = paid(); state.denyPractice = true;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByText("Checking your current practice access.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Check membership status", exact: true })).toBeVisible();
  await expect(page.getByText(/3,456 activities across/)).toHaveCount(0);
});

test("membership status can be refreshed after delayed payment confirmation", async ({ page }) => {
  const state = await billingService(page);
  await page.goto("/membership?billing=success");
  await expect(page.getByRole("button", { name: "Continue with monthly", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open extra practice →", exact: true })).toHaveCount(0);
  state.membership.alice = paid(); state.checkoutAvailable = false;
  await page.getByRole("button", { name: "Check membership status", exact: true }).click();
  await expect(page.getByText("Your practice membership is active.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open extra practice →", exact: true })).toBeVisible();
  expect(state.actions).toEqual([]);
});

test("billing from a different account and an untrusted checkout URL are rejected", async ({ page }) => {
  const state = await billingService(page); state.responseOwner = "bob";
  await page.goto("/membership");
  const panel = page.getByRole("region", { name: "Practice membership", exact: true });
  await expect(panel.getByRole("alert")).toContainText("could not be read for this account");
  await expect(page.getByRole("button", { name: /Continue with/ })).toHaveCount(0);
  state.responseOwner = null; state.checkoutUrl = "https://checkout.stripe.com.example.org/pay";
  await page.getByRole("button", { name: "Try membership details again", exact: true }).click();
  await page.getByRole("button", { name: "Continue with monthly", exact: true }).click();
  await expect(panel.getByRole("alert")).toContainText("payment page could not be verified");
  await expect(page).toHaveURL(/\/membership$/);
});

test("a checkout response for the earlier account cannot redirect the next account", async ({ page }) => {
  const state = await billingService(page), checkout = deferred(); state.checkoutDelay = checkout.promise;
  await page.goto("/membership");
  await page.getByRole("button", { name: "Continue with monthly", exact: true }).click();
  await expect.poll(() => state.actions.length).toBe(1);
  state.user = "bob";
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect.poll(() => state.billingOwners.includes("bob")).toBe(true);
  checkout.resolve();
  await expect(page.getByRole("button", { name: "Continue with annual", exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/membership$/);
  expect(state.actions.map(action => action.owner)).toEqual(["alice"]);
});
