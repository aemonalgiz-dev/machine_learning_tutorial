"use client";

// Comparing whole rows of the table against comparing the fitted vectors.
//
// Two ways of asking which words are alike, on the same corpus. The first
// compares a word's whole row of counts with another word's; the second
// compares the eight numbers the fit gave each of them. The two lists of
// nearest words for one word sit side by side, and the two scores underneath
// disagree about which method won. The API counts, fits and scores; the browser
// draws.

import { useEffect, useState } from "react";
import { ApiError, CostReport, fetchCostReport } from "@/lib/concepts/glove";
import { Legend, Stat, Waiting, colourFor } from "./gloveShared";

export function GloveRowsAgainstVectors() {
  const [report, setReport] = useState<CostReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setReport(await fetchCostReport());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!report) return <Waiting message={message} />;

  const columns = [
    {
      heading: `${report.numbers_per_word_rows} counts per word`,
      neighbours: report.rows_neighbours,
      within: report.rows_within_topic,
      across: report.rows_across_topic,
      gap: report.rows_gap,
      share: report.rows_same_topic_share,
    },
    {
      heading: `${report.numbers_per_word_vectors} fitted numbers per word`,
      neighbours: report.fitted_neighbours,
      within: report.fitted_within_topic,
      across: report.fitted_across_topic,
      gap: report.fitted_gap,
      share: report.fitted_same_topic_share,
    },
  ];

  return (
    <div>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
        The five words nearest {report.compared_word}, asked of the raw counts
        and of the fitted vectors.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {columns.map((column) => (
          <div key={column.heading}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {column.heading}
            </p>
            <div className="space-y-1">
              {column.neighbours.map((entry) => (
                <div key={entry.word} className="flex items-center gap-2">
                  <span
                    className="w-20 shrink-0 font-mono text-xs"
                    style={{ color: colourFor(entry.topic) }}
                  >
                    {entry.word}
                  </span>
                  <span className="h-3 flex-1 rounded bg-slate-100 dark:bg-slate-800">
                    <span
                      className="block h-3 rounded"
                      style={{
                        width: `${Math.max(2, Math.abs(entry.similarity) * 100)}%`,
                        backgroundColor: colourFor(entry.topic),
                      }}
                    />
                  </span>
                  <span className="w-12 shrink-0 text-right font-mono text-xs text-slate-500 dark:text-slate-400">
                    {entry.similarity.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Stat
                label="nearest five in the same half"
                value={`${(column.share * 100).toFixed(1)}%`}
              />
              <Stat label="how far the halves came apart" value={column.gap.toFixed(4)} />
            </div>
          </div>
        ))}
      </div>
      <Legend>
        The two scores disagree, and both are worth reading. The raw counts win
        the nearest-word question,{" "}
        {(report.rows_same_topic_share * 100).toFixed(1)}% against{" "}
        {(report.fitted_same_topic_share * 100).toFixed(1)}%, using{" "}
        {report.numbers_per_word_rows} numbers per word where the fit uses{" "}
        {report.numbers_per_word_vectors}; the fit wins the question of how far
        the two halves came apart on average, {report.fitted_gap.toFixed(4)}{" "}
        against {report.rows_gap.toFixed(4)}.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
