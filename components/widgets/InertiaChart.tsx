"use client";

// The number the loop watches, read after every half-step of one walk.
//
// Each dot is the inertia at one moment of the seeded walk on the crowd at
// two groups: the start, then after each pass's update step and again after
// its assignment step. The line is a staircase because the total only ever
// steps down or holds level, never up, which is the convergence argument in
// one picture. Indigo dots are update steps, amber dots are assignment
// steps, and the dashed line is the inertia the library reaches when it is
// allowed its usual ten starts, so the reader can see this start resting
// above it. Every reading comes from the API, not the browser.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Walk, walkKMeans } from "@/lib/concepts/k-means";
import { Stat } from "./ClusterMap";
import { CROWD } from "./kMeansFixtures";

const VIEW = { width: 640, height: 340 };
const PAD = { left: 64, right: 20, top: 24, bottom: 52 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };

interface Reading {
  label: string;
  inertia: number;
  kind: "start" | "update" | "assign";
}

export function InertiaChart() {
  const [walk, setWalk] = useState<Walk | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setWalk(await walkKMeans(CROWD, 2, 3));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!walk) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const readings: Reading[] = [{ label: "start", inertia: walk.start.inertia, kind: "start" }];
  for (const pass of walk.passes) {
    readings.push({ label: `${pass.pass_number}u`, inertia: pass.inertia_after_update, kind: "update" });
    readings.push({ label: `${pass.pass_number}a`, inertia: pass.inertia_after_assign, kind: "assign" });
  }
  const highest = Math.max(...readings.map((reading) => reading.inertia));
  const lowest = Math.min(walk.best_of_ten_inertia, ...readings.map((reading) => reading.inertia));
  const span = highest - lowest || 1;
  const stageX = (index: number) => PAD.left + (index / Math.max(readings.length - 1, 1)) * PLOT.width;
  const inertiaY = (value: number) => PAD.top + ((highest - value) / span) * PLOT.height;
  const path = readings.map((reading, index) => (index === 0 ? `M ${stageX(0)} ${inertiaY(reading.inertia)}` : `H ${stageX(index)} V ${inertiaY(reading.inertia)}`)).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + PLOT.height} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
        <line x1={PAD.left} y1={PAD.top + PLOT.height} x2={PAD.left + PLOT.width} y2={PAD.top + PLOT.height} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
        <line x1={PAD.left} x2={PAD.left + PLOT.width} y1={inertiaY(walk.best_of_ten_inertia)} y2={inertiaY(walk.best_of_ten_inertia)} className="stroke-emerald-500" strokeWidth={1.5} strokeDasharray="6 4" />
        <text x={PAD.left + PLOT.width} y={inertiaY(walk.best_of_ten_inertia) - 6} textAnchor="end" className="fill-emerald-600 text-[10px] font-medium dark:fill-emerald-400">
          best of ten starts, {walk.best_of_ten_inertia.toFixed(1)}
        </text>
        <path d={path} fill="none" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth={1.5} />
        {readings.map((reading, index) => (
          <g key={reading.label}>
            <circle cx={stageX(index)} cy={inertiaY(reading.inertia)} r={5} fill={reading.kind === "update" ? "#6366f1" : reading.kind === "assign" ? "#f59e0b" : "#64748b"} stroke="white" strokeWidth={1.5} />
            <text x={stageX(index)} y={PAD.top + PLOT.height + 16} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">
              {reading.label}
            </text>
          </g>
        ))}
        <text x={PAD.left - 8} y={PAD.top + 4} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">
          {highest.toFixed(0)}
        </text>
        <text x={PAD.left - 8} y={PAD.top + PLOT.height + 4} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">
          {lowest.toFixed(0)}
        </text>
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
          stage of the walk, u after the update step and a after the assignment step
        </text>
        <text x={16} y={PAD.top + PLOT.height / 2} textAnchor="middle" transform={`rotate(-90 16 ${PAD.top + PLOT.height / 2})`} className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
          inertia
        </text>
      </svg>
      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
        The total only ever falls or holds still, and where it holds still the walk has come to rest.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="inertia at the seeded start" value={walk.start.inertia.toFixed(1)} />
        <Stat label="resting inertia, this start" value={walk.resting_inertia.toFixed(1)} />
        <Stat label="passes to rest" value={String(walk.settled_pass)} />
        <Stat label="best of ten starts" value={walk.best_of_ten_inertia.toFixed(1)} />
      </div>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
