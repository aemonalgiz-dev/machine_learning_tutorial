import { test, expect } from '@playwright/test';
import { CURRICULUM } from '../lib/curriculum';
import { americanEnglish } from '../lib/american-english';
import { courseSectionHref, findCourseSection, firstLesson, legacyCourseDestinations } from '../lib/course-navigation';
import { searchEntries } from '../lib/lesson-search-index';
import { searchLessons } from '../lib/lesson-search';

test('renamed sections retain their existing destinations and the first learning activity', () => {
  expect(findCourseSection('start-with-a-prediction')?.title).toBe('Introduction to Predictive Models');
  expect(findCourseSection('model-the-system-before-building-it')?.title).toBe('System Capacity and Resource Limits');
  expect(findCourseSection('from-learned-perception-to-control')?.title).toBe('Robot Perception and Control');
  expect(firstLesson).toBe('/concepts/simple-linear-regression');
  expect(legacyCourseDestinations['following-a-distributed-calculation']).toBe('/sections/databricks-for-ml-pipelines#following-a-distributed-calculation');
});

test('search finds the revised subjects and retains previous topic wording as aliases', () => {
  expect(searchLessons(searchEntries, 'System Capacity and Resource Limits')[0].href).toBe('/sections/model-the-system-before-building-it');
  expect(searchLessons(searchEntries, 'When the answer arrives').some(item => item.href === '/sections/llm-inference-and-capacity')).toBe(true);
  expect(searchLessons(searchEntries, 'Data Pipelines with Databricks')[0].href).toBe('/sections/databricks-for-ml-pipelines');
});

test('every section keeps its route and renders the reviewed title', async ({ request }) => {
  for (const section of CURRICULUM) {
    const response = await request.get(courseSectionHref(section));
    expect(response.status(), section.title).toBe(200);
    const html = await response.text();
    const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1];
    expect(heading, courseSectionHref(section)).toBe(americanEnglish(section.title));
  }
});

test('section cards and existing topic bookmarks show the revised titles', async ({ page }) => {
  await page.goto('/learn/data-engineering');
  const pipelines = page.getByRole('link', { name: 'Data Pipelines with Databricks', exact: true });
  await expect(pipelines).toHaveAttribute('href', '/sections/databricks-for-ml-pipelines');
  await pipelines.click();
  await expect(page.getByRole('heading', { level: 1, name: 'Data Pipelines with Databricks', exact: true })).toBeVisible();
  await page.goto('/sections/databricks-for-ml-pipelines#following-a-distributed-calculation');
  await expect(page.locator('#following-a-distributed-calculation').getByRole('heading', { name: 'Spark Query Plans and Data Skew', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 860 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
