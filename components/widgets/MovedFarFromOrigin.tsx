"use client";

// One gap between two words, measured three ways, with both moved from home.
//
// The same pair of positions is shifted further and further out and the gap
// remeasured: by subtracting first, by the expansion that turns a whole table
// into one multiplication, and by that expansion after the pair's own middle is
// taken out. The middle column is the one that gives way. The API does all
// three; the browser draws the digits that survive.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { MovedView, fetchMoved } from "@/lib/concepts/distance-and-similarity";

const NAMES = ["as it stands", "a hundred", "ten thousand", "a million", "a hundred million"];

export function MovedFarFromOrigin() {
  const [view, setView] = useState<MovedView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchMoved());
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

  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        The gap between <span className="font-mono">{view.first}</span> and{" "}
        <span className="font-mono">{view.second}</span>, with the same amount
        added to every coordinate of both.
      </p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">
                moved out by
              </th>
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">
                subtract first
              </th>
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">
                the shortcut
              </th>
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">
                shortcut, recentred
              </th>
              <th className="py-1 font-semibold text-slate-600 dark:text-slate-400">
                digits lost
              </th>
            </tr>
          </thead>
          <tbody>
            {view.rows.map((row, index) => (
              <tr
                key={row.shift}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1 pr-3 text-slate-600 dark:text-slate-400">
                  {NAMES[index] ?? row.shift.toExponential(0)}
                </td>
                <td className="py-1 pr-3 font-mono text-slate-800 dark:text-slate-200">
                  {row.definition.toPrecision(12)}
                </td>
                <td
                  className={
                    "py-1 pr-3 font-mono " +
                    (row.digits_lost > 6
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-slate-800 dark:text-slate-200")
                  }
                >
                  {row.expanded.toPrecision(12)}
                </td>
                <td className="py-1 pr-3 font-mono text-slate-800 dark:text-slate-200">
                  {row.shifted_first.toPrecision(12)}
                </td>
                <td className="py-1">
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    {row.digits_lost}
                  </span>
                  <span
                    className="ml-2 inline-block h-1.5 rounded bg-rose-400/70"
                    style={{ width: `${row.digits_lost * 4}px` }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        On {view.n_random_pairs.toLocaleString()} ordinary pairs the recentred
        shortcut and the subtraction differ by at most{" "}
        {view.largest_relative_gap.toExponential(1)} of the answer.
      </p>
    </div>
  );
}
