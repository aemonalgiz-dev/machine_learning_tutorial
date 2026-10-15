import { test, expect } from "@playwright/test";
import { labLessons } from "../lib/labs";
import { buildById } from "../lib/builds/catalog";
import { journeyFor } from "../lib/builds/journey";
import { assemble, constant, op, source, same } from "../lib/builds/engine";
import { TOOLS } from "../lib/builds/tools";
import { inspectJourneyChange } from "../lib/builds/journey-diagnostics";

test("journey diagnosis runs every authored changed case without inventing a failure for a general solution", () => {
  const caseCounts: Record<number, number> = {};
  const onlyOneChangedCase: string[] = [];
  for (const lesson of labLessons) {
    const data = journeyFor(lesson.id);
    const { variation } = data.challenges;
    const graph = assemble(data.build.recipe, TOOLS);
    const before = structuredClone(graph);
    const diagnosis = inspectJourneyChange(graph, variation.build.cases[0], variation.previous, data.build);
    expect(diagnosis?.result, lesson.id).toBe("works");
    expect(same(diagnosis?.trace.output, variation.build.cases[0].expected), lesson.id).toBe(true);
    expect(graph, lesson.id).toEqual(before);
    expect(diagnosis?.graph).not.toBe(graph);
    expect(variation.changedSources.length, lesson.id).toBeGreaterThan(0);
    caseCounts[data.build.cases.length] = (caseCounts[data.build.cases.length] ?? 0) + 1;
    if (data.build.cases.length === 2) onlyOneChangedCase.push(lesson.id);
  }
  console.log(JSON.stringify({ lessons: labLessons.length, caseCounts, onlyOneChangedCase }));
});

test("journey diagnosis distinguishes a wrong divisor, a missing wire and a correctly generalised mean", () => {
  const data = journeyFor("statistics"), build = buildById.statistics;
  const variation = data.challenges.variation;
  const faulty = assemble(op("divide", [op("total", [source("weeklyCounts")]), constant(5)]), TOOLS);
  const diagnosed = inspectJourneyChange(faulty, variation.build.cases[0], variation.previous, build)!;
  expect(diagnosed.earlierResult?.output).toBe(40);
  expect(diagnosed.trace.output).toBeCloseTo(19.2);
  expect(diagnosed.result).toBe("different");
  const broken = { ...faulty, connections: faulty.connections.filter(wire => wire.to !== "output") };
  const stopped = inspectJourneyChange(broken, variation.build.cases[0], variation.previous, build)!;
  expect(stopped.result).toBe("blocked");
  expect(stopped.trace.error?.id).toBe("output");
  const repaired = assemble(build.recipe, TOOLS);
  expect(inspectJourneyChange(repaired, variation.build.cases[0], variation.previous, build)?.result).toBe("works");
});

test("journey diagnosis refuses a saved graph whose source meanings no longer exist", () => {
  const build = buildById.statistics;
  const unrelated = assemble(source("missing"), TOOLS);
  expect(inspectJourneyChange(unrelated, build.cases[1], build.cases[0], build)).toBeNull();
});
