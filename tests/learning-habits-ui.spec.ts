import { expect, test, type Page } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import catalog from "../lib/rewards/catalog.json";
import { expandedLessonById } from "../lib/lessons";
import { newJourneyProgress, updateJourneyProgress } from "../lib/journey-progress";
import { waitForAccountReady, waitForAccountSync } from "./helpers/account-backend";
import { mockLearningHabits } from "./helpers/learning-habits-backend";

const statistics = catalog.lessons.find(lesson => lesson.id === "statistics")!;
const quiz = statistics.quizzes[0];
async function openPreferences(page: Page) {
  await page.goto("/account#learning-reminders");
  await waitForAccountReady(page);
  await expect(page.getByTestId("learning-reminders").getByLabel("Time zone", { exact: true })).toBeVisible();
}
async function connectGuide(page: Page) {
  await page.locator('[data-piece="reading"] [data-socket="output"]').click();
  await page.locator('[data-piece="multiplier"] [data-input-port="0"]').click();
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("3 passed · 0 failed · 0 not run");
}
async function noHabitStorage(page: Page) {
  expect(await page.evaluate(() => [...Object.keys(localStorage), ...Object.keys(sessionStorage)].filter(key => /streak|reminder|learning-habit|learning-activity/i.test(key)))).toEqual([]);
}

test("guests can build without streak requests, reminder controls or invented day counts", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => { if (/\/account-api\/(streak|activity|learning-preferences)/.test(request.url())) requests.push(request.method()); });
  await page.route("**/account-api/**", route => route.fulfill({ json: { enabled: true, registrationEnabled: true, user: null } }));
  await page.goto("/lab/workshop-guide");
  await expect(page.getByTestId("learning-restore-guard")).toHaveCount(0);
  await connectGuide(page);
  await page.goto("/account#learning-streak");
  await expect(page.getByTestId("learning-streak")).toContainText("Sign in to keep a record");
  await expect(page.getByTestId("learning-streak").getByText("Current streak", { exact: true })).toHaveCount(0);
  await expect(page.getByTestId("learning-reminders").getByRole("checkbox")).toHaveCount(0);
  expect(requests).toEqual([]);
  await noHabitStorage(page);
});

test("restored quiz, code and workshop progress adds no past or present learning day on visits", async ({ page }) => {
  const guide = updateJourneyProgress(newJourneyProgress("workshop-guide", "Getting started with Botie", "/lab/workshop-guide"), { type: "connected" }, 1_700_000_000_000);
  const backend = await mockLearningHabits(page, { activeDates: ["2026-10-27", "2026-10-28"], account: { progress: { done: { [statistics.href]: [quiz, ...statistics.practice] }, required: {} }, records: [{ key: "journey-progress:workshop-guide:v1", value: guide }] } });
  await page.goto("/account#learning-streak");
  await waitForAccountReady(page);
  const card = page.getByTestId("learning-streak");
  await expect(card.getByText("No activity recorded today.", { exact: true })).toBeVisible();
  await expect(card.locator("dl").getByText("0", { exact: true })).toBeVisible();
  await expect(card.getByText(/Last recorded day: October 28, 2026/)).toBeVisible();
  for (const href of [`${statistics.href}#${quiz}`, `${statistics.href}#${statistics.practice[0]}`, "/lab/workshop-guide"]) {
    await page.goto(href); await waitForAccountReady(page);
  }
  expect(backend.state.activities).toEqual([]);
  expect([...backend.state.activeDates].sort()).toEqual(["2026-10-27", "2026-10-28"]);
  await noHabitStorage(page);
});

