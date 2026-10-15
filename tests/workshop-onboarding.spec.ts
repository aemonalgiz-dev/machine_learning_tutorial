import { expect, test } from "@playwright/test";
import { assemble, evaluate, plug } from "../lib/builds/engine";
import { calibrationRepair, calibrationShift, connectionIntroduction, firstConnectionGraph, independentIntroduction } from "../lib/builds/onboarding";
import { testConstruction, validConstructionForBuild, workshopRecordKey } from "../lib/builds/workshop-session";
import { TOOLS } from "../lib/builds/tools";

test("onboarding contract: exactly one wire completes the introduction for changing inputs", () => {
  const graph = firstConnectionGraph();
  const missing = evaluate(graph, connectionIntroduction.cases[0].data, TOOLS);
  expect(missing.error).toMatchObject({ id: "multiplier", port: 0 });
  const connected = plug(graph, { from: "reading", to: "multiplier", port: 0 });
  const result = testConstruction(connectionIntroduction, connected, TOOLS, { usedHints: true, usedSolution: false });
  expect(result.outcome.passed).toBe(true);
  expect(result.traces.map(trace => trace.output)).toEqual([6, 10, -4]);
  expect(result.outcome.usedHints).toBe(true);
  expect(result.outcome.usedSolution).toBe(false);
  expect(graph.connections).toHaveLength(2);
});

test("onboarding contract: a correct first answer does not pass the changing-input challenge", () => {
  const graph = firstConnectionGraph();
  graph.pieces.find(piece => piece.id === "factor")!.settings.value = 6;
  graph.connections = [{ from: "factor", to: "output", port: 0 }];
  const result = testConstruction(connectionIntroduction, graph, TOOLS, { usedHints: false, usedSolution: false });
  expect(result.outcomes).toEqual([true, false, false]);
  expect(result.outcome.passed).toBe(false);
});

test("onboarding contract: explicit outcome is a snapshot of the tested graph and support", () => {
  const graph = assemble(independentIntroduction.recipe, TOOLS);
  const result = testConstruction(independentIntroduction, graph, TOOLS, { usedSolution: true, usedHints: false });
  expect(result.outcome).toMatchObject({ passed: true, usedSolution: true, usedHints: false });
  graph.connections = [];
  graph.pieces[0].x = 4000;
  expect(result.outcome.graph.connections.length).toBeGreaterThan(0);
  expect(result.outcome.graph.pieces[0].x).not.toBe(4000);
});

test("onboarding contract: stage drafts are separate and preserve the old workshop address", () => {
  expect(workshopRecordKey(independentIntroduction)).toBe("workshop:workshop-guide:v1");
  expect(workshopRecordKey(independentIntroduction, "guide:first-connection")).not.toBe(workshopRecordKey(independentIntroduction, "guide:independent-build"));
  expect(workshopRecordKey({ id: "guide", draftVersion: 3 }, "guide:first-connection")).toBe("workshop:guide:first-connection:v3");
});

test("onboarding contract: replacement exposes the old zero point and repair generalizes to new readings", () => {
  const original = assemble(independentIntroduction.recipe, TOOLS);
  expect(testConstruction(calibrationRepair, original, TOOLS, {usedHints: false, usedSolution: false}).outcomes).toEqual([false, false]);
  const repaired = assemble(calibrationRepair.recipe, TOOLS);
  const checked = testConstruction(calibrationShift, repaired, TOOLS, {usedHints: false, usedSolution: false});
  expect(checked.outcome.passed).toBe(true);
  expect(checked.traces.map(trace => trace.output)).toEqual([18, 2, 4, 10]);
  for (const row of calibrationShift.cases.slice(0, 2)) expect(calibrationRepair.cases.some(earlier => earlier.data.reading === row.data.reading)).toBe(false);
});

