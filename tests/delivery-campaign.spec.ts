import { expect, test } from "@playwright/test";
import { assemble, constant, op, source } from "../lib/builds/engine";
import { TOOLS } from "../lib/builds/tools";
import {
  CAMPAIGN_MISSIONS, activeCampaignAttempt, campaignCorrection, campaignMachineValue,
  campaignReducer, campaignScenario, initialCampaignState, runCampaign, validCampaignState,
} from "../lib/builds/delivery-campaign";

const machine = () => assemble(op("add", [op("multiply", [source("distance"), constant(2)]), constant(6)]), TOOLS);

test("delivery campaign: useful curvature and small-sample flexibility have different outcomes", () => {
  const graph = machine();
  for (let seed = 0; seed < 7; seed++) {
    const curved = campaignScenario("curved-routes", seed);
    const straight = runCampaign(curved, "line", graph, false), quadratic = runCampaign(curved, "quadratic", graph, false);
    expect(quadratic.mse).toBeLessThan(1e-18);
    expect(quadratic.mse).toBeLessThan(straight.mse);
    expect(quadratic.supportedDecision).toBe(true);
    expect(straight.supportedDecision).toBe(false);
    const noisy = campaignScenario("small-sample", seed);
    const modest = runCampaign(noisy, "line", graph, false), flexible = runCampaign(noisy, "interpolate", graph, false);
    expect(flexible.trainingMse).toBeLessThan(1e-18);
    expect(flexible.trainingMse).toBeLessThan(modest.trainingMse);
    expect(modest.mse).toBeLessThan(flexible.mse);
    expect(modest.supportedDecision).toBe(true);
  }
});

test("delivery campaign: observed values alone cannot distinguish a true delay from an import error", () => {
  const graph = machine();
  for (let seed = 0; seed < 3; seed++) {
    const genuine = campaignScenario("verified-delay", seed), faulty = campaignScenario("recording-error", seed);
    expect(genuine.training).toEqual(faulty.training);
    expect(genuine.evidence).not.toEqual(faulty.evidence);
    const keepValid = runCampaign(genuine, "keep", graph, true), rewriteValid = runCampaign(genuine, "correct", graph, true);
    expect(keepValid.supportedDecision).toBe(true);
    expect(rewriteValid.supportedDecision).toBe(false);
    // A better score on this ordinary batch does not make a true observation false.
    expect(rewriteValid.mse).toBeLessThan(keepValid.mse);
    expect(runCampaign(genuine, "keep", graph, false).supportedDecision).toBe(false);
    const corrected = runCampaign(faulty, "correct", graph, true);
    expect(corrected.supportedDecision).toBe(true);
    expect(corrected.mse).toBeLessThan(1e-18);
    expect(runCampaign(faulty, "exclude", graph, true).supportedDecision).toBe(false);
    expect(runCampaign(faulty, "keep", graph, true).supportedDecision).toBe(false);
    expect(faulty.training.at(-1)!.minutes).toBe(genuine.training.at(-1)!.minutes);
  }
});

test("delivery campaign: a usable address feature resolves matching distances with different times", () => {
  const scenario = campaignScenario("neighborhoods", 3), graph = machine();
  const byDistance = runCampaign(scenario, "line", graph, false), byAddress = runCampaign(scenario, "neighborhood", graph, false);
  expect(byAddress.mse).toBeLessThan(1e-18);
  expect(byDistance.mse).toBeGreaterThan(15);
  const correction = campaignCorrection(scenario, "neighborhood", graph);
  const riverside = { id: "new", distance: 2.5, minutes: 0, neighborhood: "Riverside" as const };
  expect(correction.correction({ ...riverside, neighborhood: "Hilltop" }) - correction.correction(riverside)).toBeCloseTo(9, 10);
  expect(scenario.evidence.join(" ")).toContain("before dispatch");
});

test("delivery campaign: recent completed data helps a later batch and future outcomes never enter the fit", () => {
  const scenario = campaignScenario("changed-roads", 1), graph = machine();
  const old = runCampaign(scenario, "line", graph, true), updated = runCampaign(scenario, "recent", graph, true);
  expect(updated.mse).toBeLessThan(1e-18);
  expect(updated.mse).toBeLessThan(old.mse);
  const alteredFuture = { ...scenario, validation: scenario.validation.map(record => ({ ...record, minutes: record.minutes + 100 })) };
  const future = runCampaign(alteredFuture, "recent", graph, true);
  expect(future.rows.map(record => record.prediction)).toEqual(updated.rows.map(record => record.prediction));
  expect(future.mse).toBeGreaterThan(9000);
  expect(updated.fitRows).toEqual(scenario.recent);
});

