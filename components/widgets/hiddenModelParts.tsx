"use client";

// The pieces every widget on the hidden-model segmentation page draws with.
//
// A word is always drawn the same way here: one chip per piece, coloured by
// whether the training sentences contained that word, so a word the model built
// out of characters alone stands out beside one it had been shown. The API
// decides which is which and computes every number; nothing in this file counts
// anything or adds a logarithm.

import { ReactNode } from "react";

export const TAG_COLOURS: Record<string, string> = {
  B: "#0ea5e9",
  M: "#a855f7",
  E: "#10b981",
  S: "#f59e0b",
};

export const TAG_TITLES: Record<string, string> = {
  B: "begins a word of two or more",
  M: "somewhere inside a word of three or more",
  E: "ends a word of two or more",
  S: "a word of one character, standing alone",
};

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
  tone: "known" | "new" | "quiet" | "right";
  title?: string;
}) {
  const tones = {
    known:
      "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-500/60 dark:bg-sky-950/40 dark:text-sky-200",
    new: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/60 dark:bg-amber-950/30 dark:text-amber-200",
    quiet:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
    right:
      "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-500/70 dark:bg-emerald-950/30 dark:text-emerald-200",
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

// One answer, drawn as its words. A word the training sentences held and one the
// model assembled for the first time are told apart by colour, since the second
// is the only thing a word list could never have produced.
export function WordsRow({
  words,
  known,
}: {
  words: string[];
  known: Set<string>;
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
          tone={known.has(word) ? "known" : "new"}
          title={
            known.has(word)
              ? "a word the training sentences contained"
              : "a word assembled here for the first time"
          }
        />
      ))}
    </div>
  );
}

export function TagRow({ tags }: { tags: string }) {
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from(tags).map((tag, position) => (
        <span
          key={`${position}-${tag}`}
          title={TAG_TITLES[tag]}
          className="inline-block w-6 rounded border border-slate-200 text-center font-mono text-xs dark:border-slate-700"
          style={{ color: TAG_COLOURS[tag] }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export function AnswerLine({
  name,
  words,
  known,
  note,
}: {
  name: string;
  words: string[];
  known: Set<string>;
  note?: ReactNode;
}) {
  return (
    <li className="flex flex-wrap items-start gap-3 border-b border-slate-100 py-2 last:border-0 dark:border-slate-800/60">
      <span className="w-40 shrink-0 pt-0.5 text-xs text-slate-500 dark:text-slate-400">
        {name}
      </span>
      <span className="min-w-0 grow">
        <WordsRow words={words} known={known} />
        {note && (
          <span className="mt-1 block text-xs text-slate-600 dark:text-slate-400">
            {note}
          </span>
        )}
      </span>
      <span className="shrink-0 text-right text-[11px] text-slate-500 dark:text-slate-400">
        {words.length} pieces
      </span>
    </li>
  );
}

export function Loading({ message }: { message: string | null }) {
  return (
    <p className="text-sm text-slate-500 dark:text-slate-400">
      {message ?? "…"}
    </p>
  );
}

export function Sentences({ sentences }: { sentences: string[][] }) {
  return (
    <ul className="space-y-1">
      {sentences.map((sentence, position) => (
        <li key={position} className="flex flex-wrap gap-1">
          {sentence.map((word, place) => (
            <Chip key={`${place}-${word}`} text={word} tone="quiet" />
          ))}
        </li>
      ))}
    </ul>
  );
}

export function PlacesLegend() {
  return (
    <p className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
      {["B", "M", "E", "S"].map((tag) => (
        <span key={tag} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-4 rounded"
            style={{ backgroundColor: TAG_COLOURS[tag] }}
          />
          <span className="font-mono">{tag}</span> {TAG_TITLES[tag]}
        </span>
      ))}
    </p>
  );
}
