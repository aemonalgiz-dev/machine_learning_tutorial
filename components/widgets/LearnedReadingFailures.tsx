"use client";

// Three texts read by a vocabulary merged from eighteen English sentences, and
// what came back when the numbers were read again.
//
// The API fits the merging scheme on those sentences, encodes each text against
// it, decodes the numbers and compares the result against what went in. The
// browser shows the stand-in count and the returned string, since the returned
// string is where the damage is visible and the count alone is not.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ReadingsView,
  fetchThreeTexts,
  readingOf,
} from "@/lib/concepts/bytes-and-characters";
import { THREE_TEXTS, visible } from "./bytesAndCharactersFixtures";

export function LearnedReadingFailures() {
  const [view, setView] = useState<ReadingsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchThreeTexts(THREE_TEXTS.map((entry) => entry.text)));
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

  return (
    <div className="space-y-3">
      {THREE_TEXTS.map((entry, position) => {
        const seen = view.texts[position];
        const learned = readingOf(seen, "learned");
        if (!learned) return null;
        return (
          <div
            key={entry.label}
            className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {entry.label}
              </p>
              <p className="font-mono text-xs text-slate-600 dark:text-slate-400">
                {learned.n_tokens} numbers, {learned.n_unseen} of them a stand-in
              </p>
            </div>
            <p className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-400">
              {visible(seen.source)}
            </p>
            <p
              className={`mt-2 rounded-md border px-3 py-2 font-mono text-xs ${
                learned.exact
                  ? "border-emerald-300 bg-emerald-50/60 text-slate-900 dark:border-emerald-700 dark:bg-emerald-950/20 dark:text-slate-100"
                  : "border-amber-300 bg-amber-50/60 text-slate-900 dark:border-amber-700 dark:bg-amber-950/20 dark:text-slate-100"
              }`}
            >
              {visible(learned.decoded)}
            </p>
          </div>
        );
      })}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        The lower line of each block is what came back after the numbers were
        read again, with a space drawn as {"␣"}. The table holds{" "}
        {view.learned_table} entries.
      </p>
    </div>
  );
}
