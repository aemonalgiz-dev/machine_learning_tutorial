import { evaluate, type Construction } from "./engine";
import { TOOLS } from "./tools";
import { validConstructionForBuild } from "./workshop-session";
import { runDeliveryScore, type DeliveryMetric } from "./regression-journey";

export const CAMPAIGN_MISSIONS = ["curved-routes", "small-sample", "verified-delay", "recording-error", "neighborhoods", "changed-roads"] as const;
export type CampaignMission = typeof CAMPAIGN_MISSIONS[number];
export type CampaignRow = { id: string; distance: number; minutes: number; neighborhood?: "Riverside" | "Hilltop" };
export type CampaignDecision = "line" | "quadratic" | "interpolate" | "keep" | "correct" | "exclude" | "neighborhood" | "recent";
type Choice = { id: CampaignDecision; label: string; explanation: string };
export type CampaignScenario = {
  id: CampaignMission; title: string; problem: string; objective: string; skill: string;
  training: CampaignRow[]; validation: CampaignRow[]; recent?: CampaignRow[];
  choices: Choice[]; evidence: string[]; correctedMinutes?: number;
  hints: string[];
};
export type DispatchRow = CampaignRow & { baseline: number; prediction: number; error: number; squaredError: number; contribution: number };
export type CampaignReport = {
  rows: DispatchRow[]; baselineMse: number; mse: number; trainingMse: number;
  metric: DeliveryMetric; score: number; baselineScore: number; trainingScore: number; usedScorer: boolean;
  supportedDecision: boolean; explanation: string; skill: string;
  correction: number[] | null; fitRows: CampaignRow[];
};
export type CampaignAttempt = {
  id: number; mission: CampaignMission; seed: number; decision: CampaignDecision | "";
  expectation: "" | "lower" | "higher" | "similar";
  evidenceOpened: boolean; hints: number; resultsAlreadySeen: boolean;
  report: CampaignReport | null; machine: Construction | null; scorer: Construction | null; blockName: string;
};
export type CampaignState = { mission: CampaignMission; nextId: number; attempts: CampaignAttempt[] };

const line: Choice = { id: "line", label: "Fit a straight correction", explanation: "Allow a fixed adjustment and an adjustment per kilometre." };
const row = (id: string, distance: number, minutes: number, neighborhood?: CampaignRow["neighborhood"]): CampaignRow => ({ id, distance, minutes, ...(neighborhood ? { neighborhood } : {}) });

