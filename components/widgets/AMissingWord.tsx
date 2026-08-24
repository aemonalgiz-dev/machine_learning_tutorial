"use client";

// One word taken out of the list, and the answers either side of taking it.
//
// The API runs both scans against the full list and against the list less one
// word, and reports for each answer how many of its pieces are entries; the
// browser puts the two side by side. What to look at is the entry count of the
// answer on the right, since an answer built entirely out of entries carries no
// sign at all that a word is missing.

import { useEffect, useState } from "react";
import {
  MissesView,
  fetchMisses,
  messageFor,
} from "@/lib/concepts/maximum-matching";
import { Chip, Legend, Loading, ReadingBlock } from "./maximumMatchingParts";

export function AMissingWord() {
  const [misses, setMisses] = useState<MissesView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setMisses(await fetchMisses());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!misses) {
    return <Loading message={message} />;
  }

  const miss = misses.misses[chosen];
  const allEntries = miss.without_the_word.filter(
    (reading) => reading.n_entries === reading.n_pieces,
  );

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="mb-3 flex flex-wrap gap-2">
        {misses.misses.map((option, position) => (
          <button
            key={option.removed}
            type="button"
            onClick={() => setChosen(position)}
            className={`rounded-md border px-3 py-1 text-sm ${
              chosen === position
                ? "border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className="break-all font-mono text-base text-slate-900 dark:text-slate-100">
        {miss.text}
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        A reader answers{" "}
        <span className="font-mono">{miss.reader_reading.join(" | ")}</span>. The
        word taken out of the list is <Chip text={miss.removed} tone="quiet" />
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            with the word in the list
          </p>
          {miss.with_the_word.map((reading) => (
            <ReadingBlock
              key={reading.scan}
              reading={reading}
              heading={`Scanned from the ${reading.scan === "left to right" ? "left" : "right"}`}
            />
          ))}
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            without it
          </p>
          {miss.without_the_word.map((reading) => (
            <ReadingBlock
              key={reading.scan}
              reading={reading}
              heading={`Scanned from the ${reading.scan === "left to right" ? "left" : "right"}`}
            />
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
        {allEntries.length} of the {miss.without_the_word.length} answers on the
        right are built entirely out of entries, and those carry no mark
        anywhere saying that a word the text uses is absent.
      </p>

      <Legend />
    </div>
  );
}
