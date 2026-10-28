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

test("a true-or-false attention question supplies its own model setup and Botie feedback", async ({ page }) => {
  await page.goto("/concepts/attention#questions-on-parts-1-and-2");
  const quiz = page.locator('[id="questions-on-parts-1-and-2"]');
  await expect(quiz).toBeVisible();
  const question = quiz.getByText("With two heads in this colour example, each head compares two coordinates and the two heads produce different share rows for the first red token.", { exact: true });
  for (let at = 0; at < 8 && !await question.isVisible(); at++) {
    await quiz.locator("button[aria-pressed]").first().click();
    const submit = quiz.getByRole("button", { name: "Submit this answer", exact: true });
    if (await submit.isVisible()) await submit.click();
    await quiz.getByRole("button", { name: "Next question", exact: true }).click();
  }
  await expect(question).toBeVisible();
  const setup = quiz.getByRole("group", { name: "Data for this question", exact: true });
  await expect(setup).toContainText("red = [1,0,0,0]");
  await expect(setup).toContainText("head 1 reads coordinates 0 and 1");
  await quiz.getByRole("button", { name: "True", exact: true }).click();
  await expect(quiz.getByRole("status", { name: "Botie's feedback", exact: true })).toContainText("That is right.");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await quiz.screenshot({ path: test.info().outputPath("attention-question-with-setup.png") });
});
