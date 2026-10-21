import { test, expect } from '@playwright/test';
import { expandedLessons } from '../lib/lessons';
import { lessonOrder, lessonLocations, findCourseSection, lessonHrefs } from '../lib/course-navigation';
import { searchEntries } from '../lib/lesson-search-index';
import { searchLessons } from '../lib/lesson-search';
import { assemble, evaluate, expressionTools, same, type Data } from '../lib/builds/engine';
import { TOOLS } from '../lib/builds/tools';
import { buildById } from '../lib/builds/catalog';
import { journeyFor } from '../lib/builds/journey';
import { labLessons } from '../lib/labs';
import { graphDisplay } from '../lib/builds/graph-display';
import { openFullWorkshop } from './helpers/open-workshop';
import { sectionId } from '../components/concept/sectionId';

const lessons = expandedLessons.filter(lesson => ['NoSQL', 'Graph Databases'].includes(lesson.section));

test('NoSQL and Graph Databases have separate paths within Databases', () => {
  expect(lessons.filter(lesson => lesson.section === 'NoSQL')).toHaveLength(18);
  expect(lessons.filter(lesson => lesson.section === 'Graph Databases')).toHaveLength(14);
  for (const [slug, title] of [['nosql', 'NoSQL'], ['graph-databases', 'Graph Databases']]) {
    expect(lessonHrefs(findCourseSection(slug)!)).toEqual(lessons.filter(lesson => lesson.section === title).map(lesson => `/concepts/${lesson.id}`));
  }
  for (const lesson of lessons) {
    const href = `/concepts/${lesson.id}`;
    expect(lessonLocations[href].areaHref).toBe('/learn/databases');
    for (const prerequisite of lesson.prerequisites) {
      expect(lessonOrder.indexOf(prerequisite.href), `${lesson.id}: ${prerequisite.href}`).toBeGreaterThanOrEqual(0);
      expect(lessonOrder.indexOf(prerequisite.href), lesson.id).toBeLessThan(lessonOrder.indexOf(href));
    }
  }
  for (const term of ['Redis', 'MongoDB', 'Cassandra', 'CAP', 'Cypher', 'SPARQL', 'GraphRAG']) {
    expect(searchLessons(searchEntries, term, 'databases').some(entry => entry.kind === 'Lesson'), term).toBe(true);
  }
});

test('database lessons explain their examples and keep question data beside each question', () => {
  for (const lesson of lessons) {
    expect(lesson.parts.length, lesson.id).toBeGreaterThanOrEqual(5);
    expect(lesson.history.blocks.length, lesson.id).toBeGreaterThan(1);
    expect(lesson.history.sources.length, lesson.id).toBeGreaterThan(0);
    expect(lesson.intuition.every(step => step.scene), lesson.id).toBe(true);
    expect(lesson.parts.some(part => part.examples?.length), lesson.id).toBe(true);
    expect(lesson.checkpoints?.length, lesson.id).toBeGreaterThan(0);
    expect(JSON.stringify(lesson), lesson.id).not.toContain('\u2014');
    for (const question of [...lesson.quiz, ...(lesson.checkpoints ?? []).flatMap(checkpoint => checkpoint.questions)]) {
      expect(question.given?.data || question.given?.code, `${lesson.id}: ${question.prompt}`).toBeTruthy();
    }
    for (const exercise of lesson.practice) {
      expect(exercise.tests?.length, `${lesson.id}: ${exercise.title}`).toBeGreaterThan(1);
      expect(lesson.parts.flatMap(part => part.examples ?? []).some(example => example.code.trim() === exercise.solution.trim()), lesson.id).toBe(false);
    }
    for (const scene of lesson.intuition.map(step => step.scene)) if (scene?.kind === 'network') {
      expect(scene.nodes.length, lesson.id).toBeGreaterThan(0);
      if (scene.edgeLabels) expect(scene.edgeLabels.length, lesson.id).toBe(scene.edges.length);
      for (const [from, to] of scene.edges) {
        expect(scene.nodes[from], lesson.id).toBeDefined();
        expect(scene.nodes[to], lesson.id).toBeDefined();
      }
    }
  }
});

