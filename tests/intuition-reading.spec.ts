import { test, expect } from "@playwright/test";
import { lessonIntuitions } from "../lib/intuition";
import { expandedLessons } from "../lib/lessons";
import { presentIntuition } from "../lib/intuition/presentation";
import { story, step, strips, type Scene } from "../lib/intuition/types";
import { sectionId } from "../components/concept/sectionId";

const lessons = { ...lessonIntuitions, ...Object.fromEntries(expandedLessons.map(lesson => [lesson.id,
  story(lesson.opening, lesson.intuition.map(item => step(item.title, item.explanation, item.scene ?? strips("An invented example for this lesson.", item.rows))), "Connection", [])])) };

test("all guided examples use readable relationships with complete labels and finite geometry", () => {
  expect(Object.keys(lessons)).toHaveLength(321);
  let count = 0;
  const check = (scene: Scene) => {
    expect(scene.kind).not.toBe("strips");
    expect(JSON.stringify(scene)).not.toContain("—");
    if (scene.kind === "table") {
      expect(scene.rowHeading).toBeTruthy();
      for (const row of scene.records) {
        expect(row.label).toBeTruthy();
        expect(row.cells).toHaveLength(scene.columns.length);
        for (const cell of row.cells) expect(typeof cell).toBe("string");
      }
    }
    if (scene.kind === "numberline") for (const row of scene.rows) for (const value of row.values) expect(Number.isFinite(value)).toBe(true);
    if (scene.kind === "timeline") for (const day of scene.days) {
      if (day.role === "known") expect(Number.isFinite(day.value)).toBe(true);
      else expect(day.value).toBeUndefined();
    }
  };
  for (const [id, lesson] of Object.entries(lessons)) for (const item of presentIntuition(id, lesson).steps) {
    count++;
    check(item.scene);
    if (item.alternative) check(item.alternative.scene);
  }
  expect(count).toBe(910);
});

test("the forecast boundary advances without leaking its target and scores aligned days", () => {
  const scenes = presentIntuition("rolling-forecast-validation", lessons["rolling-forecast-validation"]).steps.map(item => item.scene);
  expect(scenes[0]).toMatchObject({ kind: "timeline", prediction: { value: 6 }, days: [
    { value: 5, role: "known" }, { value: 7, role: "known" }, { value: 6, role: "known" },
    { role: "target" }, { role: "later" },
  ] });
  expect(scenes[1]).toMatchObject({ kind: "timeline", prediction: { value: 9 }, days: [
    { value: 5 }, { value: 7 }, { value: 6 }, { value: 9, role: "known" }, { role: "target" },
  ] });
  expect(scenes[2]).toMatchObject({ kind: "table", records: [
    { label: "Day 4", cells: ["9 litres", "6 litres", "6.5 litres", "3 / 2.5 litres"] },
    { label: "Day 5", cells: ["8 litres", "9 litres", "7.5 litres", "1 / 0.5 litres"] },
  ] });
});

test("paired records retain their original identities and custom authored scenes win", () => {
  const statistics = presentIntuition("statistics", lessons.statistics).steps[0].scene;
  expect(statistics).toMatchObject({ kind:"table", columns:["Heights, centimetres", "Weights, kilograms"], records:[
    {label:"Person 1",cells:["160","58"]}, {label:"Person 2",cells:["165","66"]},
    {label:"Person 3",cells:["170","68"]}, {label:"Person 4",cells:["175","74"]}, {label:"Person 5",cells:["180","74"]},
  ] });
  const tokens = presentIntuition("what-a-token-is", lessons["what-a-token-is"]).steps[2].scene;
  expect(tokens).toMatchObject({kind:"table",records:[{label:"the",cells:["12"]},{label:"cat",cells:["103"]},{label:"sat",cells:["57"]}]});
  const scene: Scene = {kind:"bars",caption:"A new authored example",items:[{label:"Changed data",value:20}]};
  const custom = story([], [step("A revised example", "Different authored data", scene)], "Connection", []);
  expect(presentIntuition("rolling-forecast-validation", custom).steps[0].scene).toEqual(scene);
});

