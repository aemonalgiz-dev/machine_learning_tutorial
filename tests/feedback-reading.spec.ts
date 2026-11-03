import { expect, test } from '@playwright/test';
import { mockAccountBackend, waitForAccountReady } from './helpers/account-backend';

test('Botie separates a layer calculation from its explanation and waits for the reader', async ({ page }) => {
  await mockAccountBackend(page);
  await page.goto('/concepts/dense-layers#questions-on-parts-5-and-6');
  await waitForAccountReady(page);
  await expect(page.getByText('With both activations set to identity, what do these thirteen parameters express?', { exact: true })).toBeVisible();
  await page.getByRole('radiogroup').getByRole('button').first().click();
  const feedback = page.getByRole('status', { name: "Botie's feedback" });
  await expect(feedback.locator('pre code')).toHaveText('(-2 × 1) + (4 × 2) = 6');
  await expect(feedback).not.toContainText('```');
  await expect(feedback.locator('p').filter({ hasText: '(-2 × 1)' })).toHaveCount(0);
  await expect(feedback).toContainText('Both routes produce that result.');
  await page.setViewportSize({ width: 320, height: 860 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(feedback).toBeVisible();
  await page.getByRole('button', { name: 'Next question', exact: true }).click();
  await expect(feedback).toHaveCount(0);
});

test('the R-squared feedback keeps its assumptions and two calculations readable', async ({ page }) => {
  await mockAccountBackend(page);
  await page.goto('/primers/statistics#questions-on-sections-14-to-18');
  await waitForAccountReady(page);
  await page.getByRole('radiogroup').getByRole('button').first().click();
  await page.getByRole('button', { name: 'Next question', exact: true }).click();
  await expect(page.getByText('R² equals the square of the correlation for any fitted model.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'False', exact: true }).click();
  const feedback = page.getByRole('status', { name: "Botie's feedback" });
  await expect(feedback.locator('pre code')).toHaveCount(2);
  await expect(feedback).not.toContainText('```');
  await expect(feedback).toContainText('least-squares');
  await page.setViewportSize({ width: 390, height: 860 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const block of await feedback.locator('pre').all()) {
    const bounds = (await block.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  }
});

test('challenge prose distinguishes exact program names from the surrounding explanation', async ({ page }) => {
  await mockAccountBackend(page);
  await page.goto('/concepts/project-sensor-investigation#practice-work-through-the-problem-with-numpy');
  await waitForAccountReady(page);
  await page.getByRole('button', { name: /^Challenge 3:/ }).click();
  const instructions = page.getByRole('group', { name: 'Challenge instructions' });
  await expect(instructions.locator('code').filter({ hasText: "rule['centre']" })).toHaveText("rule['centre']");
  await expect(instructions).not.toContainText('`');
  await expect(instructions).toContainText('reference center');
  await page.setViewportSize({ width: 320, height: 860 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