test("a real checked connection records today once even when the checks are run again", async ({ page }) => {
  const backend = await mockLearningHabits(page, { preferences: { timezone: "UTC", timezoneSet: false } });
  await page.goto("/lab/workshop-guide"); await waitForAccountReady(page);
  await connectGuide(page);
  await expect.poll(() => backend.state.activities.length).toBeGreaterThan(0);
  expect(backend.state.activities[0]).toMatchObject({ kind: "workshop", activityId: "workshop:workshop-guide:connected" });
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("3 passed · 0 failed · 0 not run");
  await page.goto("/account#learning-streak"); await waitForAccountReady(page);
  await expect(page.getByTestId("learning-streak")).toContainText("Activity recorded today.");
  expect(backend.snapshot()).toMatchObject({ currentDays: 1, longestDays: 1, activeToday: true });
  expect([...backend.state.activeDates]).toEqual(["2026-10-30"]);
  expect(backend.state.preferences.timezoneSet).toBe(true);
  await noHabitStorage(page);
});

test("a freshly worked quiz records a day and reopening its saved summary does not", async ({ page }) => {
  const backend = await mockLearningHabits(page);
  await page.goto(`${statistics.href}#${quiz}`); await waitForAccountReady(page);
  const section = page.locator(`section[id="${quiz}"]`);
  for (let index = 0; index < 5; index++) {
    await section.locator('div[role="radiogroup"], div[role="group"]').getByRole("button").first().click();
    const submit = section.getByRole("button", { name: "Submit this answer", exact: true });
    if (await submit.count()) await submit.click();
    await section.getByRole("button", { name: index === 4 ? "See how you did" : "Next question", exact: true }).click();
  }
  await expect.poll(() => backend.state.activities.filter(activity => activity.kind === "quiz").length).toBe(1);
  await waitForAccountSync(page);
  await page.reload(); await waitForAccountReady(page);
  await expect(section.getByRole("status", { name: "Botie's quiz summary" })).toBeVisible();
  expect(backend.state.activities.filter(activity => activity.kind === "quiz")).toHaveLength(1);
  expect(backend.snapshot().currentDays).toBe(1);
});

test("account A's fresh-answer flag cannot turn account B's restored quiz into a new learning day", async ({ page }) => {
  const backend = await mockLearningHabits(page, { account: { user: "reader-a" } });
  await page.goto(`${statistics.href}#${quiz}`); await waitForAccountReady(page);
  const section = page.locator(`section[id="${quiz}"]`);
  for (let index = 0; index < 5; index++) {
    await section.locator('div[role="radiogroup"], div[role="group"]').getByRole("button").first().click();
    const submit = section.getByRole("button", { name: "Submit this answer", exact: true });
    if (await submit.count()) await submit.click();
    if (index < 4) await section.getByRole("button", { name: "Next question", exact: true }).click();
  }
  await waitForAccountSync(page);
  const records = [...backend.account.records.values()].filter(record => record.key.startsWith(`quiz:${statistics.href}:${quiz}:`)).map(record => ({ key: record.key, value: structuredClone(record.value) }));
  expect(records).toHaveLength(1);
  expect(backend.state.activities).toEqual([]);
  await backend.switchAccount({ account: { user: "reader-b", records } });
  const switched = page.waitForResponse(response => new URL(response.url()).pathname === "/account-api/learning-preferences" && response.request().headers()["x-fitlab-account"] === "reader-b");
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await (await switched).finished();
  await waitForAccountReady(page);
  await expect(section.getByRole("button", { name: "See how you did", exact: true })).toBeVisible();
  await section.getByRole("button", { name: "See how you did", exact: true }).click();
  await expect(section.getByRole("status", { name: "Botie's quiz summary" })).toBeVisible();
  await waitForAccountSync(page);
  expect(backend.state.activities).toEqual([]);
});

