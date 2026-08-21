"use client";

// Recall against load, measured rather than quoted.
//
// At one network size the API stores random bipolar patterns, from one up
// to well past the literature's figure, ten independent sets at each count,
// and asks two questions of every stored pattern: presented exactly, does it
// come back unchanged, and presented with a few cells reversed, does it come
// back at all. The curve is the share that did, and a dashed line marks the
// 0.138 the literature gives for a network grown without bound. The
// measurement is computed once by the API and cached; the browser draws the
// curve and the table under it.

import { useEffect, useState } from "react";
import { ApiError, Capacity, SizeSweep, fetchCapacity } from "@/lib/concepts/hopfield-network";
import { Caption, Failure } from "./HopfieldGrid";

const CHART = { width: 520, height: 240 };
const PAD = { left: 48, right: 16, top: 16, bottom: 36 };
const PLOT = { width: CHART.width - PAD.left - PAD.right, height: CHART.height - PAD.top - PAD.bottom };
const LITERATURE_LOAD = 0.138;

export function CapacityCurve({ units }: { units: 25 | 100 }) {
  const [capacity, setCapacity] = useState<Capacity | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCapacity(await fetchCapacity());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!capacity) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const sweep = capacity.sweeps.find((entry) => entry.n_units === units)!;
  const loads = sweep.points.map((point) => point.load);
  const maxLoad = Math.max(...loads);
  const loadToX = (load: number) => PAD.left + (load / maxLoad) * PLOT.width;
  const shareToY = (share: number) => PAD.top + (1 - share) * PLOT.height;
  const line = (pick: (point: SizeSweep["points"][number]) => number) =>
    sweep.points.map((point, index) => `${index === 0 ? "M" : "L"} ${loadToX(point.load)} ${shareToY(pick(point))}`).join(" ");
  const labelClass = "fill-slate-500 text-[10px] font-medium dark:fill-slate-400";
  const headerClass = "px-2 py-1 text-left text-xs font-medium text-slate-500 dark:text-slate-400";
  const cellClass = "px-2 py-1 font-mono text-sm text-slate-800 dark:text-slate-200";

  return (
    <div className="my-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="w-full select-none">
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + PLOT.height} stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
        <line x1={PAD.left} y1={PAD.top + PLOT.height} x2={PAD.left + PLOT.width} y2={PAD.top + PLOT.height} stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
        {[0, 0.5, 1].map((share) => (
          <text key={share} x={PAD.left - 6} y={shareToY(share) + 4} textAnchor="end" className={labelClass}>
            {share.toFixed(1)}
          </text>
        ))}
        <line x1={loadToX(LITERATURE_LOAD)} y1={PAD.top} x2={loadToX(LITERATURE_LOAD)} y2={PAD.top + PLOT.height} stroke="currentColor" strokeDasharray="4 4" className="text-emerald-500/70" />
        <text x={loadToX(LITERATURE_LOAD) + 4} y={PAD.top + 10} className="fill-emerald-600 text-[10px] dark:fill-emerald-400">
          0.138
        </text>
        <path d={line((point) => point.exact_share)} fill="none" stroke="currentColor" className="text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
        <path d={line((point) => point.corrupted_share)} fill="none" stroke="currentColor" className="text-amber-500" strokeWidth={2} />
        {sweep.points.map((point) => (
          <g key={point.n_patterns}>
            <circle cx={loadToX(point.load)} cy={shareToY(point.exact_share)} r={3.5} className="fill-indigo-600 stroke-white dark:fill-indigo-400 dark:stroke-slate-900" />
            <circle cx={loadToX(point.load)} cy={shareToY(point.corrupted_share)} r={3.5} className="fill-amber-500 stroke-white dark:stroke-slate-900" />
            <text x={loadToX(point.load)} y={PAD.top + PLOT.height + 14} textAnchor="middle" className={labelClass}>
              {point.load.toFixed(2)}
            </text>
          </g>
        ))}
        <text x={PAD.left + PLOT.width / 2} y={CHART.height - 4} textAnchor="middle" className={labelClass}>
          Load, patterns stored per cell, on {units} cells
        </text>
        <text x={12} y={PAD.top + PLOT.height / 2} textAnchor="middle" transform={`rotate(-90 12 ${PAD.top + PLOT.height / 2})`} className={labelClass}>
          Share recalled
        </text>
      </svg>
      <Caption>
        Indigo, the share of stored patterns that come back unchanged when presented exactly; amber, the share that come back when{" "}
        {sweep.n_flipped} of the {units} cells are reversed first. Each point averages {sweep.n_sets} independent sets of random patterns.
      </Caption>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={headerClass}>patterns</th>
              <th className={headerClass}>load</th>
              <th className={headerClass}>exact probe</th>
              <th className={headerClass}>{sweep.n_flipped} cells reversed</th>
              <th className={headerClass}>still fixed points</th>
            </tr>
          </thead>
          <tbody>
            {sweep.points.map((point) => (
              <tr key={point.n_patterns} className="border-t border-slate-200 dark:border-slate-800">
                <td className={cellClass}>{point.n_patterns}</td>
                <td className={cellClass}>{point.load.toFixed(2)}</td>
                <td className={cellClass}>{point.exact_share.toFixed(3)}</td>
                <td className={cellClass}>{point.corrupted_share.toFixed(3)}</td>
                <td className={cellClass}>{point.fixed_point_share.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Failure message={message} />
    </div>
  );
}
