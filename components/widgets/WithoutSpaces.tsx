"use client";

// Five sentences of Chinese, and the two boundary schemes asked to learn from
// them.
//
// The API fits both on the same five lines at the same requested size and
// reads back a sentence made of words those lines contain but never in that
// order. The browser draws the two vocabularies and the two readings. What to
// look at is how many rows each ends with, and which rows the second one spent
// on recording that a line ended.

import { useEffect, useState } from "react";
import {
  CostsView,
  fetchCosts,
  messageFor,
} from "@/lib/concepts/sentencepiece";
import { Piece, Pieces, Stat } from "./sentencePieceParts";

export function WithoutSpaces() {
  const [costs, setCosts] = useState<CostsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCosts(await fetchCosts());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!costs) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        The five lines learned from
      </p>
      <p className="font-mono text-sm text-slate-700 dark:text-slate-300">
        {costs.unspaced_corpus.join("  ")}
      </p>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {costs.unspaced_glosses
          .map(([word, gloss]) => `${word} ${gloss}`)
          .join(", ")}
      </p>

      <p className="mb-1 mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
        Read back, a sentence those five never contain
      </p>
      <p className="font-mono text-sm text-slate-700 dark:text-slate-300">
        {costs.unspaced_text}
      </p>

      <div className="mt-4 space-y-5">
        {costs.unspaced.map((fit) => (
          <div key={fit.key}>
            <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
              {fit.label}: asked for {fit.asked} rows, learned {fit.learned},{" "}
              {fit.n_merges} merges, the five lines in {fit.corpus_pieces}{" "}
              pieces
            </p>
            <Pieces
              pieces={fit.text_pieces}
              tone={fit.key === "front" ? "learned" : "muted"}
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {fit.n_text_pieces} pieces for the sentence.
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
          Three of the second fit&rsquo;s rows are a character it already holds,
          kept apart because that character once fell at the end of a line.
          Nothing in this writing puts a boundary there.
        </p>
        <div className="flex flex-wrap gap-2">
          {costs.unspaced_end_final_marks.map((token) => (
            <Piece key={token} text={token} tone="muted" />
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat
          label="marks in front, pieces"
          value={costs.unspaced[0].n_text_pieces}
        />
        <Stat
          label="marks behind, pieces"
          value={costs.unspaced[1].n_text_pieces}
        />
        <Stat
          label="merges learned"
          value={`${costs.unspaced[0].n_merges} against ${costs.unspaced[1].n_merges}`}
        />
      </div>
    </div>
  );
}
