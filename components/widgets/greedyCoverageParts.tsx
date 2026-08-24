"use client";

// The pieces every widget on the greedy coverage page draws.
//
// A piece is a string with two things worth showing separately: the
// end-of-word marker, which is not part of the spelling and reads as noise at
// full contrast, and the stand-in a vocabulary produces when it cannot spell
// something, which is the one piece a reader should notice. Both live here so
// the six widgets draw them the same way. The API computes; these only draw.

import { ReactNode } from "react";

export const END_OF_WORD = "</w>";
export const UNKNOWN = "[UNK]";

export const COVERAGE_COLOUR = "#6366f1";
export const MERGING_COLOUR = "#10b981";

// One vocabulary piece as a chip. `tone` colours the whole chip where a widget
// is contrasting two vocabularies; the unknown stand-in overrides it, since a
// reader should always be able to find it.
export function Piece({
  text,
  tone = "plain",
}: {
  text: string;
  tone?: "plain" | "chosen" | "muted" | "rival";
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
    chosen:
      "border-indigo-300 bg-indigo-50 text-indigo-900 dark:border-indigo-500/60 dark:bg-indigo-950/40 dark:text-indigo-200",
    muted:
      "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400",
    rival:
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
  tone?: "plain" | "chosen" | "muted" | "rival";
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

// A row of buttons where exactly one is chosen.
export function Choices<T extends string | number>({
  options,
  chosen,
  onChoose,
  label,
}: {
  options: { value: T; label: string }[];
  chosen: T;
  onChoose: (value: T) => void;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {label && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {label}
        </span>
      )}
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => onChoose(option.value)}
          className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
            option.value === chosen
              ? "border-indigo-400 bg-indigo-50 text-indigo-900 dark:border-indigo-500/70 dark:bg-indigo-950/40 dark:text-indigo-200"
              : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export const SIZE_LABEL: Record<string, string> = {
  four_words: "Four words, repeated",
  sentences: "Eighteen sentences",
};
