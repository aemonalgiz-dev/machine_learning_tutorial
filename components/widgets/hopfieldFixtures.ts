// The Hopfield page's patterns, shared by every widget on it.
//
// Six shapes on twenty-five cells, of which the first three are what the
// playground opens with and all six are what its toggle stores; the four-cell
// pair the page works by hand; the two-unit pattern whose network the
// synchronous rule oscillates in; and the five cells the playground's first
// scramble flips, which the stepper and the self-connection dial reuse so the
// page can quote one walk everywhere.

export const SIDE = 5;
export const CELL_COUNT = SIDE * SIDE;

export function shape(rows: string[]): number[] {
  return rows.flatMap((row) => Array.from(row, (cell) => (cell === "#" ? 1 : -1)));
}

export interface StoredShape {
  name: string;
  cells: number[];
}

export const T_SHAPE: StoredShape = { name: "the T", cells: shape(["#####", "..#..", "..#..", "..#..", "..#.."]) };
export const L_SHAPE: StoredShape = { name: "the L", cells: shape(["#....", "#....", "#....", "#....", "#####"]) };
export const CROSS_SHAPE: StoredShape = { name: "the cross", cells: shape(["#...#", ".#.#.", "..#..", ".#.#.", "#...#"]) };
export const SQUARE_SHAPE: StoredShape = { name: "the square", cells: shape(["#####", "#...#", "#...#", "#...#", "#####"]) };
export const Z_SHAPE: StoredShape = { name: "the Z", cells: shape(["#####", "...#.", "..#..", ".#...", "#####"]) };
export const DIAMOND_SHAPE: StoredShape = { name: "the diamond", cells: shape(["..#..", ".#.#.", "#...#", ".#.#.", "..#.."]) };

// Chosen to overlap as little as twenty-five cells allow, so the load of
// 0.12 sits under the figure the page discusses.
export const THREE_SHAPES: StoredShape[] = [T_SHAPE, L_SHAPE, CROSS_SHAPE];

// Three more take the load to 0.24. Every one of the six is still a resting
// state, and the first scramble of the T then settles somewhere nobody stored.
export const THREE_MORE_SHAPES: StoredShape[] = [SQUARE_SHAPE, Z_SHAPE, DIAMOND_SHAPE];
export const SIX_SHAPES: StoredShape[] = [...THREE_SHAPES, ...THREE_MORE_SHAPES];

export function cellsOf(shapes: StoredShape[]): number[][] {
  return shapes.map((entry) => entry.cells);
}

// The five cells the playground's first scramble flips, drawn from its fixed
// sequence. Listed here so the other widgets can start from the same probe.
export const FIRST_SCRAMBLE: number[] = [7, 24, 23, 8, 5];

export function flippedAt(pattern: number[], cells: number[]): number[] {
  return pattern.map((value, index) => (cells.includes(index) ? -value : value));
}

// The scrambled T, which is the probe the page follows through recall.
export const SCRAMBLED_T: number[] = flippedAt(T_SHAPE.cells, FIRST_SCRAMBLE);

// The T with its first fifteen cells reversed, which is nearer its negation
// than itself, and which the two update rules settle differently from.
export const HALF_REVERSED_T: number[] = flippedAt(
  T_SHAPE.cells,
  Array.from({ length: 15 }, (_, index) => index),
);

// The four-cell pair the page works by hand, A and B, agreeing everywhere
// except the last cell, and A with its first cell flipped.
export const FOUR_CELL_A: number[] = [1, 1, -1, -1];
export const FOUR_CELL_B: number[] = [1, 1, -1, 1];
export const FOUR_CELL_PATTERNS: number[][] = [FOUR_CELL_A, FOUR_CELL_B];
export const FOUR_CELL_DAMAGED: number[] = [-1, 1, -1, -1];

// The single two-unit pattern whose network the synchronous rule cannot
// settle in from the probe (+1, +1).
export const TWO_UNIT_PATTERN: number[] = [1, -1];
export const TWO_UNIT_PROBE: number[] = [1, 1];

// The state the odd mixture of the three shapes gives, the sign of their
// sum cell by cell, which the page shows is a resting state nobody stored.
export const ODD_MIXTURE: number[] = T_SHAPE.cells.map((value, index) =>
  value + L_SHAPE.cells[index] + CROSS_SHAPE.cells[index] > 0 ? 1 : -1,
);

export function asSigns(state: number[]): string {
  return "(" + state.map((value) => (value > 0 ? "+1" : "−1")).join(", ") + ")";
}

export function settledLabel(into: { pattern_index: number | null; flipped: boolean }, stored: StoredShape[]): string {
  if (into.pattern_index === null) return "no stored shape";
  const name = stored[into.pattern_index].name;
  return into.flipped ? `${name}, inverted` : name;
}

export const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800";

export const PRIMARY_BUTTON_CLASS =
  "rounded-md border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-40 dark:border-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400";

export const SMALL_BUTTON_CLASS =
  "rounded border border-slate-300 bg-white px-2 text-sm font-medium leading-6 text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800";
