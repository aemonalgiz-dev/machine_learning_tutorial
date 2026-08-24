"use client";

// The running sentence cut at four vocabulary sizes, with the marks visible.
//
// Drag the size and the pieces are recut. What to watch is where the faint
// marks fall: exactly one piece per word lacks one, and that piece is the one
// that starts the word. The readouts carry what the sentence and the whole
// corpus cost at the size shown, and whether gluing the pieces back together
// gives the sentence again. The API fits and cuts; the browser draws.

import { useEffect, useState } from "react";
import {
  SpellingView,
  fetchSpelling,
  messageFor,
} from "@/lib/concepts/wordpiece";
import { Pieces, Stat } from "./wordPieceParts";

export function ContinuationCuts({ initialIndex = 3 }: { initialIndex?: number }) {
  const [spelling, setSpelling] = useState<SpellingView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    (async () => {
      try {
        setSpelling(await fetchSpelling());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!spelling) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const last = spelling.cuts.length - 1;
  const cut = spelling.cuts[Math.min(index, last)];
  const row = spelling.rows.find((each) => each.learned === cut.learned);
  const starts = cut.pieces.filter((piece) => !piece.startsWith("##")).length;

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <label className="block text-sm text-slate-600 dark:text-slate-400">
        Vocabulary
        <span className="ml-2 font-mono text-slate-800 dark:text-slate-200">
          {cut.learned} tokens, {cut.n_merges} of them merged
        </span>
        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={Math.min(index, last)}
          onChange={(event) => setIndex(Number(event.target.value))}
          className="mt-1 w-full accent-indigo-600"
        />
      </label>

      <div className="mt-3">
        <Pieces pieces={cut.pieces} tone="learned" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="pieces" value={cut.n_pieces} />
        <Stat label="of them word starts" value={starts} />
        <Stat
          label="the corpus, in pieces"
          value={row ? row.corpus_pieces : "…"}
        />
        <Stat label="glues back exactly" value={cut.round_trip_exact ? "yes" : "no"} />
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        The sentence is seven words and {cut.n_pieces} pieces here, and{" "}
        {starts} of those pieces carry no mark, one for each word. The marked
        ones are the continuations, so gluing is mechanical: strip a mark and
        join, or start a new word where a mark is absent, which is what makes
        the sentence come back{" "}
        {cut.round_trip_exact ? "unchanged" : "changed"}.
      </p>
    </div>
  );
}
