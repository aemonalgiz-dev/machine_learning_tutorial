// The one place the website knows how to reach the compute API.
//
// Every interactive widget fits through here rather than doing the mathematics
// in the browser, so the library stays the single source of truth and the
// frontend stays a view. The base URL is configuration -- the deployed API's
// origin in production, the local FastAPI dev server otherwise.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export interface Point {
  x: number;
  y: number;
}

export interface FittedLine {
  x_start: number;
  y_start: number;
  x_end: number;
  y_end: number;
}

export interface LineFit {
  slope: number;
  intercept: number;
  r_squared: number;
  line: FittedLine;
  residuals: number[];
  mean_target: number;
  rss: number;
  tss: number;
}

// A typed library refusal comes back as { error, detail }; the widgets show the
// detail, because it is written to be read by a learner. A network failure is
// distinguished from a refusal so the widget can say "can't reach the API"
// rather than blaming the data.
export class ApiError extends Error {
  constructor(
    message: string,
    readonly kind: "refused" | "unreachable",
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// What a reader sees when no refusal of the calculation's own came back. These
// are page text like any other, so they name what happened rather than the
// machinery behind the page. A first visit after a restart can meet the second
// one while a large fit is still being worked out, which is why it suggests a
// reload rather than blaming the input.
const UNREACHABLE =
  "The calculation behind this could not be reached. Reloading the page usually brings it back.";
const NOT_WORKED_OUT =
  "This could not be worked out just now. Reloading the page usually fixes it.";

// One POST, one place to turn a non-2xx into a readable ApiError. Every call
// below is a thin wrapper over this.
export async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(UNREACHABLE, "unreachable");
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const detail =
      errorBody?.detail && typeof errorBody.detail === "string"
        ? errorBody.detail
        : NOT_WORKED_OUT;
    throw new ApiError(detail, "refused");
  }

  return (await response.json()) as T;
}

