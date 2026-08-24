"use client";

// Two words cut into their overlapping three-character pieces, and the buckets
// those pieces light.
//
// The API wraps each word in a boundary marker, takes every run of three
// characters, hashes each one, and answers with the sorted set of buckets and
// with how many buckets the two words have in common. The browser draws the two
// sets side by side and colours what they share, so the overlap between a word
// and its inflected form is visible before any training has happened.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  FingerprintsView,
  fingerprintWords,
} from "@/lib/concepts/hashing-characters";
import { TRIGRAM_BUCKETS, WORD_PAIRS } from "./hashingCharactersFixtures";

export function TrigramFingerprints() {
  const [pair, setPair] = useState(WORD_PAIRS[0]);
  const [view, setView] = useState<FingerprintsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const answer = await fingerprintWords(pair.words, TRIGRAM_BUCKETS);
        if (live) {
          setView(answer);
          setMessage(null);
        }
      } catch (error) {
        if (!live) return;
        setView(null);
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
    return () => {
      live = false;
    };
  }, [pair]);

  const shared =
    view === null
      ? new Set<number>()
      : new Set(
          view.words[0].bucket_ids.filter((bucket) =>
            view.words[1].bucket_ids.includes(bucket),
          ),
        );

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {WORD_PAIRS.map((choice) => (
          <button
            key={choice.label}
            type="button"
            onClick={() => setPair(choice)}
            className={`rounded-lg px-2.5 py-1 text-sm font-medium ${
              pair.label === choice.label
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {choice.label}
          </button>
        ))}
      </div>

      {!view ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {message ?? "…"}
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {view.words.map((word) => (
              <div
                key={word.word}
                className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
              >
                <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {view.boundary_marker}
                  {word.word}
                  {view.boundary_marker}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {word.trigrams.map((trigram, position) => (
                    <span
                      key={`${position}-${trigram}`}
                      className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {trigram}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {word.bucket_ids.map((bucket) => (
                    <span
                      key={bucket}
                      className={`rounded px-1.5 py-0.5 font-mono text-[11px] ${
                        shared.has(bucket)
                          ? "bg-indigo-100 font-semibold text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {bucket}
                    </span>
                  ))}
                </div>
                <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {word.n_trigrams} pieces, {word.n_active} buckets lit
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {view.pairs[0].shared === 0
              ? `These two share no bucket at all, so a model starts with nothing in common between them.`
              : `They share ${view.pairs[0].shared} of ${view.pairs[0].first_active} and ${view.pairs[0].second_active} buckets, which is ${view.pairs[0].shared} rows the two words already have in common.`}
            {view.pairs[0].identical
              ? " In fact the two sets are the same, so nothing whatever separates them."
              : ""}
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            The shared buckets are the highlighted ones. At{" "}
            {view.n_buckets.toLocaleString()} buckets the table has that many
            rows however many words are read, and a word never met before still
            lights a set of them, because its pieces are hashed rather than
            looked up.
          </p>
        </>
      )}
    </div>
  );
}
