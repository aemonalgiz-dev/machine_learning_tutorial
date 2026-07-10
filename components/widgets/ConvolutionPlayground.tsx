"use client";

// One kernel swept across a picture the reader paints.
//
// The left grid is an eight by eight picture, every cell a zero or a one, and
// clicking or dragging paints it. The small grid is the kernel, nine weights
// the reader can type or set from a preset. The right grid is what the
// library's convolution answers, one cell for every place the window fitted,
// shaded indigo where the sum came out positive and amber where it came out
// negative. Hover an answer cell and the window that produced it lights up on
// the picture, with the nine products it summed laid out underneath. When
// padding is on the border of zeros is drawn too, so a window that begins on
// it has somewhere to be shown. Every answer, every window, every product and
// every parameter count comes from the API. The browser paints cells, edits
// weights and shades the result.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  Grid,
  KERNEL_SIDE,
  MAX_KERNEL_WEIGHT,
  PICTURE_SIDE,
  Sweep,
  sweepKernel,
} from "@/lib/concepts/convolution";

function drawn(rows: string[]): Grid {
  return rows.map((row) => Array.from(row, (cell) => (cell === "#" ? 1 : 0)));
}

interface PicturePreset {
  name: string;
  cells: Grid;
}

// A four by four square in the middle, whose left edge the page works by
// hand.
const SQUARE: Grid = drawn([
  "........",
  "........",
  "..####..",
  "..####..",
  "..####..",
  "..####..",
  "........",
  "........",
]);

const PICTURE_PRESETS: PicturePreset[] = [
  { name: "A square", cells: SQUARE },
  {
    name: "A bar",
    cells: drawn([
      "...##...",
      "...##...",
      "...##...",
      "...##...",
      "...##...",
      "...##...",
      "...##...",
      "...##...",
    ]),
  },
  {
    name: "A diagonal",
    cells: drawn([
      "#.......",
      ".#......",
      "..#.....",
      "...#....",
      "....#...",
      ".....#..",
      "......#.",
      ".......#",
    ]),
  },
  {
    name: "Clear",
    cells: drawn([
      "........",
      "........",
      "........",
      "........",
      "........",
      "........",
      "........",
      "........",
    ]),
  },
];

interface KernelPreset {
  name: string;
  weights: Grid;
}

const NINTH = 1 / 9;

// The two edge kernels are Sobel's, and the vertical one is the kernel the
// page works by hand. Blur and sharpen are the ones a reader will have met in
// an image editor, and identity is there to show a kernel that changes
// nothing.
const KERNEL_PRESETS: KernelPreset[] = [
  {
    name: "Vertical edge",
    weights: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ],
  },
  {
    name: "Horizontal edge",
    weights: [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ],
  },
  {
    name: "Blur",
    weights: [
      [NINTH, NINTH, NINTH],
      [NINTH, NINTH, NINTH],
      [NINTH, NINTH, NINTH],
    ],
  },
  {
    name: "Sharpen",
    weights: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
  },
  {
    name: "Identity",
    weights: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
  },
];

// The answer cell the page works by hand, shown whenever nothing is hovered.
const WORKED_CELL = { row: 2, column: 0 };

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const ACTIVE_BUTTON_CLASS =
  "rounded-md border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition dark:border-indigo-500 dark:bg-indigo-500";

const SMALL_BUTTON_CLASS =
  "rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const SMALL_ACTIVE_BUTTON_CLASS =
  "rounded border border-indigo-600 bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white transition dark:border-indigo-500 dark:bg-indigo-500";

function formatValue(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2);
}

// The kernel boxes hold text rather than numbers, so that a half-typed entry
// such as a lone minus sign can sit in the box while the last complete value
// is what goes to the API.
function asText(weights: Grid): string[][] {
  return weights.map((row) =>
    row.map((weight) =>
      Number.isInteger(weight) ? String(weight) : weight.toFixed(3),
    ),
  );
}

function sameGrid(first: Grid, second: Grid): boolean {
  return first.every((row, rowIndex) =>
    row.every((value, columnIndex) => value === second[rowIndex][columnIndex]),
  );
}

function replaced<T>(grid: T[][], row: number, column: number, value: T): T[][] {
  return grid.map((gridRow, rowIndex) =>
    rowIndex === row
      ? gridRow.map((cell, columnIndex) =>
          columnIndex === column ? value : cell,
        )
      : gridRow,
  );
}

// Indigo for a positive answer and amber for a negative one, at a strength
// proportional to the cell's share of the largest magnitude on the map.
function answerShade(value: number, largest: number): string {
  if (largest === 0 || value === 0) return "transparent";
  const strength = 0.15 + 0.75 * (Math.abs(value) / largest);
  return value > 0
    ? `rgba(79, 70, 229, ${strength.toFixed(3)})`
    : `rgba(245, 158, 11, ${strength.toFixed(3)})`;
}

interface Cell {
  row: number;
  column: number;
}

