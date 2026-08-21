// The grids every widget on the generative page shares, and the one component
// that draws them.
//
// Three shapes on twenty-five cells, written as 0 and 1 rather than the memory
// page's -1 and 1, because a unit here is off or on rather than down or up.
// The square is a fourth shape, deliberately never shown to the machine, so
// that the page has a grid it can put to a fitted machine knowing the answer
// was not memorised. The four-cell pair is the set small enough to trace a
// learning step on by hand, and the scatter is one grid of thirteen lit cells
// drawn once at random and written down here so that the page and its tests
// put the identical grid to the machine.
//
// One grid component serves both jobs, since a cell holding 0 or 1 and a cell
// holding a probability are drawn the same way, by laying the colour over a
// dark base at the value the cell holds.

export const SIDE = 5;
export const CELL_COUNT = SIDE * SIDE;

export function shape(rows: string[]): number[] {
  return rows.flatMap((row) =>
    Array.from(row, (cell) => (cell === "#" ? 1 : 0)),
  );
}

export interface StoredShape {
  name: string;
  label: string;
  cells: number[];
}

export const T_SHAPE: StoredShape = {
  name: "the T",
  label: "T",
  cells: shape(["#####", "..#..", "..#..", "..#..", "..#.."]),
};

export const L_SHAPE: StoredShape = {
  name: "the L",
  label: "L",
  cells: shape(["#....", "#....", "#....", "#....", "#####"]),
};

export const CROSS_SHAPE: StoredShape = {
  name: "the cross",
  label: "cross",
  cells: shape(["#...#", ".#.#.", "..#..", ".#.#.", "#...#"]),
};

// Never learned from. It shares the T's top row and the L's stem and foot, so
// it is close to what the machine knows without being any of it.
export const SQUARE_SHAPE: StoredShape = {
  name: "the square",
  label: "square",
  cells: shape(["#####", "#...#", "#...#", "#...#", "#####"]),
};

export const THREE_SHAPES: StoredShape[] = [T_SHAPE, L_SHAPE, CROSS_SHAPE];

export const PATTERNS: number[][] = THREE_SHAPES.map((entry) => entry.cells);

// The five cells the damage button flips, the same five the memory page's
// first scramble flips, so the two pages meet the same damaged T.
export const DAMAGED_CELLS = [5, 7, 8, 23, 24];

export function flippedAt(pattern: number[], cells: number[]): number[] {
  return pattern.map((value, index) =>
    cells.includes(index) ? 1 - value : value,
  );
}

export const DAMAGED_T: number[] = flippedAt(T_SHAPE.cells, DAMAGED_CELLS);

// Every cell reversed, which the memory scores exactly as it scores the T.
export const REVERSED_T: number[] = T_SHAPE.cells.map((value) => 1 - value);

// Thirteen lit cells drawn once at random and written down.
export const SCATTER: number[] = [
  1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1,
];

// The pencil set. Two rows of four cells, agreeing on the first three and
// differing on the last, which is small enough that a whole learning step fits
// into a table a reader can check.
export const FOUR_CELL_PAIR: number[][] = [
  [1, 1, 0, 0],
  [1, 1, 0, 1],
];

export const FOUR_CELL_HIDDEN_UNITS = 2;

export const DEFAULT_HIDDEN_UNITS = 3;
export const DEFAULT_EPOCHS = 500;

export const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800";

export const SMALL_BUTTON_CLASS =
  "rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800";

export const ACTIVE_BUTTON_CLASS =
  "rounded border border-indigo-600 bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white dark:border-indigo-500 dark:bg-indigo-500";

const SIZES = {
  tiny: "h-2.5 w-2.5",
  small: "h-3.5 w-3.5",
  medium: "h-5 w-5",
  large: "h-8 w-8",
} as const;

export type GridSize = keyof typeof SIZES;

// One grid of cells, each drawn at the value it holds. A stored shape holds 0
// or 1 and comes out solid or bare; a rebuild holds a probability and comes out
// as a wash in between.
export function CellGrid({
  values,
  columns = SIDE,
  size = "medium",
  amber = false,
  outlined = [],
}: {
  values: number[];
  columns?: number;
  size?: GridSize;
  amber?: boolean;
  outlined?: number[];
}) {
  return (
    <div
      className="grid gap-0.5"
      style={{ gridTemplateColumns: `repeat(${columns}, min-content)` }}
    >
      {values.map((value, index) => (
        <div
          key={index}
          title={value.toFixed(2)}
          className={
            "relative rounded-sm bg-slate-200 dark:bg-slate-700 " +
            SIZES[size] +
            (outlined.includes(index)
              ? " ring-2 ring-rose-500 ring-offset-1 dark:ring-offset-slate-900"
              : "")
          }
        >
          <div
            className={
              "absolute inset-0 rounded-sm " +
              (amber ? "bg-amber-500" : "bg-indigo-600")
            }
            style={{ opacity: Math.max(0, Math.min(1, value)) }}
          />
        </div>
      ))}
    </div>
  );
}

export function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
      {note && (
        <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {note}
        </div>
      )}
    </div>
  );
}

export function codeOf(probabilities: number[]): string {
  return probabilities.map((value) => Math.round(value)).join("");
}
