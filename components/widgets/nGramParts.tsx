"use client";

// The pieces every widget on the n-grams page draws.
//
// Three kinds of word turn up on this page and they have to look different: an
// ordinary word, a marker standing for a sentence edge, and the stand-in a
// closed vocabulary produces for a word it was never taught. The last two are
// not words of the text at all, so they are drawn as what they are rather than
// left to read as odd-looking vocabulary. This page also prints a probability
// beside a word far more often than its neighbours do, and a probability here
// runs from a little under one down to a ten-thousandth, so the one way of
// writing them lives here too. The API computes; these only draw.

import { ReactNode } from "react";

export const SENTENCE_START = "<s>";
export const SENTENCE_END = "</s>";
export const UNKNOWN = "<unk>";

export const BUTTON_CLASS =
  "rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700";
export const ACTIVE_CLASS =
  "rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition";

// One word as a chip. A marker and the stand-in get their own colouring, since
// a reader has to be able to tell at a glance which parts of a framed sentence
// were in the text and which were put there by the framing.
export function Word({
  text,
  tone = "plain",
}: {
  text: string;
  tone?: "plain" | "learned" | "muted" | "highlight";
}) {
  if (text === SENTENCE_START || text === SENTENCE_END) {
    return (
      <span className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        {text}
      </span>
    );
  }
  if (text === UNKNOWN) {
    return (
      <span className="rounded border border-amber-400 bg-amber-50 px-1.5 py-0.5 font-mono text-xs text-amber-800 dark:border-amber-500/70 dark:bg-amber-950/40 dark:text-amber-200">
        {UNKNOWN}
      </span>
    );
  }
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
      {text}
    </span>
  );
}

// A run of words, wrapped.
export function Words({
  words,
  tone = "plain",
}: {
  words: string[];
  tone?: "plain" | "learned" | "muted" | "highlight";
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {words.map((word, index) => (
        <Word key={`${index}-${word}`} text={word} tone={tone} />
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

// A probability written for reading rather than for arithmetic.
export function readProbability(value: number): string {
  if (value === 0) return "0";
  if (value >= 0.0005) return value.toFixed(4);
  return value.toExponential(1);
}

// A perplexity, which on this page is anything from a shade above one to a
// number in the thousands, and is sometimes not a number at all.
export function readPerplexity(value: number | null): string {
  if (value === null) return "impossible";
  if (value >= 1000) return value.toFixed(0);
  return value.toFixed(2);
}

// The additive constant, which is swept across four orders of magnitude.
export function readStrength(value: number): string {
  if (value >= 0.1) return value.toString();
  return value.toFixed(3);
}
