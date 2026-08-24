"use client";

// What the pattern costs over six sentences, against the four rules before it.
//
// The API splits the six-sentence notebook by all five rules and counts the
// pieces, the different pieces, the characters kept and how many sentences come
// back from their pieces. It also splits the notebook with the optional leading
// space deleted from the pattern, and lists the words the corpus ends up
// spelling twice. The browser draws the counts as bars against the longest of
// them, and then the doubled words.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  CorpusView,
  fetchCorpus,
} from "@/lib/concepts/the-pattern-language-models-use";
import { PieceChip, Stat } from "@/components/widgets/PieceChip";

export function PatternCostPanel() {
  const [view, setView] = useState<CorpusView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchCorpus());
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

  const rows = [...view.readings, view.without_the_optional_space];
  const widest = Math.max(...rows.map((row) => row.n_pieces));

  return (
    <div>
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-xs text-slate-700 dark:text-slate-300">
                {row.label}
              </span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {row.n_pieces} pieces, {row.n_distinct} of them different
              </span>
            </div>
            <div className="mt-0.5 h-2 w-full rounded bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-2 rounded ${
                  row.label === "the pattern"
                    ? "bg-emerald-400 dark:bg-emerald-500"
                    : "bg-slate-400 dark:bg-slate-600"
                }`}
                style={{ width: `${(row.n_pieces / widest) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-1 pr-3 font-medium">rule</th>
              <th className="py-1 pr-3 font-medium">pieces</th>
              <th className="py-1 pr-3 font-medium">different pieces</th>
              <th className="py-1 pr-3 font-medium">characters kept</th>
              <th className="py-1 font-medium">sentences given back</th>
            </tr>
          </thead>
          <tbody className="text-slate-700 dark:text-slate-300">
            {rows.map((row) => (
              <tr
                key={row.label}
                className="border-t border-slate-200 dark:border-slate-800"
              >
                <td className="py-1 pr-3">{row.label}</td>
                <td className="py-1 pr-3 font-mono">{row.n_pieces}</td>
                <td className="py-1 pr-3 font-mono">{row.n_distinct}</td>
                <td className="py-1 pr-3 font-mono">
                  {row.n_characters_in_pieces} of {view.n_characters}
                </td>
                <td className="py-1 font-mono">
                  {row.n_joining_back_exactly} of {view.n_texts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          the words these six sentences end up spelling twice, once with the
          space they follow and once without it
        </div>
        <div className="mt-2 space-y-1">
          {view.doubled.map((row) => (
            <div key={row.word} className="flex flex-wrap items-center gap-2">
              <PieceChip text={` ${row.word}`} tone="spaced" />
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {row.n_with_the_space} times
              </span>
              <PieceChip text={row.word} />
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {row.n_without_the_space} times
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Stat
          label="different pieces in all"
          value={`${view.n_distinct}`}
        />
        <Stat
          label="of those carrying a leading space"
          value={`${view.n_distinct_with_a_leading_space}`}
        />
        <Stat
          label="words spelt both ways"
          value={`${view.doubled.length}`}
        />
        <Stat
          label="pieces saved by the optional space"
          value={`${view.without_the_optional_space.n_pieces - view.readings[4].n_pieces}`}
        />
      </div>
    </div>
  );
}