test("an unsynced activity retries with the same event ID and restores only the saved server day", async ({ page }) => {
  const backend = await mockLearningHabits(page); backend.state.activityFailure = true;
  await page.goto("/lab/workshop-guide"); await waitForAccountReady(page);
  await connectGuide(page);
  await expect.poll(() => backend.state.activityRequests.length).toBe(1);
  expect(backend.state.activities).toEqual([]);
  await page.getByTestId("account-sync").click();
  const card = page.getByTestId("learning-streak");
  await expect(card).toContainText("has not synced");
  backend.state.activityFailure = false;
  await card.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(card).toContainText("Activity recorded today.");
  expect(backend.state.activities).toHaveLength(1);
  // A ready-account notification can retry before the explicit button. Every
  // attempt must keep the original identity, with one accepted server day.
  expect(backend.state.activityRequests.length).toBeGreaterThanOrEqual(2);
  expect([...new Set(backend.state.activityRequests.map(activity => activity.eventId))]).toEqual([backend.state.activityRequests[0].eventId]);
  const settledRequests = backend.state.activityRequests.length;
  await page.reload(); await waitForAccountReady(page);
  await expect(card).toContainText("Activity recorded today.");
  expect(backend.state.activityRequests).toHaveLength(settledRequests);
  await noHabitStorage(page);
});

test("real Python failure and solution viewing give no day; a passing check does", async ({ page, context }) => {
  test.setTimeout(240_000);
  const backend = await mockLearningHabits(page);
  await context.route("https://cdn.jsdelivr.net/pyodide/v314.0.7/full/*.whl", async route => {
    try { const body = await readFile(path.join(process.cwd(), ".practice-checks", path.basename(new URL(route.request().url()).pathname))); await route.fulfill({ body, contentType: "application/zip", headers: { "access-control-allow-origin": "*" } }); }
    catch { await route.continue(); }
  });
  const lesson = expandedLessonById["numerical-stable-normalisation"];
  const metadata = catalog.lessons.find(entry => entry.id === lesson.id)!;
  const practiceId = metadata.practice[0];
  await page.goto(`${metadata.href}#${practiceId}`); await waitForAccountReady(page);
  const section = page.locator(`section[id="${practiceId}"]`), run = section.getByRole("button", { name: "Run tests", exact: true });
  await expect(section.locator(".cm-content")).toBeVisible();
  await run.click();
  await expect(section.getByLabel("Test counts")).toContainText(/[1-9]\d* failed/, { timeout: 120_000 });
  expect(backend.state.activities).toEqual([]);
  await section.getByRole("button", { name: "Show the worked solution", exact: true }).click();
  await section.getByRole("button", { name: "Replace editor with this solution", exact: true }).click();
  expect(backend.state.activities).toEqual([]);
  await run.click();
  await expect(section.getByText("All tests passed", { exact: true })).toBeVisible({ timeout: 120_000 });
  await expect.poll(() => backend.state.activities.filter(activity => activity.kind === "code").length).toBe(1);
  await waitForAccountSync(page);
  await page.reload(); await waitForAccountReady(page);
  await expect(section.locator(".cm-content")).toBeVisible();
  expect(backend.state.activities.filter(activity => activity.kind === "code")).toHaveLength(1);
  await noHabitStorage(page);
});

test("reminders start off and browser time-zone prefilling never writes before explicit Save", async ({ page }) => {
  const backend = await mockLearningHabits(page, { preferences: { timezone: "UTC", timezoneSet: false } });
  await openPreferences(page);
  const card = page.getByTestId("learning-reminders");
  await expect(card.getByRole("checkbox")).not.toBeChecked();
  await expect(card.getByLabel("Reminder hour")).toHaveValue("18");
  const browserZone = await page.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  await expect(card.getByLabel("Time zone", { exact: true })).toHaveValue(browserZone);
  expect(backend.state.preferenceRequests).toEqual([]);
  await card.getByRole("checkbox").check();
  await card.getByLabel("Reminder hour").selectOption("17");
  await card.getByLabel("Time zone", { exact: true }).fill("Europe/London");
  await card.getByRole("button", { name: "Save preferences" }).click();
  await expect(card.getByText("Your reminder preferences are saved.", { exact: true })).toBeVisible();
  expect(backend.state.preferenceWrites).toEqual([{ remindersEnabled: true, timezone: "Europe/London", reminderHour: 17 }]);
  await expect(card).toContainText("Email reminders are on.");
  await expect(card).toContainText("around your chosen hour");
  await page.reload(); await waitForAccountReady(page);
  await expect(card.getByRole("checkbox")).toBeChecked();
  await expect(card.getByLabel("Reminder hour")).toHaveValue("17");
  await expect(card.getByLabel("Time zone", { exact: true })).toHaveValue("Europe/London");
  expect(backend.state.preferenceRequests).toHaveLength(1);
  await noHabitStorage(page);
});

