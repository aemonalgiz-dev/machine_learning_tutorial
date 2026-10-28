import { mockAccountBackend, waitForAccountReady, waitForAccountSync } from "./helpers/account-backend";
import { test, expect, type Page } from "@playwright/test";
import path from "node:path";

async function wire(page: Page, output: string, input: string) {
  await page.getByRole("button", { name: output, exact: true }).click();
  await page.getByRole("button", { name: input, exact: true }).click();
}

test.beforeEach(async ({ page }) => { await mockAccountBackend(page); });

test("diagnosis uses current edited pieces and tests a repaired graph against the known cases", async ({ page }) => {
  await page.goto("/lab/statistics"); await waitForAccountReady(page);
  for (const name of ["Deaths recorded each week", "Add a list", "Count items", "Divide"]) await page.getByRole("button", { name, exact: true }).click();
  await wire(page, "Deaths recorded each week output", "Add a list input 1: Numbers");
  await wire(page, "Deaths recorded each week output", "Count items input 1: Items");
  await wire(page, "Add a list output", "Divide input 1: Amount");
  await wire(page, "Count items output", "Divide input 2: Divisor");
  await wire(page, "Divide output", "Result input 1: Your result");
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("2 passed · 0 failed · 0 not run");
  // Change the real draft after its successful snapshot. A stale snapshot would
  // return 32; this wire now divides 96 by 96 and returns 1.
  await wire(page, "Add a list output", "Divide input 2: Divisor");
  await page.getByRole("navigation", { name: "Journey stages" }).getByRole("button", { name: "Three weeks instead of five", exact: true }).click();
  await page.getByRole("textbox", { name: "Mean deaths per recorded week", exact: true }).fill("32");
  await page.getByRole("button", { name: "Save my prediction and try it", exact: true }).click();
  await expect(page.getByText("Required result", { exact: true })).toHaveCount(0);
  await expect(page.getByTestId("construction-workshop")).toHaveCount(0);
  await page.getByRole("button", { name: "Run my construction on this case", exact: true }).click();
  const diagnostic = page.getByTestId("journey-diagnostic-result");
  await expect(diagnostic).toContainText("its result does not meet this case's objective");
  await expect(page.getByTestId("journey-diagnostic-output")).toHaveText("1");
  await page.getByRole("combobox", { name: "Which part will you change, or keep?", exact: true }).selectOption("connections");
  await page.getByRole("textbox", { name: /What do you expect your next construction/ }).fill("Using the number of weeks as divisor should return 32.");
  await page.getByTestId("journey-diagnostic").screenshot({ path: path.join(process.cwd(), "page_feedback", "journey-diagnostic-statistics.png") });
  await page.getByRole("button", { name: "Try this decision in the workshop", exact: true }).click();
  await expect(page.getByRole("group", { name: "Divide machine", exact: true }).getByRole("button", { name: "Divide input 2: Divisor", exact: true })).toContainText("From Add a list");
  await expect(page.getByText("Required result", { exact: true })).toHaveCount(0);
  await wire(page, "Count items output", "Divide input 2: Divisor");
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("3 passed · 0 failed · 0 not run");
  await expect(page.getByText("Required result", { exact: true })).toHaveCount(3);
  await page.getByTestId("journey-diagnostic-evidence").locator("summary").first().click();
  await expect(page.getByText(/These are now known examples/)).toBeVisible();
  await waitForAccountSync(page); await page.reload(); await waitForAccountReady(page);
  await page.getByTestId("journey-diagnostic-evidence").locator("summary").first().click();
  await expect(page.getByText("Using the number of weeks as divisor should return 32.", { exact: true })).toBeVisible();
  await expect(page.getByTestId("construction-counter")).toHaveText("3 passed · 0 failed · 0 not run");
});
