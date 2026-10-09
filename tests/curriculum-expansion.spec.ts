import { test, expect } from "@playwright/test";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { expandedLessons } from "../lib/lessons";
import navigation from "../lib/lessons/navigation.json";
import { CURRICULUM } from "../lib/curriculum";
import { firstLesson, lessonOrder } from "../lib/course-navigation";
import { lessonHistories } from "../lib/history";
import { buildById } from "../lib/builds/catalog";
import { assemble, evaluate, same } from "../lib/builds/engine";
import { TOOLS } from "../lib/builds/tools";

test("published lessons, navigation, histories and workshops describe the same course", async () => {
  expect(CURRICULUM[0].title).toBe("Introductory Mathematics");
  expect(CURRICULUM[1].title).toBe("Python and NumPy");
  expect(firstLesson).toBe("/concepts/simple-linear-regression");
  expect(new Set(lessonOrder).size).toBe(lessonOrder.length);
  expect(new Set(navigation.map(item => item.id))).toEqual(new Set(expandedLessons.map(item => item.id)));
  const staticFolders = await readdir(path.resolve("app/concepts"));
  for (const lesson of expandedLessons) {
    const href = `/concepts/${lesson.id}`;
    expect(lessonOrder, lesson.id).toContain(href);
    expect(staticFolders, lesson.id).not.toContain(lesson.id);
    expect(lessonHistories[lesson.id]).toEqual(lesson.history);
    expect(buildById[lesson.id]).toEqual({ id: lesson.id, ...lesson.build });
    for (const prerequisite of lesson.prerequisites) {
      expect(lessonOrder, prerequisite.href).toContain(prerequisite.href);
      expect(lessonOrder.indexOf(prerequisite.href), `${lesson.id}: prerequisite ${prerequisite.href} should come earlier`).toBeLessThan(lessonOrder.indexOf(href));
    }
    expect(lesson.parts.map(part => part.title.match(/^\d+/)?.[0])).toEqual(lesson.parts.map((_, i) => String(i + 1)));
    expect(JSON.stringify(lesson)).not.toContain("\u2014");
    expect(new Set(lesson.practice.map(item => item.title)).size).toBe(lesson.practice.length);
    for (const question of lesson.quiz) {
      expect(question.because.length).toBeGreaterThan(0);
      if (question.kind === "choice") expect(question.answer).toBeLessThan(question.options.length);
    }
    const graph = assemble(lesson.build.recipe, TOOLS);
    for (const fixture of lesson.build.cases) {
      const result = evaluate(graph, fixture.data, TOOLS);
      expect(result.error, `${lesson.id}: ${fixture.name}`).toBeUndefined();
      expect(same(result.output, fixture.expected), `${lesson.id}: ${fixture.name}`).toBe(true);
    }
  }
});

test("new tools preserve measured zeros, unknown categories and input meaning", () => {
  expect(TOOLS.observed.run([[0, null, 4]], {})).toEqual([0, 4]);
  expect(TOOLS.fillMissing.run([[0, null, 4], 2], {})).toEqual([0, 2, 4]);
  expect(() => TOOLS.observed.run([[null, null]], {})).toThrow(/no observed readings/);
  expect(() => TOOLS.observed.run([["missing", 4]], {})).toThrow(/finite numbers/);
  expect(TOOLS.matches.run([["glass", "foil", "mesh"], "mesh"], {})).toEqual([0, 0, 1]);
  expect(TOOLS.membership.run([["mesh", "foil"], ["glass", "mesh"]], {})).toEqual([[0, 1], [0, 0]]);
  expect(() => TOOLS.membership.run([["glass"], ["glass", "glass"]], {})).toThrow(/no repeated categories/);
  expect(TOOLS.sin.run([Math.PI / 2], {})).toBeCloseTo(1);
  expect(TOOLS.cos.run([Math.PI], {})).toBeCloseTo(-1);
  const missing = assemble(buildById["missing-measurements"].recipe, TOOLS);
  expect(evaluate(missing, { training: [0, null, 8], report: [null, 0, 15] }, TOOLS).output).toEqual([4, 0, 15]);
  const category = assemble(buildById["categorical-encoding"].recipe, TOOLS);
  expect(evaluate(category, { materials: ["paper", "mesh", "glass"], vocabulary: ["plastic", "mesh", "glass"] }, TOOLS).output).toEqual([[0, 0, 0], [0, 1, 0], [0, 0, 1]]);
});

