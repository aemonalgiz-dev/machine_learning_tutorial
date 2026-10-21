import { test, expect } from "@playwright/test";
import { openFullWorkshop } from "./helpers/open-workshop";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { TOOLS } from "../lib/builds/tools";
import { type Data, assemble, evaluate, same } from "../lib/builds/engine";
import { buildById } from "../lib/builds/catalog";
import { expandedLessonById } from "../lib/lessons";
import { CURRICULUM } from "../lib/curriculum";
import { lessonOrder } from "../lib/course-navigation";

const ids = ["conditional-probability", "likelihood", "naive-bayes", "support-vector-machines", "hierarchical-clustering", "density-based-clustering", "images-as-arrays", "image-thresholding", "morphology", "connected-components", "image-augmentation", "transfer-learning", "bounding-boxes", "non-maximum-suppression"];
const run = (key: string, ...inputs: Data[]) => TOOLS[key].run(inputs, {});

test("gap lessons are complete and join existing topics in prerequisite order", () => {
  expect(lessonOrder).toHaveLength(322);
  for (const section of CURRICULUM) expect(new Set(section.topics.map(topic => topic.heading)).size).toBe(section.topics.length);
  for (const id of ids) {
    const lesson = expandedLessonById[id];
    expect(lesson.parts.length).toBeGreaterThan(0);
    expect(lesson.parts.every(part=>part.title && part.paragraphs.some(text=>text.trim()))).toBe(true);
    expect(lesson.practice.length).toBeGreaterThan(0);
    expect(lesson.quiz.length).toBeGreaterThan(0);
    expect(lesson.history.sources.length).toBeGreaterThan(0);
    for (const q of lesson.quiz) expect(q.given?.data?.length).toBeGreaterThan(0);
    for (const link of [...lesson.prerequisites, ...lesson.appliedIn ?? []]) expect(lessonOrder, `${id}: ${link.href}`).toContain(link.href);
    const graph = assemble(lesson.build.recipe, TOOLS);
    expect(graph.pieces.length).toBeLessThanOrEqual(36);
    for (const fixture of lesson.build.cases) {
      const trace = evaluate(graph, fixture.data, TOOLS);
      expect(trace.error, `${id}: ${fixture.name}`).toBeUndefined();
      expect(same(trace.output, fixture.expected), `${id}: ${fixture.name}`).toBe(true);
    }
  }
  expect(lessonOrder.indexOf("/concepts/connected-components")).toBeLessThan(lessonOrder.indexOf("/concepts/filters-and-edges"));
  expect(lessonOrder.indexOf("/concepts/support-vector-machines")).toBeLessThan(lessonOrder.indexOf("/concepts/kernel-trick"));
});

test("probability components reject impossible conditioning and respect endpoints", () => {
  expect(run("priorEvidence", [.5,.5], [.2,.8])).toEqual([.1,.4]);
  expect(() => run("priorEvidence", [.4,.4], [.2,.8])).toThrow(/sum to one/);
  expect(() => run("priorEvidence", [.5,.5], [0,0])).toThrow(/zero probability/);
  expect(() => run("priorEvidence", [.5,.5], [1.1,.1])).toThrow(/between zero and one/);
  expect(() => run("rowproduct", [[-.2,-.3]])).toThrow(/between zero and one/);
  expect(run("sequenceLikelihood", [0,.5,1], [1,1])).toEqual([0,.25,1]);
  expect(run("sequenceLikelihood", [0,.5,1], [0,0])).toEqual([1,.25,0]);
  expect(() => run("sequenceLikelihood", [0,1], [0,1])).toThrow(/None of these candidates/);
  expect(() => run("sequenceLikelihood", [.5], [2])).toThrow(/zero for failure/);
});

test("distance components include self and radius equality without squaring distances", () => {
  const d = run("pairDistances", [[0,0],[3,4],[6,8]]);
  expect(d).toEqual([[0,5,10],[5,0,5],[10,5,0]]);
  expect(run("rowtotal", run("withinRadius", d, 5))).toEqual([2,3,2]);
  expect(run("crossDistances", [1,4], [0,6])).toEqual([[1,5],[4,2]]);
  expect(() => run("withinRadius", [[0,1],[1,0]], -1)).toThrow(/non-negative/);
  expect(() => run("pairDistances", [[0],[1,2]])).toThrow(/same number/);
});

test("morphology handles zero padding, footprints, and thin regions", () => {
  expect(run("erodeMask", [[1,1,1]], [[1,1,1]])).toEqual([[0,1,0]]);
  expect(run("dilateMask", [[0,1,0]], [[1,1,1]])).toEqual([[1,1,1]]);
  const cross = [[0,1,0],[1,1,1],[0,1,0]];
  expect(run("erodeMask", cross, cross)).toEqual([[0,0,0],[0,1,0],[0,0,0]]);
  expect(run("erodeMask", cross, [[1,1,1],[1,1,1],[1,1,1]])).toEqual([[0,0,0],[0,0,0],[0,0,0]]);
  expect(() => run("erodeMask", [[1,2,0]], [[1]])).toThrow(/zeros and ones/);
  expect(() => run("dilateMask", [[1]], [[0]])).toThrow(/at least one/);
  expect(() => run("dilateMask", [[1]], [[1,1,0]])).toThrow(/symmetric/);
  expect(() => run("dilateMask", [[1]], [[1,1]])).toThrow(/odd footprint/);
});