test("alternative cases remain interactive in continuous and one-step views", async ({ page }) => {
  const lesson = lessonIntuitions["simple-linear-regression"];
  const index = lesson.steps.findIndex(item=>item.alternative);
  const alternative = lesson.steps[index].alternative!;
  await page.goto("/concepts/simple-linear-regression#one-line-five-different-answers");
  const example = page.locator("[data-guided-intuition]");
  const region = example.locator(`[data-walkthrough-step="${index}"]`);
  await region.getByRole("button",{name:alternative.label,exact:true}).click();
  await expect(region).toContainText(alternative.explanation);
  await region.getByRole("button",{name:"Return to the first case"}).click();
  await expect(region).toContainText(lesson.steps[index].explanation);
  await example.getByRole("button",{name:"One step at a time"}).click();
  await example.getByLabel("Follow the example").selectOption(String(index));
  await region.getByRole("button",{name:alternative.label,exact:true}).click();
  await expect(region).toContainText(alternative.explanation);
});

test("forecast examples read continuously and retain accessible step controls", async ({ page }) => {
  await page.goto("/concepts/rolling-forecast-validation#would-this-rule-have-helped-before-we-knew-the-answer");
  const example = page.locator("[data-guided-intuition]");
  await expect(example.locator("[data-walkthrough-step]")).toHaveCount(3);
  await expect(example.locator('[data-time-role="target"]')).toHaveCount(2);
  await example.getByRole("button", { name: "One step at a time" }).click();
  await expect(example.locator("[data-walkthrough-step]")).toHaveCount(1);
  await expect(example.getByRole("button", { name: "Previous step" })).toBeDisabled();
  await expect(example.locator('[data-time-role="target"]')).toContainText("Day 4");
  await expect(example.locator('[data-time-role="target"]')).toContainText("not observed yet");
  await example.getByRole("button", { name: "Next step" }).click();
  await expect(example.locator('[data-time-role="target"]')).toContainText("Day 5");
  await expect(example.getByRole("heading", { name: "Move the origin" })).toBeFocused();
  await example.getByLabel("Follow the example").selectOption("2");
  await expect(example.getByRole("button", { name: "Next step" })).toBeDisabled();
  await expect(example.getByRole("row", { name: /Day 4/ })).toContainText("6.5 litres");
  await example.getByRole("button", { name: "Read through", exact: true }).click();
  await expect(example.locator("[data-walkthrough-step]")).toHaveCount(3);
  await example.screenshot({ path: ".practice-checks/intuition-forecast-desktop.png" });
});

test("older primers, language, matrices, graphs and images keep meaningful representations on small screens", async ({ page }) => {
  test.setTimeout(240_000);
  const hydrationErrors: string[] = [];
  page.on("console", message => {
    if (/hydration|script tag while rendering/i.test(message.text())) hydrationErrors.push(message.text());
  });
  page.on("pageerror", error => hydrationErrors.push(error.message));
  const examples = [
    ["/primers/statistics#what-can-a-handful-of-measurements-tell-us", "table"],
    ["/primers/linear-algebra#several-measurements-one-calculation", "table"],
    ["/concepts/what-a-token-is#how-can-our-models-read-language", "sequence"],
    ["/concepts/numpy-arrays", "table"],
    ["/concepts/graph-representations", "network"],
    ["/concepts/project-seed-counting", "tiles"],
  ];
  for (const [url, kind] of examples) {
    await page.setViewportSize({ width: 1280, height: 960 });
    const record = expandedLessons.find(lesson => url === `/concepts/${lesson.id}`);
    await page.goto(record ? `${url}#${sectionId(record.openingTitle)}` : url);
    const example = page.locator("[data-guided-intuition]");
    await expect(example).toBeVisible();
    await expect(example.locator(`[data-demonstration="${kind}"]`).first()).toBeVisible();
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 860 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const figures = example.locator("figure");
      for (let i = 0; i < await figures.count(); i++) {
        expect(await figures.nth(i).evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      }
    }
    if (url.includes("numpy-arrays")) await example.screenshot({ path: ".practice-checks/intuition-numpy-mobile.png" });
  }
  expect(hydrationErrors).toEqual([]);
});
