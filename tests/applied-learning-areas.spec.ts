import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { LEARNING_AREAS } from '../lib/learning-areas';
import { lessonLocations } from '../lib/course-navigation';
import { labLessons } from '../lib/labs';
import { TOOLS } from '../lib/builds/tools';
import { assemble, evaluate, same, type Build } from '../lib/builds/engine';
import { buildById } from '../lib/builds/catalog';
import { expandedLessonById } from '../lib/lessons';
import plans from '../lib/lessons/applied-journeys.json';
import fresh from '../lib/lessons/applied-fresh.json';
import { openFullWorkshop } from './helpers/open-workshop';
import { journeyFor } from '../lib/builds/journey';

// JSON's heterogeneous records infer optional undefined properties for absent
// fields. At runtime an absent field remains absent, as required by the tools.
const freshCases = fresh as unknown as Record<string, Build['cases'][number]>;

const databricksBookmarks = [
  ['1-begin-with-the-records-not-a-cluster-diagram', 'Begin with the records, not a cluster diagram'],
  ['2-give-the-proposed-result-its-own-name', 'Give the proposed result its own name'],
  ['3-ask-when-the-rows-are-actually-needed', 'Ask when the rows are actually needed'],
  ['4-read-a-spark-plan-before-collecting-a-result', 'Read a Spark plan before collecting a result'],
  ['5-reuse-the-procedure-not-an-accidentally-captured-answer', 'Reuse the procedure, not an accidentally captured answer'],
] as const;

test('Databricks foundations retain existing reading and quiz bookmarks', () => {
  const lesson = expandedLessonById['databricks-lazy-dataframes'];
  for (const [id] of databricksBookmarks) expect(lesson.parts.filter(part => part.id === id)).toHaveLength(1);
  expect(lesson.parts.findIndex(part => part.id === databricksBookmarks[0][0])).toBeGreaterThanOrEqual(2);
  expect(lesson.checkpoints?.find(checkpoint => checkpoint.id === 'questions-on-parts-1-to-3')?.title).toBe('Questions on Parts 1 to 5');
  expect(lesson.quizId).toBe('questions-on-parts-1-to-5');
  expect(expandedLessonById['numerical-adaptive-steps'].parts.find(part => part.id === '8-ask-a-library-for-the-trajectory-not-just-its-final-array')?.title).toBe('8. Ask a library for values at the observation times');
});

test('old Databricks links open the intended pages after the new introductions', async ({ page }) => {
  for (const [id, heading] of [
    ...databricksBookmarks,
    ['questions-on-parts-1-to-3', 'Questions on Parts 1 to 5'],
    ['questions-on-parts-1-to-5', 'Questions on Parts 1 to 7'],
  ]) {
    await page.goto(`/concepts/databricks-lazy-dataframes#${id}`);
    const section = page.locator(`[id="${id}"]`);
    await expect(section).toBeVisible();
    await expect(section.getByRole('heading', { level: 2 })).toContainText(heading);
  }
  await page.goto('/concepts/numerical-adaptive-steps#8-ask-a-library-for-the-trajectory-not-just-its-final-array');
  await expect(page.getByRole('heading', { level: 2, name: '8. Ask a library for values at the observation times', exact: true })).toBeVisible();
});

