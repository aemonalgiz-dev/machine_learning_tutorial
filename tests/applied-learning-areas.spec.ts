import { test, expect } from '@playwright/test';
import { LEARNING_AREAS } from '../lib/learning-areas';
import { lessonLocations } from '../lib/course-navigation';
import { labLessons } from '../lib/labs';
import { TOOLS } from '../lib/builds/tools';
import { assemble, evaluate, same } from '../lib/builds/engine';
import { buildById } from '../lib/builds/catalog';
import { expandedLessonById } from '../lib/lessons';
import plans from '../lib/lessons/applied-journeys.json';
import fresh from '../lib/lessons/applied-fresh.json';

test('applied paths preserve agent URLs and publish complete ML-specific lessons', () => {
  expect(LEARNING_AREAS).toHaveLength(11);
  expect(Object.keys(plans)).toHaveLength(24);
  expect(lessonLocations['/concepts/agent-or-workflow'].areaHref).toBe('/learn/ai-agents-and-applications');
  for (const id of Object.keys(plans) as (keyof typeof plans)[]) {
    const lesson = expandedLessonById[id];
    const plan = plans[id];
    expect(plan.connections.length).toBeLessThanOrEqual(2);
    for (const connection of plan.connections) {
      expect(buildById[connection.lessonId], id).toBeDefined();
      expect(labLessons.findIndex(item => item.id === connection.lessonId), id).toBeLessThan(labLessons.findIndex(item => item.id === id));
    }
    expect(lesson, id).toBeDefined();
    expect(lesson.practice[0].tests!.length, id).toBeGreaterThanOrEqual(3);
    expect(lesson.history.sources.length, id).toBeGreaterThan(0);
    for (const question of [...lesson.quiz, ...lesson.checkpoints!.flatMap(item => item.questions)]) expect(question.given?.data, id).toBeTruthy();
    const build = buildById[id], graph = assemble(build.recipe, TOOLS);
    for (const fixture of [...build.cases, fresh[id]]) {
      const result = evaluate(graph, fixture.data, TOOLS);
      expect(result.error, id).toBeUndefined();
      expect(same(result.output, fixture.expected), `${id}: ${JSON.stringify(result.output)}`).toBe(true);
    }
  }
});

test('new workshop primitives reject ambiguous schemas and preserve selection semantics', () => {
  expect(TOOLS.mlFieldOrder.run([['b','a','unused'],['a','b']], {})).toEqual([1,0]);
  expect(() => TOOLS.mlFieldOrder.run([['a','a'],['a']], {})).toThrow(/distinct/);
  expect(() => TOOLS.mlFieldOrder.run([['a'],['missing']], {})).toThrow(/missing/);
  expect(TOOLS.mlTopK.run([[-1,-2,-1],2], {})).toEqual([0,2]);
  expect(TOOLS.mlTopK.run([[1,2],0], {})).toEqual([]);
  expect(() => TOOLS.mlTopK.run([[1],-1], {})).toThrow(/nonnegative/);
  expect(TOOLS.mlClip.run([[-5,0,9],-2,3], {})).toEqual([-2,0,3]);
  expect(() => TOOLS.mlClip.run([[1],3,2], {})).toThrow(/lower bound/);
});

test('new learning areas and one lesson in each render without browser errors', async ({ page }) => {
  test.setTimeout(240_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const paths = [
    ['software-engineering','software-feature-contracts'],
    ['data-engineering','data-asof-features'],
    ['computer-systems-and-infrastructure','systems-inference-batching'],
    ['robotics-and-control','robot-perception-frames'],
    ['security-and-privacy','security-retrieval-authority'],
    ['scientific-computing-and-simulation','simulation-time-steps'],
  ];
  for (const [area,id] of paths) {
    await page.goto(`/learn/${area}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(LEARNING_AREAS.find(item => item.id === area)!.title);
    await expect(page.locator('#sections a').first()).toHaveAttribute('href', lessonLocations[`/concepts/${id}`].sectionHref);
    await page.goto(`/concepts/${id}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(expandedLessonById[id].title);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), id).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('a learner wires a batch latency calculation and receives passing results', async ({ page }) => {
  await page.goto('/lab/systems-inference-batching');
  for (const name of ['Arrival times in ms','Dispatch time in ms','Execution duration in ms','Add','Subtract']) {
    await page.getByRole('button', { name, exact: true }).click();
  }
  const wire = async (from: string, to: string) => {
    await page.getByRole('button', { name: from, exact: true }).click();
    await page.getByRole('button', { name: to, exact: true }).click();
  };
  await wire('Dispatch time in ms output','Add input 1: First contribution');
  await wire('Execution duration in ms output','Add input 2: Second contribution');
  await wire('Add output','Subtract input 1: Starting value');
  await wire('Arrival times in ms output','Subtract input 2: Value to remove');
  await wire('Subtract output','Result input 1: Your result');
  await page.getByRole('button', { name: 'Test all examples', exact: true }).click();
  await expect(page.getByTestId('construction-counter')).toHaveText('2 passed · 0 failed · 0 not run');
  await page.screenshot({ path: '.practice-checks/applied-batching-workshop.png', fullPage: false });
});

test('all new lesson and workshop routes respond and new areas fit a phone', async ({ request, page }) => {
  test.setTimeout(240_000);
  for (const id of Object.keys(plans)) {
    for (const prefix of ['concepts','lab']) {
      const response = await request.get(`/${prefix}/${id}`);
      expect(response.status(), `${prefix}/${id}`).toBe(200);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/learn/ai-agents-and-applications');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('AI Agents and Applications');
  await expect(page.getByRole('link', { name: 'Give Botie his first agent task →', exact: true })).toHaveAttribute('href', '/lab/agent-introduction');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '.practice-checks/applied-agents-mobile.png', fullPage: true });
});
