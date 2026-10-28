import { expect, type Page, type Locator } from "@playwright/test";
import { hasMockAccountBackend, waitForAccountReady } from "./account-backend";

/** Disclosures remain closed in the product until a learner needs their controls. */
export async function openWorkspaceControls(page: Page | Locator) {
  const summary = page.locator("summary:visible").filter({ hasText: /^(?:Examples, experiments and workspace controls|Workspace controls)$/ });
  if (!await summary.evaluate(element => (element.parentElement as HTMLDetailsElement).open)) await summary.click();
}

export async function openLessonNotes(page: Page) {
  await expect(page.getByTestId("learning-restore-guard")).toHaveCount(0);
  const button = page.getByRole("button", { name: /^Lesson notes and saved work/ });
  if (await button.getAttribute("aria-expanded") !== "true") await button.click();
}

/** Keep tests of the original full case set separate from the shorter journey stages. */
export async function showEarlierWorkshop(page: Page) {
  if (hasMockAccountBackend(page)) await waitForAccountReady(page);
  await expect(page.getByTestId("learning-restore-guard")).toHaveCount(0);
  const button = page.getByRole("button", { name: "Full workspace and earlier draft", exact: true });
  if (await button.getAttribute("aria-expanded") !== "true") await button.click();
  await openWorkspaceControls(page);
}

export async function openFullWorkshop(page: Page, slug: string) {
  await page.goto(`/lab/${slug}`);
  if (hasMockAccountBackend(page)) await waitForAccountReady(page);
  await showEarlierWorkshop(page);
}
