// Run the same SQL navigation, editor and workshop contracts against the
// built application, including its bundled worker and CodeMirror grammar.
import '../tests/sql.spec';
import { test, expect } from '@playwright/test';

test('the existing NumPy workspace still runs its reference solution in production', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/primers/statistics#practice-summarising-the-five-people-with-the-library');
  await page.getByRole('button', { name: 'Show the worked solution', exact: true }).click();
  await page.getByRole('button', { name: 'Replace editor with this solution', exact: true }).click();
  await page.getByRole('button', { name: 'Run tests', exact: true }).click();
  await expect(page.getByText('All tests passed', { exact: true })).toBeVisible({ timeout: 90000 });
  await expect(page.getByLabel('Test counts', { exact: true })).toContainText('0 failed');
});