// These are invented delivery records. A fresh batch changes preparation time
// and rates, while preserving the situation the mission asks the learner to diagnose.
export function campaignScenario(mission: CampaignMission, seed = 0): CampaignScenario {
  const batch = Math.abs(Math.trunc(seed)), variant = batch % 7;
  const preparation = 5 + (batch % 101) * .02, rate = 1.5 + (batch % 97) * .01;
  const usual = (distance: number) => preparation + rate * distance;
  const training = [1, 2, 3, 4, 5].map((distance, i) => row(`Record ${i + 1}`, distance, usual(distance)));
  const validation = [.5, 1.5, 2.5, 4.5, 5.5].map((distance, i) => row(`Order ${i + 1}`, distance, usual(distance)));
  const base = { id: mission, training, validation, evidence: [] as string[] };
  if (mission === "curved-routes") {
    const curve = (distance: number) => usual(distance) + .6 * distance ** 2;
    return { ...base, title: "The longer routes fall behind", skill: "Selected a useful curved correction",
      problem: "The service has expanded beyond its old delivery radius. Our longer trips cross more busy junctions. We have five completed trips and a batch waiting to leave.",
      objective: "Use the completed trips to choose the correction you expect to give the smaller error on the waiting orders. Dispatch the batch, then compare its promises with the other fit.",
      training: training.map(record => ({ ...record, minutes: curve(record.distance) })),
      validation: validation.map(record => ({ ...record, minutes: curve(record.distance) })),
      choices: [line, { id: "quadratic", label: "Include distance squared", explanation: "Fit an extra correction that can change more quickly on longer routes." }],
      hints: ["Compare the extra minutes between consecutive kilometre readings. Does each additional kilometre add the same amount?", "A distance-squared term lets the rate of change increase with distance. The next batch will tell us whether that helps here."],
    };
  }
  if (mission === "small-sample") return { ...base, title: "Five trips are all we have", skill: "Avoided fitting every fluctuation in a small sample",
    problem: "A new rider has completed only five trips. Preparation and traffic vary a little each time. A flexible correction can agree with every one of those records, but we need estimates for the next rider's trips too.",
    objective: "Decide how much flexibility these five records justify. Compare your choice with your installed machine on deliveries that were not used to fit it.",
    training: training.map((record, index) => ({ ...record, minutes: record.minutes + [0, 1.8, -.4, 1.5, 0][index] })),
    choices: [line, { id: "interpolate", label: "Pass through all five records", explanation: "Fit a polynomial correction with enough freedom to match every recorded time exactly." }],
    hints: ["Look at the change from one trip to the next. The difference jumps up and down even though distance increases steadily.", "An exact match to five training times is evidence about those five trips. Consider what would happen between them and just outside their range."],
  };
  if (mission === "verified-delay" || mission === "recording-error") {
    const verified = mission === "verified-delay", normal = usual(5);
    const late = normal + 20;
    training[4] = { ...training[4], minutes: late };
    return { ...base, training, title: verified ? "One rider really was delayed" : "A record disagrees with the dispatch log",
      skill: verified ? "Kept a verified unusual observation" : "Corrected a record using its source evidence",
      problem: "One trip took much longer than the other records would suggest. Refitting with that observation changes estimates for every distance. Before changing the data, we need to find out what happened.",
      objective: "Open the dispatch evidence, decide how to treat Record 5, then refit. The evidence decides whether the record is valid; a smaller error alone cannot tell us that.",
      correctedMinutes: normal,
      choices: [
        { id: "keep", label: "Keep the recorded time", explanation: "Include the long trip when fitting the correction." },
        { id: "correct", label: `Replace it with ${formatCampaignNumber(normal)} minutes`, explanation: "Use the ordinary-route duration instead of the value in the imported record." },
        { id: "exclude", label: "Leave this trip out", explanation: "Fit using only the first four records." },
      ],
      evidence: verified ? [
        `Record 5: the dispatch clock and the rider's independent timer both measured ${formatCampaignNumber(late)} minutes.`,
        "The rider's note reports a 20-minute road closure. The raw record agrees with both clocks.",
        "This service includes occasional road closures. These trips remain part of what customers experience. The next batch below happens to use clear roads.",
      ] : [
        `Record 5: the dispatch clock and the rider's independent timer both measured ${formatCampaignNumber(normal)} minutes.`,
        `The import log shows that 20 minutes were added to that row by a conversion error. The imported value is ${formatCampaignNumber(late)} minutes.`,
        "The correction is documented by the source records. There was no road closure on this trip.",
      ],
      hints: ["There are two different questions: is the record true, and can distance explain it? Open the dispatch evidence before treating those as the same question.", verified ? "Both clocks confirm the delay. Keep that observation, then consider what information a distance-only model lacks." : "The clocks agree and the import log identifies a specific error. A documented correction preserves information that deleting the row would lose."],
    };
  }
  if (mission === "neighborhoods") {
    const neighborhoodRows = (distances: number[], prefix: string) => distances.flatMap((distance, i) =>
      (["Riverside", "Hilltop"] as const).map(neighborhood => row(`${prefix} ${i * 2 + (neighborhood === "Riverside" ? 1 : 2)}`, distance,
        usual(distance) + (neighborhood === "Hilltop" ? 6 + variant : 0), neighborhood)));
    return { ...base, title: "The same distance, a different arrival", skill: "Used a feature available before dispatch",
      problem: "We now deliver to Riverside and Hilltop. Some trips cover the same distance but take different amounts of time. The address tells us the neighborhood before the rider leaves.",
      objective: "Decide whether the dispatch system needs the neighborhood as an input. Fit your choice using completed trips, then see how its promises work in both neighborhoods.",
      training: neighborhoodRows([1, 3, 5], "Record"), validation: neighborhoodRows([2, 4], "Order"),
      choices: [line, { id: "neighborhood", label: "Add the neighborhood input", explanation: "Fit one distance correction plus a separate Hilltop adjustment. Riverside is the reference neighborhood." }],
      evidence: ["Distance and neighborhood come from the delivery address before dispatch.", "Hilltop's access road adds time in these records. Actual arrival time is recorded after the delivery and cannot be used as an input to its own prediction."],
      hints: ["Compare Riverside and Hilltop at the same distance. A distance-only input gives those trips the same prediction.", "Use information available when the estimate is made. Neighborhood is available then; the actual arrival time is not."],
    };
  }
  return { ...base, title: "The roads changed after the repair", skill: "Responded to a later change without fitting future outcomes",
    problem: "The dispatch rule worked last month. This week a diversion adds time to each kilometre, and recent deliveries keep arriving after the promise. We have this week's completed records, but tomorrow's outcomes are still unknown.",
    objective: "Choose which completed records should fit the current correction. Dispatch tomorrow's batch without using its outcomes in the fit.",
    recent: training.map(record => ({ ...record, id: record.id.replace("Record", "This week"), minutes: record.minutes + 1.2 * record.distance })),
    validation: validation.map(record => ({ ...record, minutes: record.minutes + 1.2 * record.distance })),
    choices: [{ ...line, label: "Keep last month's fit" }, { id: "recent", label: "Refit using this week's completed trips", explanation: "Use the recent records that were available before tomorrow's dispatch." }],
    evidence: ["The diversion began before this week's completed trips. It remains in place tomorrow.", "Tomorrow's actual arrivals are reserved for checking the decision. Neither candidate is fitted on them."],
    hints: ["Compare this week's times with last month's at matching distances. Is the difference consistent with the documented diversion?", "Recent completed trips can inform an update. Tomorrow's actual times are unavailable until after the estimates have been made."],
  };
}

