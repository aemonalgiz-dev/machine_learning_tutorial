"use client";

// What the merges learn once they are allowed to cross a space.
//
// The API fits both page corpora in two stages: ordinary merging within words
// up to a stated vocabulary size, then merging over whole texts with the word
// boundaries ignored. It reports every merge the second stage learned, which of
// the resulting tokens actually span a boundary, and one short text encoded
// with the finished vocabulary. The browser draws the two side by side, because
// the two corpora answer differently and that is the finding.

import { useEffect, useState } from "react";
import {
  VariantsView,
  fetchVariants,
  messageFor,
} from "@/lib/concepts/byte-pair-encoding";
import { Pieces, Stat } from "./bytePairEncodingParts";

export function SuperwordMerges() {
  const [variants, setVariants] = useState<VariantsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setVariants(await fetchVariants());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!variants) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {variants.superwords.map((summary) => (
        <div
          key={summary.corpus_label}
          className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
        >
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            {summary.corpus_label}
          </p>
          <div className="mb-2 grid grid-cols-2 gap-2">
            <Stat label="merges within words" value={summary.n_word_merges} />
            <Stat
              label="merges after the lift"
              value={summary.n_superword_merges}
            />
          </div>
          <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
            what the second stage joined
          </p>
          <ul className="mb-2 space-y-0.5 font-mono text-xs text-slate-700 dark:text-slate-300">
            {summary.superword_merges.map((merge) => (
              <li key={merge}>{merge}</li>
            ))}
          </ul>
          <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
            tokens that really do span a space, {summary.superword_tokens.length}{" "}
            of {summary.n_superword_merges}
          </p>
          <Pieces pieces={summary.superword_tokens} tone="highlight" />
          <p className="mt-3 mb-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-mono">{summary.example_text}</span> comes out
            as {summary.example_pieces.length} pieces
          </p>
          <Pieces pieces={summary.example_pieces} tone="learned" />
        </div>
      ))}
    </div>
  );
}