// The GET twin, for the handful of endpoints that take no input at all.
export async function getJson<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`);
  } catch {
    throw new ApiError(UNREACHABLE, "unreachable");
  }

  if (!response.ok) {
    throw new ApiError(NOT_WORKED_OUT, "refused");
  }

  return (await response.json()) as T;
}

export async function fitSimpleLinearRegression(
  points: Point[],
): Promise<LineFit> {
  return postJson<LineFit>("/concepts/simple-linear-regression/fit", { points });
}

// --- Calculus primer: gradient descent on a fixed curve ---------------------

export type DescentFunction = "bowl" | "valley";

export type DescentOutcome = "converged" | "step_limit_reached" | "diverged";

export interface CurvePoint {
  x: number;
  y: number;
}

export interface DescentPoint {
  x: number;
  y: number;
  slope: number;
}

export interface DescentWindow {
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
}

export interface Descent {
  curve: CurvePoint[];
  window: DescentWindow;
  path: DescentPoint[];
  outcome: DescentOutcome;
  minimum: CurvePoint | null;
}

export interface DescentRequest {
  function: DescentFunction;
  start: number;
  learning_rate: number;
  steps?: number;
}

export async function runGradientDescent(
  request: DescentRequest,
): Promise<Descent> {
  return postJson<Descent>("/primers/calculus/descend", request);
}

// The step before descent: the slope of a curve at one point, for the tangent
// explorer.
export interface CurveSlope {
  x: number;
  y: number;
  slope: number;
}

export interface Tangent {
  curve: CurvePoint[];
  window: DescentWindow;
  point: CurveSlope;
}

export interface TangentRequest {
  function: DescentFunction;
  x: number;
}

export async function curveTangent(request: TangentRequest): Promise<Tangent> {
  return postJson<Tangent>("/primers/calculus/tangent", request);
}

// The definition of the derivative: the average rate of change across a gap (the
// secant), and the derivative at the base (the tangent) the secant approaches as
// the gap shrinks.
export interface Secant {
  curve: CurvePoint[];
  window: DescentWindow;
  base_point: CurvePoint;
  second_point: CurvePoint;
  secant_slope: number;
  tangent_slope: number;
}

export interface SecantRequest {
  function: DescentFunction;
  base: number;
  gap: number;
}

export async function curveSecant(request: SecantRequest): Promise<Secant> {
  return postJson<Secant>("/primers/calculus/secant", request);
}

// --- Linear algebra primer: vectors, and a matrix moving the plane ----------

export interface PlanePoint {
  x: number;
  y: number;
}

export interface VectorPair {
  length_first: number;
  length_second: number;
  distance: number;
  dot: number;
  cosine: number | null;
}

export async function measureVectors(
  first: PlanePoint,
  second: PlanePoint,
): Promise<VectorPair> {
  return postJson<VectorPair>("/primers/linear-algebra/vectors", {
    first,
    second,
  });
}

export interface Matrix2x2 {
  a: number;
  b: number;
  c: number;
  d: number;
}

export interface GridSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface EigenDirection {
  value: number;
  x: number;
  y: number;
}

export interface PlaneTransform {
  grid_lines: GridSegment[];
  unit_square: PlanePoint[];
  basis_first: PlanePoint;
  basis_second: PlanePoint;
  eigen: EigenDirection[];
  has_real_eigen: boolean;
}

export async function transformPlane(
  matrix: Matrix2x2,
): Promise<PlaneTransform> {
  return postJson<PlaneTransform>("/primers/linear-algebra/transform", matrix);
}

export interface AppliedVector {
  image: PlanePoint;
  aligned: boolean;
  factor: number | null;
  angle_degrees: number | null;
  eigen: EigenDirection[];
  has_real_eigen: boolean;
}

export async function applyMatrix(
  matrix: Matrix2x2,
  vector: PlanePoint,
): Promise<AppliedVector> {
  return postJson<AppliedVector>("/primers/linear-algebra/apply", {
    ...matrix,
    vector,
  });
}

// --- Multiple & polynomial regression, and ridge & lasso ------------------

export interface NamedCoefficient {
  name: string;
  value: number;
}

export interface PolynomialFit {
  coefficients: NamedCoefficient[];
  intercept: number;
  r_squared: number;
  residual_sum_of_squares: number;
  fitted: number[];
  residuals: number[];
  curve: CurvePoint[];
}

// The interval the fitted curve is sampled over. Unset, the curve spans the
// data and stops; set, it runs on past the last measurement, which is the
// only way to see what a high degree does out there.
export interface CurveRange {
  from: number;
  to: number;
}

export async function fitPolynomial(
  points: Point[],
  degree: number,
  curveRange?: CurveRange,
): Promise<PolynomialFit> {
  return postJson<PolynomialFit>("/concepts/multiple-polynomial-regression/fit", {
    points,
    degree,
    ...(curveRange ? { curve_from: curveRange.from, curve_to: curveRange.to } : {}),
  });
}

export type PenaltyModel = "ridge" | "lasso";

export interface TermContribution {
  name: string;
  values: number[];
}

export interface PenalisedFit {
  coefficients: NamedCoefficient[];
  intercept: number;
  r_squared: number;
  residual_sum_of_squares: number;
  penalty_cost: number;
  objective: number;
  nonzero_count: number;
  curve: CurvePoint[];
  term_contributions: TermContribution[];
}

export async function fitPenalised(
  points: Point[],
  model: PenaltyModel,
  penalty: number,
): Promise<PenalisedFit> {
  return postJson<PenalisedFit>("/concepts/ridge-lasso/fit", {
    points,
    model,
    penalty,
  });
}

// --- Classification: logistic, k-nearest neighbours, decision trees --------

export interface Outcome {
  x: number;
  label: number;
}

export interface StraightLine {
  slope: number;
  intercept: number;
}

export interface LogisticFit {
  slope: number;
  intercept: number;
  boundary: number | null;
  accuracy: number;
  curve: CurvePoint[];
  gaps: number[];
  gap_total: number;
  probabilities: number[];
  log_likelihood: number;
  log_loss: number;
  likelihood: number;
  epochs_run: number;
  converged: boolean;
  odds_multiplier: number;
  probability_at_zero: number;
  straight_line: StraightLine;
}

// One student under a named curve: score, probability, decision and loss.
export interface ScoredOutcome {
  x: number;
  label: number;
  score: number;
  probability: number;
  predicted: number;
  correct: boolean;
  assigned_probability: number;
  loss_contribution: number;
  gap: number;
  weighted_gap: number;
}

export interface ConfusionCounts {
  true_positives: number;
  true_negatives: number;
  false_positives: number;
  false_negatives: number;
}

export interface LogisticEvaluation {
  outcomes: ScoredOutcome[];
  confusion: ConfusionCounts;
  accuracy: number;
  boundary: number | null;
  log_likelihood: number;
  log_loss: number;
  likelihood: number;
  gap_total: number;
  weighted_gap_total: number;
  curve: CurvePoint[];
}

export async function evaluateLogistic(
  points: Outcome[],
  slope: number,
  intercept: number,
  threshold = 0.5,
): Promise<LogisticEvaluation> {
  return postJson<LogisticEvaluation>("/concepts/logistic-regression/evaluate", {
    points,
    slope,
    intercept,
    threshold,
  });
}

export interface LogisticPass {
  pass_number: number;
  intercept: number;
  slope: number;
  log_loss: number;
  accuracy: number;
  gradient_intercept: number;
  gradient_slope: number;
}

export interface LogisticWalk {
  passes: LogisticPass[];
  start_log_loss: number;
  converged: boolean;
  passes_run: number;
  intercept_axis: number[];
  slope_axis: number[];
  log_losses: number[][];
}

export async function walkLogistic(
  points: Outcome[],
  learningRate: number,
  maxEpochs: number,
): Promise<LogisticWalk> {
  return postJson<LogisticWalk>("/concepts/logistic-regression/walk", {
    points,
    learning_rate: learningRate,
    max_epochs: maxEpochs,
  });
}

export async function fitLogistic(
  points: Outcome[],
  learningRate: number,
): Promise<LogisticFit> {
  return postJson<LogisticFit>("/concepts/logistic-regression/fit", {
    points,
    learning_rate: learningRate,
  });
}

export interface LabelledPoint {
  x: number;
  y: number;
  label: number;
}

export interface RegionGrid {
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
  cells: number;
  labels: number[][];
}

export interface ChosenNeighbour {
  index: number;
  distance: number;
  label: number;
}

export interface KnnAnswer {
  prediction: number;
  neighbours: ChosenNeighbour[];
  votes_for_zero: number;
  votes_for_one: number;
  regions: RegionGrid;
}

export async function classifyByNeighbours(
  points: LabelledPoint[],
  query: Point,
  k: number,
): Promise<KnnAnswer> {
  return postJson<KnnAnswer>("/concepts/k-nearest-neighbours/classify", {
    points,
    query,
    k,
  });
}

export interface TreeNodeDocument {
  kind: string;
  samples: number;
  question: string | null;
  left: TreeNodeDocument | null;
  right: TreeNodeDocument | null;
  label: number | null;
}

export interface TreeFit {
  tree: TreeNodeDocument;
  depth: number;
  n_leaves: number;
  accuracy: number;
  regions: RegionGrid;
}

// One side of a candidate question, counted and scored.
export interface NodeMixture {
  children: number;
  adults: number;
  n_samples: number;
  child_share: number;
  adult_share: number;
  gini: number;
}

export interface SplitInspection {
  parent: NodeMixture;
  left: NodeMixture;
  right: NodeMixture;
  weighted_after: number;
  gain: number;
  candidates: number[];
}

export async function inspectSplit(
  points: LabelledPoint[],
  feature: "height" | "weight",
  threshold: number,
): Promise<SplitInspection> {
  return postJson<SplitInspection>("/concepts/decision-trees/split-inspector", {
    points,
    feature,
    threshold,
  });
}

// One node of a grown tree, laid out for a step-through. `split_order`
// numbers the splits breadth first and is null on a leaf; `bounds` is the
// rectangle the node owns, as [x_min, x_max, y_min, y_max].
export interface GrownNode {
  id: number;
  parent_id: number | null;
  depth: number;
  split_order: number | null;
  feature: string | null;
  threshold: number | null;
  gain: number | null;
  children: number;
  adults: number;
  majority: number;
  left_id: number | null;
  right_id: number | null;
  bounds: number[];
}

export interface TreeGrowth {
  nodes: GrownNode[];
  n_splits: number;
  depth: number;
  n_leaves: number;
  accuracy: number;
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
}

export interface GrowthControls {
  maxDepth?: number;
  minSamplesSplit?: number;
  minSamplesLeaf?: number;
  minImpurityDecrease?: number;
  // The forest's rule. Set maxFeatures and every split is offered that
  // many features, drawn under randomSeed.
  maxFeatures?: number;
  randomSeed?: number;
}

export async function growTree(
  points: LabelledPoint[],
  controls: GrowthControls = {},
): Promise<TreeGrowth> {
  return postJson<TreeGrowth>("/concepts/decision-trees/growth", {
    points,
    ...(controls.maxDepth !== undefined ? { max_depth: controls.maxDepth } : {}),
    ...(controls.minSamplesSplit !== undefined ? { min_samples_split: controls.minSamplesSplit } : {}),
    ...(controls.minSamplesLeaf !== undefined ? { min_samples_leaf: controls.minSamplesLeaf } : {}),
    ...(controls.minImpurityDecrease !== undefined ? { min_impurity_decrease: controls.minImpurityDecrease } : {}),
    ...(controls.maxFeatures !== undefined ? { max_features: controls.maxFeatures } : {}),
    ...(controls.randomSeed !== undefined ? { random_seed: controls.randomSeed } : {}),
  });
}

export interface DepthScore {
  max_depth: number;
  depth_reached: number;
  n_leaves: number;
  train_accuracy: number;
  held_out_accuracy: number;
  regions: RegionGrid;
}

export interface TreeDepthSweep {
  held_out_indices: number[];
  scores: DepthScore[];
}

export async function sweepTreeDepth(
  points: LabelledPoint[],
  maxDepth: number,
): Promise<TreeDepthSweep> {
  return postJson<TreeDepthSweep>("/concepts/decision-trees/depth-sweep", {
    points,
    max_depth: maxDepth,
  });
}

export interface VersusLogistic {
  tree_regions: RegionGrid;
  tree_accuracy: number;
  tree_leaves: number;
  logistic_regions: RegionGrid;
  logistic_accuracy: number;
}

export async function compareTreeWithLogistic(
  points: LabelledPoint[],
  maxDepth: number,
): Promise<VersusLogistic> {
  return postJson<VersusLogistic>("/concepts/decision-trees/versus-logistic", {
    points,
    max_depth: maxDepth,
  });
}

export async function fitTree(
  points: LabelledPoint[],
  maxDepth: number,
): Promise<TreeFit> {
  return postJson<TreeFit>("/concepts/decision-trees/fit", {
    points,
    max_depth: maxDepth,
  });
}

// --- Ensembles: bagging, random forests, gradient boosting -----------------

export interface CommitteeAnswer {
  accuracy: number;
  out_of_bag_score: number;
  roots_on_height: number;
  roots_on_weight: number;
  regions: RegionGrid;
}

// One member of a bagged committee, as the bagging page reads it.
export interface MemberDocument {
  position: number;
  draws: number[];
  multiplicities: number[];
  distinct_rows: number;
  omitted_rows: number;
  root_feature: string | null;
  root_threshold: number | null;
  depth: number;
  n_leaves: number;
  predictions: number[];
  regions: RegionGrid;
}

export interface CommitteeSize {
  n_members: number;
  train_accuracy: number;
  out_of_bag_accuracy: number | null;
  out_of_bag_covered: number;
  changed_cells: number;
  regions: RegionGrid;
  vote_share: number[][];
}

export interface OutOfBagRow {
  label: number;
  eligible: number[];
  out_of_bag_adult_votes: number;
  out_of_bag_prediction: number | null;
  full_adult_votes: number;
  full_prediction: number;
}

export interface BaggingAnatomy {
  n_rows: number;
  members: MemberDocument[];
  sizes: CommitteeSize[];
  out_of_bag: OutOfBagRow[];
  roots_on_height: number;
  roots_on_weight: number;
  expected_omitted: number;
  expected_distinct: number;
  // Each member scored on the rows its own sample omitted, and how alike
  // the members are, measured pairwise on rows both omitted.
  member_strengths: (number | null)[];
  mean_strength: number | null;
  pairwise_agreement: number | null;
  error_correlation: number | null;
}

export interface AnatomyOptions {
  memberDepth?: number;
  maxFeatures?: number;
  seed?: number;
}

// Several widgets on the bagging page read the same seeded committee, and
// the endpoint refits it at every size, so one page-load shares one answer
// per distinct request rather than asking six times.
const anatomyCache = new Map<string, Promise<BaggingAnatomy>>();

export async function fetchBaggingAnatomy(
  points: LabelledPoint[],
  nMembers: number,
  memberDepth?: number,
  options: AnatomyOptions = {},
): Promise<BaggingAnatomy> {
  const body = {
    points,
    n_members: nMembers,
    ...(memberDepth === undefined ? {} : { member_depth: memberDepth }),
    ...(options.maxFeatures === undefined ? {} : { max_features: options.maxFeatures }),
    ...(options.seed === undefined ? {} : { seed: options.seed }),
  };
  const key = JSON.stringify(body);
  const cached = anatomyCache.get(key);
  if (cached) return cached;
  const pending = postJson<BaggingAnatomy>("/concepts/ensembles/bagging-anatomy", body).catch((error) => {
    anatomyCache.delete(key);
    throw error;
  });
  anatomyCache.set(key, pending);
  return pending;
}

export interface FeatureBest {
  feature: string;
  threshold: number;
  gain: number;
}

export interface LotteryDraw {
  offered: string[];
  withheld: string[];
  winner: string;
  winner_gain: number;
  best_denied: boolean;
}

export interface Lottery {
  board: FeatureBest[];
  draws: LotteryDraw[];
}

export async function drawForestLottery(
  points: LabelledPoint[],
  maxFeatures: number,
  nDraws: number,
  seed = 7,
): Promise<Lottery> {
  return postJson<Lottery>("/concepts/ensembles/forest-lottery", {
    points,
    max_features: maxFeatures,
    n_draws: nDraws,
    seed,
  });
}

export interface SampleCompetition {
  position: number;
  distinct_rows: number;
  board: FeatureBest[];
  winner: string | null;
}

export interface SplitCompetition {
  samples: SampleCompetition[];
  wins: Record<string, number>;
}

export async function holdSplitCompetition(
  points: LabelledPoint[],
  nSamples: number,
  seed = 7,
): Promise<SplitCompetition> {
  return postJson<SplitCompetition>("/concepts/ensembles/split-competition", {
    points,
    n_samples: nSamples,
    seed,
  });
}

export interface SameSampleTree {
  seed: number;
  root_feature: string | null;
  root_threshold: number | null;
  depth: number;
  n_leaves: number;
  predictions: number[];
  regions: RegionGrid;
}

export interface SameSample {
  multiplicities: number[];
  unrestricted_root: string | null;
  trees: SameSampleTree[];
  agreement: number;
}

export async function growOnSameSample(
  points: LabelledPoint[],
  seeds: number[],
): Promise<SameSample> {
  return postJson<SameSample>("/concepts/ensembles/forest-same-sample", {
    points,
    seeds,
  });
}

export interface SeedResult {
  seed: number;
  bagging_out_of_bag: number;
  forest_out_of_bag: number;
  bagging_roots_on_height: number;
  forest_roots_on_height: number;
}

export interface SeedComparison {
  results: SeedResult[];
  mean_difference: number;
}

export async function compareAcrossSeeds(
  points: LabelledPoint[],
  nSeeds: number,
  nMembers: number,
): Promise<SeedComparison> {
  return postJson<SeedComparison>("/concepts/ensembles/forest-seeds", {
    points,
    n_seeds: nSeeds,
    n_members: nMembers,
  });
}

export interface WorldPoint {
  max_features: number;
  mean_strength: number | null;
  error_correlation: number | null;
  out_of_bag: number;
}

export interface SignalWorld {
  name: string;
  description: string;
  sweep: WorldPoint[];
}

export interface SignalWorlds {
  n_rows: number;
  n_features: number;
  n_members: number;
  worlds: SignalWorld[];
}

export async function fetchSignalWorlds(): Promise<SignalWorlds> {
  return getJson<SignalWorlds>("/concepts/ensembles/signal-worlds");
}

export async function fitCommittee(
  kind: "bagging" | "random-forest",
  points: LabelledPoint[],
  nMembers: number,
): Promise<CommitteeAnswer> {
  return postJson<CommitteeAnswer>(`/concepts/ensembles/${kind}`, {
    points,
    n_members: nMembers,
  });
}

export interface BoostingAnswer {
  r_squared: number;
  predictions: number[];
  curve: CurvePoint[];
}

export async function fitBoosting(
  points: Point[],
  rounds: number,
  learningRate: number,
): Promise<BoostingAnswer> {
  return postJson<BoostingAnswer>("/concepts/ensembles/gradient-boosting", {
    points,
    rounds,
    learning_rate: learningRate,
  });
}

// --- The three-dimensional pictures -----------------------------------------

export interface Person3d {
  height: number;
  age: number;
  weight: number;
}

export interface PlaneFit3d {
  height_coefficient: number;
  age_coefficient: number;
  intercept: number;
  r_squared: number;
  fitted: number[];
  heights_axis: number[];
  ages_axis: number[];
  surface: number[][];
}

export async function fitPlane3d(people: Person3d[]): Promise<PlaneFit3d> {
  return postJson<PlaneFit3d>(
    "/concepts/multiple-polynomial-regression/fit-plane",
    { people },
  );
}

export interface LossSurface {
  slopes: number[];
  intercepts: number[];
  rss: number[][];
  minimum: { slope: number; intercept: number; rss: number };
}

export async function lossSurface(points: Point[]): Promise<LossSurface> {
  return postJson<LossSurface>("/concepts/simple-linear-regression/loss-surface", {
    points,
  });
}

export interface LiftedPoint {
  u: number;
  v: number;
  w: number;
  label: number;
}

export interface ClinicLift {
  points: LiftedPoint[];
  plane: { a: number; b: number; c: number; d: number };
  accuracy: number;
}

export async function liftClinic(points: LabelledPoint[]): Promise<ClinicLift> {
  return postJson<ClinicLift>("/concepts/kernel-trick/lift", {
    points,
    kernel: "polynomial",
  });
}

// --- The kernel trick -------------------------------------------------------

export type KernelChoice = "linear" | "polynomial" | "rbf";

export interface KernelAnswer {
  accuracy: number;
  regions: RegionGrid;
}

export async function classifyWithKernel(
  points: LabelledPoint[],
  kernel: KernelChoice,
): Promise<KernelAnswer> {
  return postJson<KernelAnswer>("/concepts/kernel-trick/classify", {
    points,
    kernel,
  });
}

// --- Unsupervised: k-means and principal component analysis ----------------

export interface Clustering {
  labels: number[];
  centres: Point[];
  inertia: number;
  iterations_run: number;
  regions: RegionGrid;
}

export async function clusterPeople(
  points: Point[],
  k: number,
): Promise<Clustering> {
  return postJson<Clustering>("/concepts/k-means/cluster", { points, k });
}

export interface ComponentDocument {
  dx: number;
  dy: number;
  variance: number;
  share: number;
}

export interface PcaAnalysis {
  mean: Point;
  components: ComponentDocument[];
  reconstructions: Point[];
}

export async function analyzeCloud(points: Point[]): Promise<PcaAnalysis> {
  return postJson<PcaAnalysis>("/concepts/pca/analyze", { points });
}

// --- Statistics primer: summaries of a cloud, and draws from a population ---

export interface CloudSummary {
  mean_x: number;
  mean_y: number;
  variance_x: number;
  variance_y: number;
  standard_deviation_x: number;
  standard_deviation_y: number;
  covariance: number;
  correlation: number | null;
}

export async function summarizeCloud(points: Point[]): Promise<CloudSummary> {
  return postJson<CloudSummary>("/primers/statistics/summarize", { points });
}

export interface HistogramBin {
  start: number;
  end: number;
  count: number;
}

export interface BellPoint {
  x: number;
  expected_count: number;
}

export interface SampleDraw {
  values: number[];
  count: number;
  mean: number;
  standard_deviation: number;
  bins: HistogramBin[];
  bell: BellPoint[];
  true_mean: number;
  true_standard_deviation: number;
}

export async function drawSample(
  values: number[],
  draw: number,
  seed: number,
): Promise<SampleDraw> {
  return postJson<SampleDraw>("/primers/statistics/sample", {
    values,
    draw,
    seed,
  });
}

// --- The incremental charts, one quantity assembled piece by piece ----------

export interface DegreeScore {
  degree: number;
  r_squared: number;
}

export async function sweepDegrees(
  points: Point[],
  maxDegree: number,
): Promise<{ scores: DegreeScore[] }> {
  return postJson<{ scores: DegreeScore[] }>(
    "/concepts/multiple-polynomial-regression/degree-sweep",
    { points, max_degree: maxDegree },
  );
}

export interface ShrinkagePath {
  penalties: number[];
  ridge_slopes: number[];
  lasso_slopes: number[];
}

export async function traceShrinkage(points: Point[]): Promise<ShrinkagePath> {
  return postJson<ShrinkagePath>("/concepts/ridge-lasso/shrinkage-path", {
    points,
  });
}

export interface PathStep {
  penalty: number;
  coefficients: number[];
  nonzero_count: number;
  residual_sum_of_squares: number;
  penalty_cost: number;
  objective: number;
  train_r_squared: number;
  held_out_r_squared: number;
}

export interface RegularisationPath {
  names: string[];
  steps: PathStep[];
}

export async function traceRegularisationPath(
  points: Point[],
  model: PenaltyModel,
): Promise<RegularisationPath> {
  return postJson<RegularisationPath>("/concepts/ridge-lasso/regularisation-path", {
    points,
    model,
  });
}

export interface CoefficientPair {
  first: number;
  second: number;
}

export interface GeometrySolutions {
  least_squares: CoefficientPair;
  ridge: CoefficientPair[];
  lasso: CoefficientPair[];
}

export interface PenaltyGeometry {
  first_axis: number[];
  second_axis: number[];
  rss: number[][];
  penalties: number[];
  original: GeometrySolutions;
  perturbed: GeometrySolutions;
}

export async function fetchPenaltyGeometry(): Promise<PenaltyGeometry> {
  return getJson<PenaltyGeometry>("/concepts/ridge-lasso/penalty-geometry");
}

export interface RootCandidate {
  feature: string;
  threshold: number;
  gain: number;
  admitted: boolean;
}

export interface RootSearch {
  candidates: RootCandidate[];
  // Null when no question improves on the parent, which a crossed crowd does.
  best_feature: string | null;
  best_threshold: number | null;
  best_gain: number | null;
}

export async function searchRootCandidates(
  points: LabelledPoint[],
): Promise<RootSearch> {
  return postJson<RootSearch>("/concepts/decision-trees/root-candidates", {
    points,
  });
}

export interface LeaveOutCurve {
  sizes: number[];
  probabilities: number[];
  limit: number;
}

export async function traceLeaveOut(maxCrowd: number): Promise<LeaveOutCurve> {
  return postJson<LeaveOutCurve>("/concepts/ensembles/leave-out-curve", {
    max_crowd: maxCrowd,
  });
}

export interface VarianceCurve {
  correlation: number;
  variances: number[];
}

export interface CommitteeVariance {
  members: number[];
  curves: VarianceCurve[];
}

export async function traceCommitteeVariance(
  maxMembers: number,
): Promise<CommitteeVariance> {
  return postJson<CommitteeVariance>("/concepts/ensembles/committee-variance", {
    max_members: maxMembers,
  });
}

export interface BoostingDescent {
  rounds: number[];
  residual_sums: number[];
}

export async function traceBoostingDescent(
  points: Point[],
  rounds: number,
  learningRate: number,
): Promise<BoostingDescent> {
  return postJson<BoostingDescent>("/concepts/ensembles/boosting-descent", {
    points,
    rounds,
    learning_rate: learningRate,
  });
}

export interface InertiaCurve {
  iterations: number[];
  inertias: number[];
}

export async function traceInertia(
  points: Point[],
  clusterCount: number,
): Promise<InertiaCurve> {
  return postJson<InertiaCurve>("/concepts/k-means/inertia-curve", {
    points,
    n_clusters: clusterCount,
  });
}

export interface SweepComponent {
  angle_degrees: number;
  variance: number;
}

export interface VarianceSweep {
  angles_degrees: number[];
  variances: number[];
  components: SweepComponent[];
}

export async function sweepVariance(points: Point[]): Promise<VarianceSweep> {
  return postJson<VarianceSweep>("/concepts/pca/variance-sweep", { points });
}

export interface SingleVector {
  east: number;
  north: number;
  east_squared: number;
  north_squared: number;
  length_squared: number;
  length: number;
}

export async function measureVector(
  vector: PlanePoint,
): Promise<SingleVector> {
  return postJson<SingleVector>("/primers/linear-algebra/vector", { vector });
}

export interface ValueDescription {
  mean: number;
  deviations: number[];
  deviation_total: number;
  squared_deviations: number[];
  variance: number;
  standard_deviation: number;
}

export async function describeValues(
  values: number[],
): Promise<ValueDescription> {
  return postJson<ValueDescription>("/primers/statistics/describe-values", {
    values,
  });
}

export interface LineSlope {
  rise: number;
  run: number;
  slope: number | null;
}

export async function measureLineSlope(
  first: PlanePoint,
  second: PlanePoint,
): Promise<LineSlope> {
  return postJson<LineSlope>("/primers/calculus/line-slope", { first, second });
}

export interface WalkNode {
  id: number;
  kind: "question" | "answer";
  samples: number;
  feature: string | null;
  threshold: number | null;
  label: number | null;
  left: WalkNode | null;
  right: WalkNode | null;
}

export interface WalkStep {
  node_id: number;
  feature: string;
  threshold: number;
  value: number;
  direction: "left" | "right";
}

export interface TreeWalk {
  tree: WalkNode;
  steps: WalkStep[];
  leaf_id: number;
  prediction: number;
}

export async function walkTree(
  points: LabelledPoint[],
  maxDepth: number,
  visitor: PlanePoint,
): Promise<TreeWalk> {
  return postJson<TreeWalk>("/concepts/decision-trees/walk", {
    points,
    max_depth: maxDepth,
    visitor,
  });
}

// --- Held-out evaluation, the page every other page points at -------------

export interface SplitFit {
  held_out_indices: number[];
  train_r_squared: number;
  held_out_r_squared: number;
  curve: CurvePoint[];
}

export async function fitOnSplit(
  points: Point[],
  degree: number,
): Promise<SplitFit> {
  return postJson<SplitFit>("/concepts/evaluation/split-fit", {
    points,
    degree,
  });
}

export interface GapCurve {
  degrees: number[];
  train_scores: number[];
  held_out_scores: number[];
}

export async function traceGapCurve(points: Point[]): Promise<GapCurve> {
  return postJson<GapCurve>("/concepts/evaluation/degree-curve", { points });
}

export interface DegreeValidation {
  degree: number;
  mean_r_squared: number;
  spread: number;
}

export async function traceValidationCurve(
  points: Point[],
): Promise<{ validations: DegreeValidation[] }> {
  return postJson<{ validations: DegreeValidation[] }>(
    "/concepts/evaluation/validation-curve",
    { points },
  );
}

export interface SimilarityCurve {
  label: string;
  values: number[];
}

export interface KernelSimilarity {
  positions: number[];
  reference: number;
  curves: SimilarityCurve[];
}

export async function traceKernelSimilarity(): Promise<KernelSimilarity> {
  return postJson<KernelSimilarity>(
    "/concepts/kernel-trick/similarity-curve",
    {},
  );
}

// --- Feature scaling: five readings of one column's centre and spread ------

export type ScalingMethod =
  | "standardize"
  | "min_max"
  | "max_abs"
  | "robust"
  | "root_mean_square";

export interface MethodScaling {
  centre: number;
  spread: number;
  scaled: number[];
}

export interface FeatureScalings {
  scalings: Record<ScalingMethod, MethodScaling>;
}

export async function scaleFeature(values: number[]): Promise<FeatureScalings> {
  return postJson<FeatureScalings>("/concepts/feature-scaling/scale", {
    values,
  });
}

// --- Normalisation layers: the same standardising move, inside a model -----

export type NormalisationLayer = "batch" | "layer" | "rms";

// What one band of the block was standardised by. Under the batch layer there
// is one per feature, under the other two one per row. The mean is null for
// the RMS layer, which subtracts nothing, and the deviation is the figure the
// layer divided by, epsilon included.
export interface ReducedStatistic {
  mean: number | null;
  deviation: number;
}

export interface Normalisation {
  layer: NormalisationLayer;
  normalised: number[][];
  statistics: ReducedStatistic[];
  as_predicting: number[][] | null;
  predicting_statistics: ReducedStatistic[] | null;
}

export async function normaliseBlock(
  rows: number[][],
  layer: NormalisationLayer,
): Promise<Normalisation> {
  return postJson<Normalisation>("/concepts/normalisation-layers/normalise", {
    rows,
    layer,
  });
}

// --- Hopfield networks: store patterns, then settle back into one ----------

// One sweep of the update rule over every unit. The state is where the sweep
// left the network; the sweep started from the previous pass's state, or from
// the probe for the first pass.
export interface RecallPassDocument {
  pass_number: number;
  state: number[];
  energy_before: number;
  energy_after: number;
  units_changed: number;
}

// Which stored pattern the network came to rest in. The index is null when
// the resting state equals nothing that was stored, and flipped marks a rest
// in a stored pattern's negation, which the network holds without being asked.
export interface SettledInto {
  pattern_index: number | null;
  flipped: boolean;
}

export interface Recall {
  n_units: number;
  n_stored_patterns: number;
  load: number;
  weights: number[][];
  initial_energy: number;
  passes: RecallPassDocument[];
  settled_state: number[];
  settled: boolean;
  is_fixed_point: boolean;
  settled_into: SettledInto;
}

export async function recallPattern(
  patterns: number[][],
  probe: number[],
): Promise<Recall> {
  return postJson<Recall>("/concepts/hopfield/recall", { patterns, probe });
}

// --- Restricted Boltzmann machines: learn what the patterns have in common --

// One row as the fitted machine reads it. The hidden probabilities are one per
// hidden unit, the reconstruction one per visible cell, both in [0, 1]. The
// free energy is the machine's figure for the row after learning, the initial
// free energy the same figure before any, and the reconstruction error is the
// row's own mean squared distance from its reconstruction.
export interface BoltzmannRowDocument {
  hidden_probabilities: number[];
  reconstruction: number[];
  free_energy: number;
  initial_free_energy: number;
  reconstruction_error: number;
}

// Everything the machine learned and how it now reads each stored pattern.
// The weights have one row per visible cell and one column per hidden unit,
// and converged means the weights stopped moving before the epoch cap, which
// is all it can mean under contrastive divergence.
export interface BoltzmannFit {
  n_visible_units: number;
  n_hidden_units: number;
  epochs_run: number;
  converged: boolean;
  reconstruction_error: number;
  patterns: BoltzmannRowDocument[];
  weights: number[][];
  visible_bias: number[];
  hidden_bias: number[];
}

export async function fitBoltzmann(
  patterns: number[][],
  hiddenUnits: number,
  maxEpochs: number,
): Promise<BoltzmannFit> {
  return postJson<BoltzmannFit>("/concepts/rbm/fit", {
    patterns,
    n_hidden_units: hiddenUnits,
    max_epochs: maxEpochs,
  });
}

// The probe as the machine reads it, beside the stored patterns' free energies
// from the same fit, one per pattern in the order they were sent.
export interface BoltzmannReconstruction {
  probe: BoltzmannRowDocument;
  stored_free_energies: number[];
  epochs_run: number;
  reconstruction_error: number;
}

export async function reconstructWithBoltzmann(
  patterns: number[][],
  hiddenUnits: number,
  maxEpochs: number,
  probe: number[],
): Promise<BoltzmannReconstruction> {
  return postJson<BoltzmannReconstruction>("/concepts/rbm/reconstruct", {
    patterns,
    n_hidden_units: hiddenUnits,
    max_epochs: maxEpochs,
    probe,
  });
}

// --- Self-organising maps: a grid of units draped over the people ----------

// One unit of the fitted map, its place on the grid and where its weights
// came to rest in the plane. The units arrive in row-major order, the first
// grid_width of them the top row.
export interface MapUnitDocument {
  row: number;
  column: number;
  x: number;
  y: number;
}

// The place on the grid of the unit that won one person.
export interface WinningUnit {
  row: number;
  column: number;
}

// The resting map. Winners has one entry per person in the order they were
// sent, epochs_run is how many passes the walk took, final_movement is the
// furthest any unit moved on the last of them, and quantisation_error is the
// mean distance from each person to the unit that won them.
export interface OrganisedMap {
  grid_width: number;
  grid_height: number;
  units: MapUnitDocument[];
  winners: WinningUnit[];
  epochs_run: number;
  final_movement: number;
  quantisation_error: number;
}

export async function organiseMap(
  points: Point[],
  gridWidth: number,
  gridHeight: number,
  maxEpochs: number,
): Promise<OrganisedMap> {
  return postJson<OrganisedMap>("/concepts/self-organising-map/fit", {
    points,
    grid_width: gridWidth,
    grid_height: gridHeight,
    max_epochs: maxEpochs,
  });
}

// --- Hebbian principal components: the PCA answer reached by a local rule --

// One direction the rule learned, at unit length, with the cloud's variance
// along it and that variance's share of the total, both comparable with the
// eigen twin's. The length is how long the learned weight vector was left by
// the walk, which Oja's rule drives to one and nothing normalises, so it is
// the report on whether this direction settled.
export interface HebbianDirectionDocument {
  dx: number;
  dy: number;
  variance: number;
  share: number;
  length: number;
}

// Both answers to one question. The Hebbian and eigen directions are in
// matching order, and angles_degrees holds the angle between each pair, from
// zero to ninety because a direction and its negative are the same direction.
// epochs_run is how many passes the walk took before its weights stopped
// moving or the budget ran out, worst_orthogonality the largest dot product
// between two learned directions, and starting_rate the rate the first epoch
// ran at, which the page works one step of by hand.
export interface HebbianLearning {
  mean: Point;
  hebbian: HebbianDirectionDocument[];
  eigen: ComponentDocument[];
  angles_degrees: number[];
  epochs_run: number;
  worst_orthogonality: number;
  starting_rate: number;
}

export async function learnHebbianDirections(
  points: Point[],
  maxEpochs: number,
): Promise<HebbianLearning> {
  return postJson<HebbianLearning>("/concepts/hebbian-pca/learn", {
    points,
    max_epochs: maxEpochs,
  });
}