test('applied paths preserve agent URLs and publish complete ML-specific lessons', () => {
  expect(LEARNING_AREAS).toHaveLength(11);
  expect(Object.keys(plans)).toHaveLength(55);
  expect(lessonLocations['/concepts/agent-or-workflow'].areaHref).toBe('/learn/ai-agents-and-applications');
  for (const id of Object.keys(plans) as (keyof typeof plans)[]) {
    const lesson = expandedLessonById[id];
    const plan = plans[id];
    expect(() => journeyFor(id), id).not.toThrow();
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
    for (const fixture of [...build.cases, freshCases[id]]) {
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

test('new contract and estimation tools keep absence separate from a real zero', () => {
  const inspected = TOOLS.contractInspectField.run([[{ temperature: 0 }, {}, { temperature: null }], 'temperature'], {});
  expect(TOOLS.contractFieldActions.run([inspected], {})).toEqual(['keep', 'default', 'reject']);
  expect(TOOLS.contractResolveFields.run([inspected, 7], {})).toEqual([0, 7, null]);

  const prior = { mean: 2, variance: 1 };
  expect(TOOLS.stateObserveOptional.run([prior, null, 1], {})).toEqual(prior);
  expect(TOOLS.stateObserveOptional.run([prior, 0, 1], {})).toEqual({ mean: 1, variance: 0.5 });
  expect(TOOLS.stateObserveOptional.run([{ mean: 1, variance: 1e308 }, 3, 1e308], {})).toEqual({ mean: 2, variance: 5e307 });
  const wideDistance = TOOLS.stateInnovationDistances.run([{ mean: 0, variance: 1e308 }, [1e154], 1e308], {}) as number[];
  expect(wideDistance).toHaveLength(1);
  expect(wideDistance[0]).toBeCloseTo(0.5, 14);
  expect(() => TOOLS.stateEstimate.run([0, -1], {})).toThrow(/negative/);
  expect(() => TOOLS.stateUniqueObservation.run([[0, 1], [1]], {})).toThrow(/each candidate/);

  expect(TOOLS.lifecycleConditionalRate.run([[0, 0], [1, 1]], {})).toEqual({ eligible: 0, successes: 0, rate: null });
});

test('new learning areas and one lesson in each render without browser errors', async ({ page }) => {
  test.setTimeout(240_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const paths = [
    ['software-engineering','software-named-request-contracts','Model and Tool API Contracts'],
    ['data-engineering','databricks-lazy-dataframes','Databricks for ML Pipelines'],
    ['computer-systems-and-infrastructure','serving-prefill-decode','LLM Inference and Capacity'],
    ['robotics-and-control','state-predict-correct','Estimating State from Noisy Observations'],
    ['security-and-privacy','security-training-provenance','Threats Across the ML Lifecycle'],
    ['scientific-computing-and-simulation','numerical-stable-normalisation','Numerical Methods for Learning'],
  ];
  for (const [area,id,section] of paths) {
    await page.goto(`/learn/${area}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(LEARNING_AREAS.find(item => item.id === area)!.title);
    await expect(page.locator('#sections').getByRole('link', { name: section, exact: true })).toHaveAttribute('href', lessonLocations[`/concepts/${id}`].sectionHref);
    await page.goto(`/concepts/${id}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(expandedLessonById[id].title);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), id).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('a learner wires a batch latency calculation and receives passing results', async ({ page }) => {
  await openFullWorkshop(page, 'systems-inference-batching');
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
  await expect(page.getByTestId('construction-counter')).toHaveText(`${buildById['systems-inference-batching'].cases.length} passed · 0 failed · 0 not run`);
  await page.screenshot({ path: '.practice-checks/applied-batching-workshop.png', fullPage: false });
});

test('new numerical practice reports failure, then checks a working solution on changed inputs', async ({ page, context }) => {
  test.setTimeout(180_000);
  await context.route('https://cdn.jsdelivr.net/pyodide/v314.0.7/full/*.whl', async route => {
    try {
      const body = await readFile(path.join(process.cwd(), '.practice-checks', path.basename(new URL(route.request().url()).pathname)));
      await route.fulfill({ body, contentType: 'application/zip', headers: { 'access-control-allow-origin': '*' } });
    } catch { await route.continue(); }
  });
  const lesson = expandedLessonById['numerical-stable-normalisation'];
  await page.goto(`/concepts/${lesson.id}#practice-work-through-the-problem-with-numpy`);
  await expect(page.locator('.cm-content')).toBeVisible();
  await page.getByRole('button', { name: 'Run tests', exact: true }).click();
  await expect(page.getByLabel('Test counts')).toContainText(/[1-9]\d* failed/, { timeout: 120_000 });
  await page.getByText('Show the worked solution', { exact: true }).click();
  await page.getByRole('button', { name: 'Replace editor with this solution', exact: true }).click();
  await page.getByRole('button', { name: 'Run tests', exact: true }).click();
  await expect(page.getByText('All tests passed', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Test counts')).toContainText('0 failed');
});

test('all new lesson and workshop routes respond and new areas fit a phone', async ({ request, page }) => {
  test.setTimeout(360_000);
  for (const id of Object.keys(plans)) {
    for (const prefix of ['concepts','lab']) {
      const response = await request.get(`/${prefix}/${id}`);
      expect(response.status(), `${prefix}/${id}`).toBe(200);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/learn/ai-agents-and-applications');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('AI Agents and Applications');
  await expect(page.locator('#sections').getByRole('link', { name: 'Agents', exact: true })).toHaveAttribute('href', lessonLocations['/concepts/agent-introduction'].sectionHref);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '.practice-checks/applied-agents-mobile.png', fullPage: true });
});
