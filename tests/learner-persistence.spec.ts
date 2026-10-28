import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { exportLearnerWork, migrateLearnerRecord, syncLearnerState, type SavedRecord } from "../lib/learner-state";
import { setProgressAccount, type Progress } from "../lib/progress";
import { readFile } from "node:fs/promises";
import { firstConnectionGraph } from "../lib/builds/onboarding";

type Service = { user: string | null; fail: boolean; records: Record<string, Record<string, SavedRecord>>; progress: Record<string, Progress>; writes: SavedRecord[] };
const service = (): Service => ({ user: "alice", fail: false, records: {}, progress: {}, writes: [] });

async function connect(context: BrowserContext, remote: Service) {
  await context.route("**/account-api/**", async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    if (remote.fail) return route.fulfill({ status: 503, json: {} });
    if (path.endsWith("/session")) return route.fulfill({ json: { enabled: true, user: remote.user ? { id: remote.user, name: remote.user, email: null } : null } });
    if (!remote.user || request.headers()["x-fitlab-account"] !== remote.user) return route.fulfill({ status: 409, json: {} });
    if (path.endsWith("/progress")) {
      const current = remote.progress[remote.user] ?? { done: {}, required: {} };
      if (request.method() === "PUT") {
        const incoming = request.postDataJSON() as Progress;
        for (const [lesson, sections] of Object.entries(incoming.done)) current.done[lesson] = [...new Set([...(current.done[lesson] ?? []), ...sections])];
        current.required = { ...current.required, ...incoming.required };
        remote.progress[remote.user] = current;
      }
      return route.fulfill({ json: current });
    }
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

async function learningStorageKeys(page: Page) {
  return page.evaluate(() => Object.keys(localStorage).filter(key =>
    key.startsWith("fitlab.learning.v1:") && !key.includes(":preferences:") ||
    key.startsWith("oop_ml.progress.v1") || key.startsWith("oop_ml.code.v1") ||
    key.startsWith("fitlab-construction-v1:") || key === "fitlab.neuron-lab.code.v1"));
}

async function downloadedWork(page: Page) {
  await page.locator("summary").filter({ hasText: "Your data" }).click();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my data", exact: true }).click();
  const download = await pending;
  return JSON.parse(await readFile((await download.path())!, "utf8")) as { work: { key: string; value: unknown }[] };
}

async function build(page: Page) {
  await page.goto("/lab/workshop-guide");
  await expect(page.getByTestId("learning-restore-guard")).toHaveCount(0);
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
    await expect(fresh.getByTestId("learning-restore-guard")).toHaveCount(0);
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
  await expect(page.getByTestId("learning-restore-guard")).toHaveCount(0);
  await page.getByRole("button", { name: /False/ }).click();
  await expect(page.getByRole("status", { name: "Botie's feedback" })).toBeVisible();
  const answer = await page.getByRole("radiogroup").getByRole("button", { pressed: true }).textContent() ?? "";
  await expect.poll(() => JSON.stringify(remote.records.alice)).toContain('"answered":true');
  const second = await browser.newContext(); await connect(second, remote); const fresh = await second.newPage();
  try {
    await ready(fresh); await fresh.goto(url);
    await expect(fresh.getByTestId("learning-restore-guard")).toHaveCount(0);
    await expect(fresh.getByRole("status", { name: "Botie's feedback" })).toBeVisible();
    await expect(fresh.getByRole("radiogroup").getByRole("button", { pressed: true })).toHaveText(answer);
    await fresh.getByRole("button", { name: "Next question", exact: true }).click();
    await expect(fresh.getByRole("group", { name: "Data for this question" })).toContainText("Head width = 4");
    await expect.poll(() => Object.values(remote.records.alice).some(record => record.key.startsWith("quiz:/concepts/attention:") &&
      (record.value as { card: number }).card === 1)).toBe(true);
    await expect(fresh.getByTestId("account-sync")).toHaveAttribute("data-sync-status", "saved");
    await fresh.reload();
    await expect(fresh.getByTestId("learning-restore-guard")).toHaveCount(0);
    await expect(fresh.getByRole("group", { name: "Data for this question" })).toContainText("Head width = 4");
  } finally { await second.close(); }
});

test("offline edits retry in memory while unsaved edits reset on reload", async ({ page, context }) => {
  const remote = service(); await connect(context, remote); await ready(page);
  await build(page);
  await experiment(page);
  await expect(page.getByTestId("account-sync")).toHaveAttribute("data-sync-status", "saved");
  remote.fail = true;
  await page.getByLabel("My prediction", { exact: true }).fill("Offline prediction");
  await expect(page.getByRole("link", { name: "Work needs syncing" })).toBeVisible();
  expect(await learningStorageKeys(page)).toEqual([]);
  remote.fail = false;
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect.poll(() => JSON.stringify(remote.records.alice)).toContain("Offline prediction");
  await expect(page.getByTestId("account-sync")).toHaveAttribute("data-sync-status", "saved");
  remote.fail = true;
  await page.getByLabel("My prediction", { exact: true }).fill("Unsaved prediction must not survive reload");
  await expect(page.getByRole("link", { name: "Work needs syncing" })).toBeVisible();
  await page.reload();
  remote.fail = false;
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(page.getByTestId("account-sync")).toHaveAttribute("data-sync-status", "saved");
  await openExperiment(page);
  await expect(page.getByLabel("My prediction", { exact: true })).toHaveValue("Offline prediction");
  expect(JSON.stringify(remote.records.alice)).not.toContain("Unsaved prediction must not survive reload");
  expect(await learningStorageKeys(page)).toEqual([]);
});

test("device edits sync into one current state with a recoverable previous copy", async ({ page, context }) => {
  const remote = service(); await connect(context, remote); await ready(page);
  await page.getByRole("button", { name: "Switch to the light theme" }).click();
  await expect.poll(() => remote.records.alice?.["preferences:theme"]?.value).toBe("light");
  remote.fail = true;
  await page.getByRole("button", { name: "Switch to the dark theme" }).click();
  const other = { ...remote.records.alice["preferences:theme"], revision: 2, mutationId: "other-device", value: "light" };
  remote.records.alice["preferences:theme"] = other;
  await expect(page.getByText(/Sync will retry/)).toBeVisible();
  remote.fail = false; await page.getByRole("button", { name: "Sync now" }).click();
  await expect(page.getByText("All work synced", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Choose the work to keep" })).toHaveCount(0);
  const local = await page.evaluate(() => JSON.parse(localStorage.getItem("fitlab.learning.v1:alice:preferences:theme")!));
  expect(local.recovery).toEqual(other);
  expect(remote.records.alice["preferences:theme"].value).toBe("dark");
  expect(remote.records.alice["preferences:theme"].revision).toBe(3);
  await page.reload();
  await expect(page.getByText("All work synced", { exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("guest workshop work stays in memory and does not follow a full-page sign-in", async ({ page, context }) => {
  const remote = service(); remote.user = null; await connect(context, remote);
  await build(page); await experiment(page); await page.getByLabel("My prediction", { exact: true }).fill("Guest prediction");
  expect(remote.writes).toHaveLength(0);
  expect(await learningStorageKeys(page)).toEqual([]);
  await page.reload();
  await expect(page.getByRole("navigation", { name: "Workshop introduction" }).getByRole("button", { name: /^1\. Connect a wire/ })).toHaveAttribute("aria-current", "step");
  remote.user = "alice"; await ready(page);
  expect(JSON.stringify(remote.records.alice)).not.toContain("Guest prediction");
  await expect(page.getByRole("button", { name: "Add my guest progress" })).toHaveCount(0);
});

test("guest quiz answers and Python drafts reset on reload without a browser queue", async ({ page, context }) => {
  const remote = service(); remote.user = null; await connect(context, remote);
  await page.goto("/concepts/attention#questions-on-parts-1-and-2");
  await page.getByRole("button", { name: /False/ }).click();
  await expect(page.getByRole("status", { name: "Botie's feedback" })).toBeVisible();
  expect(await learningStorageKeys(page)).toEqual([]);
  await page.reload();
  await expect(page.getByRole("status", { name: "Botie's feedback" })).toHaveCount(0);
  await page.goto("/concepts/simple-linear-regression#practice");
  await page.locator(".cm-content").fill('print("guest draft for this visit")');
  await page.getByRole("button", { name: "Ask Botie for a hint", exact: true }).click();
  await expect(page.getByLabel("Hints from Botie")).toBeVisible();
  expect(await learningStorageKeys(page)).toEqual([]);
  await page.reload();
  await expect(page.locator(".cm-content")).not.toContainText("guest draft for this visit");
  await expect(page.getByLabel("Hints from Botie")).toHaveCount(0);
  expect(await learningStorageKeys(page)).toEqual([]);
  expect(remote.writes).toEqual([]);
});

test("account learning restores from server records without a durable browser copy", async ({ page, context }) => {
  const remote = service(); await connect(context, remote); await ready(page); await build(page); await experiment(page);
  await page.getByLabel("My prediction", { exact: true }).fill("Saved on the account backend");
  await expect.poll(() => JSON.stringify(remote.records.alice)).toContain("Saved on the account backend");
  await expect(page.getByTestId("account-sync")).toHaveAttribute("data-sync-status", "saved");
  expect(await learningStorageKeys(page)).toEqual([]);
  await page.reload();
  await expect(page.getByTestId("account-sync")).toHaveAttribute("data-sync-status", "saved");
  await openExperiment(page);
  await expect(page.getByLabel("My prediction", { exact: true })).toHaveValue("Saved on the account backend");
  expect(await learningStorageKeys(page)).toEqual([]);
});

test("legacy account drafts migrate after hydration without adopting another account's cache", async ({ page, context }) => {
  const remote = service(); await connect(context, remote);
  const key = "neuron:code:v1", value = { code: "print('earlier account work')", result: null, solution: false };
  await page.addInitScript(({ key, value }) => {
    const entry = { key, value, revision: 0, mutationId: "legacy-device", dirty: true };
    localStorage.setItem(`fitlab.learning.v1:alice:${key}`, JSON.stringify(entry));
    localStorage.setItem(`fitlab.learning.v1:bob:${key}`, JSON.stringify({ ...entry, value: { ...value, code: "Bob's private draft" } }));
  }, { key, value });
  await ready(page);
  await expect.poll(() => remote.records.alice?.[key]?.value).toEqual(value);
  expect(await page.evaluate(key => localStorage.getItem(`fitlab.learning.v1:alice:${key}`), key)).toBeNull();
  expect(JSON.stringify(remote.records.alice)).not.toContain("Bob's private draft");
  expect(await page.evaluate(key => localStorage.getItem(`fitlab.learning.v1:bob:${key}`), key)).not.toBeNull();
});

test("a racing remote revision wins over a legacy cache migration", async ({ page, context }) => {
  const remote = service(), key = "neuron:code:v1";
  const original = { key, value: { code: "server original", result: null, solution: false }, revision: 1, mutationId: "server-one" };
  remote.records.alice = {};
  await connect(context, remote);
  let raced = false;
  await context.route("**/account-api/learner-state*", async route => {
    if (route.request().method() === "PUT" && route.request().postDataJSON().key === key && !raced) {
      raced = true;
      remote.records.alice[key] = { ...original, value: { ...original.value, code: "newer server work" }, revision: 2, mutationId: "server-two" };
    }
    await route.fallback();
  });
  await page.addInitScript(({ key, original }) => localStorage.setItem(`fitlab.learning.v1:alice:${key}`, JSON.stringify({ ...original,
    value: { ...original.value, code: "old pending cache edit" }, dirty: true })), { key, original });
  await ready(page);
  expect(raced).toBe(true);
  expect((remote.records.alice[key].value as { code: string }).code).toBe("newer server work");
  expect(remote.writes.filter(record => record.key === key)).toEqual([]);
  const downloaded = await downloadedWork(page);
  expect((downloaded.work.find(record => record.key === key)?.value as { code: string }).code).toBe("newer server work");
  expect(await page.evaluate(key => localStorage.getItem(`fitlab.learning.v1:alice:${key}`), key)).toBeNull();
});

test("a default workshop seed waits for delayed backend drafts before recording provenance", async ({ page, context }) => {
  const remote = service(), key = "workshop:guide:first-connection:v1";
  const value = { graph: firstConnectionGraph(), undo: [], redo: [], caseIndex: 0, results: {}, tested: {}, customData: { reading: 3 },
    prediction: "The account's earlier first-connection draft", hintsShown: 0, example: false, animate: false, zoom: 0.75 };
  remote.records.alice = { [key]: { key, value, revision: 2, mutationId: "saved-first-connection" } };
  await connect(context, remote);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let requested = false;
  await context.route("**/account-api/learner-state*", async route => {
    if (route.request().method() === "GET") { requested = true; await gate; }
    await route.fallback();
  });
  await page.goto("/lab/workshop-guide");
  await expect.poll(() => requested).toBe(true);
  await expect(page.getByTestId("learning-restore-guard")).toContainText("Loading your saved work");
  await page.getByRole("navigation", { name: "Workshop introduction" }).getByRole("button", { name: /Build from an empty floor/ }).click();
  await expect(page.getByRole("navigation", { name: "Workshop introduction" }).getByRole("button", { name: /^1\. Connect a wire/ })).toHaveAttribute("aria-current", "step");
  expect(remote.writes).toEqual([]);
  release();
  await expect(page.getByTestId("account-sync")).toHaveAttribute("data-sync-status", "saved");
  await openExperiment(page);
  await expect(page.getByLabel("My prediction", { exact: true })).toHaveValue(value.prediction);
  expect(remote.writes.filter(write => write.key === key)).toEqual([]);
  expect(remote.records.alice[key].value).toEqual(value);
});

test("an unvalidated same-revision legacy value cannot replace an existing account draft", async ({ page, context }) => {
  const remote = service(), key = "neuron:code:v1";
  const saved = { key, value: { code: "valid account code", result: null, solution: false }, revision: 7, mutationId: "server-existing" };
  remote.records.alice = { [key]: saved };
  await connect(context, remote);
  await page.addInitScript(saved => localStorage.setItem(`fitlab.learning.v1:alice:${saved.key}`, JSON.stringify({ ...saved,
    value: "not a workshop or code record", dirty: true })), saved);
  await ready(page);
  expect(remote.records.alice[key]).toEqual(saved);
  expect(remote.writes.filter(write => write.key === key)).toEqual([]);
  const downloaded = await downloadedWork(page);
  expect(downloaded.work.find(record => record.key === key)?.value).toEqual(saved.value);
});

test("older per-problem migration keeps the server current and retains the differing recovery copy", async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const stored = new Map<string, string>();
  const storage: Storage = { get length() { return stored.size; }, key: index => [...stored.keys()][index] ?? null,
    getItem: key => stored.get(key) ?? null, setItem: (key, value) => { stored.set(key, value); }, removeItem: key => { stored.delete(key); }, clear: () => { stored.clear(); } };
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  const account = "migration-unit", key = "practice:legacy-unit", value = { code: "server draft", solved: true };
  let uploads = 0;
  try {
    setProgressAccount(account);
    await syncLearnerState(account, () => true, async (_path, init) => {
      if (init?.method === "PUT") uploads++;
      return new Response(JSON.stringify({ records: [{ key, value, revision: 3, mutationId: "server-unit" }] }), { status: 200 });
    });
    const legacyKey = "oop_ml.code.v1:account:migration-unit:/concepts/example:old";
    const legacy = { code: "older unsent code", solved: false };
    stored.set(legacyKey, JSON.stringify(legacy));
    migrateLearnerRecord(key, legacy, account, [legacyKey]);
    const record = exportLearnerWork().find(record => record.key === key)!;
    expect(record.value).toEqual(value);
    expect(record.previousDeviceCopy).toEqual(legacy);
    expect(stored.has(legacyKey)).toBe(false);
    expect(uploads).toBe(0);
  } finally {
    setProgressAccount(null);
    if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});

test("an edit made during an upload stays pending and saves after the first response", async ({ page, context }) => {
  const remote=service(); await connect(context,remote); await ready(page); await build(page); await experiment(page);
  let release:()=>void=()=>{};
  const gate=new Promise<void>(resolve=>{release=resolve;});
  let waiting=false;
  await context.route("**/account-api/learner-state*",async route=>{
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

test("saved work loads every page before reporting sync complete", async ({page,context})=>{
  const remote=service();await connect(context,remote);
  const record=(key:string,value:unknown):SavedRecord=>({key,value,revision:1,mutationId:"00000000-0000-4000-8000-000000000001"});
  const paths:string[]=[];
  await context.route("**/account-api/learner-state?*",async route=>{
    const url=new URL(route.request().url());paths.push(url.search);
    expect(route.request().headers()["x-fitlab-account"]).toBe("alice");
    expect(url.searchParams.get("limit")).toBe("128");
    const after=url.searchParams.get("after");
    if(!after)return route.fulfill({json:{records:[record("bank:last:v1",{id:"sensor-mean--01--quiz",title:"Practice"})],nextCursor:"bank:last:v1"}});
    expect(after).toBe("bank:last:v1");
    return route.fulfill({json:{records:[record("preferences:theme","light")],nextCursor:null}});
  });
  await ready(page);
  expect(paths).toHaveLength(2);
  const saved = await downloadedWork(page);
  expect(saved.work.find(record => record.key === "preferences:theme")?.value).toBe("light");
  expect(saved.work.find(record => record.key === "bank:last:v1")?.value).toEqual({ id: "sensor-mean--01--quiz", title: "Practice" });
  expect(await learningStorageKeys(page)).toEqual([]);
});

test("repeated page cursors stop sync instead of looping or uploading partial state",async({page,context})=>{
  const remote=service();await connect(context,remote);let pages=0;
  await context.route("**/account-api/learner-state?*",route=>{
    pages++;return route.fulfill({json:{records:[],nextCursor:"bank:last:v1"}});
  });
  await page.goto("/account");
  await expect(page.getByText(/Sync will retry/)).toBeVisible();
  expect(pages).toBe(2);expect(remote.writes).toHaveLength(0);
});
