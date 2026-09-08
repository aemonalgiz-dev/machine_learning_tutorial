"use client";

// The arrangements side by side: what each costs and how well each names the
// held-out pictures, at every weight seed.
//
// One row per arrangement. The dots are the three seeds' held-out accuracy on
// a shared axis, so the spread within a row can be read against the gap
// between rows, and the counts beside them are the parameters trained and the
// multiplications one picture costs. Every number is the API's, and each row
// is one network trained on the server.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  fetchNetworkReport,
  SEEDS,
  Variant,
  VariantReport,
} from "@/lib/concepts/convolutional-networks";
import {
  Loading,
  share,
  thousands,
  VARIANT_COLOURS,
  VARIANT_NAMES,
} from "@/components/widgets/convolutionalNetworksShared";

const AXIS = { width: 260, height: 26, from: 0.5, to: 1 };

export function CnnPartsBoard({ variants }: { variants: Variant[] }) {
  const [rows, setRows] = useState<VariantReport[][] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all(
      variants.map((variant) =>
        Promise.all(SEEDS.map((seed) => fetchNetworkReport(variant, seed))),
      ),
    )
      .then(setRows)
      .catch((error) =>
        setMessage(error instanceof ApiError ? error.message : "Something went wrong."),
      );
  }, [variants]);

  if (!rows) return <Loading message={message} />;

  const x = (value: number) =>
    8 + ((value - AXIS.from) / (AXIS.to - AXIS.from)) * (AXIS.width - 16);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
            <th className="py-2 pr-3 font-semibold">arrangement</th>
            <th className="py-2 pr-3 font-semibold">parameters</th>
            <th className="py-2 pr-3 font-semibold">multiplications per picture</th>
            <th className="py-2 pr-3 font-semibold">held out, seeds 0, 1, 2</th>
            <th className="py-2 font-semibold">training half</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((reports) => {
            const first = reports[0];
            const colour = VARIANT_COLOURS[first.variant];
            return (
              <tr key={first.variant} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-2 pr-3">
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: colour }} />
                  <span className="text-slate-800 dark:text-slate-200">{VARIANT_NAMES[first.variant]}</span>
                </td>
                <td className="py-2 pr-3 font-mono text-slate-800 dark:text-slate-200">{thousands(first.n_parameters)}</td>
                <td className="py-2 pr-3 font-mono text-slate-800 dark:text-slate-200">{thousands(first.n_multiply_adds)}</td>
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-2">
                    <svg viewBox={`0 0 ${AXIS.width} ${AXIS.height}`} className="h-6 w-40 shrink-0">
                      <line x1={x(AXIS.from)} x2={x(AXIS.to)} y1={13} y2={13} stroke="rgb(148, 163, 184)" strokeWidth={1} />
                      {[0.5, 0.75, 1].map((tick) => (
                        <line key={tick} x1={x(tick)} x2={x(tick)} y1={9} y2={17} stroke="rgb(148, 163, 184)" strokeWidth={1} />
                      ))}
                      {reports.map((report) => (
                        <circle key={report.seed} cx={x(report.held_out_accuracy)} cy={13} r={5} fill={colour} fillOpacity={0.75} stroke="white" strokeWidth={1} />
                      ))}
                    </svg>
                    <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                      {reports.map((report) => share(report.held_out_accuracy)).join(", ")}
                    </span>
                  </div>
                </td>
                <td className="py-2 font-mono text-xs text-slate-700 dark:text-slate-300">
                  {reports.map((report) => share(report.training_accuracy)).join(", ")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The axis runs from 0.5 to 1. Every arrangement trained for 40 epochs on the same {rows[0][0].n_training} pictures with the same step size and batches, and was scored on the same {rows[0][0].n_held_out} it never saw.
      </p>
    </div>
  );
}
