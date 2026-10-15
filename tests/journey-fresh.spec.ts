import { test, expect } from "@playwright/test";
import { labLessons } from "../lib/labs";
import { buildById } from "../lib/builds/catalog";
import { freshJourneyCases } from "../lib/builds/fresh-cases";
import { foundationFreshCases } from "../lib/builds/journey-fresh/foundations";
import { modelFreshCases } from "../lib/builds/journey-fresh/models";
import { applicationFreshCases } from "../lib/builds/journey-fresh/applications";
import { freshJourneyBuild } from "../lib/builds/journey-fresh";
import { assemble, constant, evaluate, same, type Data } from "../lib/builds/engine";
import { TOOLS } from "../lib/builds/tools";
import { testConstruction } from "../lib/builds/workshop-session";
import { journeyFor } from "../lib/builds/journey";

function finite(data: Data): boolean {
  if (typeof data === "number") return Number.isFinite(data);
  if (Array.isArray(data)) return data.every(finite);
  return data && typeof data === "object" ? Object.values(data).every(finite) : true;
}

test("every lesson has a separately authored follow-up with new inputs and an explicit objective", () => {
  const keys = [foundationFreshCases, modelFreshCases, applicationFreshCases].flatMap(Object.keys);
  expect(keys.length).toBe(new Set(keys).size);
  expect(keys.sort()).toEqual(labLessons.map(lesson => lesson.id).sort());
  for (const lesson of labLessons) {
    const build = buildById[lesson.id], fresh = freshJourneyCases[lesson.id];
    expect(Object.keys(fresh.data).sort(), lesson.id).toEqual(Object.keys(build.sources).sort());
    expect(build.cases.some(sample => same(sample.data, fresh.data)), lesson.id).toBe(false);
    expect(fresh.name.length, lesson.id).toBeGreaterThan(8);
    expect(fresh.prompt.length, lesson.id).toBeGreaterThan(60);
    expect(fresh.why.length, lesson.id).toBeGreaterThan(40);
    expect(`${fresh.name}${fresh.prompt}${fresh.why}`, lesson.id).not.toContain("\u2014");
    expect(finite(fresh.data) && finite(fresh.expected), lesson.id).toBe(true);
    expect(journeyFor(lesson.id).fresh, lesson.id).toEqual(fresh);
  }
});

test("all authored follow-ups agree with executable reference constructions and preserve earlier tests", () => {
  for (const [id, fresh] of Object.entries(freshJourneyCases)) {
    const build = buildById[id], before = structuredClone(build);
    const check = freshJourneyBuild(build, fresh), graph = assemble(build.recipe, TOOLS);
    const trace = evaluate(graph, fresh.data, TOOLS);
    expect(trace.error, id).toBeUndefined();
    expect(same(trace.output, fresh.expected), `${id}: ${JSON.stringify(trace.output)} vs ${JSON.stringify(fresh.expected)}`).toBe(true);
    expect(testConstruction(check, graph, TOOLS, { usedHints: false, usedSolution: false }).outcome.passed, id).toBe(true);
    expect(check.cases.slice(1), id).toEqual(build.cases);
    expect(build, id).toEqual(before);
  }
});

test("a memorised mean fails the fresh records while the learner's general calculation handles zero weeks", () => {
  const build = buildById.statistics, fresh = freshJourneyCases.statistics;
  const memorised = assemble(constant(40), TOOLS);
  expect(evaluate(memorised, build.cases[0].data, TOOLS).output).toBe(build.cases[0].expected);
  expect(testConstruction(freshJourneyBuild(build, fresh), memorised, TOOLS, { usedHints: false, usedSolution: false }).outcomes[0]).toBe(false);
  const general = assemble(build.recipe, TOOLS);
  expect(evaluate(general, fresh.data, TOOLS).output).toBe(6);
});
