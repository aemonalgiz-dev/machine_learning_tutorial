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

const lessons = expandedLessons.filter(lesson => lesson.section === 'Agents');

test('agents: the complete path is discoverable and prerequisites precede their use', () => {
  expect(lessons).toHaveLength(15);
  const section = findCourseSection('agents')!;
  expect(lessonHrefs(section)).toEqual(lessons.map(lesson => `/concepts/${lesson.id}`));
  for (const lesson of lessons) {
    const href = `/concepts/${lesson.id}`;
    expect(lessonLocations[href].areaHref).toBe('/learn/machine-learning');
    expect(lessonLocations[href].sectionHref).toBe('/sections/agents');
    for (const prerequisite of lesson.prerequisites) {
      expect(lessonOrder.indexOf(prerequisite.href), `${lesson.id}: ${prerequisite.href}`).toBeGreaterThanOrEqual(0);
      expect(lessonOrder.indexOf(prerequisite.href), lesson.id).toBeLessThan(lessonOrder.indexOf(href));
    }
  }
  for (const term of ['Pydantic', 'LangChain', 'LangGraph', 'Langfuse', 'prompt engineering', 'observability', 'promptfoo', 'Phoenix']) {
    expect(searchLessons(searchEntries, term).some(result => result.href.startsWith('/concepts/agent-')), term).toBe(true);
  }
});

test('agents: explanations and exercises retain context without pretending to call a model', () => {
  for (const lesson of lessons) {
    expect(lesson.history.sources.length, lesson.id).toBeGreaterThan(0);
    expect(lesson.intuition.every(step => step.scene), lesson.id).toBe(true);
    expect(lesson.parts.some(part => part.examples?.length), lesson.id).toBe(true);
    expect(JSON.stringify(lesson), lesson.id).not.toContain('\u2014');
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
  await page.goto('/learn/machine-learning');
  await page.getByRole('link', { name: /^Agents\b/ }).click();
  await expect(page.getByRole('heading', { name: 'Agents', exact: true })).toBeVisible();
  for (const lesson of lessons) await expect(page.locator(`a[href="/concepts/${lesson.id}"]`).first()).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  const lesson = lessons.find(entry => entry.id === 'agent-pydantic-ai')!;
  const part = lesson.parts.find(part => part.references?.length)!;
  await page.goto(`/concepts/${lesson.id}`);
  await page.getByRole('combobox', { name: 'Choose a section', exact: true }).first().selectOption({ label: part.title });
  const reference = page.locator('[data-framework-reference]').first();
  await expect(reference).toBeVisible();
  await expect(reference.getByText('Run in your own environment', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('agents-framework-mobile.png'), fullPage: true });
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
