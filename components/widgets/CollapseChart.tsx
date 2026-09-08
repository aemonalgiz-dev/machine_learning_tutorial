"use client";

// The tower trained twice from the same starting weights, once on every pair
// in each batch and once on the same-kind pairs alone.
//
// Left, the mean distance between every two of the 300 evaluation positions,
// before training and after chosen epochs. Right, the mean pair loss each
// epoch. Both on logarithmic scales, since the run without different-kind
// pairs falls by two orders of magnitude in its first epoch. Every number is
// the API's; the table under the charts counts nearest neighbours of the
// right kind in the two finished spaces.

import { useEffect, useState } from "react";
import {
  CollapseAnswer,
  fetchCollapse,
} from "@/lib/concepts/learning-the-metric-itself";
import {
  EpochChart,
  Pending,
  Series,
  SeriesKey,
  Stat,
  messageOf,
} from "@/components/widgets/learningTheMetricShared";

export function CollapseChart() {
  const [answer, setAnswer] = useState<CollapseAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    fetchCollapse()
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

  const epochs = [0, ...answer.spread_epochs];
  const spreads: Series[] = [
    {
      label: "every pair in the batch",
      colour: "#6366f1",
      epochs,
      values: [answer.start_spread, ...answer.spreads_with],
    },
    {
      label: "same-kind pairs only",
      colour: "#f43f5e",
      epochs,
      values: [answer.start_spread, ...answer.spreads_without],
    },
  ];
  const losses: Series[] = [
    {
      label: "every pair in the batch",
      colour: "#6366f1",
      epochs: answer.losses_with.map((_, index) => index + 1),
      values: answer.losses_with,
    },
    {
      label: "same-kind pairs only",
      colour: "#f43f5e",
      epochs: answer.losses_without.map((_, index) => index + 1),
      values: answer.losses_without,
    },
  ];
  const last = answer.spreads_without.length - 1;

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <EpochChart series={spreads} title="mean distance between positions" lastEpoch={40} logarithmic />
        <EpochChart series={losses} title="mean pair loss" lastEpoch={40} logarithmic />
      </div>
      <SeriesKey series={spreads} />
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="before training" value={answer.start_spread.toFixed(4)} />
        <Stat label="same kind only, after 1 epoch" value={answer.spreads_without[0].toFixed(4)} />
        <Stat label="same kind only, after 40" value={answer.spreads_without[last].toFixed(4)} />
        <Stat label="every pair, after 40" value={answer.spreads_with[last].toFixed(4)} />
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
              <th className="py-2 pr-3 font-semibold">nearest picture is its own kind</th>
              {answer.kinds_with.map((kind) => (
                <th key={kind.kind} className="py-2 pr-3 font-semibold">
                  {kind.kind}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono text-xs text-slate-800 dark:text-slate-200">
            {(
              [
                ["every pair in the batch", answer.kinds_with],
                ["same-kind pairs only", answer.kinds_without],
              ] as const
            ).map(([label, kinds]) => (
              <tr key={label} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-2 pr-3 font-sans text-slate-700 dark:text-slate-300">{label}</td>
                {kinds.map((kind) => (
                  <td key={kind.kind} className="py-2 pr-3">
                    {kind.nearest_count} of {kind.n_counted}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Both from weight seed 0, on crosses, squares and discs, at a margin of{" "}
        {answer.margin}. A count out of fewer than 60 means some pictures had
        two or more nearest pictures at exactly the same distance and were left
        out.
      </p>
    </div>
  );
}
