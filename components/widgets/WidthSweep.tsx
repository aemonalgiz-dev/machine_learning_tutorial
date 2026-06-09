"use client";

// Eight hidden widths, each a fresh fit on the same three shapes.
//
// The bar is the mean squared gap between the shapes and what comes back, the
// count under it is how many of the three shapes come back cell for cell, and
// the codes are what the hidden units read off each shape rounded to nought or
// one. Two widths in one is the width at which three shapes first get three
// different codes; the interesting part is that the bars do not fall steadily
// after that. The API fits at every width from the same seed; the browser draws
// the bars.

import { useEffect, useState } from "react";
import {
  ApiError,
  BoltzmannWidthSweep,
  sweepBoltzmannWidths,
} from "@/lib/concepts/restricted-boltzmann-machine";
import {
  DEFAULT_EPOCHS,
  PATTERNS,
  THREE_SHAPES,
} from "./boltzmannFixtures";

const WIDTHS = [1, 2, 3, 4, 5, 6, 7, 8];

const CHART = { width: 460, height: 190 };
const PAD = { left: 46, right: 10, top: 12, bottom: 42 };
const PLOT = {
  width: CHART.width - PAD.left - PAD.right,
  height: CHART.height - PAD.top - PAD.bottom,
};

let cached: Promise<BoltzmannWidthSweep> | null = null;

function swept(): Promise<BoltzmannWidthSweep> {
  cached ??= sweepBoltzmannWidths(PATTERNS, DEFAULT_EPOCHS, WIDTHS);
  return cached;
}

export function WidthSweep() {
  const [sweep, setSweep] = useState<BoltzmannWidthSweep | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSweep(await swept());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!sweep) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const worst = Math.max(...sweep.points.map((point) => point.reconstruction_error));
  const groupWidth = PLOT.width / sweep.points.length;
  const barWidth = Math.min(30, groupWidth * 0.5);
  const baseline = PAD.top + PLOT.height;

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="w-full select-none"
      >
        <line
          x1={PAD.left}
          y1={baseline}
          x2={PAD.left + PLOT.width}
          y2={baseline}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1}
        />
        <text
          x={PAD.left - 6}
          y={PAD.top + 8}
          textAnchor="end"
          className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400"
        >
          {worst.toFixed(3)}
        </text>
        <text
          x={PAD.left - 6}
          y={baseline + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400"
        >
          0
        </text>
        {sweep.points.map((point, index) => {
          const centre = PAD.left + (index + 0.5) * groupWidth;
          const height = (point.reconstruction_error / worst) * PLOT.height;
          return (
            <g key={point.n_hidden_units}>
              <rect
                x={centre - barWidth / 2}
                y={baseline - height}
                width={barWidth}
                height={height}
                className={
                  point.n_distinct_codes < sweep.n_patterns
                    ? "fill-amber-500"
                    : "fill-indigo-600"
                }
              >
                <title>{`${point.reconstruction_error.toFixed(4)} at ${point.n_hidden_units} hidden units`}</title>
              </rect>
              <text
                x={centre}
                y={baseline - height - 4}
                textAnchor="middle"
                className="fill-slate-600 text-[9px] font-medium dark:fill-slate-300"
              >
                {point.reconstruction_error.toFixed(3)}
              </text>
              <text
                x={centre}
                y={baseline + 14}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400"
              >
                {point.n_hidden_units}
              </text>
              <text
                x={centre}
                y={baseline + 26}
                textAnchor="middle"
                className="fill-slate-400 text-[9px] dark:fill-slate-500"
              >
                {point.patterns_rebuilt_exactly}/{sweep.n_patterns}
              </text>
            </g>
          );
        })}
        <text
          x={PAD.left + PLOT.width / 2}
          y={CHART.height - 4}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400"
        >
          Hidden units, with how many shapes come back cell for cell beneath
        </text>
      </svg>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {["hidden units", "gap", "different codes", ...THREE_SHAPES.map((entry) => entry.label)].map(
                (heading) => (
                  <th
                    key={heading}
                    className="py-2 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {sweep.points.map((point) => (
              <tr
                key={point.n_hidden_units}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {point.n_hidden_units}
                </td>
                <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {point.reconstruction_error.toFixed(4)}
                </td>
                <td
                  className={
                    "py-1 pr-4 font-mono " +
                    (point.n_distinct_codes < sweep.n_patterns
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-slate-800 dark:text-slate-200")
                  }
                >
                  {point.n_distinct_codes} of {sweep.n_patterns}
                </td>
                {point.codes.map((code, index) => (
                  <td
                    key={index}
                    className="py-1 pr-4 font-mono text-slate-500 last:pr-0 dark:text-slate-400"
                  >
                    {code.join("")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Amber marks a width at which two shapes share a code, which is the width
        being too narrow to tell them apart at all.
      </p>
    </div>
  );
}