test('every database construction computes changed records and a fresh independent case', () => {
  for (const lesson of lessons) {
    const build = buildById[lesson.id], journey = journeyFor(lesson.id);
    const graph = assemble(build.recipe, TOOLS);
    expect(expressionTools(build.recipe).filter(tool => !tool.startsWith('source:')).length, lesson.id).toBeGreaterThan(1);
    expect(journey.plan?.connections.length, lesson.id).toBeGreaterThan(0);
    expect(journey.plan!.investigation.caseIndex, lesson.id).toBeLessThan(build.cases.length);
    expect(journey.fresh, lesson.id).toBeDefined();
    for (const fixture of [...build.cases, journey.fresh!]) {
      const original = structuredClone(fixture.data);
      const trace = evaluate(graph, fixture.data, TOOLS);
      expect(trace.error, `${lesson.id}: ${fixture.name}`).toBeUndefined();
      expect(same(trace.output, fixture.expected), `${lesson.id}: ${fixture.name}: ${JSON.stringify(trace.output)} vs ${JSON.stringify(fixture.expected)}`).toBe(true);
      expect(fixture.data, lesson.id).toEqual(original);
    }
    expect(evaluate({ ...graph, connections: graph.connections.filter(wire => wire.to !== 'output') }, build.cases[0].data, TOOLS).error, lesson.id).toBeDefined();
    for (const connection of journey.connections) {
      if (connection.lessonId === 'workshop-guide') continue;
      const earlier = labLessons.find(item => item.id === connection.lessonId);
      expect(earlier, `${lesson.id}: ${connection.lessonId}`).toBeDefined();
      expect(lessonOrder.indexOf(earlier!.href), lesson.id).toBeGreaterThanOrEqual(0);
      expect(lessonOrder.indexOf(earlier!.href), lesson.id).toBeLessThan(lessonOrder.indexOf(`/concepts/${lesson.id}`));
    }
  }
});

test('graph presentation preserves direction, edge types and exact IDs', () => {
  const value: Record<string, Data> = { nodes: [{ id: 'P1', kind: 'Pump' }, { id: 'P2', label: 'Backup pump' }], edges: [{ id: 'E1', source: 'P2', target: 'P1', type: 'SUPPLIES' }] };
  expect(graphDisplay(value)).toMatchObject({ directed: true, nodes: [{ label: 'P1' }, { label: 'P2', value: 'Backup pump' }], edges: [[1, 0]], edgeLabels: ['SUPPLIES'] });
  expect(graphDisplay({ ...value, nodes: [{ id: 'P1' }, { id: 'P1' }] })).toBeUndefined();
  expect(graphDisplay({ ...value, edges: [{ source: 'missing', target: 'P1' }] })).toBeUndefined();
  expect(graphDisplay([{ id: 'P1' }])).toBeUndefined();
  expect(graphDisplay({ nodes: [{ id: 'A', kind: 'Asset', status: 'open' }, { id: 'B', kind: 'Asset' }], edges: [{ id: 'r', source: 'A', target: 'B', type: 'ROUTE', minutes: 9 }] })).toMatchObject({
    nodes: [{ details: ['status: open'] }, { details: [] }], edgeLabels: ['ROUTE · minutes: 9'],
  });
  expect(TOOLS.gdAttach.run([[{ current: 'P1' }], value], { fields: 'constructor,__proto__,kind' })).toEqual([
    { current: 'P1', n_constructor: null, n___proto__: null, n_kind: 'Pump' },
  ]);
});

