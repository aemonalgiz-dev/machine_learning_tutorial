import { expect, test, type Page } from "@playwright/test";
import { newJourneyProgress, updateJourneyProgress } from "../lib/journey-progress";
import { deriveRewards } from "../lib/rewards/model";
import catalog from "../lib/rewards/catalog.json";
import type { Progress } from "../lib/progress";
import { FREE_MEMBERSHIP } from "../lib/membership";
import { mockAccountBackend, waitForAccountReady, waitForAccountSync } from "./helpers/account-backend";

const now = 1_700_000_000_000;
const statistics = catalog.lessons.find(lesson => lesson.id === "statistics")!;
const quiz = statistics.quizzes[0];
function savedStatistics() {
  const initial = newJourneyProgress("statistics", "Summarise a city’s records", "/lab/statistics");
  const built = updateJourneyProgress(initial, { type: "built", supported: true, attemptId: "saved-build" }, now);
  return updateJourneyProgress(built, { type: "transferred", supported: false, attemptId: "saved-shift" }, now + 1);
}
const savedProgress: Progress = { done: { [statistics.href]: [quiz] }, required: { [statistics.href]: 0 } };

async function connectGuide(page: Page) {
  await page.locator('[data-piece="reading"] [data-socket="output"]').click();
  await page.locator('[data-piece="multiplier"] [data-input-port="0"]').click();
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("3 passed · 0 failed · 0 not run");
}

async function finishStatisticsQuiz(page: Page) {
  const section = page.locator(`section[id="${quiz}"]`);
  for (let index = 0; index < 5; index++) {
    await section.locator('div[role="radiogroup"], div[role="group"]').getByRole("button").first().click();
    const submit = section.getByRole("button", { name: "Submit this answer", exact: true });
    if (await submit.count()) await submit.click();
    await section.getByRole("button", { name: index === 4 ? "See how you did" : "Next question", exact: true }).click();
  }
  await expect(section.getByRole("status", { name: "Botie's quiz summary" })).toBeVisible();
}

test("account restoration recognises prior rewards quietly after the authoritative read", async ({ page }) => {
  await mockAccountBackend(page, { records: [{ key: "journey-progress:statistics:v1", value: savedStatistics() }], progress: savedProgress });
  let release!: () => void;
  const delayed = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/account-api/learner-state**", async route => {
    if (route.request().method() === "GET") await delayed;
    await route.fallback();
  });
  await page.goto("/account#achievements");
  await expect(page.getByRole("heading", { name: "Your lab journal" })).toBeVisible();
  await expect(page.getByTestId("rewards-chip")).toHaveCount(0);
  await expect(page.getByTestId("reward-celebration")).toHaveCount(0);
  release();
  await waitForAccountReady(page);
  await expect(page.getByTestId("achievement-journal")).toContainText("120 XP");
  await expect(page.getByTestId("rewards-chip")).toContainText("Lv 2");
  await expect(page.getByTestId("reward-celebration")).toHaveCount(0);
  await page.getByRole("button", { name: "Earned", exact: true }).click();
  await expect(page.getByTestId("achievement-journal").locator("li").filter({ hasText: "Built and tested" })).toHaveAttribute("data-earned", "true");
  await expect(page.getByTestId("achievement-journal").locator("li").filter({ hasText: "New inputs, same rule" })).toHaveAttribute("data-earned", "true");
});

test("a failed first account restoration awards nothing and recovery quietly restores prior work", async ({ page }) => {
  await mockAccountBackend(page, { records: [{ key: "journey-progress:statistics:v1", value: savedStatistics() }], progress: savedProgress });
  let unavailable = true;
  await page.route("**/account-api/learner-state**", route => route.request().method() === "GET" && unavailable
    ? route.fulfill({ status: 503, json: { detail: "Saved work temporarily unavailable" } })
    : route.fallback());
  await page.goto("/account#achievements");
  await expect(page.getByTestId("account-sync")).toHaveAttribute("data-sync-status", "error");
  await expect(page.getByTestId("rewards-chip")).toHaveCount(0);
  await expect(page.getByTestId("reward-celebration")).toHaveCount(0);
  await expect(page.getByTestId("achievement-journal")).not.toContainText("120 XP");
  const retry = page.getByRole("button", { name: "Sync now", exact: true });
  await expect(retry).toBeVisible();
  unavailable = false;
  await retry.click();
  await waitForAccountReady(page);
  await expect(page.getByTestId("achievement-journal")).toContainText("120 XP");
  await expect(page.getByTestId("reward-celebration")).toHaveCount(0);
});

test("a tested tutorial connection earns one receipt and restores from the account backend", async ({ page }) => {
  const backend = await mockAccountBackend(page);
  await page.goto("/lab/workshop-guide");
  await waitForAccountReady(page);
  await expect(page.getByTestId("rewards-chip")).toContainText("0 XP");
  await expect(page.getByTestId("reward-celebration")).toHaveCount(0);
  await connectGuide(page);
  await expect(page.getByTestId("reward-celebration")).toContainText("+30 XP");
  await expect(page.getByTestId("reward-celebration")).toContainText("First connection");
  await expect(page.getByTestId("rewards-chip")).toContainText("30 XP");
  await page.getByRole("button", { name: "Dismiss reward" }).click();
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("reward-celebration")).toHaveCount(0);
  await expect(page.getByTestId("rewards-chip")).toContainText("30 XP");
  await backend.waitForRecord("journey-progress:workshop-guide:v1", value => Boolean((value as { connected?: unknown }).connected));
  await waitForAccountSync(page);
  await page.reload();
  await waitForAccountReady(page);
  await expect(page.getByTestId("rewards-chip")).toContainText("30 XP");
  await expect(page.getByTestId("reward-celebration")).toHaveCount(0);
  expect(backend.uploads.some(record => /reward|balance|achievement/.test(record.key))).toBe(false);
});

