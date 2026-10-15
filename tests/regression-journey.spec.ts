import { expect, test } from "@playwright/test";
import { assemble, constant, evaluate, op, source, same } from "../lib/builds/engine";
import { TOOLS } from "../lib/builds/tools";
import {
  DELIVERY_ABSOLUTE_ERROR_BUILD, DELIVERY_ERROR_BUILD, DELIVERY_PREDICTOR_BUILD, TRAIN_DELIVERIES, VALIDATION_DELIVERIES,
  applyDeliveryLineFit, brokenDeliveryScore, captureDeliveryMachine, deliveryMachineScores, deliveryCurveScores,
  commitDeliveryModel, deliveryModelScores, deliveryPredictor, evaluateCommittedDeliveryModel,
  fitDeliveryLine, interpolateDelivery, outlierDeliveries, predictLine, predictionErrors, runDeliveryMachine, runDeliveryScore,
} from "../lib/builds/regression-journey";

function fittedMachine() {
  return captureDeliveryMachine(
    applyDeliveryLineFit(assemble(DELIVERY_PREDICTOR_BUILD.recipe, TOOLS), TRAIN_DELIVERIES),
    "squared", assemble(DELIVERY_ERROR_BUILD.recipe, TOOLS),
  );
}

test("regression journey contract: least squares fits measurements and reduces hand-set error", () => {
  const fitted = fitDeliveryLine(TRAIN_DELIVERIES);
  expect(fitted.slope).toBeCloseTo(2, 12);
  expect(fitted.intercept).toBeCloseTo(6.4, 12);
  expect(predictionErrors(TRAIN_DELIVERIES, distance => predictLine(fitted, distance)).mse).toBeCloseTo(.24, 12);
  expect(predictionErrors(TRAIN_DELIVERIES, distance => 2 * distance + 6).mse).toBeCloseTo(.4, 12);
  // Least-squares residuals are orthogonal to the constant and distance columns.
  const errors = predictionErrors(TRAIN_DELIVERIES, distance => predictLine(fitted, distance)).rows;
  expect(errors.reduce((sum, row) => sum + row.error, 0)).toBeCloseTo(0, 12);
  expect(errors.reduce((sum, row) => sum + row.error * row.distance, 0)).toBeCloseTo(0, 12);
});

test("regression journey contract: fitting rejects insufficient and degenerate measurements", () => {
  expect(() => fitDeliveryLine([])).toThrow(/at least two/);
  expect(() => fitDeliveryLine([{ distance: 1, minutes: 3 }])).toThrow(/at least two/);
  expect(() => fitDeliveryLine([{ distance: 1, minutes: 3 }, { distance: 1, minutes: 4 }])).toThrow(/distances must vary/);
  expect(() => fitDeliveryLine([{ distance: 1, minutes: Infinity }, { distance: 2, minutes: 4 }])).toThrow(/finite/);
  expect(() => interpolateDelivery([{ distance: 1, minutes: 3 }, { distance: 1, minutes: 4 }], 2)).toThrow(/distinct/);
  expect(() => predictionErrors([], () => 2)).toThrow(/At least one/);
  expect(() => predictionErrors(TRAIN_DELIVERIES, () => NaN)).toThrow(/finite/);
});

test("regression journey contract: construction checks accept equivalent mathematics and reject constant answers", () => {
  for (const build of [DELIVERY_PREDICTOR_BUILD, DELIVERY_ERROR_BUILD, DELIVERY_ABSOLUTE_ERROR_BUILD]) {
    const graph = assemble(build.recipe, TOOLS);
    for (const fixture of build.cases) {
      const result = evaluate(graph, fixture.data, TOOLS);
      expect(result.error).toBeUndefined();
      expect(same(result.output, fixture.expected), fixture.name).toBe(true);
    }
    expect(new Set(build.cases.map(fixture => fixture.expected)).size).toBeGreaterThan(1);
  }
  // A learner may reverse subtraction before squaring and build the mean from
  // a sum and count. Grading follows results rather than the reference wiring.
  const squared = op("square", [op("subtract", [source("actual"), source("predicted")])]);
  const alternative = assemble(op("divide", [op("total", [squared]), op("count", [source("actual")])]), TOOLS);
  for (const fixture of DELIVERY_ERROR_BUILD.cases) {
    expect(same(evaluate(alternative, fixture.data, TOOLS).output, fixture.expected)).toBe(true);
  }
});

