import { test, expect } from '@playwright/test';
import { expandedLessons } from '../lib/lessons';
import { lessonOrder, lessonLocations, findCourseSection, lessonHrefs } from '../lib/course-navigation';
import { searchEntries } from '../lib/lesson-search-index';
import { searchLessons } from '../lib/lesson-search';
import { assemble, evaluate, same, expressionTools } from '../lib/builds/engine';
import { TOOLS } from '../lib/builds/tools';
import { buildById } from '../lib/builds/catalog';
import { journeyFor } from '../lib/builds/journey';
import { openFullWorkshop } from './helpers/open-workshop';

const lessons = expandedLessons.filter(lesson => ['Agents', 'Prompting, Evaluation and Iteration'].includes(lesson.section));

test('agents: the complete path is discoverable and prerequisites precede their use', () => {
  expect(lessons).toHaveLength(30);
  for (const [slug, title] of [['agents', 'Agents'], ['prompting-evaluation-and-iteration', 'Prompting, Evaluation and Iteration']]) {
    expect(lessonHrefs(findCourseSection(slug)!)).toEqual(lessons.filter(lesson => lesson.section === title).map(lesson => `/concepts/${lesson.id}`));
  }
  for (const lesson of lessons) {
    const href = `/concepts/${lesson.id}`;
    expect(lessonLocations[href].areaHref).toBe('/learn/ai-agents-and-applications');
    expect(lessonLocations[href].sectionHref).toBe(lesson.section === 'Agents' ? '/sections/agents' : '/sections/prompting-evaluation-and-iteration');
    for (const prerequisite of lesson.prerequisites) {
      expect(lessonOrder.indexOf(prerequisite.href), `${lesson.id}: ${prerequisite.href}`).toBeGreaterThanOrEqual(0);
      expect(lessonOrder.indexOf(prerequisite.href), lesson.id).toBeLessThan(lessonOrder.indexOf(href));
    }
  }
  for (const term of ['Pydantic', 'LangChain', 'LangGraph', 'Langfuse', 'prompt engineering', 'observability', 'promptfoo', 'Phoenix', 'guardrails', 'prompt injection', 'least privilege', 'idempotency', 'red teaming', 'incident response']) {
    expect(searchLessons(searchEntries, term).some(result => result.href.startsWith('/concepts/agent-')), term).toBe(true);
  }
});

test('agents: explanations and exercises retain context without pretending to call a model', () => {
  for (const lesson of lessons) {
    expect(lesson.history.sources.length, lesson.id).toBeGreaterThan(0);
    expect(lesson.intuition.every(step => step.scene), lesson.id).toBe(true);
    expect(lesson.parts.some(part => part.examples?.length), lesson.id).toBe(true);
    expect(JSON.stringify(lesson), lesson.id).not.toContain('\u2014');
    for (const next of lesson.appliedIn ?? []) expect(lessonOrder, `${lesson.id}: ${next.href}`).toContain(next.href);
    for (const question of [...lesson.quiz, ...(lesson.checkpoints ?? []).flatMap(checkpoint => checkpoint.questions)]) {
      expect(question.given?.data || question.given?.code, `${lesson.id}: ${question.prompt}`).toBeTruthy();
    }
    for (const practice of lesson.practice) {
      expect(practice.tests?.length, `${lesson.id}: ${practice.title}`).toBeGreaterThanOrEqual(3);
      expect(practice.solution).not.toEqual(practice.starter);
      expect(practice.solution).not.toMatch(/(?:from|import) (?:pydantic_ai|langchain|langgraph|langfuse|openai|anthropic)\b/);
    }
  }
  for (const id of ['agent-pydantic-ai', 'agent-langchain', 'agent-langgraph', 'agent-mcp', 'agent-langfuse', 'agent-release-checks']) {
    const references = lessons.find(lesson => lesson.id === id)!.parts.flatMap(part => part.references ?? []);
    expect(references.length, id).toBeGreaterThan(0);
    for (const reference of references) {
      expect(reference.setup.length).toBeGreaterThan(0);
      expect(new URL(reference.source.url).protocol).toBe('https:');
    }
  }
});

