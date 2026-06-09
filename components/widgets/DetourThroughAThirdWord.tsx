"use client";

// Whether going by way of a third word can read shorter than going direct.
//
// Every ordered triple of distinct words is checked under every rule, and the
// count of triples where the detour reads shorter is what separates the rules
// that can be trusted to prune a search from the one that cannot. The worst
// such triple is drawn with its three legs. The API does the whole sweep; the
// browser draws the one route it names.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  TriangleView,
  fetchTriangle,
} from "@/lib/concepts/distance-and-similarity";

export function DetourThroughAThirdWord() {
  const [view, setView] = useState<TriangleView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchTriangle());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!view) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const broken = view.metrics
    .map((metric, index) => ({ metric, index }))
    .filter(({ index }) => view.violations[index] > 0);

  return (
    <div>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-left dark:border-slate-800">
            <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">
              rule
            </th>
            <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">
              triples with a shorter detour
            </th>
            <th className="py-1 font-semibold text-slate-600 dark:text-slate-400">
              worst saving
            </th>
          </tr>
        </thead>
        <tbody>
          {view.metrics.map((metric, index) => (
            <tr
              key={metric}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
            >
              <td className="py-1 pr-3 text-slate-700 dark:text-slate-300">
                {view.plain_names[index]}
              </td>
              <td
                className={
                  "py-1 pr-3 font-mono " +
                  (view.violations[index] > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-slate-600 dark:text-slate-400")
                }
              >
                {view.violations[index].toLocaleString()} of{" "}
                {view.n_triples.toLocaleString()}
              </td>
              <td className="py-1 font-mono text-slate-600 dark:text-slate-400">
                {view.worst_excess[index] > 0
                  ? view.worst_excess[index].toFixed(4)
                  : "none"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {broken.map(({ metric, index }) => {
        const route = view.worst_route[metric];
        const legs = view.worst_legs[metric];
        return (
          <div
            key={metric}
            className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
          >
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              the worst of them, reading by {view.plain_names[index]}
            </p>
            <svg
              viewBox="0 0 420 130"
              className="mt-1 w-full max-w-[420px]"
              role="img"
              aria-label={`going from ${route[0]} to ${route[2]} by way of ${route[1]} reads shorter than going directly`}
            >
              <line
                x1={50}
                y1={100}
                x2={370}
                y2={100}
                className="stroke-rose-500"
                strokeWidth={2}
              />
              <line
                x1={50}
                y1={100}
                x2={210}
                y2={30}
                className="stroke-indigo-500"
                strokeWidth={2}
              />
              <line
                x1={210}
                y1={30}
                x2={370}
                y2={100}
                className="stroke-indigo-500"
                strokeWidth={2}
              />
              <circle cx={50} cy={100} r={4} className="fill-slate-700 dark:fill-slate-200" />
              <circle cx={210} cy={30} r={4} className="fill-slate-700 dark:fill-slate-200" />
              <circle cx={370} cy={100} r={4} className="fill-slate-700 dark:fill-slate-200" />
              <text x={50} y={118} textAnchor="middle" className="fill-slate-600 text-[11px] dark:fill-slate-300">
                {route[0]}
              </text>
              <text x={210} y={20} textAnchor="middle" className="fill-slate-600 text-[11px] dark:fill-slate-300">
                {route[1]}
              </text>
              <text x={370} y={118} textAnchor="middle" className="fill-slate-600 text-[11px] dark:fill-slate-300">
                {route[2]}
              </text>
              <text x={125} y={58} textAnchor="middle" className="fill-indigo-600 text-[10px] dark:fill-indigo-300">
                {legs[0].toFixed(4)}
              </text>
              <text x={295} y={58} textAnchor="middle" className="fill-indigo-600 text-[10px] dark:fill-indigo-300">
                {legs[1].toFixed(4)}
              </text>
              <text x={210} y={92} textAnchor="middle" className="fill-rose-600 text-[10px] dark:fill-rose-400">
                {legs[2].toFixed(4)}
              </text>
            </svg>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The two short legs come to {(legs[0] + legs[1]).toFixed(4)}, and
              the direct route reads {legs[2].toFixed(4)}.
            </p>
          </div>
        );
      })}
    </div>
  );
}
