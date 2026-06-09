"use client";

// What one nearest-word question costs as a vocabulary grows.
//
// One row per vocabulary size, carrying the multiplications the arithmetic
// demands and, where it was worth timing, how long the whole scan took. The
// largest row is counted and not timed, since timing it on demand would slow
// the page for a number the arithmetic already gives. The API measures; the
// browser draws a bar.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { CostView, fetchCost } from "@/lib/concepts/distance-and-similarity";

export function CostOfOneQuestion() {
  const [view, setView] = useState<CostView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchCost());
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

  const largest = Math.max(...view.rows.map((row) => row.multiplications));

  return (
    <div>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-left dark:border-slate-800">
            <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">
              words
            </th>
            <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">
              numbers each
            </th>
            <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">
              multiplications
            </th>
            <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">
              one question took
            </th>
            <th className="py-1 font-semibold text-slate-600 dark:text-slate-400" />
          </tr>
        </thead>
        <tbody>
          {view.rows.map((row) => (
            <tr
              key={row.n_words}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
            >
              <td className="py-1 pr-3 font-mono text-slate-800 dark:text-slate-200">
                {row.n_words.toLocaleString()}
              </td>
              <td className="py-1 pr-3 font-mono text-slate-600 dark:text-slate-400">
                {row.dimension}
              </td>
              <td className="py-1 pr-3 font-mono text-slate-600 dark:text-slate-400">
                {row.multiplications.toLocaleString()}
              </td>
              <td className="py-1 pr-3 font-mono text-slate-600 dark:text-slate-400">
                {row.milliseconds === null
                  ? "not timed"
                  : `${row.milliseconds.toFixed(2)} ms`}
              </td>
              <td className="py-1">
                <span
                  className="inline-block h-2 rounded bg-indigo-500/70"
                  style={{
                    width: `${Math.max(2, (row.multiplications / largest) * 100)}px`,
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Each timing is the average of {view.repeats} runs of one question
        against the whole vocabulary.
      </p>
    </div>
  );
}
