import { test, expect } from '@playwright/test';
import { CURRICULUM } from '../lib/curriculum';
import { LEARNING_AREAS, learningAreaSections } from '../lib/learning-areas';
import { lessonHrefs, lessonLocations, courseSectionHref } from '../lib/course-navigation';
import { expandedLessonById } from '../lib/lessons';
import { buildById } from '../lib/builds/catalog';
import { assemble, evaluate, same, type Build } from '../lib/builds/engine';
import { TOOLS } from '../lib/builds/tools';
import plans from '../lib/lessons/applied-journeys.json';
import fresh from '../lib/lessons/applied-fresh.json';

const ids = [
  'what-is-databricks',
  'databricks-data-lakes',
  'databricks-workspaces-compute',
  'databricks-table-names',
  'databricks-basics',
  'databricks-notebooks-jobs',
  'databricks-mlflow-basics',
] as const;
const sectionTitle = 'Introduction to Databricks';

test('Databricks has a full introductory section before the pipeline tutorials', () => {
  const area = LEARNING_AREAS.find(item => item.id === 'data-engineering')!;
  expect(learningAreaSections(area).map(item => item.title)).toEqual([
    'Data Pipelines', sectionTitle, 'Data Pipelines with Databricks',
  ]);
  const section = CURRICULUM.find(item => item.title === sectionTitle)!;
  expect(courseSectionHref(section)).toBe('/sections/introduction-to-databricks');
  expect(lessonHrefs(section)).toEqual(ids.map(id => `/concepts/${id}`));
  expect(lessonLocations['/concepts/databricks-mlflow-basics'].next?.href).toBe('/concepts/databricks-lazy-dataframes');
  expect(lessonLocations['/concepts/databricks-lazy-dataframes'].sectionTitle).toBe('Data Pipelines with Databricks');
  expect(lessonLocations['/concepts/databricks-lazy-dataframes'].position).toBe(1);
});

test('introductory constructions keep their record meaning on changed cases', () => {
  const freshCases = fresh as unknown as Record<string, Build['cases'][number]>;
  for (const id of ids) {
    const lesson = expandedLessonById[id];
    expect(lesson.openingBeforeHistory, id).toBe(true);
    expect(lesson.history.blocks.length, id).toBeGreaterThanOrEqual(2);
    expect(lesson.history.sources.length, id).toBeGreaterThanOrEqual(2);
    expect(lesson.practice[0].tests!.length, id).toBeGreaterThanOrEqual(4);
    const build = buildById[id];
    const graph = assemble(build.recipe, TOOLS);
    for (const fixture of [...build.cases, freshCases[id]]) {
      const before = JSON.stringify(fixture.data);
      const trace = evaluate(graph, fixture.data, TOOLS);
      expect(trace.error, `${id}: ${fixture.name}`).toBeUndefined();
      expect(same(trace.output, fixture.expected), `${id}: ${fixture.name}`).toBe(true);
      expect(JSON.stringify(fixture.data), `${id}: input mutation`).toBe(before);
    }
    for (const link of plans[id].connections) {
      const current = lessonLocations[`/concepts/${id}`];
      const earlier = lessonLocations[`/concepts/${link.lessonId}`];
      expect(earlier, `${id}: prerequisite exists`).toBeDefined();
      if (earlier.sectionTitle === sectionTitle) expect(earlier.position).toBeLessThan(current.position);
    }
  }
});

test('the data engineering page offers the introduction as its own section', async ({ page }) => {
  await page.goto('/learn/data-engineering');
  const intro = page.getByRole('link', { name: sectionTitle, exact: true });
  await expect(intro).toHaveAttribute('href', '/sections/introduction-to-databricks');
  await expect(page.getByRole('link', { name: 'Data Pipelines with Databricks', exact: true })).toHaveAttribute('href', '/sections/databricks-for-ml-pipelines');
  await intro.click();
  await expect(page.getByRole('heading', { level: 1, name: sectionTitle, exact: true })).toBeVisible();
  for (const id of ids) {
    await expect(page.getByRole('link', { name: expandedLessonById[id].title, exact: true })).toHaveAttribute('href', `/concepts/${id}`);
  }
  await page.getByRole('link', { name: 'What Is Databricks?', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'What Is Databricks?', exact: true })).toBeVisible();
  const lesson = expandedLessonById['what-is-databricks'];
  await expect(page.getByRole('heading', { level: 2, name: lesson.openingTitle, exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: lesson.history.title, exact: true })).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('the existing Spark lesson keeps its bookmarks after moving into the introduction', async ({ page }) => {
  await page.goto('/concepts/databricks-basics#what-is-databricks');
  await expect(page).toHaveURL(/\/concepts\/what-is-databricks$/);
  await expect(page.getByRole('heading', { level: 1, name: 'What Is Databricks?', exact: true })).toBeVisible();
  await page.goto('/concepts/databricks-basics#5-what-databricks-manages');
  await expect(page).toHaveURL(/\/concepts\/databricks-workspaces-compute$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Workspaces and Compute', exact: true })).toBeVisible();
  await page.goto('/concepts/databricks-basics#4-count-records-without-losing-the-partition-boundaries');
  await expect(page.getByRole('heading', { level: 2, name: '4. Count Records Without Losing the Partition Boundaries', exact: true })).toBeVisible();
});