test("region labels and reflected images preserve their stated geometry", () => {
  const diagonal = [[1,0,0],[0,1,0],[0,0,1]];
  expect(run("labelRegions", diagonal, 4)).toEqual([[1,0,0],[0,2,0],[0,0,3]]);
  expect(run("labelRegions", diagonal, 8)).toEqual(diagonal);
  expect(run("labelRegions", [[1,1],[1,1]], 4)).toEqual([[1,1],[1,1]]);
  expect(run("labelRegions", [[0,0]], 8)).toEqual([[0,0]]);
  expect(() => run("labelRegions", diagonal, 6)).toThrow(/4 or 8/);
  const image = [[1,2,3],[4,5,6]];
  expect(run("flipImage", image)).toEqual([[3,2,1],[6,5,4]]);
  expect(image).toEqual([[1,2,3],[4,5,6]]);
});

test("box operations and greedy suppression handle contact, ties, and removed candidates", () => {
  expect(run("boxArea", [1,2,5,6])).toBe(16);
  expect(run("boxIntersection", [0,0,2,2], [3,3,5,5])).toBe(0);
  expect(run("boxIntersection", [0,0,2,2], [2,0,4,2])).toBe(0);
  expect(() => run("boxArea", [0,0,0,2])).toThrow(/positive width/);
  expect(run("descendingIndices", [.5,.9,.9,.2])).toEqual([1,2,0,3]);
  const boxes = [[0,0,3,2],[1,0,4,2],[2,0,5,2]];
  expect(run("suppressBoxes", boxes, [0,1,2], .4)).toEqual([0,2]);
  expect(run("suppressBoxes", boxes, [0,1,2], .5)).toEqual([0,1,2]);
  expect(() => run("suppressBoxes", boxes, [0,0,2], .5)).toThrow(/exactly once/);
  expect(() => run("suppressBoxes", boxes, [0,1,2], 1.5)).toThrow(/between zero and one/);
});

test("pixel examples respond to edits, expose mask errors, and fit small screens", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/concepts/image-thresholding#full-example");
  const experiment = page.getByRole("region", { name: "Explore the lesson calculation" });
  const pixels = experiment.getByRole("table", { name: "Output pixels", exact: true });
  await expect(pixels).toBeVisible();
  await expect(pixels.locator("tbody td")).toHaveText(["0","0","0","0","1","0","0","1","0"]);
  await experiment.getByLabel("Tray intensities, row 0, column 0", { exact: true }).fill("150");
  await expect(pixels.locator("tbody td")).toHaveText(["1","0","0","0","1","0","0","1","0"]);
  await experiment.getByRole("button", { name: "Reset this example" }).click();
  await expect(pixels.locator("tbody td").first()).toHaveText("0");
  for (const width of [1440,768,390,320]) {
    await page.setViewportSize({ width, height: 960 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px`).toBe(true);
  }
  await page.screenshot({ path: ".practice-checks/vision-pixels-mobile.png", fullPage: true });
  await page.goto("/concepts/morphology#full-example");
  await experiment.getByLabel("Threshold mask, row 0, column 0", { exact: true }).fill("2");
  await expect(experiment.getByRole("status")).toHaveText(/only zeros and ones/);
  await experiment.getByRole("button", { name: "Reset this example" }).click();
  await expect(experiment.getByRole("status")).toHaveCount(0);
  await page.setViewportSize({ width: 1280, height: 960 });
  await page.screenshot({ path: ".practice-checks/morphology-desktop.png", fullPage: true });
  await page.goto("/concepts/image-augmentation#full-example");
  await expect(experiment.getByRole("table", { name: "Transformed label mask", exact: true }).locator("tbody td")).toHaveText(["0","0","1","0","1","1"]);
  expect(errors).toEqual([]);
});

test("all fourteen workshops start empty and pass their construction cases", async ({ page }) => {
  test.setTimeout(240_000);
  for (const id of ids) {
    await openFullWorkshop(page, id);
    await expect(page.locator("[data-piece]")).toHaveCount(1);
    await page.getByRole("checkbox", { name: "Animate signals", exact: true }).uncheck();
    await page.getByText("Stuck? Inspect a worked construction", { exact: true }).click();
    await page.getByRole("button", { name: "Assemble an example", exact: true }).click();
    await page.getByRole("button", { name: "Test all examples", exact: true }).click();
    await expect(page.getByTestId("construction-counter")).toHaveText(`${buildById[id].cases.length} passed · 0 failed · 0 not run`);
  }
});

test("a new vision challenge runs and reports failed then passed tests in browser Python", async ({ page, context }) => {
  test.setTimeout(180_000);
  await context.route("https://cdn.jsdelivr.net/pyodide/v314.0.7/full/*.whl", async route => {
    try {
      const body = await readFile(path.join(process.cwd(), ".practice-checks", path.basename(new URL(route.request().url()).pathname)));
      await route.fulfill({ body, contentType: "application/zip", headers: { "access-control-allow-origin": "*" } });
    } catch { await route.continue(); }
  });
  await page.goto("/concepts/image-thresholding#practice-work-through-the-problem-with-numpy");
  await page.getByRole("button", { name: "Run tests", exact: true }).click();
  await expect(page.getByText("Some tests need another look", { exact: true })).toBeVisible({ timeout: 120_000 });
  await expect(page.getByLabel("Test counts")).toContainText(/[1-9]\d* failed/);
  await page.getByText("Show the worked solution", { exact: true }).click();
  await page.getByRole("button", { name: "Replace editor with this solution", exact: true }).click();
  await page.getByRole("button", { name: "Run tests", exact: true }).click();
  await expect(page.getByText("All tests passed", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Test counts")).toContainText("0 failed");
});
