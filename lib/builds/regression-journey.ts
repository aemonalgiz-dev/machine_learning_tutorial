import { assemble, constant, evaluate, op, same, source, type Build, type Construction, type Piece, type Trace } from "./engine";
import { TOOLS } from "./tools";

export type Delivery = { distance: number; minutes: number };
export type Line = { slope: number; intercept: number };
export type DeliveryModel = "line" | "curve";
export type DeliveryMetric = "absolute" | "squared";
export type ModelChoiceReason = "validation" | "training" | "complexity";
export type DeliveryMachineSnapshot = { graph: Construction; metric: DeliveryMetric; scorer?: Construction };
export type DeliveryCommitment = {
  model: DeliveryModel; reason: ModelChoiceReason;
  machine: DeliveryMachineSnapshot;
  curveTraining: readonly Delivery[];
};
export type DeliveryScoreRow = Delivery & { prediction: number; error: number; contribution: number; trace?: Trace };
export type DeliveryScore = { rows: DeliveryScoreRow[]; score: number; metric: DeliveryMetric };
export type DeliveryMachineRun = DeliveryScore & { rows: (DeliveryScoreRow & { trace: Trace })[] };

// Invented measurements, kept distinct from construction checks and the final
// evaluation. Model parameters are fitted only on TRAIN_DELIVERIES.
export const TRAIN_DELIVERIES: readonly Delivery[] = [
  { distance: 1, minutes: 8 }, { distance: 2, minutes: 11 },
  { distance: 3, minutes: 12 }, { distance: 4, minutes: 15 },
  { distance: 5, minutes: 16 },
];
export const VALIDATION_DELIVERIES: readonly Delivery[] = [
  { distance: 1.5, minutes: 9 }, { distance: 2.5, minutes: 11 },
  { distance: 3.5, minutes: 13 }, { distance: 4.5, minutes: 15 },
  { distance: 5.5, minutes: 17 },
];
const TEST_DELIVERIES: readonly Delivery[] = [
  { distance: .5, minutes: 7 }, { distance: 1.75, minutes: 10 },
  { distance: 3.25, minutes: 12 }, { distance: 4.75, minutes: 16 },
  { distance: 5.75, minutes: 18 },
];

function checkMetric(metric: DeliveryMetric) {
  if (metric !== "absolute" && metric !== "squared") throw new Error("Choose an absolute-error or squared-error score.");
}

function checkRows(rows: readonly Delivery[]) {
  if (!rows.length || rows.some(row => !Number.isFinite(row.distance) || !Number.isFinite(row.minutes))) {
    throw new Error("Use at least one delivery with a finite distance and observed time.");
  }
}

/** Run the learner's scoring circuit, including its actual connections. */
export function runDeliveryScore(graph: Construction, predicted: readonly number[], actual: readonly number[]): number {
  if (!predicted.length || predicted.length !== actual.length || [...predicted, ...actual].some(value => !Number.isFinite(value))) {
    throw new Error("The score needs equally sized, nonempty lists of finite predictions and observations.");
  }
  const trace = evaluate(graph, { predicted: [...predicted], actual: [...actual] }, TOOLS);
  if (trace.error) throw new Error(`The scoring machine needs a repair: ${trace.error.message}`);
  if (typeof trace.output !== "number" || !Number.isFinite(trace.output)) {
    throw new Error("Connect one finite score to the scoring machine's Result.");
  }
  return trace.output;
}

