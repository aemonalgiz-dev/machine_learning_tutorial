import type { Data, Tool } from "./engine";
import { EXTRA_TOOLS } from "./extra-tools";
import { FOUNDATION_TOOLS } from "./foundation-tools";
export function scalar(x: Data): number { if (typeof x !== "number") throw Error("This input needs one number. Inspect the connected machine to see what it produces."); return x; }
export function vector(x: Data): number[] { if (!Array.isArray(x) || !x.every(v => typeof v === "number")) throw Error("This input needs a list of numbers."); return x as number[]; }
export function matrix(x: Data): number[][] { if (!Array.isArray(x) || !x.length) throw Error("This input needs rows of numbers."); const rows = x.map(vector); if (rows.some(r => r.length !== rows[0].length)) throw Error("Each row must have the same number of values."); return rows; }
export function text(x: Data): string { if (typeof x !== "string") throw Error("This input needs text."); return x; }
export function list(x: Data): Data[] { if (!Array.isArray(x)) throw Error("This input needs a list."); return x; }
export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const mean = (xs: number[]) => sum(xs) / xs.length;
export const dot = (a: number[], b: number[]) => { if (a.length !== b.length) throw Error("The two vectors need the same length."); return sum(a.map((x, i) => x * b[i])); };
export const softmax = (xs: number[]) => { const es = xs.map(x => Math.exp(x - Math.max(...xs))); return es.map(x => x / sum(es)); };
export function map(x: Data, fn: (n: number) => number): Data { return Array.isArray(x) ? x.map(v => map(v, fn)) : fn(scalar(x)); }
export function zip(a: Data, b: Data, fn: (x: number, y: number) => number): Data {
  if (Array.isArray(a) && Array.isArray(b)) { if (a.length !== b.length) throw Error("These lists have different lengths."); return a.map((x, i) => zip(x, b[i], fn)); }
  if (Array.isArray(a)) return a.map(x => zip(x, b, fn));
  if (Array.isArray(b)) return b.map(x => zip(a, x, fn));
  return fn(scalar(a), scalar(b));
}
const define = (title: string, why: string, inputs: string[], run: Tool["run"], settings?: Tool["settings"]): Tool => ({ title, why, inputs, run, settings });
const numeric = (key: string, label: string, initial = 0, min = -10, max = 10, step = .5) => ({ key, label, initial, min, max, step });
export const TOOLS: Record<string, Tool> = {
  ...EXTRA_TOOLS,
  ...FOUNDATION_TOOLS,
  constant: define("Set a constant", "Supplies a number that stays the same for every example. Use it when the rule needs a fixed rate, threshold or offset.", [], (_, s) => Number(s.value), [numeric("value", "Number", 0, -10000, 10000, .1)]),
  add: define("Add", "Combines contributions. Two equally sized lists are added position by position.", ["First contribution", "Second contribution"], ([a,b]) => zip(a,b,(x,y)=>x+y)),
  subtract: define("Subtract", "Finds what remains after removing a reference value. The order of the inputs matters.", ["Starting value", "Value to remove"], ([a,b]) => zip(a,b,(x,y)=>x-y)),
  multiply: define("Multiply", "Scales a contribution, or combines matching entries in two lists.", ["Value", "Multiplier"], ([a,b]) => zip(a,b,(x,y)=>x*y)),
  divide: define("Divide", "Shares a total or changes its units. The second input must not be zero.", ["Amount", "Divisor"], ([a,b]) => zip(a,b,(x,y)=>x/y)),
  square: define("Square", "Makes both positive and negative differences positive, with larger differences contributing more.", ["Value or list"], ([x]) => map(x,n=>n*n)),
  root: define("Square root", "Returns a squared measurement to its original units.", ["Squared value"], ([x]) => map(x,Math.sqrt)),
  absolute: define("Absolute value", "Keeps the size of a difference while discarding its direction.", ["Difference"], ([x]) => map(x,Math.abs)),
  total: define("Add a list", "Collects the contribution of every number in a list.", ["Numbers"], ([x]) => sum(vector(x))),
  count: define("Count items", "Reports how many items a list contains. It does not add their values.", ["Items"], ([x]) => list(x).length),
  mean: define("Mean", "Shares the total equally among the items. You can also construct this from Add a list, Count items and Divide.", ["Numbers"], ([x]) => mean(vector(x))),
  dot: define("Dot product", "Multiplies corresponding entries and adds the products. It reuses the weighted sums built earlier.", ["First vector", "Second vector"], ([a,b]) => dot(vector(a),vector(b))),
  length: define("Vector length", "Finds a vector's Euclidean length by squaring its entries, adding, and taking a square root.", ["Vector"], ([x]) => Math.hypot(...vector(x))),
  exp: define("Exponentiate", "Turns each score into a positive contribution. Differences between scores become ratios between contributions.", ["Scores"], ([x]) => map(x,Math.exp)),
  log: define("Natural logarithm", "Compresses positive quantities such as counts and turns multiplication into addition.", ["Positive values"], ([x]) => map(x,Math.log)),
  log2: define("Logarithm in bits", "Measures a positive ratio on a base-two scale. A doubling adds one bit.", ["Positive ratios"], ([x]) => map(x,Math.log2)),
  softmax: define("Softmax", "Turns scores into positive shares that sum to one. It reuses exponentiation, a total, and division.", ["Score vector"], ([x]) => softmax(vector(x))),
  sigmoid: define("Sigmoid", "Maps a score smoothly into the interval from zero to one. Zero maps to one half.", ["Score"], ([x]) => map(x,n=>1/(1+Math.exp(-n)))),
  relu: define("Keep positive values", "Passes positive values through and replaces negative values with zero. This is a ReLU activation.", ["Values"], ([x]) => map(x,n=>Math.max(0,n))),
  gate: define("Threshold gate", "Produces 1 when a score reaches the cutoff and 0 otherwise. It turns evidence into a decision.", ["Score", "Cutoff"], ([a,b]) => zip(a,b,(x,y)=>Number(x>=y))),
  greater: define("Strict threshold", "Produces 1 only when the first value is greater than the second.", ["Value", "Threshold"], ([a,b]) => zip(a,b,(x,y)=>Number(x>y))),
  pack: define("Collect two results", "Keeps two results together without adding or otherwise changing them.", ["First result", "Second result"], ([a,b]) => [a,b]),
  flatten: define("Flatten a list", "Removes one level of nesting. Check which boundaries need to survive before using it.", ["Nested list"], ([x]) => list(x).flat()),
  transpose: define("Swap rows and columns", "Makes each old column a new row, so the next operation compares the intended values.", ["Matrix"], ([x]) => { const m=matrix(x); return m[0].map((_,i)=>m.map(r=>r[i])); }),
  matvec: define("Matrix times vector", "Applies one weighted sum to each row of a matrix.", ["Rows of coefficients", "Input vector"], ([m,v]) => matrix(m).map(r=>dot(r,vector(v)))),
  matmul: define("Matrix multiplication", "Combines transformations. Every output entry is a dot product of a row and a column.", ["Left matrix", "Right matrix"], ([a,b]) => { const A=matrix(a),B=matrix(b); return A.map(r=>B[0].map((_,i)=>dot(r,B.map(t=>t[i])))); }),
  rowmean: define("Mean within each row", "Produces one mean for each example while keeping examples separate.", ["Rows of measurements"], ([m])=>matrix(m).map(mean)),
  columnmedian: define("Median within each column", "Sorts each coordinate's values and takes the middle one, or averages the two middle values for an even count. An extreme value therefore has less influence than it has on a mean.", ["Rows of proposed shifts"], ([m])=>{const rows=matrix(m);return rows[0].map((_,i)=>{const values=rows.map(r=>r[i]).sort((a,b)=>a-b),middle=Math.floor(values.length/2);return values.length%2?values[middle]:mean([values[middle-1],values[middle]]);});}),
  rownorm: define("Normalise each row", "Subtracts each row's own mean and divides by its own population standard deviation. A constant row becomes zeros.", ["Rows of activations"], ([m])=>matrix(m).map(r=>{const c=mean(r),s=Math.sqrt(mean(r.map(x=>(x-c)**2)));return r.map(x=>s?(x-c)/s:0);})),
  index: define("Choose an entry", "Reads the entry at a zero-based position. Use an ID as an address rather than multiplying by it.", ["Table or list", "Index"], ([a,b]) => { const i=scalar(b),xs=list(a); if(!Number.isInteger(i)||i<0||i>=xs.length)throw Error("That index is outside this list.");return xs[i]; }),
  lookup: define("Look up IDs", "Retrieves one table entry for each incoming ID, including repeated IDs.", ["Table", "IDs"], ([a,b]) => vector(b).map(i=>{const x=list(a)[i];if(x===undefined)throw Error("An ID is missing from this table.");return x;})),
  argmin: define("Find the smallest", "Returns the position of the smallest score, keeping the first in a tie.", ["Scores"], ([x])=>{const v=vector(x);return v.indexOf(Math.min(...v));}),
  argmax: define("Find the largest", "Returns the position of the largest score, keeping the first in a tie.", ["Scores"], ([x])=>{const v=vector(x);return v.indexOf(Math.max(...v));}),
  round: define("Round to a level", "Replaces each value with its nearest integer level. Halfway cases round towards positive infinity in this toy.", ["Values"], ([x])=>map(x,Math.round)),
  remainder: define("Bucket by remainder", "Assigns a nonnegative integer to a fixed number of buckets. Different inputs can land together.", ["Integer values", "Bucket count"], ([a,b])=>zip(a,b,(x,y)=>((x%y)+y)%y)),
  slice: define("Take a range", "Keeps part of a list, starting at one index and stopping before another.", ["List"], ([x],s)=>list(x).slice(Number(s.start),Number(s.end)), [numeric("start","First index",0,0,20,1),numeric("end","Stop before",1,0,20,1)]),
  cumulative: define("Running total", "Adds each new value to the previous total, preserving the intermediate states.", ["Sequence"], ([x])=>{let n=0;return vector(x).map(v=>n+=v);}),
  distances: define("Squared distances", "Compares one vector with every row of a table. Each result adds the squared coordinate differences.", ["Query vector", "Candidate rows"], ([q,rows])=>matrix(rows).map(r=>{const v=vector(q);if(r.length!==v.length)throw Error("The query and each candidate need the same number of coordinates.");return dot(r.map((x,i)=>x-v[i]),r.map((x,i)=>x-v[i]));})),
};
