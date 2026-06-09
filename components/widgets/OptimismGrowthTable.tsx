"use client";

// The winner's flattering, as the number of candidates grows.
//
// The same draw of pure noise is searched over two, five, ten and
// twenty-five neighbour counts, and each search's winner is re-scored on
// fresh deals it was never chosen on, the gap averaged over twelve
// consecutive draws. A last row searches the same twenty-five counts on a
// target that has signal in it. The API computes every figure and the
// browser lays them out.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { OptimismOutcome, measureOptimism } from "@/lib/concepts/grid-search";
import { formatScore } from "./gridSearchFixtures";

const QUOTED_SEED = 12;
const COUNTS = [2, 5, 10, 25];

interface Row {
  label: string;
  outcome: OptimismOutcome;
}

export function OptimismGrowthTable() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const noise = await Promise.all(
          COUNTS.map((count) => measureOptimism(QUOTED_SEED, count, "noise")),
        );
        const signal = await measureOptimism(QUOTED_SEED, 25, "signal");
        setRows([
          ...noise.map((outcome, index) => ({
            label: `noise, ${COUNTS[index]} candidates`,
            outcome,
          })),
          { label: "signal, 25 candidates", outcome: signal },
        ]);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!rows) {
    return (
      <p className="my-4 text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left dark:border-slate-800">
            {[
              "target and candidates",
              "winner",
              "its score",
              "same k, fresh deals",
              "optimism, this draw",
              "mean over 12 draws",
              "nested folds",
            ].map((heading) => (
              <th
                key={heading}
                className="py-2 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, outcome }) => (
            <tr
              key={label}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
            >
              <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">{label}</td>
              <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                k = {outcome.best_n_neighbours}
              </td>
              <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                {formatScore(outcome.best_score)}
              </td>
              <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                {formatScore(outcome.refolded_score)}
              </td>
              <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                {formatScore(outcome.optimism)}
              </td>
              <td className="py-2 pr-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                {formatScore(outcome.mean_optimism_over_draws)}
              </td>
              <td className="py-2 font-mono text-slate-800 dark:text-slate-200">
                {formatScore(outcome.nested_score)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Draw 12 in every row, five folds of sixteen rows, the re-score
        averaged over twelve fresh deals. The mean over draws is the column to
        read; a single draw&rsquo;s gap can land on either side of zero.
      </p>
    </div>
  );
}
