"use client";

// What one product column is worth, on people where it can say something and on
// people where it cannot.
//
// Three fits on the same measurements, a plane in height and girth, the pure
// powers, and the powers with the products, with the total of the squared misses
// beside each. Underneath, the kilograms that thirty centimetres of girth are
// worth at each height, read straight off the people and then asked of the plane
// and of the expanded fit, since a plane is obliged to answer the same number
// everywhere. Switch between the two groups and watch the product's contribution
// collapse when the two columns move together. The API fits and the browser
// draws the bars.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  TwoColumnAnswer,
  compareColumnSets,
} from "@/lib/concepts/polynomial-features";
import { BUILDS, CROWD_PEOPLE, formatScore } from "./polynomialFeaturesFixtures";

const GROUPS = [
  { key: "builds" as const, label: "Four builds at three heights", people: BUILDS },
  { key: "crowd" as const, label: "The measured crowd", people: CROWD_PEOPLE },
];

export function ProductGap() {
  const [group, setGroup] = useState<"builds" | "crowd">("builds");
  const [answer, setAnswer] = useState<TwoColumnAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const people = GROUPS.find((entry) => entry.key === group)!.people;
    (async () => {
      try {
        const compared = await compareColumnSets(people, 2);
        if (!cancelled) {
          setAnswer(compared);
          setMessage(null);
        }
      } catch (error) {
        if (cancelled) return;
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [group]);

  const worst = answer
    ? Math.max(...answer.fits.map((fit) => fit.residual_sum_of_squares))
    : 1;

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-3 pb-3">
        {GROUPS.map((entry) => (
          <button
            key={entry.key}
            onClick={() => setGroup(entry.key)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
              group === entry.key
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-300"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {entry.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-sm text-slate-900 dark:text-slate-100">
          {answer
            ? `height and girth agree ${formatScore(answer.correlation, 3)}`
            : "…"}
        </span>
      </div>

      <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
        {answer?.fits.map((fit) => (
          <div key={fit.label} className="mb-3 last:mb-0">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-300">
                {fit.label}, {fit.n_terms} columns
              </span>
              <span className="font-mono text-slate-900 dark:text-slate-100">
                {formatScore(fit.residual_sum_of_squares, 2)} kg squared
              </span>
            </div>
            <div className="mt-1 h-3 w-full rounded bg-slate-200 dark:bg-slate-800">
              <div
                className="h-3 rounded bg-indigo-500"
                style={{
                  width: `${Math.max(1, (100 * fit.residual_sum_of_squares) / worst)}%`,
                }}
              />
            </div>
          </div>
        ))}
        {!answer && <p className="text-sm text-slate-500">…</p>}
      </div>

      {answer && answer.gains.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  at this height
                </th>
                <th className="py-2 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                  measured
                </th>
                <th className="py-2 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                  the plane says
                </th>
                <th className="py-2 text-right font-semibold text-slate-600 dark:text-slate-400">
                  with the products
                </th>
              </tr>
            </thead>
            <tbody>
              {answer.gains.map((gain) => (
                <tr
                  key={gain.height}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                >
                  <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                    {gain.height} cm
                  </td>
                  <td className="py-1.5 pr-4 text-right font-mono text-slate-900 dark:text-slate-100">
                    {gain.measured.toFixed(2)} kg
                  </td>
                  <td className="py-1.5 pr-4 text-right font-mono text-slate-600 dark:text-slate-400">
                    {gain.plane.toFixed(2)} kg
                  </td>
                  <td className="py-1.5 text-right font-mono text-indigo-700 dark:text-indigo-300">
                    {gain.expanded.toFixed(2)} kg
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            What going from {answer.gains[0].from_girth} cm of girth to{" "}
            {answer.gains[0].to_girth} cm is worth in weight, at each height.
            The middle column of the plane never changes, because a plane has one
            coefficient for girth and no way to make it depend on anything.
          </p>
        </div>
      )}

      {message && (
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>
      )}
    </div>
  );
}
