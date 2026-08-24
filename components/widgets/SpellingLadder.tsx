"use client";

// Every way one word can be spelled out of the pieces a corpus offers, ranked.
//
// The API enumerates the paths, scores each one under the starting model, and
// divides by the word's own probability so the shares add to one; it also
// reports where the single cut a merge-grown vocabulary produces lands in that
// ranking. The browser stacks them and marks two rows, the one the model would
// choose and the one merging forces. Pick a different word with the buttons.

import { useEffect, useState } from "react";
import {
  SpellingsView,
  fetchSpellings,
  messageFor,
} from "@/lib/concepts/the-unigram-language-model";
import { Pieces, Stat, readShare } from "./unigramModelParts";

export function SpellingLadder() {
  const [view, setView] = useState<SpellingsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState("lowest");

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchSpellings());
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

  const word = view.words.find((entry) => entry.word === chosen) ?? view.words[0];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {view.words.map((entry) => (
          <button
            key={entry.word}
            type="button"
            onClick={() => setChosen(entry.word)}
            className={`rounded-md px-3 py-1.5 font-mono text-sm transition ${
              word.word === entry.word
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {entry.word}
          </button>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="spellings in all" value={word.n_spellings} />
        <Stat
          label="in the corpus"
          value={word.in_corpus ? "yes" : "no, held out"}
        />
        <Stat
          label="likeliest share"
          value={readShare(word.rows[0].share)}
        />
        <Stat
          label="merging picks number"
          value={word.merged_rank === null ? "not among these" : word.merged_rank}
        />
      </div>

      <div className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        {word.rows.map((row, index) => (
          <div
            key={row.pieces.join("|")}
            className={`rounded-md px-2 py-1.5 ${
              row.is_best
                ? "bg-indigo-50 dark:bg-indigo-950/30"
                : row.is_merged_cut
                  ? "bg-emerald-50 dark:bg-emerald-950/20"
                  : ""
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-6 shrink-0 font-mono text-xs text-slate-400 dark:text-slate-500">
                {index + 1}
              </span>
              <Pieces
                pieces={row.pieces}
                tone={row.is_best ? "learned" : "plain"}
              />
              <span className="ml-auto font-mono text-xs text-slate-500 dark:text-slate-400">
                {readShare(row.share)}
              </span>
            </div>
            <div
              className="mt-1 ml-8 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500"
              style={{ width: `${Math.max(row.share * 70, 0.4)}%` }}
            />
            {(row.is_best || row.is_merged_cut) && (
              <p className="mt-1 ml-8 text-[11px] text-slate-500 dark:text-slate-400">
                {row.is_best && row.is_merged_cut
                  ? "the model’s choice, and also the cut merging forces"
                  : row.is_best
                    ? "the model’s choice"
                    : "the cut merging forces"}
              </p>
            )}
          </div>
        ))}
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {word.n_spellings > word.rows.length
          ? `The ${word.rows.length} likeliest of ${word.n_spellings}, `
          : `All ${word.n_spellings} of them, `}
        each written as a share of what the model gives the whole word. A
        merge-grown vocabulary of the same corpus cuts this word one way only,
        and that one way is marked in green wherever it appears above.
      </p>
    </div>
  );
}