for (const limitation of ["delivery", "verification"] as const) test(`${limitation} must be available before an off reminder can be enabled`, async ({ page }) => {
  const backend = await mockLearningHabits(page, { preferences: limitation === "delivery" ? { deliveryAvailable: false } : { emailVerified: false } });
  await openPreferences(page);
  const card = page.getByTestId("learning-reminders");
  await expect(card.getByRole("checkbox")).toBeDisabled();
  await expect(card.getByRole("checkbox")).not.toBeChecked();
  await expect(card).toContainText(limitation === "delivery" ? "Email reminders are not available yet" : "A verified account email is required");
  await card.getByLabel("Time zone", { exact: true }).fill("Asia/Tokyo");
  await card.getByRole("button", { name: "Save preferences" }).click();
  await expect(card.getByText("Your reminder preferences are saved.", { exact: true })).toBeVisible();
  expect(backend.state.preferenceWrites).toEqual([{ remindersEnabled: false, timezone: "Asia/Tokyo", reminderHour: 18 }]);
});

test("an existing reminder can always be turned off when delivery and email verification are unavailable", async ({ page }) => {
  const backend = await mockLearningHabits(page, { preferences: { remindersEnabled: true, deliveryAvailable: false, emailVerified: false } });
  await openPreferences(page);
  const card = page.getByTestId("learning-reminders");
  await expect(card.getByRole("checkbox")).toBeChecked();
  await expect(card.getByRole("checkbox")).toBeEnabled();
  await card.getByRole("checkbox").uncheck();
  await card.getByRole("button", { name: "Save preferences" }).click();
  await expect(card.getByText("Your reminder preferences are saved.", { exact: true })).toBeVisible();
  expect(backend.state.preferences.remindersEnabled).toBe(false);
  await expect(card).toContainText("Email reminders are off.");
});

test("preference errors retain edits and Save stays disabled during the server write", async ({ page }) => {
  const backend = await mockLearningHabits(page);
  await openPreferences(page);
  const card = page.getByTestId("learning-reminders");
  await card.getByLabel("Time zone", { exact: true }).fill("Jupiter/Europa");
  await card.getByRole("button", { name: "Save preferences" }).click();
  await expect(card.getByRole("alert")).toContainText("Choose a recognised time zone.");
  await expect(card.getByLabel("Time zone", { exact: true })).toHaveValue("Jupiter/Europa");
  let release!: () => void;
  backend.state.delayPut = new Promise<void>(resolve => { release = resolve; });
  await card.getByLabel("Time zone", { exact: true }).fill("America/Chicago");
  await expect(card.getByRole("alert")).toHaveCount(0);
  await card.getByRole("button", { name: "Save preferences" }).click();
  await expect(card.getByRole("button", { name: "Saving preferences…" })).toBeDisabled();
  await expect(card.getByLabel("Time zone", { exact: true })).toBeDisabled();
  release();
  await expect(card.getByText("Your reminder preferences are saved.", { exact: true })).toBeVisible();
  expect(backend.state.preferenceWrites).toEqual([{ remindersEnabled: false, timezone: "America/Chicago", reminderHour: 18 }]);
});

