export type Activation = "step" | "identity" | "sigmoid";
export type Part = { id: string; height: number; mass: number; bin: 0 | 1 };
export type Settings = { height: number; mass: number; bias: number; activation: Activation };

const parts = (rows: [number, number, 0 | 1][]): Part[] => rows.map(([height, mass, bin], i) => ({ id: String.fromCharCode(65 + i), height, mass, bin }));
export const FIRST_BATCH = parts([[1, 3, 0], [3, 1, 1], [2, 4, 0], [4, 2, 1], [1, 2, 0], [2, 1, 1], [2, 3, 0], [3, 2, 1]]);
export const STRICT_BATCH = parts([[1, 3, 0], [3, 1, 1], [2, 1, 0], [4, 1, 1], [2, 2, 0], [4, 2, 1], [3, 2, 0], [3, 3, 0]]);
export const CORNER_BATCH = parts([[1, 1, 0], [1, 3, 1], [3, 1, 1], [3, 3, 0]]);

export const STAGES = [
  {
    label: "Weights", title: "Can two measurements tell us where a part belongs?",
    paragraphs: [
      "Our workshop receives a mixed delivery of parts. Some belong on the workbench; others should go into storage. A person has labelled this first batch, but the sorting machine only knows each part’s height and mass.",
      "A weight controls how much one measurement contributes to the decision. Like a volume knob, it can make that input matter more or less. A negative weight makes a larger measurement reduce the score. Adjust the two weights, then send the batch through.",
    ],
    goal: "Route all eight parts to their labelled bins.",
    hint: "Look at the workshop parts: height is larger than mass. Try giving height a positive weight and mass a negative weight.",
    takeaway: "Both measurements now have a role. Height adds to the score and mass subtracts from it. The gate sends a part to the workshop when the result reaches zero.",
    settings: { height: 1, mass: 1, bias: 0, activation: "step" as Activation }, batch: FIRST_BATCH,
  },
  {
    label: "Bias", title: "What if the workshop becomes more selective?",
    paragraphs: [
      "The next delivery has a stricter set of labels. A part with height 2 and mass 1 used to qualify for the workshop, but now it belongs in storage. The relationship between height and mass still matters; the score needs to clear a higher bar.",
      "We have set the height weight to 1 and the mass weight to −1 for this experiment. A bias is a separate amount added after those measurements have been combined. Adjust it to shift every score by the same amount.",
    ],
    goal: "Use the bias to sort the stricter batch.",
    hint: "A negative bias lowers every score. Try a bias between −2 and −1, so a small positive difference no longer opens the workshop gate.",
    takeaway: "The bias moved the cutoff without changing the relative contribution of either measurement. That is why a neuron needs a separate bias as well as weights.",
    settings: { height: 1, mass: -1, bias: 0, activation: "step" as Activation }, batch: STRICT_BATCH,
  },
  {
    label: "Activation", title: "How does a score become an instruction?",
    paragraphs: [
      "We have calibrated the weights and bias. The machine can now produce a score, but its gate needs a particular instruction: 0 means storage and 1 means workshop. A score such as one half is neither of those commands.",
      "An activation function turns the score into an output. Try the three functions below and inspect what each returns. Which one gives this gate the two values it accepts? Other machines may need a continuous output instead.",
    ],
    goal: "Choose an activation that operates the two-position gate.",
    hint: "The step function returns exactly 0 or 1. Identity keeps the score unchanged, while sigmoid returns a value between 0 and 1.",
    takeaway: "This gate needs a step activation. The weights combine the inputs, the bias shifts their total, and the activation produces the output. Those are the three components of this artificial neuron.",
    settings: { height: 1, mass: -1, bias: -1.5, activation: "identity" as Activation }, batch: STRICT_BATCH,
  },
  {
    label: "NumPy", title: "Can your code operate the same machine?",
    paragraphs: [
      "You have seen each component separately. Now write a function that takes a batch of measurements, applies the supplied weights and bias, and returns a score and a gate instruction for each part.",
      "Each row contains height followed by mass. Return two one-dimensional NumPy arrays: scores and bins. Use the step activation, with a score of zero going to the workshop. The tests also call your function with different weights and new measurements.",
    ],
    goal: "Pass all five tests and watch your function route the delivery.",
    hint: "Multiply each column by its weight, sum across each row, then add the bias. Compare the resulting scores with zero and convert the comparison to integers.",
    takeaway: "Your function works on this delivery and the additional test cases. The same operations you controlled with knobs now run in NumPy.",
    settings: { height: 1, mass: -1, bias: -1.5, activation: "step" as Activation }, batch: STRICT_BATCH,
  },
  {
    label: "The limit", title: "Can one neuron sort every pattern?",
    paragraphs: [
      "This order has a different pattern: parts with one large measurement and one small measurement go to the workshop. When both are small or both are large, they go into storage.",
      "All three controls are yours again. Try to separate the groups, then look at the map of the four parts. Think about what changing a weight or bias does to the line before choosing what to try next.",
    ],
    goal: "Investigate the failures and decide what the machine needs next.",
    hint: "The workshop parts occupy opposite corners. The storage parts occupy the other two. Try drawing one straight line with both workshop parts on one side and both storage parts on the other.",
    takeaway: "A single neuron with this step activation makes one straight decision boundary. These opposing corners need more than one boundary. Combining neurons gives us a way to build that more complicated decision.",
    settings: { height: 1, mass: -1, bias: -1.5, activation: "step" as Activation }, batch: CORNER_BATCH,
  },
];

