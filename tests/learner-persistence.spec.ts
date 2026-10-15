import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import type { SavedRecord } from "../lib/learner-state";

type Service = { user: string | null; fail: boolean; records: Record<string, Record<string, SavedRecord>>; writes: SavedRecord[] };
const service = (): Service => ({ user: "alice", fail: false, records: {}, writes: [] });

async function connect(context: BrowserContext, remote: Service) {
  await context.route("**/account-api/**", async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    if (remote.fail) return route.fulfill({ status: 503, json: {} });
    if (path.endsWith("/session")) return route.fulfill({ json: { enabled: true, user: remote.user ? { id: remote.user, name: remote.user, email: null } : null } });
    if (!remote.user || request.headers()["x-fitlab-account"] !== remote.user) return route.fulfill({ status: 409, json: {} });
    if (path.endsWith("/progress")) return route.fulfill({ json: request.postDataJSON() });
    if (path.endsWith("/learner-state")) {
      const records = remote.records[remote.user] ??= {};
      if (request.method() === "GET") return route.fulfill({ json: { records: Object.values(records) } });
      const write = request.postDataJSON() as SavedRecord;
      const existing = records[write.key];
      if (existing?.mutationId === write.mutationId) return route.fulfill({ json: existing });
      if ((existing?.revision ?? 0) !== write.revision) return route.fulfill({ status: 409, json: { current: existing } });
      const saved = { ...write, revision: write.revision + 1 };
      records[write.key] = saved; remote.writes.push(saved);
      return route.fulfill({ json: saved });
    }
    return route.fulfill({ status: 404, json: {} });
  });
}

async function ready(page: Page) {
  await page.goto("/account");
  await expect(page.getByText("All work synced", { exact: true })).toBeVisible();
}

async function build(page: Page) {
  await page.goto("/lab/workshop-guide");
  await page.getByRole("navigation", { name: "Workshop introduction" }).getByRole("button", { name: /Build from an empty floor/ }).click();
}

async function openExperiment(page: Page) {
  const controls = page.getByText("Examples, experiments and workspace controls", { exact: true });
  const details = controls.locator("..");
  if (await details.getAttribute("open") === null) await controls.click();
  await page.getByText("Try your own inputs", { exact: true }).click();
}

async function experiment(page: Page) {
  await openExperiment(page);
  await page.getByRole("button", { name: "Experiment with these inputs", exact: true }).click();
}

test("Botie work restores from the backend in a fresh browser and stays separate when accounts change", async ({ page, context, browser }) => {
  const remote = service(); await connect(context, remote); await ready(page); await build(page);
  await page.getByText("Stuck? Inspect a worked construction", { exact: true }).click();
  await page.getByRole("button", { name: "Assemble an example", exact: true }).click();
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await experiment(page);
  await page.getByLabel("My prediction", { exact: true }).fill("My sensor should produce eight.");
  await page.getByLabel("Sensor reading", { exact: true }).fill("4");
  const key = () => Object.keys(remote.records.alice ?? {}).find(key => key.startsWith("workshop:guide:independent-build:"));
  await expect.poll(() => (remote.records.alice?.[key() ?? ""]?.value as { prediction?: string })?.prediction).toBe("My sensor should produce eight.");
  const second = await browser.newContext(); await connect(second, remote); const fresh = await second.newPage();
  try {
    await ready(fresh); await fresh.goto("/lab/workshop-guide");
    await openExperiment(fresh);
    await expect(fresh.getByLabel("My prediction", { exact: true })).toHaveValue("My sensor should produce eight.");
    await expect(fresh.getByLabel("Sensor reading", { exact: true })).toHaveValue("4");
    await expect(fresh.getByTestId("connection-path")).not.toHaveCount(0);
    remote.user = "bob";
    await fresh.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(fresh.getByRole("navigation", { name: "Workshop introduction" }).getByRole("button", { name: /^1\. Connect a wire/ })).toHaveAttribute("aria-current", "step");
    await fresh.getByRole("navigation", { name: "Workshop introduction" }).getByRole("button", { name: /Build from an empty floor/ }).click();
    await expect(fresh.getByTestId("connection-path")).toHaveCount(0);
    expect(JSON.stringify(remote.records.bob ?? {})).not.toContain("My sensor");
  } finally { await second.close(); }
});

test("Python drafts, hints and solution visibility survive a fresh browser", async ({ page, context, browser }) => {
  const remote = service(); await connect(context, remote); await ready(page);
  await page.goto("/concepts/simple-linear-regression#practice");
  await page.locator(".cm-content").fill('print("my account draft")');
  await page.getByRole("button", { name: "Ask Botie for a hint", exact: true }).click();
  await page.getByRole("button", { name: "Show the worked solution", exact: true }).click();
  await expect.poll(() => JSON.stringify(remote.records.alice)).toContain("my account draft");
  await expect.poll(() => JSON.stringify(remote.records.alice)).toContain('"solutionShown":true');
  const second = await browser.newContext(); await connect(second, remote); const fresh = await second.newPage();
  try {
    await ready(fresh); await fresh.goto("/concepts/simple-linear-regression#practice");
    await expect(fresh.locator(".cm-content")).toContainText("my account draft");
    await expect(fresh.getByRole("button", { name: "Hide the worked solution", exact: true })).toBeVisible();
    await expect(fresh.getByLabel("Hints from Botie")).toBeVisible();
  } finally { await second.close(); }
});

