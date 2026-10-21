import { test, expect } from '@playwright/test';
import { TOOLS } from '../lib/builds/tools';
import { buildById } from '../lib/builds/catalog';
import { modelEvaluationJourneys } from '../lib/builds/journeys/model-evaluation';
import { modelEvaluationFreshCases } from '../lib/builds/journey-fresh/model-evaluation';
import { assemble, evaluate, same } from '../lib/builds/engine';
import { expandedLessons } from '../lib/lessons';
import { lessonOrder } from '../lib/course-navigation';
import { searchEntries } from '../lib/lesson-search-index';
import { openFullWorkshop } from './helpers/open-workshop';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const lessons = expandedLessons.filter(l => l.section === 'Evaluating and Improving Models');

test('model evaluation lessons have complete evidence and earlier prerequisites', () => {
  expect(lessons).toHaveLength(9);
  for (const lesson of lessons) {
    expect(lesson.parts.length).toBeGreaterThanOrEqual(6);
    expect(lesson.parts.map(p => p.title)).toContain(lesson.technicalStart);
    expect(lesson.history.sources.length).toBeGreaterThan(0);
    expect(JSON.stringify(lesson)).not.toContain('—');
    expect(new Set(lesson.parts.map(p => p.title)).size).toBe(lesson.parts.length);
    for (const question of [...lesson.quiz, ...lesson.checkpoints!.flatMap(c => c.questions)]) expect(question.given?.data?.length).toBeGreaterThan(0);
    for (const exercise of lesson.practice) expect(exercise.tests!.length).toBeGreaterThanOrEqual(3);
    const position = lessonOrder.indexOf(`/concepts/${lesson.id}`);
    for (const prior of lesson.prerequisites) {
      expect(lessonOrder.indexOf(prior.href), `${lesson.id}: ${prior.href}`).toBeGreaterThanOrEqual(0);
      expect(lessonOrder.indexOf(prior.href), `${lesson.id}: ${prior.href}`).toBeLessThan(position);
    }
    expect(searchEntries.some(e => e.href === `/concepts/${lesson.id}`)).toBe(true);
  }
});

test('every new construction and preparation calculates changed and independent cases', () => {
  for (const [id, plan] of Object.entries(modelEvaluationJourneys)) {
    const build = buildById[id], fresh = modelEvaluationFreshCases[id];
    const full = assemble(build.recipe, TOOLS);
    let recipe = build.recipe;
    for (const i of plan.preparation!.path) {
      if (!('inputs' in recipe)) throw Error(`Invalid preparation: ${id}`);
      recipe = recipe.inputs[i];
    }
    const partial = assemble(recipe, TOOLS);
    for (const fixture of [...build.cases, fresh]) {
      const trace = evaluate(full, fixture.data, TOOLS);
      expect(trace.error, `${id}: ${fixture.name}`).toBeUndefined();
      expect(same(trace.output, fixture.expected), `${id}: ${fixture.name}`).toBe(true);
      const preparation = evaluate(partial, fixture.data, TOOLS);
      expect(preparation.error, `${id}: preparation`).toBeUndefined();
      expect(preparation.output).toBeDefined();
    }
    expect(build.cases.some(c => same(c.data, fresh.data)), id).toBe(false);
    expect(plan.investigation.caseIndex).toBeLessThan(build.cases.length);
  }
});

test('metric operations preserve undefined denominators, ties and error direction', () => {
  expect(TOOLS.meResidualReport.run([-1,5/3,Math.sqrt(3)], {})).toEqual({ bias:-1,mae:5/3,rmse:Math.sqrt(3) });
  expect(TOOLS.meThresholdMask.run([[.8,.8,.1],.8], {})).toEqual([1,1,0]);
  expect(TOOLS.mePrecisionRecall.run([{tp:0,fp:0,fn:2}], {})).toEqual({alerts:0,precision:null,recall:0});
  expect(TOOLS.meSelectiveRisk.run([[0,0],[1,0]], {})).toEqual({accepted:0,review:2,coverage:0,risk:null});
  expect(TOOLS.meGainReport.run([[2,-2,0]], {})).toEqual({meanGain:0,improved:1,regressed:1,tied:1});
  expect(TOOLS.meSlices.run([[2,0,4],['__proto__','night','__proto__']], {})).toEqual([{group:'__proto__',n:2,mae:3},{group:'night',n:1,mae:0}]);
  expect(TOOLS.meTolerance.run([[-.25,1,.25],.25], {})).toEqual([1,0,1]);
});

test('evaluation operations reject broken data contracts instead of producing reassuring scores', () => {
  expect(() => TOOLS.meResiduals.run([[1,2],[1]], {})).toThrow(/same order/);
  expect(() => TOOLS.meResidualReport.run([0,-1,1], {})).toThrow(/negative/);
  expect(() => TOOLS.meThresholdMask.run([[1.1],.5], {})).toThrow();
  expect(() => TOOLS.meBinaryCounts.run([[1],[2]], {})).toThrow();
  expect(() => TOOLS.meSlices.run([[1,2],['day']], {})).toThrow();
  expect(() => TOOLS.meOuterScore.run([[[1,2]],[2]], {})).toThrow(/outside/);
  expect(() => TOOLS.meInnerChoice.run([[[1],[2,3]]], {})).toThrow();
  expect(() => TOOLS.meSelectiveRisk.run([[1],[0,1]], {})).toThrow();
  expect(() => TOOLS.meTolerance.run([[0],-1], {})).toThrow();
  expect(() => TOOLS.mePairedGain.run([[1],[-1]], {})).toThrow();
});

