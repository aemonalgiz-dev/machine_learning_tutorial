"use client";

// The sigmoid, with a movable score and equal steps marked along it.
//
// The slider moves a score z along the bottom axis and the marker climbs
// the curve to the probability it maps to. Three equal steps of one are
// drawn at z = −4, 0 and 4, and the vertical gaps they produce on the
// probability axis are anything but equal, which is the whole point about
// a model that is linear in its score and not in its probability. The
// second panel, when asked for, is the derivative σ′(z) = σ(1 − σ) with the
// same marker, largest at zero and vanishing at both ends. These are the
// definitions drawn, not a fit.

import { useState } from "react";

const VIEW = { width: 640, height: 300 };
const PAD = { left: 52, right: 16, top: 12, bottom: 40 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };
const REACH = 6;
const STEPS = [-4, 0, 4];

const DERIVATIVE = { width: 640, height: 180 };
const DERIVATIVE_PAD = { left: 52, right: 16, top: 12, bottom: 30 };

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function toX(z: number) {
  return PAD.left + ((z + REACH) / (2 * REACH)) * PLOT.width;
}
function toY(probability: number) {
  return PAD.top + (1 - probability) * PLOT.height;
}

export function SigmoidExplorer({ showDerivative = false }: { showDerivative?: boolean }) {
  const [score, setScore] = useState(1);
  const probability = sigmoid(score);
  const curve = Array.from({ length: 121 }, (_, index) => {
    const z = -REACH + (2 * REACH * index) / 120;
    return `${index === 0 ? "M" : "L"} ${toX(z).toFixed(1)} ${toY(sigmoid(z)).toFixed(1)}`;
  }).join(" ");

  const derivativePlot = { width: DERIVATIVE.width - DERIVATIVE_PAD.left - DERIVATIVE_PAD.right, height: DERIVATIVE.height - DERIVATIVE_PAD.top - DERIVATIVE_PAD.bottom };
  const derivativeY = (value: number) => DERIVATIVE_PAD.top + (1 - value / 0.26) * derivativePlot.height;
  const derivativeCurve = Array.from({ length: 121 }, (_, index) => {
    const z = -REACH + (2 * REACH * index) / 120;
    const s = sigmoid(z);
    return `${index === 0 ? "M" : "L"} ${toX(z).toFixed(1)} ${derivativeY(s * (1 - s)).toFixed(1)}`;
  }).join(" ");

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-14">score z</span>
        <input type="range" min={-REACH} max={REACH} step={0.05} value={score} onChange={(event) => setScore(Number(event.target.value))} className="flex-1 accent-indigo-600" />
        <span className="w-14 text-right font-mono">{score.toFixed(2)}</span>
      </label>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} y1={toY(tick)} x2={PAD.left + PLOT.width} y2={toY(tick)} stroke="currentColor" className={tick === 0.5 ? "text-slate-400 dark:text-slate-600" : "text-slate-200 dark:text-slate-800"} />
            <text x={PAD.left - 8} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">{tick}</text>
          </g>
        ))}
        {STEPS.map((start) => (
          <g key={start}>
            <line x1={toX(start)} y1={toY(0)} x2={toX(start)} y2={toY(sigmoid(start))} stroke="#f59e0b" strokeDasharray="3 3" />
            <line x1={toX(start + 1)} y1={toY(0)} x2={toX(start + 1)} y2={toY(sigmoid(start + 1))} stroke="#f59e0b" strokeDasharray="3 3" />
            <line x1={toX(start)} y1={toY(0) + 6} x2={toX(start + 1)} y2={toY(0) + 6} stroke="#f59e0b" strokeWidth={3} />
            <line x1={PAD.left + 8} y1={toY(sigmoid(start))} x2={PAD.left + 8} y2={toY(sigmoid(start + 1))} stroke="#f59e0b" strokeWidth={5} />
            <text x={toX(start + 0.5)} y={toY(0) + 20} textAnchor="middle" className="fill-amber-700 text-[10px] dark:fill-amber-300">
              +1 lifts p by {(sigmoid(start + 1) - sigmoid(start)).toFixed(3)}
            </text>
          </g>
        ))}
        <path d={curve} fill="none" stroke="#6366f1" strokeWidth={2.5} />
        <line x1={toX(score)} y1={toY(0)} x2={toX(score)} y2={toY(probability)} stroke="#0f172a" strokeDasharray="4 3" className="dark:stroke-slate-300" />
        <line x1={PAD.left} y1={toY(probability)} x2={toX(score)} y2={toY(probability)} stroke="#0f172a" strokeDasharray="4 3" className="dark:stroke-slate-300" />
        <circle cx={toX(score)} cy={toY(probability)} r={6} fill="#0f172a" stroke="white" strokeWidth={1.5} className="dark:fill-slate-100" />
        {[-6, -4, -2, 0, 2, 4, 6].map((tick) => (
          <text key={tick} x={toX(tick)} y={PAD.top + PLOT.height + 34} textAnchor="middle" className="fill-slate-400 text-[11px]">{tick}</text>
        ))}
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 2} textAnchor="middle" className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">score z</text>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="z" value={score.toFixed(2)} />
        <Stat label="e⁻ᶻ" value={Math.exp(-score).toFixed(3)} />
        <Stat label="p = 1 / (1 + e⁻ᶻ)" value={probability.toFixed(4)} />
        <Stat label="σ′(z) = p(1 − p)" value={(probability * (1 - probability)).toFixed(4)} />
      </div>
      {showDerivative && (
        <svg viewBox={`0 0 ${DERIVATIVE.width} ${DERIVATIVE.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          {[0, 0.125, 0.25].map((tick) => (
            <g key={tick}>
              <line x1={DERIVATIVE_PAD.left} y1={derivativeY(tick)} x2={DERIVATIVE_PAD.left + derivativePlot.width} y2={derivativeY(tick)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <text x={DERIVATIVE_PAD.left - 8} y={derivativeY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">{tick}</text>
            </g>
          ))}
          <path d={derivativeCurve} fill="none" stroke="#10b981" strokeWidth={2.5} />
          <circle cx={toX(score)} cy={derivativeY(probability * (1 - probability))} r={6} fill="#0f172a" stroke="white" strokeWidth={1.5} className="dark:fill-slate-100" />
          <text x={DERIVATIVE_PAD.left + derivativePlot.width / 2} y={DERIVATIVE.height - 6} textAnchor="middle" className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">the derivative σ′(z), largest at z = 0 where it is exactly one quarter</text>
        </svg>
      )}
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
