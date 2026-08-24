"use client";

// The pieces and route labels every widget on the moving-a-vocabulary page draws.
//
// A piece is a string with two things worth showing separately: the
// end-of-word marker, which is not part of the spelling and reads as noise at
// full contrast, and the stand-in a vocabulary produces when it cannot spell
// something, which is the one piece a reader should notice. A route is which of
// the three rules answered for one token, and it is drawn as a chip so that a
// long mapping table can be scanned by colour. Both live here so the five
// widgets draw them the same way. The API computes; these only draw.

import { ReactNode } from "react";

export const END_OF_WORD = "</w>";
export const CONTINUATION = "##";
export const UNKNOWN = "[UNK]";

// One vocabulary piece as a chip.
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

export const ROUTE_WORDS: Record<string, string> = {
  copied: "copied",
  rebuilt: "read again",
  stand_in: "stand-in",
  nothing: "nothing",
};

const ROUTE_COLOURS: Record<string, string> = {
  copied:
    "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-950/40 dark:text-emerald-200",
  rebuilt:
    "border-indigo-300 bg-indigo-50 text-indigo-900 dark:border-indigo-500/60 dark:bg-indigo-950/40 dark:text-indigo-200",
  stand_in:
    "border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-500/70 dark:bg-amber-950/40 dark:text-amber-200",
  nothing:
    "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-500/60 dark:bg-rose-950/40 dark:text-rose-200",
};

export const ROUTE_FILLS: Record<string, string> = {
  copied: "#10b981",
  rebuilt: "#6366f1",
  stand_in: "#f59e0b",
  nothing: "#f43f5e",
};

// Which of the three rules answered for one token.
export function RouteChip({ route }: { route: string }) {
  return (
    <span
      className={`inline-block rounded border px-1.5 py-0.5 text-[11px] ${
        ROUTE_COLOURS[route] ?? ROUTE_COLOURS.copied
      }`}
    >
      {ROUTE_WORDS[route] ?? route}
    </span>
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

export const CORPUS_LABELS: Record<string, string> = {
  reports: "Reports and costs",
  kitchen: "Bread and pastry",
  four_words: "Four words, repeated",
};