export function evaluatePart(part: Part, settings: Settings) {
  const score = part.height * settings.height + part.mass * settings.mass + settings.bias;
  const output = settings.activation === "step" ? Number(score >= 0) : settings.activation === "sigmoid" ? 1 / (1 + Math.exp(-score)) : score;
  return { score, output };
}

export const STARTER = `import numpy as np

def sort_parts(measurements, weights, bias):
    # measurements: one row per part, columns [height, mass]
    # weights: one value for each column
    # Return an array of scores and an array of bins.
    # Storage is 0. Workshop is 1, including a score of zero.
    scores = np.zeros(len(measurements))
    bins = np.zeros(len(measurements), dtype=int)
    return scores, bins
`;

export const SOLUTION = `import numpy as np

def sort_parts(measurements, weights, bias):
    contributions = measurements * weights
    scores = contributions.sum(axis=1) + bias
    bins = (scores >= 0).astype(int)
    return scores, bins
`;

// Calls the learner's function on independent inputs, not a printed answer.
// Keep the reference values separate from arrays passed into user code.
export const TEST_HARNESS = `
import json as _lab_json
import numpy as _lab_np

_lab_cases = [
    ("The workshop delivery", ${JSON.stringify(STRICT_BATCH.map(p => [p.height, p.mass]))}, [1, -1], -1.5),
    ("A score exactly on the cutoff", [[2, 2], [1, 2], [3, 2]], [1, -1], 0),
    ("Different sensor weights", [[1, 3], [4, 1], [2, 2]], [0, 1], -2),
    ("Fractional and negative values", [[0.5, 1], [-2, 0], [1, -1]], [-0.5, 1.25], -0.75),
    ("A delivery with one part", [[4, 2]], [1, -1], -1.5),
]
_lab_results = []
_lab_scene = None
for _lab_index, (_lab_name, _lab_rows, _lab_weights, _lab_bias) in enumerate(_lab_cases):
    _lab_x = _lab_np.array(_lab_rows, dtype=float)
    _lab_w = _lab_np.array(_lab_weights, dtype=float)
    _lab_scores = (_lab_x * _lab_w).sum(axis=1) + _lab_bias
    _lab_bins = (_lab_scores >= 0).astype(int)
    _lab_expected = {"scores": _lab_scores.tolist(), "bins": _lab_bins.tolist()}
    _lab_actual = None
    try:
        _lab_s, _lab_b = sort_parts(_lab_x.copy(), _lab_w.copy(), _lab_bias)
        _lab_s = _lab_np.asarray(_lab_s, dtype=float)
        _lab_b = _lab_np.asarray(_lab_b, dtype=float)
        if _lab_s.shape != _lab_scores.shape or _lab_b.shape != _lab_bins.shape:
            raise ValueError("Return two one-dimensional arrays, each with one entry per part.")
        if not _lab_np.isfinite(_lab_s).all() or not _lab_np.isfinite(_lab_b).all():
            raise ValueError("Scores and bins must be finite numbers.")
        _lab_actual = {"scores": _lab_s.tolist(), "bins": _lab_b.tolist()}
        if _lab_index == 0:
            _lab_scene = _lab_actual
        _lab_passed = bool(_lab_np.allclose(_lab_s, _lab_scores, rtol=1e-7, atol=1e-8) and _lab_np.array_equal(_lab_b, _lab_bins))
        _lab_detail = "Scores and gate instructions match." if _lab_passed else "Compare the scores first, then check the cutoff used for the bins."
    except Exception as _lab_error:
        _lab_passed = False
        _lab_detail = type(_lab_error).__name__ + ": " + str(_lab_error)
    _lab_results.append({"name": _lab_name, "passed": _lab_passed, "detail": _lab_detail, "expected": _lab_expected, "actual": _lab_actual})
print("__FITLAB_SORTER_RESULT__" + _lab_json.dumps({"tests": _lab_results, "scene": _lab_scene}, allow_nan=False))
`;