export const formatCampaignNumber = (value: number) => Number(value.toFixed(2)).toString();

export function campaignMachineValue(graph: Construction, distance: number): number {
  const trace = evaluate(graph, { distance }, TOOLS);
  if (trace.error) throw new Error(trace.error.message);
  if (typeof trace.output !== "number" || !Number.isFinite(trace.output)) throw new Error("The installed delivery machine must return one finite arrival time from distance.");
  return trace.output;
}

function leastSquares(rows: readonly CampaignRow[], graph: Construction, columns: (record: CampaignRow) => number[]) {
  const design = rows.map(columns), count = design[0]?.length ?? 0;
  if (rows.length < count || !count) throw new Error("This correction needs more completed deliveries.");
  const residuals = rows.map(record => record.minutes - campaignMachineValue(graph, record.distance));
  const augmented = Array.from({ length: count }, (_, i) => [
    ...Array.from({ length: count }, (_, j) => design.reduce((sum, values) => sum + values[i] * values[j], 0)),
    design.reduce((sum, values, index) => sum + values[i] * residuals[index], 0),
  ]);
  // Partial pivoting is sufficient for these small, bounded teaching datasets.
  for (let pivot = 0; pivot < count; pivot++) {
    let best = pivot;
    for (let r = pivot + 1; r < count; r++) if (Math.abs(augmented[r][pivot]) > Math.abs(augmented[best][pivot])) best = r;
    [augmented[pivot], augmented[best]] = [augmented[best], augmented[pivot]];
    const divisor = augmented[pivot][pivot];
    if (Math.abs(divisor) < 1e-10) throw new Error("These records do not distinguish the selected correction's inputs.");
    for (let c = pivot; c <= count; c++) augmented[pivot][c] /= divisor;
    for (let r = 0; r < count; r++) if (r !== pivot) {
      const factor = augmented[r][pivot];
      for (let c = pivot; c <= count; c++) augmented[r][c] -= factor * augmented[pivot][c];
    }
  }
  return augmented.map(values => values[count]);
}

