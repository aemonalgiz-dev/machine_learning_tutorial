import type { LessonIntuition, Scene } from "./types";

type RowScene = Extract<Scene, { kind: "strips" }>;
type Arrange = (scene: RowScene) => Scene;
const arrangements: Record<string, Record<number, Arrange>> = {};
const set = (id: string, steps: number[], arrange: Arrange) => {
  for (const index of steps) (arrangements[id] ??= {})[index] = arrange;
};

// Pairing is explicit. Equal-length lists alone do not establish that their
// entries refer to the same observations, dates, features, or text positions.
function align(id: string, steps: number[], labels: string[], rowHeading: string, labelsFrom?: number) {
  set(id, steps, scene => {
    const columns = scene.rows.filter((_, i) => i !== labelsFrom);
    const names = labelsFrom === undefined ? labels : scene.rows[labelsFrom].items;
    if (columns.some(row => row.items.length !== names.length)) throw new Error(`Misaligned demonstration: ${id}`);
    return { kind: "table", caption: scene.caption, rowHeading,
      columns: columns.map(row => row.label),
      records: names.map((label, i) => ({ label, cells: columns.map(row => row.items[i]), active: columns.flatMap((row, col) => row.active?.includes(i) ? [col] : []) })) };
  });
}
function matrix(id: string, steps: number[], columns: string[], rowHeading: string) {
  set(id, steps, scene => {
    if (scene.rows.some(row => row.items.length !== columns.length)) throw new Error(`Wrong matrix headings: ${id}`);
    return { kind: "table", caption: scene.caption, columns, rowHeading,
      records: scene.rows.map(row => ({ label: row.label, cells: row.items, active: row.active })) };
  });
}
function sequence(id: string, steps: number[], positionLabel = "Position") {
  set(id, steps, scene => ({ kind: "sequence", caption: scene.caption, rows: scene.rows, positionLabel }));
}
function flow(id: string, steps: number[]) {
  set(id, steps, scene => ({ kind: "flow", caption: scene.caption, rows: scene.rows }));
}
function numberline(id: string, steps: number[], reference?: number, referenceLabel?: string) {
  set(id, steps, scene => ({ kind: "numberline", caption: scene.caption, reference, referenceLabel,
    rows: scene.rows.map(row => ({ label: row.label, values: row.items.map(value => Number(value.replace("−", "-"))) })) }));
}
const ordinal = (name: string, count: number, start = 1) => Array.from({ length: count }, (_, i) => `${name} ${i + start}`);

// Older lessons: keep the identities that used to be separated into chip rows.
align("statistics", [0], ordinal("Person", 5), "Person");
numberline("statistics", [1], 10, "Both groups centre on 10");
align("linear-algebra", [0], [], "Measurement", 0);
matrix("linear-algebra", [1], ["Height (cm)", "Body mass (kg)", "Age (years)"], "Person");
numberline("centring-on-the-mean", [0], 170, "Training mean: 170 cm");
align("centring-on-the-mean", [1, 2], ordinal("Person", 5), "Same person");
align("the-standard-score", [2], [], "Position relative to the mean", 0);
matrix("feature-scaling", [2], ["Centre or lower endpoint", "Spread or upper endpoint"], "Ruler");
matrix("feature-scaling", [3], ["Preparation", "Prediction model"], "When");
align("logistic-regression", [3], [], "Fixed probability estimate", 0);
matrix("judging-a-classifier", [1], ["Model flags the case", "Model leaves it alone"], "Known answer");
matrix("multiple-polynomial-regression", [1], ["Height (cm)", "Age (years)"], "Person");
matrix("bagging", [1], ordinal("Position", 4), "Sample");
align("feature-importance", [2], ordinal("Row", 3), "Record receiving the value");
matrix("grid-search", [1], ordinal("Evaluation", 3), "Candidate");
matrix("pipelines", [3], ["Preparation fitted here", "Model fitted here"], "Training subset");
matrix("self-organising-map", [0], ["Column 1", "Column 2"], "Map row");
align("transformer-blocks", [0], [], "Token", 0);
align("next-token-prediction", [3], ordinal("Position", 4), "Prediction position");
matrix("neurons-and-activations", [1], ["Measurement", "Controls its contribution"], "Input route");
matrix("dense-layers", [1], ["Input 1", "Input 2"], "Neuron");
align("embedding-layers", [2], ordinal("Position", 3), "Token position");
align("dropout", [1], ["A", "B", "C", "D"], "Activation");
align("template-matching", [2], [], "Window location", 0);
matrix("learning-the-metric-itself", [0], ["Images in the pair", "Supplied answer"], "Training pair");
matrix("learning-the-metric-itself", [1], ["Encoder", "Output"], "Input image");
align("what-a-token-is", [2], [], "Text piece", 0);
align("what-a-token-is", [3], [], "Encoded ID", 0);
align("segmenting-with-a-hidden-model", [0], ordinal("Character", 7), "Text position");
align("random-indexing", [1, 2], ordinal("Coordinate", 4), "Vector coordinate");
align("pooling-a-text", [0], [], "Word", 0);
align("pooling-a-text", [1], ordinal("Coordinate", 2), "Vector coordinate");
align("finite-scalar-quantisation", [2], ordinal("Coordinate", 2), "Coordinate");
matrix("finite-scalar-quantisation", [0], ["Lowest level", "Middle level", "Highest level"], "Coordinate");

// Text is a sequence to read, not a collection of unrelated tags.
const textSequences: Record<string, number[]> = {
  "what-a-token-is": [0, 1], "splitting-on-spaces": [0, 1, 3], "unicode-word-boundaries": [0],
  "penn-treebank-rules": [0, 1, 2], "moses-rules": [0, 1, 2], "the-pattern-language-models-use": [0, 1],
  "bytes-and-characters": [0, 1, 2], "byte-pair-encoding": [0, 1, 2], "wordpiece": [2],
  "sentencepiece": [0, 1, 2, 3], "the-unigram-language-model": [0, 2], "morfessor": [0, 1],
  "finite-state-morphology": [0, 2], "patching-without-a-vocabulary": [0, 1, 2],
  "maximum-matching": [0, 1], "the-word-lattice": [0, 1], "learning-boundaries-from-examples": [0],
  "word2vec": [0], "fasttext": [0, 1], "n-grams": [0, 1], "pooling-a-text": [3],
  "attention": [0], "positional-encoding": [0], "next-token-prediction": [0],
  "autoregressive-generation": [0, 1, 2], "supervised-fine-tuning": [0, 1, 2],
};
for (const [id, steps] of Object.entries(textSequences)) sequence(id, steps);
flow("held-out-evaluation", [1, 2]);
flow("decision-trees", [3]);
flow("gradient-descent-regression", [2]);
flow("pipelines", [0, 1, 2]);
flow("training-a-network", [0, 2]);
flow("neurons-and-activations", [2, 4]);
flow("backpropagation", [0, 2, 4]);
flow("convolutional-networks", [1, 2, 3]);
flow("sampling-and-temperature", [3]);
flow("generative-adversarial-networks", [0]);
flow("diffusion-models", [3]);
flow("supervised-fine-tuning", [3]);
flow("k-means", [3]);

