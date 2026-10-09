import { test, expect } from "@playwright/test";
import { missions, labLessons, missionById } from "../lib/labs";
import { passed } from "../lib/labs/types";
import { expandedLessonIds } from "../lib/lessons/ids";

test("legacy simulation challenges retain their working, nontrivial solutions", () => {
  const expanded = new Set<string>(expandedLessonIds);
  const expected = labLessons.map(l => l.id).filter(id => id !== "neurons-and-activations" && !expanded.has(id)).sort();
  expect(missions.map(m => m.id).sort()).toEqual(expected);
  expect(new Set(missions.map(m => m.id)).size).toBe(missions.length);
  for (const m of missions) {
    for (const batch of [0, 1]) {
      const result = m.run(m.solution, batch);
      expect(result.readings.length, m.id).toBeGreaterThan(0);
      expect(result.readings.every(passed), `${m.id}, batch ${batch}: ${JSON.stringify(result.readings)}`).toBe(true);
    }
    expect(m.run(m.initial, 0).readings.every(passed), `${m.id} should require a change`).toBe(false);
    expect(`${m.story}${m.task}${m.hint}${m.success}${m.rule}`, m.id).not.toContain("\u2014");
    for (const c of m.controls) {
      expect(m.initial[c.key], `${m.id}.${c.key}`).toBeDefined();
      expect(m.solution[c.key], `${m.id}.${c.key}`).toBeDefined();
    }
  }
});

test("calculations respond to inputs rather than solution flags", () => {
  const regression = missionById["simple-linear-regression"];
  expect(regression.run({ slope: 1.5, bias: 2 }, 0).readings.map(r => r.actual)).toEqual([3.5, 5, 6.5, 8]);
  const attention = missionById.attention.run({ q1: 0, q2: 0 }, 0).readings;
  expect(attention.slice(0, 3).map(r => r.actual)).toEqual([1 / 3, 1 / 3, 1 / 3]);
  expect(attention[3].actual).toBeCloseTo(4);
  const route = missionById["reinforcement-learning"].run({ step0: "Down", step1: "Down", step2: "Right", step3: "Right", step4: "Right" }, 0);
  expect(route.readings.every(passed)).toBe(true); // A different valid route must work too.
  const empty = missionById["pooling-a-text"].run({ tokens: [] }, 0);
  expect(empty.readings.every(passed)).toBe(false);
});

test("unknown workshop lessons return 404", async ({ request }) => {
  expect((await request.get("/lab/not-a-lesson")).status()).toBe(404);
});

test("Botie's directory keeps mathematics first and finds the related journey", async ({ page }) => {
  await page.goto("/lab");
  await expect(page.getByRole("heading", { name: "Botie's workshop", exact: true })).toBeVisible();
  await expect(page.locator("main section").first()).toContainText("Introductory Mathematics");
  await expect(page.getByRole("link", { name: /Start the workshop tutorial/ })).toHaveAttribute("href", "/lab/workshop-guide");
  await page.getByRole("searchbox").fill("Fit a line");
  await page.getByRole("link", { name: /Fit a line to the observations/ }).click();
  await expect(page.getByTestId("workshop-journey")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Journey stages" })).toBeVisible();
  await page.getByRole("button", { name: /Build your solution/ }).click();
  await expect(page.locator("[data-piece]")).toHaveCount(1);
});

test("concepts and primers embed the journey and retain practice links", async ({ page }) => {
  for (const href of ["/concepts/attention", "/primers/statistics"]) {
    await page.goto(`${href}#workshop`);
    await expect(page.getByTestId("workshop-journey")).toBeVisible();
    await page.getByRole("navigation", { name: "Journey stages" }).getByRole("button", { name: /Explain it/ }).click();
    await page.getByRole("link", { name: /Write the calculation in Python/ }).click();
    await expect(page.getByTestId("workshop-journey")).toHaveCount(0);
    await expect(page.getByText("Write and run Python", { exact: true })).toBeVisible();
    await page.goBack();
    await expect(page.getByTestId("workshop-journey")).toBeVisible();
  }
});

test("large, image and text constructions fit inside narrow pages", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const slug of ["attention", "template-matching", "the-pattern-language-models-use", "the-standard-score", "reinforcement-learning"]) {
    await page.goto(`/lab/${slug}`);
    await page.getByRole("navigation", { name: "Journey stages" }).getByRole("button", { name: /Build your solution/ }).click();
    await page.getByText("Stuck? Inspect a worked construction", { exact: true }).click();
    await page.getByRole("button", { name: "Assemble an example", exact: true }).click();
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${slug} at ${width}`).toBe(true);
    }
  }
});
