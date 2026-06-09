"use client";

// What is left of the method when no piece is short enough to exist.
//
// Every fit here asks for pieces of fifty characters, which no wrapped word of
// the corpus reaches, so no word has one and the rows kept for the pieces are
// never written to. Beside each pairing of the two training choices is the
// largest disagreement anywhere between that fit and a fit that never had the
// pieces at all. The API runs both fits and takes the largest gap; the browser
// tabulates.

import { useEffect, useState } from "react";
import { ApiError, ReductionReport, fetchReduction } from "@/lib/concepts/fasttext";
import { Legend, Stat, Waiting } from "./fasttextShared";

export function FasttextReduction() {
  const [report, setReport] = useState<ReductionReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchReduction()
      .then((next) => {
        if (!cancelled) setReport(next);
      })
      .catch((error) => {
        if (cancelled) return;
        setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!report) return <Waiting message={message} />;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                which side predicts which
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                how the answer is scored
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                largest gap in the answers
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                largest gap in the scoring rows
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                largest gap in a pass&rsquo;s cost
              </th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((row) => (
              <tr
                key={`${row.architecture}-${row.objective}`}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">
                  {row.architecture}
                </td>
                <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">
                  {row.objective}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {row.table_gap.toFixed(1)}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {row.output_gap.toFixed(1)}
                </td>
                <td className="py-2 font-mono text-slate-800 dark:text-slate-200">
                  {row.loss_gap.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="shortest piece asked for" value={report.minimum_length.toString()} />
        <Stat
          label="longest wrapped word here"
          value={report.longest_wrapped_word.toString()}
        />
        <Stat
          label="cost of each pass, reading the spelling"
          value={report.losses_with_pieces.map((loss) => loss.toFixed(4)).join("  ")}
        />
        <Stat
          label="cost of each pass, without it"
          value={report.losses_without.map((loss) => loss.toFixed(4)).join("  ")}
        />
      </div>

      <Legend>
        Every gap is zero, and it is zero exactly rather than nearly. The rows
        kept for the pieces start at zero instead of at a draw, and they take
        nothing from the sequence of random numbers, so the two fits take the
        identical walk and the two passes cost the identical amount.
      </Legend>
    </div>
  );
}