// NumPy: names and axes stay attached to numbers throughout the example.
const greenhouses = ["North", "Middle", "South"];
align("numpy-arrays", [0], [], "Greenhouse", 0);
align("numpy-arrays", [1, 2], greenhouses, "Greenhouse");
matrix("numpy-axes", [0], greenhouses, "Day");
matrix("numpy-axes", [1], ["Monday", "Tuesday"], "Greenhouse");
matrix("numpy-creation", [0], ["Column 0", "Column 1", "Column 2"], "Day");
align("numpy-creation", [1], greenhouses, "Greenhouse");
sequence("numpy-creation", [2], "Reading");
matrix("numpy-indexing", [0], greenhouses, "Day");
sequence("numpy-indexing", [1, 2], "Requested position");
sequence("numpy-reshaping", [0], "Logger position");
matrix("numpy-reshaping", [1], greenhouses, "Day");
matrix("numpy-reshaping", [2], ["Monday", "Tuesday"], "Greenhouse");
matrix("numpy-broadcasting", [0, 1, 2], greenhouses, "Day or reference");
align("numpy-masks", [0, 1], ordinal("Position", 4, 0), "Original array position");
align("numpy-masks", [2], ["Position 1", "Position 2"], "Original array position");
align("numpy-reductions", [0], ordinal("Position", 4, 0), "Array position");
align("numpy-reductions", [2], ordinal("Rank", 4), "Ascending order");
align("numpy-vectorisation", [0, 1, 2], greenhouses, "Greenhouse");
matrix("numpy-linear-algebra", [0], ["Temperature", "Humidity"], "Greenhouse");
align("numpy-linear-algebra", [2], ["North", "South"], "Greenhouse");
align("reproducible-sampling", [0], [], "Original index", 0);
align("reproducible-sampling", [1, 2], ordinal("Draw", 3), "Draw (repeats allowed)");
align("numpy-functions", [0], greenhouses, "Greenhouse");
align("numpy-functions", [2], ["Freezing reference", "Boiling reference"], "Conversion check");
matrix("numpy-saving-data", [0], ["Temperature", "Humidity"], "Greenhouse");
align("numpy-saving-data", [2], ["North", "South"], "Greenhouse");
align("missing-measurements", [0], ordinal("Reading", 3), "Training record");
align("missing-measurements", [2], ordinal("Reading", 2), "New record");
matrix("categorical-encoding", [1, 2], ["Glass?", "Plastic?", "Mesh?"], "Roof material");
sequence("record-quality", [0, 1], "Record");
align("data-leakage", [2], ["Morning (09:00)", "Noon (12:00)", "Repair report (18:00)"], "Available by noon?");
align("baseline-predictions", [1, 2], ordinal("Held-out reading", 2), "Same observation");
align("learning-curves", [2], ["10 examples", "50 examples", "100 examples"], "Training set size");
align("decision-thresholds", [0, 2], ordinal("Sensor", 3), "Same sensor");
align("probability-calibration", [0, 1], ordinal("Sensor", 4), "Same sensor");
align("distribution-shift", [0, 1], ordinal("Category", 3), "Same category");
matrix("bootstrap-uncertainty", [1], ordinal("Draw", 3), "Resample");
align("bootstrap-uncertainty", [2], ordinal("Resample", 3), "Resample");
align("likelihood", [1], ordinal("Candidate", 2), "Probability rule");
sequence("likelihood", [0], "Trial");
matrix("naive-bayes", [0], ["Warm", "Unstable"], "Possible cause");
align("naive-bayes", [2], ["Faulty", "Working"], "Cause");
align("support-vector-machines", [2], ordinal("Example", 3), "Example");
align("density-based-clustering", [1], ordinal("Device", 7), "Device");
align("transfer-learning", [2], ordinal("Feature", 2), "Feature coordinate");

// Advanced paths use the same reading conventions as the primers.
matrix("states-actions-and-transitions", [1], ["Next: dry", "Next: moist"], "Chosen action");
align("discounted-returns", [0, 1], ["Now", "One step later", "Two steps later"], "Reward time");
align("distributions-and-expectations", [1], ["0 damaged", "1 damaged", "2 damaged"], "Possible delivery");
align("gaussian-sensor-fusion", [0, 1], ["Instrument A", "Instrument B"], "Instrument");
align("hidden-state-filtering", [0, 1], ["Working", "Faulty"], "Possible state");
align("adaptive-gradients", [0, 1, 2], ordinal("Parameter", 2), "Parameter");
matrix("popularity-baselines", [0], ["Guide 0", "Guide 1", "Guide 2"], "Reader");
align("popularity-baselines", [1], ordinal("Guide", 3, 0), "Guide");
align("popularity-baselines", [2], ordinal("Rank", 3), "Most opened first");
matrix("content-based-ranking", [0, 1], ["Topic coordinate 1", "Topic coordinate 2"], "Representation");
align("content-based-ranking", [2], ["Guide A", "Guide B"], "Guide");
align("collaborative-filtering", [0, 1], ["Neighbour A", "Neighbour B"], "Reader");
align("recommendation-factorisation", [0], ordinal("Coordinate", 2), "Latent coordinate");
align("ranking-evaluation", [0], ordinal("Rank", 3), "Displayed position");
align("local-density-anomalies", [0, 1, 2], ["Point 0", "Point 1", "Point 10"], "Original point");
align("isolation-forests", [2], ["0", "1", "2", "3", "20"], "Original reading");
align("reconstruction-alerts", [0, 1], ordinal("Feature", 2), "Prepared feature");
matrix("confounding-and-comparisons", [1], ["Extra water", "Usual water"], "Starting soil");
numberline("randomised-experiments", [0]);
align("causal-adjustment", [0, 1], ["Dry soil", "Moist soil"], "Starting soil");
align("treatment-effects-and-overlap", [0, 1], ordinal("Bed", 2), "Observed bed");
align("saving-fitted-pipelines", [0, 1], ordinal("Feature", 2), "Feature");
align("prediction-input-contracts", [1], [], "Saved feature order", 0);
align("serving-predictions", [2], ordinal("Request row", 2), "Input row");
align("model-versioning", [0], ordinal("Feature", 2), "Feature coefficient");
align("monitoring-and-rollback", [1], ordinal("Prediction", 2), "Matching record");
align("project-sensor-investigation", [1, 2], ordinal("Record", 3), "Same record");
align("project-demand-forecast", [1], ["Day 2", "Day 3", "Day 4", "Day 5"], "Target day");

