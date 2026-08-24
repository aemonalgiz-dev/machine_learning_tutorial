"use client";

// The same corpus, the same number of merges, two alphabets.
//
// One fit merges over the characters the corpus happens to contain, spelling
// anything else in bytes underneath; the other merges over the 256 byte values
// themselves and has no character alphabet at all. Both round-trip everything,
// so the API reads three texts with each and reports the lengths, which is
// where they differ. Switch texts to see the ordering between them change.

import { useEffect, useState } from "react";
import {
  VariantsView,
  fetchVariants,
  messageFor,
} from "@/lib/concepts/byte-pair-encoding";
import { Pieces, Stat } from "./bytePairEncodingParts";

export function AlphabetComparison() {
  const [variants, setVariants] = useState<VariantsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [which, setWhich] = useState<"sentence" | "foreign" | "greek">(
    "sentence",
  );

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

  const text = variants[which];

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {(
          [
            ["sentence", "The running sentence"],
            ["foreign", "A sentence with an accent in it"],
            ["greek", "A sentence in another script"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setWhich(key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              which === key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mb-3 font-mono text-sm text-slate-700 dark:text-slate-300">
        {text}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {variants.fits.map((fit) => {
          const reading = fit[which];
          return (
            <div
              key={fit.key}
              className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
            >
              <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                {fit.label}
              </p>
              <Pieces
                pieces={reading.pieces}
                tone={fit.key === "bytes" ? "highlight" : "learned"}
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Stat label="merged over" value={fit.alphabet_size} />
                <Stat label="merges" value={fit.n_merges} />
                <Stat label="this text, in pieces" value={reading.n_pieces} />
                <Stat label="whole corpus" value={fit.corpus_pieces} />
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Glued back together:{" "}
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {reading.decoded}
                </span>
              </p>
              <p
                className={`mt-1 text-xs font-medium ${
                  reading.round_trip_exact
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-amber-700 dark:text-amber-400"
                }`}
              >
                {reading.round_trip_exact
                  ? "identical to what went in"
                  : "not what went in"}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Both fits learned the same number of merges from the same eighteen
        sentences, so the only difference between them is what they merged over.
        Those sentences use {variants.corpus_distinct_characters} distinct
        characters, so a fit merging over bytes is spending its early merges
        rebuilding the letters a character fit began with, and it carries{" "}
        {256 - variants.corpus_distinct_characters} byte rows nothing here will
        ever reach. Both return every text exactly, so what separates them is
        length, and which of them is shorter depends on the text.
      </p>
    </div>
  );
}
