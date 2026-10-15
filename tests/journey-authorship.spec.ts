import { test, expect } from "@playwright/test";
import { journeyPlans } from "../lib/builds/journeys";
import { buildById } from "../lib/builds/catalog";
import { labLessons } from "../lib/labs";
import { journeyFor } from "../lib/builds/journey";
import { carryConstruction, reusableCalculation } from "../lib/builds/journey-reuse";
import { assemble, evaluate, same } from "../lib/builds/engine";
import { TOOLS } from "../lib/builds/tools";
import { earlierJourneyBuilds } from "../lib/builds/journey-legacy";

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
    expect(plan.connections.length, lesson.id).toBeLessThanOrEqual(2);
    for (const connection of plan.connections) {
      expect(buildById[connection.lessonId], lesson.id).toBeDefined();
      expect(connection.lessonId, lesson.id).not.toBe(lesson.id);
      expect(labLessons.findIndex(item => item.id === connection.lessonId), `${lesson.id} depends on ${connection.lessonId}`).toBeLessThan(index);
      expect(connection.why.length, lesson.id).toBeGreaterThan(20);
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