test("regression journey contract: one late arrival changes other predictions without editing source observations", () => {
  const baseline = JSON.stringify(TRAIN_DELIVERIES);
  const edited = outlierDeliveries(36);
  expect(edited.slice(0, 4)).toEqual(TRAIN_DELIVERIES.slice(0, 4));
  const changed = fitDeliveryLine(edited);
  expect(changed.slope).toBeCloseTo(6, 12);
  expect(changed.intercept).toBeCloseTo(-1.6, 12);
  expect(predictLine(changed, 1)).toBeCloseTo(4.4, 12);
  expect(JSON.stringify(TRAIN_DELIVERIES)).toBe(baseline);
  expect(() => outlierDeliveries(41)).toThrow(/16 to 40/);
});

test("regression journey contract: fitted flexibility wins training and loses validation on these data", () => {
  const line = deliveryModelScores("line"), curve = deliveryModelScores("curve");
  TRAIN_DELIVERIES.forEach(row => expect(deliveryPredictor("curve")(row.distance)).toBeCloseTo(row.minutes, 12));
  expect(curve.training.mse).toBeCloseTo(0, 12);
  expect(curve.training.mse).toBeLessThan(line.training.mse);
  expect(line.validation.mse).toBeCloseTo(.16, 12);
  expect(curve.validation.mse).toBeCloseTo(5.12265625, 12);
  expect(line.validation.mse).toBeLessThan(curve.validation.mse);
  expect(VALIDATION_DELIVERIES.every(validation => !TRAIN_DELIVERIES.some(training => training.distance === validation.distance))).toBe(true);
});

test("regression journey contract: final outcomes require commitment and the chosen model cannot change after reveal", () => {
  expect(evaluateCommittedDeliveryModel(null)).toBeNull();
  const snapshot = fittedMachine();
  const committed = commitDeliveryModel(null, "line", "validation", snapshot);
  const final = evaluateCommittedDeliveryModel(committed)!;
  expect(final.score).toBeCloseTo(.2, 12);
  expect(final.metric).toBe("squared");
  expect(final.appliedSelection).toBe(true);
  expect(commitDeliveryModel(committed, "curve", "training", snapshot)).toBe(committed);
  expect(final.model).toBe("line");
  for (const row of final.rows) {
    expect([...TRAIN_DELIVERIES, ...VALIDATION_DELIVERIES].some(seen => seen.distance === row.distance)).toBe(false);
  }
  // A lucky model choice with an inappropriate stated criterion does not
  // establish application of validation-based selection.
  expect(evaluateCommittedDeliveryModel(commitDeliveryModel(null, "line", "training", snapshot))!.appliedSelection).toBe(false);
  expect(evaluateCommittedDeliveryModel(commitDeliveryModel(null, "curve", "validation", snapshot))!.appliedSelection).toBe(false);
});

test("regression journey contract: inspecting final outcomes never refits either model", () => {
  const distances = [0, 1, 2.5, 5.5, 6];
  const before = (["line", "curve"] as const).map(model => distances.map(deliveryPredictor(model)));
  for (const model of ["line", "curve"] as const) evaluateCommittedDeliveryModel(commitDeliveryModel(null, model, "validation", fittedMachine()));
  const after = (["line", "curve"] as const).map(model => distances.map(deliveryPredictor(model)));
  expect(after).toEqual(before);
});

