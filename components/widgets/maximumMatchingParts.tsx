"use client";

// The pieces every widget on the maximum matching page draws with.
//
// A cut text is always drawn the same way here: one chip per piece, coloured by
// whether the word list held it, so a lone character the list never saw is
// visible at a glance beside a matched entry. The API decides which is which;
// nothing in this file looks a word up.

import { ReactNode } from "react";
import { Piece, Reading, grouped } from "@/lib/concepts/maximum-matching";

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
  tone: "entry" | "lone" | "quiet";
  title?: string;
}) {
  const tones = {
    entry:
      "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-500/60 dark:bg-sky-950/40 dark:text-sky-200",
    lone: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/60 dark:bg-amber-950/30 dark:text-amber-200",
    quiet:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
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

export function Cut({ pieces }: { pieces: Piece[] }) {
  if (pieces.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Nothing to cut.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {pieces.map((piece) => (
        <Chip
          key={`${piece.start}-${piece.end}-${piece.text}`}
          text={piece.text}
          tone={piece.is_entry ? "entry" : "lone"}
          title={
            piece.is_entry
              ? "a word the list holds"
              : "no entry fitted, so one character was taken"
          }
        />
      ))}
    </div>
  );
}

export function WordsCut({ words }: { words: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {words.map((word, position) => (
        <Chip key={`${position}-${word}`} text={word} tone="quiet" />
      ))}
    </div>
  );
}

export function ReadingBlock({
  reading,
  heading,
  note,
}: {
  reading: Reading;
  heading: string;
  note?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        {heading}
      </p>
      <Cut pieces={reading.pieces} />
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {reading.n_pieces} pieces, {reading.n_entries} of them entries,{" "}
        {reading.n_single_characters} lone characters, {reading.n_lookups}{" "}
        candidates asked about
      </p>
      {note && (
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{note}</p>
      )}
    </div>
  );
}

export function CutsLine({
  n_characters,
  n_cuts,
}: {
  n_characters: number;
  n_cuts: string;
}) {
  return (
    <p className="text-xs text-slate-500 dark:text-slate-400">
      {n_characters} characters, so {grouped(n_cuts)} ways to cut them
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
      <Chip text="x" tone="lone" /> a lone character, because nothing fitted
    </p>
  );
}