export function campaignCorrection(scenario: CampaignScenario, decision: CampaignDecision, graph: Construction) {
  if (!scenario.choices.some(choice => choice.id === decision)) throw new Error("Choose an action available in this mission.");
  let fitRows = scenario.training.map(record => ({ ...record }));
  if (decision === "recent") fitRows = scenario.recent!.map(record => ({ ...record }));
  if (decision === "exclude") fitRows = fitRows.slice(0, -1);
  if (decision === "correct") fitRows[fitRows.length - 1].minutes = scenario.correctedMinutes!;
  if (decision === "interpolate") {
    const residuals = fitRows.map(record => record.minutes - campaignMachineValue(graph, record.distance));
    return { fitRows, coefficients: null, correction: (record: CampaignRow) => fitRows.reduce((sum, point, index) =>
      sum + residuals[index] * fitRows.reduce((weight, other, j) => index === j ? weight : weight * (record.distance - other.distance) / (point.distance - other.distance), 1), 0) };
  }
  const columns = decision === "quadratic" ? (record: CampaignRow) => [1, record.distance, record.distance ** 2]
    : decision === "neighborhood" ? (record: CampaignRow) => [1, record.distance, record.neighborhood === "Hilltop" ? 1 : 0]
      : (record: CampaignRow) => [1, record.distance];
  const coefficients = leastSquares(fitRows, graph, columns);
  return { fitRows, coefficients, correction: (record: CampaignRow) => columns(record).reduce((sum, value, index) => sum + value * coefficients[index], 0) };
}

const mse = (values: number[]) => values.reduce((sum, value) => sum + value * value, 0) / values.length;
export function runCampaign(scenario: CampaignScenario, decision: CampaignDecision, graph: Construction, evidenceOpened: boolean, metric: DeliveryMetric = "squared", scorer?: Construction): CampaignReport {
  if (metric !== "absolute" && metric !== "squared") throw new Error("Choose an absolute-error or squared-error score.");
  const correction = campaignCorrection(scenario, decision, graph);
  const scorePredictions = (predictions: number[], actual: number[]) => scorer ? runDeliveryScore(scorer, predictions, actual)
    : predictions.reduce((sum, prediction, i) => sum + (metric === "squared" ? (prediction - actual[i]) ** 2 : Math.abs(prediction - actual[i])), 0) / predictions.length;
  const rows = scenario.validation.map(record => {
    const baseline = campaignMachineValue(graph, record.distance), prediction = baseline + correction.correction(record), error = prediction - record.minutes;
    if (!Number.isFinite(prediction)) throw new Error("This correction did not produce a finite delivery estimate.");
    return { ...record, baseline, prediction, error, squaredError: error ** 2, contribution: metric === "squared" ? error ** 2 : Math.abs(error) };
  });
  const expected: Record<CampaignMission, CampaignDecision> = { "curved-routes": "quadratic", "small-sample": "line", "verified-delay": "keep", "recording-error": "correct", neighborhoods: "neighborhood", "changed-roads": "recent" };
  const needsEvidence = scenario.id === "verified-delay" || scenario.id === "recording-error";
  const score = scorePredictions(rows.map(record => record.prediction), rows.map(record => record.minutes));
  let supportedDecision = decision === expected[scenario.id] && (!needsEvidence || evidenceOpened);
  if (!needsEvidence) {
    const alternative = scenario.choices.find(choice => choice.id !== decision)!;
    const other = campaignCorrection(scenario, alternative.id, graph);
    const otherScore = scorePredictions(scenario.validation.map(record => campaignMachineValue(graph, record.distance) + other.correction(record)), scenario.validation.map(record => record.minutes));
    supportedDecision = supportedDecision && score < otherScore - 1e-8;
  }
  const explanation: Record<CampaignMission, string> = {
    "curved-routes": "Longer trips add increasingly more time in these records. A distance-squared correction follows that relationship and predicts the reserved deliveries more accurately than a straight correction. Flexibility helps when it matches a pattern that persists beyond the fitting data.",
    "small-sample": "The exact-fit correction follows fluctuations in five individual trips. Those fluctuations do not repeat in the reserved batch. A straight correction leaves some training error, but gives more useful estimates here. That is a result for these records, not a rule against curved models.",
    "verified-delay": "Both clocks confirm the long trip. Keeping it preserves a real experience, even though this batch's ordinary trips can score better if we remove it. Distance alone cannot explain a road closure. We need to study the closure or the cost of rare delays before changing the prediction policy.",
    "recording-error": "The source clocks and import log identify a recording error. Correcting that value repairs the evidence used for fitting. A low error score by itself would not justify rewriting a measurement.",
    neighborhoods: "Matching distances still have different times in the two neighborhoods. The address supplies that missing information before dispatch. The fitted Hilltop adjustment reduces the consistent errors in this invented batch; it would need checking again if routes or traffic changed.",
    "changed-roads": "Last month's fit describes the old route. This week's completed deliveries reflect the diversion and are available before tomorrow's estimates. The later batch checks the update. Repeated checks over time would tell us whether the change lasts.",
  };
  return { rows, baselineMse: mse(rows.map(record => record.baseline - record.minutes)), mse: mse(rows.map(record => record.error)),
    metric, score, baselineScore: scorePredictions(rows.map(record => record.baseline), rows.map(record => record.minutes)),
    trainingScore: scorePredictions(correction.fitRows.map(record => campaignMachineValue(graph, record.distance) + correction.correction(record)), correction.fitRows.map(record => record.minutes)), usedScorer: !!scorer,
    trainingMse: mse(correction.fitRows.map(record => campaignMachineValue(graph, record.distance) + correction.correction(record) - record.minutes)),
    supportedDecision, skill: scenario.skill, explanation: !evidenceOpened && needsEvidence ? `You have seen what the refit does, but have not inspected the source evidence. The score cannot verify Record 5. ${explanation[scenario.id]}` : explanation[scenario.id],
    correction: correction.coefficients, fitRows: correction.fitRows };
}