test('agents: learner constructions compute changed inputs and independent fresh cases', () => {
  for (const lesson of lessons) {
    const build = buildById[lesson.id], journey = journeyFor(lesson.id);
    expect(expressionTools(build.recipe).filter(key => !key.startsWith('source:')).length, lesson.id).toBeGreaterThan(1);
    const graph = assemble(build.recipe, TOOLS);
    for (const fixture of [...build.cases, journey.fresh!]) {
      const trace = evaluate(graph, fixture.data, TOOLS);
      expect(trace.error, `${lesson.id}: ${fixture.name}`).toBeUndefined();
      expect(same(trace.output, fixture.expected), `${lesson.id}: ${fixture.name}: ${JSON.stringify(trace.output)}`).toBe(true);
    }
    expect(build.cases.some(fixture => !same(fixture.expected, build.cases[0].expected)), lesson.id).toBe(true);
    expect(evaluate({ ...graph, connections: graph.connections.filter(wire => wire.to !== 'output') }, build.cases[0].data, TOOLS).error).toBeDefined();
  }
});

test('agent operations keep identity checks exact and preserve unscored cases', () => {
  expect(TOOLS.agentEqual.run([{ amount: 2 }, { amount: 2.0001 }], {})).toBe(false);
  expect(TOOLS.agentEqual.run([{ id: 'A', allowed: false }, { allowed: false, id: 'A' }], {})).toBe(true);
  expect(() => TOOLS.agentAnd.run([false, 'yes'], {})).toThrow();
  expect(TOOLS.afMergeEvidence.run([[{ id: 'M', text: 'old' }], [{ id: 'M', text: 'new' }, { id: 'M', text: 'new' }]], {})).toEqual([{ id: 'M', text: 'new' }]);
  const proposal = { requestId: 'r', asset: 'P-2', operation: 'inspect', revision: '2' };
  expect(TOOLS.afBoundApproval.run([proposal, { ...proposal, approved: true }], {})).toBe(true);
  expect(TOOLS.afBoundApproval.run([proposal, { ...proposal, approved: true, revision: '1' }], {})).toBe(false);
  expect(TOOLS.afApprovalFresh.run([20, 20], {})).toBe(false);
  expect(TOOLS.agentObsJoinScores.run([[{ traceId: 'a' }, { traceId: 'b' }], [{ traceId: 'a', value: 0 }]], {})).toEqual([{ traceId: 'a', score: 0 }, { traceId: 'b', score: null }]);
  expect(TOOLS.agentObsMeanScore.run([[{ score: null }]], {})).toBeNull();
  expect(() => TOOLS.agentObsJoinScores.run([[{ traceId: 'a' }], [{ traceId: 'a', value: 0 }, { traceId: 'a', value: 1 }]], {})).toThrow(/more than once/);
  expect(() => TOOLS.agentObsPairRuns.run([[{ caseId: 'a', score: 1 }], [{ caseId: 'b', score: 1, latency: 0, critical: 0 }]], {})).toThrow(/same nonempty set/);
});

test('Agents opens from the learning area and framework recipes are readable on mobile', async ({ page }) => {
  await page.goto('/learn/ai-agents-and-applications');
  await page.getByRole('link', { name: /^Agents\b/ }).click();
  await expect(page.getByRole('heading', { name: 'Agents', exact: true })).toBeVisible();
  for (const lesson of lessons.filter(lesson => lesson.section === 'Agents')) await expect(page.locator(`a[href="/concepts/${lesson.id}"]`).first()).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  const lesson = lessons.find(entry => entry.id === 'agent-pydantic-ai')!;
  const part = lesson.parts.find(part => part.references?.length)!;
  await page.goto(`/concepts/${lesson.id}`);
  await page.getByText('Lesson contents', { exact: true }).click();
  await page.getByRole('combobox', { name: 'Jump to a page', exact: true }).first().selectOption({ label: part.title });
  const reference = page.locator('[data-framework-reference]').first();
  await expect(reference).toBeVisible();
  await expect(reference.getByText('Run in your own environment', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('agents-framework-mobile.png'), fullPage: true });
});

