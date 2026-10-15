import { test, expect, type Page } from "@playwright/test";

async function variationDraft(page: Page) {
  return page.evaluate(() => {
    const key = Object.keys(localStorage).find(key => key.startsWith("fitlab.learning.v1:guest:workshop:") && key.includes("statistics") && key.includes("variation"));
    return key ? JSON.parse(localStorage.getItem(key)!).value : null;
  });
}

test("copied guidance stays with an untested variation after its source starts afresh", async ({ page }) => {
  await page.goto("/lab/statistics");
  await page.getByText("Stuck? Inspect a worked construction", { exact: true }).click();
  await page.getByRole("button", { name: "Assemble an example", exact: true }).click();
  const stages = page.getByRole("navigation", { name: "Journey stages" });
  const constructionTitle = await stages.getByRole("button").first().innerText();
  await stages.getByRole("button", { name: "Three weeks instead of five", exact: true }).click();
  await page.getByRole("textbox", { name: "Mean deaths per recorded week", exact: true }).fill("32");
  await page.getByRole("button", { name: "Save my prediction and try it", exact: true }).click();
  await page.getByRole("button", { name: "Run my construction on this case", exact: true }).click();
  await page.getByRole("combobox", { name: "Which part will you change, or keep?", exact: true }).selectOption("keep");
  await page.getByRole("textbox", { name: /What do you expect your next construction/ }).fill("Counting the supplied weeks still gives a mean of 32.");
  await page.getByRole("button", { name: "Try this decision in the workshop", exact: true }).click();
  await expect.poll(() => variationDraft(page)).toMatchObject({ carriedSupport: true, hintsShown: 0, example: false });
  const copied = (await variationDraft(page)).graph;
  await stages.getByRole("button", { name: constructionTitle, exact: true }).click();
  await page.getByText("Try a fresh construction", { exact: true }).click();
  await page.getByRole("button", { name: "Start a fresh attempt", exact: true }).click();
  await expect(page.locator("[data-piece]")).toHaveCount(1);
  await stages.getByRole("button", { name: "Three weeks instead of five", exact: true }).click();
  await expect.poll(() => variationDraft(page)).toMatchObject({ carriedSupport: true, graph: copied });
  await page.reload();
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
  await page.goto("/lab/statistics");
  // Save a genuinely independent empty floor, then remove the newer optional
  // provenance field to reproduce the original persisted record format.
  await page.getByText("Try a fresh construction", { exact: true }).click();
  await page.getByRole("button", { name: "Start a fresh attempt", exact: true }).click();
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith("fitlab.learning.v1:guest:")) continue;
      const record = JSON.parse(localStorage.getItem(key)!);
      if (key.includes("workshop:") && key.includes("statistics")) {
        delete record.value.carriedSupport;
        localStorage.setItem(key, JSON.stringify(record));
      }
      if (key.includes("journey-path:statistics")) {
        // A valid guided source is offered through preparationGraph, while the
        // existing construction has deliberately been left empty.
        record.value.preparationGraph = {
          pieces: [
            { id: "output", tool: "output", x: 720, y: 170, settings: {} },
            { id: "source", tool: "source:weeklyCounts", x: 40, y: 170, settings: {} },
          ], connections: [],
        };
        record.value.attemptSupport = { preparation: { id: "guided-source", supported: true } };
        localStorage.setItem(key, JSON.stringify(record));
      }
    }
  });
  await page.reload();
  await expect(page.locator("[data-piece]")).toHaveCount(1);
  const current = await page.evaluate(() => {
    const key = Object.keys(localStorage).find(key => key.startsWith("fitlab.learning.v1:guest:workshop:") && key.includes("statistics") && key.includes("construction"));
    return key ? JSON.parse(localStorage.getItem(key)!).value : null;
  });
  expect(current).not.toHaveProperty("carriedSupport");
  expect(current.graph.pieces).toHaveLength(1);
  const ownAssistance = await page.evaluate(() => {
    const key = Object.keys(localStorage).find(key => key.startsWith("fitlab.learning.v1:guest:journey-path:statistics"));
    return key ? JSON.parse(localStorage.getItem(key)!).value.attemptSupport?.construction : null;
  });
  expect(ownAssistance).toBeUndefined();
});
