"use client";

// One round of boosting at a time, with what the round was handed.
//
// The upper picture is the throw with the committee's answer after the
// current round, the previous round's answer left faint behind it so the
// correction is visible as the gap between the two. The lower picture is
// what the next round is fitted to: every reading's miss, drawn as a bar
// from zero, with the stump the round fits to those misses laid over them
// as its two shelves. Stepping forward folds a fraction of that stump into
// the answer above and the bars shrink. The API fits once and replays the
// members in order; the browser only draws.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { BoostingRounds, stepBoostingRounds } from "@/lib/concepts/gradient-boosting";
import { BOOSTING_COLOUR, STUMPS_COLOUR, THROW_DOMAIN } from "./gradientBoostingFixtures";

const VIEW = { width: 640, height: 300 };
const PAD = { left: 52, right: 16, top: 14, bottom: 30 };
const LOWER = { width: 640, height: 200 };

export function RoundStepper({
  points,
  learningRate,
  rounds,
  maxDepth = 1,
  initialRound = 1,
  domain,
}: {
  points: Point[];
  learningRate: number;
  rounds: number;
  maxDepth?: number;
  initialRound?: number;
  domain?: { xMin: number; xMax: number; yMin: number; yMax: number };
}) {
  const [replay, setReplay] = useState<BoostingRounds | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [round, setRound] = useState(initialRound);

  useEffect(() => {
    (async () => {
      try {
        setReplay(await stepBoostingRounds(points, rounds, learningRate, maxDepth));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [points, rounds, learningRate, maxDepth]);

  if (!replay) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const window = domain ?? THROW_DOMAIN;
  const plotWidth = VIEW.width - PAD.left - PAD.right;
  const plotHeight = VIEW.height - PAD.top - PAD.bottom;
  const toX = (x: number) => PAD.left + ((x - window.xMin) / (window.xMax - window.xMin)) * plotWidth;
  const toY = (y: number) => PAD.top + (1 - (y - window.yMin) / (window.yMax - window.yMin)) * plotHeight;

  // Round zero is the flat start; round k is the answer after k members.
  const current = round === 0 ? null : replay.rounds[round - 1];
  const next = round < replay.rounds.length ? replay.rounds[round] : null;
  const previous = round >= 2 ? replay.rounds[round - 2] : null;
  const flat = replay.grid.map(() => replay.initial_prediction);
  const currentCurve = current ? current.running_curve : flat;
  const previousCurve = round === 0 ? null : previous ? previous.running_curve : flat;
  const path = (values: number[]) =>
    values.map((value, index) => `${index === 0 ? "M" : "L"} ${toX(replay.grid[index]).toFixed(1)} ${toY(value).toFixed(1)}`).join(" ");

  // The lower picture: the misses the next round is handed, on their own scale.
  const residuals = next ? next.residuals_before : (current ? current.running_predictions.map((value, index) => points[index].y - value) : points.map((point) => point.y - replay.initial_prediction));
  const largest = Math.max(1, ...residuals.map((value) => Math.abs(value)), ...(next ? next.member_curve.map((value) => Math.abs(value)) : []));
  const lowerPlotHeight = LOWER.height - PAD.top - PAD.bottom;
  const toResidualY = (value: number) => PAD.top + (1 - (value + largest) / (2 * largest)) * lowerPlotHeight;
  const zeroY = toResidualY(0);

  const sumBefore = next ? next.residual_sum_before : current ? current.residual_sum_after : replay.residual_sum_at_start;
  const sumAfter = current ? current.residual_sum_after : replay.residual_sum_at_start;
  const format = (value: number, digits = 2) => value.toFixed(digits);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 pb-3">
        <button onClick={() => setRound((value) => Math.max(0, value - 1))} className={buttonClass} disabled={round === 0}>
          Previous round
        </button>
        <button onClick={() => setRound((value) => Math.min(replay.rounds.length, value + 1))} className={buttonClass} disabled={round === replay.rounds.length}>
          Next round
        </button>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          Round
          <input type="range" min={0} max={replay.rounds.length} step={1} value={round} onChange={(event) => setRound(Number(event.target.value))} className="w-36 accent-indigo-600" />
          <span className="w-8 font-mono text-sm">{round}</span>
        </label>
        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
          rate {learningRate.toFixed(2)}, depth {maxDepth}
        </span>
      </div>

      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <Axes toX={toX} toY={toY} window={window} plotHeight={plotHeight} plotWidth={plotWidth} height={VIEW.height} />
        {previousCurve && (
          <path d={path(previousCurve)} fill="none" stroke={BOOSTING_COLOUR} strokeWidth={2} opacity={0.25} />
        )}
        <path d={path(currentCurve)} fill="none" stroke={BOOSTING_COLOUR} strokeWidth={2.5} />
        {points.map((point, index) => {
          const fitted = current ? current.running_predictions[index] : replay.initial_prediction;
          return (
            <g key={index}>
              <line x1={toX(point.x)} y1={toY(point.y)} x2={toX(point.x)} y2={toY(fitted)} stroke="currentColor" className="text-slate-400 dark:text-slate-600" strokeWidth={1} strokeDasharray="3 2" />
              <circle cx={toX(point.x)} cy={toY(point.y)} r={5} className="fill-slate-700 stroke-white dark:fill-slate-200 dark:stroke-slate-900" strokeWidth={1.5} />
            </g>
          );
        })}
        <text x={PAD.left + 8} y={PAD.top + 14} className="fill-slate-500 text-[11px] dark:fill-slate-400">
          {round === 0 ? "the flat start, the mean height" : `the committee after round ${round}`}
        </text>
      </svg>

      <svg viewBox={`0 0 ${LOWER.width} ${LOWER.height}`} className="mt-2 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <line x1={PAD.left} y1={zeroY} x2={LOWER.width - PAD.right} y2={zeroY} stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
        {[-largest, largest].map((tick) => (
          <text key={tick} x={PAD.left - 8} y={toResidualY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
            {tick > 0 ? "+" : ""}{tick.toFixed(1)}
          </text>
        ))}
        {residuals.map((value, index) => (
          <rect
            key={index}
            x={toX(points[index].x) - 3}
            y={Math.min(zeroY, toResidualY(value))}
            width={6}
            height={Math.abs(toResidualY(value) - zeroY)}
            className="fill-slate-500 dark:fill-slate-400"
            opacity={0.8}
          />
        ))}
        {next && (
          <path
            d={next.member_curve.map((value, index) => `${index === 0 ? "M" : "L"} ${toX(replay.grid[index]).toFixed(1)} ${toResidualY(value).toFixed(1)}`).join(" ")}
            fill="none"
            stroke={STUMPS_COLOUR}
            strokeWidth={2.5}
          />
        )}
        <text x={PAD.left + 8} y={PAD.top + 12} className="fill-slate-500 text-[11px] dark:fill-slate-400">
          {next ? `what round ${next.number} is fitted to, and the ${next.n_leaves === 2 ? "stump" : "member"} it fits` : "what is left after the last round"}
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="squared misses now" value={format(sumAfter, sumAfter < 10 ? 3 : 1)} />
        <Stat label="R² now" value={current ? format(current.r_squared_after, 3) : "0.000"} />
        <Stat label={next ? `round ${next.number} asks` : "next round"} value={next && next.threshold !== null ? `t < ${format(next.threshold, 2)}` : next ? `${next.n_leaves} leaves` : "none left"} />
        <Stat
          label={next && next.left_value !== null ? "answers below, at or above" : "squared misses handed on"}
          value={next && next.left_value !== null && next.right_value !== null ? `${format(next.left_value)}, ${format(next.right_value)}` : format(sumBefore, sumBefore < 10 ? 3 : 1)}
        />
      </div>

      {message && <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}

const buttonClass =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

function Axes({
  toX,
  toY,
  window,
  plotHeight,
  plotWidth,
  height,
}: {
  toX: (x: number) => number;
  toY: (y: number) => number;
  window: { xMin: number; xMax: number; yMin: number; yMax: number };
  plotHeight: number;
  plotWidth: number;
  height: number;
}) {
  const xTicks = [];
  for (let tick = Math.ceil(window.xMin); tick <= window.xMax; tick += 1) xTicks.push(tick);
  const yTicks = [];
  const step = window.yMax - window.yMin > 20 ? 5 : 2;
  for (let tick = Math.ceil(window.yMin / step) * step; tick <= window.yMax; tick += step) yTicks.push(tick);
  return (
    <>
      {xTicks.map((tick) => (
        <g key={`x${tick}`}>
          <line x1={toX(tick)} y1={PAD.top} x2={toX(tick)} y2={PAD.top + plotHeight} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
          <text x={toX(tick)} y={PAD.top + plotHeight + 16} textAnchor="middle" className="fill-slate-400 text-[11px]">
            {tick}
          </text>
        </g>
      ))}
      {yTicks.map((tick) => (
        <g key={`y${tick}`}>
          <line x1={PAD.left} y1={toY(tick)} x2={PAD.left + plotWidth} y2={toY(tick)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
          <text x={PAD.left - 8} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
            {tick}
          </text>
        </g>
      ))}
      <text x={PAD.left + plotWidth / 2} y={height - 4} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
        Time (s)
      </text>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
