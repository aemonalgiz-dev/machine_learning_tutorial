import { test, expect } from "@playwright/test";
import { openFullWorkshop } from "./helpers/open-workshop";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { CURRICULUM } from "../lib/curriculum";
import { lessonOrder, courseSectionHref, lessonCount, lessonLocations } from "../lib/course-navigation";
import { expandedLessons } from "../lib/lessons";
import { TOOLS } from "../lib/builds/tools";
import { assemble, evaluate, same, type Data } from "../lib/builds/engine";
import { buildById } from "../lib/builds/catalog";

const sections: Record<string, number> = {
  "Time Series and Forecasting": 6, "Reinforcement Learning": 6,
  "Probabilistic Models and Uncertainty": 5, "Optimisation and Training": 5,
  "Recommendations and Ranking": 5, "Anomaly Detection": 4,
  "Graphs and Relational Learning": 5, "Causal Inference and Experiments": 4,
  "Deploying and Maintaining Models": 5, "Complete Projects": 3,
};
const lessons = expandedLessons.filter(lesson => Object.hasOwn(sections, lesson.section));
const run = (name: string, ...inputs: Data[]) => TOOLS[name].run(inputs, {});

test("ten new sections contain complete lessons and preserve the reinforcement introduction", () => {
  expect(CURRICULUM).toHaveLength(26);
  expect(lessonOrder).toHaveLength(208);
  expect(lessons).toHaveLength(47);
  for (const [title, count] of Object.entries(sections)) {
    const section = CURRICULUM.find(part => part.title === title)!;
    expect(lessonCount(section)).toBe(count);
    expect(section.intro.length).toBeGreaterThan(120);
    for (const topic of section.topics) expect(topic.blurb.length).toBeGreaterThan(50);
  }
  expect(lessonOrder.filter(href => href === "/concepts/reinforcement-learning")).toHaveLength(1);
  expect(lessonLocations["/concepts/reinforcement-learning"].sectionTitle).toBe("Reinforcement Learning");
  for (const lesson of lessons) {
    expect(lesson.parts.length).toBeGreaterThan(0);
    expect(lesson.parts.every(part=>part.title && part.paragraphs.some(text=>text.trim()))).toBe(true);
    expect(lesson.practice.length).toBeGreaterThan(0);
    expect(lesson.quiz.length).toBeGreaterThan(0);
    expect(lesson.quiz.every(question => question.given?.data)).toBe(true);
    const graph = assemble(lesson.build.recipe, TOOLS);
    expect(graph.pieces.length).toBeLessThanOrEqual(36);
    for (const fixture of lesson.build.cases) {
      const result = evaluate(graph, fixture.data, TOOLS);
      expect(result.error, `${lesson.id}: ${fixture.name}`).toBeUndefined();
      expect(same(result.output, fixture.expected), `${lesson.id}: ${fixture.name}`).toBe(true);
    }
  }
});

test("time and probability operations reject invalid inputs and preserve information boundaries", () => {
  expect(run("lagInputs", [2,5,9,14], 2)).toEqual([[2,5],[5,9]]);
  expect(run("lagTargets", [2,5,9,14], 2)).toEqual([9,14]);
  expect(run("lagReference", [2,5,9,14], 2)).toEqual([2,5]);
  expect(() => run("lagInputs", [1,2], 2)).toThrow(/shorter/);
  expect(() => run("lagInputs", [1,2], 0)).toThrow(/at least one/);
  expect(run("discountWeights", [5,9,4], 0)).toEqual([1,0,0]);
  expect(run("discountWeights", [5,9,4], 1)).toEqual([1,1,1]);
  expect(run("terminalContinuation", 100, 1)).toBe(0);
  expect(run("terminalContinuation", 100, 0)).toBe(100);
  expect(() => run("terminalContinuation", 100, .5)).toThrow(/zero or one/);
  expect(() => run("probabilityRows", [[.2,.2]])).toThrow(/sum to one/);
  expect(() => run("normaliseWeights", [0,0])).toThrow(/positive total/);
  expect(() => run("openProbabilities", [0,.5])).toThrow(/overlap/);
  expect(() => run("positiveReciprocal", [1,0])).toThrow(/positive/);
});

test("solves, graph scaling and region counts agree with independently known cases", () => {
  const solved = run("solveLinear", [[0,2],[3,1]], [4,7]) as number[];
  expect(solved[0]).toBeCloseTo(5/3, 12);
  expect(solved[1]).toBeCloseTo(2, 12);
  expect(() => run("solveLinear", [[1,2],[2,4]], [3,6])).toThrow(/singular/);
  expect(run("subtractRows", [[1,2],[3,5]], [1,1])).toEqual([[0,1],[2,4]]);
  expect(() => run("subtractRows", [[1,2]], [1])).toThrow(/one value per column/);
  expect(run("medianValue", [8,2,4,6])).toBe(5);
  expect(run("divideOrZero", [9,4,0], [3,2,0])).toEqual([3,2,0]);
  expect(() => run("symmetricDegrees", [[1,1],[0,1]])).toThrow(/symmetric/);
  const normalised = run("symmetricDegrees", [[1,1,0],[1,1,1],[0,1,1]]) as number[][];
  expect(normalised[0][1]).toBeCloseTo(1/Math.sqrt(6));
  expect(normalised[1][1]).toBeCloseTo(1/3);
  expect(run("regionSizes", [[0,1,1],[2,0,1]])).toEqual([3,1]);
  expect(run("regionSizes", [[0,0]])).toEqual([]);
  expect(() => run("regionSizes", [[.5]])).toThrow(/integer/);
  expect(() => run("finiteWidth", [[1,2]], 3)).toThrow(/feature count/);
  expect(() => run("finiteWidth", [[1,Infinity]], 2)).toThrow(/finite/);
});

