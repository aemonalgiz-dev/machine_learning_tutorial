import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { accountBackendFor, mockAccountBackend, waitForAccountReady } from "./helpers/account-backend";
import { openFullWorkshop } from "./helpers/open-workshop";
import { buildById } from "../lib/builds/catalog";
import { expandedLessons } from "../lib/lessons";
import { lessonOrder } from "../lib/course-navigation";
import { challengeQuestion } from "../lib/exercises";
import { journeyFor } from "../lib/builds/journey";
import { assemble } from "../lib/builds/engine";
import { TOOLS } from "../lib/builds/tools";
import { journeyDraftId } from "../components/lab/JourneyContinuity";
import { workshopRecordKey } from "../lib/builds/workshop-session";
import { workshopRecord } from "./helpers/workshop-record";

test("Python challenges continue earlier work in the visible reading order", () => {
  const lessons = expandedLessons.filter(lesson => lesson.id.startsWith("python-"));
  let continuations = 0;
  for (const lesson of lessons) for (const [index, exercise] of lesson.practice.entries()) {
    const previous = exercise.continuation;
    if (lesson.id === "python-readable-code" && index === 0) {
      expect(previous).toBeUndefined();
      continue;
    }
    expect(previous, `${lesson.id}: ${exercise.title}`).toBeDefined();
    if (!previous) continue;
    const source = expandedLessons.find(lesson => `/concepts/${lesson.id}` === previous.lesson)!;
    expect(source, previous.lesson).toBeDefined();
    expect(previous.title).toBe(source.practice[previous.exercise].title);
    expect(previous.summary.trim()).not.toBe("");
    if (source.id === lesson.id) expect(previous.exercise).toBeLessThan(index);
    else expect(lessonOrder.indexOf(previous.lesson)).toBeLessThan(lessonOrder.indexOf(`/concepts/${lesson.id}`));
    continuations++;
  }
  expect(continuations).toBe(41);
  for (const lesson of lessons) {
    const data = journeyFor(lesson.id);
    expect(data.plan!.order).toBe("build-first");
    expect(data.fresh!.prediction?.question).toBeTruthy();
    expect(["number", "boolean", "string"]).toContain(typeof data.fresh!.prediction!.expected);
  }
});

test("Python practice routes expose every new lesson and workshop", async ({ request }) => {
  const lessons = expandedLessons.filter(lesson => lesson.id.startsWith("python-"));
  expect(lessons).toHaveLength(21);
  for (const lesson of lessons) {
    const response = await request.get(`/concepts/${lesson.id}`);
    expect(response.status(), lesson.id).toBe(200);
    expect(await response.text(), lesson.id).toContain(lesson.title.replaceAll("&", "&amp;"));
    expect((await request.get(`/lab/${lesson.id}`)).status(), `workshop ${lesson.id}`).toBe(200);
  }
});

test.beforeEach(async ({ page, context }) => {
  await mockAccountBackend(page);
  await context.route("https://cdn.jsdelivr.net/pyodide/v314.0.7/full/*.whl", async route => {
    try {
      const bytes = await readFile(path.join(process.cwd(), ".practice-checks", path.basename(new URL(route.request().url()).pathname)));
      await route.fulfill({ body: bytes, contentType: "application/zip", headers: { "access-control-allow-origin": "*" } });
    } catch {
      await route.continue();
    }
  });
});

test("every new Python workshop opens its coding challenges without opening notes or finishing a stage", async ({ page }) => {
  test.setTimeout(180_000);
  for (const lesson of expandedLessons.filter(lesson => lesson.id.startsWith("python-"))) {
    await page.goto(`/lab/${lesson.id}`);
    await waitForAccountReady(page);
    const coding = page.getByTestId("workshop-journey").getByRole("link", { name: "Coding challenges", exact: true });
    await expect(coding).toBeVisible();
    await coding.click();
    await expect(page).toHaveURL(new RegExp(`/concepts/${lesson.id}#practice$`));
    await expect(page.getByRole("group", { name: "Challenge instructions", exact: true }).getByRole("heading")).toBeVisible();
    await expect(page.getByRole("list", { name: "Coding challenges", exact: true }).getByRole("button")).toHaveCount(lesson.practice.length);
    await expect(page.locator(".cm-content")).toBeVisible();
  }
});

