"use client";

// The leak, measured on the throw rather than feared.
//
// The degree 2 terms of the fifteen measurements are standardised two ways
// under thirty fold seeds: once with the mean and spread learned from every
// row before the folds are dealt, and once refitted inside each fold. The
// ridge row can feel the difference, because its penalty reads the columns
// through their scale; the least-squares row is the control, since shifting
// or scaling a column cannot move a least-squares fit at all. Each row gives
// the mean held-out score both ways, the mean gap, how many of the thirty
// seeds the outside arrangement flattered, and the largest gap any one seed
// showed. The penalty buttons change how hard the ridge shrinks. Every
// score is the library's through the API.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ArrangementScores, LeakMeasurement, measureThrowLeak } from "@/lib/concepts/held-out-evaluation";
import { NOISY_THROW } from "./heldOutEvaluationFixtures";

const PENALTIES = [0.001, 0.01, 0.1];
const DEGREE = 2;

function signed(value: number, digits: number): string {
  if (Math.abs(value) < 5e-13) return "0 to rounding";
  const sign = value < 0 ? "−" : "+";
  return sign + Math.abs(value).toFixed(digits);
}

function scientific(value: number): string {
  if (value === 0) return "0";
  return value.toExponential(1).replace("e-", " × 10⁻").replace("e+", " × 10");
}

export function LeakTable() {
  const [penalty, setPenalty] = useState(0.01);
  const [leak, setLeak] = useState<LeakMeasurement | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLeak(await measureThrowLeak(NOISY_THROW, DEGREE, penalty));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [penalty]);

  const cell = "py-2 pr-4 font-mono text-slate-800 last:pr-0 dark:text-slate-200";

  const row = (label: string, scores: ArrangementScores, control: boolean) => (
    <tr key={label} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
      <td className="py-2 pr-4 text-slate-800 dark:text-slate-200">{label}</td>
      <td className={cell}>{scores.mean_outside.toFixed(4)}</td>
      <td className={cell}>{scores.mean_inside.toFixed(4)}</td>
      <td className={cell}>{control ? scientific(scores.flattered_by) : signed(scores.flattered_by, 4)}</td>
      <td className={cell}>{scores.seeds_flattered} of {scores.outside_scores.length}</td>
      <td className={cell}>{control ? scientific(scores.largest_absolute_gap) : scores.largest_absolute_gap.toFixed(4)}</td>
    </tr>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <span>Ridge penalty</span>
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {PENALTIES.map((choice) => (
            <button
              key={choice}
              onClick={() => setPenalty(choice)}
              className={
                "rounded px-2 py-0.5 text-xs font-medium transition " +
                (penalty === choice
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {choice}
            </button>
          ))}
        </span>
      </div>

      {leak ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                {["model", "scaled before folding", "scaled inside each fold", "mean gap", "seeds flattered", "largest gap"].map((heading) => (
                  <th key={heading} className="py-2 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {row(`ridge, penalty ${leak.penalty}`, leak.ridge, false)}
              {row("least squares, the control", leak.least_squares, true)}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Degree {leak.degree} terms of the {leak.n_rows} measurements, {leak.n_folds} folds, thirty seeds. The gap is the before-folding score less the inside-fold score, and a seed is flattered when that gap is positive.
          </p>
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>
      )}

      {message && leak && <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
