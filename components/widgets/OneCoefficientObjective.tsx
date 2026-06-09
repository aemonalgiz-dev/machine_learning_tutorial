"use client";

// The whole objective over one coefficient, for the five worked people.
//
// With the feature and target centred, the residual sum of squares over a
// single slope is a parabola, RSS(β) = 176 − 400β + 250β², whose floor is at
// the ordinary slope of 0.8. Ridge adds λβ² and lasso adds λ|β|, and the
// two panels draw RSS, the penalty and their sum over the same axis, with
// the sum's lowest point marked. Slide λ up and ridge's minimum glides toward
// zero without arriving, while lasso's arrives at λ = 400 and stays. The
// numbers 176, 200 and 250 are the ones the regression page summed by hand
// for these five people; the marked minima are the closed forms the
// shrinkage path below confirms fit by fit.

import { useState } from "react";

const TSS = 176;
const CROSS = 200;
const SQUARE = 250;

const VIEW = { width: 300, height: 240 };
const PAD = { left: 40, right: 12, top: 12, bottom: 30 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };
const BETA = { min: -0.4, max: 1.4 };
const SAMPLES = 91;

function rss(beta: number): number {
  return TSS - 2 * CROSS * beta + SQUARE * beta * beta;
}

export function OneCoefficientObjective() {
  const [penalty, setPenalty] = useState(100);

  const ridgeMinimum = CROSS / (SQUARE + penalty);
  const lassoMinimum = Math.max(CROSS - penalty / 2, 0) / SQUARE;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel
          title="Ridge, RSS + λβ²"
          penaltyOf={(beta) => penalty * beta * beta}
          minimum={ridgeMinimum}
          accent="#6366f1"
        />
        <Panel
          title="Lasso, RSS + λ|β|"
          penaltyOf={(beta) => penalty * Math.abs(beta)}
          minimum={lassoMinimum}
          accent="#f59e0b"
        />
      </div>
      <label className="mt-3 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-8">λ</span>
        <input
          type="range"
          min={0}
          max={600}
          step={5}
          value={penalty}
          onChange={(event) => setPenalty(Number(event.target.value))}
          className="flex-1 accent-indigo-600"
        />
        <span className="w-12 text-right font-mono">{penalty}</span>
      </label>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat label="ridge minimum, 200 / (250 + λ)" value={ridgeMinimum.toFixed(4)} />
        <Stat label="lasso minimum, max(200 − λ/2, 0) / 250" value={lassoMinimum.toFixed(4)} />
      </div>
    </div>
  );
}

function Panel({
  title,
  penaltyOf,
  minimum,
  accent,
}: {
  title: string;
  penaltyOf: (beta: number) => number;
  minimum: number;
  accent: string;
}) {
  const betas = Array.from({ length: SAMPLES }, (_, index) => BETA.min + ((BETA.max - BETA.min) * index) / (SAMPLES - 1));
  const totals = betas.map((beta) => rss(beta) + penaltyOf(beta));
  const top = Math.max(...totals, ...betas.map(rss)) * 1.05;
  const toX = (beta: number) => PAD.left + ((beta - BETA.min) / (BETA.max - BETA.min)) * PLOT.width;
  const toY = (value: number) => PAD.top + (1 - Math.min(value, top) / top) * PLOT.height;
  const pathOf = (valueOf: (beta: number) => number) =>
    betas.map((beta, index) => `${index === 0 ? "M" : "L"} ${toX(beta).toFixed(1)} ${toY(valueOf(beta)).toFixed(1)}`).join(" ");

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
        <line x1={toX(0)} y1={PAD.top} x2={toX(0)} y2={PAD.top + PLOT.height} stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
        {[0, 0.4, 0.8, 1.2].map((tick) => (
          <text key={tick} x={toX(tick)} y={PAD.top + PLOT.height + 14} textAnchor="middle" className="fill-slate-400 text-[10px]">{tick}</text>
        ))}
        <path d={pathOf(rss)} fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth={1.5} strokeDasharray="4 3" />
        <path d={pathOf(penaltyOf)} fill="none" stroke={accent} strokeWidth={1.5} strokeDasharray="4 3" />
        <path d={pathOf((beta) => rss(beta) + penaltyOf(beta))} fill="none" stroke={accent} strokeWidth={2.5} />
        <line x1={toX(minimum)} y1={toY(rss(minimum) + penaltyOf(minimum))} x2={toX(minimum)} y2={PAD.top + PLOT.height} stroke={accent} strokeDasharray="2 2" />
        <circle cx={toX(minimum)} cy={toY(rss(minimum) + penaltyOf(minimum))} r={5} fill={accent} stroke="white" strokeWidth={1.5} />
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 4} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">slope β</text>
      </svg>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        Grey dashes are RSS alone, coloured dashes the penalty, solid their sum. The dot is the lowest point of the sum.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
