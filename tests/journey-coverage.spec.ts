import { test, expect } from "@playwright/test";
import { BUILDS } from "../lib/builds/catalog";
import { constructionJourney, readPrediction } from "../lib/builds/challenges";
import { assemble, evaluate, same, type Expression } from "../lib/builds/engine";
import { TOOLS } from "../lib/builds/tools";
import { labLessons } from "../lib/labs";
import { journeyFor } from "../lib/builds/journey";
import { journeyPlans } from "../lib/builds/journeys";

test("journey contract: every published lesson has contextual construction and changed-input checks", () => {
  expect(BUILDS.length).toBe(labLessons.length + 1);
  let preparations = 0, cases = 0;
  for (const original of BUILDS) {
    const journey = constructionJourney(original);
    const full = assemble(original.recipe, TOOLS);
    expect(journey.construction.cases.length, original.id).toBeGreaterThan(0);
    expect(journey.variation.changedSources.length, original.id).toBeGreaterThan(0);
    const changed = original.cases[journeyPlans[original.id]?.investigation.caseIndex ?? original.cases.length - 1];
    expect(journey.variation.build.cases[0], original.id).toEqual(changed);
    expect(journey.construction.cases, original.id).not.toContainEqual(changed);
    for (const sample of journey.variation.build.cases) {
      expect(same(evaluate(full, sample.data, TOOLS).output, sample.expected), `${original.id}: ${sample.name}`).toBe(true);
      cases++;
    }
    if (journey.preparation) {
      preparations++;
      const preparation = journey.preparation.build;
      expect(journey.preparation.calculation, original.id).not.toContain("undefined");
      expect(preparation.problem).toBe(original.problem);
      const graph = assemble(preparation.recipe, TOOLS);
      expect(graph.pieces.length).toBeLessThan(full.pieces.length);
      expect(graph.pieces.some(piece => piece.tool.startsWith("source:"))).toBe(true);
      for (const sample of preparation.cases) {
        const result = evaluate(graph, sample.data, TOOLS);
        expect(result.error, original.id).toBeUndefined();
        expect(same(result.output, sample.expected), original.id).toBe(true);
        cases++;
      }
      const subexpressions = (expression: Expression): Expression[] => [expression, ...("source" in expression ? [] : expression.inputs.flatMap(subexpressions))];
      expect(subexpressions(original.recipe)).toContainEqual(preparation.recipe);
    }
    expect(JSON.stringify(journey), original.id).not.toContain("\u2014");
  }
  console.log(`Checked ${BUILDS.length} journeys, ${preparations} intermediate constructions and ${cases} numerical cases.`);
});

test("journey contract: intermediate goals use the author's explicit operation paths", () => {
  for (const build of BUILDS.filter(build => build.id !== "workshop-guide")) {
    const plan = journeyPlans[build.id];
    let expression = build.recipe;
    for (const port of plan.preparation?.path ?? []) {
      if ("source" in expression) throw new Error(`${build.id}: path entered a source`);
      expression = expression.inputs[port];
    }
    const preparation = constructionJourney(build).preparation;
    if (plan.preparation) {
      expect(preparation?.build.recipe, build.id).toEqual(expression);
      expect(preparation?.build.title, build.id).toBe(plan.preparation.title);
    } else expect(preparation, build.id).toBeUndefined();
  }
});

test("journey contract: lessons retain their histories, Python links and area navigation", () => {
  for (const lesson of labLessons) {
    const journey = journeyFor(lesson.id);
    expect(journey.lesson.href).toBe(lesson.href);
    expect(journey.history.blocks.length).toBeGreaterThan(0);
    expect(journey.challenges.construction.id).toBe(lesson.id);
    expect(journey.next?.href).not.toBe(`/lab/${lesson.id}`);
  }
});

test("journey contract: predictions support scalar, text, boolean and matrix outputs", () => {
  expect(readPrediction("36", 36).value).toBe(36);
  expect(readPrediction("false", false).value).toBe(false);
  expect(readPrediction("cat", "cat").value).toBe("cat");
  expect(readPrediction("[[2,4],[1,3]]", [[2,4],[1,3]]).value).toEqual([[2,4],[1,3]]);
  expect(readPrediction("", 36).error).toContain("prediction");
  expect(readPrediction("[2,", [2,4]).error).toContain("array");
});
