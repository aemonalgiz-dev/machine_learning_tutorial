"use client";

// The factor one pass multiplies the remaining error by, on a number line.
//
// For one curvature c a pass turns an error e into (1 − ηc) e, and the
// whole story of the learning rate is where that factor sits. Between zero
// and one the walk closes in from the same side; at zero it lands exactly;
// between minus one and zero it crosses over and still closes in; at minus
// one it hops forever; beyond, it runs away. The three people have two
// curvatures, 2 for the level and 100/3 for the slope, so the slider moves
// two markers along two lines, and the slope's reaches minus one first, at
// η = 0.06. The factors are the closed form the page derives; nothing here
// is fitted.

import { useState } from "react";

const LEVEL_CURVATURE = 2;
const SLOPE_CURVATURE = 100 / 3;
const BEST_FIXED_RATE = 2 / (LEVEL_CURVATURE + SLOPE_CURVATURE);

const VIEW = { width: 640, height: 92 };
const PAD = { left: 30, right: 30 };
const REACH = 1.6;

function toX(factor: number): number {
  const clamped = Math.max(-REACH, Math.min(REACH, factor));
  return PAD.left + ((clamped + REACH) / (2 * REACH)) * (VIEW.width - PAD.left - PAD.right);
}

function behaviour(factor: number): string {
  if (factor > 1) return "moves away without crossing";
  if (factor === 1) return "stands still";
  if (factor > 0) return "same side, closer";
  if (factor === 0) return "lands on the optimum in one pass";
  if (factor > -1) return "crosses over, still closer";
  if (factor === -1) return "hops between two places forever";
  return "crosses over and moves farther away";
}

export function FactorNumberLine() {
  const [rate, setRate] = useState(0.02);
  const levelFactor = 1 - rate * LEVEL_CURVATURE;
  const slopeFactor = 1 - rate * SLOPE_CURVATURE;

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-8">η</span>
        <input type="range" min={0} max={0.08} step={0.0005} value={rate} onChange={(event) => setRate(Number(event.target.value))} className="flex-1 accent-indigo-600" />
        <span className="w-16 text-right font-mono">{rate.toFixed(4)}</span>
      </label>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {[0.005, 0.02, 0.05, BEST_FIXED_RATE, 0.06, 0.07].map((choice) => (
          <button key={choice} onClick={() => setRate(choice)} className="rounded-md border border-slate-300 bg-white px-2 py-0.5 font-mono text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {choice === BEST_FIXED_RATE ? "η* 0.0566" : choice}
          </button>
        ))}
      </div>

      <Line title={`level, curvature ${LEVEL_CURVATURE}`} factor={levelFactor} accent="#6366f1" />
      <Line title="slope, curvature 100/3" factor={slopeFactor} accent="#f59e0b" />

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="level factor 1 − 2η" value={levelFactor.toFixed(4)} />
        <Stat label="slope factor 1 − (100/3)η" value={slopeFactor.toFixed(4)} />
        <Stat label="level: error kept, loss share kept" value={`${Math.abs(levelFactor).toFixed(3)}, ${(levelFactor ** 2).toFixed(3)}`} />
        <Stat label="slope: error kept, loss share kept" value={`${Math.abs(slopeFactor).toFixed(3)}, ${(slopeFactor ** 2).toFixed(3)}`} />
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Level {behaviour(Number(levelFactor.toFixed(6)))}. Slope {behaviour(Number(slopeFactor.toFixed(6)))}.
        {Math.max(Math.abs(levelFactor), Math.abs(slopeFactor)) < 1 ? " Both inside, so the walk arrives." : Math.max(Math.abs(levelFactor), Math.abs(slopeFactor)) === 1 ? " One factor sits exactly on the edge." : " One factor is outside, so the walk runs away."}
      </p>
    </div>
  );
}

function Line({ title, factor, accent }: { title: string; factor: number; accent: string }) {
  const y = 50;
  return (
    <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
      <text x={PAD.left} y={16} className="fill-slate-600 text-[11px] font-medium dark:fill-slate-300">{title}</text>
      <rect x={toX(-REACH)} y={y - 8} width={toX(-1) - toX(-REACH)} height={16} className="fill-rose-200 dark:fill-rose-900/50" />
      <rect x={toX(-1)} y={y - 8} width={toX(0) - toX(-1)} height={16} className="fill-amber-200 dark:fill-amber-900/50" />
      <rect x={toX(0)} y={y - 8} width={toX(1) - toX(0)} height={16} className="fill-emerald-200 dark:fill-emerald-900/50" />
      <rect x={toX(1)} y={y - 8} width={toX(REACH) - toX(1)} height={16} className="fill-rose-200 dark:fill-rose-900/50" />
      {[-1, 0, 1].map((tick) => (
        <g key={tick}>
          <line x1={toX(tick)} y1={y - 12} x2={toX(tick)} y2={y + 12} stroke="currentColor" className="text-slate-500" strokeWidth={1.5} />
          <text x={toX(tick)} y={y + 26} textAnchor="middle" className="fill-slate-500 text-[10px]">{tick}</text>
        </g>
      ))}
      <text x={(toX(0) + toX(1)) / 2} y={y + 26} textAnchor="middle" className="fill-emerald-700 text-[10px] dark:fill-emerald-300">closer, same side</text>
      <text x={(toX(-1) + toX(0)) / 2} y={y + 26} textAnchor="middle" className="fill-amber-700 text-[10px] dark:fill-amber-300">closer, crossing</text>
      <text x={(toX(1) + toX(REACH)) / 2} y={y + 26} textAnchor="middle" className="fill-rose-700 text-[10px] dark:fill-rose-300">away</text>
      <text x={(toX(-REACH) + toX(-1)) / 2} y={y + 26} textAnchor="middle" className="fill-rose-700 text-[10px] dark:fill-rose-300">away, crossing</text>
      <circle cx={toX(factor)} cy={y} r={7} fill={accent} stroke="white" strokeWidth={2} />
      <text x={toX(factor)} y={y - 14} textAnchor="middle" className="fill-slate-700 text-[11px] font-semibold dark:fill-slate-200">{factor.toFixed(3)}</text>
    </svg>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
