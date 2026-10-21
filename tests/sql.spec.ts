import { test, expect } from '@playwright/test';
import { expandedLessons } from '../lib/lessons';
import { lessonOrder, lessonLocations, findCourseSection, lessonHrefs } from '../lib/course-navigation';
import { searchEntries } from '../lib/lesson-search-index';
import { searchLessons } from '../lib/lesson-search';
import { assemble, evaluate, same } from '../lib/builds/engine';
import { TOOLS } from '../lib/builds/tools';
import { buildById } from '../lib/builds/catalog';
import { journeyFor } from '../lib/builds/journey';
import { openFullWorkshop } from './helpers/open-workshop';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const lessons = expandedLessons.filter(lesson => lesson.section === 'SQL');

test.beforeEach(async ({ context }) => {
  await context.route('https://cdn.jsdelivr.net/pyodide/v314.0.7/full/*.whl', async route => {
    try {
      const body = await readFile(path.join(process.cwd(), '.practice-checks', path.basename(new URL(route.request().url()).pathname)));
      await route.fulfill({ body, contentType: 'application/zip', headers: { 'access-control-allow-origin': '*' } });
    } catch { await route.continue(); }
  });
});

test('SQL belongs to Databases and its full path respects prerequisites', () => {
  expect(lessons).toHaveLength(34);
  expect(lessonHrefs(findCourseSection('sql')!)).toEqual(lessons.map(lesson => `/concepts/${lesson.id}`));
  for (const lesson of lessons) {
    const href = `/concepts/${lesson.id}`;
    expect(lessonLocations[href].areaHref).toBe('/learn/databases');
    for (const prerequisite of lesson.prerequisites) {
      expect(lessonOrder.indexOf(prerequisite.href), `${lesson.id}: ${prerequisite.href}`).toBeGreaterThanOrEqual(0);
      expect(lessonOrder.indexOf(prerequisite.href), lesson.id).toBeLessThan(lessonOrder.indexOf(href));
    }
  }
  for (const term of ['SQL', 'NULL', 'recursive', 'window frames', 'normalization', 'SQL injection', 'point in time', 'watermark']) {
    expect(searchLessons(searchEntries, term, 'databases').some(entry => entry.href.startsWith('/concepts/sql-')), term).toBe(true);
  }
});

test('SQL questions include data and query exercises expose their actual fixtures', () => {
  for (const lesson of lessons) {
    expect(lesson.history.sources.length, lesson.id).toBeGreaterThan(0);
    expect(lesson.intuition.every(step => step.scene), lesson.id).toBe(true);
    expect(lesson.parts.some(part => part.examples?.length), lesson.id).toBe(true);
    expect(JSON.stringify(lesson), lesson.id).not.toContain('\u2014');
    for (const question of [...lesson.quiz, ...(lesson.checkpoints ?? []).flatMap(checkpoint => checkpoint.questions)]) {
      expect(question.given?.data || question.given?.code, `${lesson.id}: ${question.prompt}`).toBeTruthy();
    }
    for (const exercise of lesson.practice) {
      expect(exercise.tests?.length, `${lesson.id}: ${exercise.title}`).toBeGreaterThan(1);
      if (exercise.language === 'sql') {
        expect(exercise.sql?.tables, lesson.id).toBeDefined();
        expect(exercise.sql?.setup, lesson.id).toBeDefined();
        expect(Array.isArray(JSON.parse(exercise.output)), lesson.id).toBe(true);
      }
    }
    for (const example of lesson.parts.flatMap(part => part.examples ?? [])) if (example.language === 'sql') {
      expect(example.tables, lesson.id).toBeDefined();
      expect(example.resultTable?.rows, lesson.id).toEqual(JSON.parse(example.output));
    }
  }
});

test('SQL workshop constructions handle the changed records and independent fresh shift', () => {
  for (const lesson of lessons) {
    const build = buildById[lesson.id], journey = journeyFor(lesson.id);
    const graph = assemble(build.recipe, TOOLS);
    for (const fixture of [...build.cases, journey.fresh!]) {
      const trace = evaluate(graph, fixture.data, TOOLS);
      expect(trace.error, `${lesson.id}: ${fixture.name}`).toBeUndefined();
      expect(same(trace.output, fixture.expected), `${lesson.id}: ${fixture.name}: ${JSON.stringify(trace.output)}`).toBe(true);
    }
    expect(evaluate({ ...graph, connections: graph.connections.filter(wire => wire.to !== 'output') }, build.cases[0].data, TOOLS).error, lesson.id).toBeDefined();
  }
});