test("the changed sensor uses the learner's machine, then carries its repair into new readings", async ({page}) => {
  const graph = assemble(independentIntroduction.recipe, TOOLS);
  await page.addInitScript(graph => {
    const key = "workshop:guide:independent-build:v1";
    localStorage.setItem(`fitlab.learning.v1:guest:${key}`, JSON.stringify({key, revision: 0, mutationId: "onboarding-test", dirty: false,
      value: {graph, undo: [], redo: [], caseIndex: 0, results: {}, tested: {}, customData: null, prediction: "", hintsShown: 0, example: false, animate: false, zoom: .75}}));
  }, graph);
  await page.goto("/lab/workshop-guide");
  await page.getByRole("button", {name: "3. Repair a changed sensor", exact: true}).click();
  await page.getByRole("button", {name: "Try my machine on the replacement", exact: true}).click();
  await expect(page.getByRole("status").filter({hasText: "Your machine produced:"})).toContainText("0");
  await page.getByRole("textbox", {name: "Which change would you try, and what should it do to the result?"}).fill("Add four after doubling so the zero reading becomes four.");
  await page.getByText("Stuck? Inspect a worked construction", {exact: true}).click();
  await page.getByRole("button", {name: "Assemble an example", exact: true}).click();
  await page.getByRole("button", {name: "Test all examples", exact: true}).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("2 passed · 0 failed · 0 not run");
  await page.getByRole("spinbutton", {name: "Prediction for the next reading"}).fill("18");
  await page.getByRole("button", {name: "Try the next readings", exact: true}).click();
  const shift = page.getByTestId("construction-workshop").last();
  await expect(shift.locator("[data-piece]")).toHaveCount(6);
  await shift.getByRole("button", {name: "Test all examples", exact: true}).click();
  await expect(shift.getByTestId("construction-counter")).toHaveText("4 passed · 0 failed · 0 not run");
});

test("onboarding contract: malformed carried graphs cannot become a new workshop seed", () => {
  const graph = firstConnectionGraph();
  expect(validConstructionForBuild(graph, connectionIntroduction, TOOLS)).toBe(true);
  for (const malformed of [
    null, {}, { pieces: [null], connections: [] },
    { ...graph, pieces: [...graph.pieces, graph.pieces[0]] },
    { ...graph, pieces: graph.pieces.filter(piece => piece.id !== "output") },
    { ...graph, pieces: graph.pieces.map(piece => piece.id === "reading" ? { ...piece, tool: "source:missing" } : piece) },
    { ...graph, pieces: graph.pieces.map(piece => piece.id === "multiplier" ? { ...piece, tool: "missing-tool" } : piece) },
    { ...graph, pieces: graph.pieces.map(piece => piece.id === "factor" ? { ...piece, settings: { value: {} } } : piece) },
    { ...graph, pieces: graph.pieces.map(piece => piece.id === "factor" ? { ...piece, x: Infinity } : piece) },
    { ...graph, connections: [{ from: "reading", to: "missing-piece", port: 0 }] },
    { ...graph, connections: [{ from: "reading", to: "multiplier", port: 2 }] },
    { ...graph, connections: [{ from: "output", to: "multiplier", port: 0 }] },
  ]) expect(validConstructionForBuild(malformed, connectionIntroduction, TOOLS)).toBe(false);
  expect(validConstructionForBuild({ ...graph, connections: [] }, connectionIntroduction, TOOLS)).toBe(true);
});

test("the workshop guide opens on the floor, tests the connection, and keeps each draft", async ({ page }) => {
  await page.goto("/lab/workshop-guide");
  await expect(page.getByTestId("construction-floor")).toBeVisible();
  await expect(page.locator("[data-piece]")).toHaveCount(4);
  await expect(page.getByTestId("construction-counter")).toHaveText("0 passed · 0 failed · 3 not run");
  await page.locator('[data-piece="reading"] [data-socket="output"]').click();
  await page.locator('[data-piece="multiplier"] [data-input-port="0"]').click();
  await expect(page.getByTestId("connection-path")).toHaveCount(3);
  await expect(page.getByTestId("construction-counter")).toHaveText("0 passed · 0 failed · 3 not run");
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("3 passed · 0 failed · 0 not run");
  await expect(page.locator('[data-piece="output"]').getByText("6", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Build from an empty floor", exact: true }).click();
  await expect(page.locator("[data-piece]")).toHaveCount(1);
  await expect(page.getByTestId("construction-counter")).toHaveText("0 passed · 0 failed · 3 not run");
  await page.getByRole("button", { name: /^1\. Connect a wire/ }).click();
  await expect(page.getByTestId("connection-path")).toHaveCount(3);
  await expect(page.getByTestId("construction-counter")).toHaveText("3 passed · 0 failed · 0 not run");
  await page.reload();
  await expect(page.getByTestId("connection-path")).toHaveCount(3);
});
