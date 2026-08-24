"use client";

// The same six sentences read by both rules, and what each spends.
//
// The API counts the distinct words and the total words the six sentences give
// under the boundary rules and under splitting on spaces, adds up how many of
// the 375 characters ended up inside a word under each, then reads the running
// sentence under both. The browser lays the two columns side by side and lists
// the entries each rule has that the other does not.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { CostView, fetchCost } from "@/lib/concepts/unicode-word-boundaries";

export function BoundaryCostPanel() {
  const [view, setView] = useState<CostView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchCost());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
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

  const rows: [string, string, string][] = [
    [
      "different words over the six sentences",
      `${view.on_boundaries.n_distinct}`,
      `${view.on_spaces.n_distinct}`,
    ],
    [
      "words in all over the six sentences",
      `${view.on_boundaries.n_pieces}`,
      `${view.on_spaces.n_pieces}`,
    ],
    [
      `characters inside a word, of ${view.n_characters}`,
      `${view.on_boundaries.n_characters_covered}`,
      `${view.on_spaces.n_characters_covered}`,
    ],
    [
      "share of the writing kept",
      `${(view.on_boundaries.share_covered * 100).toFixed(1)}%`,
      `${(view.on_spaces.share_covered * 100).toFixed(1)}%`,
    ],
    [
      "words the running sentence becomes",
      `${view.on_boundaries.running_pieces.length}`,
      `${view.on_spaces.running_pieces.length}`,
    ],
    [
      "the words glued back give the sentence",
      view.on_boundaries.running_glue_is_exact ? "yes" : "no",
      view.on_spaces.running_glue_is_exact ? "yes" : "no",
    ],
  ];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                measured over the same writing
              </th>
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                cut at every boundary
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                cut at every run of spaces
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, here, there]) => (
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
                <td className="py-2 font-mono text-slate-900 dark:text-slate-100">
                  {there}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Column
          title={`only where the cut is a boundary (${view.only_on_boundaries.length})`}
          words={view.only_on_boundaries}
        />
        <Column
          title={`only where the cut is a space (${view.only_on_spaces.length})`}
          words={view.only_on_spaces}
        />
      </div>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        The two rules come to {view.on_boundaries.n_distinct} entries and{" "}
        {view.on_spaces.n_distinct} entries over these six sentences, and{" "}
        {view.n_shared_entries} of them are held by both. Every entry on the
        left is a word on the right with a mark taken off it or a compound taken
        apart.
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