test("failed loading shows a retry and no zero-day placeholders", async ({ page }) => {
  const backend = await mockLearningHabits(page); backend.state.getFailure = true;
  await page.goto("/account#learning-streak"); await waitForAccountReady(page);
  const card = page.getByTestId("learning-streak");
  await expect(card).toContainText("Your learning days could not be loaded right now.");
  await expect(card.getByText("Current streak", { exact: true })).toHaveCount(0);
  backend.state.getFailure = false;
  await card.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(card.getByText("Current streak", { exact: true })).toBeVisible();
});

test("a late account A read cannot replace account B's learning days or preferences", async ({ page }) => {
  const backend = await mockLearningHabits(page, { account: { user: "reader-a" }, activeDates: ["2026-10-29", "2026-10-30"], preferences: { timezone: "Asia/Tokyo" } });
  let release!: () => void; backend.state.delayStreak = new Promise<void>(resolve => { release = resolve; });
  await page.goto("/account#learning-streak"); await waitForAccountReady(page);
  await expect(page.getByTestId("learning-streak")).toContainText("Opening your learning days");
  await backend.switchAccount({ account: { user: "reader-b" }, preferences: { timezone: "Europe/London" } });
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.locator('section[aria-label="Account"] strong')).toHaveText("reader-b");
  await expect(page.getByTestId("learning-reminders").getByLabel("Time zone", { exact: true })).toHaveValue("Europe/London");
  const oldResponse = page.waitForResponse(response => new URL(response.url()).pathname === "/account-api/streak" && response.request().headers()["x-fitlab-account"] === "reader-a");
  release();
  await (await oldResponse).finished();
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await expect(page.getByTestId("learning-streak")).toContainText("Time zone: Europe/London");
  await expect(page.getByTestId("learning-streak")).not.toContainText("Asia/Tokyo");
  expect(backend.state.preferenceWrites).toEqual([]);
});

test("a late account A save never changes account B's form or shows A's success message", async ({ page }) => {
  const backend = await mockLearningHabits(page, { account: { user: "reader-a" } });
  await openPreferences(page);
  const card = page.getByTestId("learning-reminders");
  let release!: () => void; backend.state.delayPut = new Promise<void>(resolve => { release = resolve; });
  await card.getByLabel("Time zone", { exact: true }).fill("Asia/Tokyo");
  await card.getByRole("button", { name: "Save preferences" }).click();
  await expect.poll(() => backend.state.preferenceRequests.length).toBe(1);
  await backend.switchAccount({ account: { user: "reader-b" }, preferences: { timezone: "Europe/London", reminderHour: 9 } });
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.locator('section[aria-label="Account"] strong')).toHaveText("reader-b");
  await expect(card.getByLabel("Time zone", { exact: true })).toHaveValue("Europe/London");
  const oldResponse = page.waitForResponse(response => new URL(response.url()).pathname === "/account-api/learning-preferences" && response.request().method() === "PUT" && response.request().headers()["x-fitlab-account"] === "reader-a");
  release();
  await (await oldResponse).finished();
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await expect(card.getByLabel("Reminder hour")).toHaveValue("9");
  await expect(card.getByText("Your reminder preferences are saved.", { exact: true })).toHaveCount(0);
  expect(backend.state.preferenceWrites).toEqual([]);
});

