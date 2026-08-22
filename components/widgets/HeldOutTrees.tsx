"use client";

// Four trees held back, read against the twenty that were kept and against
// themselves.
//
// The four wettest trees in the orchard are held out, a line is fitted on the
// twenty that remain, and the four are then put through that line twice: once
// with the average and spread the twenty taught, which is the rule, and once
// with the average and spread of the four themselves, which is the mistake.
// The number line shows where the four land under each reading, and the table
// carries what the line then predicted against what the trees really bore. The
// API fits and predicts; the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { HoldOut, fetchHoldOut } from "@/lib/concepts/the-standard-score";
import { HIGHLIGHT_COLOUR, WATER_COLOUR } from "./standardScoreFixtures";

const VIEW = { width: 640, height: 128 };
const PAD = { left: 132, right: 24 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right };
const SCORE_MIN = -2.5;
const SCORE_MAX = 2.5;

export function HeldOutTrees() {
  const [holdOut, setHoldOut] = useState<HoldOut | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setHoldOut(await fetchHoldOut());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!holdOut) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const at = (score: number) =>
    PAD.left +
    ((Math.min(SCORE_MAX, Math.max(SCORE_MIN, score)) - SCORE_MIN) /
      (SCORE_MAX - SCORE_MIN)) *
      PLOT.width;

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <text x={PAD.left} y={16} className="fill-slate-500 text-[11px] dark:fill-slate-400">
          where the four held-out trees&rsquo; water lands, in deviations
        </text>
        {[-2, -1, 0, 1, 2].map((tick) => (
          <g key={tick}>
            <line
              x1={at(tick)}
              y1={28}
              x2={at(tick)}
              y2={96}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeDasharray={tick === 0 ? undefined : "3 3"}
            />
            <text
              x={at(tick)}
              y={112}
              textAnchor="middle"
              className="fill-slate-400 text-[10px] dark:fill-slate-500"
            >
              {tick}
            </text>
          </g>
        ))}
        {holdOut.readings.map((reading, row) => {
          const y = 46 + row * 34;
          return (
            <g key={reading.reading}>
              <text
                x={PAD.left - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-600 text-[11px] dark:fill-slate-300"
              >
                {reading.reading === "training"
                  ? "against the twenty kept"
                  : "against themselves"}
              </text>
              <line
                x1={PAD.left}
                y1={y}
                x2={PAD.left + PLOT.width}
                y2={y}
                className="stroke-slate-300 dark:stroke-slate-700"
              />
              {reading.water_scores.map((score, index) => (
                <circle
                  key={index}
                  cx={at(score)}
                  cy={y}
                  r={6}
                  fill={row === 0 ? WATER_COLOUR : HIGHLIGHT_COLOUR}
                />
              ))}
            </g>
          );
        })}
      </svg>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                tree
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                water, m
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                really bore, kg
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                predicted against the twenty
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                predicted against themselves
              </th>
            </tr>
          </thead>
          <tbody>
            {holdOut.held_out.map((tree, index) => (
              <tr
                key={tree}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {holdOut.girth[index]} mm
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {holdOut.water[index].toFixed(2)}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {holdOut.borne[index].toFixed(2)}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {holdOut.readings[0].predicted[index].toFixed(2)}
                </td>
                <td className="py-2 font-mono text-slate-800 dark:text-slate-200">
                  {holdOut.readings[1].predicted[index].toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Worst error against the twenty kept,{" "}
        {holdOut.readings[0].largest_error.toFixed(2)} kg; against themselves,{" "}
        {holdOut.readings[1].largest_error.toFixed(2)} kg. The four trees were
        the same four in both rows.
      </p>
    </div>
  );
}
