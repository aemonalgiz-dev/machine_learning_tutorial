"use client";

// The two penalties as curves over one coefficient, with a draggable β.
//
// Ridge charges β² and lasso charges |β|. Drawn side by side over the same
// axis, the first is a bowl that is flat at zero and steepens as the
// coefficient grows, and the second is a V with a corner at zero and the
// same slope everywhere else. The slider moves one β across both and the
// readouts give each penalty and its slope, 2β for ridge and a constant
// plus or minus one for lasso. There is nothing to fit here; the curves are
// the definitions, drawn.

import { useState } from "react";

const VIEW = { width: 300, height: 220 };
const PAD = { left: 36, right: 12, top: 12, bottom: 30 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };
const BETA_REACH = 4;
const SAMPLES = 81;

function toX(beta: number): number {
  return PAD.left + ((beta + BETA_REACH) / (2 * BETA_REACH)) * PLOT.width;
}

export function PenaltyCurvesPlayground() {
  const [beta, setBeta] = useState(1.5);
  const squared = beta * beta;
  const absolute = Math.abs(beta);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel
          title="Ridge, β²"
          penaltyOf={(value) => value * value}
          top={16}
          beta={beta}
          accent="#6366f1"
        />
        <Panel
          title="Lasso, |β|"
          penaltyOf={(value) => Math.abs(value)}
          top={4}
          beta={beta}
          accent="#f59e0b"
        />
      </div>
      <label className="mt-3 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-8">β</span>
        <input
          type="range"
          min={-BETA_REACH}
          max={BETA_REACH}
          step={0.05}
          value={beta}
          onChange={(event) => setBeta(Number(event.target.value))}
          className="flex-1 accent-indigo-600"
        />
        <span className="w-14 text-right font-mono">{beta.toFixed(2)}</span>
      </label>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="β²" value={squared.toFixed(2)} />
        <Stat label="slope of β², which is 2β" value={(2 * beta).toFixed(2)} />
        <Stat label="|β|" value={absolute.toFixed(2)} />
        <Stat label="slope of |β|" value={beta === 0 ? "undefined" : beta > 0 ? "+1" : "−1"} />
      </div>
    </div>
  );
}

function Panel({
  title,
  penaltyOf,
  top,
  beta,
  accent,
}: {
  title: string;
  penaltyOf: (beta: number) => number;
  top: number;
  beta: number;
  accent: string;
}) {
  const toY = (penalty: number) => PAD.top + (1 - Math.min(penalty, top) / top) * PLOT.height;
  const path = Array.from({ length: SAMPLES }, (_, index) => {
    const value = -BETA_REACH + (2 * BETA_REACH * index) / (SAMPLES - 1);
    return `${index === 0 ? "M" : "L"} ${toX(value).toFixed(1)} ${toY(penaltyOf(value)).toFixed(1)}`;
  }).join(" ");
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
        <line x1={PAD.left} y1={toY(0)} x2={PAD.left + PLOT.width} y2={toY(0)} stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
        <line x1={toX(0)} y1={PAD.top} x2={toX(0)} y2={PAD.top + PLOT.height} stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
        {[-4, -2, 0, 2, 4].map((tick) => (
          <text key={tick} x={toX(tick)} y={PAD.top + PLOT.height + 14} textAnchor="middle" className="fill-slate-400 text-[10px]">{tick}</text>
        ))}
        <text x={PAD.left - 6} y={toY(top) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{top}</text>
        <path d={path} fill="none" stroke={accent} strokeWidth={2.5} />
        <circle cx={toX(beta)} cy={toY(penaltyOf(beta))} r={5} fill={accent} stroke="white" strokeWidth={1.5} />
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 4} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">coefficient β</text>
      </svg>
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
