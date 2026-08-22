"use client";

// The expanded fit and a fit made of straight cuts, on the same held-back people.
//
// Two columns of readings, the curve at each degree and the stepped fit at each
// depth, both scored on the seven people neither of them saw. The bars are the
// held-back score, so the two are directly comparable, and the readouts name the
// best each reaches and the worst each falls to when its one dial is set badly.
// The API fits both and the browser draws the bars.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  StepComparison,
  compareAgainstSteps,
} from "@/lib/concepts/polynomial-features";
import { CROWD, formatScore } from "./polynomialFeaturesFixtures";

export function StepsAgainstACurve() {
  const [answer, setAnswer] = useState<StepComparison | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    compareAgainstSteps(CROWD, 8)
      .then((compared) => {
        if (!cancelled) setAnswer(compared);
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
  }, []);

  if (!answer) {
    return (
      <div className="my-4 text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </div>
    );
  }

  const bar = (score: number) => `${Math.max(1, 100 * Math.max(0, score))}%`;

  return (
    <div className="my-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
          <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Powers of height, fitted straight
          </h4>
          {answer.curve_readings.map((reading) => (
            <div key={reading.degree} className="mb-2 last:mb-0">
              <div className="flex items-baseline justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>
                  degree {reading.degree}, {reading.n_terms} columns
                </span>
                <span className="font-mono">
                  {formatScore(reading.held_out_r_squared, 3)}
                </span>
              </div>
              <div className="mt-1 h-2.5 w-full rounded bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-2.5 rounded bg-indigo-500"
                  style={{ width: bar(reading.held_out_r_squared) }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
          <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            The raw column, cut into steps
          </h4>
          {answer.step_readings.map((reading) => (
            <div key={reading.depth} className="mb-2 last:mb-0">
              <div className="flex items-baseline justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>
                  depth {reading.depth}, {reading.n_leaves} steps
                </span>
                <span className="font-mono">
                  {formatScore(reading.held_out_r_squared, 3)}
                </span>
              </div>
              <div className="mt-1 h-2.5 w-full rounded bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-2.5 rounded bg-teal-500"
                  style={{ width: bar(reading.held_out_r_squared) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Best curve"
          value={`degree ${answer.best_curve_degree}, ${formatScore(answer.best_curve_score)}`}
        />
        <Stat
          label="Best steps"
          value={`depth ${answer.best_step_depth}, ${formatScore(answer.best_step_score)}`}
        />
        <Stat
          label="Worst curve shown"
          value={formatScore(answer.worst_curve_score)}
        />
        <Stat
          label="Worst steps shown"
          value={formatScore(answer.worst_step_score)}
        />
      </div>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Both columns are scored on the same seven people. The steps read the
        height column exactly as it was recorded, with no expansion of any kind
        in front of them.
      </p>
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
