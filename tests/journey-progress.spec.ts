import { test, expect } from "@playwright/test";
import { newJourneyProgress, updateJourneyProgress, validJourneyProgress, journeyStatus, savedWorkshopStatus, journeyAttemptHistory } from "../lib/journey-progress";
import { labHref, labLessons } from "../lib/labs";
import { buildById } from "../lib/builds/catalog";
import { freshStageAttempt, recordStageAssistance, stageAssistance, type JourneyAssistance } from "../lib/builds/journey-attempts";

const initial = () => newJourneyProgress("statistics", "Read the city records", "/lab/statistics");

test("journey contract: opening and exploring never report a tested construction", () => {
  expect(journeyStatus(initial())).toBeNull();
  const opened = updateJourneyProgress(initial(), { type: "touch", stage: "Compare the weekly records" }, 100);
  expect(opened.stage).toBe("Compare the weekly records");
  expect(opened.built).toBeNull();
  expect(opened.transferred).toBeNull();
  expect(journeyStatus(opened)?.label).toBe("In progress");
  const explored = updateJourneyProgress(opened, { type: "explored" }, 200);
  expect(journeyStatus(explored)?.label).toBe("Explored");
  expect(explored.built).toBeNull();
  expect(updateJourneyProgress(explored, { type: "explored" }, 300).exploredAt).toBe(200);
});

test("journey contract: successful builds and changed examples keep their own evidence and guidance", () => {
  const built = updateJourneyProgress(initial(), { type: "built", supported: true }, 100);
  expect(journeyStatus(built)?.label).toBe("Built with guidance");
  expect(built.transferred).toBeNull();
  const changed = updateJourneyProgress(built, { type: "transferred", supported: false }, 200);
  expect(changed.built).toMatchObject({ at: 100, supported: true });
  expect(changed.transferred).toMatchObject({ at: 200, supported: false });
  expect(journeyStatus(changed)?.label).toBe("Variation solved independently");
  const guided = updateJourneyProgress(changed, { type: "transferred", supported: true }, 300);
  expect(journeyStatus(guided)?.label).toBe("Variation solved with guidance");
  expect(updateJourneyProgress(guided, { type: "transferred", supported: false }, 350).transferred?.supported).toBe(true);
  expect(updateJourneyProgress(built, { type: "built", supported: false }, 350).built?.supported).toBe(true);
  const revisit = updateJourneyProgress(guided, { type: "touch", stage: "Read the explanation" }, 400);
  expect(revisit.built).toEqual(guided.built);
  expect(revisit.transferred).toEqual(guided.transferred);
});

test("journey contract: a fresh independent attempt preserves the earlier guided success", () => {
  const guided = updateJourneyProgress(initial(), { type: "built", supported: true, attemptId: "guided-draft" }, 100);
  const independent = updateJourneyProgress(guided, { type: "built", supported: false, attemptId: "fresh-draft" }, 200);
  expect(independent.built).toEqual({ at: 200, supported: false, attemptId: "fresh-draft" });
  expect(journeyAttemptHistory(independent)).toEqual([
    { at: 100, supported: true, attemptId: "guided-draft", kind: "built" },
    { at: 200, supported: false, attemptId: "fresh-draft", kind: "built" },
  ]);
  expect(journeyStatus(independent)?.label).toBe("Built independently");
  expect(journeyStatus(independent)?.detail).toContain("earlier work with Botie's help");
  const morePractice = updateJourneyProgress(independent, { type: "built", supported: true, attemptId: "another-guided-draft" }, 300);
  expect(journeyStatus(morePractice)?.label).toBe("Built independently");
  expect(morePractice.built?.supported).toBe(true);
  expect(journeyAttemptHistory(morePractice)).toHaveLength(3);
});

test("journey contract: repeating the same assisted attempt cannot remove its assistance", () => {
  let record = updateJourneyProgress(initial(), { type: "transferred", supported: true, attemptId: "changed-draft" }, 100);
  for (const at of [200, 300, 400]) record = updateJourneyProgress(record, { type: "transferred", supported: false, attemptId: "changed-draft" }, at);
  expect(record.transferred?.supported).toBe(true);
  expect(journeyAttemptHistory(record)).toHaveLength(1);
  const independent = updateJourneyProgress(record, { type: "transferred", supported: false, attemptId: "changed-fresh" }, 500);
  expect(journeyStatus(independent)?.label).toBe("Variation solved independently");
  expect(journeyAttemptHistory(independent)).toHaveLength(2);
});

