"use client";

// The pieces every widget on the SentencePiece page draws.
//
// A piece here can carry a mark at either end and the two mean opposite
// things: a leading U+2581 stands for the space in front of a word, and a
// trailing </w> stands for the space after one. Both are drawn as a faint
// glyph rather than as literal characters, since at full contrast they read as
// noise, and the stand-in a vocabulary produces when it cannot spell something
// is drawn loudly, since it is the piece a reader should notice. Both live
// here so the seven widgets draw them the same way. The API computes; these
// only draw.

import { ReactNode } from "react";

export const MARK = "▁";
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

// One vocabulary piece as a chip, with either mark shown faintly at the side
// it sits on. `tone` colours the whole chip where a widget is contrasting two
// fits; the stand-in overrides it, since a reader should always find it.
export function Piece({ text, tone = "plain" }: { text: string; tone?: Tone }) {
  if (text === UNKNOWN) {
    return (
      <span className="rounded border border-amber-400 bg-amber-50 px-1.5 py-0.5 font-mono text-xs text-amber-800 dark:border-amber-500/70 dark:bg-amber-950/40 dark:text-amber-200">
        {UNKNOWN}
      </span>
    );
  }
  const leads = text.startsWith(MARK);
  const trails = text.endsWith(END_OF_WORD);
  let body = leads ? text.slice(MARK.length) : text;
  body = trails ? body.slice(0, -END_OF_WORD.length) : body;
  return (
    <span
      className={`rounded border px-1.5 py-0.5 font-mono text-xs ${PALETTE[tone]}`}
    >
      {leads && (
        <span className="mr-0.5 text-slate-400 dark:text-slate-500">
          &#9601;
        </span>
      )}
      {body === "" ? " " : body}
      {trails && (
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

// A stream of characters with every mark picked out, for the places the page
// shows a whole text rather than its pieces.
export function MarkedText({ text }: { text: string }) {
  return (
    <p className="break-all font-mono text-sm text-slate-700 dark:text-slate-300">
      {[...text].map((character, index) =>
        character === MARK ? (
          <span
            key={`${index}-mark`}
            className="rounded bg-indigo-100 px-0.5 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
          >
            {MARK}
          </span>
        ) : (
          <span key={`${index}-${character}`}>{character}</span>
        ),
      )}
    </p>
  );
}

export const CORPUS_LABELS: Record<string, string> = {
  four_words: "Four words, repeated",
  sentences: "Eighteen sentences",
  unspaced: "Five sentences, no spaces",
};

export const LEARNER_LABELS: Record<string, string> = {
  merging: "Join the commonest pair",
  shrinking: "Drop the least missed piece",
};
