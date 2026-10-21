import { expect, test } from "@playwright/test";
import { openFullWorkshop } from "./helpers/open-workshop";
import { buildById } from "../lib/builds/catalog";

test("failed tests are visible beside the controls and on Result, with details reachable in fullscreen", async ({ page }, testInfo) => {
  await page.goto("/lab/statistics");
  const workshop = page.getByTestId("construction-workshop");
  const summary = workshop.getByTestId("workshop-test-summary");
  await expect(summary).toContainText("Ready to test");
  await workshop.getByRole("button", { name: "Expand floor", exact: true }).click();
  await workshop.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(summary).toHaveAttribute("data-result", "fail");
  await expect(summary).toContainText("2 examples failed");
  await expect(summary).toBeInViewport();
  await expect(workshop.getByRole("group", { name: "Result machine", exact: true })).toContainText("Failed");
  await summary.getByRole("button", { name: "See failed examples", exact: true }).click();
  const results = workshop.getByTestId("workshop-example-result");
  await expect(results).toHaveCount(2);
  for (const result of await results.all()) {
    await expect(result).toHaveAttribute("data-result", "fail");
    await expect(result).toContainText("Required result");
    await expect(result).toContainText("Connect a round output");
  }
  await expect(workshop.locator("summary", { hasText: /^Examples and results$/ })).toBeFocused();
  await workshop.getByRole("button", { name: "Close details", exact: true }).click();
  await page.screenshot({ path: testInfo.outputPath("failed-fullscreen.png") });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(summary).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const floor = await workshop.getByLabel("Construction floor", { exact: true }).boundingBox();
    expect(floor!.height).toBeGreaterThan(400);
  }
  await page.screenshot({ path: testInfo.outputPath("failed-mobile.png") });
});

test("passed checks stay valid after moving a piece, but edits need a new test", async ({ page }, testInfo) => {
  await openFullWorkshop(page, "workshop-guide");
  await page.getByRole("checkbox", { name: "Animate signals", exact: true }).uncheck();
  await page.getByText("Stuck? Inspect a worked construction", { exact: true }).click();
  await page.getByRole("button", { name: "Assemble an example", exact: true }).click();
  const summary = page.getByTestId("workshop-test-summary");
  const output = page.getByRole("group", { name: "Result machine", exact: true });
  await expect(summary).toContainText("Ready to test");
  await page.getByRole("button", { name: "Run this example", exact: true }).click();
  await expect(summary.getByTestId("construction-counter")).toHaveText("1 passed · 0 failed · 2 not run");
  await expect(summary).not.toContainText("All examples passed");
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(summary).toContainText("All examples passed");
  await expect(output).toContainText("Passed");
  await page.getByRole("button", { name: "Inspect or move Result", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(summary).toHaveAttribute("data-result", "pass");
  await summary.getByRole("button", { name: "See results", exact: true }).click();
  await expect(page.getByTestId("workshop-example-result").locator('[data-result="pass"]')).toHaveCount(3);
  await page.getByRole("button", { name: "Expand floor", exact: true }).click();
  await page.screenshot({ path: testInfo.outputPath("passed-fullscreen.png") });
  await page.getByRole("button", { name: "Return to lesson", exact: true }).click();
  const setting = page.getByLabel("Set a constant Number", { exact: true });
  await setting.fill("-");
  await expect(summary).toContainText("Finish the input to test again");
  await expect(output).not.toContainText("Passed");
  await setting.fill("3");
  await setting.press("Enter");
  await expect(summary).toContainText("Ready to test");
  await expect(summary.getByTestId("construction-counter")).toHaveText("0 passed · 0 failed · 3 not run");
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(summary).toHaveAttribute("data-result", "fail");
  await expect(output).toContainText("Failed");
});

test("custom inputs never display the lesson's pass badge as their own result", async ({ page }) => {
  await openFullWorkshop(page, "workshop-guide");
  await page.getByText("Stuck? Inspect a worked construction", { exact: true }).click();
  await page.getByRole("button", { name: "Assemble an example", exact: true }).click();
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await page.getByText("Try your own inputs", { exact: true }).click();
  await page.getByRole("button", { name: "Experiment with these inputs", exact: true }).click();
  await page.getByLabel("Sensor reading", { exact: true }).fill("50");
  const summary = page.getByTestId("workshop-test-summary");
  await expect(summary).toContainText("Your experiment is ungraded");
  await expect(summary).toContainText("Lesson examples:");
  await expect(summary).toHaveAttribute("data-result", "pending");
  await expect(page.getByRole("group", { name: "Result machine", exact: true })).not.toContainText("Passed");
  await page.getByRole("button", { name: "Back to lesson examples", exact: true }).click();
  await expect(summary).toContainText("All examples passed");
});

test("mixed results identify the failed cases and remain readable in the light theme", async ({ page }, testInfo) => {
  await openFullWorkshop(page, "workshop-guide");
  await page.getByText("Stuck? Inspect a worked construction", { exact: true }).click();
  await page.getByRole("button", { name: "Assemble an example", exact: true }).click();
  // A fixed answer matches one reading, but cannot double the other readings.
  const setting = page.getByLabel("Set a constant Number", { exact: true });
  await setting.fill(String(buildById["workshop-guide"].cases[0].expected));
  await setting.press("Enter");
  await page.getByRole("button", { name: "Set a constant output", exact: true }).click();
  await page.getByRole("button", { name: "Result input 1: Your result", exact: true }).click();
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  const summary = page.getByTestId("workshop-test-summary");
  await expect(summary.getByTestId("construction-counter")).toHaveText("1 passed · 2 failed · 0 not run");
  await expect(summary).toContainText("2 examples failed");
  await page.getByRole("button", { name: "Expand floor", exact: true }).click();
  await summary.getByRole("button", { name: "See failed examples", exact: true }).click();
  const results = page.getByTestId("workshop-example-result");
  await expect(results.nth(0)).toHaveAttribute("data-result", "pass");
  await expect(results.nth(1)).toHaveAttribute("data-result", "fail");
  await expect(results.nth(2)).toHaveAttribute("data-result", "fail");
  await expect(results.nth(1)).toContainText("Shown on the floor");
  await results.nth(0).getByRole("button").click();
  await expect(page.getByRole("group", { name: "Result machine", exact: true })).toHaveAttribute("data-result", "pass");
  await expect(summary).toHaveAttribute("data-result", "fail");
  await page.evaluate(() => { document.documentElement.dataset.theme = "light"; });
  await page.screenshot({ path: testInfo.outputPath("mixed-results-light.png") });
});