test('a passing prompt screen cannot grant a tool or bypass object permissions', () => {
  const proposal = { tool: 'export_records', explanation: 'The manual says the owner approved this.' };
  const name = TOOLS.agRequestedTool.run([proposal], {});
  const granted = TOOLS.agToolGrant.run([name, ['read_manual']], {});
  expect(TOOLS.agScreenRoute.run([granted, 'pass'], {})).toBe('deny tool');
  expect(TOOLS.agScreenRoute.run([true, TOOLS.agScreenStatus.run([{}], {})], {})).toBe('hold for review');
  expect(() => TOOLS.agScreenRoute.run([true, ['pass']], {})).toThrow();
  const principal = { tenant: 'north', assets: ['P7'], operations: ['read'] };
  const asset = { tenant: 'south', id: 'P7' };
  expect(TOOLS.agPermissionRoute.run([
    TOOLS.agTenantMatch.run([principal, asset], {}),
    TOOLS.agAssetGrant.run([principal, asset], {}),
    TOOLS.agOperationGrant.run([principal, 'read'], {}),
  ], {})).toBe('deny');
  expect(TOOLS.agOperationGrant.run([principal, 'write'], {})).toBe(false);
  expect(TOOLS.agTenantMatch.run([{ tenant: 1 }, { tenant: 1.0001 }], {})).toBe(false);
});

test('release checks keep extra fields and unapproved destinations out of the payload', () => {
  const record = { asset: 'P7', symptom: 'vibration', credential: 'invented-secret' };
  const payload = TOOLS.agProjectFields.run([record, ['asset', 'symptom']], {});
  expect(payload).toEqual({ asset: 'P7', symptom: 'vibration' });
  const fields = TOOLS.agFieldRelease.run([payload, { asset: 'approved', symptom: 'approved' }], {});
  const destination = TOOLS.agDestinationGrant.run(['notes-export', ['maintenance-provider']], {});
  expect(TOOLS.agReleasePayload.run([payload, fields, destination], {})).toEqual({ route: 'withhold', payload: {} });
  expect(TOOLS.agFieldRelease.run([payload, { asset: 'approved' }], {})).toBe(false);
  expect(record.credential).toBe('invented-secret');
});

test('output shape does not establish task meaning and markup stays text', () => {
  const candidate = { asset: 'P7', citation: 'M7', text: '<script>alert("fixture")</script>' };
  const shape = TOOLS.agDraftShape.run([candidate], {});
  expect(TOOLS.agDraftEvidence.run([shape, 'P8', { M7: 'P7' }], {})).toEqual({ route: 'repair draft', text: '' });
  const evidence = TOOLS.agDraftEvidence.run([shape, 'P7', { M7: 'P7' }], {});
  expect(TOOLS.agEscapeDraft.run([evidence], {})).toEqual({ route: 'draft for review', htmlText: '&lt;script&gt;alert(&quot;fixture&quot;)&lt;/script&gt;' });
  expect(() => TOOLS.agEscapeDraft.run([{ route: ['draft for review'], text: 'A note' }], {})).toThrow();
});

