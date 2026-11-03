import { test, expect } from '@playwright/test';
import { openFullWorkshop } from './helpers/open-workshop';
import { buildById } from '../lib/builds/catalog';
import { TOOLS } from '../lib/builds/tools';

test('a learner builds the introductory Databricks workflow and tests changed requests', async ({ page }) => {
  const build = buildById['what-is-databricks'];
  await openFullWorkshop(page, build.id);
  await page.getByRole('button', { name: 'Test all examples', exact: true }).click();
  await expect(page.getByTestId('construction-counter')).toHaveText(`0 passed · ${build.cases.length} failed · 0 not run`);
  const resolve = 'dbxIntroResolveDataset';
  const describe = 'dbxIntroManifest';
  for (const title of [...Object.values(build.sources), TOOLS[resolve].title, TOOLS[describe].title]) {
    await page.getByRole('button', { name: title, exact: true }).click();
  }
  const wire = async (from: string, to: string) => {
    await page.getByRole('button', { name: from, exact: true }).click();
    await page.getByRole('button', { name: to, exact: true }).click();
  };
  const source = (key: string) => `${build.sources[key]} output`;
  const input = (key: string, at: number) => `${TOOLS[key].title} input ${at + 1}: ${TOOLS[key].inputs[at]}`;
  await wire(source('requestedInput'), input(resolve, 0));
  await wire(source('registeredDatasets'), input(resolve, 1));
  await wire(source('program'), input(describe, 0));
  await wire(`${TOOLS[resolve].title} output`, input(describe, 1));
  await wire(source('outputName'), input(describe, 2));
  await wire(`${TOOLS[describe].title} output`, 'Result input 1: Your result');
  await page.getByRole('button', { name: 'Test all examples', exact: true }).click();
  await expect(page.getByTestId('construction-counter')).toHaveText(`${build.cases.length} passed · 0 failed · 0 not run`);
  await page.screenshot({ path: '.practice-checks/databricks-intro-workshop.png', fullPage: false });
});