test('record components preserve SQL missingness, duplicate pairs and empty aggregates', () => {
  const input = [{ id: 1, minutes: 0 }, { id: 2, minutes: null }];
  expect(TOOLS.sqlFilter.run([input, null], { field: 'minutes', operator: '=' })).toEqual([]);
  expect(TOOLS.sqlNullFilter.run([input], { field: 'minutes', mode: 'is null' })).toEqual([input[1]]);
  expect(TOOLS.sqlAggregate.run([[]], { field: 'minutes', operation: 'sum', output: 'total' })).toEqual([{ total: null }]);
  expect(TOOLS.sqlAggregate.run([input], { field: 'minutes', operation: 'count values', output: 'count' })).toEqual([{ count: 1 }]);
  const settings = { leftKey: 'id', rightKey: 'asset', kind: 'left', rightFields: 'minutes', rightPrefix: 'visit_' };
  const result = TOOLS.sqlJoin.run([[{ id: 'P1' }, { id: null }], [{ asset: 'P1', minutes: 10 }, { asset: 'P1', minutes: 20 }, { asset: null, minutes: 99 }]], settings);
  expect(result).toEqual([{ id: 'P1', visit_minutes: 10 }, { id: 'P1', visit_minutes: 20 }, { id: null, visit_minutes: null }]);
  expect(input).toEqual([{ id: 1, minutes: 0 }, { id: 2, minutes: null }]);
});

test('Databases opens separately and SQL queries run with pass/fail feedback', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Learning areas', exact: true }).getByRole('link', { name: /^Databases/ }).click();
  await expect(page).toHaveURL(/\/learn\/databases$/);
  await page.getByRole('link', { name: /^SQL\b/ }).click();
  await expect(page.getByRole('heading', { name: 'SQL', exact: true })).toBeVisible();
  await page.goto('/concepts/sql-tables#practice-write-the-query');
  await expect(page.locator('[aria-label="Challenge tables"] table').first()).toBeVisible();
  await page.getByRole('button', { name: 'Ask Botie for a hint', exact: true }).click();
  await expect(page.getByRole('list', { name: 'Hints from Botie' })).toBeVisible();
  const editor = page.getByRole('textbox', { name: /^SQL solution for/ });
  await editor.fill("SELECT asset_id, kind FROM assets WHERE kind = 'pump' ORDER BY asset_id;");
  await page.getByRole('button', { name: 'Run tests', exact: true }).click();
  await expect(page.getByLabel('Test counts', { exact: true })).toContainText('failed', { timeout: 90000 });
  expect(await page.getByLabel('Test counts', { exact: true }).textContent()).not.toContain('0 failed');
  await editor.fill(lessons.find(lesson => lesson.id === 'sql-tables')!.practice[0].solution);
  await page.getByRole('button', { name: 'Run tests', exact: true }).click();
  await expect(page.getByText('All tests passed', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Test counts', { exact: true })).toContainText('0 failed');
  await expect(page.locator('[aria-label="SQL result"] tbody tr')).toHaveCount(4);
  await editor.fill('DELETE FROM inspections; DELETE FROM readings; DELETE FROM assets; SELECT COUNT(*) AS remaining FROM assets;');
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.locator('[aria-label="SQL result"] tbody')).toHaveText('0');
  await editor.fill('SELECT COUNT(*) AS restored FROM assets;');
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.locator('[aria-label="SQL result"] tbody')).toHaveText('4');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('sql-practice-mobile.png'), fullPage: true });
});

test('a SQL workshop connects records and calculates the changed cases', async ({ page }) => {
  await openFullWorkshop(page, 'sql-left-joins');
  await page.getByRole('checkbox', { name: 'Animate signals', exact: true }).uncheck();
  await page.getByText('Stuck? Inspect a worked construction', { exact: true }).click();
  await page.getByRole('button', { name: 'Assemble an example', exact: true }).click();
  await page.getByRole('button', { name: 'Test all examples', exact: true }).click();
  await expect(page.getByText(`${buildById['sql-left-joins'].cases.length} passed`, { exact: false }).first()).toBeVisible();
  await expect(page.getByTestId('connection-path').first()).toBeAttached();
});

test('the parameter-binding lesson can move between SQL and Python in one workspace', async ({ page }) => {
  await page.goto('/concepts/sql-parameters-permissions#practice-write-the-query');
  for (let card = 0; card < 2; card++) {
    await page.getByRole('button', { name: 'Show the worked solution', exact: true }).click();
    await page.getByRole('button', { name: 'Replace editor with this solution', exact: true }).click();
    await page.getByRole('button', { name: 'Run tests', exact: true }).click();
    await expect(page.getByText('All tests passed', { exact: true })).toBeVisible({ timeout: 90000 });
    if (!card) await page.getByRole('button', { name: /^Next challenge/ }).click();
  }
  await expect(page.getByRole('textbox', { name: /^Python solution for/ })).toBeVisible();
  await page.getByRole('button', { name: 'Previous challenge', exact: true }).click();
  await expect(page.getByRole('textbox', { name: /^SQL solution for/ })).toBeVisible();
  await page.getByRole('button', { name: 'Run tests', exact: true }).click();
  await expect(page.getByText('All tests passed', { exact: true })).toBeVisible();
});