test("journey contract: existing saved evidence survives the first new attempt", () => {
  const legacy = { ...initial(), built: { at: 100, supported: true }, transferred: { at: 150, supported: true } };
  expect(validJourneyProgress(legacy)).toBe(true);
  const newAttempt = updateJourneyProgress(legacy, { type: "built", supported: false, attemptId: "new-floor" }, 200);
  expect(journeyAttemptHistory(newAttempt)).toEqual([
    { kind: "built", at: 100, supported: true, attemptId: "legacy:built" },
    { kind: "transferred", at: 150, supported: true, attemptId: "legacy:transferred" },
    { kind: "built", at: 200, supported: false, attemptId: "new-floor" },
  ]);
  expect(validJourneyProgress(JSON.parse(JSON.stringify(newAttempt)))).toBe(true);
});

test("journey contract: carried assistance follows pieces until their stage starts on an empty floor", () => {
  const legacy: JourneyAssistance = { supported: true };
  expect(stageAssistance(legacy, "investigation")).toBe(true);
  const freshConstruction = freshStageAttempt(legacy, "construction", "new-construction");
  expect(stageAssistance(freshConstruction, "construction", true)).toBe(false);
  expect(stageAssistance(freshConstruction, "investigation", true)).toBe(false);
  expect(stageAssistance(freshConstruction, "preparation", true)).toBe(true);
  const hinted = recordStageAssistance(freshConstruction, "construction", true);
  const rerun = recordStageAssistance(hinted, "construction", false, "new-construction");
  expect(stageAssistance(rerun, "construction")).toBe(true);
  expect(stageAssistance(rerun, "investigation")).toBe(true);
  const freshVariation = freshStageAttempt(rerun, "investigation", "new-variation");
  expect(stageAssistance(freshVariation, "investigation")).toBe(false);
  expect(stageAssistance(freshVariation, "construction")).toBe(true);
});

test("journey contract: damaged or external destinations are not restored", () => {
  expect(validJourneyProgress(initial())).toBe(true);
  for (const change of [
    { href: "https://example.com" }, { href: "//example.com" }, { href: "javascript:alert(1)" },
    { id: "../something" }, { built: { at: 2, supported: "false" } },
    { transferred: { at: Number.NaN, supported: true } }, { stage: "x".repeat(161) },
    { built: { at: 100, supported: true, attemptId: "" } },
    { built: { at: Number.MAX_VALUE, supported: true } },
    { attempts: [{ at: 100, supported: false, attemptId: "draft", kind: "mastered" }] },
    { attempts: [null] },
  ]) expect(validJourneyProgress({ ...initial(), ...change })).toBe(false);
});

test("journey contract: existing workshop saves distinguish a construction from passed examples", () => {
  const saved = { graph: { pieces: [{ tool: "output" }] }, results: {}, hintsShown: 0, example: false };
  expect(savedWorkshopStatus(saved, 3)).toBeNull();
  const started = { ...saved, graph: { pieces: [{ tool: "output" }, { tool: "total" }] } };
  expect(savedWorkshopStatus(started, 3)).toBe("Construction saved");
  expect(savedWorkshopStatus({ ...started, results: { 0: true, 1: false, 2: true } }, 3)).toBe("Construction saved");
  expect(savedWorkshopStatus({ ...started, results: { 0: true, 1: true } }, 3)).toBe("Construction saved");
  const complete = { ...started, results: { 0: true, 1: true, 2: true } };
  expect(savedWorkshopStatus(complete, 3)).toBe("Examples passed");
  expect(savedWorkshopStatus({ ...complete, hintsShown: 1 }, 3)).toBe("Examples passed with guidance");
  expect(savedWorkshopStatus({ ...complete, example: true }, 3)).toBe("Examples passed with guidance");
  expect(savedWorkshopStatus({ ...complete, carriedSupport: true }, 3)).toBe("Examples passed with guidance");
});

test("journey contract: every published lesson has an accessible workshop and the guide remains separate", () => {
  expect(labLessons).toHaveLength(223);
  const routes = labLessons.map(lesson => labHref(lesson.id));
  expect(new Set(routes).size).toBe(labLessons.length);
  for (const lesson of labLessons) {
    expect(buildById[lesson.id], lesson.id).toBeDefined();
    expect(buildById[lesson.id].cases.length, lesson.id).toBeGreaterThan(1);
    expect(labHref(lesson.id)).toMatch(/^\/lab\/[a-z0-9-]+$/);
  }
  expect(buildById["workshop-guide"]).toBeDefined();
  expect(routes).not.toContain("/lab/workshop-guide");
});