type Override = Partial<LessonIntuition["steps"][number]>;
const demonstrations: Record<string, Record<number, Override>> = {};
const replace = (id: string, index: number, scene: Scene, explanation?: string) => {
  (demonstrations[id] ??= {})[index] = { scene, ...(explanation ? { explanation } : {}) };
};
const table = (caption: string, rowHeading: string, columns: string[], rows: [string, string[]][]): Scene => ({
  kind: "table", caption, rowHeading, columns, records: rows.map(([label, cells]) => ({ label, cells })),
});
const calculation = (id: string, index: number, caption: string, ...lines: string[]) => replace(id, index, { kind: "calculation", caption, lines });
const timeline = (id: string, index: number, values: (number | undefined)[], known: number, caption: string, prediction?: { label: string; value: number }, firstDay = 1) => replace(id, index, {
  kind: "timeline", unit: "litres", caption, prediction,
  days: values.map((value, day) => ({ label: `Day ${day + firstDay}`, value: day < known ? value : undefined, role: day < known ? "known" : day === known ? "target" : "later" })),
});

// Follow one clock and keep later answers concealed until they have arrived.
replace("recurrent-layers", 0, { kind:"plot", caption:"Green rises from 18 to 20; rose falls from 22 to 20. The final reading alone cannot distinguish these histories.", xLabel:"Reading in time order", yLabel:"Temperature", bounds:[1,3,18,22], points:[[1,18,2],[2,19,2],[3,20,2],[1,22,3],[2,21,3]], paths:[[[1,18],[2,19],[3,20]],[[1,22],[2,21],[3,20]]] });
timeline("rolling-forecast-validation", 0, [5, 7, 6, undefined, undefined], 3,
  "We are at the end of day 3. The first forecast can use only the three measurements before the boundary.", { label: "Day 4 prediction: copy day 3", value: 6 });
timeline("rolling-forecast-validation", 1, [5, 7, 6, 9, undefined], 4,
  "Day 4 has now arrived: demand was 9 litres. That reading can help predict day 5, but it could not help predict itself.", { label: "Day 5 prediction: copy day 4", value: 9 });
demonstrations["rolling-forecast-validation"][0].explanation = "Imagine stopping the record at the end of day 3. Botie has three measurements and needs a prediction for day 4. Copying the latest reading gives us a simple rule to test. Keep tomorrow's answer covered until tomorrow arrives.";
demonstrations["rolling-forecast-validation"][1].explanation = "Now let one day pass. We can check the earlier prediction against day 4's reading, add that reading to the history, and make a new prediction for day 5. The boundary moves; information never travels backwards through it.";
replace("rolling-forecast-validation", 2, table(
  "Read across one target day at a time. Both rules were given the same past measurements and judged against the same later answer.", "Target day", ["Later observation", "Copy latest", "Mean of last two", "Absolute errors: latest / mean"], [
    ["Day 4", ["9 litres", "6 litres", "6.5 litres", "3 / 2.5 litres"]],
    ["Day 5", ["8 litres", "9 litres", "7.5 litres", "1 / 0.5 litres"]],
  ]), "We have now waited for both target days. Put each prediction beside the observation it was meant to predict. A trailing-two mean is another possible rule: it averages the two latest readings available at each boundary.");
timeline("forecasting-baselines", 0, [10, 12, 11, undefined], 3, "Three recorded days, followed by one day we cannot see yet.");
timeline("forecasting-baselines", 1, [10, 12, 11, undefined], 3, "The prediction belongs to day 4. Its input comes from day 3.", { label: "Day 4 prediction", value: 11 });
calculation("forecasting-baselines", 2, "The error measures how far the saved prediction missed the later observation.", "Day 4 prediction: 11 litres", "Day 4 observation: 14 litres", "Absolute error = |14 − 11| = 3 litres");
timeline("lagged-features", 0, [4, 6, undefined, undefined], 2, "The two preceding days become the inputs for day 3.");
timeline("lagged-features", 1, [6, 5, undefined], 2, "Move the two-day window forward. Day 3 is now an input for day 4.", undefined, 2);
replace("lagged-features", 2, table("Each row is one prediction made before its target arrived.", "Predicting", ["Older input", "Recent input", "Later target"], [["Day 3", ["Day 1: 4", "Day 2: 6", "5"]], ["Day 4", ["Day 2: 6", "Day 3: 5", "9"]]]));
replace("seasonality-and-differencing", 0, { kind: "plot", caption: "The daily level rises by the same amount each time.", xLabel: "Day", yLabel: "Recorded level", points: [[1,10],[2,12],[3,14],[4,16]], paths: [[[1,10],[2,12],[3,14],[4,16]]] });
calculation("seasonality-and-differencing", 1, "Taking neighbouring differences removes this constant rise from the level series.", "Day 2 minus day 1: 12 − 10 = 2", "Day 3 minus day 2: 14 − 12 = 2", "Day 4 minus day 3: 16 − 14 = 2");
calculation("seasonality-and-differencing", 2, "For this two-position cycle, compare each reading with the same position one cycle earlier.", "Cycle 1: 10, 20", "Cycle 2: 12, 22", "First position: 12 − 10 = 2", "Second position: 22 − 20 = 2");
calculation("exponential-smoothing", 1, "The update fraction controls how far the stored estimate moves towards the new reading.", "Stored level: 10", "New reading: 14", "Fraction to use: 0.25", "Change = 0.25 × (14 − 10) = 1");
calculation("exponential-smoothing", 2, "Carry this updated level into the next prediction, before the next reading arrives.", "Updated level = 10 + 1 = 11", "Next forecast = 11");
replace("autoregressive-forecasting", 0, table("Both lag columns precede the target in time.", "Training row", ["Older reading", "Recent reading", "Next reading"], [["1", ["2","3","4"]], ["2", ["3","4","5"]], ["3", ["4","5","6"]]]));
calculation("autoregressive-forecasting", 2, "For the following horizon, the new window contains a prediction, not a newly observed measurement.", "Known window: [8, 12]", "Next prediction = (0.25 × 8) + (0.75 × 12) + 1 = 12", "Next window: [12 observed, 12 predicted]");
timeline("project-demand-forecast", 0, [2,4,6,8,10,undefined], 5, "The record stops before the next day's demand. Fit and predict using the available history.");

