"use client";

// Where a penalised offset puts the boundary, at four capacities.
//
// Four readings at 1, 2, 3 and 4 labelled 0, 0, 1, 1, so the widest corridor
// puts the boundary at 2.5. This classifier carries its offset inside the
// kernel, as one more weight the margin objective shrinks, so at a small
// capacity the boundary is held nearer the origin than the readings alone
// would put it. The table is the API's fits; the browser lays them out.

import { useEffect, useState } from "react";
import { ApiError, InterceptCost, fetchInterceptCost } from "@/lib/concepts/kernel-trick";

let pending: Promise<InterceptCost> | null = null;
function fetchOnce(): Promise<InterceptCost> {
  if (!pending) pending = fetchInterceptCost();
  return pending;
}

const LINE = { width: 560, height: 70, pad: 40 };

export function AbsorbedInterceptTable() {
  const [cost, setCost] = useState<InterceptCost | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCost(await fetchOnce());
      } catch (error) {
        pending = null;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!cost) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const lineX = (value: number) => LINE.pad + (value / 5) * (LINE.width - 2 * LINE.pad);

  return (
    <div>
      <svg viewBox={`0 0 ${LINE.width} ${LINE.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <line x1={lineX(0)} x2={lineX(5)} y1={LINE.height / 2} y2={LINE.height / 2} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1.5} />
        {cost.inputs.map((value, index) => (
          <g key={index}>
            <circle cx={lineX(value)} cy={LINE.height / 2} r={6} fill={cost.labels[index] === 1 ? "#6366f1" : "#f59e0b"} stroke="white" strokeWidth={1.5} />
            <text x={lineX(value)} y={LINE.height / 2 + 22} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">{value}</text>
          </g>
        ))}
        {cost.entries.map((entry) => (
          <g key={entry.capacity}>
            <line x1={lineX(entry.crossing)} x2={lineX(entry.crossing)} y1={LINE.height / 2 - 16} y2={LINE.height / 2 + 6} stroke="#10b981" strokeWidth={1.5} />
            <text x={lineX(entry.crossing)} y={LINE.height / 2 - 20} textAnchor="middle" className="fill-emerald-600 text-[9px] dark:fill-emerald-400">C={entry.capacity}</text>
          </g>
        ))}
      </svg>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">capacity</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">boundary crosses at</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">multipliers</th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">steps</th>
            </tr>
          </thead>
          <tbody>
            {cost.entries.map((entry) => (
              <tr key={entry.capacity} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{entry.capacity}</td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{entry.crossing.toFixed(3)}</td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">({entry.multipliers.map((value) => value.toFixed(2)).join(", ")})</td>
                <td className="py-1.5 font-mono text-slate-800 dark:text-slate-200">{entry.epochs_run}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Amber readings are labelled 0 and indigo 1. The green marks are where
        the fitted decision value crosses zero at each capacity; the widest
        corridor between the readings at 2 and 3 crosses at 2.5.
      </p>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