/** Every prediction follows the graph. No coefficients are inferred or fitted. */
export function runDeliveryMachine(graph: Construction, rows: readonly Delivery[], metric: DeliveryMetric, scorer?: Construction): DeliveryMachineRun {
  checkRows(rows);
  checkMetric(metric);
  const results = rows.map(row => {
    const trace = evaluate(graph, { distance: row.distance }, TOOLS);
    if (trace.error) throw new Error(`The dispatch machine needs a repair: ${trace.error.message}`);
    if (typeof trace.output !== "number" || !Number.isFinite(trace.output)) {
      throw new Error("Connect one finite arrival-time prediction to Result.");
    }
    const prediction = trace.output, error = prediction - row.minutes;
    const contribution = metric === "absolute" ? Math.abs(error) : error ** 2;
    if (!Number.isFinite(contribution)) throw new Error("This error is too large to score. Check the machine's settings.");
    return { ...row, prediction, error, contribution, trace };
  });
  const score = scorer
    ? runDeliveryScore(scorer, results.map(row => row.prediction), results.map(row => row.minutes))
    : results.reduce((sum, row) => sum + row.contribution, 0) / results.length;
  if (!Number.isFinite(score)) throw new Error("The delivery score must be finite.");
  return { rows: results, score, metric };
}

function frozenConstruction(graph: Construction): Construction {
  const copy = {
    pieces: graph.pieces.map(piece => Object.freeze({ ...piece, settings: Object.freeze({ ...piece.settings }) })),
    connections: graph.connections.map(wire => Object.freeze({ ...wire })),
  };
  Object.freeze(copy.pieces);
  Object.freeze(copy.connections);
  return Object.freeze(copy);
}

/** A selection stores the tested pieces and their settings, not a model name alone. */
export function captureDeliveryMachine(graph: Construction, metric: DeliveryMetric, scorer?: Construction): DeliveryMachineSnapshot {
  checkMetric(metric);
  if (scorer) {
    const build = metric === "absolute" ? DELIVERY_ABSOLUTE_ERROR_BUILD : DELIVERY_ERROR_BUILD;
    for (const fixture of build.cases) {
      const trace = evaluate(scorer, fixture.data, TOOLS);
      if (trace.error || !same(trace.output, fixture.expected)) {
        throw new Error(`The scoring machine still needs to pass "${fixture.name}" for the selected mean-error measure.`);
      }
    }
  }
  runDeliveryMachine(graph, TRAIN_DELIVERIES, metric, scorer);
  return Object.freeze({ graph: frozenConstruction(graph), metric, ...(scorer ? { scorer: frozenConstruction(scorer) } : {}) });
}

export function deliveryMachineScores(machine: DeliveryMachineSnapshot) {
  return {
    training: runDeliveryMachine(machine.graph, TRAIN_DELIVERIES, machine.metric, machine.scorer),
    validation: runDeliveryMachine(machine.graph, VALIDATION_DELIVERIES, machine.metric, machine.scorer),
  };
}

/** A deliberately broken scorer for the cancellation investigation. */
export function brokenDeliveryScore(): Construction {
  return assemble(op("total", [op("subtract", [source("predicted"), source("actual")])]), TOOLS);
}

function deliveryLinePieces(graph: Construction): { slope: Piece; intercept: Piece } | null {
  const input = (piece: Piece, port: number) => {
    const wires = graph.connections.filter(wire => wire.to === piece.id && wire.port === port);
    return wires.length === 1 ? graph.pieces.find(candidate => candidate.id === wires[0].from) : undefined;
  };
  const output = graph.pieces.find(piece => piece.id === "output" && piece.tool === "output");
  const add = output && input(output, 0);
  if (add?.tool !== "add") return null;
  const additions = [input(add, 0), input(add, 1)];
  const intercept = additions.find(piece => piece?.tool === "constant");
  const multiply = additions.find(piece => piece?.tool === "multiply");
  if (!intercept || !multiply) return null;
  const factors = [input(multiply, 0), input(multiply, 1)];
  const slope = factors.find(piece => piece?.tool === "constant");
  if (!slope || slope.id === intercept.id || !factors.some(piece => piece?.tool === "source:distance")) return null;
  return { slope, intercept };
}

/** The learner explicitly requests this change. Keep their arrangement and wires. */
export function applyDeliveryLineFit(graph: Construction, rows: readonly Delivery[]): Construction {
  const parameters = deliveryLinePieces(graph);
  if (!parameters) throw new Error("This comparison can update a distance-times-rate rule with a separate preparation constant. Your current machine has a different arrangement.");
  const line = fitDeliveryLine(rows);
  return {
    pieces: graph.pieces.map(piece => ({ ...piece, settings: {
      ...piece.settings,
      ...(piece.id === parameters.slope.id ? { value: line.slope } : {}),
      ...(piece.id === parameters.intercept.id ? { value: line.intercept } : {}),
    } })),
    connections: graph.connections.map(wire => ({ ...wire })),
  };
}