test("regression journey contract: downstream batches use the learner's wires and parameters", () => {
  const graph = assemble(DELIVERY_PREDICTOR_BUILD.recipe, TOOLS);
  const sourcePiece = graph.pieces.find(piece => piece.tool === "source:distance")!;
  const multiply = graph.pieces.find(piece => piece.tool === "multiply")!;
  const complete = runDeliveryMachine(graph, TRAIN_DELIVERIES, "squared");
  expect(complete.rows.map(row => row.prediction)).toEqual([8, 10, 12, 14, 16]);
  expect(complete.score).toBeCloseTo(.4, 12);
  expect(complete.rows[0].trace.steps.some(step => step.id === sourcePiece.id && step.output === 1)).toBe(true);
  // Removing preparation time must remain visible in the later deliveries.
  const omittedPreparation = { ...graph, connections: graph.connections.map(wire => wire.to === "output" ? { ...wire, from: multiply.id } : wire) };
  const wrong = runDeliveryMachine(omittedPreparation, TRAIN_DELIVERIES, "squared");
  expect(wrong.rows[0].prediction).toBe(2);
  expect(wrong.rows[0].error).toBe(-6);
  expect(wrong.score).toBeCloseTo(41.2, 12);
  const snapshot = captureDeliveryMachine(omittedPreparation, "squared");
  expect(deliveryMachineScores(snapshot).validation.rows[0].prediction).toBe(3);
  const final = evaluateCommittedDeliveryModel(commitDeliveryModel(null, "line", "validation", snapshot))!;
  expect(final.rows[0].prediction).toBe(1);
  expect(final.appliedSelection).toBe(false);
  expect(runDeliveryMachine(graph, TRAIN_DELIVERIES, "squared").score).toBeLessThan(wrong.score);
});

test("regression journey contract: unfinished or nonscalar machines cannot silently receive fitted predictions", () => {
  const graph = assemble(DELIVERY_PREDICTOR_BUILD.recipe, TOOLS);
  const disconnected = { ...graph, connections: graph.connections.filter(wire => wire.to !== "output") };
  expect(() => runDeliveryMachine(disconnected, TRAIN_DELIVERIES, "absolute")).toThrow(/needs a repair/);
  expect(() => captureDeliveryMachine(disconnected, "absolute")).toThrow(/needs a repair/);
  const listResult = assemble(op("pack", [source("distance"), constant(2)]), TOOLS);
  expect(() => runDeliveryMachine(listResult, TRAIN_DELIVERIES, "squared")).toThrow(/one finite/);
  expect(() => runDeliveryMachine(graph, [], "squared")).toThrow(/at least one delivery/);
  expect(() => runDeliveryMachine(graph, [{ distance: NaN, minutes: 8 }], "squared")).toThrow(/finite/);
});

test("regression journey contract: repairs distinguish cancellation from absolute and squared error", () => {
  const broken = brokenDeliveryScore();
  const absolute = assemble(DELIVERY_ABSOLUTE_ERROR_BUILD.recipe, TOOLS);
  const squared = assemble(DELIVERY_ERROR_BUILD.recipe, TOOLS);
  expect(runDeliveryScore(broken, [8, 12], [10, 10])).toBe(0);
  expect(runDeliveryScore(absolute, [8, 12], [10, 10])).toBe(2);
  expect(runDeliveryScore(squared, [8, 12], [10, 10])).toBe(4);
  const graph = assemble(DELIVERY_PREDICTOR_BUILD.recipe, TOOLS);
  const rows = [{ distance: 1, minutes: 10 }, { distance: 3, minutes: 10 }];
  // The supplied graph supplies the score even while it is broken. Passing a
  // metric label must not replace the circuit with an invisible calculation.
  expect(runDeliveryMachine(graph, rows, "squared", broken).score).toBe(0);
  const absoluteRun = runDeliveryMachine(graph, rows, "absolute", absolute);
  const squaredRun = runDeliveryMachine(graph, rows, "squared", squared);
  expect(absoluteRun.rows.map(row => row.contribution)).toEqual([2, 2]);
  expect(squaredRun.rows.map(row => row.contribution)).toEqual([4, 4]);
  expect(absoluteRun.score).toBe(2);
  expect(squaredRun.score).toBe(4);
  expect(() => captureDeliveryMachine(graph, "squared", broken)).toThrow(/scoring machine still needs/);
  expect(() => captureDeliveryMachine(graph, "squared", absolute)).toThrow(/scoring machine still needs/);
  expect(() => runDeliveryScore(squared, [8], [8, 12])).toThrow(/equally sized/);
  const disconnected = { ...squared, connections: squared.connections.filter(wire => wire.to !== "output") };
  expect(() => runDeliveryScore(disconnected, [8], [8])).toThrow(/needs a repair/);
});

