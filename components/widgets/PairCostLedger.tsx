"use client";

// What training on pairs costs, in pairs and in seconds, and how many of the
// different-kind pairs were still teaching anything once it finished.
//
// The counts are exact and the API computes them from the training run
// itself. The two times are wall-clock seconds on whatever machine answered,
// so they differ from visit to visit, and only their ratio is worth reading.

import { useEffect, useState } from "react";
import { CostAnswer, fetchCost } from "@/lib/concepts/learning-the-metric-itself";
import {
  Pending,
  Stat,
  messageOf,
} from "@/components/widgets/learningTheMetricShared";

function whole(value: number): string {
  return value.toLocaleString("en-GB");
}

export function PairCostLedger() {
  const [answer, setAnswer] = useState<CostAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    fetchCost()
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

  const rows: [string, string][] = [
    ["training pictures, three kinds", whole(answer.n_training_pictures)],
    ["pairs among them", whole(answer.all_pairs)],
    ["of which one kind", whole(answer.same_kind_pairs)],
    ["of which two kinds", whole(answer.different_kind_pairs)],
    ["pictures in one batch", whole(answer.batch_pictures)],
    ["pairs in one batch", `${whole(answer.pairs_per_batch)}, ${whole(answer.same_kind_per_batch)} of one kind`],
    ["batches per epoch, epochs", `${answer.steps_per_epoch}, ${answer.epochs}`],
    ["pair losses computed in training", whole(answer.pair_evaluations)],
    ["different pairs among them", `${whole(answer.distinct_pairs_met)} of ${whole(answer.all_pairs)}`],
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-1.5 pr-3 text-slate-600 dark:text-slate-400">{label}</td>
                <td className="py-1.5 text-right font-mono text-slate-800 dark:text-slate-200">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
              <th className="py-1.5 pr-3 font-semibold">pictures</th>
              <th className="py-1.5 text-right font-semibold">pairs</th>
            </tr>
          </thead>
          <tbody>
            {answer.growth.map((row) => (
              <tr key={row.pictures} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-1.5 pr-3 font-mono text-slate-700 dark:text-slate-300">{whole(row.pictures)}</td>
                <td className="py-1.5 text-right font-mono text-slate-800 dark:text-slate-200">{whole(row.pairs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="two-kind training pairs past the margin" value={answer.beyond_margin_training.toFixed(4)} />
        <Stat label="the same, held-out pictures" value={answer.beyond_margin_held_out.toFixed(4)} />
        <Stat label="seconds, trained on pairs" value={answer.pair_seconds.toFixed(2)} />
        <Stat label="seconds, the classifier" value={answer.classifier_seconds.toFixed(2)} />
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        A two-kind pair past the margin of {answer.margin} has a loss of zero and
        a slope of zero, so it teaches nothing. The seconds were measured on the
        machine that answered this request.
      </p>
    </div>
  );
}
