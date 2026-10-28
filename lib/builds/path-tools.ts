import type { Data, Tool } from "./engine";
import { matrix, scalar, vector } from "./tools";

const define = (title: string, why: string, inputs: string[], run: Tool["run"]): Tool => ({ title, why, inputs, run });
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
function numbers(value: Data): number[] {
  const xs = vector(value);
  if (!xs.length || xs.length > 10000 || !xs.every(Number.isFinite)) throw Error("Use a nonempty list of finite numbers, at most 10,000 entries.");
  return xs;
}
function rows(value: Data): number[][] {
  const xs = matrix(value);
  if (!xs[0].length || xs.length > 100 || xs[0].length > 100 || !xs.every(row => row.every(Number.isFinite))) throw Error("Use a nonempty rectangular finite table, at most 100 by 100.");
  return xs;
}
function probabilities(value: Data, open = false): number[] {
  const xs = numbers(value);
  if (xs.some(x => open ? x <= 0 || x >= 1 : x < 0 || x > 1)) throw Error(open ? "Propensities must be strictly between zero and one; inspect treatment overlap." : "Probabilities must be between zero and one.");
  return xs;
}
function distribution(value: Data): number[] {
  const xs = probabilities(value);
  if (Math.abs(sum(xs) - 1) > 1e-8) throw Error("Probabilities must sum to one.");
  return xs;
}
function lagged(value: Data, lag: Data): [number[], number] {
  const xs = numbers(value), k = scalar(lag);
  if (!Number.isInteger(k) || k < 1 || k >= xs.length) throw Error("Choose a whole-number lag of at least one and shorter than the history.");
  return [xs, k];
}
function square(value: Data): number[][] {
  const a = rows(value);
  if (a.length !== a[0].length) throw Error("This operation needs a square matrix.");
  return a;
}
export const PATH_TOOLS: Record<string, Tool> = {
  lagInputs: define("Build earlier-value windows", "Each row contains the preceding observations for one already observed target, oldest first. The target itself is excluded.", ["Ordered history", "Number of lags"], ([history, lag]) => {
    const [xs,k] = lagged(history,lag); return xs.slice(k).map((_,i) => xs.slice(i,i+k));
  }),
  lagTargets: define("Read later targets", "Returns the observations that have a complete earlier lag window, in chronological order. These are targets at later dates, not values that can enter their own prediction windows.", ["Ordered history", "Lag distance"], ([history,lag]) => { const [xs,k] = lagged(history,lag); return xs.slice(k); }),
  lagReference: define("Read earlier references", "Returns earlier observations paired with targets one supplied lag later. The two lists have matching positions so subtraction compares the intended dates.", ["Ordered history", "Lag distance"], ([history,lag]) => { const [xs,k] = lagged(history,lag); return xs.slice(0,-k); }),
  subtractRows: define("Subtract a shared reference row", "Subtracts the same reference vector from every table row. Columns must align, and the result preserves the original rows.", ["Rows to compare", "Shared reference vector"], ([value,reference]) => {
    const a = rows(value), b = numbers(reference);
    if (a[0].length !== b.length) throw Error("The reference needs one value per column.");
    return a.map(row => row.map((x,i) => x-b[i]));
  }),
  probabilityVector: define("Check a probability distribution", "Checks finite probabilities and a total of one, passing the valid distribution through unchanged.", ["Probabilities"], ([value]) => distribution(value)),
  probabilityRows: define("Check transition rows", "Checks that every row is a probability distribution. Rows describe the next possibilities for one current state.", ["Transition table"], ([value]) => rows(value).map(distribution)),
  openProbabilities: define("Check treatment overlap", "Requires every supplied propensity to be strictly between zero and one. This numerical check does not prove causal assumptions.", ["Propensity vector"], ([value]) => probabilities(value,true)),
  normaliseWeights: define("Normalise non-negative weights", "Divides each weight by their positive total, retaining their relative proportions.", ["Unnormalised weights"], ([value]) => {
    const xs = numbers(value), total = sum(xs);
    if (xs.some(x => x < 0) || !Number.isFinite(total) || total <= 0) throw Error("Use non-negative weights with a finite positive total.");
    return xs.map(x => x/total);
  }),
  positiveReciprocal: define("Take positive reciprocals", "Returns one divided by each strictly positive entry. When entries are error variances, the results are precisions: lower variance gives greater weight.", ["Positive values"], ([value]) => {
    const xs = numbers(value); if (xs.some(x => x <= 0)) throw Error("Reciprocals here require strictly positive values."); return xs.map(x => 1/x);
  }),
  discountWeights: define("Build discount weights", "Returns one weight per reward, starting with one for the immediate reward and multiplying by gamma at each later position.", ["Reward sequence", "Discount gamma"], ([value,gamma]) => {
    const xs = numbers(value), g = scalar(gamma);
    if (!Number.isFinite(g) || g < 0 || g > 1) throw Error("Discount gamma must be between zero and one.");
    return xs.map((_,i) => g ** i);
  }),
  terminalContinuation: define("Stop at a true terminal state", "Returns zero for terminal flag one, otherwise passes the continuation value through. A time limit is not automatically a terminal state.", ["Continuation value", "Terminal flag: 0 or 1"], ([value,flag]) => {
    const v = scalar(value), terminal = scalar(flag);
    if (!Number.isFinite(v) || (terminal !== 0 && terminal !== 1)) throw Error("Use a finite continuation and a terminal flag of zero or one.");
    return terminal ? 0 : v;
  }),
  solveLinear: define("Solve a linear system", "Finds x in A times x equals b using elimination with pivoting. It does not explicitly form an inverse.", ["Square coefficient matrix A", "Right-hand vector b"], ([value,target]) => {
    const a = square(value), b = numbers(target), n = a.length;
    if (n !== b.length || n > 50) throw Error("Use a matching square system with at most 50 unknowns.");
    const aug = a.map((row,i) => [...row,b[i]]);
    const scale = Math.max(...a.flat().map(Math.abs));
    for (let col=0; col<n; col++) {
      let pivot = col;
      for (let row=col+1; row<n; row++) if (Math.abs(aug[row][col]) > Math.abs(aug[pivot][col])) pivot = row;
      if (Math.abs(aug[pivot][col]) <= Number.EPSILON * n * scale || scale === 0) throw Error("The system is singular or too poorly conditioned for this demonstration.");
      [aug[col],aug[pivot]] = [aug[pivot],aug[col]];
      const divisor = aug[col][col];
      for (let j=col; j<=n; j++) aug[col][j] /= divisor;
      for (let row=0; row<n; row++) if (row !== col) {
        const factor = aug[row][col];
        for (let j=col; j<=n; j++) aug[row][j] -= factor * aug[col][j];
      }
    }
    return aug.map(row => row[n]);
  }),
  columntotal: define("Add each column", "Keeps one result per feature or item column while adding across record rows.", ["Numerical rows"], ([value]) => { const a=rows(value); return a[0].map((_,j) => sum(a.map(row => row[j]))); }),
  medianValue: define("Median of a list", "Sorts a copy and takes the middle value, or the mean of the middle pair for an even-length list.", ["Reference values"], ([value]) => {
    const xs = [...numbers(value)].sort((a,b) => a-b), middle = Math.floor(xs.length/2);
    return xs.length%2 ? xs[middle] : (xs[middle-1]+xs[middle])/2;
  }),
  powerTwo: define("Raise two to a power", "An exponent of zero gives one; more negative exponents produce smaller positive values.", ["Exponent"], ([value]) => 2 ** scalar(value)),
  divideOrZero: define("Divide with an explicit zero fallback", "Divides matching entries. A zero denominator returns zero, as used by the stated empty-neighbour convention.", ["Numerators", "Denominators"], ([a,b]) => {
    const x=numbers(a),y=numbers(b); if(x.length!==y.length) throw Error("Numerators and denominators need matching lengths."); return x.map((v,i)=>y[i]===0?0:v/y[i]);
  }),
  addIdentity: define("Add self-connections", "Adds one to each diagonal entry of a square matrix while preserving other edges.", ["Adjacency matrix"], ([value]) => square(value).map((row,i)=>row.map((x,j)=>x+Number(i===j)))),
  symmetricDegrees: define("Scale by both endpoint degrees", "Each node degree is its adjacency-row total. Divides every connection weight by the square root of the product of its two endpoint degrees, reducing domination by highly connected nodes. Requires a non-negative undirected adjacency matrix; add the stated self-connections first.", ["Adjacency including self-loops"], ([value]) => {
    const a=square(value),d=a.map(sum);
    if(a.some((row,i)=>row.some((x,j)=>x<0||Math.abs(x-a[j][i])>1e-8))||d.some(x=>x<=0)) throw Error("Use symmetric non-negative adjacency with positive degree at every node.");
    return a.map((row,i)=>row.map((x,j)=>x/Math.sqrt(d[i]*d[j])));
  }),
  finiteWidth: define("Validate a finite feature table", "Requires a nonempty rectangular table with the declared number of finite numerical columns, then passes the accepted values through.", ["Input rows", "Required width"], ([value,width]) => {
    const a=rows(value),n=scalar(width); if(!Number.isInteger(n)||n<1||a[0].length!==n) throw Error("The feature count does not match the required positive whole-number width."); return a;
  }),
  regionSizes: define("Count pixels in each labelled region", "Counts each positive integer region ID and ignores background zero. Returns sizes in increasing region-ID order.", ["Region label image"], ([value]) => {
    const a=rows(value),counts=new Map<number,number>();
    for(const x of a.flat()) { if(!Number.isInteger(x)||x<0) throw Error("Use non-negative integer region labels."); if(x) counts.set(x,(counts.get(x)??0)+1); }
    return [...counts.entries()].sort((a,b)=>a[0]-b[0]).map(([,count])=>count);
  }),
};