test("Python coding challenges remain accessible without an account", async ({ page }) => {
  await page.route("**/account-api/session", route => route.fulfill({ json: { enabled: true, user: null } }));
  for (const id of ["python-readable-code", "python-pydantic-models", "python-testing"]) {
    await page.goto(`/lab/${id}`);
    await page.getByTestId("workshop-journey").getByRole("link", { name: "Coding challenges", exact: true }).click();
    await expect(page.locator(".cm-content")).toBeVisible();
    await expect(page.getByRole("button", { name: "Run code", exact: true })).toBeEnabled();
    await expect(page.getByText("This visit only. Sign in to save your work.", { exact: true })).toBeVisible();
  }
});

test("record previews keep each name with its values and distinguish missing fields from null", async ({ page }) => {
  const build = buildById["python-testing"];
  const sourceKey = Object.keys(build.cases[0].data).find(key => {
    const value = build.cases[0].data[key];
    return Array.isArray(value) && value.length > 0 && value[0] !== null && typeof value[0] === "object";
  })!;
  expect(sourceKey).toBeDefined();
  const name = build.sources[sourceKey];
  await openFullWorkshop(page, build.id);
  await page.getByRole("button", { name, exact: true }).click();
  await page.getByText("Try your own inputs", { exact: true }).click();
  await page.getByRole("button", { name: "Experiment with these inputs", exact: true }).click();
  await page.getByLabel(name, { exact: true }).fill(JSON.stringify([
    { name: "north", note: null, readings: [25] },
    { name: "south", readings: [] },
    { name: "east", note: "", readings: [0] },
    { name: "text", note: "17", readings: [] },
    { name: "number", note: 17, readings: [] },
  ]));
  const values = page.getByRole("group", { name: `${name} machine`, exact: true }).getByRole("list", { name: "Record data", exact: true }).getByRole("listitem");
  await expect(values.nth(0).getByRole("term")).toHaveText(["name", "note", "readings"]);
  await expect(values.nth(0).getByRole("definition")).toHaveText(["north", "null", "[25]"]);
  await expect(values.nth(1).getByRole("definition")).toHaveText(["south", "Not provided", "[]"]);
  await expect(values.nth(2).getByRole("definition")).toHaveText(["east", '""', "[0]"]);
  await expect(values.nth(3).getByRole("definition")).toHaveText(["text", '"17"', "[]"]);
  await expect(values.nth(4).getByRole("definition")).toHaveText(["number", "17", "[]"]);
});

test("a focused Python prediction still tests the full machine and all earlier examples", async ({ page }) => {
  const data = journeyFor("python-pydantic-models"), fresh = data.fresh!;
  const draft = workshopRecordKey(data.challenges.construction, journeyDraftId(data.build, "construction", data.plan!.investigation.caseIndex));
  accountBackendFor(page).seed(draft, workshopRecord(assemble(data.build.recipe, TOOLS)));
  await page.goto("/lab/python-pydantic-models");
  await waitForAccountReady(page);
  await page.locator("summary").filter({ hasText: fresh.name }).click();
  const check = page.getByTestId("journey-fresh-case");
  expect(fresh.prediction!.expected).toBe(false);
  await check.getByRole("group", { name: fresh.prediction!.question, exact: true }).getByRole("radio", { name: "No", exact: true }).check();
  await expect(check.getByRole("textbox")).toHaveCount(0);
  await check.getByRole("button", { name: "Save my prediction and test the next case", exact: true }).click();
  await expect(check).toContainText("Your construction handled the new inputs and still passed the earlier checks.");
  await check.getByTestId("journey-fresh-evidence").locator("summary").first().click();
  await expect(check.getByText("Answer to the prediction", { exact: true })).toBeVisible();
  await expect(check.getByTestId("journey-fresh-first-result").getByText("Required result", { exact: true })).toBeVisible();
  await expect(check).toContainText(`${data.build.cases.length + 1} of ${data.build.cases.length + 1} checks passed on that first run.`);
});

