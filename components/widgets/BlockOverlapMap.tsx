"use client";

// How many times each cell reaches the answer, and how long the answer is.
//
// The API does the arithmetic and counts, for every cell of the grid, how many
// blocks it belongs to; the browser draws that count map and the readouts
// beside it. The presets are the pedestrian detector's window, the scene this
// page works on, and a three by three grid small enough to add up by eye,
// where nine cells are described in sixteen cells' worth of numbers.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  SizeSettings,
  SizeView,
  fetchSize,
} from "@/lib/concepts/histogram-of-oriented-gradients";
import { Stat } from "./orientedGradientsDrawing";

const PRESETS: { label: string; settings: SizeSettings }[] = [
  { label: "a person, 64 by 128", settings: { height: 128, width: 64 } },
  { label: "the scene, 48 by 48", settings: { height: 48, width: 48 } },
  { label: "three cells square", settings: { height: 24, width: 24 } },
];

const SHADES = [
  "fill-slate-200 dark:fill-slate-800",
  "fill-indigo-200 dark:fill-indigo-900",
  "fill-indigo-400 dark:fill-indigo-700",
  "fill-indigo-500 dark:fill-indigo-600",
  "fill-indigo-700 dark:fill-indigo-400",
];

export function BlockOverlapMap({
  initialPreset = 2,
  showStride = true,
}: {
  initialPreset?: number;
  showStride?: boolean;
}) {
  const [preset, setPreset] = useState(initialPreset);
  const [stride, setStride] = useState(1);
  const [view, setView] = useState<SizeView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetchSize({ ...PRESETS[preset].settings, block_stride_in_cells: stride })
      .then((answer) => live && setView(answer))
      .catch((error) => {
        if (!live) return;
        setView(null);
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      });
    return () => {
      live = false;
    };
  }, [preset, stride]);

  const controls = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
      <span className="flex flex-wrap gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
        {PRESETS.map((choice, index) => (
          <button
            key={choice.label}
            onClick={() => setPreset(index)}
            className={
              "rounded px-2 py-0.5 text-xs font-medium transition " +
              (preset === index
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
            }
          >
            {choice.label}
          </button>
        ))}
      </span>
      {showStride && (
        <span className="flex flex-wrap gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {[1, 2].map((choice) => (
            <button
              key={choice}
              onClick={() => setStride(choice)}
              className={
                "rounded px-2 py-0.5 text-xs font-medium transition " +
                (stride === choice
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {choice === 1 ? "blocks overlap" : "blocks tile"}
            </button>
          ))}
        </span>
      )}
    </div>
  );

  if (!view) {
    return (
      <div>
        {controls}
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message ?? "…"}
        </p>
      </div>
    );
  }

  const unit = 20;
  const small = view.n_cell_columns <= 8;

  return (
    <div>
      {controls}

      <div className="mt-3 grid gap-3 sm:grid-cols-[auto_1fr]">
        <div className="mx-auto w-full max-w-[220px]">
          <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
            how many blocks each cell belongs to
          </p>
          <svg
            viewBox={`0 0 ${view.n_cell_columns * unit} ${view.n_cell_rows * unit}`}
            className="w-full rounded border border-slate-200 dark:border-slate-800"
          >
            {view.coverage.map((row, down) =>
              row.map((count, across) => (
                <g key={`${down}-${across}`}>
                  <rect
                    x={across * unit}
                    y={down * unit}
                    width={unit}
                    height={unit}
                    className={SHADES[Math.min(count, SHADES.length - 1)]}
                    stroke="white"
                    strokeWidth={0.6}
                  />
                  {small && (
                    <text
                      x={across * unit + unit / 2}
                      y={down * unit + unit / 2 + 3.5}
                      textAnchor="middle"
                      className="fill-white text-[9px] font-semibold"
                    >
                      {count}
                    </text>
                  )}
                </g>
              )),
            )}
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-2 self-start">
          <Stat
            label="cells"
            value={`${view.n_cell_rows} by ${view.n_cell_columns}, ${view.n_cells} in all`}
          />
          <Stat
            label="block positions"
            value={`${view.n_block_rows} by ${view.n_block_columns}, ${view.n_blocks} in all`}
          />
          <Stat
            label="cells' worth of numbers"
            value={`${view.cells_in_the_answer}`}
          />
          <Stat
            label="each cell described"
            value={`${view.repetition.toFixed(2)} times over`}
          />
          <Stat label="numbers in the answer" value={`${view.n_values}`} />
          <Stat
            label="numbers per pixel"
            value={view.numbers_per_pixel.toFixed(3)}
          />
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        A block is two cells by two and steps{" "}
        {view.block_stride_in_cells === 1 ? "one cell" : "two cells"} at a time,
        so a cell in the middle belongs to{" "}
        {view.block_stride_in_cells === 1 ? "four blocks" : "one block"} and
        reaches the answer that many times, each time divided by a different
        denominator. That is why {view.n_cells} cells come back as{" "}
        {view.cells_in_the_answer} cells&rsquo; worth of numbers.
      </p>
    </div>
  );
}
