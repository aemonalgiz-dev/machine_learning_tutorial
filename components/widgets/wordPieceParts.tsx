"use client";

// The pieces every widget on the WordPiece page draws.
//
// A piece is a string with two things worth showing separately: the mark that
// says it continues a word rather than starting one, which is not part of the
// spelling and reads as noise at full contrast, and the stand-in a vocabulary
// produces when it cannot spell something, which is the one piece a reader
// should notice. Both live here so the six widgets draw them the same way. The
// API computes; these only draw.

import { ReactNode } from "react";

export const CONTINUATION = "##";
export const END_OF_WORD = "</w>";
export const UNKNOWN = "[UNK]";

export type Tone = "plain" | "learned" | "muted" | "highlight";

const PALETTE: Record<Tone, string> = {
  plain:
    "border-slate-300 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
  learned:
    "border-indigo-300 bg-indigo-50 text-indigo-900 dark:border-indigo-500/60 dark:bg-indigo-950/40 dark:text-indigo-200",
  muted:
    "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400",
  highlight:
    "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-950/40 dark:text-emerald-200",
};

// One vocabulary piece as a chip. A continuation mark is drawn faint and
// leading, so a reader can see at a glance where each word restarts; an
// end-of-word mark, which only the count-scored fits carry, is drawn as a
// trailing space glyph.
export function Piece({
  text,
  tone = "plain",
}: {
  text: string;
  tone?: Tone;
}) {
  if (text === UNKNOWN) {
    return (
      <span className="rounded border border-amber-400 bg-amber-50 px-1.5 py-0.5 font-mono text-xs text-amber-800 dark:border-amber-500/70 dark:bg-amber-950/40 dark:text-amber-200">
        {UNKNOWN}
      </span>
    );
  }
  const continues = text.startsWith(CONTINUATION);
  const ends = text.endsWith(END_OF_WORD);
  let body = continues ? text.slice(CONTINUATION.length) : text;
  body = ends ? body.slice(0, -END_OF_WORD.length) : body;
  return (
    <span
      className={`rounded border px-1.5 py-0.5 font-mono text-xs ${PALETTE[tone]}`}
    >
      {continues && (
        <span className="mr-0.5 text-slate-400 dark:text-slate-500">
          {CONTINUATION}
        </span>
      )}
      {body === "" ? " " : body.replace(/ /g, "·")}
      {ends && (
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
  tone?: Tone;
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

// The score to four decimals, which is enough to separate every candidate the
// page shows and short enough to sit in a table cell.
export function formatScore(score: number): string {
  return score.toFixed(4);
}

export const CORPUS_LABELS: Record<string, string> = {
  four_words: "Four words, repeated",
  sentences: "Eighteen sentences",
};
