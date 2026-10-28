import { test, expect } from '@playwright/test';
import { TOOLS } from '../lib/builds/tools';
import { buildById } from '../lib/builds/catalog';
import { journeyFor } from '../lib/builds/journey';
import { evaluate, assemble, same } from '../lib/builds/engine';
import { agentIterationJourneys } from '../lib/builds/journeys/agent-iteration';
import { expandedLessons } from '../lib/lessons';
import { openFullWorkshop } from './helpers/open-workshop';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

test('agent iteration preparations compute their intended intermediate result', () => {
  for (const [id, plan] of Object.entries(agentIterationJourneys)) {
    const build = buildById[id];
    let recipe = build.recipe;
    for (const index of plan.preparation!.path) {
      if (!('inputs' in recipe)) throw Error(`${id}: missing preparation branch`);
      recipe = recipe.inputs[index];
    }
    const graph = assemble(recipe, TOOLS);
    for (const fixture of [...build.cases, journeyFor(id).fresh!]) {
      const trace = evaluate(graph, fixture.data, TOOLS);
      expect(trace.error, `${id}: ${fixture.name}`).toBeUndefined();
      expect(trace.output).toBeDefined();
    }
    const full = assemble(build.recipe, TOOLS);
    expect(same(evaluate(full, journeyFor(id).fresh!.data, TOOLS).output, journeyFor(id).fresh!.expected), id).toBe(true);
  }
});

test('selection never spends the allowance on held-out or unrelated examples', () => {
  const pool = [
    { id: 'test', split: 'held-out', kind: 'manual', tokens: 1, input: 'Q', output: 'A' },
    { id: 'large', split: 'development', kind: 'manual', tokens: 90, input: 'Q2', output: 'A2' },
    { id: 'small', split: 'development', kind: 'manual', tokens: 20, input: 'Q3', output: 'A3' },
  ];
  const snapshot = structuredClone(pool);
  const eligible = TOOLS.aiDemonstrations.run([pool, 'manual'], {});
  expect(TOOLS.aiExampleBudget.run([eligible, 20], {})).toEqual({ selected: ['small'], remaining: 0 });
  expect(pool).toEqual(snapshot);
  expect(() => TOOLS.aiDemonstrations.run([[pool[0], pool[0]], 'manual'], {})).toThrow(/unique/);
  expect(() => TOOLS.aiExampleBudget.run([eligible, -1], {})).toThrow();
});

test('contracts and paired experiments reject ambiguous identity rather than inflating scores', () => {
  const expected = [{ id: '__proto__', tool: 'read', asset: 'P7' }];
  expect(TOOLS.aiJoinContracts.run([expected, expected], {})).toEqual([{ id: '__proto__', passed: true }]);
  expect(TOOLS.aiJoinContracts.run([expected, []], {})).toEqual([{ id: '__proto__', passed: null }]);
  expect(() => TOOLS.aiJoinContracts.run([expected, [expected[0], expected[0]]], {})).toThrow(/unique/);
  expect(() => TOOLS.aiJoinContracts.run([[], expected], {})).toThrow(/no declared/);
  expect(() => TOOLS.aiPairOutcomes.run([[{ id: 'a', passed: true }], [{ id: 'b', passed: true }]], {})).toThrow(/same nonempty/);
  expect(() => TOOLS.aiPairOutcomes.run([[], []], {})).toThrow();
  expect(() => TOOLS.aiPairOutcomes.run([[{ id: 'a', passed: 1 }], [{ id: 'a', passed: true }]], {})).toThrow();
  expect(TOOLS.aiChangedFactors.run([{ examples: 'a' }, { examples: 'a', model: 'M2' }], {})).toEqual(['model']);
});

