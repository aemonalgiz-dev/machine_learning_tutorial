import { test, expect, type Page } from "@playwright/test";
import { assemble, type Construction } from "../lib/builds/engine";
import { DELIVERY_PREDICTOR_BUILD } from "../lib/builds/regression-journey";
import { TOOLS } from "../lib/builds/tools";

async function wire(page: Page, from: string, to: string, fromIndex?: number) {
  const output = page.getByRole("button", { name: from, exact: true });
  await (fromIndex === undefined ? output : output.nth(fromIndex)).click();
  await page.getByRole("button", { name: to, exact: true }).click();
}

async function disableSignalAnimation(page: Page) {
  const controls = page.locator("summary:visible").filter({ hasText: "Examples, experiments and workspace controls" });
  await controls.click();
  await page.getByRole("checkbox", { name: "Animate signals", exact: true }).uncheck();
  await controls.click();
}

async function seedPredictor(page: Page, graph: Construction) {
  await page.addInitScript(savedGraph => {
    const key = "workshop:regression-delivery-rule:v1";
    const storageKey = `fitlab.learning.v1:guest:${key}`;
    if (localStorage.getItem(storageKey)) return;
    const value = {
      graph: savedGraph, attemptId: "test-draft", undo: [], redo: [], caseIndex: 0,
      results: {}, tested: {}, customData: null, prediction: "", hintsShown: 0,
      example: false, animate: false, zoom: .75,
    };
    localStorage.setItem(storageKey, JSON.stringify({ key, value, revision: 0, mutationId: "test-fixture", dirty: true }));
  }, graph);
}

test("dispatch follows a hand-wired machine, exposes omitted preparation, and traces its repair", async ({ page }) => {
  await page.goto("/lab/simple-linear-regression");
  await disableSignalAnimation(page);
  const dispatch = page.getByRole("region", { name: "The waiting orders", exact: true });
  await dispatch.getByRole("button", { name: "Run dispatch batch", exact: true }).click();
  await expect(dispatch.getByText(/dispatch machine needs (an input|a repair)/)).toBeVisible();
  for (const name of ["Delivery distance (km)", "Multiply", "Set a constant"]) {
    await page.getByRole("button", { name, exact: true }).click();
  }
  await page.getByLabel("Set a constant Number", { exact: true }).fill("2");
  await wire(page, "Delivery distance (km) output", "Multiply input 1: Value");
  await wire(page, "Set a constant output", "Multiply input 2: Multiplier");
  await wire(page, "Multiply output", "Result input 1: Your result");
  await dispatch.getByRole("button", { name: "Run dispatch batch", exact: true }).click();
  const first = dispatch.getByRole("button", { name: /Order 1 · 0.25 km/ });
  await expect(first).toContainText("Promised: 0.5 min");
  await expect(first).toContainText("6 min late");
  await first.click();
  const trace = dispatch.locator('[aria-label="Delivery calculation trace"]');
  await expect(trace).toContainText("Multiply");
  await expect(trace).toContainText("Inputs: 0.25, 2");
  await expect(trace).toContainText("Output: 0.5");
  await expect(trace).not.toContainText("Add");

  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("button", { name: "Set a constant", exact: true }).click();
  await page.getByLabel("Set a constant Number", { exact: true }).nth(1).fill("6");
  await wire(page, "Multiply output", "Add input 1: First contribution");
  await wire(page, "Set a constant output", "Add input 2: Second contribution", 1);
  await wire(page, "Add output", "Result input 1: Your result");
  await expect(dispatch.getByText(/Run this batch again/)).toBeVisible();
  await expect(first).toHaveCount(0);
  await expect(dispatch.getByRole("button", { name: "Run dispatch batch", exact: true })).toBeDisabled();
  await dispatch.getByRole("radio", { name: "Later", exact: true }).check();
  await dispatch.getByRole("button", { name: "Run dispatch batch", exact: true }).click();
  await expect(first).toContainText("Promised: 6.5 min");
  await expect(first).toContainText("Arrived as promised");
  await first.click();
  await expect(trace).toContainText("Add");
  await expect(trace).toContainText("Inputs: 0.5, 6");
  await expect(trace).toContainText("Output: 6.5");
});