// Keep observations visible while showing masks, broadcasts and indexing.
for (let i = 0; i < 3; i++) replace("numpy-arrays", i, table(
  i === 0 ? "Each row keeps a greenhouse beside its reading." : i === 1 ? "Apply the same rule independently to each greenhouse." : "The converted readings retain the original greenhouse order.",
  "Greenhouse", i === 0 ? ["Celsius"] : i === 1 ? ["Celsius", "Conversion"] : ["Celsius", "Fahrenheit"], greenhouses.map((name, j) => [name,
    i === 0 ? [String([12,18,24][j])] : i === 1 ? [String([12,18,24][j]), `(${[12,18,24][j]} × 1.8) + 32`] : [String([12,18,24][j]), String([53.6,64.4,75.2][j])]])));
for (let i = 0; i < 3; i++) replace("numpy-masks", i, table(i === 0 ? "Keep each temperature beside its original position before applying the condition." : "The condition stays beside the reading it describes. Positions 1 and 2 survive the selection.", "Original position", i === 0 ? ["Temperature"] : ["Temperature", "At least 25?", "Keep?"], [20,27,25,18].flatMap((value, j) => i === 2 && value < 25 ? [] : [[String(j), i === 0 ? [String(value)] : [String(value), String(value >= 25), value >= 25 ? "Keep" : "Leave out"]] as [string, string[]]])));
replace("numpy-indexing", 1, table("The slice [0:2] stops before position 2. It retains the original order.", "Selected row", greenhouses, [["0: Monday", ["10","20","30"]], ["1: Tuesday", ["14","22","36"]]]));
replace("numpy-indexing", 2, table("A gather [2, 0] follows the requested order, so Wednesday comes first.", "Selected row", greenhouses, [["2: Wednesday", ["16","24","38"]], ["0: Monday", ["10","20","30"]]]));
replace("numpy-broadcasting", 1, table("One target for each column is reused across both days. NumPy does not mix the greenhouses.", "Greenhouse", ["Monday", "Target used Monday", "Tuesday", "Target used Tuesday"], [["North",["12","10","14","10"]],["Middle",["18","20","22","20"]],["South",["24","30","36","30"]]]));
calculation("numpy-linear-algebra", 1, "Temperature and humidity have separate coefficients; the offset is added after their contributions are combined.", "Temperature contribution = temperature × 2", "Humidity contribution = humidity × 0.1", "Score = temperature contribution + humidity contribution + 3");
calculation("discounted-returns", 2, "A later reward contributes less under this chosen discount. Add contributions only after weighting them.", "Now: −1 × 1 = −1", "One step later: 0 × 0.5 = 0", "Two steps later: 4 × 0.25 = 1", "Return = −1 + 0 + 1 = 0");
replace("bellman-value-iteration", 1, table("Each action has both an immediate reward and a discounted continuation.", "Action", ["Immediate reward", "Later value", "Discount", "Complete score"], [["First",["3","2","0.5","3 + (0.5 × 2) = 4"]],["Second",["0","6","0.5","0 + (0.5 × 6) = 3"]]]));
calculation("q-learning", 1, "Use the best available next-state action value, discounted here by 0.5. This transition is not terminal.", "Best next action value = max(4, 6) = 6", "Target = 1 + (0.5 × 6) = 4", "Difference = 4 − 2 = 2");
calculation("q-learning", 2, "At a learning rate of 0.25, change only the entry for the state and action just experienced.", "Old estimate: 2", "Update = 0.25 × 2 = 0.5", "New estimate = 2 + 0.5 = 2.5");
replace("minibatch-gradients", 0, table("Use the current weight of 1 to make a prediction for each observation.", "Observation", ["Input x", "Target y", "Prediction (1 × x)"], [["1",["1","2","1"]],["2",["2","4","2"]]]));
align("minibatch-gradients", [1], ordinal("Observation", 2), "Same observation");
calculation("minibatch-gradients", 2, "Average the example gradients before taking this update. The batch size should not silently multiply the step size.", "Mean gradient = (−1 + −4) / 2 = −2.5", "Learning rate = 0.1", "New weight = 1 − (0.1 × −2.5) = 1.25");
const losses = [[0,.9],[1,.6],[2,.4],[3,.3]];
const heldOut = [[0,.8],[1,.5],[2,.55],[3,.6]];
for (let i = 0; i < 3; i++) replace("training-diagnostics", i, { kind: "plot", caption: i === 0 ? "Green: training loss. Rose: validation loss. Only the training curve continues improving." : "The lowest validation loss is at epoch 1. Later training improvements do not improve these held-out examples.", xLabel: "Epoch (zero based)", yLabel: "Loss", points: i ? [[1,.5,3]] : [], labels: i ? ["Keep epoch 1"] : [], paths: [losses,heldOut], bounds: [0,3,.2,1] });
numberline("isolation-forests", [0]);
replace("isolation-forests", 1, { kind: "numberline", caption: "A split at 10 isolates the reading 20 immediately. The four nearby readings still need further splits.", reference: 10, referenceLabel: "Split at 10", rows: [{label:"Below 10",values:[0,1,2,3]},{label:"At least 10",values:[20]}] });
replace("robust-anomaly-scores", 0, { kind: "numberline", caption: "The value 100 lies far from the other readings. The middle ordered observation is still 10.", reference:10, referenceLabel:"Median: 10", rows:[{label:"Reference readings",values:[8,9,10,11,100]}] });
replace("robust-anomaly-scores", 1, table("Sort these distances to find their middle value, 1. That is the median absolute deviation (MAD).", "Reading", ["Distance from median 10"], [["8",["2"]],["9",["1"]],["10",["0"]],["11",["1"]],["100",["90"]]]));

