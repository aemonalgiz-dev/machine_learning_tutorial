"use client";

// The same writing read by three rules, and what each spends.
//
// The API counts the pieces and the different pieces each of the three rules
// finds over the six sentences this section shares and over a wider corpus of
// twenty-two, adds up how many characters ended up inside a piece under each,
// and lists the entries the treebank rules hold that the other two do not. The
// browser lays the three columns side by side and puts the disagreements
// underneath, with a switch between the two corpora.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { CorpusResult, fetchCorpus } from "@/lib/concepts/penn-treebank-rules";

type Which = "notebook" | "annotated";

export function TreebankCostPanel() {
  const [result, setResult] = useState<CorpusResult | null>(null);
  const [which, setWhich] = useState<Which>("notebook");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setResult(await fetchCorpus());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!result) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const view = which === "notebook" ? result.notebook : result.annotated;

  const rows: [string, string, string, string][] = [
    [
      "pieces in all",
      `${view.on_treebank.n_pieces}`,
      `${view.on_spaces.n_pieces}`,
      `${view.on_boundaries.n_pieces}`,
    ],
    [
      "different pieces, so entries in a table",
      `${view.on_treebank.n_distinct}`,
      `${view.on_spaces.n_distinct}`,
      `${view.on_boundaries.n_distinct}`,
    ],
    [
      `characters inside a piece, of ${view.n_characters}`,
      `${view.on_treebank.n_characters_covered}`,
      `${view.on_spaces.n_characters_covered}`,
      `${view.on_boundaries.n_characters_covered}`,
    ],
    [
      "share of the writing kept",
      `${(view.on_treebank.share_covered * 100).toFixed(1)}%`,
      `${(view.on_spaces.share_covered * 100).toFixed(1)}%`,
      `${(view.on_boundaries.share_covered * 100).toFixed(1)}%`,
    ],
  ];

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {(
          [
            ["notebook", `the six sentences (${result.notebook.n_characters} characters)`],
            [
              "annotated",
              `the wider corpus (${result.annotated.n_texts} sentences)`,
            ],
          ] as [Which, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setWhich(key)}
            className={`rounded-lg px-2.5 py-1 text-xs ${
              which === key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                measured over the same writing
              </th>
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                the treebank rules
              </th>
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                cut at every run of spaces
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                cut at every boundary
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, here, spaces, boundaries]) => (
              <tr
                key={label}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-2 pr-6 text-slate-700 dark:text-slate-300">
                  {label}
                </td>
                <td className="py-2 pr-6 font-mono text-slate-900 dark:text-slate-100">
                  {here}
                </td>
                <td className="py-2 pr-6 font-mono text-slate-900 dark:text-slate-100">
                  {spaces}
                </td>
                <td className="py-2 font-mono text-slate-900 dark:text-slate-100">
                  {boundaries}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {which === "notebook" && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Column
            title={`only under the treebank rules, against the space rule (${view.only_on_treebank_against_spaces.length})`}
            words={view.only_on_treebank_against_spaces}
          />
          <Column
            title={`only under the space rule (${view.only_on_spaces.length})`}
            words={view.only_on_spaces}
          />
          <Column
            title={`only under the treebank rules, against the boundary rule (${view.only_on_treebank_against_boundaries.length})`}
            words={view.only_on_treebank_against_boundaries}
          />
          <Column
            title={`only under the boundary rule (${view.only_on_boundaries.length})`}
            words={view.only_on_boundaries}
          />
        </div>
      )}

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        The treebank rules and the space rule keep the same{" "}
        {view.on_treebank.n_characters_covered} characters, because neither ever
        drops one, and the boundary rule keeps{" "}
        {view.on_boundaries.n_characters_covered}. Where they part is the number
        of pieces those characters were divided into, and there the treebank
        rules are the longest of the three.
      </p>
    </div>
  );
}

function Column({ title, words }: { title: string; words: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {title}
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {words.map((word) => (
          <span
            key={word}
            className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}
