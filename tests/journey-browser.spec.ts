import { test, expect, type Page } from "@playwright/test";

async function wire(page: Page, output: string, input: string) {
  await page.getByRole("button", { name: output, exact: true }).click();
  await page.getByRole("button", { name: input, exact: true }).click();
}

async function disableSignalAnimation(page: Page) {
  const controls = page.locator("summary:visible").filter({ hasText: "Examples, experiments and workspace controls" });
  await controls.click();
  await page.getByRole("checkbox", { name: "Animate signals", exact: true }).uncheck();
  await controls.click();
}

test("a learner predicts a shorter reporting period and carries their mean into bagging", async ({ page }) => {
  await page.goto("/lab/statistics");
  for (const name of ["Deaths recorded each week", "Add a list", "Count items", "Divide"]) await page.getByRole("button", { name, exact: true }).click();
  await wire(page, "Deaths recorded each week output", "Add a list input 1: Numbers");
  await wire(page, "Deaths recorded each week output", "Count items input 1: Items");
  await wire(page, "Add a list output", "Divide input 1: Amount");
  await wire(page, "Count items output", "Divide input 2: Divisor");
  await wire(page, "Divide output", "Result input 1: Your result");
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("2 passed · 0 failed · 0 not run");
  await page.getByRole("navigation", { name: "Journey stages" }).getByRole("button", { name: "Three weeks instead of five", exact: true }).click();
  await expect(page.getByText("Required result", { exact: true })).toHaveCount(0);
  await page.getByRole("textbox", { name: "Mean deaths per recorded week", exact: true }).fill("32");
  await page.getByRole("button", { name: "Save my prediction and try it", exact: true }).click();
  await page.getByRole("button", { name: "Run my construction on this case", exact: true }).click();
  await expect(page.getByTestId("journey-diagnostic-result")).toContainText("Your construction already handles this change");
  await page.getByRole("combobox", { name: "Which part will you change, or keep?", exact: true }).selectOption("keep");
  await page.getByRole("textbox", { name: /What do you expect your next construction/ }).fill("The count follows the three supplied weeks, so the mean remains 32.");
  await page.getByRole("button", { name: "Try this decision in the workshop", exact: true }).click();
  await expect(page.getByText("Required result", { exact: true })).toHaveCount(0);
  await expect(page.locator("[data-piece]")).toHaveCount(5);
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("3 passed · 0 failed · 0 not run");
  await expect(page.getByText(/Your prediction agrees with the tested result/)).toBeVisible();
  await page.reload();
  await page.locator("summary").filter({ hasText: /^Your starting explanation$/ }).click();
  await expect(page.getByText("Your prediction before opening this case", { exact: true })).toBeVisible();
  await expect(page.getByTestId("construction-counter")).toHaveText("3 passed · 0 failed · 0 not run");
  await page.goto("/");
  await page.getByRole("link", { name: "Return to your workshop →", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("3 passed · 0 failed · 0 not run");
  await page.goto("/lab/bagging");
  await page.getByText("Use an earlier construction", { exact: true }).click();
  await page.getByRole("button", { name: "Bring my Average a supplied collection", exact: true }).click();
  await expect(page.getByRole("button", { name: "Predictions from three models output", exact: true })).toBeVisible();
  await wire(page, "Divide output", "Result input 1: Your result");
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("2 passed · 0 failed · 0 not run");
});

test("regression keeps final outcomes behind a recorded choice and preserves that choice", async ({ page }) => {
  await page.goto("/lab/simple-linear-regression");
  const stages = page.getByRole("navigation", { name: "Delivery journey stages" });
  await stages.getByRole("button", { name: "Try fresh deliveries", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Committed model:/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Choose a model using validation data", exact: true }).click();
  await expect(page.getByRole("button", { name: "Compare on separate validation deliveries", exact: true })).toBeDisabled();
  await expect(page.getByRole("table", { name: "Validation arrivals and promises", exact: true })).toHaveCount(0);
  await page.getByRole("radio", { name: "Your dispatch machine", exact: true }).check();
  await page.getByRole("button", { name: "Compare on separate validation deliveries", exact: true }).click();
  await expect(page.getByText("Build a dispatch machine in Estimate a delivery before comparing its predictions.", { exact: true })).toBeVisible();
  await stages.getByRole("button", { name: "Estimate a delivery", exact: true }).click();
  await page.locator("summary:visible").filter({ hasText: "Stuck? Inspect a worked construction" }).click();
  await page.getByRole("button", { name: "Assemble an example", exact: true }).click();
  await disableSignalAnimation(page);
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.locator('[data-testid="construction-counter"]:visible')).toHaveText("4 passed · 0 failed · 0 not run");
  await stages.getByRole("button", { name: "Measure the mistakes", exact: true }).click();
  await disableSignalAnimation(page);
  for (const name of ["Absolute value", "Mean"]) await page.getByRole("button", { name, exact: true }).click();
  await wire(page, "Subtract output", "Absolute value input 1: Difference");
  await wire(page, "Absolute value output", "Mean input 1: Numbers");
  await wire(page, "Mean output", "Result input 1: Your result");
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.locator('[data-testid="construction-counter"]:visible')).toHaveText("4 passed · 0 failed · 0 not run");
  await expect(page.getByText(/Your error checker is installed in dispatch/)).toBeVisible();
  await stages.getByRole("button", { name: "Choose a model", exact: true }).click();
  await expect(page.getByRole("table", { name: "Validation arrivals and promises", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Compare on separate validation deliveries", exact: true }).click();
  await expect(page.getByRole("table", { name: "Validation arrivals and promises", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Commit my model and open the final deliveries", exact: true })).toBeDisabled();
  await page.getByRole("radio", { name: "The error on the separate validation deliveries.", exact: true }).check();
  await page.getByRole("button", { name: "Commit my model and open the final deliveries", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Committed model: Your dispatch machine", exact: true })).toBeVisible();
  await expect(page.getByTestId("final-delivery-score")).toHaveText("Final absolute error: 0.4 min");
  await stages.getByRole("button", { name: "Measure the mistakes", exact: true }).click();
  await page.getByRole("spinbutton", { name: "Dispatch constant 2", exact: true }).fill("100");
  await stages.getByRole("button", { name: "Try fresh deliveries", exact: true }).click();
  await expect(page.getByTestId("final-delivery-score")).toHaveText("Final absolute error: 0.4 min");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Committed model: Your dispatch machine", exact: true })).toBeVisible();
  await expect(page.getByTestId("final-delivery-score")).toHaveText("Final absolute error: 0.4 min");
  await stages.getByRole("button", { name: "Choose a model", exact: true }).click();
  await expect(page.getByRole("radio", { name: "Your dispatch machine", exact: true })).toBeDisabled();
  const progress = await page.evaluate(() => {
    const entry = localStorage.getItem("fitlab.learning.v1:guest:journey-progress:simple-linear-regression:v1");
    return entry ? JSON.parse(entry).value : null;
  });
  expect(progress).not.toBeNull();
  expect(progress.transferred).toBeNull();
});
