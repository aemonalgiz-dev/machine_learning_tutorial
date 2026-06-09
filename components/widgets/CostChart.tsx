"use client";

// Both fits timed as the data grows, on the machine serving the page.
//
// The left chart grows the rows at two features and the right grows the
// features at two hundred rows, and each plots the median fit time of the
// kernel model against ordinary ridge on a log scale. The kernel fit is an
// n by n solve, so it climbs with the rows and barely notices the features;
// ridge is a p by p solve and does the reverse. The table underneath carries
// the numbers, including what each fitted model has to keep. The API runs
// the library's own fits with a stopwatch round them; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, CostPoint, CostSweep, fetchCost } from "@/lib/concepts/kernel-ridge";
import { KERNEL_COLOUR, RIDGE_COLOUR } from "./kernelRidgeFixtures";

const FRAME = { width: 310, height: 210, left: 44, right: 10, top: 12, bottom: 34 };

export function CostChart() {
  const [cost, setCost] = useState<CostSweep | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCost(await fetchCost());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!cost) return <p className="my-4 text-sm text-slate-500 dark:text-slate-400">{message ?? "… timing the fits, which takes a moment the first time"}</p>;

  return (
    <div className="my-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Panel title="rows growing, two features" points={cost.by_rows} axis={(point) => point.rows} />
        <Panel title="features growing, two hundred rows" points={cost.by_features} axis={(point) => point.features} />
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="py-1 pr-3 font-medium">rows</th>
              <th className="py-1 pr-3 font-medium">features</th>
              <th className="py-1 pr-3 font-medium">kernel fit, ms</th>
              <th className="py-1 pr-3 font-medium">ridge fit, ms</th>
              <th className="py-1 pr-3 font-medium">kernel predict, ms</th>
              <th className="py-1 pr-3 font-medium">ridge predict, ms</th>
              <th className="py-1 pr-3 font-medium">kernel keeps</th>
              <th className="py-1 font-medium">ridge keeps</th>
            </tr>
          </thead>
          <tbody>
            {[...cost.by_rows, ...cost.by_features].map((point, index) => (
              <tr key={index} className="border-b border-slate-100 text-slate-800 dark:border-slate-800/60 dark:text-slate-200">
                <td className="py-0.5 pr-3">{point.rows}</td>
                <td className="py-0.5 pr-3">{point.features}</td>
                <td className="py-0.5 pr-3">{point.kernel_fit_ms.toFixed(3)}</td>
                <td className="py-0.5 pr-3">{point.ridge_fit_ms.toFixed(3)}</td>
                <td className="py-0.5 pr-3">{point.kernel_predict_ms.toFixed(3)}</td>
                <td className="py-0.5 pr-3">{point.ridge_predict_ms.toFixed(3)}</td>
                <td className="py-0.5 pr-3">{point.kernel_model_numbers}</td>
                <td className="py-0.5">{point.ridge_model_numbers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Medians of {cost.repeats} runs each, predicting {cost.queries} rows, on a radial kernel at gamma 0.1 and a penalty of one. The times include the checks every fit performs at its boundary, and they are the times of the machine serving this page, so they will differ from the ones quoted in the text.
      </p>
    </div>
  );
}

function Panel({ title, points, axis }: { title: string; points: CostPoint[]; axis: (point: CostPoint) => number }) {
  const innerWidth = FRAME.width - FRAME.left - FRAME.right;
  const innerHeight = FRAME.height - FRAME.top - FRAME.bottom;
  const logs = points.map((point) => Math.log10(axis(point)));
  const times = points.flatMap((point) => [point.kernel_fit_ms, point.ridge_fit_ms]);
  const lowest = Math.floor(Math.log10(Math.max(Math.min(...times), 1e-3)));
  const highest = Math.ceil(Math.log10(Math.max(...times)));
  const plotX = (value: number) => FRAME.left + ((Math.log10(value) - logs[0]) / (logs[logs.length - 1] - logs[0] || 1)) * innerWidth;
  const plotY = (ms: number) => FRAME.top + (1 - (Math.log10(Math.max(ms, 1e-3)) - lowest) / (highest - lowest || 1)) * innerHeight;
  const path = (pick: (point: CostPoint) => number) => points.map((point, index) => `${index === 0 ? "M" : "L"}${plotX(axis(point)).toFixed(1)},${plotY(pick(point)).toFixed(1)}`).join(" ");
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">{title}</p>
      <svg viewBox={`0 0 ${FRAME.width} ${FRAME.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {Array.from({ length: highest - lowest + 1 }, (_, index) => lowest + index).map((power) => (
          <g key={power}>
            <line x1={FRAME.left} x2={FRAME.left + innerWidth} y1={plotY(10 ** power)} y2={plotY(10 ** power)} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={1} />
            <text x={FRAME.left - 4} y={plotY(10 ** power) + 3} textAnchor="end" className="fill-slate-500 text-[9px] dark:fill-slate-400">{10 ** power >= 1 ? `${10 ** power}` : `${10 ** power}`} ms</text>
          </g>
        ))}
        <path d={path((point) => point.kernel_fit_ms)} fill="none" stroke={KERNEL_COLOUR} strokeWidth={2} />
        <path d={path((point) => point.ridge_fit_ms)} fill="none" stroke={RIDGE_COLOUR} strokeWidth={2} />
        {points.map((point, index) => (
          <g key={index}>
            <circle cx={plotX(axis(point))} cy={plotY(point.kernel_fit_ms)} r={3.5} fill={KERNEL_COLOUR} />
            <circle cx={plotX(axis(point))} cy={plotY(point.ridge_fit_ms)} r={3.5} fill={RIDGE_COLOUR} />
            <text x={plotX(axis(point))} y={FRAME.height - 20} textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-slate-400">{axis(point)}</text>
          </g>
        ))}
        <text x={FRAME.left + innerWidth / 2} y={FRAME.height - 6} textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-slate-400">indigo, the kernel fit · grey, ridge</text>
      </svg>
    </div>
  );
}
