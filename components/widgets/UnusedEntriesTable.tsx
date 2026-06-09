"use client";

// Entries the table holds and nothing ever asks for.
//
// The API chooses a table from the top half of the photograph and then measures
// it three ways: on the half it was chosen from, on the half it has never seen,
// and, for a table chosen from the whole photograph, on a picture of a quite
// different kind. The browser tabulates the rounding error and the count of
// entries nothing used, at five table sizes. Nothing is computed here.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ChoosingView,
  fetchChoosingTheTable,
} from "@/lib/concepts/codebook-quantisation";

export function UnusedEntriesTable() {
  const [view, setView] = useState<ChoosingView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchChoosingTheTable());
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
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                entries
              </th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                error on the half it was chosen from
              </th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                unused there
              </th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                error on the other half
              </th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                unused there
              </th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">
                unused on the printed chart
              </th>
            </tr>
          </thead>
          <tbody>
            {view.rows.map((row) => (
              <tr
                key={row.n_codes}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {row.n_codes}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {row.fitted_distortion.toExponential(2)}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {row.fitted_unused}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {row.held_out_distortion.toExponential(2)}
                </td>
                <td className="py-1.5 pr-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {row.held_out_unused}
                </td>
                <td className="py-1.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {row.elsewhere_unused ?? "not measured"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The first four columns use a table chosen from{" "}
        {view.n_fitting_pieces} pieces and measured on those and on the{" "}
        {view.n_held_out_pieces} it never saw. The last column uses a table
        chosen from all {view.n_pieces} pieces of the photograph and put to the
        printed chart instead.
      </p>
    </div>
  );
}
