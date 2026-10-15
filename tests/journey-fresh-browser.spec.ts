import { test, expect, type Locator } from "@playwright/test";
import path from "node:path";
import { journeyFor } from "../lib/builds/journey";
import { assemble } from "../lib/builds/engine";
import { TOOLS } from "../lib/builds/tools";
import { journeyDraftId } from "../components/lab/JourneyContinuity";
import { workshopRecordKey } from "../lib/builds/workshop-session";

async function wire(root: Locator, output: string, input: string) {
  await root.getByRole("button", { name: output, exact: true }).click();
  await root.getByRole("button", { name: input, exact: true }).click();
}

test("the fresh statistics check runs the current machine before repairs and retains the first failure", async ({ page }) => {
  const data = journeyFor("statistics");
  const olderVariationKey = workshopRecordKey(data.challenges.variation.build, journeyDraftId(data.build, "variation", data.plan!.investigation.caseIndex));
  await page.addInitScript(({ key, graph }) => localStorage.setItem(`fitlab.learning.v1:guest:${key}`, JSON.stringify({
    key, value: { graph }, revision: 0, mutationId: "older-variation", dirty: false,
  })), { key: olderVariationKey, graph: assemble(data.build.recipe, TOOLS) });
  await page.goto("/lab/statistics");
  const workshop = page.getByTestId("construction-workshop");
  for (const name of ["Deaths recorded each week", "Add a list", "Count items", "Divide"]) await workshop.getByRole("button", { name, exact: true }).click();
  await wire(workshop, "Deaths recorded each week output", "Add a list input 1: Numbers");
  await wire(workshop, "Deaths recorded each week output", "Count items input 1: Items");
  await wire(workshop, "Add a list output", "Divide input 1: Amount");
  await wire(workshop, "Add a list output", "Divide input 2: Divisor");
  await wire(workshop, "Divide output", "Result input 1: Your result");
  await page.locator("summary").filter({ hasText: "Weeks with no recorded deaths" }).click();
  const fresh = page.getByTestId("journey-fresh-case");
  await expect(fresh.getByText("Required result", { exact: true })).toHaveCount(0);
  await fresh.getByRole("textbox", { name: "What result should your machine produce for this case?", exact: true }).fill("6");
  await fresh.getByRole("button", { name: "Save my prediction and test the next case", exact: true }).click();
  const first = page.getByTestId("journey-fresh-first-result");
  await fresh.getByTestId("journey-fresh-evidence").locator("summary").first().click();
  await expect(first).toContainText("0 of 4 checks passed on that first run.");
  await expect(first.locator("div").filter({ has: page.getByText("Your construction produced", { exact: true }) })).toContainText("1");
  await wire(fresh, "Count items output", "Divide input 2: Divisor");
  await fresh.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(fresh.getByTestId("construction-counter")).toHaveText("4 passed · 0 failed · 0 not run");
  await expect(fresh).toContainText("The repair passes this case and the earlier checks.");
  await expect(first).toContainText("0 of 4 checks passed on that first run.");
  await expect(page.getByTestId("journey-evidence")).toHaveCount(0);
  await page.reload();
  await page.locator("summary").filter({ hasText: "Weeks with no recorded deaths" }).click();
  await fresh.getByTestId("journey-fresh-evidence").locator("summary").first().click();
  await expect(first).toContainText("0 of 4 checks passed on that first run.");
  await expect(fresh.getByTestId("construction-counter")).toHaveText("4 passed · 0 failed · 0 not run");
  const record = await page.evaluate(() => {
    const key = Object.keys(localStorage).find(key => key.startsWith("fitlab.learning.v1:guest:journey-fresh:statistics:"))!;
    return JSON.parse(localStorage.getItem(key)!).value;
  });
  expect(record.firstRun.trace.output).toBe(1);
  expect(record.firstRun.outcomes).toEqual([false, false, false, false]);
  await first.screenshot({ path: path.join(process.cwd(), "page_feedback", "statistics-fresh-first-run.png") });
  await first.scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(process.cwd(), "page_feedback", "statistics-fresh-check.png") });
});

test("a matrix construction retains row shape on a fresh order and records earlier guidance honestly", async ({ page }) => {
  const data = journeyFor("linear-algebra");
  const key = workshopRecordKey(data.challenges.construction, journeyDraftId(data.build, "construction", data.plan!.investigation.caseIndex));
  const graph = assemble(data.build.recipe, TOOLS);
  // Seed the learner's earlier guided draft. The new case itself is still run
  // through the visible prediction control and the real calculation engine.
  await page.addInitScript(({ key, graph }) => localStorage.setItem(`fitlab.learning.v1:guest:${key}`, JSON.stringify({
    key, value: { graph, undo: [], redo: [], caseIndex: 0, results: {}, tested: {}, customData: null, prediction: "", hintsShown: 1, example: false, animate: false, zoom: .75 },
    revision: 0, mutationId: "fresh-matrix-test", dirty: false,
  })), { key, graph });
  await page.goto("/lab/linear-algebra");
  await page.locator("summary").filter({ hasText: "One customer, fractional prices" }).click();
  const fresh = page.getByTestId("journey-fresh-case");
  await fresh.getByRole("textbox", { name: "What result should your machine produce for this case?", exact: true }).fill("[6]");
  await fresh.getByRole("button", { name: "Save my prediction and test the next case", exact: true }).click();
  await fresh.getByTestId("journey-fresh-evidence").locator("summary").first().click();
  await expect(page.getByTestId("journey-fresh-first-result")).toContainText("4 of 4 checks passed on that first run.");
  await expect(fresh).toContainText("Earlier guidance is recorded with this attempt.");
  await expect(page.getByTestId("journey-evidence").locator("summary")).toContainText("variation solved with guidance");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
