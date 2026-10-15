import { test, expect, type Page } from "@playwright/test";
import path from "node:path";
import { journeyFor } from "../lib/builds/journey";
import { assemble } from "../lib/builds/engine";
import { TOOLS } from "../lib/builds/tools";
import { journeyDraftId } from "../components/lab/JourneyContinuity";
import { workshopRecordKey } from "../lib/builds/workshop-session";

async function seedIncorrectDivisor(page: Page) {
  const data = journeyFor("statistics");
  const graph = assemble(data.build.recipe, TOOLS);
  const total = graph.pieces.find(piece => piece.tool === "total")!;
  const divide = graph.pieces.find(piece => piece.tool === "divide")!;
  graph.connections = graph.connections.map(wire => wire.to === divide.id && wire.port === 1 ? { ...wire, from: total.id } : wire);
  const key = workshopRecordKey(data.challenges.construction, journeyDraftId(data.build, "construction", data.plan!.investigation.caseIndex));
  await page.addInitScript(({ key, graph }) => {
    if (sessionStorage.getItem("repair-layout-seeded")) return;
    localStorage.setItem(`fitlab.learning.v1:guest:${key}`, JSON.stringify({
      key, value: { graph, undo: [], redo: [], caseIndex: 0, results: {}, tested: {}, customData: null, prediction: "", hintsShown: 0, example: false, animate: false, zoom: .75 },
      revision: 0, mutationId: "repair-layout-seed", dirty: false,
    }));
    sessionStorage.setItem("repair-layout-seeded", "yes");
  }, { key, graph });
}

test("a fresh-case repair keeps the floor ahead of its preserved first-run evidence", async ({ page }) => {
  await seedIncorrectDivisor(page);
  await page.goto("/lab/statistics");
  await page.locator("summary").filter({ hasText: "Weeks with no recorded deaths" }).click();
  const fresh = page.getByTestId("journey-fresh-case");
  await expect(fresh.getByText("Required result", { exact: true })).toHaveCount(0);
  await fresh.getByRole("textbox", { name: "What result should your machine produce for this case?", exact: true }).fill("6");
  await fresh.getByRole("button", { name: "Save my prediction and test the next case", exact: true }).click();

  const evidence = fresh.getByTestId("journey-fresh-evidence");
  const first = fresh.getByTestId("journey-fresh-first-result");
  const floor = fresh.getByTestId("construction-floor");
  await expect(evidence).not.toHaveAttribute("open");
  await expect(first).toBeHidden();
  await expect(floor).toBeVisible();
  await fresh.screenshot({ path: path.join(process.cwd(), "page_feedback", "fresh-repair-compact-desktop.png") });
  expect(await floor.evaluate((element, evidenceId) => !!(element.compareDocumentPosition(document.querySelector(`[data-testid="${evidenceId}"]`)!) & Node.DOCUMENT_POSITION_FOLLOWING), "journey-fresh-evidence")).toBe(true);
  await evidence.locator("summary").first().click();
  await expect(first).toContainText("0 of 4 checks passed on that first run.");
  await expect(first).toContainText("Your prediction before testing");
  await evidence.locator("summary").first().click();

  await fresh.getByRole("button", { name: "Count items output", exact: true }).click();
  await fresh.getByRole("button", { name: "Divide input 2: Divisor", exact: true }).click();
  await fresh.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(fresh.getByTestId("construction-counter")).toHaveText("4 passed · 0 failed · 0 not run");
  await expect(fresh.getByText(/The repair passes this case and the earlier checks/)).toBeVisible();
  await expect(first).toBeHidden();
  await evidence.locator("summary").first().click();
  await expect(first).toContainText("0 of 4 checks passed on that first run.");
  const snapshot = await page.evaluate(() => {
    const key = Object.keys(localStorage).find(key => key.startsWith("fitlab.learning.v1:guest:journey-fresh:statistics:"))!;
    return JSON.parse(localStorage.getItem(key)!).value;
  });
  expect(snapshot.committedPrediction).toBe("6");
  expect(snapshot.firstRun.trace.output).toBe(1);
  expect(snapshot.firstRun.outcomes).toEqual([false, false, false, false]);
  await evidence.locator("summary").first().click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(floor).toBeVisible();
});

test("committing a diagnostic decision opens the workspace and folds the earlier comparison away", async ({ page }) => {
  await seedIncorrectDivisor(page);
  await page.goto("/lab/statistics");
  await page.getByRole("navigation", { name: "Journey stages" }).getByRole("button", { name: "Three weeks instead of five", exact: true }).click();
  await page.getByRole("textbox", { name: "Mean deaths per recorded week", exact: true }).fill("32");
  await page.getByRole("button", { name: "Save my prediction and try it", exact: true }).click();
  const diagnostic = page.getByTestId("journey-diagnostic");
  await diagnostic.getByRole("button", { name: "Run my construction on this case", exact: true }).click();
  await expect(diagnostic.getByTestId("journey-diagnostic-output")).toHaveText("1");
  await diagnostic.getByRole("combobox", { name: "Which part will you change, or keep?", exact: true }).selectOption("connections");
  await diagnostic.getByRole("textbox", { name: /What do you expect your next construction/ }).fill("Use the number of recorded weeks as the divisor.");
  await diagnostic.getByRole("button", { name: "Try this decision in the workshop", exact: true }).click();
  const evidence = diagnostic.getByTestId("journey-diagnostic-evidence");
  await expect(evidence).not.toHaveAttribute("open");
  await expect(diagnostic.getByTestId("journey-diagnostic-output")).toBeHidden();
  await expect(diagnostic.getByTestId("construction-floor")).toBeVisible();
  await expect(page.getByText("Required result", { exact: true })).toHaveCount(0);
  await evidence.locator("summary").first().click();
  await expect(diagnostic.getByText("Use the number of recorded weeks as the divisor.", { exact: true })).toBeVisible();
  await expect(diagnostic.getByTestId("journey-diagnostic-output")).toHaveText("1");
  await diagnostic.getByRole("button", { name: "Reconsider this decision", exact: true }).click();
  await expect(diagnostic.getByRole("textbox", { name: /What do you expect your next construction/ })).toHaveValue("Use the number of recorded weeks as the divisor.");
  await expect(diagnostic.getByTestId("construction-floor")).toHaveCount(0);
  await diagnostic.getByRole("button", { name: "Try this decision in the workshop", exact: true }).click();
  await expect(evidence).not.toHaveAttribute("open");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await diagnostic.screenshot({ path: path.join(process.cwd(), "page_feedback", "diagnostic-repair-compact-mobile.png") });
});
