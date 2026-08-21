"use client";

// What the held-out share trades, one row per fraction.
//
// The degree 2 curve is refitted under thirty seeds at each fraction, from a
// tenth of the rows held out to six tenths. The row shows how many
// measurements the fit was left with, how many judged it, the mean and the
// lowest held-out score across the seeds, and the spread between the best
// and worst deal. Two held-out rows leave the ratio almost nothing to
// explain, so the lowest verdict there is a ruin, and the spread narrows as
// the held-out share grows until the training share starts to starve. Every
// score comes from the API.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { SplitFamily, dealSplitFamily } from "@/lib/concepts/held-out-evaluation";
import { NOISY_THROW, formatScore } from "./heldOutEvaluationFixtures";

const FRACTIONS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
const DEGREE = 2;

type Row = { fraction: number; family: SplitFamily };

// Shared across mounts, since the table asks the same six questions every time.
let cached: Promise<Row[]> | null = null;

function loadRows(): Promise<Row[]> {
  if (!cached) {
    cached = Promise.all(
      FRACTIONS.map(async (fraction) => ({
        fraction,
        family: await dealSplitFamily(NOISY_THROW, DEGREE, fraction),
      })),
    );
  }
  return cached;
}

export function FractionTradeTable() {
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left dark:border-slate-800">
            {["held out", "fit on", "judged by", "mean held out", "lowest", "spread", "mean training"].map((heading) => (
              <th key={heading} className="py-2 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ fraction, family }) => (
            <tr
              key={fraction}
              className={
                "border-b border-slate-100 last:border-0 dark:border-slate-800/60" +
                (fraction === 0.3 ? " bg-amber-50/60 dark:bg-amber-950/20" : "")
              }
            >
              <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">{Math.round(fraction * 100)}%</td>
              <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">{family.n_training}</td>
              <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">{family.n_held_out}</td>
              <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">{family.mean_held_out_r_squared.toFixed(4)}</td>
              <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">{formatScore(family.lowest_held_out_r_squared, 4)}</td>
              <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">{formatScore(family.held_out_spread, 4)}</td>
              <td className="py-2 font-mono text-slate-800 dark:text-slate-200">{family.mean_train_r_squared.toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Degree 2, thirty seeds per row. The shaded row is the share the playground uses.
      </p>
      {message && <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
