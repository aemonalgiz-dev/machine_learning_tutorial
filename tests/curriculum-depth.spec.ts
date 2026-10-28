import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expandedLessons } from '../lib/lessons';
import supplements from '../lib/lessons/supplements.json';
import type { ExpandedLesson } from '../lib/lessons/types';
import { sectionId } from '../components/concept/sectionId';

const staticLessons = supplements as unknown as Record<string, Pick<ExpandedLesson, 'parts' | 'practice'> & { checkpoint?: NonNullable<ExpandedLesson['checkpoints']>[number] }>;

test('supplements preserve original quiz bookmarks and provide unique navigable explanations', () => {
  for (const lesson of expandedLessons) {
    const ids = lesson.parts.map(part => part.id ?? sectionId(part.title));
    expect(new Set(ids).size, lesson.id).toBe(ids.length);
    expect(lesson.quizId).toMatch(/^questions-on-parts-1-to-\d+$/);
    for (const checkpoint of lesson.checkpoints ?? []) {
      expect(lesson.parts.some(part => part.title === checkpoint.after), lesson.id).toBe(true);
      for (const question of checkpoint.questions) expect(question.given?.data, lesson.id).toBeTruthy();
    }
  }
  expect(expandedLessons.find(lesson => lesson.id === 'numpy-arrays')?.quizId).toBe('questions-on-parts-1-to-4');
  for (const [id, lesson] of Object.entries(staticLessons)) {
    expect(lesson.parts.every(part => part.paragraphs.length && part.title), id).toBe(true);
    expect(new Set(lesson.parts.map(part => sectionId(part.title))).size, id).toBe(lesson.parts.length);
    if (lesson.checkpoint) expect(lesson.parts.some(part => part.title === lesson.checkpoint!.after), id).toBe(true);
    expect(JSON.stringify(lesson), id).not.toContain('\u2014');
  }
});

test('new generated and static explanations are reachable with independent checkpoints', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const [id, title, checkpoint] of [
    ['numpy-arrays', '5. Why a List and an Array Give Different Answers', 'Questions on Lists and Array Operations'],
    ['density-based-clustering', '6. Connect Core Points Before Attaching the Border', 'Questions on Extending a Dense Region'],
    ['diffusion-models', 'Fit the Predictors, Then Generate without a Clean Input', 'Questions on Training and Reverse Sampling'],
    ['supervised-fine-tuning', 'Align the Response Mask after Shifting Targets', 'Questions on the First Response Target'],
  ]) {
    await page.goto(`/concepts/${id}#${sectionId(title)}`);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await page.getByText('Lesson contents', { exact: true }).click();
    await page.getByRole('combobox', { name: 'Jump to a page' }).first().selectOption({ label: `Quiz · ${checkpoint}` });
    await expect(page.getByRole('group', { name: 'Data for this question' })).toBeVisible();
    await expect(page.getByRole('heading', { name: checkpoint, exact: true })).toBeVisible();
  }
  await page.goto('/concepts/numpy-arrays#questions-on-parts-1-to-4');
  await expect(page.getByRole('heading', { name: /Questions on Parts 1 to/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test('a complete diffusion program and its output remain readable on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto('/concepts/diffusion-models#fit-the-predictors-then-generate-without-a-clean-input');
  await expect(page.getByRole('heading', { name: 'A trained scalar diffusion chain', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '.practice-checks/curriculum-depth-mobile.png', fullPage: true });
});

test('a supplementary coding challenge rejects memorised output and accepts a reusable procedure', async ({ page, context }) => {
  await context.route('https://cdn.jsdelivr.net/pyodide/v314.0.7/full/*.whl', async route => {
    try {
      const body = await readFile(path.join(process.cwd(), '.practice-checks', path.basename(new URL(route.request().url()).pathname)));
      await route.fulfill({ body, contentType: 'application/zip', headers: { 'access-control-allow-origin': '*' } });
    } catch { await route.continue(); }
  });
  const lesson = staticLessons['attention'];
  const exercise = lesson.practice[0];
  await page.goto('/concepts/attention');
  await page.getByText('Lesson contents', { exact: true }).click();
  const option = await page.getByRole('combobox', { name: 'Jump to a page' }).first().locator('option').evaluateAll(options => options.find(option => option.textContent?.startsWith('Practice.'))?.getAttribute('value'));
  expect(option).toBeTruthy();
  await page.getByRole('combobox', { name: 'Jump to a page' }).first().selectOption(option!);
  await page.getByRole('button', { name: new RegExp(`Challenge \\d+: ${exercise.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) }).click();
  await page.locator('.cm-content').fill(`print(${JSON.stringify(exercise.output)})`);
  await page.getByRole('button', { name: 'Run tests', exact: true }).click();
  await expect(page.getByText('Some tests need another look', { exact: true })).toBeVisible({ timeout: 120000 });
  await expect(page.getByLabel('Test counts')).toContainText('4 failed');
  await page.locator('.cm-content').fill(exercise.solution);
  await page.getByRole('button', { name: 'Run tests', exact: true }).click();
  await expect(page.getByText('All tests passed', { exact: true })).toBeVisible();
});
