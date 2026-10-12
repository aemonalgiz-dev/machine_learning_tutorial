import { test, expect } from "@playwright/test";

test("saved links still open the renamed explanation and practice sections", async ({ page }) => {
  await page.goto("/concepts/greedy-coverage#part-6-where-the-method-stops-being-defined");
  await expect(page.getByRole("heading", { name: "Part 6. What Coverage Leaves Out of a Word", exact: true })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Coverage decision", exact: true })).toBeVisible();

  await page.goto("/concepts/rolling-forecast-validation#practice-work-through-the-problem-with-numpy");
  await expect(page.getByRole("heading", { name: "Practice. Replay Forecast Origins and Compare Horizons", exact: true })).toBeVisible();
  await expect(page.locator(".cm-editor").first()).toBeVisible();
});

test("the named array experiment still calculates and resets the displayed quantity", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/concepts/numpy-arrays#full-example");
  const experiment = page.getByRole("region", { name: "Explore the lesson calculation" });
  const output = experiment.getByRole("heading", { name: "Fahrenheit readings, in greenhouse order", exact: true }).locator("..");
  await experiment.getByRole("spinbutton").first().fill("0");
  await expect(output.getByText("32", { exact: true })).toBeVisible();
  await experiment.getByRole("button", { name: "Reset this example", exact: true }).click();
  await expect(experiment.getByRole("spinbutton").first()).not.toHaveValue("0");
  await expect(output.getByText("32", { exact: true })).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 860 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