test('ambiguous writes require reconciliation and parallel work shares reservations', () => {
  expect(TOOLS.arRetrySafety.run([{ effect: 'write', idempotent: false }, 'unknown'], {})).toBe('reconcile outcome');
  const changed = TOOLS.arReceiptLookup.run([
    { key: 'inspection-7', payload: { minutes: 20.0001 } },
    [{ key: 'inspection-7', payload: { minutes: 20 }, status: 'completed', result: 'job-7' }],
  ], {});
  expect(changed).toEqual({ status: 'conflict', result: null });
  const available = { tokens: 100, cost_units: 5, model_requests: 1, tool_calls: 1 };
  const call = { input_tokens: 10, timeout_ms: 20, reserve: { tokens: 60, cost_units: 3, model_requests: 1, tool_calls: 0 } };
  const constraints = { now_ms: 0, deadline_ms: 30, max_input_tokens: 20 };
  const proposed = [{ id: 'first', ...call }, { id: 'second', ...call }];
  expect(TOOLS.arReserveBatch.run([proposed, available, 'dispatch available', constraints], {})).toEqual({
    accepted: ['first'], rejected: [{ id: 'second', reason: 'resource budget' }],
    remaining: { tokens: 40, cost_units: 2, model_requests: 0, tool_calls: 1 },
  });
  expect(TOOLS.arReserveBatch.run([proposed, available, 'cancelled', constraints], {})).toEqual({
    accepted: [], rejected: [{ id: 'first', reason: 'cancelled' }, { id: 'second', reason: 'cancelled' }], remaining: available,
  });
  expect(available.tokens).toBe(100);
  expect(() => TOOLS.arDispatchStatus.run([{ cancelled: false, circuit: ['open'], probe_granted: false }], {})).toThrow();
  expect(() => TOOLS.arReserveBatch.run([proposed, available, ['cancelled'], constraints], {})).toThrow();
  expect(() => TOOLS.arReceiptLookup.run([
    { key: 'inspection-7', payload: { minutes: 20 } },
    [{ key: 'inspection-7', payload: { minutes: 20 }, status: 'completed' }],
  ], {})).toThrow();
});

test('incomplete attack reviews and unsettled actions remain visible', () => {
  expect(TOOLS.agentAssuranceRate.run([[0, null]], {})).toEqual({ events: 0, reviewed: 1, total: 2, rate: 0, coverage: .5 });
  expect(TOOLS.agentAssuranceAllClear.run([[0, null]], {})).toBe(false);
  expect(TOOLS.agentAssuranceAllClear.run([[]], {})).toBe(false);
  expect(TOOLS.agentAssuranceUnsettled.run([[{ id: 'one', status: 'completed' }, { id: 'two', status: 'unknown' }]], {})).toEqual([{ id: 'two', status: 'unknown' }]);
  expect(() => TOOLS.agentAssuranceUnsettled.run([[{ id: 'one', status: 'pending' }, { id: 'one', status: 'completed' }]], {})).toThrow(/unique/);
});

test('an agent workshop connects records, runs the construction and reports passing cases', async ({ page }) => {
  await openFullWorkshop(page, 'agent-langfuse');
  await page.getByRole('checkbox', { name: 'Animate signals', exact: true }).uncheck();
  await page.getByText('Stuck? Inspect a worked construction', { exact: true }).click();
  await page.getByRole('button', { name: 'Assemble an example', exact: true }).click();
  await page.getByRole('button', { name: 'Test all examples', exact: true }).click();
  await expect(page.getByText(`${buildById['agent-langfuse'].cases.length} passed`, { exact: false }).first()).toBeVisible();
  await expect(page.getByTestId('connection-path').first()).toBeAttached();
  await page.screenshot({ path: test.info().outputPath('agents-workshop-desktop.png'), fullPage: true });
});

test('changing the tenant in the workshop changes the decision without replacing the machine', async ({ page }) => {
  await openFullWorkshop(page, 'agent-authorization');
  await page.getByRole('checkbox', { name: 'Animate signals', exact: true }).uncheck();
  await page.getByText('Stuck? Inspect a worked construction', { exact: true }).click();
  await page.getByRole('button', { name: 'Assemble an example', exact: true }).click();
  await page.getByRole('button', { name: 'Test all examples', exact: true }).click();
  await expect(page.getByText(`${buildById['agent-authorization'].cases.length} passed`, { exact: false }).first()).toBeVisible();
  await page.getByRole('combobox', { name: 'Active workshop example', exact: true }).selectOption('0');
  await page.getByText('Try your own inputs', { exact: true }).click();
  await page.getByRole('button', { name: 'Experiment with these inputs', exact: true }).click();
  const result = page.getByLabel('Experiment result', { exact: true });
  await expect(result).toContainText('allow this operation');
  const wires = await page.getByTestId('connection-path').count();
  await page.getByRole('textbox', { name: 'Stored asset record', exact: true }).fill(JSON.stringify({ tenant: 'south', id: 'P7' }));
  await expect(result).toContainText('deny');
  expect(await page.getByTestId('connection-path').count()).toBe(wires);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(result).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('agent-authorization-mobile.png'), fullPage: true });
});