export function predictLine(line: Line, distance: number) {
  return line.slope * distance + line.intercept;
}

export function fitDeliveryLine(rows: readonly Delivery[]): Line {
  if (rows.length < 2 || rows.some(row => !Number.isFinite(row.distance) || !Number.isFinite(row.minutes))) {
    throw new Error("Fitting needs at least two finite distance and time observations.");
  }
  const meanDistance = rows.reduce((sum, row) => sum + row.distance, 0) / rows.length;
  const meanMinutes = rows.reduce((sum, row) => sum + row.minutes, 0) / rows.length;
  const spread = rows.reduce((sum, row) => sum + (row.distance - meanDistance) ** 2, 0);
  if (spread === 0) throw new Error("The observed distances must vary to fit a slope.");
  const slope = rows.reduce((sum, row) => sum + (row.distance - meanDistance) * (row.minutes - meanMinutes), 0) / spread;
  return { slope, intercept: meanMinutes - slope * meanDistance };
}

// Lagrange interpolation gives the unique polynomial of degree at most n - 1
// through n observations at distinct distances. It is a real fitted comparator,
// not a hand-drawn curve or a claim that all polynomial regression overfits.
export function interpolateDelivery(rows: readonly Delivery[], distance: number): number {
  if (!rows.length || !Number.isFinite(distance) || rows.some(row => !Number.isFinite(row.distance) || !Number.isFinite(row.minutes))) {
    throw new Error("Interpolation needs finite observations and a finite distance.");
  }
  if (new Set(rows.map(row => row.distance)).size !== rows.length) throw new Error("Interpolation needs distinct distances.");
  return rows.reduce((sum, row, i) => sum + row.minutes * rows.reduce((weight, other, j) =>
    i === j ? weight : weight * (distance - other.distance) / (row.distance - other.distance), 1), 0);
}

export function predictionErrors(rows: readonly Delivery[], predict: (distance: number) => number) {
  if (!rows.length) throw new Error("At least one delivery is needed to measure error.");
  const errors = rows.map(row => {
    const prediction = predict(row.distance), error = prediction - row.minutes;
    if (!Number.isFinite(prediction) || !Number.isFinite(error)) throw new Error("Delivery predictions and measurements must be finite.");
    return { ...row, prediction, error, squaredError: error ** 2 };
  });
  return { rows: errors, mse: errors.reduce((sum, row) => sum + row.squaredError, 0) / errors.length };
}

export function deliveryPredictor(model: DeliveryModel): (distance: number) => number {
  if (model === "line") {
    const line = fitDeliveryLine(TRAIN_DELIVERIES);
    return distance => predictLine(line, distance);
  }
  return distance => interpolateDelivery(TRAIN_DELIVERIES, distance);
}

export function deliveryModelScores(model: DeliveryModel) {
  const predict = deliveryPredictor(model);
  return { training: predictionErrors(TRAIN_DELIVERIES, predict), validation: predictionErrors(VALIDATION_DELIVERIES, predict) };
}

function runDeliveryCurve(rows: readonly Delivery[], metric: DeliveryMetric, scorer: Construction | undefined, training: readonly Delivery[]): DeliveryScore {
  checkRows(rows);
  checkMetric(metric);
  const results = rows.map(row => {
    const prediction = interpolateDelivery(training, row.distance), error = prediction - row.minutes;
    const contribution = metric === "absolute" ? Math.abs(error) : error ** 2;
    if (!Number.isFinite(contribution)) throw new Error("The curve's error must be finite.");
    return { ...row, prediction, error, contribution };
  });
  const score = scorer
    ? runDeliveryScore(scorer, results.map(row => row.prediction), results.map(row => row.minutes))
    : results.reduce((sum, row) => sum + row.contribution, 0) / results.length;
  return { rows: results, score, metric };
}

