"use client";

// One set of weights used by both pictures of a pair, and the slope of the
// pair loss with respect to five of those weights, found three ways.
//
// The API runs four pairs through the untrained tower, walks the pair loss's
// slope back down each picture's copy separately, and adds the two. It then
// nudges each weight up and down by a tiny amount and measures the pair loss
// again, which knows nothing about copies. The browser lays the table out.

import { useEffect, useState } from "react";
import {
  SharedWeightsAnswer,
  fetchSharedWeights,
} from "@/lib/concepts/learning-the-metric-itself";
import {
  Pending,
  Stat,
  messageOf,
} from "@/components/widgets/learningTheMetricShared";

function small(value: number): string {
  if (value === 0) return "0";
  return Math.abs(value) < 1e-4 ? value.toExponential(1) : value.toFixed(4);
}

export function SharedWeightsCheck() {
  const [answer, setAnswer] = useState<SharedWeightsAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    fetchSharedWeights()
      .then((loaded) => {
        if (current) setAnswer(loaded);
      })
      .catch((error) => {
        if (current) setMessage(messageOf(error));
      });
    return () => {
      current = false;
    };
  }, []);

  if (!answer) return <Pending message={message} />;

  return (
    <div>
      <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
        The four pairs are{" "}
        {answer.pairs
          .map(
            (pair) =>
              `${pair.first_kind} and ${pair.second_kind} at ${pair.distance.toFixed(4)}, loss ${pair.loss.toFixed(4)}`,
          )
          .join("; ")}
        .
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
              <th className="py-2 pr-3 font-semibold">weight</th>
              <th className="py-2 pr-3 text-right font-semibold">first pictures&rsquo; copy</th>
              <th className="py-2 pr-3 text-right font-semibold">second pictures&rsquo; copy</th>
              <th className="py-2 pr-3 text-right font-semibold">the two added</th>
              <th className="py-2 pr-3 text-right font-semibold">measured by nudging</th>
              <th className="py-2 text-right font-semibold">gap</th>
            </tr>
          </thead>
          <tbody>
            {answer.rows.map((row) => (
              <tr
                key={`${row.layer}-${row.parameter}`}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">
                  {row.layer}, {row.parameter}
                </td>
                <td className="py-2 pr-3 text-right font-mono text-slate-800 dark:text-slate-200">
                  {small(row.first_tower)}
                </td>
                <td className="py-2 pr-3 text-right font-mono text-slate-800 dark:text-slate-200">
                  {small(row.second_tower)}
                </td>
                <td className="py-2 pr-3 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {small(row.both)}
                </td>
                <td className="py-2 pr-3 text-right font-mono text-slate-800 dark:text-slate-200">
                  {small(row.finite_difference)}
                </td>
                <td className="py-2 text-right font-mono text-emerald-700 dark:text-emerald-400">
                  {small(row.gap_to_both)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="mean pair loss" value={answer.mean_loss.toFixed(4)} />
        <Stat label="largest gap, sum to nudge" value={answer.largest_gap_to_both.toExponential(1)} />
        <Stat label="nudged by" value={answer.nudge.toExponential(0)} />
        <Stat
          label="last layer’s bias slopes"
          value={answer.position_biases_cancel_exactly ? "exactly 0" : "not zero"}
        />
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Each row is the weight with the largest summed slope in its layer, and
        the last is the last layer&rsquo;s bias with the largest slope from one
        copy, {answer.largest_position_bias_slope_one_tower.toFixed(4)}, which
        the other copy cancels exactly.
      </p>
    </div>
  );
}
