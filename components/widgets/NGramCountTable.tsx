"use client";

// Three sentences with every count listed, and the two estimates beside them.
//
// Small enough that a reader can add the counts up in their head and check
// both columns. The left estimate is one count divided by another and nothing
// else, which is why the row for a pair that never occurred reads zero; the
// right one adds one to every count first, which is why the same row reads a
// small number and every other row loses something to pay for it. The API
// counts and divides; the browser draws.

import { useEffect, useState } from "react";
import { CountsView, fetchCounts, messageFor } from "@/lib/concepts/n-grams";
import {
  ACTIVE_CLASS,
  BUTTON_CLASS,
  Stat,
  Word,
  readProbability,
} from "./nGramParts";

type Panel = "counts" | "probabilities" | "sentences";

const PANELS: { key: Panel; name: string }[] = [
  { key: "counts", name: "The counts" },
  { key: "probabilities", name: "One step" },
  { key: "sentences", name: "A whole sentence" },
];

export function NGramCountTable() {
  const [view, setView] = useState<CountsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>("counts");

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchCounts());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const headingClass =
    "py-1.5 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400";
  const cellClass = "py-1.5 pr-4 font-mono text-xs text-slate-800 dark:text-slate-200";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {PANELS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            onClick={() => setPanel(entry.key)}
            className={panel === entry.key ? ACTIVE_CLASS : BUTTON_CLASS}
          >
            {entry.name}
          </button>
        ))}
      </div>

      <div className="mb-4 space-y-1">
        {view.corpus.map((text) => (
          <p
            key={text}
            className="font-mono text-xs text-slate-600 dark:text-slate-400"
          >
            {text}
          </p>
        ))}
      </div>

      {panel === "counts" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
              Single words
            </p>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                  <th className={headingClass}>word</th>
                  <th className={headingClass}>seen</th>
                  <th className={headingClass}>stood before</th>
                </tr>
              </thead>
              <tbody>
                {view.unigrams.map((row) => (
                  <tr
                    key={row.word}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                  >
                    <td className="py-1.5 pr-4">
                      <Word text={row.word} />
                    </td>
                    <td className={cellClass}>{row.count}</td>
                    <td className={cellClass}>{row.n_times_followed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
              Pairs
            </p>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                  <th className={headingClass}>pair</th>
                  <th className={headingClass}>seen</th>
                </tr>
              </thead>
              <tbody>
                {view.bigrams.map((row) => (
                  <tr
                    key={`${row.context} ${row.word}`}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                  >
                    <td className="flex flex-wrap gap-1 py-1.5 pr-4">
                      <Word text={row.context} tone="muted" />
                      <Word text={row.word} tone="learned" />
                    </td>
                    <td className={cellClass}>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {panel === "probabilities" && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                <th className={headingClass}>reading back</th>
                <th className={headingClass}>predicting</th>
                <th className={headingClass}>times seen</th>
                <th className={headingClass}>counts as they stand</th>
                <th className={headingClass}>one added</th>
              </tr>
            </thead>
            <tbody>
              {view.probabilities.map((row) => (
                <tr
                  key={`${row.context} ${row.word}`}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                >
                  <td className="py-1.5 pr-4">
                    <Word text={row.context} tone="muted" />
                  </td>
                  <td className="py-1.5 pr-4">
                    <Word text={row.word} tone="learned" />
                  </td>
                  <td className={cellClass}>
                    {row.count} of {row.context_total}
                  </td>
                  <td
                    className={`py-1.5 pr-4 font-mono text-xs ${row.unsmoothed === 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-slate-200"}`}
                  >
                    {readProbability(row.unsmoothed)}
                  </td>
                  <td className={cellClass}>{readProbability(row.smoothed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {panel === "sentences" && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                <th className={headingClass}>sentence</th>
                <th className={headingClass}>in the three</th>
                <th className={headingClass}>counts as they stand</th>
                <th className={headingClass}>one added</th>
              </tr>
            </thead>
            <tbody>
              {view.sentences.map((row) => (
                <tr
                  key={row.text}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                >
                  <td className={cellClass}>{row.text}</td>
                  <td className={cellClass}>{row.in_corpus ? "yes" : "no"}</td>
                  <td
                    className={`py-1.5 pr-4 font-mono text-xs ${row.unsmoothed_is_finite ? "text-slate-800 dark:text-slate-200" : "text-rose-600 dark:text-rose-400"}`}
                  >
                    {row.unsmoothed_is_finite && row.unsmoothed_perplexity !== null
                      ? row.unsmoothed_perplexity.toFixed(4)
                      : "impossible"}
                  </td>
                  <td className={cellClass}>
                    {row.smoothed_perplexity.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Each sentence is scored over {view.sentences[0].n_predicted}{" "}
            predicted positions, the four words and the end marker, so the
            numbers in the last two columns are directly comparable.
          </p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="sentences" value={view.corpus.length} />
        <Stat label="words that can be predicted" value={view.vocabulary_size} />
        <Stat label="predicted positions in all" value={view.n_predicted_positions} />
        <Stat label="distinct pairs" value={view.bigrams.length} />
      </div>
    </div>
  );
}
