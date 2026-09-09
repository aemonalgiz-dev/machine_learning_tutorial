"use client";

// What the library says at each step size, asked one plain fit at a time.
//
// Each row is one rate handed to the library's own model, and the verdict is
// whatever it answered: it settled, it ran out of passes, or it refused by
// name because the weights stopped being finite. The rightmost column is the
// share of its remaining error one pass keeps, which is below one exactly
// while the walk can arrive and at or above one when it cannot, so the table's
// two halves are separated by that number crossing one rather than by anything
// this widget decided.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { RateSweep, sweepRates } from "@/lib/concepts/gradient-descent-regression";

// The page's three people, and the rates that bracket their threshold of 0.06.
const WORKED_THREE: Point[] = [
  { x: 165, y: 62 },
  { x: 170, y: 68 },
  { x: 175, y: 68 },
];

const RATES = [0.005, 0.01, 0.02, 0.05, 0.06, 0.07, 0.1, 0.2];
const MAX_EPOCHS = 500;

const VERDICT_TEXT: Record<string, string> = {
  converged: "settled",
  pass_limit_reached: "still walking",
  refused: "refused",
};

export function RateSweepTable() {
  const [answer, setAnswer] = useState<RateSweep | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const swept = await sweepRates(WORKED_THREE, RATES, MAX_EPOCHS);
        if (cancelled) return;
        setAnswer(swept);
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
  }, []);

  return (
    <div className="my-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-3 font-medium">step size</th>
              <th className="py-1 pr-3 font-medium">what happened</th>
              <th className="py-1 pr-3 font-medium">passes</th>
              <th className="py-1 pr-3 font-medium">slope reached</th>
              <th className="py-1 font-medium">error kept per pass</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {(answer?.verdicts ?? []).map((verdict) => (
              <tr
                key={verdict.learning_rate}
                className="border-t border-slate-200 dark:border-slate-800"
              >
                <td className="py-1 pr-3">{verdict.learning_rate}</td>
                <td className="py-1 pr-3 font-sans">
                  <span
                    className={
                      verdict.verdict === "refused"
                        ? "text-rose-600 dark:text-rose-400"
                        : verdict.verdict === "converged"
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-slate-600 dark:text-slate-300"
                    }
                  >
                    {VERDICT_TEXT[verdict.verdict] ?? verdict.verdict}
                  </span>
                  {verdict.error_name && (
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                      the weights stopped being finite
                    </span>
                  )}
                </td>
                <td className="py-1 pr-3">
                  {verdict.epochs_run === null ? "" : verdict.epochs_run}
                </td>
                <td className="py-1 pr-3">
                  {verdict.slope === null ? "" : verdict.slope.toFixed(4)}
                </td>
                <td className="py-1">
                  {verdict.error_factor_per_pass.toPrecision(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
        {answer
          ? `The threshold is ${answer.divergence_threshold.toPrecision(3)}, and the line all of them are walking toward has a slope of ${answer.closed_form.slope.toFixed(4)}.`
          : "…"}
      </p>

      {message && (
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>
      )}
    </div>
  );
}
