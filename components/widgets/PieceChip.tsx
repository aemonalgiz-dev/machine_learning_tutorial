"use client";

// One piece of a split, drawn so its spacing can be seen.
//
// Shared by the widgets of the page about the pattern language models
// pre-tokenize with, because the whole subject of that page is a character
// that is invisible in ordinary type. A leading space is drawn as a raised dot
// in a lighter colour, a tab as an arrow and a line break as a return mark, and
// the rest of the piece is drawn as it is written. Nothing here computes
// anything; the API supplies every piece and the browser draws it.

import { ReactNode } from "react";

const SPACING: Record<string, string> = {
  " ": "·",
  "\t": "→",
  "\n": "↵",
  "\r": "↵",
};

export function visibleSpacing(text: string): string {
  return [...text].map((character) => SPACING[character] ?? character).join("");
}

export function PieceChip({
  text,
  tone = "plain",
  title,
}: {
  text: string;
  tone?: "plain" | "spaced" | "warn" | "good";
  title?: string;
}) {
  const leading = text.length - text.trimStart().length;
  const held = text.slice(0, leading);
  const rest = text.slice(leading);
  const shade =
    tone === "spaced"
      ? "bg-indigo-100 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200"
      : tone === "warn"
        ? "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
        : tone === "good"
          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";

  return (
    <span
      title={title}
      className={`rounded px-1.5 py-0.5 font-mono text-xs whitespace-pre ${shade}`}
    >
      {held && (
        <span className="text-slate-400 dark:text-slate-500">
          {visibleSpacing(held)}
        </span>
      )}
      {rest ? visibleSpacing(rest) : null}
    </span>
  );
}

export function ChipRow({
  pieces,
  tone,
}: {
  pieces: string[];
  tone?: (piece: string, position: number) => "plain" | "spaced" | "warn" | "good";
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {pieces.map((piece, position) => (
        <PieceChip
          key={`${position}-${piece}`}
          text={piece}
          tone={tone ? tone(piece, position) : "plain"}
        />
      ))}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
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
