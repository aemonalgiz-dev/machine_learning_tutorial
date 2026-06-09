"use client";

// A second layer of folds round the whole search.
//
// The people are dealt into outer folds. Inside each outer training share the
// ordinary search runs, with its own inner folds, and its winner is refitted
// on that share and scored on the outer fold it never saw. Each row is one
// outer fold, the setting its search chose, that search's own selection
// score, and the honest score beside it, and the summary is the mean of the
// honest column. The flat search on every person is shown for comparison,
// since that is the number the nested figure corrects. The API runs both
// loops and the browser lays them out.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { NestedOutcome, nestSearch } from "@/lib/concepts/grid-search";
import {
  ACTIVE_CLASS,
  BUTTON_CLASS,
  IDEAL_CASE,
  TWELVE_PEOPLE,
  formatScore,
} from "./gridSearchFixtures";

type Crowd = "twelve" | "ideal";

export function NestedSearchTable() {
  const [crowd, setCrowd] = useState<Crowd>("twelve");
  const [answer, setAnswer] = useState<NestedOutcome | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const points: Point[] = crowd === "twelve" ? TWELVE_PEOPLE : IDEAL_CASE;
    (async () => {
      try {
        const nested = await nestSearch(points);
        if (cancelled) return;
        setAnswer(nested);
        setMessage(null);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [crowd]);

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <button
          onClick={() => setCrowd("twelve")}
          className={crowd === "twelve" ? ACTIVE_CLASS : BUTTON_CLASS}
        >
          Twelve people
        </button>
        <button
          onClick={() => setCrowd("ideal")}
          className={crowd === "ideal" ? ACTIVE_CLASS : BUTTON_CLASS}
        >
          An Ideal Case
        </button>
        <span className="ml-1">
          four outer folds, three inner folds, one to five neighbours
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {["outer fold judges", "inner winner", "its selection score", "honest score"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="py-2 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {answer
              ? answer.outer_folds.map((fold, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                  >
                    <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                      people {fold.held_out_indices.map((position) => position + 1).join(", ")}
                    </td>
                    <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                      k = {fold.best_n_neighbours}
                    </td>
                    <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                      {formatScore(fold.best_inner_score)}
                    </td>
                    <td className="py-2 font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {formatScore(fold.honest_score)}
                    </td>
                  </tr>
                ))
              : Array.from({ length: 4 }, (_, index) => (
                  <tr key={index}>
                    <td className="py-2 text-slate-500" colSpan={4}>
                      …
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Nested honest score" value={answer ? formatScore(answer.mean_honest_score) : "…"} />
        <Stat label="Spread across outer folds" value={answer ? formatScore(answer.honest_spread) : "…"} />
        <Stat
          label="Flat search on everyone"
          value={answer ? `k = ${answer.flat_best_n_neighbours} at ${formatScore(answer.flat_best_score)}` : "…"}
        />
        <Stat label="Models fitted" value={answer ? `${answer.n_fits}` : "…"} />
      </div>

      {message && (
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