test("unrepaired and untested checkers cannot unlock validation evidence", async ({ page }) => {
  await seedPredictor(page, assemble(DELIVERY_PREDICTOR_BUILD.recipe, TOOLS));
  await page.goto("/lab/simple-linear-regression");
  const stages = page.getByRole("navigation", { name: "Delivery journey stages" });
  await stages.getByRole("button", { name: "Choose a model", exact: true }).click();
  const compare = page.getByRole("button", { name: "Compare on separate validation deliveries", exact: true });
  await expect(compare).toBeDisabled();
  await expect(page.getByRole("table", { name: "Validation arrivals and promises", exact: true })).toHaveCount(0);
  await page.getByRole("radio", { name: "Your dispatch machine", exact: true }).check();
  await compare.click();
  await expect(page.getByText(/Test your error checker in Measure the mistakes/)).toBeVisible();
  await stages.getByRole("button", { name: "Measure the mistakes", exact: true }).click();
  await disableSignalAnimation(page);
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.locator('[data-testid="construction-counter"]:visible')).toHaveText("1 passed · 3 failed · 0 not run");
  await expect(page.getByText(/Your error checker is installed in dispatch/)).toHaveCount(0);
  for (const name of ["Absolute value", "Mean"]) await page.getByRole("button", { name, exact: true }).click();
  await wire(page, "Subtract output", "Absolute value input 1: Difference");
  await wire(page, "Absolute value output", "Mean input 1: Numbers");
  await wire(page, "Mean output", "Result input 1: Your result");
  // A working preview alone is not a recorded construction test.
  await stages.getByRole("button", { name: "Choose a model", exact: true }).click();
  await compare.click();
  await expect(page.getByText(/Test your error checker in Measure the mistakes/)).toBeVisible();
  await expect(page.getByRole("table", { name: "Validation arrivals and promises", exact: true })).toHaveCount(0);
  await stages.getByRole("button", { name: "Measure the mistakes", exact: true }).click();
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.locator('[data-testid="construction-counter"]:visible')).toHaveText("4 passed · 0 failed · 0 not run");
  await expect(page.getByText(/Your error checker is installed in dispatch/)).toBeVisible();
  const dispatch = page.getByRole("region", { name: "Promises from your current machine", exact: true });
  await dispatch.getByRole("button", { name: "Run dispatch batch", exact: true }).click();
  await expect(dispatch.getByTestId("dispatch-score")).toHaveText("Your installed checker: 0.4 min");
  // A later wire edit invalidates the installation until the edited checker passes.
  await wire(page, "Add a list output", "Result input 1: Your result");
  await expect(page.getByText(/Your error checker is installed in dispatch/)).toHaveCount(0);
  await stages.getByRole("button", { name: "Choose a model", exact: true }).click();
  await compare.click();
  await expect(page.getByText(/Test your error checker in Measure the mistakes/)).toBeVisible();
  await stages.getByRole("button", { name: "Try fresh deliveries", exact: true }).click();
  await expect(page.getByTestId("final-delivery-score")).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Skills demonstrated", exact: true })).toHaveCount(0);
});

test("a disconnected saved predictor fails dispatch without substituting a reference model", async ({ page }) => {
  const graph = assemble(DELIVERY_PREDICTOR_BUILD.recipe, TOOLS);
  graph.connections = graph.connections.filter(wire => wire.to !== "output");
  await seedPredictor(page, graph);
  await page.goto("/lab/simple-linear-regression");
  const dispatch = page.getByRole("region", { name: "The waiting orders", exact: true });
  await dispatch.getByRole("button", { name: "Run dispatch batch", exact: true }).click();
  await expect(dispatch.getByText(/dispatch machine needs a repair/)).toBeVisible();
  await expect(dispatch.getByTestId("dispatch-score")).toHaveCount(0);
  await expect(dispatch.getByRole("button", { name: /Order 1/ })).toHaveCount(0);
});

test("an unreadable saved comparison returns to a usable workshop without exposing a final report", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    const key = "delivery-journey:v2";
    const value = {
      stage: 4, machineName: "My dispatch machine", metric: "absolute",
      runs: 1, predictorTested: false, scoreTested: "", outlierGuess: "", lateMinutes: 16,
      outlierRun: false, selection: "line", selectionReason: "validation",
      comparison: { graph: { pieces: [], connections: [] }, metric: "absolute" },
      commitment: { model: "line", reason: "validation" },
    };
    localStorage.setItem(`fitlab.learning.v1:guest:${key}`, JSON.stringify({ key, value, revision: 0, mutationId: "damaged-draft", dirty: true }));
  });
  await page.goto("/lab/simple-linear-regression");
  await expect(page.getByRole("heading", { name: "How long should we tell the customer?", exact: true })).toBeVisible();
  await expect(page.getByTestId("final-delivery-score")).toHaveCount(0);
  await page.getByRole("navigation", { name: "Delivery journey stages" }).getByRole("button", { name: "Measure the mistakes", exact: true }).click();
  await expect(page.getByRole("heading", { name: "The checker says zero. Did we keep our promises?", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
