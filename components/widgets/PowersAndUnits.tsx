"use client";

// The same people with height written two ways, and what the expansion does to
// each.
//
// The bars are how large the values in each expanded column get, on a
// logarithmic scale because that is the only way three columns whose numbers
// differ by four orders of magnitude fit on one picture. The readouts underneath
// are three fits on those columns: plain least squares, which does not feel the
// change of unit at all; the same fit with the weights shrunk, which feels it
// severely; and a fit made of cuts on the raw column, which cannot feel it. The
// API refits everything and the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { UnitAnswer, measureUnits } from "@/lib/concepts/polynomial-features";
import {
  CROWD,
  formatMagnitude,
  formatScore,
} from "./polynomialFeaturesFixtures";

const PENALTIES = [1, 10, 100, 1000];

export function PowersAndUnits() {
  const [penaltyStep, setPenaltyStep] = useState(2);
  const [answer, setAnswer] = useState<UnitAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const penalty = PENALTIES[penaltyStep];

  useEffect(() => {
    let cancelled = false;
    measureUnits(CROWD, 3, penalty)
      .then((measured) => {
        if (!cancelled) {
          setAnswer(measured);
          setMessage(null);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [penalty]);

  if (!answer) {
    return (
      <div className="my-4 text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </div>
    );
  }

  const widest = Math.max(
    ...answer.readings.flatMap((reading) =>
      reading.columns.map((column) => column.largest),
    ),
  );

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-4 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          Penalty
          <input
            type="range"
            min={0}
            max={PENALTIES.length - 1}
            step={1}
            value={penaltyStep}
            onChange={(event) => setPenaltyStep(Number(event.target.value))}
            className="w-32 accent-amber-600"
          />
          <span className="w-12 font-mono text-sm">{penalty}</span>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {answer.readings.map((reading) => (
          <div
            key={reading.unit}
            className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950"
          >
            <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Height in {reading.unit}
            </h4>
            {reading.columns.map((column) => (
              <div key={column.name} className="mb-2 last:mb-0">
                <div className="flex items-baseline justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-mono">{column.name}</span>
                  <span className="font-mono">
                    up to {formatMagnitude(column.largest)}
                  </span>
                </div>
                <div className="mt-1 h-2.5 w-full rounded bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-2.5 rounded bg-indigo-500"
                    style={{
                      width: `${Math.max(
                        2,
                        (100 * Math.log10(column.largest + 1)) /
                          Math.log10(widest + 1),
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            <dl className="mt-3 space-y-1 text-xs">
              <Row
                label="widest column over narrowest"
                value={formatMagnitude(reading.span_ratio)}
              />
              <Row
                label="plain fit"
                value={formatScore(reading.plain_r_squared, 6)}
              />
              <Row
                label="weights shrunk"
                value={formatScore(reading.penalised_r_squared, 6)}
              />
              <Row
                label="cuts on the raw column"
                value={formatScore(reading.tree_r_squared, 6)}
              />
            </dl>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                at degree {answer.high_degree[0]?.degree}, the column read
              </th>
              <th className="py-2 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                largest number in it
              </th>
              <th className="py-2 text-right font-semibold text-slate-600 dark:text-slate-400">
                score on the fitted people
              </th>
            </tr>
          </thead>
          <tbody>
            {answer.high_degree.map((entry) => (
              <tr
                key={entry.reading}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1.5 pr-4 text-slate-800 dark:text-slate-200">
                  {entry.reading}
                </td>
                <td className="py-1.5 pr-4 text-right font-mono text-slate-900 dark:text-slate-100">
                  {entry.largest_value.toExponential(2)}
                </td>
                <td className="py-1.5 text-right font-mono text-slate-900 dark:text-slate-100">
                  {formatScore(entry.train_r_squared, 6)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          At that degree the fit has one number to set for every person it is
          fitting, so the right answer in the last column is 1. Neither reading
          reaches it, and the one taken in centimetres does not come close.
        </p>
      </div>

      {message && (
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="font-mono text-slate-900 dark:text-slate-100">{value}</dd>
    </div>
  );
}
