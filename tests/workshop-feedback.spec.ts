import { expect, test } from "@playwright/test";
import { journeyFor } from "../lib/builds/journey";

const missingResult = "Your result needs a number, list or other value from an earlier machine. Connect a round output to this input.";
const statistics = journeyFor("statistics").challenges.construction;

test("a new failed run brings Botie's feedback back after reading the challenge", async ({ page }) => {
  await page.goto("/lab/statistics");
  const workshop = page.getByTestId("construction-workshop");
  const run = workshop.getByRole("button", { name: "Test all examples", exact: true });
  const brief = workshop.locator('[aria-live="polite"]').first();

  await run.click();
  await expect(brief).toContainText(missingResult);
  await workshop.getByRole("button", { name: "Read the challenge", exact: true }).click();
  await expect(brief).toContainText(statistics.challenge);
  await expect(brief).not.toContainText(missingResult);

  await run.click();
  await expect(brief).toContainText(missingResult);
  await expect(workshop.getByRole("button", { name: "Read the challenge", exact: true })).toBeVisible();
  await expect(workshop.getByRole("button", { name: "Back to Botie's feedback", exact: true })).toHaveCount(0);
});

test("an expanded floor keeps the problem and example data reachable without leaving the workspace", async ({ page }) => {
  await page.goto("/lab/statistics");
  const workshop = page.getByTestId("construction-workshop");
  await workshop.getByRole("button", { name: "Expand floor", exact: true }).click();
  const returnButton = workshop.getByRole("button", { name: "Return to lesson", exact: true });
  await expect(returnButton).toBeVisible();
  await workshop.getByRole("button", { name: "Workshop details", exact: true }).click();

  const context = workshop.locator("details").filter({ has: page.locator("summary", { hasText: /^Context for this challenge$/ }) });
  // Clicking through the expanded workspace checks that these controls are not
  // left on the obscured lesson underneath it.
  await context.locator(":scope > summary").click();
  await expect(context.getByText(statistics.challenge, { exact: true })).toBeVisible();
  await expect(context.getByTestId("construction-context")).toHaveText(statistics.problem);

  const examples = workshop.locator("details").filter({ has: page.locator("summary", { hasText: /^Examples and results$/ }) });
  await examples.locator(":scope > summary").click();
  await expect(examples.getByText("Required result", { exact: true }).first()).toBeVisible();
  const firstCase = examples.getByRole("button").first();
  await expect(firstCase).toContainText("Deaths recorded each week");
  await firstCase.click();
  await expect(firstCase).toHaveAttribute("aria-pressed", "true");
  await workshop.getByRole("button", { name: "Workshop details", exact: true }).click();
  await returnButton.click();
  await expect(workshop.getByRole("button", { name: "Expand floor", exact: true })).toBeVisible();
});

test("embedded workshop failures offer a nearby action that reveals Botie's explanation", async ({ page }) => {
  await page.goto("/lab/simple-linear-regression");
  const workshop = page.getByTestId("construction-workshop").filter({ visible: true });
  const run = workshop.getByRole("button", { name: "Test all examples", exact: true });
  await run.click();
  await expect(workshop.getByTestId("construction-counter")).toContainText("4 failed");
  const readFeedback = workshop.getByRole("button", { name: "Read Botie's feedback", exact: true });
  await expect(readFeedback).toBeVisible();
  const runBounds = (await run.boundingBox())!;
  const feedbackBounds = (await readFeedback.boundingBox())!;
  expect(Math.abs(feedbackBounds.y - runBounds.y)).toBeLessThan(100);

  await readFeedback.click();
  const feedback = workshop.locator('[aria-live="polite"]').filter({ hasText: missingResult });
  await expect(feedback).toBeInViewport();
  await expect(feedback).toContainText(missingResult);
});

test("new fullscreen feedback is revealed even after the reference drawer was scrolled to the bottom", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/lab/statistics");
  const workshop = page.getByTestId("construction-workshop");
  await workshop.getByRole("button", { name: "Expand floor", exact: true }).click();
  const fullscreen = page.getByRole("dialog", { name: "Expanded workshop", exact: true });
  const detailsButton = fullscreen.getByRole("button", { name: "Workshop details", exact: true });
  await detailsButton.click();
  const drawer = fullscreen.getByRole("complementary", { name: "Workshop details", exact: true });
  await drawer.locator("summary", { hasText: /^Context for this challenge$/ }).click();
  await drawer.locator("summary", { hasText: /^Examples and results$/ }).click();
  await drawer.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await expect.poll(() => drawer.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  await detailsButton.click();
  await expect(drawer).not.toBeVisible();

  // This first run replaces the task text with an actual missing-input error.
  await fullscreen.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(fullscreen.getByTestId("construction-counter")).toContainText("2 failed");
  await fullscreen.getByRole("button", { name: "Read Botie's feedback", exact: true }).click();
  await expect(drawer).toBeFocused();
  await expect.poll(() => drawer.evaluate(element => element.scrollTop)).toBe(0);
  const feedback = drawer.locator('[aria-live="polite"]');
  await expect(feedback).toContainText(missingResult);
  await expect(feedback).toBeInViewport();
});