test("all section overviews link to actual lessons and the landing page remains an overview", async ({ page, request }) => {
  for (const section of CURRICULUM.filter(part => Object.hasOwn(sections, part.title))) {
    const response = await request.get(courseSectionHref(section));
    expect(response.status(), section.title).toBe(200);
    const html = await response.text();
    for (const topic of section.topics) for (const lesson of topic.concepts) expect(html).toContain(`href="${lesson.href}"`);
  }
  await page.goto("/#course");
  await page.getByRole("navigation", { name: "Learning areas", exact: true }).getByRole("link", { name: /^Machine Learning/ }).click();
  await expect(page.getByRole("link", { name: /Time Series and Forecasting/ }).first()).toBeVisible();
  await page.setViewportSize({ width: 390, height: 950 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("forecast simulation reveals one outcome at a time and resets consistently", async ({ page }) => {
  await page.goto("/concepts/forecasting-baselines#full-example");
  const region = page.getByRole("region", { name: "Forecast through time" });
  await expect(region.getByText("Forecast for day 2: 8", { exact: true })).toBeVisible();
  await expect(region.getByRole("table")).toHaveCount(0);
  await region.getByRole("button", { name: "Commit forecast and reveal day" }).click();
  await expect(region.getByRole("table").locator("tbody tr")).toHaveText(["28102"]);
  await expect(region.getByText("Forecast for day 3: 10", { exact: true })).toBeVisible();
  await region.getByLabel("Forecast rule").selectOption("smoothing");
  await expect(region.getByRole("table")).toHaveCount(0);
  await region.getByRole("button", { name: "Commit forecast and reveal day" }).click();
  await expect(region.getByText("Forecast for day 3: 9", { exact: true })).toBeVisible();
  for (let i=0;i<3;i++) await region.getByRole("button", { name: "Commit forecast and reveal day" }).click();
  await expect(region.getByRole("button", { name: "Commit forecast and reveal day" })).toBeDisabled();
  await region.getByRole("button", { name: "Restart sequence" }).click();
  await expect(region.getByRole("table")).toHaveCount(0);
  for (const width of [1280,390,320]) {
    await page.setViewportSize({ width, height: 960 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px`).toBe(true);
  }
  await region.screenshot({ path: ".practice-checks/forecast-sequence-mobile.png" });
});

test("Q-learning interaction retains learned values across episodes and stops at terminals", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/concepts/q-learning#full-example");
  const region = page.getByRole("region", { name: "Learn through actions" });
  await region.getByRole("button", { name: "Water", exact: true }).click();
  await expect(region.getByRole("table").locator("tbody tr").first().locator("td")).toHaveText(["-0.5","0"]);
  await region.getByRole("button", { name: "Wait", exact: true }).click();
  await expect(region.getByRole("table").locator("tbody tr").last().locator("td")).toHaveText(["0","1.5"]);
  await expect(region.getByRole("button", { name: "Water", exact: true })).toBeDisabled();
  await expect(region.locator("pre")).toContainText("Continuation: 0");
  await region.getByRole("button", { name: "Start another episode" }).click();
  await region.getByRole("button", { name: "Water", exact: true }).click();
  await expect(region.getByRole("table").locator("tbody tr").first().locator("td")).toHaveText(["-0.075","0"]);
  await region.screenshot({ path: ".practice-checks/q-learning-sequence-desktop.png" });
  await region.getByRole("button", { name: "Reset learning" }).click();
  await expect(region.getByRole("table").locator("tbody td")).toHaveText(["0","0","0","0"]);
  expect(errors).toEqual([]);
});

test("a construction in every new section starts empty and passes its test cases", async ({ page }) => {
  test.setTimeout(240_000);
  for (const section of Object.keys(sections)) {
    const lesson = lessons.find(lesson => lesson.section === section)!;
    await openFullWorkshop(page, lesson.id);
    await expect(page.locator("[data-piece]")).toHaveCount(1);
    await page.getByRole("checkbox", { name: "Animate signals", exact: true }).uncheck();
    await page.getByText("Stuck? Inspect a worked construction", { exact: true }).click();
    await page.getByRole("button", { name: "Assemble an example", exact: true }).click();
    await page.getByRole("button", { name: "Test all examples", exact: true }).click();
    await expect(page.getByTestId("construction-counter")).toHaveText(`${buildById[lesson.id].cases.length} passed · 0 failed · 0 not run`);
  }
});

test("a new challenge reports failures and passes using browser Python", async ({ page, context }) => {
  await context.route("https://cdn.jsdelivr.net/pyodide/v314.0.7/full/*.whl", async route => {
    try {
      const body = await readFile(path.join(process.cwd(), ".practice-checks", path.basename(new URL(route.request().url()).pathname)));
      await route.fulfill({ body, contentType: "application/zip", headers: { "access-control-allow-origin": "*" } });
    } catch { await route.continue(); }
  });
  await page.goto("/concepts/parameter-posteriors#practice-work-through-the-problem-with-numpy");
  await page.getByRole("button", { name: "Run tests", exact: true }).click();
  await expect(page.getByText("Some tests need another look", { exact: true })).toBeVisible({ timeout: 120_000 });
  await expect(page.getByLabel("Test counts")).toContainText(/[1-9]\d* failed/);
  await page.getByText("Show the worked solution", { exact: true }).click();
  await page.getByRole("button", { name: "Replace editor with this solution", exact: true }).click();
  await page.getByRole("button", { name: "Run tests", exact: true }).click();
  await expect(page.getByText("All tests passed", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Test counts")).toContainText("0 failed");
});
