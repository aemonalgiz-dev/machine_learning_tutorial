import { test, expect } from '@playwright/test';
import { expandedLessons } from '../lib/lessons';
import { lessonOrder, lessonLocations, lessonHrefs } from '../lib/course-navigation';
import { findLearningArea, learningAreaSections } from '../lib/learning-areas';
import { assemble, evaluate, same } from '../lib/builds/engine';
import { TOOLS } from '../lib/builds/tools';
import { buildById } from '../lib/builds/catalog';
import { journeyFor } from '../lib/builds/journey';

const lessons = expandedLessons.filter(lesson => lesson.id.startsWith('design-'));

test('design contract: lessons have a complete path from a decision to a tested design', () => {
  const sections = learningAreaSections(findLearningArea('first-principles-design')!);
  expect(sections.map(section => lessonHrefs(section).length)).toEqual([3,4,2,3]);
  expect(lessons).toHaveLength(12);
  for (const lesson of lessons) {
    const href = `/concepts/${lesson.id}`;
    expect(lessonOrder).toContain(href);
    expect(lessonLocations[href].areaHref).toBe('/learn/first-principles-design');
    expect(lesson.history.sources.length).toBeGreaterThan(0);
    expect(lesson.intuition.every(step => step.scene && step.scene.kind !== 'strips')).toBe(true);
    expect(lesson.parts.some(part => part.examples?.length)).toBe(true);
    expect(lesson.checkpoints?.length).toBeGreaterThan(0);
    expect(lesson.build.hints!.length).toBeGreaterThanOrEqual(2);
    for (const prerequisite of lesson.prerequisites) {
      expect(lessonOrder.indexOf(prerequisite.href)).toBeGreaterThanOrEqual(0);
      expect(lessonOrder.indexOf(prerequisite.href)).toBeLessThan(lessonOrder.indexOf(href));
    }
    for (const question of [...lesson.quiz, ...lesson.checkpoints!.flatMap(checkpoint => checkpoint.questions)]) {
      expect(question.given?.data).toBeTruthy();
    }
    for (const exercise of lesson.practice) {
      expect(exercise.tests!.length).toBeGreaterThanOrEqual(3);
      expect(exercise.starter).not.toEqual(exercise.solution);
      expect(exercise.hints?.length).toBeGreaterThan(0);
    }
    expect(JSON.stringify(lesson)).not.toContain('\u2014');
  }
});

test('design contract: every reference construction calculates all of its cases', () => {
  for (const lesson of lessons) {
    const build = buildById[lesson.id];
    const graph = assemble(build.recipe, TOOLS);
    expect(graph.pieces.length, lesson.id).toBeLessThanOrEqual(36);
    for (const fixture of build.cases) {
      const trace = evaluate(graph, fixture.data, TOOLS);
      expect(trace.error, `${lesson.id}: ${fixture.name}`).toBeUndefined();
      expect(same(trace.output, fixture.expected), `${lesson.id}: ${fixture.name}: ${JSON.stringify(trace.output)}`).toBe(true);
    }
    const disconnected = { ...graph, connections: graph.connections.filter(wire => wire.to !== 'output') };
    expect(evaluate(disconnected, build.cases[0].data, TOOLS).error?.port).toBe(0);
  }
});

test('design contract: workshop journeys respect the learning area boundary', () => {
  expect(journeyFor('design-from-decisions').previous).toBeUndefined();
  expect(journeyFor('design-from-decisions').next?.href).toBe('/lab/design-without-a-model');
  expect(journeyFor('design-inspection-review').next).toBeUndefined();
  expect(journeyFor('simple-linear-regression').previous).toBeUndefined();
  expect(journeyFor('workshop-guide').next?.href).toBe('/lab/statistics');
});

test('design contract: queues preserve state and reject invalid counts', () => {
  const queue = TOOLS.designQueue;
  expect(queue.run([[0,8,1,0], [5,3,3,3]], {})).toEqual([0,5,3,0]);
  expect(queue.run([[], []], {})).toEqual([]);
  expect(queue.run([[2,1,0], [0,0,4]], {})).toEqual([2,3,0]);
  expect(() => queue.run([[1], [1,2]], {})).toThrow(/matching/);
  for (const invalid of [[-1], [.5], [Infinity], ['3']]) {
    expect(() => queue.run([invalid, [2]], {})).toThrow(/whole request counts/);
  }
  expect(() => queue.run([[Number.MAX_SAFE_INTEGER, 1], [0,0]], {})).toThrow(/too large/);
});

test('design contract: fallback selection preserves values and enforces aligned masks', () => {
  const choose = TOOLS.designSelect;
  expect(choose.run([[1,0,1], [0,1,1], [-1,-1,-1]], {})).toEqual([0,-1,1]);
  expect(choose.run([[], [], []], {})).toEqual([]);
  expect(choose.run([[0,1], ['normal','normal'], ['review','review']], {})).toEqual(['review','normal']);
  expect(() => choose.run([[2], [1], [-1]], {})).toThrow(/0 or 1/);
  expect(() => choose.run([[1,0], [1], [-1,-1]], {})).toThrow(/matching/);
});

test('design contract: the capstone rejects either failure independently and accepts a repaired queue', () => {
  const build = buildById['design-inspection-review'];
  const graph = assemble(build.recipe, TOOLS);
  const base = build.cases[0].data;
  expect(evaluate(graph, { ...base, decisions: [0,0,0,0] }, TOOLS).output).toBe(0);
  expect(evaluate(graph, { ...base, capacity: [0,0,0] }, TOOLS).output).toBe(0);
  expect(evaluate(graph, { ...base, arrivals: [4,8,2], capacity: [6,6,6] }, TOOLS).output).toBe(1);
});

test('First Principles Design opens lessons and their construction workshops', async ({ page }) => {
  await page.goto('/learn/first-principles-design');
  await expect(page.getByRole('heading', { name: 'First Principles Design', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Work through the first decision' })).toHaveAttribute('href', '/lab/design-from-decisions');
  await page.getByRole('link', { name: 'Read the first lesson' }).click();
  await expect(page.getByRole('heading', { name: 'What Would This Prediction Actually Change?', exact: true })).toBeVisible();
  await page.goto('/lab/design-inspection-review');
  await expect(page.getByRole('heading', { name: /Review Botie/ })).toBeVisible();
});
