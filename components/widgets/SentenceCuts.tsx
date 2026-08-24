"use client";

// One sentence the corpus never contained, cut by four different vocabularies.
//
// The API fits the eighteen sentences four times, at four sizes, and encodes
// the running sentence with each; it also glues the pieces back together and
// says whether what came out is what went in. The browser stacks the four so a
// reader can watch the pieces lengthen and can see the two cuts that never
// improve however large the vocabulary gets.

import { useEffect, useState } from "react";
import {
  SizesView,
  fetchSizes,
  messageFor,
} from "@/lib/concepts/byte-pair-encoding";
import { Pieces } from "./bytePairEncodingParts";

export function SentenceCuts() {
  const [sizes, setSizes] = useState<SizesView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSizes(await fetchSizes());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!sizes) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-3 font-mono text-sm text-slate-700 dark:text-slate-300">
        {sizes.sentence}
      </p>
      <div className="space-y-4">
        {sizes.cuts.map((cut) => (
          <div key={cut.vocabulary_size}>
            <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
              {cut.learned} tokens learned, {cut.n_merges}{" "}
              {cut.n_merges === 1 ? "merge" : "merges"}, {cut.n_pieces} pieces
            </p>
            <Pieces
              pieces={cut.pieces}
              tone={cut.n_merges === 0 ? "muted" : "learned"}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
          The same finished vocabulary, asked to read six words one at a time.
          Each pair below differs by one thing.
        </p>
        <div className="space-y-1.5">
          {sizes.neighbour_readings.map((reading) => (
            <div key={reading.word} className="flex flex-wrap items-center gap-2">
              <span className="w-28 shrink-0 font-mono text-xs text-slate-500 dark:text-slate-400">
                {reading.word}
              </span>
              <Pieces
                pieces={reading.pieces}
                tone={reading.n_pieces === 1 ? "highlight" : "learned"}
              />
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Five of the sentence&rsquo;s seven words are absent from the corpus,
        namely {sizes.baselines.sentence_words_unseen.join(", ")}, and every one
        of them is still spelled. One symbol of it,{" "}
        <span className="font-mono">
          {sizes.baselines.sentence_symbols_unspellable.join(" ")}
        </span>
        , was never learned either, which is what the two short pieces in the
        middle of Alvarez are; the next two sections are about them.
      </p>
    </div>
  );
}