// Graphs start from connected objects before introducing a storage table.
const nodes = ["0: intake", "1: pump", "2: outlet"];
const network = (caption: string, values: string[] = [], edges: [number, number][] = [[0,1],[1,2]]): Scene => ({ kind:"network", caption, nodes:nodes.map((label,i)=>({label,value:values[i]})), edges });
replace("graph-representations", 0, network("Three physical parts become three named nodes. We have not added the connections yet.", [], []));
replace("graph-representations", 1, network("An edge records a connection between two parts. Here the connections are undirected."));
matrix("graph-representations", [2], nodes, "Connected from");
replace("graph-random-walks", 0, network("All probability starts at the intake.", ["Probability: 1","Probability: 0","Probability: 0"]));
replace("graph-random-walks", 1, network("At the pump, choose either adjacent node with equal probability.", ["Next: 0.5","Starting here","Next: 0.5"]));
align("graph-random-walks", [2], nodes, "Node");
replace("neighbour-aggregation", 0, network("Each node holds its own measurement. Edges tell us which other measurements it can receive.", ["Own reading: 2","Own reading: 8","Own reading: 4"]));
replace("neighbour-aggregation", 1, network("The pump receives 2 from the intake and 4 from the outlet. Each endpoint receives only the pump's 8.", ["Receives: 8","Receives: 2 and 4","Receives: 8"]));
replace("neighbour-aggregation", 2, table("Average only the neighbouring readings. The output row still belongs to the receiving node.", "Receiving node", ["Neighbour readings", "Neighbour mean"], [[nodes[0],["8","8"]],[nodes[1],["2, 4","(2 + 4) / 2 = 3"]],[nodes[2],["8","8"]]]));
replace("graph-convolution", 0, table("Adding self-connections lets each node retain its own feature while receiving its neighbour's.", "Receiving node", ["Node 0", "Node 1"], [["Node 0",["1","1"]],["Node 1",["1","1"]]]));
replace("graph-convolution", 1, table("Both degrees are 2 in this example, so each contribution receives a weight of one half.", "Receiving node", ["From node 0", "From node 1"], [["Node 0",["0.5","0.5"]],["Node 1",["0.5","0.5"]]]));
calculation("graph-convolution", 2, "Both nodes receive the same mixture in this tiny fully connected graph. The learned scalar weight then scales that mixture.", "Node readings: 2 and 4", "Mixed feature = (0.5 × 2) + (0.5 × 4) = 3", "Output at each node = 3 × 2 = 6");
replace("serving-predictions", 0, table("Two records enter together. Column meanings must stay in the saved order.", "Request row", ["Feature 1", "Feature 2"], [["1",["1","2"]],["2",["3","4"]]]));
const seedImage = [[0,9,9,0,0],[0,9,9,0,8],[0,0,0,0,0],[7,7,0,8,8]];
replace("project-seed-counting", 0, {kind:"tiles",caption:"Each number is a pixel intensity. Three larger bright regions and one isolated bright pixel are visible.",showValues:true,panels:[{label:"Tray image",cells:seedImage,maximum:9}]});
replace("project-seed-counting", 1, {kind:"tiles",caption:"Values above 5 become foreground. Foreground cells touch along edges; the isolated bright pixel forms its own one-cell region.",showValues:true,panels:[{label:"Foreground mask",cells:seedImage.map(row=>row.map(v=>v>5?1:0))}]});
replace("project-seed-counting", 2, table("Requiring at least two pixels removes the isolated bright pixel. Three regions remain.", "Region", ["Pixels", "Count as a seed?"], [["Top",["4","Yes"]],["Isolated pixel",["1","No"]],["Lower left",["2","Yes"]],["Lower right",["2","Yes"]]]));

