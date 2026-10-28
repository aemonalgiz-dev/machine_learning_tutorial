import { test, expect } from "@playwright/test";
import { journeyPlans } from "../lib/builds/journeys";
import { journeyFor } from "../lib/builds/journey";
import { constructionHints } from "../lib/builds/coaching";
import { buildById } from "../lib/builds/catalog";
import { caseLabel } from "../lib/builds/case-labels";
import { freshJourneyBuild } from "../lib/builds/journey-fresh";

test("authored workshop hints reach the construction, changed case and original workspace", () => {
  for (const [id, plan] of Object.entries(journeyPlans)) {
    const hints = plan.construction.hints ?? buildById[id].hints;
    expect(hints?.length, id).toBeGreaterThan(0);
    expect(new Set(hints).size, id).toBe(hints?.length);
    const journey = journeyFor(id);
    expect(constructionHints(journey.challenges.construction), id).toEqual(hints);
    expect(constructionHints(journey.challenges.variation.build), id).toEqual(hints);
    expect(constructionHints(buildById[id]), id).toEqual(hints);
    expect(constructionHints(freshJourneyBuild(journey.build, journey.fresh!)), id).toEqual(hints);
    if (plan.preparation?.hints) {
      expect(constructionHints(journey.challenges.preparation!.build), id).toEqual(plan.preparation.hints);
    }
  }
});

test("a corrected case caption leaves the stored case identity intact", () => {
  const build = buildById["class-imbalance"];
  const snapshot = JSON.stringify({ recipe: build.recipe, cases: build.cases });
  const sample = build.cases.find(sample => sample.name === "Equal class recalls")!;
  expect(caseLabel(build, sample)).toBe("Different class sizes and recalls");
  expect(JSON.stringify({ recipe: build.recipe, cases: build.cases })).toBe(snapshot);
  expect(caseLabel(build, build.cases[0])).toBe(build.cases[0].name);
});

test("the exam workshop introduces its supplied score and shows Botie's problem-specific hints", async ({ page }) => {
  const data = journeyFor("logistic-regression");
  await page.goto("/lab/logistic-regression");
  await page.getByRole("navigation", { name: "Journey stages", exact: true })
    .getByRole("button", { name: data.plan!.construction.title, exact: true }).click();
  const workshop = page.getByTestId("construction-workshop").filter({ visible: true });
  await expect(workshop).toContainText("The exam model supplies a score.");
  await expect(workshop).toContainText("The supplied exam score can be negative or larger than one.");
  await workshop.getByRole("button", { name: "Ask Botie for a hint", exact: true }).click();
  await expect(workshop.getByRole("list", { name: "Workshop hints from Botie", exact: true }))
    .toContainText(data.plan!.construction.hints![0]);
  await workshop.getByText("Stuck? Inspect a worked construction", { exact: true }).click();
  await workshop.getByRole("button", { name: "Assemble an example", exact: true }).click();
  await workshop.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(workshop.getByTestId("construction-counter")).toContainText("3 passed");
  await expect(workshop.getByTestId("construction-counter")).toContainText("0 failed");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto("/lab/class-imbalance");
  const classPlan = journeyFor("class-imbalance").plan!;
  await page.getByRole("navigation", { name: "Journey stages", exact: true })
    .getByRole("button", { name: classPlan.construction.title, exact: true }).click();
  await page.locator("summary:visible").filter({ hasText: "Examples, experiments and workspace controls" }).click();
  const exampleNames = page.getByRole("combobox", { name: "Active workshop example", exact: true });
  await expect(exampleNames.getByRole("option", { name: "Different class sizes and recalls", exact: true })).toHaveCount(1);
  await expect(exampleNames.getByRole("option", { name: "Equal class recalls", exact: true })).toHaveCount(0);
});
