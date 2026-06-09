"use client";

// What a seed fixes, and what it leaves free.
//
// Three pairs of runs, four starts, and two sequences of draws, all run by the
// API when the page asks. The first panel sends the same configuration twice
// and then changes one seed at a time, so a row saying two runs landed in the
// same place is a row that watched them land there. The second panel is the
// same loop from four draws of the starting weights. The third is a layer that
// silences units at random, asked four times in a row, once carried across the
// steps and once rebuilt from its seed before every pass.

import { useEffect, useState } from "react";
import {
  Repeatability,
  failureMessage,
  fetchRepeatability,
} from "@/lib/concepts/training-a-network";

export function SeedLedger({
  show = "everything",
}: {
  show?: "everything" | "runs" | "starts" | "draws";
}) {
  const [ledger, setLedger] = useState<Repeatability | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLedger(await fetchRepeatability());
      } catch (error) {
        setMessage(failureMessage(error));
      }
    })();
  }, []);

  if (!ledger) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "… running nine loops and four sequences of draws"}
      </p>
    );
  }

  const wanted = (panel: string) => show === "everything" || show === panel;

  return (
    <div className="space-y-5">
      {wanted("runs") && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  two runs
                </th>
                <th className="py-2 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                  first
                </th>
                <th className="py-2 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                  second
                </th>
                <th className="py-2 text-right font-semibold text-slate-600 dark:text-slate-400">
                  the same place?
                </th>
              </tr>
            </thead>
            <tbody>
              {ledger.runs.map((run) => (
                <tr
                  key={run.description}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                >
                  <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">
                    {run.description}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-slate-800 dark:text-slate-200">
                    {run.first_final_loss.toFixed(8)}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-slate-800 dark:text-slate-200">
                    {run.second_final_loss.toFixed(8)}
                  </td>
                  <td
                    className={
                      "py-2 text-right font-mono font-semibold " +
                      (run.identical
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-amber-700 dark:text-amber-400")
                    }
                  >
                    {run.identical ? "to the last bit" : "no"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {wanted("starts") && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  draw of the starting weights
                </th>
                <th className="py-2 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                  loss before any step
                </th>
                <th className="py-2 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                  loss after two hundred
                </th>
                <th className="py-2 text-right font-semibold text-slate-600 dark:text-slate-400">
                  accuracy
                </th>
              </tr>
            </thead>
            <tbody>
              {ledger.starts.map((start) => (
                <tr
                  key={start.weight_seed}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                >
                  <td className="py-2 pr-4 font-mono text-slate-600 dark:text-slate-400">
                    seed {start.weight_seed}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-slate-600 dark:text-slate-400">
                    {start.starting_loss.toFixed(6)}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-slate-800 dark:text-slate-200">
                    {start.final_loss.toFixed(6)}
                  </td>
                  <td className="py-2 text-right font-mono text-slate-800 dark:text-slate-200">
                    {start.final_accuracy === null
                      ? "unavailable"
                      : start.final_accuracy.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {wanted("draws") && (
        <div className="grid gap-4 sm:grid-cols-2">
          {ledger.draws.map((sequence) => (
            <div
              key={sequence.description}
              className="rounded-lg bg-slate-100 px-4 py-3 dark:bg-slate-800"
            >
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {sequence.description}
              </div>
              <div className="mt-2 space-y-1">
                {sequence.sheets.map((sheet, pass) => (
                  <div key={pass} className="flex items-center gap-1.5">
                    <span className="w-12 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      pass {pass + 1}
                    </span>
                    {sheet.map((value, unit) => (
                      <span
                        key={unit}
                        className={
                          "h-5 w-5 rounded " +
                          (value === 0
                            ? "bg-slate-300 dark:bg-slate-700"
                            : "bg-indigo-500 dark:bg-indigo-400")
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-2 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                {sequence.all_alike
                  ? "every pass drew the same units"
                  : "every pass drew different units"}
              </div>
            </div>
          ))}
        </div>
      )}

      {message && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{message}</p>
      )}
    </div>
  );
}