test('selection respects inner ties and development review preserves original labels', () => {
  expect(TOOLS.meInnerChoice.run([[[2,2,3],[9,2,1]]], {})).toEqual([0,2]);
  const rows = [{id:'edge',split:'development',label:0,p:.9},{id:'test',split:'test',label:0,p:1}];
  const snapshot = structuredClone(rows);
  const eligible = TOOLS.meDevelopmentRows.run([rows], {});
  expect(TOOLS.meDisagreements.run([eligible,.9], {})).toEqual(['edge']);
  expect(rows).toEqual(snapshot);
  expect(() => TOOLS.meDevelopmentRows.run([[rows[0],rows[0]]], {})).toThrow(/unique/);
  expect(() => TOOLS.meDisagreements.run([eligible,.5], {})).toThrow();
});

test('the trial gate retains all failures and accepts exact policy boundaries', () => {
  const policy = {minGain:.5,maxIncrease:.25,maxMs:10};
  expect(TOOLS.meRevisionGate.run([{improvement:.5,worstSliceIncrease:.25},policy,10], {})).toEqual({improvement:.5,worstSliceIncrease:.25,decision:'eligible for trial',reasons:[]});
  expect(TOOLS.meRevisionGate.run([{improvement:0,worstSliceIncrease:1},policy,11], {})).toMatchObject({decision:'hold',reasons:['insufficient improvement','group regression','runtime exceeded']});
  expect(() => TOOLS.meRevisionGate.run([{improvement:1,worstSliceIncrease:0},policy,-1], {})).toThrow();
});

test('the evaluation section is reachable and tables stay readable on mobile', async ({ page }) => {
  await page.goto('/learn/machine-learning');
  await page.getByRole('link', { name:/^Evaluating and Improving Models/ }).click();
  await expect(page.getByRole('heading', {name:'Evaluating and Improving Models',exact:true})).toBeVisible();
  for (const lesson of lessons) await expect(page.locator(`a[href="/concepts/${lesson.id}"]`).first()).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  await page.goto('/concepts/model-evaluation-slices');
  await expect(page.getByRole('heading', {name:'Better for Which Cases?',exact:true})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('combobox',{name:'Choose a section',exact:true}).first().selectOption({label:'3. Distinguish equal readings from equal groups'});
  await expect(page.getByText('Equal-group MAE = (1 + 4) / 2 = 2.5',{exact:false})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({path:test.info().outputPath('model-slices-mobile.png'),fullPage:true});
});

test('the model repair workshop connects real operations and reports changed examples', async ({page}) => {
  await openFullWorkshop(page,'model-iteration-project');
  await page.getByRole('checkbox',{name:'Animate signals',exact:true}).uncheck();
  await page.getByText('Stuck? Inspect a worked construction',{exact:true}).click();
  await page.getByRole('button',{name:'Assemble an example',exact:true}).click();
  await page.getByRole('button',{name:'Test all examples',exact:true}).click();
  await expect(page.getByText('3 passed',{exact:false}).first()).toBeVisible();
  await expect(page.getByTestId('connection-path').first()).toBeAttached();
  await page.screenshot({path:test.info().outputPath('model-repair-workshop.png'),fullPage:true});
});

test('the NumPy fitting challenge runs changed-data and leakage tests in the browser', async ({page,context}) => {
  test.setTimeout(180_000);
  await context.route('https://cdn.jsdelivr.net/pyodide/v314.0.7/full/*.whl',async route => {
    try { const body=await readFile(path.join(process.cwd(),'.practice-checks',path.basename(new URL(route.request().url()).pathname))); await route.fulfill({body,contentType:'application/zip',headers:{'access-control-allow-origin':'*'}}); }
    catch { await route.continue(); }
  });
  await page.goto('/concepts/model-iteration-project#practice-work-through-the-problem-with-numpy');
  await page.getByRole('button',{name:'Run tests',exact:true}).click();
  await expect(page.getByLabel('Test counts')).toContainText(/[1-9]\d* failed/, {timeout:120_000});
  await expect(page.getByRole('group',{name:'Code and results',exact:true})).toContainText('NotImplementedError');
  await page.getByText('Show the worked solution',{exact:true}).click();
  await page.getByRole('button',{name:'Replace editor with this solution',exact:true}).click();
  await page.getByRole('button',{name:'Run tests',exact:true}).click();
  await expect(page.getByText('All tests passed',{exact:true})).toBeVisible();
  await expect(page.getByLabel('Test counts')).toContainText('0 failed');
});
