import { test, expect } from "@playwright/test";
import { mockAccountBackend, waitForAccountReady } from "./helpers/account-backend";
import { journeyPlans } from "../lib/builds/journeys";
import { buildById } from "../lib/builds/catalog";
import { labLessons } from "../lib/labs";
import { journeyFor } from "../lib/builds/journey";
import { carryConstruction, reusableCalculation } from "../lib/builds/journey-reuse";
import { assemble, evaluate, same } from "../lib/builds/engine";
import { TOOLS } from "../lib/builds/tools";
import { earlierJourneyBuilds } from "../lib/builds/journey-legacy";
import { earlierWorkFromRecords, journeyDraftId, journeyPathKey } from "../components/lab/JourneyContinuity";
import { newJourneyProgress } from "../lib/journey-progress";
import { workshopRecordKey } from "../lib/builds/workshop-session";

test("journey contract: each lesson has authored decisions, a valid case and earlier capabilities", () => {
  expect(Object.keys(journeyPlans).sort()).toEqual(labLessons.map(lesson => lesson.id).sort());
  const kinds: Record<string, number> = {}, orders: Record<string, number> = {};
  let reusable = 0;
  for (const [index, lesson] of labLessons.entries()) {
    const plan = journeyPlans[lesson.id];
    const data = journeyFor(lesson.id);
    expect(plan.premise.length, lesson.id).toBeGreaterThan(25);
    expect(plan.investigation.question.length, lesson.id).toBeGreaterThan(20);
    expect(plan.reflection.prompt.length, lesson.id).toBeGreaterThan(10);
    expect(plan.investigation.caseIndex, lesson.id).toBeGreaterThan(0);
    expect(plan.investigation.caseIndex, lesson.id).toBeLessThan(data.build.cases.length);
    expect(new Set(plan.connections.map(connection => connection.lessonId)).size, `${lesson.id} repeats an earlier lesson`).toBe(plan.connections.length);
    expect(data.connections.map(connection => connection.lessonId), `${lesson.id} drops authored capabilities`).toEqual(plan.connections.map(connection => connection.lessonId));
    for (const connection of plan.connections) {
      expect(buildById[connection.lessonId], lesson.id).toBeDefined();
      expect(connection.lessonId, lesson.id).not.toBe(lesson.id);
      expect(labLessons.findIndex(item => item.id === connection.lessonId), `${lesson.id} depends on ${connection.lessonId}`).toBeLessThan(index);
      expect(connection.why.length, lesson.id).toBeGreaterThan(20);
      expect(connection.skill.trim().length, lesson.id).toBeGreaterThan(10);
    }
    if (plan.investigation.kind === "predict") expect(plan.investigation.predictionLabel, lesson.id).toBeTruthy();
    else {
      expect(plan.investigation.options?.length, lesson.id).toBeGreaterThanOrEqual(2);
      expect(new Set(plan.investigation.options?.map(option => option.label)).size, lesson.id).toBe(plan.investigation.options?.length);
      for (const option of plan.investigation.options ?? []) expect(option.feedback.length, lesson.id).toBeGreaterThan(20);
    }
    expect(JSON.stringify(plan), lesson.id).not.toMatch(/\u2014|Here is another case from this lesson|Keep the tools you have met/);
    kinds[plan.investigation.kind] = (kinds[plan.investigation.kind] ?? 0) + 1;
    orders[plan.order] = (orders[plan.order] ?? 0) + 1;
    for (const connection of data.connections.filter(connection => connection.reuse)) {
      const carried = carryConstruction(assemble(connection.build.recipe, TOOLS), connection.build, connection.reuse!);
      expect(carried, `${lesson.id} from ${connection.lessonId}`).toBeDefined();
      for (const sample of connection.reuse!.target.cases) expect(same(evaluate(carried!, sample.data, TOOLS).output, sample.expected)).toBe(true);
      reusable++;
    }
  }
  console.log({ lessons: labLessons.length, kinds, orders, reusableConnections: reusable });
});

test("journey contract: long authored prompts are not copied between lessons", () => {
  for (const pick of [
    (id: string) => journeyPlans[id].premise,
    (id: string) => journeyPlans[id].construction.start,
    (id: string) => journeyPlans[id].investigation.question,
    (id: string) => journeyPlans[id].reflection.prompt,
  ]) {
    const seen = new Map<string, string>();
    for (const id of Object.keys(journeyPlans)) {
      const text = pick(id).trim().toLowerCase();
      expect(seen.get(text), `${id} duplicates ${seen.get(text)}`).toBeUndefined();
      seen.set(text, id);
    }
  }
});

test("journey contract: reuse carries a learner's calculation and refuses changed meanings", () => {
  const earlier = buildById.statistics, later = buildById.bagging;
  const reuse = reusableCalculation(earlier, later)!;
  expect(reuse.sourceMap).toEqual({ weeklyCounts: "predictions" });
  const graph = assemble(earlier.recipe, TOOLS);
  const carried = carryConstruction(graph, earlier, reuse)!;
  expect(carried.pieces.find(piece => piece.tool.startsWith("source:"))?.tool).toBe("source:predictions");
  expect(graph.pieces.find(piece => piece.tool.startsWith("source:"))?.tool).toBe("source:weeklyCounts");
  // A constant that happened to match one old case is not a reusable mean.
  expect(carryConstruction(assemble({ op: "constant", inputs: [], settings: { value: 40 } }, TOOLS), earlier, reuse)).toBeUndefined();
  expect(reusableCalculation(buildById["feature-scaling"], buildById["polynomial-features"])).toBeUndefined();
  expect(carryConstruction({ pieces: [{ tool: "unknown" }], connections: [] }, earlier, reuse)).toBeUndefined();
});

