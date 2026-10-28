import type { Data, Tool } from "./engine";
import { matrix, scalar, vector } from "./tools";

const define = (title: string, why: string, inputs: string[], run: Tool["run"]): Tool => ({ title, why, inputs, run });
function numbers(value: Data): number[] {
  const entries = vector(value);
  if (!entries.length || !entries.every(Number.isFinite)) throw Error("Supply a nonempty list of finite numbers.");
  return entries;
}
function grid(value: Data): number[][] {
  const rows = matrix(value);
  if (!rows[0].length || rows.length > 100 || rows[0].length > 100 || !rows.every(row => row.every(Number.isFinite))) throw Error("Supply a nonempty rectangular grid of finite numbers, at most 100 by 100.");
  return rows;
}
function probability(value: number): number {
  if (!Number.isFinite(value) || value < 0 || value > 1) throw Error("A probability must be a finite number between zero and one.");
  return value;
}
function binary(value: Data): number[][] {
  const rows = grid(value);
  if (!rows.every(row => row.every(x => x === 0 || x === 1))) throw Error("A binary mask or footprint must contain only zeros and ones.");
  return rows;
}
function morphology(value: Data, shape: Data, erode: boolean): number[][] {
  const input = binary(value), footprint = binary(shape), h = footprint.length, w = footprint[0].length;
  if (h % 2 !== 1 || w % 2 !== 1 || h > 9 || w > 9) throw Error("Use odd footprint dimensions no larger than nine, with the anchor at the centre.");
  if (!footprint.some(row => row.some(Boolean))) throw Error("Select at least one position in the footprint.");
  if (!footprint.every((row, r) => row.every((x, c) => x === footprint[h - 1 - r][w - 1 - c]))) throw Error("This teaching tool uses centrally symmetric footprints. Match each selected offset with its opposite.");
  const offsets = footprint.flatMap((row, r) => row.flatMap((x, c) => x ? [[r - (h - 1) / 2, c - (w - 1) / 2]] : []));
  return input.map((row, r) => row.map((_, c) => {
    const values = offsets.map(([dr, dc]) => input[r + dr]?.[c + dc] ?? 0);
    return Number(erode ? values.every(Boolean) : values.some(Boolean));
  }));
}
function box(value: Data): number[] {
  const b = numbers(value);
  if (b.length !== 4 || b[2] <= b[0] || b[3] <= b[1]) throw Error("Use [left, top, right, bottom] with positive width and height.");
  return b;
}
const area = (b: number[]) => (b[2] - b[0]) * (b[3] - b[1]);
const intersection = (a: number[], b: number[]) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));