test("regression journey contract: a model commitment retains the actual machine and scoring circuit", () => {
  const graph = assemble(DELIVERY_PREDICTOR_BUILD.recipe, TOOLS);
  const scorer = assemble(DELIVERY_ABSOLUTE_ERROR_BUILD.recipe, TOOLS);
  const snapshot = captureDeliveryMachine(graph, "absolute", scorer);
  const committed = commitDeliveryModel(null, "line", "validation", snapshot);
  const before = evaluateCommittedDeliveryModel(committed)!;
  graph.pieces.find(piece => piece.tool === "constant" && piece.settings.value === 6)!.settings.value = 100;
  scorer.connections.splice(0);
  const after = evaluateCommittedDeliveryModel(committed)!;
  expect(after).toEqual(before);
  expect(after.rows[0].prediction).toBe(7);
  expect(after.metric).toBe("absolute");
  expect(after.score).toBeCloseTo(.4, 12);
  expect(Object.isFrozen(snapshot.graph.pieces[0].settings)).toBe(true);
  expect(Object.isFrozen(committed.machine.scorer!.connections)).toBe(true);
  expect(Object.isFrozen(committed.curveTraining[0])).toBe(true);
  expect(after.rows.every(row => row.trace?.steps.length)).toBe(true);
});

test("regression journey contract: an explicit fit changes only identifiable constants and accepts swapped inputs", () => {
  const graph = assemble(op("add", [constant(6), op("multiply", [constant(2), source("distance")])]), TOOLS);
  const before = JSON.stringify(graph);
  const fitted = applyDeliveryLineFit(graph, TRAIN_DELIVERIES);
  expect(fitted.connections).toEqual(graph.connections);
  expect(fitted.pieces.map(({ id, tool, x, y }) => ({ id, tool, x, y }))).toEqual(graph.pieces.map(({ id, tool, x, y }) => ({ id, tool, x, y })));
  expect(runDeliveryMachine(fitted, TRAIN_DELIVERIES, "squared").score).toBeCloseTo(.24, 12);
  expect(JSON.stringify(graph)).toBe(before);
  const withoutIntercept = assemble(op("multiply", [source("distance"), constant(2)]), TOOLS);
  expect(() => applyDeliveryLineFit(withoutIntercept, TRAIN_DELIVERIES)).toThrow(/different arrangement/);
  const sharedConstant = assemble(op("add", [constant(2), op("multiply", [constant(2), source("distance")])]), TOOLS);
  expect(() => applyDeliveryLineFit(sharedConstant, TRAIN_DELIVERIES)).toThrow(/separate preparation constant/);
});

test("regression journey contract: both comparison candidates use the selected repaired score", () => {
  const absolute = assemble(DELIVERY_ABSOLUTE_ERROR_BUILD.recipe, TOOLS);
  const graph = assemble(DELIVERY_PREDICTOR_BUILD.recipe, TOOLS);
  const machine = captureDeliveryMachine(graph, "absolute", absolute);
  const candidates = [deliveryMachineScores(machine), deliveryCurveScores("absolute", absolute)];
  for (const candidate of candidates) {
    for (const result of [candidate.training, candidate.validation]) {
      expect(result.metric).toBe("absolute");
      expect(result.score).toBeCloseTo(result.rows.reduce((sum, row) => sum + Math.abs(row.error), 0) / result.rows.length, 12);
    }
  }
  expect(candidates[0].validation.score).toBeLessThan(candidates[1].validation.score);
});