test("Pydantic runs in a fresh worksheet without loading the SDK", async ({ page }) => {
  test.setTimeout(180_000);
  const requests: string[] = [];
  page.on("request", request => requests.push(request.url()));
  await page.goto("/concepts/python-pydantic-models");
  await waitForAccountReady(page);
  const navigation = page.getByRole("navigation", { name: "Lesson navigation", exact: true });
  await navigation.getByText("Lesson contents", { exact: true }).click();
  await navigation.getByRole("button", { name: "Coding challenges", exact: true }).click();
  const editor = page.locator(".cm-content");
  await expect(editor).toBeVisible();
  const previous = expandedLessons.find(lesson => lesson.id === "python-pydantic-models")!.practice[0].continuation!;
  await expect(page.getByRole("group", { name: "Challenge instructions", exact: true }).getByRole("link", { name: previous.title, exact: true })).toHaveAttribute("href", previous.lesson + "?challenge=" + (previous.exercise + 1) + "#practice");
  await editor.fill(`from pydantic import BaseModel, ValidationError

class Reading(BaseModel):
    sensor: str
    temperature: float | None
    correction: float = 0.0

try:
    Reading(sensor="north")
except ValidationError as error:
    print("missing:", error.errors()[0]["loc"][0])

reading = Reading(sensor="north", temperature=None)
print(reading.temperature)
print(reading.correction)`);
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  await expect(page.locator("pre").filter({ hasText: /^missing: temperature\nNone\n0\.0\s*$/ })).toBeVisible({ timeout: 120_000 });
  expect(requests.some(url => /pydantic[^/]*\.whl/.test(url))).toBe(true);
  expect(requests.filter(url => /oop-ml\.zip|sdk-manifest\.json|scipy[^/]*\.whl/.test(url))).toEqual([]);

  await page.getByText("Prefer your own editor?", { exact: true }).click();
  await expect(page.getByText("python -m pip install pydantic==2.12.5", { exact: false })).toBeVisible();
  await expect(page.getByText("This exercise uses Python's standard library.", { exact: false })).not.toBeVisible();
  await page.getByRole("button", { name: "Show the worked solution", exact: true }).click();
  await page.getByRole("button", { name: "Replace editor with this solution", exact: true }).click();
  await page.getByRole("button", { name: "Run tests", exact: true }).click();
  await expect(page.getByText("All tests passed", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("group", { name: "Challenge instructions", exact: true }).getByRole("heading").scrollIntoViewIfNeeded();
  await page.screenshot({ path: ".practice-checks/python-pydantic-practice-mobile.png" });
});

test("a continuation opens the requested challenge in another lesson", async ({ page }) => {
  const current = expandedLessons.find(lesson => lesson.id === "python-function-design")!.practice[0];
  const previous = current.continuation!;
  const source = expandedLessons.find(lesson => "/concepts/" + lesson.id === previous.lesson)!;
  const destination = source.practice[previous.exercise];
  expect(previous.exercise).toBe(1);

  await page.goto("/concepts/python-function-design?challenge=1#practice");
  await waitForAccountReady(page);
  const instructions = page.getByRole("group", { name: "Challenge instructions", exact: true });
  await expect(instructions.getByRole("heading", { name: challengeQuestion(current), exact: true })).toBeVisible();
  const earlierWork = instructions.getByRole("link", { name: previous.title, exact: true });
  await expect(earlierWork).toHaveAttribute("href", previous.lesson + "?challenge=2#practice");
  await earlierWork.click();

  await expect(page).toHaveURL(new RegExp(previous.lesson + "\\?challenge=2#practice$"));
  await expect(page.getByRole("list", { name: "Coding challenges", exact: true }).getByRole("button").nth(1)).toHaveAttribute("aria-current", "step");
  await expect(instructions.getByRole("heading", { name: challengeQuestion(destination), exact: true })).toBeVisible();
  await expect(page.locator(".cm-content")).toContainText(destination.editTarget!);
});

test("the previous challenge link restores earlier edits during the same visit", async ({ page }) => {
  const lesson = expandedLessons.find(lesson => lesson.id === "python-readable-code")!;
  const [first, second] = lesson.practice;
  const firstDraft = '# My conversion draft\nprint("Keep my conversion edits")';
  const secondDraft = '# My formatting draft\nprint("Keep my formatting edits")';
  await page.goto("/concepts/python-readable-code?challenge=1#practice");
  await waitForAccountReady(page);
  const instructions = page.getByRole("group", { name: "Challenge instructions", exact: true });
  const cards = page.getByRole("list", { name: "Coding challenges", exact: true }).getByRole("button");
  const editor = page.locator(".cm-content");

  await expect(instructions.getByRole("heading", { name: challengeQuestion(first), exact: true })).toBeVisible();
  await editor.fill(firstDraft);
  await expect(editor).toContainText("Keep my conversion edits");
  await cards.nth(1).click();
  await expect(instructions.getByRole("heading", { name: challengeQuestion(second), exact: true })).toBeVisible();
  await editor.fill(secondDraft);
  await expect(editor).toContainText("Keep my formatting edits");

  const previous = instructions.getByRole("link", { name: second.continuation!.title, exact: true });
  await expect(previous).toHaveAttribute("href", "/concepts/python-readable-code?challenge=1#practice");
  await previous.click();
  await expect(page).toHaveURL(/\/concepts\/python-readable-code\?challenge=1#practice$/);
  await expect(cards.nth(0)).toHaveAttribute("aria-current", "step");
  await expect(instructions.getByRole("heading", { name: challengeQuestion(first), exact: true })).toBeVisible();
  await expect(editor).toContainText("Keep my conversion edits");
  await expect(editor).not.toContainText("Keep my formatting edits");

  await cards.nth(1).click();
  await expect(page).toHaveURL(/\/concepts\/python-readable-code\?challenge=2#practice$/);
  await expect(cards.nth(1)).toHaveAttribute("aria-current", "step");
  await expect(instructions.getByRole("heading", { name: challengeQuestion(second), exact: true })).toBeVisible();
  await expect(editor).toContainText("Keep my formatting edits");
  await previous.click();
  await expect(editor).toContainText("Keep my conversion edits");
});

test("a continued program opens at the current change without hiding its earlier helpers", async ({ page }) => {
  const exercise = expandedLessons.find(lesson => lesson.id === "python-composition")!.practice[0];
  await page.goto("/concepts/python-composition#practice");
  await waitForAccountReady(page);
  await expect(page.locator(".cm-content")).toContainText(exercise.editTarget!);
  await expect.poll(() => page.locator(".cm-scroller").evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  await expect(page.getByRole("group", { name: "Challenge instructions", exact: true }).getByRole("heading")).toBeVisible();
  expect(await page.evaluate(() => document.activeElement?.classList.contains("cm-content"))).toBe(false);
  await page.screenshot({ path: ".practice-checks/python-composition-practice-desktop.png" });
  await page.locator(".cm-scroller").evaluate(element => { element.scrollTop = 0; });
  await expect(page.locator(".cm-content")).toContainText(exercise.starter.split("\n").find(line => line.trim())!);
});

test("new workshop tools calculate the lesson cases on desktop and mobile", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const id of ["python-dry", "python-pydantic-models", "python-testing"]) {
    const build = buildById[id];
    await openFullWorkshop(page, id);
    await page.getByRole("checkbox", { name: "Animate signals", exact: true }).uncheck();
    await page.getByText("Stuck? Inspect a worked construction", { exact: true }).click();
    await page.getByRole("button", { name: "Assemble an example", exact: true }).click();
    await page.getByRole("button", { name: "Test all examples", exact: true }).click();
    await expect(page.getByTestId("construction-counter")).toHaveText(`${build.cases.length} passed · 0 failed · 0 not run`);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.setViewportSize({ width: 1280, height: 960 });
  }
  expect(errors).toEqual([]);
});
