"use client";

// Three texts encoded and read straight back, under both schemes.
//
// The API encodes each text, decodes the numbers it produced and compares what
// came back against what went in, character for character. The browser lays the
// six results out side by side and marks the two ways a text can fail to come
// back: a piece the table had never seen, and spacing the scheme never held.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { EncodedText, encodeTexts } from "@/lib/concepts/what-a-token-is";
import {
  ACCENTED_SENTENCE,
  AWKWARD_SENTENCE,
  RUNNING_SENTENCE,
  visible,
} from "./tokenBasicsFixtures";

const TEXTS = [
  { label: "the running sentence", text: RUNNING_SENTENCE },
  { label: "spaced differently", text: AWKWARD_SENTENCE },
  { label: "two unseen letters", text: ACCENTED_SENTENCE },
];

export function RoundTripTable() {
  const [words, setWords] = useState<EncodedText[] | null>(null);
  const [characters, setCharacters] = useState<EncodedText[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const sources = TEXTS.map((entry) => entry.text);
        const [wordView, characterView] = await Promise.all([
          encodeTexts(sources, "word"),
          encodeTexts(sources, "character"),
        ]);
        setWords(wordView.encodings);
        setCharacters(characterView.encodings);
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!words || !characters) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {TEXTS.map((entry, position) => (
        <div
          key={entry.label}
          className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800"
        >
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {entry.label}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-400">
            {visible(entry.text)}
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Result scheme="whole words" encoding={words[position]} />
            <Result scheme="characters" encoding={characters[position]} />
          </div>
        </div>
      ))}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        A space is drawn as {"␣"} and a line break as {"⏎"}, so a difference in
        spacing is visible rather than invisible.
      </p>
    </div>
  );
}

function Result({
  scheme,
  encoding,
}: {
  scheme: string;
  encoding: EncodedText;
}) {
  const exact = encoding.round_trip_exact;
  return (
    <div
      className={`rounded-md border px-3 py-2 ${
        exact
          ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-700 dark:bg-emerald-950/20"
          : "border-amber-300 bg-amber-50/60 dark:border-amber-700 dark:bg-amber-950/20"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {scheme}
        </span>
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
          {encoding.n_tokens} numbers, {encoding.n_unknown} unseen
        </span>
      </div>
      <p className="mt-1 font-mono text-xs text-slate-900 dark:text-slate-100">
        {visible(encoding.decoded)}
      </p>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        {exact ? "identical to what went in" : "not what went in"}
      </p>
    </div>
  );
}
