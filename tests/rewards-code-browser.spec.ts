import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { expandedLessonById } from "../lib/lessons";
import catalog from "../lib/rewards/catalog.json";
import { mockAccountBackend, waitForAccountReady, waitForAccountSync } from "./helpers/account-backend";
import { displayExerciseTitle } from "../lib/exercises";
import { americanEnglish } from "../lib/american-english";

test("actual Python checks earn one coding-group reward only after every problem passes", async ({ page, context }) => {
  test.setTimeout(240_000);
  const backend = await mockAccountBackend(page);
  // Use the normal browser worker and NumPy runtime. Cached public wheels only
  // avoid an unnecessary CDN download; no Python execution or result is mocked.
  await context.route("https://cdn.jsdelivr.net/pyodide/v314.0.7/full/*.whl", async route => {
    try {
      const body = await readFile(path.join(process.cwd(), ".practice-checks", path.basename(new URL(route.request().url()).pathname)));
      await route.fulfill({ body, contentType: "application/zip", headers: { "access-control-allow-origin": "*" } });
    } catch { await route.continue(); }
  });
  const lesson = expandedLessonById["numerical-stable-normalisation"];
  const rewards = catalog.lessons.find(entry => entry.id === lesson.id)!;
  const practiceId = rewards.practice[0];
  const practiceHref = `${rewards.href}#${practiceId}`;
  expect(lesson.practice).toHaveLength(2);
  await page.goto(practiceHref);
  await waitForAccountReady(page);
  const section = page.locator(`section[id="${practiceId}"]`);
  const run = section.getByRole("button", { name: "Run tests", exact: true });
  await expect(section.locator(".cm-content")).toBeVisible();
  await expect(page.getByTestId("rewards-chip")).toContainText("0 XP");
  await expect(page.getByTestId("reward-celebration")).toHaveCount(0);

  await run.click();
  await expect(section.getByLabel("Test counts")).toContainText(/[1-9]\d* failed/, { timeout: 120_000 });
  await expect(page.getByTestId("rewards-chip")).toContainText("0 XP");
  await expect(page.getByTestId("reward-celebration")).toHaveCount(0);

  for (let index = 0; index < lesson.practice.length; index++) {
    if (index) await section.getByRole("button", { name: `Challenge ${index + 1}: ${americanEnglish(displayExerciseTitle(lesson.practice[index]))}`, exact: true }).click();
    await section.getByRole("button", { name: "Show the worked solution", exact: true }).click();
    await expect(page.getByTestId("rewards-chip")).toContainText("0 XP");
    await section.getByRole("button", { name: "Replace editor with this solution", exact: true }).click();
    await expect(page.getByTestId("rewards-chip")).toContainText("0 XP");
    await expect(page.getByTestId("reward-celebration")).toHaveCount(0);
    await run.click();
    await expect(section.getByText("All tests passed", { exact: true })).toBeVisible({ timeout: 120_000 });
    await expect(section.getByLabel("Test counts")).toContainText("0 failed");
    if (index === 0) {
      await expect(section.getByText("Tests passed for 1 of 2 exercises", { exact: true })).toBeVisible();
      await expect(page.getByTestId("rewards-chip")).toContainText("0 XP");
      await expect(page.getByTestId("reward-celebration")).toHaveCount(0);
    }
  }

  await expect(page.getByTestId("rewards-chip")).toContainText("50 XP");
  const receipt = page.getByTestId("reward-celebration");
  await expect(receipt).toContainText("+50 XP");
  await expect(receipt).toContainText("It runs!");
  await page.getByRole("button", { name: "Dismiss reward", exact: true }).click();
  await run.click();
  await expect(run).toBeEnabled();
  await expect(section.getByText("All tests passed", { exact: true })).toBeVisible();
  await expect(page.getByTestId("rewards-chip")).toContainText("50 XP");
  await expect(page.getByTestId("reward-celebration")).toHaveCount(0);
  await expect.poll(() => backend.progress.done[rewards.href]).toEqual([practiceId]);
  await waitForAccountSync(page);

  await page.reload();
  await waitForAccountReady(page);
  await expect(page.getByTestId("rewards-chip")).toContainText("50 XP");
  await expect(page.getByTestId("reward-celebration")).toHaveCount(0);
  await page.goto("/account#achievements");
  await waitForAccountReady(page);
  const badge = page.getByTestId("achievement-journal").locator("li").filter({ hasText: "It runs!" });
  await expect(badge).toHaveAttribute("data-earned", "true");
  await badge.locator("summary").click();
  await expect(badge.getByRole("link", { name: "Revisit the work" })).toHaveAttribute("href", practiceHref);
  await expect(page.getByTestId("reward-celebration")).toHaveCount(0);
  expect(backend.uploads.some(record => /reward|balance|achievement/.test(record.key))).toBe(false);
});
