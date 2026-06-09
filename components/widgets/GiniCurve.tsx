"use client";

// Gini impurity against the class mixture, and the two-draw game it measures.
//
// The slider sets the share of children in a node. The curve is 1 − p² −
// (1 − p)², zero at either pure end and one half at an even mixture, and the
// container fills to match. The simulator draws two labels from the node's
// mixture, independently and with replacement, and counts how often they
// disagree, which settles on the Gini value as the draws accumulate. That is
// the definition, drawn; nothing is fitted.

import { useState } from "react";

const VIEW = { width: 640, height: 240 };
const PAD = { left: 52, right: 16, top: 12, bottom: 36 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };

function gini(share: number) {
  return 1 - share * share - (1 - share) * (1 - share);
}

export function GiniCurve() {
  const [share, setShare] = useState(0.75);
  const [draws, setDraws] = useState({ pairs: 0, disagreements: 0 });

  const toX = (value: number) => PAD.left + value * PLOT.width;
  const toY = (value: number) => PAD.top + (1 - value / 0.55) * PLOT.height;
  const curve = Array.from({ length: 101 }, (_, index) => {
    const value = index / 100;
    return `${index === 0 ? "M" : "L"} ${toX(value).toFixed(1)} ${toY(gini(value)).toFixed(1)}`;
  }).join(" ");

  const drawPairs = (count: number) => {
    let disagreements = 0;
    for (let index = 0; index < count; index++) {
      const first = Math.random() < share;
      const second = Math.random() < share;
      if (first !== second) disagreements++;
    }
    setDraws((current) => ({ pairs: current.pairs + count, disagreements: current.disagreements + disagreements }));
  };

  const tokens = 20;
  const children = Math.round(share * tokens);

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-32">share of children</span>
        <input type="range" min={0} max={1} step={0.01} value={share} onChange={(event) => { setShare(Number(event.target.value)); setDraws({ pairs: 0, disagreements: 0 }); }} className="flex-1 accent-amber-500" />
        <span className="w-12 text-right font-mono">{share.toFixed(2)}</span>
      </label>
      <div className="mt-2 flex flex-wrap gap-1">
        {Array.from({ length: tokens }, (_, index) => (
          <span key={index} className={`h-4 w-4 rounded-full ${index < children ? "bg-amber-500" : "bg-indigo-600"}`} />
        ))}
        <span className="ml-3 text-xs text-slate-600 dark:text-slate-300">{children} children, {tokens - children} adults</span>
      </div>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {[0, 0.25, 0.5].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} y1={toY(tick)} x2={PAD.left + PLOT.width} y2={toY(tick)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <text x={PAD.left - 8} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">{tick}</text>
          </g>
        ))}
        <path d={curve} fill="none" stroke="#6366f1" strokeWidth={2.5} />
        <line x1={toX(share)} y1={toY(0)} x2={toX(share)} y2={toY(gini(share))} stroke="#0f172a" strokeDasharray="4 3" className="dark:stroke-slate-300" />
        <circle cx={toX(share)} cy={toY(gini(share))} r={6} fill="#f59e0b" stroke="white" strokeWidth={1.5} />
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <text key={tick} x={toX(tick)} y={PAD.top + PLOT.height + 16} textAnchor="middle" className="fill-slate-400 text-[11px]">{tick}</text>
        ))}
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 4} textAnchor="middle" className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">share of children in the node</text>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="G = 1 − p² − (1 − p)²" value={gini(share).toFixed(4)} />
        <Stat label="pairs drawn" value={String(draws.pairs)} />
        <Stat label="pairs that disagreed" value={String(draws.disagreements)} />
        <Stat label="observed share" value={draws.pairs > 0 ? (draws.disagreements / draws.pairs).toFixed(4) : "…"} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button onClick={() => drawPairs(1)} className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">draw one pair</button>
        <button onClick={() => drawPairs(100)} className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">draw 100 pairs</button>
        <button onClick={() => drawPairs(10000)} className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">draw 10,000 pairs</button>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Each pair is two labels drawn from the mixture with replacement, so the same person can be drawn twice. Drawing two different people without replacement gives a slightly different number.
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
