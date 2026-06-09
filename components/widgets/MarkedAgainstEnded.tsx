"use client";

// Five words, each cut twice: once by a vocabulary that marks a word's
// continuations and once by one that marks a word's end.
//
// Both vocabularies were learned from the same eighteen sentences and neither
// has met any of these words. What the two rows show is that the marking
// decides which character has to have been seen where: marking continuations
// puts the whole weight on the first character, marking ends puts it on the
// last. The API fits both and cuts both; the browser draws the rows.

import { useEffect, useState } from "react";
import {
  SpellingView,
  fetchSpelling,
  messageFor,
} from "@/lib/concepts/wordpiece";
import { Pieces, Stat } from "./wordPieceParts";

export function MarkedAgainstEnded() {
  const [spelling, setSpelling] = useState<SpellingView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="space-y-4">
        {spelling.comparisons.map((row) => (
          <div key={row.word}>
            <p className="font-mono text-sm text-slate-800 dark:text-slate-200">
              {row.word}
            </p>
            <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
                  marking what continues a word
                </p>
                <Pieces
                  pieces={row.marked}
                  tone={row.marked_unknown ? "muted" : "learned"}
                />
              </div>
              <div>
                <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
                  marking where a word ends
                </p>
                <Pieces
                  pieces={row.ended}
                  tone={row.ended_unknown ? "muted" : "highlight"}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="characters in the corpus" value={spelling.distinct_characters} />
        <Stat label="never open a word" value={spelling.never_opens.length} />
        <Stat label="never end a word" value={spelling.never_ends.length} />
        <Stat
          label="rows in each vocabulary"
          value={`${spelling.marked_alphabet.length} · ${spelling.ended_alphabet_size}`}
        />
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Of the {spelling.distinct_characters} characters the corpus uses,{" "}
        {spelling.never_opens.length} never open a word and{" "}
        {spelling.never_ends.length} never end one, so each vocabulary has a hole
        and the holes are in different places. Alvarez ends in a letter no word
        of the corpus ends in; zebra begins with one no word begins with.
      </p>
    </div>
  );
}
