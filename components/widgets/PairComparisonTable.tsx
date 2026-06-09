"use client";

// A handful of pairs, each measured under all six metrics.
//
// The page uses it twice: on codes, where Hamming reads a colour of 0 and a
// colour of 2 as one disagreement whatever the other metrics make of the
// gap, and on counts near zero, where Canberra reads a gap of one against
// the size of the numbers it sits between. Each row is one pair and the
// columns are the six answers, so the point of a section is the column that
// stays put while the others move. The API measures; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import {
  METRIC_NAMES,
  METRIC_TITLES,
  PairMeasurement,
  measurePair,
} from "@/lib/concepts/distance-metrics";
import { formatDistance } from "./distanceMetricsFixtures";

export interface ComparedPair {
  label: string;
  first: Point;
  second: Point;
}

export function PairComparisonTable({
  pairs,
  showCanberraTerms = false,
}: {
  pairs: ComparedPair[];
  showCanberraTerms?: boolean;
}) {
  const [answers, setAnswers] = useState<PairMeasurement[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let stale = false;
    (async () => {
      try {
        const bodies = await Promise.all(
          pairs.map((pair) => measurePair(pair.first, pair.second)),
        );
        if (stale) return;
        setAnswers(bodies);
        setMessage(null);
      } catch (error) {
        if (stale) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      stale = true;
    };
  }, [pairs]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-slate-700 dark:text-slate-300">
        <thead>
          <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
            <th className="py-1 pr-3 font-medium">Pair</th>
            {METRIC_NAMES.map((name) => (
              <th key={name} className="py-1 pr-3 font-medium">
                {METRIC_TITLES[name]}
              </th>
            ))}
            {showCanberraTerms && (
              <th className="py-1 font-medium">Canberra terms</th>
            )}
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair, index) => {
            const answer = answers?.[index];
            return (
              <tr
                key={pair.label}
                className="border-t border-slate-100 dark:border-slate-800"
              >
                <td className="py-1 pr-3">
                  {pair.label}{" "}
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    ({pair.first.x}, {pair.first.y}) and ({pair.second.x},{" "}
                    {pair.second.y})
                  </span>
                </td>
                {METRIC_NAMES.map((name) => (
                  <td key={name} className="py-1 pr-3 font-mono">
                    {answer ? formatDistance(answer.distances[name]) : "…"}
                  </td>
                ))}
                {showCanberraTerms && (
                  <td className="py-1 font-mono">
                    {answer
                      ? answer.working.canberra_terms
                          .map((term) => term.toFixed(4))
                          .join(" + ")
                      : "…"}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
