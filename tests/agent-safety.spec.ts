import { test, expect } from '@playwright/test';
import { expandedLessons } from '../lib/lessons';
import { lessonOrder } from '../lib/course-navigation';
import { searchEntries } from '../lib/lesson-search-index';
import { TOOLS } from '../lib/builds/tools';
import { buildById } from '../lib/builds/catalog';
import { assemble, evaluate, same } from '../lib/builds/engine';
import { agentSafetyJourneys } from '../lib/builds/journeys/agent-safety';
import { agentSafetyFreshCases } from '../lib/builds/journey-fresh/agent-safety';
import { openFullWorkshop } from './helpers/open-workshop';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const lessons = expandedLessons.filter(l => l.section === 'Agent Guardrails and Secure Development');

test('guardrail lessons are complete, ordered and discoverable', () => {
  expect(lessons).toHaveLength(9);
  for (const lesson of lessons) {
    expect(lesson.parts.length).toBeGreaterThanOrEqual(7);
    expect(lesson.parts.map(p => p.title)).toContain(lesson.technicalStart);
    expect(lesson.history.sources.length).toBeGreaterThan(0);
    expect(JSON.stringify(lesson)).not.toContain('—');
    expect(new Set(lesson.parts.map(p => p.title)).size).toBe(lesson.parts.length);
    const questions = [...lesson.quiz, ...lesson.checkpoints!.flatMap(c => c.questions)];
    expect(questions.length).toBeGreaterThanOrEqual(6);
    for (const question of questions) expect(question.given?.data?.length).toBeGreaterThan(0);
    expect(lesson.practice[0].tests!.length).toBeGreaterThanOrEqual(3);
    const position = lessonOrder.indexOf('/concepts/' + lesson.id);
    for (const prior of lesson.prerequisites) {
      expect(lessonOrder.indexOf(prior.href), lesson.id + ': ' + prior.href).toBeGreaterThanOrEqual(0);
      expect(lessonOrder.indexOf(prior.href), lesson.id + ': ' + prior.href).toBeLessThan(position);
    }
    expect(searchEntries.some(e => e.href === '/concepts/' + lesson.id)).toBe(true);
  }
});

test('every guardrail construction and preparation handles the fresh shift', () => {
  for (const [id, plan] of Object.entries(agentSafetyJourneys)) {
    const build = buildById[id], fresh = agentSafetyFreshCases[id];
    let recipe = build.recipe;
    for (const index of plan.preparation!.path) {
      if (!('inputs' in recipe)) throw Error('Invalid preparation: ' + id);
      recipe = recipe.inputs[index];
    }
    const snapshot = JSON.stringify(build);
    for (const fixture of [...build.cases, fresh]) {
      const trace = evaluate(assemble(build.recipe, TOOLS), fixture.data, TOOLS);
      expect(trace.error, id + ': ' + fixture.name).toBeUndefined();
      expect(same(trace.output, fixture.expected), id + ': ' + fixture.name).toBe(true);
      expect(evaluate(assemble(recipe, TOOLS), fixture.data, TOOLS).error, id).toBeUndefined();
    }
    expect(JSON.stringify(build)).toBe(snapshot);
    expect(build.cases.some(c => same(c.data, fresh.data)), id).toBe(false);
    expect(plan.investigation.caseIndex).toBeLessThan(build.cases.length);
  }
});

test('policy boundaries do not turn missing evidence into permission', () => {
  expect(TOOLS.sgRoutes.run([[{id:'x',missing:['approval']}]],{})).toEqual([{id:'x',route:'hold'}]);
  expect(TOOLS.sgMissing.run([[{id:'x',required:['unknown-effect']}],['unknown-effect']],{})).toEqual([{id:'x',missing:['unknown-effect']}]);
  expect(TOOLS.sgOutside.run([['src/a.py.bak'],['src/a.py']],{})).toEqual(['src/a.py.bak']);
  expect(TOOLS.sgPatchPaths.run([[{kind:'rename',oldPath:'tests/required.py',path:'src/a.py'}]],{})).toEqual(['tests/required.py','src/a.py']);
  expect(() => TOOLS.sgPatchDecision.run([[],1],{})).toThrow();
  expect(TOOLS.sgChecksMissing.run([{checks:{tests:'pass',scan:'skipped'}},['tests','scan','review']],{})).toEqual(['scan','review']);
  expect(TOOLS.sgManifestMatch.run([{},{}],{})).toBe(false);
});

