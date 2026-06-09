"use client";

// The picture slid sideways, and what three readers make of the move.
//
// Choose a kernel and a distance, and the widget shows the picture at that
// distance, the map the sweep answers with, and the map at rest moved by the
// same number of positions, so the two can be compared cell by cell. The table
// underneath runs every distance at once and carries three columns: how far the
// sweep's answer is from the moved answer, what a dense layer holding a single
// fixed detector says, and how far a dense layer of the same width as the sweep
// moved. The API builds all three layers and measures every gap. The browser
// draws the grids and the table.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Grid, ShiftSweep, sweepShifts } from "@/lib/concepts/convolution";
import {
  KERNEL_PRESETS,
  answerShade,
  formatValue,
  largestMagnitude,
} from "./convolutionFixtures";

const SHIFTS = [0, 1, 2, 3];

const SMALL_BUTTON_CLASS =
  "rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const SMALL_ACTIVE_BUTTON_CLASS =
  "rounded border border-indigo-600 bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white transition dark:border-indigo-500 dark:bg-indigo-500";

// The resting map slid `columns` positions to the right, the columns that
// enter at the left having nothing to be compared against.
function movedRight(map: Grid, columns: number): (number | null)[][] {
  return map.map((row) =>
    row.map((_, column) =>
      column - columns >= 0 ? row[column - columns] : null,
    ),
  );
}

export function ShiftLedger() {
  const [kernelName, setKernelName] = useState(KERNEL_PRESETS[0].name);
  const [chosen, setChosen] = useState(1);
  const [swept, setSwept] = useState<ShiftSweep | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const kernel =
    KERNEL_PRESETS.find((preset) => preset.name === kernelName) ??
    KERNEL_PRESETS[0];

  useEffect(() => {
    (async () => {
      try {
        setSwept(await sweepShifts(kernel.weights, 1, SHIFTS));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [kernel]);

  const entry = swept?.shifts.find((one) => one.shift === chosen) ?? null;
  const expected =
    swept && entry && entry.output_shift !== null
      ? movedRight(swept.resting_swept, entry.output_shift)
      : null;

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <span className="flex flex-wrap items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
          kernel
          {KERNEL_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setKernelName(preset.name)}
              className={
                preset.name === kernelName
                  ? SMALL_ACTIVE_BUTTON_CLASS
                  : SMALL_BUTTON_CLASS
              }
            >
              {preset.name}
            </button>
          ))}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
          moved across by
          {SHIFTS.map((shift) => (
            <button
              key={shift}
              onClick={() => setChosen(shift)}
              className={
                shift === chosen
                  ? SMALL_ACTIVE_BUTTON_CLASS
                  : SMALL_BUTTON_CLASS
              }
            >
              {shift}
            </button>
          ))}
        </span>
      </div>

      <div className="flex flex-wrap items-start justify-center gap-6">
        <PicturePanel title="The picture, moved" cells={entry?.picture ?? null} />
        <MapPanel
          title="What the sweep answers"
          values={entry?.swept ?? null}
          caption={
            entry ? `${entry.swept_cells_changed} of 36 cells changed` : "…"
          }
        />
        <MapPanel
          title="The resting answer, moved by the same amount"
          values={expected}
          caption={
            entry && entry.largest_gap !== null
              ? `largest gap ${formatValue(entry.largest_gap)}`
              : "…"
          }
        />
      </div>

      <div className="mt-5 overflow-x-auto border-t border-slate-200 pt-4 dark:border-slate-800">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-4 font-medium">moved by</th>
              <th className="py-1 pr-4 font-medium">sweep, gap from moved answer</th>
              <th className="py-1 pr-4 font-medium">one fixed detector</th>
              <th className="py-1 pr-4 font-medium">equal width, gap</th>
              <th className="py-1 font-medium">equal width, largest answer</th>
            </tr>
          </thead>
          <tbody className="font-mono text-slate-700 dark:text-slate-300">
            {(swept?.shifts ?? []).map((one) => (
              <tr
                key={one.shift}
                className="border-t border-slate-200 dark:border-slate-800"
              >
                <td className="py-1.5 pr-4">{one.shift}</td>
                <td className="py-1.5 pr-4">
                  {one.largest_gap === null
                    ? "no position to move to"
                    : formatValue(one.largest_gap)}
                </td>
                <td className="py-1.5 pr-4">
                  {formatValue(one.detector_answer)}
                </td>
                <td className="py-1.5 pr-4">
                  {one.dense_largest_gap === null
                    ? "no position to move to"
                    : one.dense_largest_gap.toFixed(3)}
                </td>
                <td className="py-1.5">
                  {one.dense_largest_answer.toFixed(3)}
                </td>
              </tr>
            ))}
            {!swept && (
              <tr>
                <td className="py-1.5">…</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-500">
        {swept
          ? `The single detector answers ${formatValue(swept.detector_at_rest)} where the square rests and nothing anywhere else. The sweep answers the same number at the position the square moved to.`
          : "…"}
      </p>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function PicturePanel({ title, cells }: { title: string; cells: Grid | null }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="max-w-[11rem] text-center text-xs font-medium text-slate-700 dark:text-slate-300">
        {title}
      </span>
      {cells ? (
        <div className="grid grid-cols-8 gap-0.5">
          {cells.map((row, rowIndex) =>
            row.map((value, columnIndex) => (
              <div
                key={`${rowIndex},${columnIndex}`}
                className={
                  "h-5 w-5 rounded-sm " +
                  (value > 0
                    ? "bg-indigo-600"
                    : "bg-slate-200 dark:bg-slate-700")
                }
              />
            )),
          )}
        </div>
      ) : (
        <div className="flex h-20 w-20 items-center justify-center text-slate-400">
          …
        </div>
      )}
    </div>
  );
}

function MapPanel({
  title,
  values,
  caption,
}: {
  title: string;
  values: (number | null)[][] | null;
  caption: string;
}) {
  const largest = values
    ? largestMagnitude(values.map((row) => row.map((value) => value ?? 0)))
    : 0;
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="max-w-[11rem] text-center text-xs font-medium text-slate-700 dark:text-slate-300">
        {title}
      </span>
      {values ? (
        <div
          className="grid gap-0.5"
          style={{
            gridTemplateColumns: `repeat(${values[0].length}, minmax(0, 1fr))`,
          }}
        >
          {values.map((row, rowIndex) =>
            row.map((value, columnIndex) => (
              <div
                key={`${rowIndex},${columnIndex}`}
                style={{
                  backgroundColor:
                    value === null ? "transparent" : answerShade(value, largest),
                }}
                className={
                  "flex h-7 w-8 items-center justify-center rounded-sm border font-mono text-[10px] text-slate-800 dark:text-slate-100 " +
                  (value === null
                    ? "border-dashed border-slate-300 dark:border-slate-700"
                    : "border-slate-200 dark:border-slate-800")
                }
              >
                {value === null ? "" : formatValue(value)}
              </div>
            )),
          )}
        </div>
      ) : (
        <div className="flex h-24 w-32 items-center justify-center text-slate-400">
          …
        </div>
      )}
      <span className="text-[11px] text-slate-500 dark:text-slate-400">
        {caption}
      </span>
    </div>
  );
}
