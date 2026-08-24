"use client";

// The running sentence read by both boundary schemes, out and back again.
//
// The API fits the eighteen sentences twice, once with the space marked in
// front of a word and once with the end of a word marked behind it, encodes
// the sentence with each and glues the pieces back. The browser stacks the two
// readings and prints what came out. What to look at is the last piece of
// Alvarez in each, and then the two lines at the bottom.

import { useEffect, useState } from "react";
import {
  MarkingView,
  fetchMarking,
  messageFor,
} from "@/lib/concepts/sentencepiece";
import { Pieces } from "./sentencePieceParts";

export function RoundTripPair() {
  const [marking, setMarking] = useState<MarkingView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setMarking(await fetchMarking());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!marking) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-3 font-mono text-sm text-slate-700 dark:text-slate-300">
        {marking.sentence}
      </p>
      <div className="space-y-5">
        {marking.schemes.map((scheme) => (
          <div key={scheme.key}>
            <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
              {scheme.label}: {scheme.alphabet_size} symbols before anything is
              learned, {scheme.learned} rows after, {scheme.sentence.n_pieces}{" "}
              pieces
            </p>
            <Pieces
              pieces={scheme.sentence.pieces}
              tone={scheme.key === "front" ? "learned" : "muted"}
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Glued back:{" "}
              <span
                className={`font-mono ${
                  scheme.sentence.round_trip_exact
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-amber-700 dark:text-amber-300"
                }`}
              >
                {scheme.sentence.decoded}
              </span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
          The same two fits asked to read five words one at a time. Each pair
          below differs by one thing.
        </p>
        <div className="space-y-2">
          {marking.word_pairs.map((pair) => (
            <div key={pair.word}>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {pair.word}
              </p>
              <div className="mt-1 grid gap-1 sm:grid-cols-2">
                <Pieces pieces={pair.front_pieces} tone="learned" />
                <Pieces pieces={pair.end_pieces} tone="muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