test('database sections open with their own lesson lists', async ({ page }) => {
  await page.goto('/learn/databases');
  await page.getByRole('link', { name: /^NoSQL\b/ }).click();
  await expect(page.getByRole('heading', { name: 'NoSQL', exact: true })).toBeVisible();
  await page.goto('/learn/databases');
  await page.getByRole('link', { name: /^Graph Databases\b/ }).click();
  await expect(page.getByRole('heading', { name: 'Graph Databases', exact: true })).toBeVisible();
});

test('new Python exercises expose Botie hints and execute tests on changed data', async ({ page }) => {
  test.setTimeout(180_000);
  for (const id of ['nosql-cache-expiry', 'graph-traversal-cycles']) {
    await page.goto(`/concepts/${id}#practice`);
    const lesson = lessons.find(lesson => lesson.id === id)!;
    await page.getByRole('button', { name: 'Ask Botie for a hint', exact: true }).click();
    await expect(page.getByRole('list', { name: 'Hints from Botie' })).toBeVisible();
    const editor = page.getByRole('textbox', { name: /^Python solution for/ });
    await editor.fill('print("A guessed answer")');
    await page.getByRole('button', { name: 'Run tests', exact: true }).click();
    await expect(page.getByLabel('Test counts', { exact: true })).toContainText('failed', { timeout: 90000 });
    expect(await page.getByLabel('Test counts', { exact: true }).textContent()).not.toContain('0 failed');
    await editor.fill(lesson.practice[0].solution);
    await page.getByRole('button', { name: 'Run tests', exact: true }).click();
    await expect(page.getByText('All tests passed', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Test counts', { exact: true })).toContainText('0 failed');
  }
});

test('graph arrows and relationship names remain readable on a narrow page', async ({ page }) => {
  const lesson = lessons.find(lesson => lesson.id === 'graph-database-models')!;
  await page.goto(`/concepts/${lesson.id}#${sectionId(lesson.openingTitle)}`);
  const diagram = page.locator('[data-guided-intuition] [data-network-diagram]').first();
  await expect(diagram).toBeVisible();
  // A straight horizontal SVG path has a zero-height geometry box despite its visible stroke.
  await expect(diagram.locator('[data-network-edge][marker-end]').first()).toBeAttached();
  await expect(diagram.getByRole('list', { name: 'Relationships' })).toBeVisible();
  await diagram.screenshot({ path: test.info().outputPath('graph-records-desktop.png') });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 860 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await diagram.screenshot({ path: test.info().outputPath('graph-records-mobile.png') });
});

test('graph records stay editable while an identifier temporarily has no matching endpoint', async ({ page }) => {
  await page.goto('/concepts/graph-database-models#full-example');
  const experiment = page.getByRole('region', { name: 'Explore the lesson calculation' });
  await experiment.getByText('Edit the node and relationship records', { exact: true }).click();
  const id = experiment.getByRole('textbox', { name: /nodes, entry 1, id$/ });
  const original = await id.inputValue();
  await id.fill(`${original}-renamed`);
  await expect(id).toBeFocused();
  await expect(experiment.getByText(/Keep editing the records below/)).toBeVisible();
  await id.fill(original);
  await expect(id).toBeFocused();
  await expect(experiment.locator('[data-network-diagram]').first()).toBeVisible();
});

for (const id of ['nosql-document-queries', 'graph-pattern-matching']) test(`${id} connects components and tests the resulting construction`, async ({ page }) => {
  await openFullWorkshop(page, id);
  await page.getByRole('checkbox', { name: 'Animate signals', exact: true }).uncheck();
  await page.getByText('Stuck? Inspect a worked construction', { exact: true }).click();
  await page.getByRole('button', { name: 'Assemble an example', exact: true }).click();
  await page.getByRole('button', { name: 'Test all examples', exact: true }).click();
  await expect(page.getByText(`${buildById[id].cases.length} passed`, { exact: false }).first()).toBeVisible();
  await expect(page.getByTestId('connection-path').first()).toBeAttached();
});
