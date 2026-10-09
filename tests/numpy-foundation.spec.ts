import { test, expect } from "@playwright/test";
import { expandedLessons } from "../lib/lessons";
import { TOOLS } from "../lib/builds/tools";
import { sectionId } from "../components/concept/sectionId";

const lessons = expandedLessons.filter(lesson => lesson.section === "Python and NumPy");

test("NumPy question cards supply their setup and preserve it during feedback", async ({ page }) => {
  test.setTimeout(180_000);
  for (const lesson of lessons) {
    await page.goto(`/concepts/${lesson.id}#${sectionId(`Questions on Parts 1 to ${lesson.parts.length}`)}`);
    for (let i = 0; i < lesson.quiz.length; i++) {
      const question = lesson.quiz[i];
      const setup = page.getByRole("group", { name: "Data for this question", exact: true });
      await expect(setup).toBeVisible();
      await expect(setup).toContainText(question.given!.description);
      await expect(setup.locator("pre")).toHaveText(question.given!.code ?? question.given!.data!);
      const answer = question.kind === "trueFalse" ? (question.answer ? "True" : "False") : question.kind === "choice" ? question.options[question.answer] : "";
      await page.getByRole("radiogroup").getByText(answer, { exact: true }).click();
      await expect(page.getByRole("status", { name: "Botie's feedback" })).toContainText("That is right.");
      await expect(setup).toBeVisible();
      if (i < lesson.quiz.length - 1) await page.getByRole("button", { name: "Next question", exact: true }).click();
    }
  }
});

test("the reported temperature question shows names and values before an answer", async ({ page }) => {
  await page.goto("/concepts/numpy-arrays#questions-on-parts-1-to-4");
  const setup = page.getByRole("group", { name: "Data for this question" });
  await expect(setup).toContainText('greenhouses = ["north", "middle", "south"]');
  await expect(setup).toContainText("readings = np.array([12, 18, 24])");
  await page.getByRole("radiogroup").getByText("The average of all greenhouses", { exact: true }).click();
  await expect(page.getByRole("status", { name: "Botie's feedback" })).toContainText("Not quite.");
  await expect(setup).toBeVisible();
  for (const width of [1280, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 960 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px`).toBe(true);
  }
});

test("array arrangement tools preserve entries and reject incomplete layouts", () => {
  const sheet = TOOLS.fillGrid.run([2, 3, 18.5], {}) as number[][];
  expect(sheet).toEqual([[18.5,18.5,18.5],[18.5,18.5,18.5]]);
  sheet[0][0] = 99;
  expect(sheet[1][0]).toBe(18.5);
  expect(() => TOOLS.fillGrid.run([2.5, 3, 0], {})).toThrow(/whole-number/);
  expect(() => TOOLS.fillGrid.run([0, 3, 0], {})).toThrow(/whole-number/);
  expect(() => TOOLS.fillGrid.run([2, 3, Infinity], {})).toThrow(/finite/);
  const flat = [10,20,30,14,22,36];
  const rows = TOOLS.reshapeRows.run([flat, 3], {}) as number[][];
  expect(rows).toEqual([[10,20,30],[14,22,36]]);
  expect(rows.flat()).toEqual(flat);
  expect(() => TOOLS.reshapeRows.run([flat, 4], {})).toThrow(/whole number/);
  expect(() => TOOLS.reshapeRows.run([[], 3], {})).toThrow(/nonempty/);
});

test("new array workshops start empty and solve changed-input cases", async ({ page }) => {
  for (const id of ["numpy-creation", "numpy-reshaping", "numpy-numerical-checks"]) {
    await page.goto(`/lab/${id}`);
    await page.getByRole("navigation", { name: "Journey stages" }).getByRole("button", { name: /Build your solution/ }).click();
    await expect(page.locator("[data-piece]")).toHaveCount(1);
    await page.getByRole("checkbox", { name: "Animate signals", exact: true }).uncheck();
    await page.getByText("Stuck? Inspect a worked construction", { exact: true }).click();
    await page.getByRole("button", { name: "Assemble an example", exact: true }).click();
    await page.getByRole("button", { name: "Test all examples", exact: true }).click();
    const count = lessons.find(lesson => lesson.id === id)!.build.cases.length;
    await expect(page.getByTestId("construction-counter")).toHaveText(`${count} passed · 0 failed · 0 not run`);
  }
});
