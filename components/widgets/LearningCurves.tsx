"use client";

// Scores against rounds, one line per configuration, on rows the fit saw
// and on rows it never saw.
//
// Every configuration is fitted once at the full round count on the same
// forty-two training rows of the sixty-measurement throw and replayed one
// member at a time, so a point at round k is the committee cut to its first
// k members. Solid lines are the held-out score on the eighteen rows the
// seeded deal kept back, dashed lines the training score when asked for,
// and a marker sits on each held-out line at the first round its score was
// highest. The API fits and scores; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { LearningCurves as Curves, traceLearningCurves } from "@/lib/concepts/gradient-boosting";
import { SERIES_COLOURS } from "./gradientBoostingFixtures";

const VIEW = { width: 640, height: 320 };
const PAD = { left: 52, right: 16, top: 16, bottom: 40 };

export interface CurveSpec {
  learningRate: number;
  maxDepth: number;
  label: string;
}

export function LearningCurves({
  points,
  configurations,
  maxRounds = 300,
  showTraining = false,
  floor = -0.2,
}: {
  points: Point[];
  configurations: CurveSpec[];
  maxRounds?: number;
  showTraining?: boolean;
  floor?: number;
}) {
  const [curves, setCurves] = useState<Curves | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCurves(
          await traceLearningCurves(
            points,
            maxRounds,
            configurations.map((spec) => ({ learning_rate: spec.learningRate, max_depth: spec.maxDepth })),
          ),
        );
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    // The configurations are a literal on the page; the points and count are what change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, maxRounds]);

  if (!curves) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const plotWidth = VIEW.width - PAD.left - PAD.right;
  const plotHeight = VIEW.height - PAD.top - PAD.bottom;
  const toX = (round: number) => PAD.left + (round / maxRounds) * plotWidth;
  const toY = (score: number) => PAD.top + (1 - (Math.max(floor, score) - floor) / (1 - floor)) * plotHeight;
  const path = (values: number[]) =>
    values.map((value, index) => `${index === 0 ? "M" : "L"} ${toX(index).toFixed(1)} ${toY(value).toFixed(1)}`).join(" ");
  const yTicks = [];
  for (let tick = Math.ceil(floor * 5) / 5; tick <= 1.0001; tick += 0.2) yTicks.push(Math.round(tick * 10) / 10);
  const xTicks = [0, 50, 100, 150, 200, 250, 300].filter((tick) => tick <= maxRounds);

  return (
    <div>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {yTicks.map((tick) => (
          <g key={`y${tick}`}>
            <line x1={PAD.left} y1={toY(tick)} x2={PAD.left + plotWidth} y2={toY(tick)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <text x={PAD.left - 8} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
              {tick.toFixed(1)}
            </text>
          </g>
        ))}
        {xTicks.map((tick) => (
          <g key={`x${tick}`}>
            <line x1={toX(tick)} y1={PAD.top} x2={toX(tick)} y2={PAD.top + plotHeight} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <text x={toX(tick)} y={PAD.top + plotHeight + 16} textAnchor="middle" className="fill-slate-400 text-[11px]">
              {tick}
            </text>
          </g>
        ))}
        {curves.curves.map((curve, index) => (
          <g key={index}>
            {showTraining && (
              <path d={path(curve.train_r_squared)} fill="none" stroke={SERIES_COLOURS[index % SERIES_COLOURS.length]} strokeWidth={1.5} strokeDasharray="5 3" opacity={0.7} />
            )}
            <path d={path(curve.held_out_r_squared)} fill="none" stroke={SERIES_COLOURS[index % SERIES_COLOURS.length]} strokeWidth={2.2} />
            <circle cx={toX(curve.best_round)} cy={toY(curve.best_held_out_r_squared)} r={4.5} fill={SERIES_COLOURS[index % SERIES_COLOURS.length]} stroke="white" strokeWidth={1.5} />
          </g>
        ))}
        <text x={PAD.left + plotWidth / 2} y={VIEW.height - 6} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
          Rounds
        </text>
        <text x={14} y={PAD.top + plotHeight / 2} textAnchor="middle" transform={`rotate(-90 14 ${PAD.top + plotHeight / 2})`} className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
          R²
        </text>
      </svg>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">configuration</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">rounds to train {curves.train_threshold.toFixed(2)}</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">best held-out</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">at round</th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">held-out at {maxRounds}</th>
            </tr>
          </thead>
          <tbody>
            {curves.curves.map((curve, index) => (
              <tr key={index} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-1.5 pr-4 font-medium" style={{ color: SERIES_COLOURS[index % SERIES_COLOURS.length] }}>
                  {configurations[index]?.label ?? `rate ${curve.learning_rate}, depth ${curve.max_depth}`}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{curve.rounds_to_train === null ? "never" : curve.rounds_to_train}</td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{curve.best_held_out_r_squared.toFixed(4)}</td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{curve.best_round}</td>
                <td className="py-1.5 font-mono text-slate-800 dark:text-slate-200">{curve.final_held_out_r_squared.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {curves.n_training} training rows and {curves.n_held_out} held out under the site&rsquo;s seeded deal. Solid lines are held-out scores{showTraining ? ", dashed lines training scores" : ""}, and each dot marks the first round a held-out score was highest.
      </p>
      {message && <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
