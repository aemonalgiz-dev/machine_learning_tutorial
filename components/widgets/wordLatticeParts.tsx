"use client";

// The pieces every widget on the word lattice page draws with.
//
// A reading is always drawn the same way here: one chip per word, coloured by
// whether the list held it, so a lone character standing in for a word nobody
// wrote down is visible beside a matched entry. The API decides which is which
// and computes every score; nothing in this file looks a word up or adds a
// logarithm.

import { ReactNode } from "react";
import { Edge, Reading, grouped } from "@/lib/concepts/the-word-lattice";

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

export function Chip({
  text,
  tone,
  title,
}: {
  text: string;
  tone: "entry" | "lone" | "quiet" | "best";
  title?: string;
}) {
  const tones = {
    entry:
      "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-500/60 dark:bg-sky-950/40 dark:text-sky-200",
    lone: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/60 dark:bg-amber-950/30 dark:text-amber-200",
    quiet:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
    best: "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-500/70 dark:bg-emerald-950/30 dark:text-emerald-200",
  };
  return (
    <span
      title={title}
      className={`inline-block rounded border px-1.5 py-0.5 font-mono text-sm ${tones[tone]}`}
    >
      {text === " " ? "·" : text}
    </span>
  );
}

// One reading, drawn as its words. A word the list holds and a lone character it
// does not are told apart by colour, because the second is the model admitting
// it has nothing to say about that character.
export function WordsOfAReading({
  words,
  entries,
}: {
  words: string[];
  entries: Set<string>;
}) {
  if (words.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Nothing to read.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {words.map((word, position) => (
        <Chip
          key={`${position}-${word}`}
          text={word}
          tone={entries.has(word) ? "entry" : "lone"}
          title={
            entries.has(word)
              ? "a word the list holds"
              : "no entry covers this, so one character stands on its own"
          }
        />
      ))}
    </div>
  );
}

export function entriesOf(edges: Edge[]): Set<string> {
  return new Set(edges.filter((edge) => edge.frequency > 0).map((e) => e.word));
}

export function ReadingRow({
  reading,
  entries,
  rank,
  note,
}: {
  reading: Reading;
  entries: Set<string>;
  rank: number;
  note?: ReactNode;
}) {
  return (
    <li className="flex flex-wrap items-start gap-3 border-b border-slate-100 py-2 last:border-0 dark:border-slate-800/60">
      <span className="w-6 shrink-0 pt-0.5 text-xs text-slate-400 dark:text-slate-500">
        {rank}
      </span>
      <span className="min-w-0 grow">
        <WordsOfAReading words={reading.words} entries={entries} />
        {note && (
          <span className="mt-1 block text-xs text-slate-600 dark:text-slate-400">
            {note}
          </span>
        )}
      </span>
      <span className="shrink-0 text-right">
        <span className="block font-mono text-sm text-slate-900 dark:text-slate-100">
          {reading.total_log_score.toFixed(4)}
        </span>
        <span className="block text-[11px] text-slate-500 dark:text-slate-400">
          {reading.n_words} words
        </span>
      </span>
    </li>
  );
}

export function CountsLine({
  n_characters,
  n_cuts,
  n_readings,
  n_edges,
}: {
  n_characters: number;
  n_cuts: string;
  n_readings: string;
  n_edges: number;
}) {
  return (
    <p className="text-xs text-slate-500 dark:text-slate-400">
      {n_characters} characters, {grouped(n_cuts)} ways to cut them,{" "}
      {grouped(n_readings)} of those the list permits, and {n_edges} candidates
      to step along
    </p>
  );
}

export function Loading({ message }: { message: string | null }) {
  return (
    <p className="text-sm text-slate-500 dark:text-slate-400">
      {message ?? "…"}
    </p>
  );
}

export function Legend() {
  return (
    <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
      <Chip text="word" tone="entry" /> an entry of the list
      <Chip text="x" tone="lone" /> a lone character, worth one count
    </p>
  );
}