export function deliveryCurveScores(metric: DeliveryMetric, scorer?: Construction) {
  return {
    training: runDeliveryCurve(TRAIN_DELIVERIES, metric, scorer, TRAIN_DELIVERIES),
    validation: runDeliveryCurve(VALIDATION_DELIVERIES, metric, scorer, TRAIN_DELIVERIES),
  };
}

export function commitDeliveryModel(existing: DeliveryCommitment | null, model: DeliveryModel, reason: ModelChoiceReason, machine: DeliveryMachineSnapshot): DeliveryCommitment {
  // Once test outcomes have been exposed, changing the selected model would
  // turn that same test set into selection data. Revisiting earlier stages
  // never changes the saved commitment.
  if (existing) return existing;
  if (!["line", "curve"].includes(model) || !["validation", "training", "complexity"].includes(reason)) {
    throw new Error("Choose a model and a reason before opening the final deliveries.");
  }
  const snapshot = captureDeliveryMachine(machine.graph, machine.metric, machine.scorer);
  const curveTraining = Object.freeze(TRAIN_DELIVERIES.map(row => Object.freeze({ ...row })));
  return Object.freeze({ model, reason, machine: snapshot, curveTraining });
}

export function evaluateCommittedDeliveryModel(commitment: DeliveryCommitment | null) {
  if (!commitment) return null;
  const { machine, model, curveTraining } = commitment;
  const dispatch = (rows: readonly Delivery[]) => runDeliveryMachine(machine.graph, rows, machine.metric, machine.scorer);
  const curve = (rows: readonly Delivery[]) => runDeliveryCurve(rows, machine.metric, machine.scorer, curveTraining);
  const result = model === "line" ? dispatch(TEST_DELIVERIES) : curve(TEST_DELIVERIES);
  const dispatchValidation = dispatch(VALIDATION_DELIVERIES).score;
  const curveValidation = curve(VALIDATION_DELIVERIES).score;
  const usedBetterValidation = model === "line" ? dispatchValidation <= curveValidation : curveValidation <= dispatchValidation;
  return {
    ...result, model,
    // Selection evidence comes from validation. A lucky final test score cannot
    // establish that the learner selected a model using the earlier evidence.
    appliedSelection: commitment.reason === "validation" && usedBetterValidation,
  };
}

export function outlierDeliveries(minutes: number): Delivery[] {
  if (!Number.isFinite(minutes) || minutes < 16 || minutes > 40) throw new Error("Use a final delivery time from 16 to 40 minutes.");
  return TRAIN_DELIVERIES.map((row, i) => i === TRAIN_DELIVERIES.length - 1 ? { ...row, minutes } : { ...row });
}

export const DELIVERY_PREDICTOR_BUILD: Build = {
  id: "delivery-predictor", title: "Give distance a place in the estimate",
  problem: "A customer needs an estimate before their delivery arrives. Distance tells us something, but a nearby delivery still takes time to prepare.",
  challenge: "Build a provisional rule using 2 minutes per kilometre and 6 minutes for preparation. The distance source changes for each check. Choose the operations and constants yourself, then connect their answer to Result. These checks test the rule, not whether it matches every real delivery.",
  why: "Multiplication turns kilometres into travel minutes. Adding preparation time allows a nearby order to take time too. These constants are our starting assumptions; the recorded deliveries will help us decide whether to change them.",
  sources: { distance: "Delivery distance (km)" },
  cases: [1, 3, 5, 0].map(distance => ({ name: `${distance} km delivery`, data: { distance }, expected: 2 * distance + 6 })),
  recipe: op("add", [op("multiply", [source("distance"), constant(2)]), constant(6)]),
  extras: ["subtract", "divide"],
  hints: [
    "The rate tells us how many travel minutes to allow for each kilometre. Which operation combines a distance with an amount per kilometre?",
    "Preparation happens once per delivery. Find where its fixed time should enter after you have calculated the travel time.",
    "Use one Multiply piece for distance and a constant of 2. Pass its output and a constant of 6 into Add, then connect Add to Result.",
  ],
  limitation: "This is a manually specified rule. Passing its construction checks does not train a model or establish its accuracy on deliveries. The project measurements are invented.",
};

