"use client";

// Noisy estimates of one number, and the average settling as more arrive.
//
// Every estimate is the true value plus its own error, drawn fresh with a
// fixed spread. Each one alone scatters as widely as the last. Their
// running average narrows as one over the square root of the count, which
// is the σ²/B the page derives, and the two panels show the individual
// scatter and the average side by side. The draws are a definitional
// demonstration of averaging independent errors, not a fit.

import { useState } from "react";

const TRUE_VALUE = 10;
const SPREAD = 2;
const VIEW = { width: 640, height: 220 };
const PAD = { left: 40, right: 16, top: 16, bottom: 34 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };
const MAX_DRAWS = 100;

function gaussian(): number {
  const first = Math.random() || 1e-12;
  const second = Math.random();
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
}

export function AveragingNoise() {
  const [estimates, setEstimates] = useState<number[]>([]);

  const draw = (count: number) => {
    setEstimates((current) => [...current, ...Array.from({ length: count }, () => TRUE_VALUE + SPREAD * gaussian())].slice(0, MAX_DRAWS));
  };
  const averages = estimates.map((_, index) => estimates.slice(0, index + 1).reduce((sum, value) => sum + value, 0) / (index + 1));
  const toX = (index: number) => PAD.left + (index / (MAX_DRAWS - 1)) * PLOT.width;
  const toY = (value: number) => PAD.top + (1 - (value - (TRUE_VALUE - 3 * SPREAD)) / (6 * SPREAD)) * PLOT.height;
  const latest = averages.length > 0 ? averages[averages.length - 1] : null;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => draw(1)} className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">one more estimate</button>
        <button onClick={() => draw(10)} className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">ten more</button>
        <button onClick={() => setEstimates([])} className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">start again</button>
      </div>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <line x1={PAD.left} y1={toY(TRUE_VALUE)} x2={PAD.left + PLOT.width} y2={toY(TRUE_VALUE)} stroke="#10b981" strokeDasharray="5 4" />
        <text x={PAD.left + 4} y={toY(TRUE_VALUE) - 6} className="fill-emerald-700 text-[10px] dark:fill-emerald-300">the true value, {TRUE_VALUE}</text>
        {[TRUE_VALUE - 2 * SPREAD, TRUE_VALUE, TRUE_VALUE + 2 * SPREAD].map((tick) => (
          <text key={tick} x={PAD.left - 8} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{tick}</text>
        ))}
        {estimates.map((value, index) => (
          <circle key={index} cx={toX(index)} cy={toY(value)} r={3} fill="#94a3b8" opacity={0.7} />
        ))}
        {averages.length > 1 && (
          <path d={averages.map((value, index) => `${index === 0 ? "M" : "L"} ${toX(index).toFixed(1)} ${toY(value).toFixed(1)}`).join(" ")} fill="none" stroke="#6366f1" strokeWidth={2.5} />
        )}
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 6} textAnchor="middle" className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">estimates in the order drawn, grey each on its own, indigo the running average</text>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="estimates so far, B" value={String(estimates.length)} />
        <Stat label="spread of one estimate, σ" value={SPREAD.toFixed(2)} />
        <Stat label="expected spread of the average, σ/√B" value={estimates.length > 0 ? (SPREAD / Math.sqrt(estimates.length)).toFixed(3) : "…"} />
        <Stat label="running average" value={latest === null ? "…" : latest.toFixed(3)} />
      </div>
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
