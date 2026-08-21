"use client";

// The same picture read twice, once as painted and once with its cells shuffled.
//
// The top pair is the picture and a fixed shuffle of it. Underneath, a dense
// layer of thirty-six outputs reads the picture, and the same layer with every
// neuron's weights moved by the same shuffle reads the shuffled picture; its
// answers are laid out in a six by six block only so that they fit beside the
// sweep's map, since nothing about a dense layer makes that block spatial. The
// bottom pair is one convolution's map on both pictures. The API builds both
// layers, shuffles both, and measures the two gaps. The browser lays the grids
// out and shades them.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Arrangement, Grid, readArrangement } from "@/lib/concepts/convolution";
import { answerShade, formatValue, largestMagnitude } from "./convolutionFixtures";

function asBlock(values: number[], width: number): Grid {
  const rows: Grid = [];
  for (let start = 0; start < values.length; start += width) {
    rows.push(values.slice(start, start + width));
  }
  return rows;
}

export function ShuffleComparison() {
  const [read, setRead] = useState<Arrangement | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setRead(await readArrangement());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const denseBlock = read ? asBlock(read.dense_answer, 6) : null;
  const denseRewiredBlock = read ? asBlock(read.dense_answer_rewired, 6) : null;

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-center gap-8">
        <Picture title="The picture" cells={read?.picture ?? null} />
        <Picture
          title="The same cells, shuffled"
          cells={read?.scrambled ?? null}
          caption={
            read
              ? `${read.picture_cells_moved} of ${read.n_picture_cells} cells changed`
              : "…"
          }
        />
      </div>

      <div className="mt-6 grid gap-6 border-t border-slate-200 pt-5 dark:border-slate-800 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-center text-xs font-medium text-slate-700 dark:text-slate-300">
            A layer that reads a row, rewired by the same shuffle
          </p>
          <div className="flex flex-wrap items-start justify-center gap-4">
            <Answers title="on the picture" values={denseBlock} />
            <Answers title="on the shuffle" values={denseRewiredBlock} />
          </div>
          <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            {read
              ? `largest gap ${read.dense_largest_gap.toExponential(2)}`
              : "…"}
          </p>
        </div>
        <div>
          <p className="mb-2 text-center text-xs font-medium text-slate-700 dark:text-slate-300">
            One kernel swept, unchanged
          </p>
          <div className="flex flex-wrap items-start justify-center gap-4">
            <Answers title="on the picture" values={read?.swept ?? null} />
            <Answers title="on the shuffle" values={read?.swept_scrambled ?? null} />
          </div>
          <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            {read ? `largest gap ${formatValue(read.swept_largest_gap)}` : "…"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Row reader, largest gap"
          value={read ? read.dense_largest_gap.toExponential(2) : "…"}
        />
        <Stat
          label="Sweep, largest gap"
          value={read ? formatValue(read.swept_largest_gap) : "…"}
        />
        <Stat
          label="Sweep cells changed"
          value={
            read
              ? `${read.swept_cells_changed} of ${read.n_answer_cells}`
              : "…"
          }
        />
        <Stat
          label="Parameters held"
          value={
            read
              ? `${read.convolution_parameters} against ${read.dense_parameters.toLocaleString("en-US")}`
              : "…"
          }
        />
      </div>

      <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-500">
        The rewired row reader answers what it answered before, to one rounding
        step. The sweep, given the same two pictures, answers something else
        entirely.
      </p>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Picture({
  title,
  cells,
  caption,
}: {
  title: string;
  cells: Grid | null;
  caption?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
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
      <span className="text-[11px] text-slate-500 dark:text-slate-400">
        {caption ?? "eight by eight"}
      </span>
    </div>
  );
}

function Answers({ title, values }: { title: string; values: Grid | null }) {
  const largest = values ? largestMagnitude(values) : 0;
  return (
    <div className="flex flex-col items-center gap-1">
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
                style={{ backgroundColor: answerShade(value, largest) }}
                className="flex h-6 w-8 items-center justify-center rounded-sm border border-slate-200 font-mono text-[10px] text-slate-800 dark:border-slate-800 dark:text-slate-100"
              >
                {formatValue(value)}
              </div>
            )),
          )}
        </div>
      ) : (
        <div className="flex h-20 w-24 items-center justify-center text-slate-400">
          …
        </div>
      )}
      <span className="text-[11px] text-slate-500 dark:text-slate-400">
        {title}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
