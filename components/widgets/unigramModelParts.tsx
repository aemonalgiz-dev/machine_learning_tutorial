"use client";

// The pieces every widget on the unigram language model page draws.
//
// A piece is a string with two things worth showing separately: the
// end-of-word marker, which is not part of the spelling and reads as noise at
// full contrast, and the stand-in a vocabulary produces when it cannot spell
// something, which is the one piece a reader should notice. Both live here so
// the widgets draw them the same way. This page also draws a probability
// beside a piece far more often than its neighbours do, so the two ways of
// writing a very small number live here as well. The API computes; these only
// draw.

import { ReactNode } from "react";

export const END_OF_WORD = "</w>";
export const UNKNOWN = "[UNK]";

// One vocabulary piece as a chip. `tone` colours the whole chip where a widget
// is contrasting two cuts; the unknown stand-in overrides it, since a reader
// should always be able to find it.
export function Piece({
  text,
  tone = "plain",
}: {
  text: string;
  tone?: "plain" | "learned" | "muted" | "highlight";
}) {
  if (text === UNKNOWN) {
    return (
      <span className="rounded border border-amber-400 bg-amber-50 px-1.5 py-0.5 font-mono text-xs text-amber-800 dark:border-amber-500/70 dark:bg-amber-950/40 dark:text-amber-200">
        {UNKNOWN}
      </span>
    );
  }
  const marked = text.endsWith(END_OF_WORD);
  const body = marked ? text.slice(0, -END_OF_WORD.length) : text;
  const palette = {
    plain:
      "border-slate-300 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
    learned:
      "border-indigo-300 bg-indigo-50 text-indigo-900 dark:border-indigo-500/60 dark:bg-indigo-950/40 dark:text-indigo-200",
    muted:
      "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400",
    highlight:
      "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-950/40 dark:text-emerald-200",
  }[tone];
  return (
    <span
      className={`rounded border px-1.5 py-0.5 font-mono text-xs ${palette}`}
    >
      {body === "" ? " " : body.replace(/ /g, "·")}
      {marked && (
        <span className="ml-0.5 text-slate-400 dark:text-slate-500">
          &#9141;
        </span>
      )}
    </span>
  );
}

// A run of pieces, wrapped.
export function Pieces({
  pieces,
  tone = "plain",
}: {
  pieces: string[];
  tone?: "plain" | "learned" | "muted" | "highlight";
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {pieces.map((piece, index) => (
        <Piece key={`${index}-${piece}`} text={piece} tone={tone} />
      ))}
    </div>
  );
}

// One readout, in the shape the other pages use.
export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md bg-slate-50 px-2.5 py-1.5 dark:bg-slate-950/60">
      <p className="text-[11px] leading-tight text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="font-mono text-sm text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

// A probability written for reading rather than for arithmetic. Anything above
// a thousandth gets three decimals; below that the exponent is the only useful
// part of the number, and on a corpus this small it goes a very long way down.
export function readProbability(value: number): string {
  if (value >= 0.001) return value.toFixed(3);
  if (value === 0) return "0";
  return value.toExponential(1);
}

// A share of a word's own probability, which is what a reader is comparing
// when several spellings sit under one another.
export function readShare(value: number): string {
  if (value >= 0.0001) return `${(value * 100).toFixed(2)}%`;
  return "under 0.01%";
}

export const CORPUS_LABELS: Record<string, string> = {
  four_words: "Four words, repeated",
  sentences: "Eighteen sentences",
};