export const GAP_TOOLS: Record<string, Tool> = {
  priorEvidence: define("Weight evidence by prior", "For each cause, multiplies its prior by the probability of the observed evidence given that cause. Priors describe exhaustive, mutually exclusive causes and must sum to one.", ["Prior probabilities", "Evidence probability per cause"], ([p, e]) => {
    const prior = numbers(p).map(probability), evidence = numbers(e).map(probability);
    if (prior.length !== evidence.length) throw Error("Supply one evidence probability for each cause in the same order as the priors.");
    if (Math.abs(prior.reduce((a, b) => a + b, 0) - 1) > 1e-8) throw Error("The prior probabilities must sum to one.");
    const joint = prior.map((x, i) => x * evidence[i]);
    if (!joint.some(x => x > 0)) throw Error("Every cause assigns zero probability to this evidence. There is no nonzero evidence total to condition on.");
    return joint;
  }),
  sequenceLikelihood: define("Compare Bernoulli sequence likelihoods", "For each candidate success probability, returns the probability of this particular ordered zero-or-one sequence. A 1 contributes the success probability and a 0 its complement. Trials are independent given that shared probability; no binomial count multiplier is used.", ["Candidate success probabilities", "Ordered zero-or-one observations"], ([p, y]) => {
    const candidates = numbers(p).map(probability), observed = numbers(y);
    if (observed.length > 100) throw Error("Use at most 100 trials in this direct-product example. Longer sequences need log-likelihood arithmetic.");
    if (!observed.every(x => x === 0 || x === 1)) throw Error("Record each outcome as one for success or zero for failure.");
    const likelihoods = candidates.map(chance => observed.reduce<number>((product, outcome) => product * (outcome === 1 ? chance : 1 - chance), 1));
    if (!likelihoods.some(x => x > 0)) throw Error("None of these candidates assigns a nonzero representable probability to this sequence. Reconsider the candidates or use log likelihoods.");
    return likelihoods;
  }),
  rowproduct: define("Multiply conditional probabilities in each row", "Combines a row's conditional evidence terms by multiplication. This is appropriate for the naive Bayes example only under its conditional-independence assumption.", ["Conditional probability rows"], ([value]) => grid(value).map(row => row.map(probability).reduce((a, b) => a * b, 1))),
  rowtotal: define("Add each row", "Adds across each row and returns one total per row. For a neighbour mask, the total counts neighbours, including the point itself when its diagonal is one.", ["Rows of numbers"], ([value]) => grid(value).map(row => row.reduce((a, b) => a + b, 0))),
  crossDistances: define("Compare two sets of positions", "Returns absolute distances from every one-dimensional position in the first group to every position in the second group. Rows belong to the first group and columns to the second.", ["First group's positions", "Second group's positions"], ([a, b]) => {
    const first = numbers(a), second = numbers(b);
    if (first.length > 100 || second.length > 100) throw Error("Use at most 100 positions in each group for this small example.");
    return first.map(x => second.map(y => Math.abs(x - y)));
  }),
  pairDistances: define("Measure all pairwise distances", "Compares every feature row with every other using Euclidean distance. The diagonal is zero because each row is compared with itself. Feature units must be comparable.", ["Position rows"], ([value]) => {
    const positions = grid(value);
    return positions.map(a => positions.map(b => Math.hypot(...a.map((x, i) => x - b[i]))));
  }),
  withinRadius: define("Mark neighbours within a radius", "Marks a distance with one when it is no larger than the radius, otherwise zero. Equality is included, so a zero self-distance belongs to the neighbourhood.", ["Distance grid", "Neighbour radius"], ([value, radiusValue]) => {
    const distances = grid(value), radius = scalar(radiusValue);
    if (!Number.isFinite(radius) || radius < 0) throw Error("Use a finite, non-negative neighbour radius.");
    if (distances.some(row => row.some(x => x < 0))) throw Error("Distances cannot be negative.");
    return distances.map(row => row.map(x => Number(x <= radius)));
  }),
  erodeMask: define("Erode a binary mask", "A foreground value is 1. Keeps a position only when every selected footprint offset lands on foreground, so a narrow object may disappear. The footprint is centred, odd-sized and centrally symmetric; positions outside the image are zero.", ["Binary mask", "Footprint"], ([value, footprint]) => morphology(value, footprint, true)),
  dilateMask: define("Dilate a binary mask", "Sets a position to foreground when any selected footprint offset reaches foreground, expanding surviving shapes. Uses the same centred symmetric footprint and outside-image zeros as Erode a binary mask.", ["Binary mask", "Footprint"], ([value, footprint]) => morphology(value, footprint, false)),
  labelRegions: define("Label connected foreground regions", "Flood-fills each reachable foreground group under four- or eight-neighbour connectivity. Scans rows in order, assigns consecutive positive IDs, and reserves zero for background.", ["Binary mask", "Connectivity: 4 or 8"], ([value, kind]) => {
    const input = binary(value), connectivity = scalar(kind);
    if (connectivity !== 4 && connectivity !== 8) throw Error("Choose four or eight neighbours by supplying 4 or 8.");
    const offsets = [[-1,0],[1,0],[0,-1],[0,1], ...(connectivity === 8 ? [[-1,-1],[-1,1],[1,-1],[1,1]] : [])];
    const labels = input.map(row => row.map(() => 0));
    let label = 0;
    input.forEach((row, r) => row.forEach((value, c) => {
      if (!value || labels[r][c]) return;
      label++; labels[r][c] = label;
      const queue = [[r, c]];
      for (let at = 0; at < queue.length; at++) {
        const [y, x] = queue[at];
        for (const [dy, dx] of offsets) {
          const yy = y + dy, xx = x + dx;
          if (input[yy]?.[xx] === 1 && !labels[yy][xx]) { labels[yy][xx] = label; queue.push([yy, xx]); }
        }
      }
    }));
    return labels;
  }),
  flipImage: define("Reflect an image horizontally", "Reverses columns in each row while keeping row order. Apply the same reflection to a spatial label mask to keep its positions aligned with the photograph.", ["Image or aligned mask"], ([value]) => grid(value).map(row => [...row].reverse())),
  boxArea: define("Measure a rectangle's area", "Multiplies width by height using continuous [left, top, right, bottom] boundaries. No extra pixel is added to either length.", ["Rectangle boundaries"], ([value]) => area(box(value))),
  boxIntersection: define("Measure two rectangles' intersection", "Finds the shared horizontal and vertical ranges, clamps each length at zero, then multiplies. Disjoint and edge-touching rectangles have zero shared area.", ["First rectangle", "Second rectangle"], ([a, b]) => intersection(box(a), box(b))),
  descendingIndices: define("Rank indices by descending score", "Returns original positions from highest score to lowest. Equal scores use the lower original index first, making the teaching examples repeatable.", ["Candidate scores"], ([value]) => {
    const scores = numbers(value);
    return scores.map((_, i) => i).sort((a, b) => scores[b] - scores[a] || a - b);
  }),
  suppressBoxes: define("Suppress overlapping alternatives", "Processes original box indices in the supplied score order. Keeps the first available box and removes remaining boxes whose intersection-over-union is strictly above the threshold, then repeats. Removed boxes never suppress others. Returns retained indices; all candidates must belong to one class.", ["Rectangle rows", "Indices in score order", "IoU threshold"], ([value, indices, cutoff]) => {
    const boxes = grid(value).map(box), order = numbers(indices), threshold = probability(scalar(cutoff));
    if (order.length !== boxes.length || new Set(order).size !== boxes.length || order.some(x => !Number.isInteger(x) || x < 0 || x >= boxes.length)) throw Error("The score order must contain every box index exactly once.");
    let waiting = [...order]; const kept: number[] = [];
    while (waiting.length) {
      const current = waiting[0]; kept.push(current);
      waiting = waiting.slice(1).filter(index => {
        const overlap = intersection(boxes[current], boxes[index]);
        return overlap / (area(boxes[current]) + area(boxes[index]) - overlap) <= threshold;
      });
    }
    return kept;
  }),
};
