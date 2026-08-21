"use client";

// The strength-correlation sweep, on two worlds that disagree about it.
//
// Each world is 120 people over six features, the same rows in both, and
// the two differ only in where the signal lives. In the sparse world one
// feature carries it and the other five are noise. In the shared world all
// six carry an equal part of it. A forest of a hundred trees is fitted at
// every m from one to six, and three things are read off each fit, the
// mean out-of-bag strength of a member, the mean pairwise error
// correlation on rows both members omitted, and the committee's own
// out-of-bag score. Every fit is the library's.

import { useEffect, useState } from "react";
import { ApiError, SignalWorld, SignalWorlds, fetchSignalWorlds } from "@/lib/api";

const CHART = { width: 320, height: 220 };
const PAD = { left: 40, right: 12, top: 14, bottom: 30 };
const SERIES = [
  { key: "mean_strength", label: "member strength", colour: "#6366f1" },
  { key: "error_correlation", label: "error correlation", colour: "#f59e0b" },
  { key: "out_of_bag", label: "committee out of bag", colour: "#10b981" },
] as const;

export function StrengthCorrelationSweep() {
  const [worlds, setWorlds] = useState<SignalWorlds | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setWorlds(await fetchSignalWorlds());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!worlds) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {worlds.worlds.map((world) => (
          <WorldChart key={world.name} world={world} nFeatures={worlds.n_features} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300">
        {SERIES.map((series) => (
          <span key={series.key} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: series.colour }} />
            {series.label}
          </span>
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {worlds.n_rows} people, {worlds.n_features} features, {worlds.n_members} members, one seed. Strength and correlation are the members&rsquo; own out-of-bag figures; the committee score is the forest&rsquo;s.
      </p>
    </div>
  );
}

function WorldChart({ world, nFeatures }: { world: SignalWorld; nFeatures: number }) {
  const innerWidth = CHART.width - PAD.left - PAD.right;
  const innerHeight = CHART.height - PAD.top - PAD.bottom;
  const chartX = (m: number) => PAD.left + ((m - 1) / (nFeatures - 1)) * innerWidth;
  const chartY = (value: number) => PAD.top + (1 - value) * innerHeight;
  const best = world.sweep.reduce((top, each) => (each.out_of_bag > top.out_of_bag ? each : top), world.sweep[0]);
  return (
    <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-800">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{world.name} signal</p>
      <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">{world.description}</p>
      <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="w-full select-none">
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={CHART.width - PAD.right} y1={chartY(tick)} y2={chartY(tick)} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={0.5} />
            <text x={PAD.left - 4} y={chartY(tick) + 3} textAnchor="end" className="fill-slate-500 text-[9px] dark:fill-slate-400">{tick.toFixed(2)}</text>
          </g>
        ))}
        {world.sweep.map((point) => (
          <text key={point.max_features} x={chartX(point.max_features)} y={CHART.height - PAD.bottom + 12} textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-slate-400">{point.max_features}</text>
        ))}
        <text x={PAD.left + innerWidth / 2} y={CHART.height - 4} textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-slate-400">features offered per split, m</text>
        {SERIES.map((series) => {
          const points = world.sweep.filter((point) => point[series.key] !== null);
          const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${chartX(point.max_features)},${chartY(point[series.key] as number)}`).join(" ");
          return (
            <g key={series.key}>
              <path d={path} fill="none" stroke={series.colour} strokeWidth={2} />
              {points.map((point) => (
                <circle key={point.max_features} cx={chartX(point.max_features)} cy={chartY(point[series.key] as number)} r={2.8} fill={series.colour} />
              ))}
            </g>
          );
        })}
        <line x1={chartX(best.max_features)} x2={chartX(best.max_features)} y1={PAD.top} y2={CHART.height - PAD.bottom} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} />
      </svg>
      <div className="grid grid-cols-3 gap-1 font-mono text-[10px] text-slate-600 dark:text-slate-300">
        {world.sweep.map((point) => (
          <div key={point.max_features} className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
            m={point.max_features}. {point.mean_strength === null ? "…" : point.mean_strength.toFixed(2)}, {point.error_correlation === null ? "…" : point.error_correlation.toFixed(2)}, {point.out_of_bag.toFixed(2)}
          </div>
        ))}
      </div>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Best committee score at m = {best.max_features}, {best.out_of_bag.toFixed(3)}. Each cell reads strength, correlation, committee.</p>
    </div>
  );
}