function emptyAttempt(id: number, mission: CampaignMission, seed: number, resultsAlreadySeen = false): CampaignAttempt {
  return { id, mission, seed, decision: "", expectation: "", evidenceOpened: false, hints: 0, resultsAlreadySeen, report: null, machine: null, scorer: null, blockName: "" };
}
export function initialCampaignState(): CampaignState {
  return { mission: "curved-routes", nextId: 7, attempts: CAMPAIGN_MISSIONS.map((mission, index) => emptyAttempt(index + 1, mission, 0)) };
}
export function activeCampaignAttempt(state: CampaignState) {
  return [...state.attempts].reverse().find(attempt => attempt.mission === state.mission)!;
}
export type CampaignAction =
  | { type: "mission"; mission: CampaignMission }
  | { type: "decision"; decision: CampaignDecision }
  | { type: "expectation"; expectation: CampaignAttempt["expectation"] }
  | { type: "evidence" }
  | { type: "hint" }
  | { type: "run"; graph: Construction; metric?: DeliveryMetric; scorer?: Construction }
  | { type: "name-block"; name: string }
  | { type: "retry"; fresh: boolean };
export function campaignReducer(state: CampaignState, action: CampaignAction): CampaignState {
  if (action.type === "mission") return CAMPAIGN_MISSIONS.includes(action.mission) ? { ...state, mission: action.mission } : state;
  const current = activeCampaignAttempt(state), scenario = campaignScenario(current.mission, current.seed);
  if (action.type === "retry") {
    // A new batch resets guidance. Retesting exposed records stays an exploratory
    // attempt, even when the learner does not request a further hint.
    const attempt = emptyAttempt(state.nextId, state.mission, action.fresh ? current.seed + 1 : current.seed, !action.fresh && (current.report !== null || current.resultsAlreadySeen));
    const retainedIds = new Set<number>();
    for (const mission of CAMPAIGN_MISSIONS) {
      const history = [...state.attempts].reverse().filter(item => item.mission === mission);
      retainedIds.add(history[0].id);
      const guided = history.find(item => item.report?.supportedDecision && item.hints > 0);
      const independent = history.find(item => item.report?.supportedDecision && item.hints === 0 && !item.resultsAlreadySeen);
      if (guided) retainedIds.add(guided.id);
      if (independent) retainedIds.add(independent.id);
    }
    const retained = state.attempts.filter(item => retainedIds.has(item.id) || item.id >= state.nextId - 30);
    return { ...state, nextId: state.nextId + 1, attempts: [...retained, attempt] };
  }
  if (current.report && action.type !== "evidence" && action.type !== "name-block") return state;
  let next = current;
  if (action.type === "decision" && scenario.choices.some(choice => choice.id === action.decision)) next = { ...current, decision: action.decision };
  if (action.type === "expectation") next = { ...current, expectation: action.expectation };
  if (action.type === "evidence") next = { ...current, evidenceOpened: true };
  if (action.type === "hint") next = { ...current, hints: Math.min(current.hints + 1, scenario.hints.length) };
  if (action.type === "name-block") next = { ...current, blockName: action.name.slice(0, 80) };
  if (action.type === "run" && current.decision && current.expectation) {
    next = { ...current, report: runCampaign(scenario, current.decision, action.graph, current.evidenceOpened, action.metric, action.scorer),
      machine: JSON.parse(JSON.stringify(action.graph)) as Construction, scorer: action.scorer ? JSON.parse(JSON.stringify(action.scorer)) as Construction : null,
      blockName: scenario.choices.find(choice => choice.id === current.decision)!.label };
  }
  return { ...state, attempts: state.attempts.map(attempt => attempt.id === current.id ? next : attempt) };
}