test("every published expansion route responds and unknown routes stay absent", async ({ request }) => {
  test.setTimeout(180_000);
  for (const lesson of expandedLessons) {
    const response = await request.get(`/concepts/${lesson.id}`);
    expect(response.status(), lesson.id).toBe(200);
    expect(await response.text()).toContain(lesson.title.replaceAll("&", "&amp;"));
    expect((await request.get(`/lab/${lesson.id}`)).status(), `workshop ${lesson.id}`).toBe(200);
  }
  expect((await request.get("/concepts/not-a-published-lesson")).status()).toBe(404);
  expect((await request.get("/concepts/toString")).status()).toBe(404);
});

test("editable examples calculate from changed data and expose invalid missing references", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/concepts/missing-measurements#full-example");
  const example = page.getByRole("region", { name: "Explore the lesson calculation" });
  await expect(example).toBeVisible();
  await example.getByLabel("Training temperatures, entry 1", { exact: true }).fill("2");
  await expect(example.getByRole("list", { name: "Values in order" }).locator("li > span:last-child")).toHaveText(["8", "18"]);
  await example.getByLabel("Training temperatures, entry 1", { exact: true }).fill("");
  await example.getByLabel("Training temperatures, entry 3", { exact: true }).fill("");
  await expect(example.getByRole("status")).toContainText("no observed readings");
  await example.getByRole("button", { name: "Reset this example" }).click();
  await expect(example.getByRole("list", { name: "Values in order" }).locator("li > span:last-child")).toHaveText(["12", "18"]);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px`).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("new workshops start empty and the constructions pass their actual cases", async ({ page }) => {
  for (const id of ["numpy-axes", "categorical-encoding", "probability-calibration"]) {
    await page.goto(`/lab/${id}`);
    await page.getByRole("navigation", { name: "Journey stages" }).getByRole("button", { name: /Build your solution/ }).click();
    await expect(page.locator("[data-piece]")).toHaveCount(1);
    await page.getByRole("checkbox", { name: "Animate signals", exact: true }).uncheck();
    await page.getByText("Stuck? Inspect a worked construction", { exact: true }).click();
    await page.getByRole("button", { name: "Assemble an example", exact: true }).click();
    await page.getByRole("button", { name: "Test all examples", exact: true }).click();
    await expect(page.getByTestId("construction-counter")).toHaveText(`${buildById[id].cases.length} passed · 0 failed · 0 not run`);
    await page.setViewportSize({ width: 390, height: 950 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("new Python practice gives failures and passes through the real browser runner", async ({ page, context }) => {
  test.setTimeout(180_000);
  await context.route("https://cdn.jsdelivr.net/pyodide/v314.0.7/full/*.whl", async route => {
    try {
      const bytes = await readFile(path.join(process.cwd(), ".practice-checks", path.basename(new URL(route.request().url()).pathname)));
      await route.fulfill({ body: bytes, contentType: "application/zip", headers: { "access-control-allow-origin": "*" } });
    } catch { await route.continue(); }
  });
  await page.goto("/concepts/numpy-arrays#practice-work-through-the-problem-with-numpy");
  await expect(page.locator(".cm-content")).toBeVisible();
  await page.getByRole("button", { name: "Run tests", exact: true }).click();
  await expect(page.getByText("Some tests need another look", { exact: true })).toBeVisible({ timeout: 120_000 });
  await expect(page.getByLabel("Test counts")).toContainText(/[1-9]\d* failed/);
  await page.getByText("Show the worked solution", { exact: true }).click();
  await page.getByRole("button", { name: "Replace editor with this solution", exact: true }).click();
  await page.getByRole("button", { name: "Run tests", exact: true }).click();
  await expect(page.getByText("All tests passed", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Test counts")).toContainText("0 failed");
});