// Small worked calculations keep their inputs and intermediate steps together.
calculation("feature-scaling", 0, "The person has not changed. Only the unit used to record the height has changed.", "Height in metres: 1.70", "Centimetres = 1.70 × 100 = 170");
replace("shapes-and-flattening", 1, table("Read the first row from left to right, then continue along the second. Each cell keeps its value but receives a new flat position.", "Flat position", ["Grid address (zero based)", "Value"], [["0",["Row 0, column 0","0"]],["1",["Row 0, column 1","1"]],["2",["Row 0, column 2","0"]],["3",["Row 1, column 0","1"]],["4",["Row 1, column 1","1"]],["5",["Row 1, column 2","0"]]]));
sequence("hashing-characters", [0], "Available entry");
matrix("hashing-characters", [1,2], ["Destination"], "Input");
replace("moving-a-vocabulary", 0, table("Keep the word beside the row that holds its vector.", "Word", ["Old row"], [["cat",["2"]],["dog",["3"]]]));
replace("moving-a-vocabulary", 1, table("The word identifies the vector to copy. A new row number does not create a new meaning.", "Word", ["Old row", "New row"], [["cat",["2","5"]],["dog",["3","2"]],["kitten",["No old entry","6"]]]));
replace("a-vector-for-a-word", 0, table("These IDs are addresses. Cat and invoice have neighbouring IDs here, which tells us nothing about their meanings.", "Word", ["Vocabulary ID"], [["cat",["103"]],["kitten",["814"]],["invoice",["104"]]]));
calculation("numpy-axes", 2, "Average across greenhouse columns to produce one summary for each day.", "Monday = (10 + 20 + 30) / 3 = 20", "Tuesday = (14 + 22 + 36) / 3 = 24");
replace("numpy-reductions", 1, table("The maximum is a measurement. Its index tells us where that measurement was stored.", "Array position", ["Temperature", "Largest?"], [["0",["20","No"]],["1",["27","Yes: maximum 27, index 1"]],["2",["25","No"]],["3",["18","No"]]]));
calculation("numpy-numerical-checks", 0, "First measure the disagreement, rather than relying on the way rounded output looks.", "Reference: 20", "Calculated: 20.0001", "Absolute difference = |20.0001 − 20| = 0.0001");
calculation("numpy-numerical-checks", 1, "Under this declared absolute tolerance, the calculated value is close enough.", "Absolute difference: 0.0001", "Allowed difference: 0.001", "0.0001 ≤ 0.001: passes");
calculation("numpy-functions", 1, "The scale and offset are separate parts of the Celsius-to-Fahrenheit conversion.", "Scale Celsius by 1.8", "Then add 32", "For 12 °C: (12 × 1.8) + 32 = 53.6 °F");
replace("numpy-saving-data", 1, table("The names label observations; the weights label feature columns. Keep both meanings when saving the arrays.", "Saved item", ["Meaning", "Contents"], [["Weights",["Temperature, then humidity","[2, 0.1]"]],["Names",["Observation order","[north, south]"]]]));
calculation("missing-measurements", 1, "Estimate the replacement from the recorded training values. The missing entry contributes no measured value to this average.", "Observed training readings: 10 and 14", "Replacement = (10 + 14) / 2 = 12");
sequence("cyclical-features", [0], "Consecutive hour");
calculation("record-quality", 2, "The second copy of event 102 adds a row, but it does not describe a new event.", "Imported IDs: [101, 102, 102, 103]", "Rows: 4", "Distinct events: 3", "Excess copies = 4 − 3 = 1");
replace("data-leakage", 1, table("At noon, the repair report is still in the future. It must stay outside this prediction's inputs.", "Field", ["Became available", "Known by 12:00?"], [["Morning reading",["09:00","Yes"]],["Noon reading",["12:00","Yes"]],["Repair report",["18:00","No"]]]));
replace("class-imbalance", 0, {kind:"bars",caption:"Most recorded sensors are healthy. A rule can therefore appear accurate while missing every failure.",items:[{label:"Healthy sensors",value:95},{label:"Failed sensors",value:5}]});
replace("class-imbalance", 1, table("Check the rule separately on each known class, rather than letting the larger group hide the other one.", "Known class", ["Available examples", "Correctly identified"], [["Healthy",["95","95"]],["Failed",["5","0"]]]));
calculation("class-imbalance", 2, "Recall asks how much of each actual class was recovered.", "Healthy recall = 95 / 95 = 1.0", "Failure recall = 0 / 5 = 0.0");
calculation("baseline-predictions", 0, "Store this mean before inspecting the held-out temperatures.", "Training temperatures: [10, 14, 18]", "Reference = (10 + 14 + 18) / 3 = 14");
sequence("learning-curves", [0], "Training run");
matrix("decision-thresholds", [1], ["Cost in the example"], "Mistake");
calculation("probability-calibration", 2, "The model estimated an 80% failure probability for each of these four sensors. Two actually failed. This tiny group illustrates the comparison; it is not enough to establish calibration.", "Mean estimated probability = (0.8 + 0.8 + 0.8 + 0.8) / 4 = 0.8", "Observed failure frequency = (1 + 0 + 1 + 0) / 4 = 0.5");
calculation("distribution-shift", 2, "Half the summed absolute share changes counts the mass that moved, without counting its departure and arrival twice.", "Absolute changes: [0.4, 0.4, 0]", "Total variation distance = (0.4 + 0.4 + 0) / 2 = 0.4");
align("bootstrap-uncertainty", [0], ordinal("Reading",3), "Original record");
replace("conditional-probability", 0, {kind:"bars",caption:"Start with all 1,000 sensors. Faults are rare in this invented population.",items:[{label:"Faulty",value:10},{label:"Working",value:990}]});
replace("conditional-probability", 1, table("Both groups can produce an alarm. The large working group contributes more alarms, even though a single working sensor rarely alarms.", "Actual condition", ["Sensors", "Alarmed", "Did not alarm"], [["Faulty",["10","9","1"]],["Working",["990","99","891"]]]));
calculation("conditional-probability", 2, "The question determines the group in the denominator. Finding most faults is different from most alarms being faults.", "All alarms = 9 + 99 = 108", "Faulty among alarms = 9 / 108 ≈ 0.0833", "Alarms among faulty sensors = 9 / 10 = 0.9");
calculation("likelihood", 2, "For two successes followed by one failure, this fitted probability gives the displayed sequence likelihood.", "Success probability = 2 / 3", "Failure probability = 1 / 3", "Sequence likelihood = (2 / 3) × (2 / 3) × (1 / 3) ≈ 0.1481");
calculation("naive-bayes", 1, "The naive Bayes assumption lets us multiply the two feature probabilities within each possible cause.", "Faulty: 0.8 × 0.7 = 0.56", "Working: 0.1 × 0.2 = 0.02");
sequence("hierarchical-clustering", [0,1], "Group");
replace("hierarchical-clustering", 2, table("Stopping between join distances 2 and 6 keeps two groups. Joining at distance 6 would combine them.", "Cut", ["Groups left"], [["Above 2, below 6",["{0, 1} and {7, 9}"]],["At least 6",["{0, 1, 7, 9}"]]]));
replace("images-as-arrays", 1, {kind:"tiles",caption:"Addresses start at zero. Row 1, column 1 is the highlighted centre pixel, whose stored value is 220.",showValues:true,panels:[{label:"Find row 1, column 1",cells:[[10,20,10],[20,220,30],[10,200,20]],maximum:255,selected:[4]}]});
replace("image-thresholding", 2, {kind:"bars",caption:"The seed in shadow is darker than the lit tray. A brightness threshold alone cannot reliably distinguish them here.",items:[{label:"Shadowed seed",value:80},{label:"Lit tray",value:110}]});
calculation("bounding-boxes", 2, "The union includes both boxes but counts their intersection only once.", "First box area: 16", "Second box area: 16", "Shared area: 8", "Union = 16 + 16 − 8 = 24", "Intersection over union = 8 / 24 ≈ 0.3333");
replace("non-maximum-suppression", 1, table("Choose A first because it has the largest score. Then inspect overlap with that selected box.", "Candidate", ["Score", "Relationship to A"], [["A (index 0)",["0.9","Selected first"]],["B (index 1)",["0.8","Large overlap"]],["C (index 2)",["0.7","No overlap"]]]));
replace("non-maximum-suppression", 2, table("Keep the strongest representative of the overlapping pair, then retain the separate candidate.", "Candidate", ["Decision"], [["A (index 0)",["Keep"]],["B (index 1)",["Remove: overlaps selected A"]],["C (index 2)",["Keep"]]]));
matrix("autoregressive-forecasting", [1], ["Coefficient"], "Part of the prediction");
sequence("exploration-and-bandits", [0], "Observed reward");
calculation("exploration-and-bandits", 1, "The first reward made schedule B look promising. A second observation changes its estimate, which is why the amount of experience matters.", "B's first reward: 7", "B's next reward: 3", "Updated mean = (7 + 3) / 2 = 5");
calculation("states-actions-and-transitions", 2, "Weight each possible next state's value by the probability of reaching it after watering.", "Dry: probability 0.1, value 0", "Moist: probability 0.9, value 10", "Expected later value = (0.1 × 0) + (0.9 × 10) = 9");
align("bellman-value-iteration", [0], ["First continuation", "Second continuation"], "Possible continuation");
replace("bellman-value-iteration", 2, table("Compare the immediate reward together with the discounted value of what follows. Choose the larger complete score.", "Action", ["Complete score", "Choice"], [["First",["4","Choose"]],["Second",["3","Do not choose"]]]));
replace("q-learning", 0, {kind:"flow",caption:"This is one observed transition. Only the experienced state-action entry will be updated.",rows:[{label:"Before taking the action",items:["Stored estimate Q(s,a): 2"]},{label:"Take the action and observe",items:["Reward received: 1"]},{label:"Inspect the state reached",items:["Next action A has value 4","Next action B has value 6"]}]});
sequence("distributions-and-expectations", [0], "Possible count");
calculation("distributions-and-expectations", 2, "The expected count averages across many possible deliveries. A single delivery still contains a whole number of damaged sensors.", "Expected damage = (0 × 0.5) + (1 × 0.3) + (2 × 0.2) = 0.7", "Most likely individual count: 0 (probability 0.5)");
replace("parameter-posteriors", 0, table("These prior parameters describe uncertainty about the failure rate before this batch is observed.", "Beta parameter", ["Value"], [["Alpha",["1"]],["Beta",["1"]]]));
calculation("parameter-posteriors", 1, "A failure increments alpha; a working sensor increments beta. Keep those observations separate from the prior parameters.", "Observed trials: failure, working, working", "New alpha = 1 + 1 = 2", "New beta = 1 + 2 = 3");
calculation("parameter-posteriors", 2, "The posterior predictive probability uses both updated parameters.", "Next failure probability = alpha / (alpha + beta)", "Next failure probability = 2 / (2 + 3) = 0.4");
calculation("gaussian-sensor-fusion", 2, "The more precise instrument contributes more to the combined estimate, under the independent Gaussian measurement assumptions.", "Estimate = (0.8 × 20) + (0.2 × 24) = 20.8", "Combined variance = 1 / (1 + 0.25) = 0.8");
calculation("hidden-state-filtering", 2, "Divide by the sum of the two evidence weights so the current-state probabilities sum to one.", "Total weight = 0.076 + 0.216 = 0.292", "Fault probability = 0.216 / 0.292 ≈ 0.740", "Working probability = 0.076 / 0.292 ≈ 0.260");
calculation("gaussian-process-regression", 0, "For this one-observation example, include both the function covariance and measurement noise in the training denominator.", "Training function covariance: 1.0", "Measurement noise variance: 0.25", "Combined denominator = 1.0 + 0.25 = 1.25");
calculation("gaussian-process-regression", 1, "The query's covariance with the observed location controls how much that measurement contributes.", "Observed residual: 2", "Query-to-training covariance: 0.5", "Mean contribution = 0.5 × (2 / 1.25) = 0.8");
calculation("gaussian-process-regression", 2, "Starting from latent query variance 1, the measurement reduces uncertainty. This is latent variance; future measurement noise is separate.", "Posterior mean: 0.8", "Latent variance = 1 − ((0.5 × 0.5) / 1.25) = 0.8");
calculation("momentum-updates", 0, "The previous velocity points one way; the current gradient points the other. The retained fraction decides how they combine.", "Previous velocity: 2", "Current gradient: −1");
calculation("momentum-updates", 1, "Under the lesson's velocity rule, retaining half the previous velocity exactly cancels the current gradient in this example.", "Retained fraction beta: 0.5", "New velocity = (0.5 × 2) + (−1) = 0");
calculation("momentum-updates", 2, "A zero velocity means this particular update leaves the weight where it was.", "Old weight: 4", "New weight = 4 − (learning rate × 0) = 4");
calculation("initialisation-and-gradient-checks", 0, "This loss has a known minimum at 3. At weight 1, we can independently check which direction lowers it.", "Loss(w) = (w − 3)²", "Test weight: 1", "Loss(1) = (1 − 3)² = 4");
calculation("initialisation-and-gradient-checks", 1, "Measure the change across two nearby weights and divide by their separation.", "Step h = 0.00001", "Loss(1 + h) = 3.9999600001", "Loss(1 − h) = 4.0000400001", "Central difference = (3.9999600001 − 4.0000400001) / 0.00002 ≈ −4");
calculation("initialisation-and-gradient-checks", 2, "Both routes give the same local slope within numerical tolerance. This checks the derivative calculation.", "Analytical derivative = 2 × (1 − 3) = −4", "Numerical derivative ≈ −4");
calculation("collaborative-filtering", 2, "Weight the neighbours' deviations from their own baselines, then add the target reader's baseline.", "Weighted deviation = (0.75 × 2) + (0.25 × −1) = 1.25", "Predicted rating = 3 + 1.25 = 4.25");
calculation("recommendation-factorisation", 1, "The two matching coordinates contribute separately to the predicted rating.", "Reader vector: [1, 2]", "Guide vector: [2, 1]", "Prediction = (1 × 2) + (2 × 1) = 4", "Observed rating: 5");
calculation("recommendation-factorisation", 2, "For the half-squared-error loss used here, multiply the residual by the guide coordinates to obtain the reader gradient.", "Residual = 4 − 5 = −1", "Reader gradient = −1 × [2, 1] = [−2, −1]");
calculation("ranking-evaluation", 1, "Precision begins with what we showed. Recall begins with everything relevant we could have shown. These two metrics do not distinguish the ordering within the top three.", "Retrieved: 3 guides", "Relevant among those retrieved: 2", "Relevant among all candidates: 4", "Precision at 3 = 2 / 3", "Recall at 3 = 2 / 4 = 1 / 2");
replace("ranking-evaluation", 2, table("A useful guide in third place contributes less than one at the top. These are the logarithmic position weights used by discounted cumulative gain; the later explanation develops that rule. The second weight is rounded here.", "Reading position", ["Relevant?", "Position weight", "Contribution"], [["First",["Yes (1)","1","1 × 1 = 1"]],["Second",["No (0)","About 0.631","0 × 0.631 = 0"]],["Third",["Yes (1)","0.5","1 × 0.5 = 0.5"]],["Total",["2 relevant guides","","1 + 0 + 0.5 = 1.5"]]]), "A reader meets the first guide before the third. We can give useful results more credit when they appear earlier. Give each position a weight, multiply by whether its guide is relevant, and add the contributions.");
calculation("robust-anomaly-scores", 2, "The raw MAD score describes distance from the reference median in units of its typical absolute deviation.", "Reference median: 10", "Reference MAD: 1", "New reading: 13", "Raw MAD score = |13 − 10| / 1 = 3");
calculation("reconstruction-alerts", 2, "Average the two prepared feature errors before comparing with the declared threshold.", "Squared errors: [0, 4]", "Mean squared error = (0 + 4) / 2 = 2", "Alert rule: error > 1.5", "2 > 1.5: send an alert");
align("link-prediction", [0], ordinal("Coordinate",2), "Node vector coordinate");
calculation("link-prediction", 1, "Matching coordinates from the two node vectors produce one compatibility score.", "Node A: [1, 0]", "Node B: [2, 1]", "Logit = (1 × 2) + (0 × 1) = 2");
calculation("link-prediction", 2, "The sigmoid bounds the score between zero and one. This toy score still needs calibration before being interpreted as a reliable event frequency.", "Sigmoid(2) = 1 / (1 + exp(−2)) ≈ 0.881");
replace("confounding-and-comparisons", 2, table("The pooled groups give very different weights to the starting soil conditions. Their overall means can reverse the within-soil comparisons.", "Group", ["Dry share", "Moist share", "Pooled mean"], [["Extra water",["0.9","0.1","(0.9 × 4) + (0.1 × 9) = 4.5"]],["Usual water",["0.1","0.9","(0.1 × 3) + (0.9 × 8) = 7.5"]]]));
calculation("randomised-experiments", 1, "Summarise the observed outcomes within each assigned group before comparing them.", "Treatment mean = (6 + 8 + 7) / 3 = 7", "Control mean = (4 + 5 + 6) / 3 = 5");
calculation("randomised-experiments", 2, "The observed mean difference is an estimate. We still cannot observe the same bed's outcome under both assignments at once.", "Mean difference = 7 − 5 = 2", "Individual counterfactual outcomes: unobserved");
calculation("causal-adjustment", 2, "Use the same target-population weights on both outcomes. The mixture is no longer allowed to differ between the comparisons.", "Adjusted treatment mean = (0.6 × 4) + (0.4 × 9) = 6", "Adjusted control mean = (0.6 × 3) + (0.4 × 8) = 5", "Adjusted difference = 6 − 5 = 1");
calculation("treatment-effects-and-overlap", 2, "A rare observed assignment receives a large inverse-probability weight. That observation can then dominate the estimate.", "Probability of the observed assignment: 0.01", "Weight = 1 / 0.01 = 100");
calculation("saving-fitted-pipelines", 2, "Apply the saved model to the prepared feature row, using its original feature order.", "Prepared row: [1, 1]", "Saved weights: [3, −1]", "Saved intercept: 2", "Prediction = (1 × 3) + (1 × −1) + 2 = 4");
replace("prediction-input-contracts", 0, table("Named fields arrive in this order. The saved model's feature order will decide where each value belongs in the array.", "Incoming field", ["Value"], [["humidity",["25"]],["temperature",["12"]]]));
calculation("serving-predictions", 1, "Apply the same saved coefficients and bias to each incoming row, independently.", "Weights: [2, −1]; bias: 1", "Row 1: (1 × 2) + (2 × −1) + 1 = 1", "Row 2: (3 × 2) + (4 × −1) + 1 = 3");
replace("model-versioning", 1, table("Both versions receive exactly the same ordered input and use zero bias.", "Fixture", ["Feature 1", "Feature 2", "Bias"], [["Shared input",["3","2","0"]]]));
calculation("model-versioning", 2, "Keep the version beside the result. The input is identical; the fitted coefficients differ.", "Version A = (3 × 2) + (2 × −1) = 4", "Version B = (3 × 1) + (2 × 1) = 5");
replace("monitoring-and-rollback", 0, {kind:"numberline",caption:"The recent temperature mean has moved. This is a signal to investigate, not proof that the model's predictions are worse.",rows:[{label:"Reference mean",values:[20]},{label:"Recent mean",values:[25]}]});
replace("project-sensor-investigation", 0, table("The reference window alone determines both summaries. Keep them fixed while judging later records.", "Reference reading", ["Distance from median 10"], [["8",["2"]],["9",["1"]],["10",["0"]],["11",["1"]],["12",["2"]]]));
demonstrations["project-sensor-investigation"][0].scene!.caption += " The median absolute deviation is 1.";
replace("project-demand-forecast", 2, table("Both predictions were made before day 6 was observed. Compare them with the same later demand.", "Method", ["Day 6 prediction", "Later observation", "Absolute error"], [["Persistence",["10","12","2"]],["Fitted autoregression",["12","12","0"]]]));

export function readableScene(scene: Scene): Scene {
  if (scene.kind !== "strips") return scene;
  return { kind: scene.connected ? "flow" : "notes", caption: scene.caption, rows: scene.rows };
}

export function presentIntuition(id: string, lesson: LessonIntuition): LessonIntuition {
  const prepare = (scene: Scene, index: number) => scene.kind === "strips" && arrangements[id]?.[index]
    ? arrangements[id][index](scene) : readableScene(scene);
  return { ...lesson,
    steps: lesson.steps.map((item, index) => {
    // An explicitly authored scene takes precedence over a legacy row layout.
    const override = item.scene.kind === "strips" ? demonstrations[id]?.[index] : undefined;
    return { ...item, ...override, scene: override?.scene ?? prepare(item.scene, index),
      ...(item.alternative ? { alternative: { ...item.alternative, scene: readableScene(item.alternative.scene) } } : {}) };
  }) };
}