export function validCampaignState(raw: unknown): raw is CampaignState {
  if (!raw || typeof raw !== "object") return false;
  const value = raw as CampaignState;
  if (!CAMPAIGN_MISSIONS.includes(value.mission) || !Number.isInteger(value.nextId) || !Array.isArray(value.attempts) || value.attempts.length > 50) return false;
  return CAMPAIGN_MISSIONS.every(mission => value.attempts.some(attempt => attempt.mission === mission)) && value.attempts.every(attempt =>
    attempt && CAMPAIGN_MISSIONS.includes(attempt.mission) && Number.isInteger(attempt.id) && attempt.id > 0 && attempt.id < value.nextId && Number.isInteger(attempt.seed) && attempt.seed >= 0
    && ["", ...campaignScenario(attempt.mission, attempt.seed).choices.map(choice => choice.id)].includes(attempt.decision)
    && ["", "lower", "higher", "similar"].includes(attempt.expectation) && typeof attempt.evidenceOpened === "boolean"
    && typeof attempt.blockName === "string" && attempt.blockName.length <= 80
    && Number.isInteger(attempt.hints) && attempt.hints >= 0 && attempt.hints <= 2 && typeof attempt.resultsAlreadySeen === "boolean"
    && (attempt.report === null || !!attempt.report && Array.isArray(attempt.report.rows) && typeof attempt.report.supportedDecision === "boolean"
      && Number.isFinite(attempt.report.mse) && Number.isFinite(attempt.report.baselineMse) && Number.isFinite(attempt.report.trainingMse)
      && ["absolute", "squared"].includes(attempt.report.metric) && [attempt.report.score, attempt.report.baselineScore, attempt.report.trainingScore].every(Number.isFinite)
      && typeof attempt.report.usedScorer === "boolean"
      && typeof attempt.report.explanation === "string" && typeof attempt.report.skill === "string"
      && attempt.report.rows.every(record => !!record && typeof record.id === "string" && [record.distance, record.minutes, record.prediction, record.baseline, record.error, record.squaredError, record.contribution].every(Number.isFinite)))
    && (attempt.machine === null ? attempt.report === null : validConstructionForBuild(attempt.machine, { sources: { distance: "Distance" } }, TOOLS))
    && (attempt.scorer === null || validConstructionForBuild(attempt.scorer, { sources: { predicted: "Predictions", actual: "Actual" } }, TOOLS)));
}
