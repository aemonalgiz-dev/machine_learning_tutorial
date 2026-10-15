import { test, expect } from "@playwright/test";
import { CURRICULUM } from "../lib/curriculum";
import { LEARNING_AREAS, learningAreaSections, learningAreaForSection, learningAreaHref } from "../lib/learning-areas";
import { lessonHrefs, lessonLocations, lessonOrder, courseSectionHref, legacyCourseDestinations } from "../lib/course-navigation";
import { searchEntries } from "../lib/lesson-search-index";
import { searchLessons } from "../lib/lesson-search";

test("navigation contract: every published section has one home and every lesson stays reachable", () => {
  const assigned = LEARNING_AREAS.flatMap(area => area.groups.flatMap(group => group.sections));
  expect(assigned.slice().sort()).toEqual(CURRICULUM.map(section => section.title).sort());
  expect(new Set(assigned).size).toBe(assigned.length);
  expect(Object.keys(lessonLocations).sort()).toEqual([...lessonOrder].sort());
  expect(searchEntries.filter(entry => entry.kind === "Lesson").map(entry => entry.href).sort()).toEqual([...lessonOrder].sort());
  for (const section of CURRICULUM) {
    const area = learningAreaForSection(section)!;
    for (const href of lessonHrefs(section)) {
      expect(lessonLocations[href].areaHref).toBe(learningAreaHref(area));
      expect(lessonLocations[href].sectionHref).toBe(courseSectionHref(section));
    }
  }
});

test("navigation contract: reading paths stop at area boundaries and preserve internal order", () => {
  for (const area of LEARNING_AREAS) {
    const path = learningAreaSections(area).flatMap(lessonHrefs);
    path.forEach((href, index) => {
      const location = lessonLocations[href];
      expect(location.previous?.href).toBe(path[index - 1]);
      expect(location.next?.href).toBe(path[index + 1]);
    });
  }
  expect(lessonLocations["/concepts/simple-linear-regression"].previous).toBeUndefined();
  expect(lessonLocations["/primers/statistics"].sectionNumber).toBe(1);
  expect(lessonLocations["/concepts/simple-linear-regression"].sectionNumber).toBe(1);
  expect(legacyCourseDestinations["mathematics-as-needed"]).toBe("/sections/mathematics-as-needed");
});

test("navigation contract: search ranks exact titles and respects area and empty results", () => {
  expect(searchLessons(searchEntries, "  ATTENTION  ")[0].href).toBe("/concepts/attention");
  expect(searchLessons(searchEntries, "matrices").some(entry => entry.href === "/primers/linear-algebra")).toBe(true);
  expect(searchLessons(searchEntries, "", "mathematics-and-programming").every(entry => entry.areaId === "mathematics-and-programming")).toBe(true);
  expect(searchLessons(searchEntries, "attention", "first-principles-design")).toEqual([]);
  expect(searchLessons(searchEntries, "no-such-subject-xyz")).toEqual([]);
  expect(learningAreaSections(LEARNING_AREAS[2])).toHaveLength(4);
  expect(searchLessons(searchEntries, "inspection", "first-principles-design").some(entry => entry.href === "/concepts/design-inspection-review")).toBe(true);
});

test("homepage leads to learning areas, and old section links still work", async ({ page }) => {
  await page.goto("/");
  const areas = page.getByRole("navigation", { name: "Learning areas", exact: true });
  await expect(areas.getByRole("link")).toHaveCount(3);
  await expect(areas.getByRole("link").first()).toContainText("Mathematics and Programming");
  await areas.getByRole("link", { name: /^Machine Learning/ }).click();
  await page.getByRole("link", { name: /^Start with a Prediction/ }).click();
  await expect(page.getByRole("heading", { name: "Start with a Prediction", exact: true })).toBeVisible();
  await page.goto("/#mathematics-as-needed");
  await expect(page).toHaveURL(/\/sections\/mathematics-as-needed$/);
});

test("search accepts homepage queries and shows useful empty results", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox").fill("attention");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/search\?q=attention/);
  await expect(page.getByRole("heading", { name: "Attention", exact: true })).toBeVisible();
  await page.getByLabel("Learning area", { exact: true }).selectOption("first-principles-design");
  await expect(page.getByRole("status")).toContainText("0 results");
  await expect(page.getByText("No lessons or sections match this search.", { exact: false })).toBeVisible();
});