test("delivery campaign: the installed graph really runs, and reports preserve its state", () => {
  const graph = machine(), changed = machine();
  const preparation = changed.pieces.find(piece => piece.tool === "constant" && piece.settings.value === 6)!;
  preparation.settings.value = 0;
  expect(campaignMachineValue(graph, 1)).toBe(8);
  expect(campaignMachineValue(changed, 1)).toBe(2);
  const scenario = campaignScenario("curved-routes");
  const original = runCampaign(scenario, "quadratic", graph, false), repaired = runCampaign(scenario, "quadratic", changed, false);
  expect(original.rows.map(record => record.baseline)).not.toEqual(repaired.rows.map(record => record.baseline));
  expect(repaired.correction![0] - original.correction![0]).toBeCloseTo(6, 10);
  const broken = { ...graph, connections: graph.connections.filter(wire => wire.to !== "output") };
  expect(() => runCampaign(scenario, "quadratic", broken, false)).toThrow(/needs/);
  let state = campaignReducer(initialCampaignState(), { type: "decision", decision: "quadratic" });
  state = campaignReducer(state, { type: "expectation", expectation: "lower" });
  state = campaignReducer(state, { type: "run", graph });
  const snapshot = activeCampaignAttempt(state).machine!;
  graph.pieces.find(piece => piece.tool === "constant" && piece.settings.value === 6)!.settings.value = 20;
  expect(campaignMachineValue(snapshot, 1)).toBe(8);
  expect(campaignMachineValue(graph, 1)).toBe(22);
});

test("delivery campaign: hints belong to an attempt and exposed records do not become an independent attempt", () => {
  let state = initialCampaignState();
  expect(activeCampaignAttempt(campaignReducer(state, { type: "run", graph: machine() })).report).toBeNull();
  state = campaignReducer(state, { type: "hint" });
  state = campaignReducer(state, { type: "decision", decision: "quadratic" });
  expect(activeCampaignAttempt(campaignReducer(state, { type: "run", graph: machine() })).report).toBeNull();
  state = campaignReducer(state, { type: "expectation", expectation: "lower" });
  state = campaignReducer(state, { type: "run", graph: machine() });
  const first = activeCampaignAttempt(state);
  expect(first.hints).toBe(1);
  expect(first.report?.supportedDecision).toBe(true);
  expect(campaignReducer(state, { type: "decision", decision: "line" })).toBe(state);
  state = campaignReducer(state, { type: "retry", fresh: false });
  expect(activeCampaignAttempt(state).resultsAlreadySeen).toBe(true);
  expect(activeCampaignAttempt(state).hints).toBe(0);
  state = campaignReducer(state, { type: "retry", fresh: true });
  expect(activeCampaignAttempt(state).resultsAlreadySeen).toBe(false);
  expect(activeCampaignAttempt(state).seed).toBe(1);
  expect(state.attempts.find(attempt => attempt.id === first.id)?.hints).toBe(1);
  for (const mission of CAMPAIGN_MISSIONS) {
    state = campaignReducer(state, { type: "mission", mission });
    expect(activeCampaignAttempt(state).mission).toBe(mission);
  }
  expect(validCampaignState(state)).toBe(true);
});

test("delivery campaign: evidence opened after dispatch does not retroactively validate that decision", () => {
  let state = campaignReducer(initialCampaignState(), { type: "mission", mission: "verified-delay" });
  state = campaignReducer(state, { type: "decision", decision: "keep" });
  state = campaignReducer(state, { type: "expectation", expectation: "higher" });
  state = campaignReducer(state, { type: "run", graph: machine() });
  state = campaignReducer(state, { type: "evidence" });
  expect(activeCampaignAttempt(state).evidenceOpened).toBe(true);
  expect(activeCampaignAttempt(state).report?.supportedDecision).toBe(false);
  for (let i = 0; i < 80; i++) state = campaignReducer(state, { type: "retry", fresh: true });
  expect(state.attempts.length).toBeLessThan(40);
  expect(validCampaignState(state)).toBe(true);
  expect(validCampaignState({ ...state, attempts: [] })).toBe(false);
});

test("delivery campaign: the selected error checker runs and its snapshot survives later edits", () => {
  const graph = machine();
  const checker = assemble(op("mean", [op("absolute", [op("subtract", [source("predicted"), source("actual")])])]), TOOLS);
  const scenario = campaignScenario("small-sample");
  const report = runCampaign(scenario, "line", graph, false, "absolute", checker);
  const expected = report.rows.reduce((sum, record) => sum + Math.abs(record.error), 0) / report.rows.length;
  expect(report.score).toBeCloseTo(expected, 12);
  expect(report.usedScorer).toBe(true);
  expect(report.metric).toBe("absolute");
  expect(report.rows.every(record => record.contribution === Math.abs(record.error))).toBe(true);
  const altered = assemble(op("multiply", [op("mean", [op("absolute", [op("subtract", [source("predicted"), source("actual")])])]), constant(2)]), TOOLS);
  expect(runCampaign(scenario, "line", graph, false, "absolute", altered).score).toBeCloseTo(expected * 2, 12);
  const broken = { ...checker, connections: [] };
  expect(() => runCampaign(scenario, "line", graph, false, "absolute", broken)).toThrow(/scoring machine/);
  let state = campaignReducer(initialCampaignState(), { type: "mission", mission: "small-sample" });
  state = campaignReducer(state, { type: "decision", decision: "line" });
  state = campaignReducer(state, { type: "expectation", expectation: "lower" });
  state = campaignReducer(state, { type: "run", graph, metric: "absolute", scorer: checker });
  checker.connections.length = 0;
  expect(activeCampaignAttempt(state).scorer!.connections.length).toBeGreaterThan(0);
  state = campaignReducer(state, { type: "name-block", name: "Our early-route adjustment" });
  expect(activeCampaignAttempt(state).blockName).toBe("Our early-route adjustment");
  expect(validCampaignState(state)).toBe(true);
});