test("quiz selections and position restore across devices", async ({ page, context, browser }) => {
  const remote = service(); await connect(context, remote); await ready(page);
  const url = "/concepts/attention#questions-on-parts-1-and-2";
  await page.goto(url);
  await page.getByRole("button", { name: /False/ }).click();
  await expect(page.getByRole("status", { name: "Botie's feedback" })).toBeVisible();
  const answer = await page.getByRole("radiogroup").getByRole("button", { pressed: true }).textContent() ?? "";
  await expect.poll(() => JSON.stringify(remote.records.alice)).toContain('"answered":true');
  const second = await browser.newContext(); await connect(second, remote); const fresh = await second.newPage();
  try {
    await ready(fresh); await fresh.goto(url);
    await expect(fresh.getByRole("status", { name: "Botie's feedback" })).toBeVisible();
    await expect(fresh.getByRole("radiogroup").getByRole("button", { pressed: true })).toHaveText(answer);
    await fresh.getByRole("button", { name: "Next question", exact: true }).click();
    await expect(fresh.getByRole("group", { name: "Data for this question" })).toContainText("Head width = 4");
    await fresh.reload();
    await expect(fresh.getByRole("group", { name: "Data for this question" })).toContainText("Head width = 4");
  } finally { await second.close(); }
});

test("offline workshop edits retry, including edits made before the first remote read", async ({ page, context }) => {
  const remote = service(); await connect(context, remote); await ready(page); remote.fail = true;
  await build(page);
  await experiment(page);
  await page.getByLabel("My prediction", { exact: true }).fill("Offline prediction");
  await expect(page.getByRole("link", { name: "Work needs syncing" })).toBeVisible();
  await page.reload();
  await openExperiment(page);
  await expect(page.getByLabel("My prediction", { exact: true })).toHaveValue("Offline prediction");
  remote.fail = false;
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect.poll(() => JSON.stringify(remote.records.alice)).toContain("Offline prediction");
});

test("another device's conflicting edit is preserved until the learner chooses", async ({ page, context }) => {
  const remote = service(); await connect(context, remote); await ready(page);
  await page.getByRole("button", { name: "Switch to the light theme" }).click();
  await expect.poll(() => remote.records.alice?.["preferences:theme"]?.value).toBe("light");
  remote.fail = true;
  await page.getByRole("button", { name: "Switch to the dark theme" }).click();
  const other = { ...remote.records.alice["preferences:theme"], revision: 2, mutationId: "other-device", value: "light" };
  remote.records.alice["preferences:theme"] = other;
  await expect(page.getByText(/Sync will retry/)).toBeVisible();
  remote.fail = false; await page.getByRole("button", { name: "Sync now" }).click();
  await expect(page.getByRole("heading", { name: "Choose the work to keep" })).toBeVisible();
  expect(remote.records.alice["preferences:theme"]).toEqual(other);
  await page.getByRole("button", { name: "Keep this device’s version" }).click();
  await expect(page.getByText("All work synced", { exact: true })).toBeVisible();
  expect(remote.records.alice["preferences:theme"].value).toBe("dark");
  expect(remote.records.alice["preferences:theme"].revision).toBe(3);
});

test("guest work only imports explicitly and an existing account activity is kept", async ({ page, context }) => {
  const remote = service(); remote.user = null; await connect(context, remote);
  await build(page); await experiment(page); await page.getByLabel("My prediction", { exact: true }).fill("Guest prediction");
  expect(remote.writes).toHaveLength(0);
  remote.user = "alice"; await ready(page);
  expect(JSON.stringify(remote.records.alice)).not.toContain("Guest prediction");
  await page.getByRole("button", { name: "Add my guest progress" }).click();
  await expect.poll(() => JSON.stringify(remote.records.alice)).toContain("Guest prediction");
  await expect(page.getByText("All work synced", { exact: true })).toBeVisible();
  const key=Object.keys(remote.records.alice).find(key=>key.startsWith("workshop:"))!;
  const existing=remote.records.alice[key];
  remote.records.alice[key]={...existing,revision:existing.revision+1,mutationId:"other-device",value:{...(existing.value as object),prediction:"Existing account prediction"}};
  await page.reload(); await expect(page.getByText("All work synced", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add my guest progress" }).click();
  await expect(page.getByText("All work synced", { exact: true })).toBeVisible();
  expect((remote.records.alice[key].value as {prediction:string}).prediction).toBe("Existing account prediction");
});

test("an edit made during an upload stays pending and saves after the first response", async ({ page, context }) => {
  const remote=service(); await connect(context,remote); await ready(page); await build(page); await experiment(page);
  let release:()=>void=()=>{};
  const gate=new Promise<void>(resolve=>{release=resolve;});
  let waiting=false;
  await context.route("**/account-api/learner-state",async route=>{
    const request=route.request();
    if(request.method()==="PUT" && JSON.stringify(request.postDataJSON().value).includes("First prediction")) {
      waiting=true; await gate;
    }
    await route.fallback();
  });
  await page.getByLabel("My prediction",{exact:true}).fill("First prediction");
  await expect.poll(()=>waiting).toBe(true);
  await page.getByLabel("My prediction",{exact:true}).fill("Second prediction while saving");
  release();
  await expect.poll(()=>JSON.stringify(remote.records.alice)).toContain("Second prediction while saving");
  await page.reload(); await openExperiment(page);
  await expect(page.getByLabel("My prediction",{exact:true})).toHaveValue("Second prediction while saving");
});