test("earlier-work collection retains a third saved calculation and its original keys", () => {
  const prior = journeyFor("agent-iteration-project").connections.slice(0, 2);
  const third = journeyFor("bagging").connections.find(connection => connection.lessonId === "statistics")!;
  expect(third.reuse).toBeDefined();
  const graph = assemble(third.build.recipe, TOOLS);
  const key = workshopRecordKey(third.build, journeyDraftId(third.build, "construction", third.caseIndex));
  const progress = { ...newJourneyProgress(third.lessonId, third.title, third.href), built: { at: 10, supported: true } };
  const records = [
    { key, value: { graph, results: Object.fromEntries(third.build.cases.slice(0, -1).map((_, index) => [index, true])), hintsShown: 1, example: false } },
    { key: journeyPathKey(third.build), value: { graph, built: true, supported: true, explanation: "Use a count so a longer record changes the divisor." } },
    { key: `journey-progress:${third.lessonId}:v1`, value: progress },
  ];
  const snapshot = structuredClone(records);
  const work = earlierWorkFromRecords([...prior, third], records);
  expect(work.map(item => item.connection?.lessonId)).toEqual([...prior, third].map(connection => connection.lessonId));
  expect(work[2].note).toBe("Use a count so a longer record changes the divisor.");
  expect(work[2].progress.built).toEqual(progress.built);
  expect(work[2].fallbackStatus).toBe("Examples passed with guidance");
  expect(work[2].reusable?.supported).toBe(true);
  for (const sample of third.reuse!.target.cases) expect(same(evaluate(work[2].reusable!.graph, sample.data, TOOLS).output, sample.expected)).toBe(true);
  expect(records).toEqual(snapshot);

  // A newer unfinished draft must still take precedence over an older success.
  const changed = records.map(record => record.key === key ? { ...record, value: { ...records[0].value, results: { 0: false } } } : record);
  expect(earlierWorkFromRecords([...prior, third], changed)[2].reusable).toBeUndefined();
  expect(earlierWorkFromRecords([], records)).toEqual([]);
});

test("a journey displays all three earlier capabilities with the third learner's saved note", async ({ page }) => {
  const data = journeyFor("agent-iteration-project");
  expect(data.connections).toHaveLength(3);
  const third = data.connections[2];
  const key = journeyPathKey(third.build);
  const value = { graph: null, built: false, supported: false, explanation: "Reconcile in-flight actions before resuming the release." };
  const backend = await mockAccountBackend(page, { records: [{ key, value }] });
  await page.goto("/lab/agent-iteration-project");
  await waitForAccountReady(page);
  await page.getByRole("button", { name: /Lesson notes and saved work/ }).click();
  const continuity = page.getByTestId("journey-connections");
  await continuity.locator("summary").click();
  for (const connection of data.connections) {
    await expect(continuity.getByRole("heading", { name: connection.skill, exact: true })).toBeVisible();
    await expect(continuity.getByRole("link", { name: `Open ${connection.title}`, exact: true })).toHaveAttribute("href", connection.href);
  }
  await expect(continuity.locator("blockquote").filter({ hasText: value.explanation })).toBeVisible();
  await expect(continuity.getByText("Earlier notes saved. Open the earlier workshop to inspect it.", { exact: true })).toBeVisible();
  expect(backend.value(key)).toEqual(value);
});

test("journey contract: legacy stage access retains case ordering and component fixtures", () => {
  const original = buildById.statistics;
  const snapshot = structuredClone(original);
  const earlier = earlierJourneyBuilds(original);
  expect(earlier.construction.cases).toEqual(original.cases.slice(0, -1));
  expect(earlier.variation.cases).toEqual([original.cases.at(-1), ...original.cases.slice(0, -1)]);
  expect(earlier.preparation?.recipe).toEqual({ op: "total", inputs: [{ source: "weeklyCounts" }] });
  expect(earlier.preparation?.sources).toEqual({ weeklyCounts: original.sources.weeklyCounts });
  expect(earlier.preparation?.cases.map(sample => sample.expected)).toEqual([200, 96]);
  expect(original).toEqual(snapshot);

  // This saved component is the residual, before the input converts it to a gradient.
  const training = earlierJourneyBuilds(buildById["training-a-network"]);
  expect(training.preparation?.recipe).toEqual({ op: "subtract", inputs: [
    { op: "multiply", inputs: [{ source: "input" }, { source: "weight" }] },
    { source: "target" },
  ] });
  expect(training.preparation?.cases[0].data).toEqual({ input: 2, weight: 1, target: 5 });
  expect(training.preparation?.cases[0].expected).toBe(-3);
  expect(earlierJourneyBuilds(buildById["recurrent-layers"]).preparation).toBeUndefined();
});
