"use client";

// How many folds, one row per choice.
//
// The degree 2 curve is folded two, three, five, ten and fifteen ways under
// the page's one seed. Each row gives the library's mean and spread across
// the folds, the pooled held-out score and squared error, and how many fits
// the deal cost. At ten folds half the folds hold a single measurement, and
// at fifteen all of them do, so the mean across folds stops existing while
// the pooled figures carry on. Every number comes from the API.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { FoldDeal, dealFolds } from "@/lib/concepts/held-out-evaluation";
import { NOISY_THROW, PAGE_SEED, formatScore } from "./heldOutEvaluationFixtures";

const FOLD_COUNTS = [2, 3, 5, 10, 15];
const DEGREE = 2;

type Row = { foldCount: number; deal: FoldDeal };

let cached: Promise<Row[]> | null = null;

function loadRows(): Promise<Row[]> {
  if (!cached) {
    cached = Promise.all(
      FOLD_COUNTS.map(async (foldCount) => ({
        foldCount,
        deal: await dealFolds(NOISY_THROW, DEGREE, foldCount, PAGE_SEED),
      })),
    );
  }
  return cached;
}

export function FoldCountTable() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setRows(await loadRows());
      } catch (error) {
        cached = null;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!rows) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const cell = "py-2 pr-4 font-mono text-slate-800 last:pr-0 dark:text-slate-200";

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left dark:border-slate-800">
            {["folds", "rows per fold", "mean across folds", "spread", "pooled R²", "pooled squared error", "fits"].map((heading) => (
              <th key={heading} className="py-2 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ foldCount, deal }) => {
            const sizes = deal.folds.map((fold) => fold.n_held_out);
            const smallest = Math.min(...sizes);
            const largest = Math.max(...sizes);
            return (
              <tr key={foldCount} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className={cell}>{foldCount}</td>
                <td className={cell}>{smallest === largest ? String(smallest) : `${smallest} to ${largest}`}</td>
                <td className={cell}>{formatScore(deal.mean_r_squared, 4)}</td>
                <td className={cell}>{formatScore(deal.spread, 4)}</td>
                <td className={cell}>{deal.pooled_r_squared.toFixed(4)}</td>
                <td className={cell}>{deal.pooled_mean_squared_error.toFixed(4)}</td>
                <td className={cell}>{deal.n_fits}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Degree 2 on the fifteen measurements, one seed. A fold of one row has no
        spread for a ratio to explain, so its score is undefined and so is any
        mean that would include it.
      </p>
      {message && <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
