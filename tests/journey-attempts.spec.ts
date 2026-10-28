import { mockAccountBackend, waitForAccountReady, waitForAccountSync } from "./helpers/account-backend";
import { test, expect, type Page } from "@playwright/test";
import { openLessonNotes, openWorkspaceControls } from "./helpers/open-workshop";

async function buildMean(page: Page) {
  for (const name of ["Deaths recorded each week", "Add a list", "Count items", "Divide"]) {
    await page.getByRole("button", { name, exact: true }).click();
  }
  for (const [output, input] of [
    ["Deaths recorded each week output", "Add a list input 1: Numbers"],
    ["Deaths recorded each week output", "Count items input 1: Items"],
    ["Add a list output", "Divide input 1: Amount"],
    ["Count items output", "Divide input 2: Divisor"],
    ["Divide output", "Result input 1: Your result"],
  ]) {
    await page.getByRole("button", { name: output, exact: true }).click();
    await page.getByRole("button", { name: input, exact: true }).click();
  }
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("2 passed · 0 failed · 0 not run");
}

test.beforeEach(async ({ page }) => { await mockAccountBackend(page); });

test("a fresh independent build keeps the earlier guided success and restores both", async ({ page }) => {
  await page.goto("/lab/statistics"); await waitForAccountReady(page);
  await page.getByRole("button", { name: "Ask Botie for a hint", exact: true }).click();
  await buildMean(page);
  await openLessonNotes(page);
  const evidence = page.getByTestId("journey-evidence");
  await expect(evidence.locator("summary")).toHaveText("Your tested work: built with guidance");
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(evidence.locator("summary")).toHaveText("Your tested work: built with guidance");
  await page.getByText("Try a fresh construction", { exact: true }).click();
  await page.getByRole("button", { name: "Start a fresh attempt", exact: true }).click();
  await expect(page.locator("[data-piece]")).toHaveCount(1);
  await expect(page.getByRole("list", { name: "Workshop hints from Botie" })).toHaveCount(0);
  await openWorkspaceControls(page);
  await expect(page.getByRole("button", { name: "Undo", exact: true }).first()).toBeDisabled();
  await buildMean(page);
  await expect(evidence.locator("summary")).toHaveText("Your tested work: built independently");
  await evidence.locator("summary").click();
  await expect(evidence.getByRole("listitem")).toHaveCount(2);
  await expect(evidence.getByRole("listitem").nth(0)).toContainText("Construction passed with Botie's help.");
  await expect(evidence.getByRole("listitem").nth(1)).toContainText("Construction passed independently.");
  await waitForAccountSync(page); await page.reload(); await waitForAccountReady(page);
  await openLessonNotes(page);
  await expect(evidence.locator("summary")).toHaveText("Your tested work: built independently");
  await evidence.locator("summary").click();
  await expect(evidence.getByRole("listitem")).toHaveCount(2);
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(evidence.getByRole("listitem")).toHaveCount(2);
});