test("server civil dates stay unchanged across browser time zones and cards fit at 320 pixels", async ({ page }) => {
  await mockLearningHabits(page, { activeDates: ["2026-10-29", "2026-10-30"], preferences: { timezone: "Pacific/Kiritimati" } });
  await openPreferences(page);
  const card = page.getByTestId("learning-streak");
  const screenshots = path.join(process.cwd(), ".practice-checks", "learning-habits-visual");
  await mkdir(screenshots, { recursive: true });
  await card.screenshot({ path: path.join(screenshots, "streak-account-desktop-test-data.png") });
  await page.getByTestId("learning-reminders").screenshot({ path: path.join(screenshots, "reminders-account-desktop-test-data.png") });
  await page.setViewportSize({ width: 320, height: 900 });
  await expect(card.locator('time[datetime="2026-10-30"]')).toHaveAttribute("aria-label", "October 30, 2026: activity recorded, today");
  await expect(card.locator('time[aria-current="date"]')).toHaveAttribute("datetime", "2026-10-30");
  for (const section of [card, page.getByTestId("learning-reminders")]) {
    const bounds = await section.boundingBox(); expect(bounds).not.toBeNull(); expect(bounds!.x).toBeGreaterThanOrEqual(0); expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(321);
  }
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await card.screenshot({ path: path.join(screenshots, "streak-account-320-test-data.png") });
  await page.getByTestId("learning-reminders").screenshot({ path: path.join(screenshots, "reminders-account-320-test-data.png") });
  await page.goto("/"); await waitForAccountReady(page);
  const chip = page.getByTestId("rewards-chip");
  await expect(chip).toHaveCount(1);
  await expect(chip).toBeVisible();
  await expect(page.getByTestId("learning-rewards")).toHaveCount(0);
  await expect(page.getByTestId("learning-streak-compact")).toHaveCount(0);
  await expect(page.getByText("Next award", { exact: true })).toHaveCount(0);
  const bounds = await chip.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(321);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: path.join(screenshots, "home-compact-320-test-data.png") });
});

test("a streak error replaces the account count and offers a working retry", async ({ page }) => {
  const backend = await mockLearningHabits(page, { activeDates: ["2026-10-29"] });
  await page.goto("/account#learning-streak"); await waitForAccountReady(page);
  const card = page.getByTestId("learning-streak");
  await expect(card.getByText("Current streak", { exact: true })).toBeVisible();
  await expect(card).toContainText("No activity recorded today.");
  backend.state.getFailure = true;
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(card.getByText("Current streak", { exact: true })).toHaveCount(0);
  await expect(card.getByRole("button", { name: "Try again", exact: true })).toBeVisible();
  backend.state.getFailure = false;
  await card.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(card.getByText("Current streak", { exact: true })).toBeVisible();
  await expect(card).toContainText("No activity recorded today.");
});

test("an unsubscribe GET only checks the link; the explicit confirmation sends the POST", async ({ page }) => {
  const calls: { method: string; body: string | null }[] = [];
  await page.route("**/account-api/**", route => route.fulfill({ json: { enabled: false, user: null } }));
  await page.route("**/account-api/reminders/unsubscribe?*", route => {
    const request = route.request(); calls.push({ method: request.method(), body: request.postData() });
    return route.fulfill({ json: request.method() === "GET" ? { canUnsubscribe: true } : { ok: true } });
  });
  await page.goto("/account/reminders/unsubscribe?token=fixture-token");
  const stop = page.getByRole("button", { name: "Stop reminder emails", exact: true });
  await expect(stop).toBeEnabled();
  expect(calls.filter(call => call.method === "POST")).toEqual([]);
  await stop.click();
  await expect(page.getByRole("status")).toContainText("Reminder emails are off.");
  expect(calls.filter(call => call.method === "POST")).toEqual([{ method: "POST", body: "confirm=unsubscribe" }]);
});

test("an invalid unsubscribe link offers the account fallback and cannot send a POST", async ({ page }) => {
  const methods: string[] = [];
  await page.route("**/account-api/**", route => route.fulfill({ json: { enabled: false, user: null } }));
  await page.route("**/account-api/reminders/unsubscribe?*", route => { methods.push(route.request().method()); return route.fulfill({ status: 400, json: {} }); });
  await page.goto("/account/reminders/unsubscribe?token=invalid-fixture");
  await expect(page.getByRole("alert").filter({ hasText: "This link could not be checked" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open your account", exact: true })).toHaveAttribute("href", "/account");
  await expect(page.getByRole("button", { name: "Stop reminder emails", exact: true })).toBeDisabled();
  expect(methods.every(method => method === "GET")).toBe(true);
});
