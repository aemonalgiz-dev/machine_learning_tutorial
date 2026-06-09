"use client";

// What the sweep costs in time, beside the layer it saves parameters against.
//
// The API times one forward pass through a convolution and one through a dense
// layer reading the same numbers and answering the same numbers, at three
// picture sizes, and reports the median of five runs of each. The bars are on a
// log scale, since the two figures are an order of magnitude apart at every
// size. These are a measurement of whichever machine served the request and
// will differ a little on each page load, which is why the widget prints the
// figures rather than the page quoting them. The browser draws the bars.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Cost, readCost } from "@/lib/concepts/convolution";

const FULL_BAR = 100;

function barShare(milliseconds: number, largest: number): number {
  if (largest <= 0 || milliseconds <= 0) return 2;
  const floor = 0.001;
  const span = Math.log10(largest / floor);
  return Math.max(2, (FULL_BAR * Math.log10(milliseconds / floor)) / span);
}

export function SweepCostTable() {
  const [cost, setCost] = useState<Cost | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCost(await readCost());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const largest = cost
    ? Math.max(...cost.rows.map((row) => row.sweep_milliseconds))
    : 0;

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="space-y-4">
        {(cost?.rows ?? []).map((row) => (
          <div key={row.side}>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {row.side} by {row.side} through {row.n_filters}{" "}
              {row.n_filters === 1 ? "filter" : "filters"}, answering (
              {row.answers.join(", ")})
            </p>
            <div className="mt-1 space-y-1">
              <Bar
                label="the sweep"
                milliseconds={row.sweep_milliseconds}
                share={barShare(row.sweep_milliseconds, largest)}
                fill="bg-indigo-600"
              />
              <Bar
                label="a dense layer of equal width"
                milliseconds={row.dense_milliseconds}
                share={barShare(row.dense_milliseconds, largest)}
                fill="bg-amber-500"
              />
            </div>
            <p className="mt-1 text-right text-[11px] text-slate-500 dark:text-slate-400">
              {row.ratio.toFixed(1)} times slower, holding{" "}
              {row.convolution_parameters.toLocaleString("en-US")} parameters
              against {row.dense_parameters.toLocaleString("en-US")}
            </p>
          </div>
        ))}
        {!cost && (
          <p className="text-center text-sm text-slate-400">…</p>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-500">
        {cost
          ? `Each figure is the median of ${cost.repeats} forward passes over a single picture, measured on the machine that served this page. The bars are on a log scale.`
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

function Bar({
  label,
  milliseconds,
  share,
  fill,
}: {
  label: string;
  milliseconds: number;
  share: number;
  fill: string;
}) {
  return (
    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
      <span className="w-44 shrink-0">{label}</span>
      <div className="h-4 flex-1 rounded-sm bg-slate-200 dark:bg-slate-800">
        <div
          className={"h-4 rounded-sm " + fill}
          style={{ width: `${share.toFixed(1)}%` }}
        />
      </div>
      <span className="w-24 text-right font-mono">
        {milliseconds.toFixed(3)} ms
      </span>
    </div>
  );
}
