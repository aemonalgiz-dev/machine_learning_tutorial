"use client";

// The methods that never notice where zero is, raw beside centred.
//
// One row per method, each fitted twice on the crowd, once on the recorded
// columns and once on the centred ones, with what came back both times and
// the largest difference between them. The straight-line distances, the
// three-person vote, k-means, a decision tree, a least-squares fit with an
// intercept and standardising afterwards. Every number is the library's
// through the API; the browser lays them out.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { CrowdMeasurements, fetchCrowdMeasurements } from "@/lib/concepts/centring-on-the-mean";

export function ShiftInvariance() {
  const [crowd, setCrowd] = useState<CrowdMeasurements | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCrowd(await fetchCrowdMeasurements());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!crowd) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const invariance = crowd.invariance;
  const vote = crowd.angles.votes.find((each) => each.rule === "straight-line");
  const people = crowd.centring.centred_heights.length;
  const count = (accuracy: number) => `${Math.round(accuracy * people)} of ${people} right`;
  const tiny = (value: number) => (value === 0 ? "exactly 0" : value.toExponential(1));

  const rows: { method: string; raw: string; centred: string; verdict: string }[] = [
    {
      method: "every distance between two different people",
      raw: "measured",
      centred: "measured",
      verdict: `largest change ${tiny(invariance.distance_gap)} cm`,
    },
    {
      method: "three nearest by distance, one person held out at a time",
      raw: vote ? count(vote.raw_accuracy) : "…",
      centred: vote ? count(vote.centred_accuracy) : "…",
      verdict: "same score",
    },
    {
      method: "k-means, two groups",
      raw: invariance.kmeans_inertia_raw.toFixed(3),
      centred: invariance.kmeans_inertia_centred.toFixed(3),
      verdict: invariance.kmeans_same_groups ? "same two groups" : "different groups",
    },
    {
      method: "decision tree, its first question",
      raw: `${invariance.tree_feature} below ${invariance.tree_threshold_raw.toFixed(3)}`,
      centred: `${invariance.tree_feature} below ${invariance.tree_threshold_centred.toFixed(3)}`,
      verdict: invariance.tree_predictions_agree ? "same eleven answers" : "answers differ",
    },
    {
      method: "least squares with an intercept, both slopes",
      raw: "fitted",
      centred: "fitted",
      verdict: `largest change ${tiny(invariance.slope_gap)}`,
    },
    {
      method: "standardising afterwards",
      raw: "standardised",
      centred: "standardised",
      verdict: `largest change ${tiny(invariance.standardized_gap)}`,
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left dark:border-slate-800">
            <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">method</th>
            <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">recorded columns</th>
            <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">centred columns</th>
            <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">what changed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.method} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
              <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">{row.method}</td>
              <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">{row.raw}</td>
              <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">{row.centred}</td>
              <td className="py-2 font-mono text-emerald-700 dark:text-emerald-400">{row.verdict}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