test('credentials, approvals and observations retain their separate meanings', () => {
  const policy={issuer:'i',audience:'a',requiredScope:'read'};
  const claims={issuer:'i',audiences:['a'],subject:'u',expires:10,scopes:['read']};
  expect(TOOLS.sgTokenBoundary.run([claims,policy,10],{})).toBe(false);
  expect(TOOLS.sgScopeBoundary.run([null,policy],{})).toBe(false);
  expect(TOOLS.sgTokenBoundary.run([{...claims,audiences:['b']},policy,0],{})).toBe(false);
  const p={id:'a',record:'r',version:1,newValue:'done'};
  expect(TOOLS.sgApprovalBinding.run([p,{...p,approved:true,expires:5},5],{})).toBe(false);
  expect(TOOLS.sgActionRoute.run([true,false,p,[p]],{})).toBe('already applied');
  expect(TOOLS.sgActionRoute.run([true,true,p,[{...p,newValue:'other'}]],{})).toBe('idempotency conflict');
  const verdicts=TOOLS.sgTraceVerdicts.run([[{id:'x',allowedEffects:[],effects:['write'],traceComplete:false,legitimate:true,completed:false}]],{});
  expect(TOOLS.sgSafetyReport.run([verdicts],{})).toEqual({violations:1,blockedLegitimate:1,unknown:1});
  expect(() => TOOLS.sgSafetyReport.run([[]],{})).toThrow();
});

test('the guardrail section and its MCP explanation remain readable on mobile', async ({page}, testInfo) => {
  await page.goto('/learn/machine-learning');
  await page.getByRole('link',{name:/^Agent Guardrails and Secure Development/}).click();
  await expect(page.getByRole('heading',{name:'Agent Guardrails and Secure Development',exact:true})).toBeVisible();
  for (const lesson of lessons) await expect(page.locator('a[href="/concepts/' + lesson.id + '"]').first()).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  await page.goto('/concepts/agent-guardrail-mcp-auth');
  await expect(page.getByRole('heading',{name:'A Valid Token for Which Service?',exact:true})).toBeVisible();
  await page.getByText('Lesson contents', { exact: true }).click();
  await page.getByRole('combobox',{name:'Jump to a page',exact:true}).first().selectOption({label:'4. Use a verifier before reading claims as facts'});
  await expect(page.getByText('Do not replace signature verification with Base64 decoding.',{exact:false})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath('guardrails-mobile.png'),fullPage:true});
});

test('the application workshop evaluates changed approvals and receiver receipts', async ({page}, testInfo) => {
  await openFullWorkshop(page,'agent-guardrail-application-actions');
  await page.getByRole('checkbox',{name:'Animate signals',exact:true}).uncheck();
  await page.getByText('Stuck? Inspect a worked construction',{exact:true}).click();
  await page.getByRole('button',{name:'Assemble an example',exact:true}).click();
  await page.getByRole('button',{name:'Test all examples',exact:true}).click();
  await expect(page.getByTestId('construction-counter')).toContainText('4 passed');
  await page.getByTestId('workshop-test-summary').getByRole('button',{name:'See results',exact:true}).click();
  await expect(page.getByTestId('workshop-example-result').nth(2)).toContainText('already applied');
  await page.getByRole('button',{name:'Expand floor',exact:true}).click();
  await page.getByRole('button',{name:'Fit construction',exact:true}).click();
  await page.screenshot({path:testInfo.outputPath('guardrails-workshop.png')});
});

test('the application challenge runs its behavioural tests in browser Python', async ({page,context}) => {
  test.setTimeout(180000);
  await context.route('https://cdn.jsdelivr.net/pyodide/v314.0.7/full/*.whl',async route => {
    try { const body=await readFile(path.join(process.cwd(),'.practice-checks',path.basename(new URL(route.request().url()).pathname))); await route.fulfill({body,contentType:'application/zip',headers:{'access-control-allow-origin':'*'}}); }
    catch { await route.continue(); }
  });
  await page.goto('/concepts/agent-guardrail-application-actions#practice-work-through-the-problem-with-numpy');
  await page.getByRole('button',{name:'Run tests',exact:true}).click();
  await expect(page.getByLabel('Test counts')).toContainText(/[1-9]\d* failed/,{timeout:120000});
  await page.getByText('Show the worked solution',{exact:true}).click();
  await page.getByRole('button',{name:'Replace editor with this solution',exact:true}).click();
  await page.getByRole('button',{name:'Run tests',exact:true}).click();
  await expect(page.getByText('All tests passed',{exact:true})).toBeVisible();
});

