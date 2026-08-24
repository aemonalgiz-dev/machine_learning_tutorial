"use client";

// How far back a gap can see, measured rather than argued.
//
// The API builds a small language in which the boundary between two characters
// is decided by a character a known distance away and by nothing else, fits the
// same language at every reach, and reports how many of its two texts each fit
// answers correctly. The browser draws that as a grid, one row per distance and
// one column per reach. What to look at is the diagonal, since the smallest
// reach that answers both texts is exactly the distance to the deciding
// character, and the last row has no such reach at all.

import { useEffect, useState } from "react";
import {
  LimitsView,
  fetchLimits,
  messageFor,
} from "@/lib/concepts/learning-boundaries-from-examples";
import { Loading, Stat } from "./pointwiseParts";

export function WindowReach() {
  const [view, setView] = useState<LimitsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchLimits());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) {
    return <Loading message={message} />;
  }

  const unreachable = view.window_rows.filter(
    (row) => row.smallest_window_that_works === null,
  ).length;

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
        Two shapes of run, one cut into two words and one left whole, told apart
        only by the character they begin with. Here they are, at the closest
        distance tried.
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        {view.wide_example.map((run) => (
          <span
            key={run}
            className="rounded border border-slate-200 px-2 py-0.5 font-mono text-sm text-slate-800 dark:border-slate-700 dark:text-slate-200"
          >
            {run}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                the deciding character sits at
              </th>
              {view.windows.map((reach) => (
                <th
                  key={reach}
                  className="py-1 pr-4 font-semibold text-slate-600 dark:text-slate-400"
                >
                  reach {reach}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.window_rows.map((row) => (
              <tr
                key={row.n_filler}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  offset −{Math.abs(row.offset)}
                </td>
                {row.n_right_by_window.map((right, position) => (
                  <td key={position} className="py-1 pr-4">
                    <span
                      className={`inline-block rounded px-2 py-0.5 font-mono ${
                        right === row.n_texts
                          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                      title={`${right} of ${row.n_texts} runs read correctly`}
                    >
                      {right} of {row.n_texts}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {view.window_rows
          .filter((row) => row.smallest_window_that_works !== null)
          .map((row) => (
            <Stat
              key={row.n_filler}
              label={`evidence at offset −${Math.abs(row.offset)} needs a reach of`}
              value={`${row.smallest_window_that_works}`}
            />
          ))}
      </div>

      <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
        {unreachable} of the {view.window_rows.length} distances is answered by
        no reach on the table, and a run of the first shape and a run of the
        second are, to every question being asked there, the same run.
      </p>
    </div>
  );
}
