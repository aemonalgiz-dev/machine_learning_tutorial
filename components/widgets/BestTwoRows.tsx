"use client";

// What the rule takes, against the best set of the same size.
//
// The API enumerates every set of one, two and three pieces on a two-word
// corpus and reports the most positions each size can possibly cover, beside
// what taking the best piece first actually reaches. The browser lays the two
// answers out at each budget. The search is exhaustive rather than another
// heuristic, so the right column is the best that exists.

import { useEffect, useState } from "react";
import {
  LimitsView,
  fetchLimits,
  messageFor,
} from "@/lib/concepts/greedy-coverage";
import { Pieces, Stat } from "./greedyCoverageParts";

export function BestTwoRows() {
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
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  return (
    <div>
      <p className="font-mono text-xs text-slate-600 dark:text-slate-400">
        {view.trap_words
          .map((entry) => `${entry.word} ×${entry.count}`)
          .join("   ")}{" "}
        &nbsp;&nbsp; {view.trap_positions} positions in all
      </p>

      <div className="mt-3 space-y-3">
        {view.trap_rows.map((row) => (
          <div
            key={row.budget}
            className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800"
          >
            <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              {row.budget === 1
                ? "One piece to spend"
                : `${row.budget} pieces to spend`}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[11px] text-indigo-700 dark:text-indigo-300">
                  taking the best one first
                </p>
                <Pieces pieces={row.greedy_pieces} tone="chosen" />
                <p className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-400">
                  covers {row.greedy_coverage}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[11px] text-emerald-700 dark:text-emerald-300">
                  the best set of that size
                </p>
                <Pieces pieces={row.best_pieces} tone="rival" />
                <p className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-400">
                  covers {row.best_coverage}
                  {row.best_coverage > row.greedy_coverage &&
                    `, which is ${row.best_coverage - row.greedy_coverage} more`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="worst the rule can do"
          value={`${Math.round(view.guarantee * 1000) / 10}%`}
        />
        <Stat
          label="what it does here, at two"
          value={`${Math.round(view.trap_rows[1].ratio * 1000) / 10}%`}
        />
        <Stat
          label="two words, its two pieces"
          value={`${view.trap_greedy_corpus} pieces`}
        />
        <Stat
          label="two words, the best two"
          value={`${view.trap_best_corpus} pieces`}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The first two readouts are shares of the best coverage reachable at that
        budget. The last two are what the six word occurrences cost under each
        pair of pieces, which is the same forfeit measured in the thing that is
        actually paid for.
      </p>
    </div>
  );
}