test('unknown failure locations and absent release measurements stay unresolved', () => {
  const records = [{ id: 'unknown', passed: false, stage: null }, { id: 'ok', passed: true, stage: null }];
  const failed = TOOLS.aiFailedRuns.run([records], {});
  expect(TOOLS.aiErrorGroups.run([failed], {})).toEqual({ counts: { evidence: 0, decision: 0, execution: 0 }, unresolved: ['unknown'] });
  const joined = TOOLS.aiCandidateCoverage.run([['x'], []], {});
  expect(TOOLS.aiTrialDecision.run([joined, 10], {})).toEqual({ decision: 'hold', reasons: ['x: missing'] });
  expect(TOOLS.aiTrialDecision.run([[], 10], {})).toEqual({ decision: 'hold', reasons: ['no required cases'] });
  expect(TOOLS.aiTrialDecision.run([[{ id: 'x', passed: true, critical: true, ms: 11 }], 10], {})).toEqual({ decision: 'hold', reasons: ['x: critical violation', 'x: too slow'] });
  expect(() => TOOLS.aiCandidateCoverage.run([['x', 'x'], []], {})).toThrow(/unique/);
  expect(() => TOOLS.aiTrialDecision.run([[{ id: 'x', passed: true, critical: false, ms: true }], 10], {})).toThrow();
});

test('the agent improvement section is discoverable and its lessons remain readable on mobile', async ({ page }) => {
  await page.goto('/learn/machine-learning');
  await page.getByRole('link', { name: /^Prompting, Evaluation and Iteration/ }).click();
  await expect(page.getByRole('heading', { name: 'Prompting, Evaluation and Iteration', exact: true })).toBeVisible();
  for (const lesson of expandedLessons.filter(l => l.section === 'Prompting, Evaluation and Iteration')) {
    await expect(page.locator(`a[href="/concepts/${lesson.id}"]`).first()).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/concepts/agent-framework-tests');
  const lesson = expandedLessons.find(l => l.id === 'agent-framework-tests')!;
  const referencePart = lesson.parts.find(p => p.references?.length)!;
  await page.getByText('Lesson contents', { exact: true }).click();
  await page.getByRole('combobox', { name: 'Jump to a page', exact: true }).first().selectOption({ label: referencePart.title });
  await expect(page.locator('[data-framework-reference]').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('agent-testing-mobile.png'), fullPage: true });
});

test('the new repair workshop runs its connected components and reports each test', async ({ page }) => {
  await openFullWorkshop(page, 'agent-iteration-project');
  await page.getByRole('checkbox', { name: 'Animate signals', exact: true }).uncheck();
  await page.getByText('Stuck? Inspect a worked construction', { exact: true }).click();
  await page.getByRole('button', { name: 'Assemble an example', exact: true }).click();
  await page.getByRole('button', { name: 'Test all examples', exact: true }).click();
  await expect(page.getByText('4 passed', { exact: false }).first()).toBeVisible();
  await expect(page.getByTestId('connection-path').first()).toBeAttached();
  await page.screenshot({ path: test.info().outputPath('agent-repair-workshop.png'), fullPage: true });
});

test('the repair coding challenge rejects an unfinished solution and runs its changed-case tests', async ({ page, context }) => {
  test.setTimeout(180_000);
  await context.route('https://cdn.jsdelivr.net/pyodide/v314.0.7/full/*.whl', async route => {
    try {
      const body = await readFile(path.join(process.cwd(), '.practice-checks', path.basename(new URL(route.request().url()).pathname)));
      await route.fulfill({ body, contentType: 'application/zip', headers: { 'access-control-allow-origin': '*' } });
    } catch { await route.continue(); }
  });
  const lesson = expandedLessons.find(l => l.id === 'agent-iteration-project')!;
  await page.goto(`/concepts/${lesson.id}#practice-work-through-the-problem-with-numpy`);
  await page.getByRole('button', { name: 'Run tests', exact: true }).click();
  await expect(page.getByText('Some tests need another look', { exact: true })).toBeVisible({ timeout: 120_000 });
  await expect(page.getByLabel('Test counts')).toContainText(/[1-9]\d* failed/);
  await page.getByText('Show the worked solution', { exact: true }).click();
  await page.getByRole('button', { name: 'Replace editor with this solution', exact: true }).click();
  await page.getByRole('button', { name: 'Run tests', exact: true }).click();
  await expect(page.getByText('All tests passed', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Test counts')).toContainText('0 failed');
});
