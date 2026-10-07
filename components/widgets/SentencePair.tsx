"use client";

// The running sentence cut by both methods at three vocabulary sizes.
//
// The API fits each method three times on the eighteen sentences, encodes the
// sentence none of them contained with each, and glues the pieces back to say
// whether what came out is what went in. The browser stacks the six readings so
// the two families of mistake can be told apart: one cuts at word boundaries
// and stalls inside a word it never met, the other cuts anywhere and does not.

import { useEffect, useState } from "react";
import {
  SizesView,
  fetchSizes,
  messageFor,
} from "@/lib/concepts/the-unigram-language-model";
import { Pieces } from "./unigramModelParts";

export function SentencePair() {
  const [view, setView] = useState<SizesView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchSizes());
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

  const largest = view.cuts[view.cuts.length - 1];

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-3 font-mono text-sm text-slate-700 dark:text-slate-300">
        {view.sentence}
      </p>
      <div className="space-y-5">
        {view.cuts.map((cut) => (
          <div key={cut.vocabulary_size}>
            <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {cut.vocabulary_size} tokens
            </p>
            <div className="mb-2">
              <p className="mb-1 text-[11px] text-indigo-600 dark:text-indigo-300">
                chosen by probability, {cut.unigram_n} pieces
              </p>
              <Pieces pieces={cut.unigram_pieces} tone="learned" />
            </div>
            <div>
              <p className="mb-1 text-[11px] text-emerald-700 dark:text-emerald-300">
                grown by merging, {cut.merged_n} pieces
              </p>
              <Pieces pieces={cut.merged_pieces} tone="highlight" />
            </div>
          </div>
        ))}
      </div>
      <>
<p className="mt-4 text-xs text-slate-500 dark:text-slate-400">At the largest displayed vocabulary size, the two schemes agree on Dr. and the but choose different pieces elsewhere. Compare the segmentations before comparing their lengths.</p><p className="mt-4 text-xs text-slate-500 dark:text-slate-400">The unigram reading decodes to {largest.unigram_decoded}. The difference comes from a symbol absent from the learned word-ending representation. Removing that symbol gives the control text {view.control_text}, which round-trips exactly using {view.control_pieces} pieces. This separates a coverage failure from an ordinary difference in segmentation.</p>
</>
    </div>
  );
}
