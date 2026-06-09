"use client";

// The same three texts read as bytes and as characters, and read straight back.
//
// The API encodes each text under both readings, decodes the numbers it
// produced and compares what came back against what went in, character for
// character. The browser lays the two results side by side so that the one
// reading which survives all three texts is visible at a glance.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  Reading,
  ReadingView,
  ReadingsView,
  fetchThreeTexts,
  readingOf,
} from "@/lib/concepts/bytes-and-characters";
import { THREE_TEXTS, visible } from "./bytesAndCharactersFixtures";

const PAIR: [Reading, string][] = [
  ["bytes", "as bytes"],
  ["characters", "as characters"],
];

export function ByteCharacterRoundTrip() {
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
                {seen.n_characters} characters, {seen.n_bytes} bytes
              </p>
            </div>
            <p className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-400">
              {visible(seen.source)}
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {PAIR.map(([name, label]) => {
                const reading = readingOf(seen, name);
                return reading ? (
                  <Result key={name} label={label} reading={reading} />
                ) : null;
              })}
            </div>
          </div>
        );
      })}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        The character table was built from eighteen English sentences, so what it
        can spell is a fact about those sentences. The byte table holds all{" "}
        {view.byte_table} byte values whatever it has read.
      </p>
    </div>
  );
}

function Result({ label, reading }: { label: string; reading: ReadingView }) {
  return (
    <div
      className={`rounded-md border px-3 py-2 ${
        reading.exact
          ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-700 dark:bg-emerald-950/20"
          : "border-amber-300 bg-amber-50/60 dark:border-amber-700 dark:bg-amber-950/20"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
          {reading.n_tokens} numbers, {reading.n_unseen} unspellable
        </span>
      </div>
      <p className="mt-1 break-words font-mono text-xs text-slate-900 dark:text-slate-100">
        {visible(reading.decoded)}
      </p>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        {reading.exact ? "identical to what went in" : "not what went in"}
      </p>
    </div>
  );
}
