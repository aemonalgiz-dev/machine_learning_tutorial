import { test, expect, type Page } from "@playwright/test";
import { lessonMilestones } from "../lib/learning-map";
import { newJourneyProgress, updateJourneyProgress } from "../lib/journey-progress";
import { reconcileLearnerValue } from "../lib/learner-reconcile";
import { findCourseSection, lessonHrefs } from "../lib/course-navigation";
import { mockAccountBackend, waitForAccountReady } from "./helpers/account-backend";

const id = "linear-algebra", lesson = "/primers/linear-algebra";
const now = Date.now();
const initial = newJourneyProgress(id, "Apply one price list to every customer", `/lab/${id}`);

test("visiting and exploring do not claim that a construction or exercise passed", () => {
  const visited = updateJourneyProgress(initial, { type: "touch", stage: "Build the bills" }, now);
  expect(lessonMilestones({ done: {}, required: {} }, lesson, visited)).toEqual({ started: true, explored: false, built: false, varied: false, exercises: false });
  const explored = updateJourneyProgress(visited, { type: "explored" }, now);
  expect(lessonMilestones({ done: {}, required: {} }, lesson, explored).built).toBe(false);
});

test("reconciling device edits preserves earned evidence without combining draft graphs", () => {
  const local = updateJourneyProgress(initial, { type: "touch", stage: "Back to the tools" }, now);
  const remote = updateJourneyProgress(initial, { type: "built", supported: true, attemptId: "another-device" }, now - 1000);
  const merged = reconcileLearnerValue(`journey-progress:${id}:v1`, local, remote) as typeof initial;
  expect(merged.stage).toBe("Back to the tools");
  expect(merged.built).toEqual(remote.built);
  expect(merged.attempts).toHaveLength(1);
  expect(lessonMilestones({ done: {}, required: {} }, lesson, merged).built).toBe(true);
  const graph = { pieces: ["my edited machine"], results: {} };
  expect(reconcileLearnerValue("workshop:test:v1", graph, { pieces: ["old machine"], results: { pass: true } })).toBe(graph);
});

async function seed(page: Page, complete = false) {
  const record = { ...initial, lastVisitedAt: now, stage: "Apply one price list to every customer", built: { at: now, supported: true }, transferred: complete ? { at: now, supported: false } : null };
  await mockAccountBackend(page, {
    records: [
      { key: `journey-progress:${initial.id}:v1`, value: record },
      { key: "journey-recent:v1", value: { id: initial.id, title: initial.title, href: initial.href, stage: record.stage, lastVisitedAt: now } },
    ],
    progress: complete ? { done: { [lesson]: ["quiz", "practice"] }, required: { [lesson]: 2 } } : { done: {}, required: {} },
  });
}

test("home resumes the actual workshop and displays only earned milestones", async ({ page }, testInfo) => {
  await seed(page);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await waitForAccountReady(page);
  await expect(page.getByRole("link", { name: "Return to your workshop", exact: true })).toHaveAttribute("href", "/lab/linear-algebra");
  const marks = page.getByRole("list", { name: "Current lesson milestones" });
  await expect(marks.locator('[data-earned="true"]')).toHaveCount(1);
  await expect(page.getByText(initial.title, { exact: true })).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Mathematics and Programming", exact: true })).toHaveClass(/is-current/);
  await page.screenshot({ path: testInfo.outputPath("journey-desktop.png") });
  expect(errors).toEqual([]);
});

test("an earned workshop and exercises lead to the next lesson in the same area", async ({ page }) => {
  await seed(page, true);
  await page.goto("/");
  await waitForAccountReady(page);
  await expect(page.getByRole("link", { name: "Next workshop", exact: true })).toHaveAttribute("href", "/lab/calculus");
  await expect(page.getByRole("list", { name: "Current lesson milestones" }).locator('[data-earned="true"]')).toHaveCount(3);
  await page.goto("/sections/mathematics-as-needed");
  const header = page.locator("article > header");
  const bar = header.getByRole("progressbar", { name: "Workshops tested" });
  await expect(bar).toHaveAttribute("aria-valuenow", "1");
  await expect(bar).toHaveAttribute("aria-valuemax", String(lessonHrefs(findCourseSection("mathematics-as-needed")!).length));
  await expect(header.locator(".path-progress")).toHaveCount(0);
  const barBounds = (await bar.boundingBox())!;
  const titleBounds = (await header.getByRole("heading", { level: 1 }).boundingBox())!;
  expect(barBounds.y + barBounds.height).toBeLessThan(titleBounds.y);
  await expect(page.locator(".trail-card.is-earned")).toHaveCount(1);
});

test("the path remains readable on mobile and in the light theme", async ({ page }, testInfo) => {
  await seed(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await waitForAccountReady(page);
  await expect(page.getByRole("heading", { name: "Continue with Botie", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("journey-mobile.png"), fullPage: true });
  await page.goto("/sections/mathematics-as-needed");
  await page.getByRole("button", { name: "Switch to the light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("lesson-trail-light.png"), fullPage: true });
});
