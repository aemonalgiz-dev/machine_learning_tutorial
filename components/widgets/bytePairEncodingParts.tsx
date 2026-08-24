"use client";

// The pieces every widget on the byte pair encoding page draws.
//
// A piece is a string with three things worth showing separately: the
// end-of-word marker, which is not part of the spelling and reads as noise at
// full contrast; the stand-in a vocabulary produces when it cannot spell
// something, which is the one piece a reader should notice; and a piece that is
// one raw byte of a character rather than anything a corpus taught, which is
// worth telling apart from a learned piece since it is what the repair costs.
// All three live here so the widgets draw them the same way, and so a change to
// the marker is one edit. The API computes; these only draw.

import { ReactNode } from "react";

export const END_OF_WORD = "</w>";
export const UNKNOWN = "[UNK]";

// A piece written as one byte of a character, in the usual hexadecimal form.
const BYTE_ROW = /^<0x[0-9A-F]{2}>$/;

// One vocabulary piece as a chip. `tone` colours the whole chip where a widget
// is contrasting two fits; the unknown stand-in and a raw byte override it,
// since a reader should always be able to find both.
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
  if (BYTE_ROW.test(text)) {
    return (
      <span className="rounded border border-sky-300 bg-sky-50 px-1.5 py-0.5 font-mono text-xs text-sky-800 dark:border-sky-500/60 dark:bg-sky-950/40 dark:text-sky-200">
        {text}
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
      {body === "" ? " " : body.replace(/ /g, "·")}
      {marked && (
        <span className="ml-0.5 text-slate-400 dark:text-slate-500">&#9141;</span>
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
export function Stat({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
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

export const CORPUS_LABELS: Record<string, string> = {
  four_words: "Four words, repeated",
  sentences: "Eighteen sentences",
};