export function ConvolutionPlayground() {
  const [cells, setCells] = useState<Grid>(SQUARE);
  const [kernel, setKernel] = useState<Grid>(KERNEL_PRESETS[0].weights);
  const [kernelText, setKernelText] = useState<string[][]>(
    asText(KERNEL_PRESETS[0].weights),
  );
  const [stride, setStride] = useState(1);
  const [padding, setPadding] = useState(0);
  const [answer, setAnswer] = useState<Sweep | null>(null);
  const [hovered, setHovered] = useState<Cell | null>(null);
  const [brush, setBrush] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await sweepKernel(cells, kernel, { stride, padding }));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [cells, kernel, stride, padding]);

  const onCellPointerDown = (row: number, column: number) => {
    const value = cells[row][column] > 0 ? 0 : 1;
    setBrush(value);
    setCells((current) => replaced(current, row, column, value));
  };

  const onCellPointerEnter = (row: number, column: number) => {
    if (brush === null) return;
    setCells((current) => replaced(current, row, column, brush));
  };

  const choosePreset = (preset: KernelPreset) => {
    setKernel(preset.weights);
    setKernelText(asText(preset.weights));
  };

  const setWeight = (row: number, column: number, raw: string) => {
    setKernelText((current) => replaced(current, row, column, raw));
    const parsed = Number(raw);
    if (raw.trim() === "" || !Number.isFinite(parsed)) return;
    const bounded = Math.max(
      -MAX_KERNEL_WEIGHT,
      Math.min(MAX_KERNEL_WEIGHT, parsed),
    );
    setKernel((current) => replaced(current, row, column, bounded));
  };

  const activeKernel = KERNEL_PRESETS.find((preset) =>
    sameGrid(preset.weights, kernel),
  );

  // The window laid out underneath is the hovered one, or the page's worked
  // cell when nothing is hovered and the answer is large enough to hold it.
  let shown: Cell | null = null;
  if (answer) {
    const fits = (cell: Cell) =>
      cell.row < answer.output_height && cell.column < answer.output_width;
    if (hovered && fits(hovered)) shown = hovered;
    else if (fits(WORKED_CELL)) shown = WORKED_CELL;
    else shown = { row: 0, column: 0 };
  }
  const shownWindow =
    answer && shown ? answer.windows[shown.row][shown.column] : null;
  const shownValue =
    answer && shown ? answer.output[shown.row][shown.column] : null;

  const largest = answer
    ? Math.max(0, ...answer.output.flat().map((value) => Math.abs(value)))
    : 0;

  const insideWindow = (row: number, column: number) =>
    shownWindow !== null &&
    row >= shownWindow.top &&
    row < shownWindow.top + KERNEL_SIDE &&
    column >= shownWindow.left &&
    column < shownWindow.left + KERNEL_SIDE;

  // The picture is drawn with its border of zeros in place when padding is
  // on, so a window that begins on the border has somewhere to be shown.
  const borderedSide = PICTURE_SIDE + 2 * padding;
  const borderedIndices = Array.from(
    { length: borderedSide },
    (_, index) => index - padding,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {PICTURE_PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => setCells(preset.cells)}
            className={
              sameGrid(preset.cells, cells) ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS
            }
          >
            {preset.name}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1">
            stride
            {[1, 2].map((choice) => (
              <button
                key={choice}
                onClick={() => setStride(choice)}
                className={
                  stride === choice
                    ? SMALL_ACTIVE_BUTTON_CLASS
                    : SMALL_BUTTON_CLASS
                }
              >
                {choice}
              </button>
            ))}
          </span>
          <span className="flex items-center gap-1">
            padding
            {[0, 1].map((choice) => (
              <button
                key={choice}
                onClick={() => setPadding(choice)}
                className={
                  padding === choice
                    ? SMALL_ACTIVE_BUTTON_CLASS
                    : SMALL_BUTTON_CLASS
                }
              >
                {choice}
              </button>
            ))}
          </span>
        </div>
      </div>

      <div
        className="flex flex-wrap items-start justify-center gap-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-950"
        onPointerUp={() => setBrush(null)}
        onPointerLeave={() => setBrush(null)}
      >
        <div className="flex flex-col items-center gap-2">
          <div
            className="grid touch-none select-none gap-0.5"
            style={{
              gridTemplateColumns: `repeat(${borderedSide}, minmax(0, 1fr))`,
            }}
          >
            {borderedIndices.map((row) =>
              borderedIndices.map((column) => {
                const onPicture =
                  row >= 0 &&
                  row < PICTURE_SIDE &&
                  column >= 0 &&
                  column < PICTURE_SIDE;
                const highlighted = insideWindow(row, column);
                if (!onPicture) {
                  return (
                    <div
                      key={`${row},${column}`}
                      className={
                        "h-7 w-7 rounded-sm border border-dashed border-slate-300 dark:border-slate-700" +
                        (highlighted ? " ring-2 ring-amber-500" : "")
                      }
                    />
                  );
                }
                const lit = cells[row][column] > 0;
                return (
                  <button
                    key={`${row},${column}`}
                    type="button"
                    aria-label={`pixel row ${row}, column ${column}, ${lit ? "one" : "zero"}`}
                    onPointerDown={() => onCellPointerDown(row, column)}
                    onPointerEnter={() => onCellPointerEnter(row, column)}
                    className={
                      "h-7 w-7 cursor-pointer rounded-sm hover:opacity-80 " +
                      (lit
                        ? "bg-indigo-600"
                        : "bg-slate-200 dark:bg-slate-700") +
                      (highlighted ? " ring-2 ring-amber-500" : "")
                    }
                  />
                );
              }),
            )}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            The picture. Click or drag to paint.
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="grid grid-cols-3 gap-0.5">
            {kernelText.map((textRow, row) =>
              textRow.map((text, column) => (
                <input
                  key={`${row},${column}`}
                  type="number"
                  step="any"
                  min={-MAX_KERNEL_WEIGHT}
                  max={MAX_KERNEL_WEIGHT}
                  value={text}
                  aria-label={`kernel row ${row}, column ${column}`}
                  onChange={(event) =>
                    setWeight(row, column, event.target.value)
                  }
                  className="h-9 w-12 rounded-sm border border-slate-300 bg-white text-center font-mono text-xs text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              )),
            )}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            The kernel
          </span>
          <div className="flex max-w-40 flex-wrap justify-center gap-1">
            {KERNEL_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => choosePreset(preset)}
                className={
                  activeKernel?.name === preset.name
                    ? SMALL_ACTIVE_BUTTON_CLASS
                    : SMALL_BUTTON_CLASS
                }
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          {answer ? (
            <div
              className="grid gap-0.5"
              style={{
                gridTemplateColumns: `repeat(${answer.output_width}, minmax(0, 1fr))`,
              }}
              onPointerLeave={() => setHovered(null)}
            >
              {answer.output.map((outputRow, row) =>
                outputRow.map((value, column) => {
                  const isShown =
                    shown !== null &&
                    shown.row === row &&
                    shown.column === column;
                  return (
                    <div
                      key={`${row},${column}`}
                      onPointerEnter={() => setHovered({ row, column })}
                      style={{ backgroundColor: answerShade(value, largest) }}
                      className={
                        "flex h-9 w-9 items-center justify-center rounded-sm border font-mono text-[11px] text-slate-800 dark:text-slate-100 " +
                        (isShown
                          ? "border-amber-500 ring-2 ring-amber-500"
                          : "border-slate-200 dark:border-slate-800")
                      }
                    >
                      {formatValue(value)}
                    </div>
                  );
                }),
              )}
            </div>
          ) : (
            <div className="flex h-56 w-56 items-center justify-center text-sm text-slate-400">
              …
            </div>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {answer
              ? `The answer, ${answer.output_height} by ${answer.output_width}. Hover a cell.`
              : "The answer"}
          </span>
        </div>
      </div>

      {shownWindow && shown && shownValue !== null && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 rounded-lg bg-slate-100 px-3 py-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <span className="w-full text-center sm:w-auto">
            Answer row {shown.row}, column {shown.column} reads picture rows{" "}
            {shownWindow.top} to {shownWindow.top + KERNEL_SIDE - 1}, columns{" "}
            {shownWindow.left} to {shownWindow.left + KERNEL_SIDE - 1}.
          </span>
          <SmallGrid values={shownWindow.patch} label="what it read" />
          <span className="font-mono text-base">×</span>
          <SmallGrid values={kernel} label="the kernel" />
          <span className="font-mono text-base">=</span>
          <SmallGrid values={shownWindow.products} label="the products" />
          <span className="font-mono text-base">
            Σ = {formatValue(shownValue)}
          </span>
        </div>
      )}

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Indigo is a positive sum and amber a negative one. Every cell of the
        answer was formed by the same nine weights, moved to a different
        place.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat
          label="Answer"
          value={
            answer ? `${answer.output_height} × ${answer.output_width}` : "…"
          }
        />
        <Stat
          label="Convolution"
          value={
            answer ? answer.parameters.convolution.toLocaleString("en-US") : "…"
          }
        />
        <Stat
          label="Window, nothing shared"
          value={
            answer ? answer.parameters.unshared.toLocaleString("en-US") : "…"
          }
        />
        <Stat
          label="Dense, equal width"
          value={answer ? answer.parameters.dense.toLocaleString("en-US") : "…"}
        />
        <Stat
          label="Times fewer"
          value={answer ? formatValue(answer.parameters.ratio) : "…"}
        />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function SmallGrid({ values, label }: { values: Grid; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="grid grid-cols-3 gap-0.5">
        {values.map((row, rowIndex) =>
          row.map((value, columnIndex) => (
            <div
              key={`${rowIndex},${columnIndex}`}
              className="flex h-7 w-9 items-center justify-center rounded-sm bg-white font-mono text-[11px] text-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              {formatValue(value)}
            </div>
          )),
        )}
      </div>
      <span className="text-[10px] text-slate-500 dark:text-slate-400">
        {label}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