export const DELIVERY_ERROR_BUILD: Build = {
  id: "delivery-squared-errors", title: "Why did two mistakes add up to zero?",
  problem: "One prediction is too early and another is too late. Adding the signed errors could make those mistakes disappear from the total.",
  challenge: "A prediction is two minutes early; another is two minutes late. The current score says nothing went wrong. Repair the scoring machine so both mistakes count. For this version, a mistake twice as large should contribute four times as much. The final score should average those contributions, so repeating a batch does not change it. Choose your pieces, then test more than one delivery pair.",
  why: "Squaring keeps early and late mistakes from cancelling. The mean lets us compare different numbers of deliveries on the same scale. Its units are minutes squared, so it is a scoring rule rather than an average wait in minutes.",
  sources: { predicted: "Predicted delivery times (min)", actual: "Observed delivery times (min)" },
  cases: [
    { name: "Our provisional line", data: { predicted: [8, 10, 12, 14, 16], actual: [8, 11, 12, 15, 16] }, expected: .4 },
    { name: "Early and late errors", data: { predicted: [8, 12], actual: [10, 10] }, expected: 4 },
    { name: "A different number of deliveries", data: { predicted: [9, 11, 17], actual: [8, 12, 15] }, expected: 2 },
    { name: "Every prediction agrees", data: { predicted: [8, 11, 12], actual: [8, 11, 12] }, expected: 0 },
  ],
  recipe: op("mean", [op("square", [op("subtract", [source("predicted"), source("actual")])])]),
  extras: ["absolute", "total", "count", "divide"],
  hints: [
    "Keep each prediction beside the observation for the same delivery. Subtract can calculate all of those differences at once.",
    "A negative error still counts as a mistake. Squaring each difference makes both directions contribute to the score.",
    "Find the mean after squaring. You can use Mean, or build it from Add a list, Count items and Divide.",
  ],
  limitation: "Mean squared error gives large mistakes extra weight. Different operational costs can require a different measure. The measurements are invented.",
};

export const DELIVERY_ABSOLUTE_ERROR_BUILD: Build = {
  ...DELIVERY_ERROR_BUILD,
  id: "delivery-absolute-errors", title: "How many minutes were the estimates off?",
  challenge: "The early and late mistakes should both count. For this version, every extra minute of error should add the same amount. Find the average size of the mistakes, so repeating a batch does not change its score. The prediction and observed-time lists refer to the same deliveries in the same order. Repair the machine and connect one score to Result.",
  why: "Absolute value keeps the size of each mistake and removes its sign. Averaging those sizes tells us how far the promises were from the arrivals, in minutes. This measure gives every additional minute the same weight.",
  cases: DELIVERY_ERROR_BUILD.cases.map(fixture => {
    const predictions = fixture.data.predicted as number[], actual = fixture.data.actual as number[];
    return { ...fixture, expected: predictions.reduce((sum, prediction, i) => sum + Math.abs(prediction - actual[i]), 0) / predictions.length };
  }),
  recipe: op("mean", [op("absolute", [op("subtract", [source("predicted"), source("actual")])])]),
  extras: ["square", "total", "count", "divide"],
  hints: [
    "First inspect each prediction beside the observation for the same delivery. Which operation tells us their difference?",
    "A negative difference is an early promise, and it still counts. Absolute value can keep its size while removing the sign.",
    "Average the sizes after removing their signs. Mean can do this, or you can build the average from a total and a count.",
  ],
  limitation: "Mean absolute error counts every extra minute equally. Squared error gives large mistakes more weight. Neither score tells us why a particular delivery was late. The measurements are invented.",
};

export const DELIVERY_STAGES = [
  "Estimate a delivery", "Measure the mistakes", "Investigate a late arrival", "Choose a model", "Try fresh deliveries", "Keep the service running",
] as const;