test("finishing quiz feedback earns credit once and starting it again does not remove it", async ({ page }) => {
  const backend = await mockAccountBackend(page);
  await page.goto(`${statistics.href}#${quiz}`);
  await waitForAccountReady(page);
  await finishStatisticsQuiz(page);
  await expect(page.getByTestId("reward-celebration")).toContainText("+20 XP");
  await expect(page.getByTestId("rewards-chip")).toContainText("20 XP");
  await page.getByRole("button", { name: "Dismiss reward" }).click();
  await page.getByRole("button", { name: "Start these again", exact: true }).click();
  await expect(page.getByTestId("rewards-chip")).toContainText("20 XP");
  await finishStatisticsQuiz(page);
  await expect(page.getByTestId("reward-celebration")).toHaveCount(0);
  await expect.poll(() => backend.progress.done[statistics.href]).toContain(quiz);
  await waitForAccountSync(page);
  await page.reload();
  await waitForAccountReady(page);
  await expect(page.getByTestId("rewards-chip")).toContainText("20 XP");
  await expect(page.getByTestId("reward-celebration")).toHaveCount(0);
});

test("changing accounts clears an active receipt and never carries earned work across identities", async ({ page }) => {
  await mockAccountBackend(page, { user: "reader-a" });
  await page.goto("/lab/workshop-guide");
  await waitForAccountReady(page);
  await connectGuide(page);
  await expect(page.getByTestId("reward-celebration")).toContainText("+30 XP");
  const second = await mockAccountBackend(page, { user: "reader-b" });
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByTestId("rewards-chip")).toContainText("0 XP");
  await expect(page.getByTestId("reward-celebration")).toHaveCount(0);
  await page.getByTestId("account-sync").click();
  await expect(page.getByText("reader-b", { exact: true })).toBeVisible();
  await expect(page.getByTestId("achievement-journal")).toContainText("0 XP");
  expect(second.value<{ connected?: unknown }>("journey-progress:workshop-guide:v1")?.connected ?? null).toBeNull();
});

test("guest XP lasts for the visit and learning rewards are not cached in browser storage", async ({ page }) => {
  await page.route("**/account-api/**", route => route.request().url().endsWith("/session")
    ? route.fulfill({ json: { enabled: true, registrationEnabled: true, user: null, membership: FREE_MEMBERSHIP } })
    : route.fulfill({ status: 401, json: {} }));
  await page.goto("/lab/workshop-guide");
  await waitForAccountReady(page);
  await connectGuide(page);
  await expect(page.getByTestId("rewards-chip")).toContainText("30 XP");
  const stored = await page.evaluate(() => Object.keys(localStorage).filter(key => /reward|achievement|learning|progress|workshop/.test(key) && !key.startsWith("fitlab.learning.v1:guest:preferences:")));
  expect(stored).toEqual([]);
  await page.reload();
  await waitForAccountReady(page);
  await expect(page.getByTestId("rewards-chip")).toContainText("0 XP");
  await expect(page.getByTestId("construction-counter")).toHaveText("0 passed · 0 failed · 3 not run");
  await expect(page.getByTestId("reward-celebration")).toHaveCount(0);
});

test("high course XP does not unlock the separate paid practice library", async ({ page }) => {
  const progress: Progress = { done: Object.fromEntries(catalog.lessons.map(lesson => [lesson.href, [...lesson.quizzes, ...lesson.practice]])), required: {} };
  await mockAccountBackend(page, { progress });
  let paidRequests = 0;
  page.on("request", request => { if (request.url().includes("/practice-api/")) paidRequests++; });
  await page.goto("/practice");
  await waitForAccountReady(page);
  await expect(page.getByRole("region", { name: "Practice membership", exact: true })).toBeVisible();
  const expected = deriveRewards(progress, []).totalXp;
  await expect(page.getByTestId("rewards-chip")).toContainText(`${expected.toLocaleString("en-US")} XP`);
  expect(paidRequests).toBe(0);
});

test("the mobile journal supports reduced motion and keyboard award filters", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockAccountBackend(page, { records: [{ key: "journey-progress:statistics:v1", value: savedStatistics() }], progress: savedProgress });
  await page.goto("/account#achievements");
  await waitForAccountReady(page);
  const journal = page.getByTestId("achievement-journal");
  const earned = journal.getByRole("button", { name: "Earned", exact: true });
  await earned.focus();
  await page.keyboard.press("Enter");
  await expect(earned).toHaveAttribute("aria-pressed", "true");
  const first = journal.locator('li[data-earned="true"] details summary').first();
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(journal.getByRole("link", { name: "Revisit the work" }).first()).toBeVisible();
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("rewards-mobile.png"), fullPage: true });
});
