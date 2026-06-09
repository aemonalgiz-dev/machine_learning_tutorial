"use client";

// Two bowls, one learning rate, and the first step on each.
//
// The wide bowl has the level's curvature of 2 and the narrow one the
// slope's, 100/3. Both walks start the same distance from the bottom. The
// derivative on the steep bowl is larger at that distance, so the same rate
// takes a much larger step there, and a rate that creeps down the shallow
// bowl can leap clean across the steep one. The bowls are the quadratic
// L(e) = ½ c e², drawn from their definitions.

import { useState } from "react";

const BOWLS = [
  { label: "wide, curvature 2", curvature: 2, accent: "#6366f1" },
  { label: "narrow, curvature 100/3", curvature: 100 / 3, accent: "#f59e0b" },
];
const START = 1;

const VIEW = { width: 300, height: 220 };
const PAD = { left: 12, right: 12, top: 12, bottom: 26 };
const REACH = 2.2;

export function CurvatureComparison() {
  const [rate, setRate] = useState(0.02);
  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-8">η</span>
        <input type="range" min={0.005} max={0.07} step={0.0025} value={rate} onChange={(event) => setRate(Number(event.target.value))} className="flex-1 accent-indigo-600" />
        <span className="w-16 text-right font-mono">{rate.toFixed(4)}</span>
      </label>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {BOWLS.map((bowl) => {
          const plot = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };
          const top = 0.5 * bowl.curvature * REACH * REACH;
          const toX = (error: number) => PAD.left + ((error + REACH) / (2 * REACH)) * plot.width;
          const toY = (error: number) => PAD.top + (1 - Math.min(top, 0.5 * bowl.curvature * error * error) / top) * plot.height;
          const path = Array.from({ length: 81 }, (_, index) => {
            const error = -REACH + (2 * REACH * index) / 80;
            return `${index === 0 ? "M" : "L"} ${toX(error).toFixed(1)} ${toY(error).toFixed(1)}`;
          }).join(" ");
          const derivative = bowl.curvature * START;
          const landed = START - rate * derivative;
          const clampedLanding = Math.max(-REACH, Math.min(REACH, landed));
          return (
            <div key={bowl.label} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">{bowl.label}</p>
              <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
                <path d={path} fill="none" stroke={bowl.accent} strokeWidth={2.5} />
                <line x1={toX(0)} y1={PAD.top} x2={toX(0)} y2={PAD.top + plot.height} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeDasharray="3 3" />
                <line x1={toX(START)} y1={toY(START)} x2={toX(clampedLanding)} y2={toY(clampedLanding)} stroke="#0f172a" strokeWidth={1.5} className="dark:stroke-slate-200" />
                <circle cx={toX(START)} cy={toY(START)} r={5} fill="#0f172a" stroke="white" strokeWidth={1.5} />
                <circle cx={toX(clampedLanding)} cy={toY(clampedLanding)} r={5} fill="#10b981" stroke="white" strokeWidth={1.5} />
                {[-2, -1, 0, 1, 2].map((tick) => (
                  <text key={tick} x={toX(tick)} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-400 text-[10px]">{tick}</text>
                ))}
              </svg>
              <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-xs text-slate-700 dark:text-slate-200">
                <div className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">derivative at 1: {derivative.toFixed(2)}</div>
                <div className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">step: {(rate * derivative).toFixed(3)}</div>
                <div className="col-span-2 rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
                  lands at {landed.toFixed(3)}, {Math.abs(landed) < START ? "closer" : "farther"}{landed < 0 ? ", on the other side" : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Both walks start one unit from the bottom, the black dot, and the green dot is where one pass lands.
      </p>
    </div>
  );
}
