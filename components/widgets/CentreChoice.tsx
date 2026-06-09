"use client";

// One group of people, and two candidates for its centre scored two ways.
//
// The X is the mean and the plus is the coordinate-wise median of the tall
// clump, with the stray person switched in or out. Under squared Euclidean
// distance the mean's total is the lower, under Manhattan distance the
// median's is, and that is the whole reason the update step is a mean: it
// is the exact minimiser of the total the method tracks, and would not be
// under the other distance. The API does the arithmetic; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { CentreChoice as Choice, chooseCentre } from "@/lib/concepts/k-means";
import { Stat } from "./ClusterMap";
import { STRAY, WORKED_PEOPLE } from "./kMeansFixtures";

const TALL_FOUR = WORKED_PEOPLE.slice(4);
const VIEW = { width: 640, height: 260 };
const PAD = { left: 40, right: 24, top: 16, bottom: 32 };
const DOMAIN = { xMin: 170, xMax: 200, yMin: 10, yMax: 90 };

export function CentreChoice() {
  const [withStray, setWithStray] = useState(true);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const points: Point[] = withStray ? [...TALL_FOUR, STRAY] : TALL_FOUR;

  useEffect(() => {
    (async () => {
      try {
        setChoice(await chooseCentre(points));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withStray]);

  const plotX = (x: number) => PAD.left + ((x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * (VIEW.width - PAD.left - PAD.right);
  const plotY = (y: number) => PAD.top + (1 - (y - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * (VIEW.height - PAD.top - PAD.bottom);

  return (
    <div>
      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input type="checkbox" checked={withStray} onChange={(event) => setWithStray(event.target.checked)} className="accent-indigo-600" />
        include the stray person at (196, 14)
      </label>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {choice &&
          points.map((point, index) => (
            <g key={index}>
              <line x1={plotX(point.x)} y1={plotY(point.y)} x2={plotX(choice.mean.x)} y2={plotY(choice.mean.y)} stroke="#6366f1" strokeWidth={1} strokeDasharray="3 3" />
              <line x1={plotX(point.x)} y1={plotY(point.y)} x2={plotX(choice.median.x)} y2={plotY(choice.median.y)} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" />
            </g>
          ))}
        {points.map((point, index) => (
          <circle key={index} cx={plotX(point.x)} cy={plotY(point.y)} r={5.5} fill="#334155" stroke="white" strokeWidth={1.5} />
        ))}
        {choice && (
          <>
            <g stroke="#6366f1" strokeWidth={3}>
              <line x1={plotX(choice.mean.x) - 7} y1={plotY(choice.mean.y) - 7} x2={plotX(choice.mean.x) + 7} y2={plotY(choice.mean.y) + 7} />
              <line x1={plotX(choice.mean.x) - 7} y1={plotY(choice.mean.y) + 7} x2={plotX(choice.mean.x) + 7} y2={plotY(choice.mean.y) - 7} />
            </g>
            <g stroke="#f59e0b" strokeWidth={3}>
              <line x1={plotX(choice.median.x) - 8} y1={plotY(choice.median.y)} x2={plotX(choice.median.x) + 8} y2={plotY(choice.median.y)} />
              <line x1={plotX(choice.median.x)} y1={plotY(choice.median.y) - 8} x2={plotX(choice.median.x)} y2={plotY(choice.median.y) + 8} />
            </g>
            <text x={plotX(choice.mean.x) + 10} y={plotY(choice.mean.y) + 4} className="text-[10px] font-medium" fill="#6366f1">
              mean ({choice.mean.x.toFixed(1)}, {choice.mean.y.toFixed(1)})
            </text>
            <text x={plotX(choice.median.x) + 10} y={plotY(choice.median.y) - 8} className="text-[10px] font-medium" fill="#f59e0b">
              median ({choice.median.x.toFixed(1)}, {choice.median.y.toFixed(1)})
            </text>
          </>
        )}
        <text x={PAD.left + (VIEW.width - PAD.left - PAD.right) / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">
          height, cm
        </text>
        <text x={12} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 12 ${VIEW.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">
          weight, kg
        </text>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="squared distance, total at the mean" value={choice ? choice.squared_at_mean.toFixed(1) : "…"} />
        <Stat label="squared distance, total at the median" value={choice ? choice.squared_at_median.toFixed(1) : "…"} />
        <Stat label="Manhattan distance, total at the mean" value={choice ? choice.absolute_at_mean.toFixed(1) : "…"} />
        <Stat label="Manhattan distance, total at the median" value={choice ? choice.absolute_at_median.toFixed(1) : "…"} />
      </div>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
