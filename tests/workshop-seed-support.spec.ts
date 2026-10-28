import { mockAccountBackend, accountBackendFor, waitForAccountReady, waitForAccountSync } from "./helpers/account-backend";
import { test, expect, type Page } from "@playwright/test";
import type { Construction } from "../lib/builds/engine";

interface Draft { graph: Construction; carriedSupport?: boolean; hintsShown: number; example: boolean }

async function variationDraft(page: Page) {
  return accountBackendFor(page).find<Draft>(key => key.startsWith("workshop:") && key.includes("statistics") && key.includes("variation"))!;
}

test.beforeEach(async ({ page }) => { await mockAccountBackend(page); });

test("copied guidance stays with an untested variation after its source starts afresh", async ({ page }) => {
  await page.goto("/lab/statistics"); await waitForAccountReady(page);
  await page.getByText("Stuck? Inspect a worked construction", { exact: true }).click();
  await page.getByRole("button", { name: "Assemble an example", exact: true }).click();
  const stages = page.getByRole("navigation", { name: "Journey stages" });
  const constructionStage = stages.getByRole("button").first();
  await stages.getByRole("button", { name: "Three weeks instead of five", exact: true }).click();
  await page.getByRole("textbox", { name: "Mean deaths per recorded week", exact: true }).fill("32");
  await page.getByRole("button", { name: "Save my prediction and try it", exact: true }).click();
  await page.getByRole("button", { name: "Run my construction on this case", exact: true }).click();
  await page.getByRole("combobox", { name: "Which part will you change, or keep?", exact: true }).selectOption("keep");
  await page.getByRole("textbox", { name: /What do you expect your next construction/ }).fill("Counting the supplied weeks still gives a mean of 32.");
  await page.getByRole("button", { name: "Try this decision in the workshop", exact: true }).click();
  await expect.poll(() => variationDraft(page)).toMatchObject({ carriedSupport: true, hintsShown: 0, example: false });
  const copied = (await variationDraft(page)).graph;
  await constructionStage.click();
  await page.getByText("Try a fresh construction", { exact: true }).click();
  await page.getByRole("button", { name: "Start a fresh attempt", exact: true }).click();
  await expect(page.locator("[data-piece]")).toHaveCount(1);
  await stages.getByRole("button", { name: "Three weeks instead of five", exact: true }).click();
  await expect.poll(() => variationDraft(page)).toMatchObject({ carriedSupport: true, graph: copied });
  await waitForAccountSync(page); await page.reload(); await waitForAccountReady(page);
  await expect.poll(() => variationDraft(page)).toMatchObject({ carriedSupport: true, graph: copied });
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("3 passed · 0 failed · 0 not run");
  await expect(page.getByTestId("journey-evidence").locator("summary")).toContainText("with guidance");
  await page.getByText("Try a fresh construction", { exact: true }).click();
  await page.getByRole("button", { name: "Start a fresh attempt", exact: true }).click();
  await expect.poll(() => variationDraft(page)).toMatchObject({ carriedSupport: false });
  expect((await variationDraft(page)).graph.pieces).toHaveLength(1);
});

test("an older saved floor keeps its graph and provenance when a guided seed is offered", async ({ page }) => {
  await page.goto("/lab/statistics"); await waitForAccountReady(page);
  // Save a genuinely independent empty floor, then remove the newer optional
  // provenance field to reproduce the original persisted record format.
  await page.getByText("Try a fresh construction", { exact: true }).click();
  await page.getByRole("button", { name: "Start a fresh attempt", exact: true }).click();
  await waitForAccountSync(page);
  const backend = accountBackendFor(page);
  for (const [key, record] of backend.records) {
      if (key.startsWith("workshop:") && key.includes("statistics")) {
        const value = structuredClone(record.value) as Draft;
        delete value.carriedSupport;
        backend.seed(key, value, record.revision + 1);
      }
      if (key.startsWith("journey-path:statistics")) {
        const value = structuredClone(record.value) as Record<string, unknown>;
        // A valid guided source is offered through preparationGraph, while the
        // existing construction has deliberately been left empty.
        value.preparationGraph = {
          pieces: [
            { id: "output", tool: "output", x: 720, y: 170, settings: {} },
            { id: "source", tool: "source:weeklyCounts", x: 40, y: 170, settings: {} },
          ], connections: [],
        };
        value.attemptSupport = { preparation: { id: "guided-source", supported: true } };
        backend.seed(key, value, record.revision + 1);
      }
  }
  await waitForAccountSync(page); await page.reload(); await waitForAccountReady(page);
  await expect(page.locator("[data-piece]")).toHaveCount(1);
  const current = backend.find<Draft>(key => key.startsWith("workshop:") && key.includes("statistics") && key.includes("construction"))!;
  expect(current).not.toHaveProperty("carriedSupport");
  expect(current.graph.pieces).toHaveLength(1);
  const ownAssistance = backend.find<{ attemptSupport?: { construction?: unknown } }>(key => key.startsWith("journey-path:statistics"))?.attemptSupport?.construction;
  expect(ownAssistance).toBeUndefined();
});
