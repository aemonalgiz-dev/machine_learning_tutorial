"use client";

// The pieces every FastText widget on this page needs.
//
// One colour per word list, so a word that landed among the wrong list is
// visible without a legend being read; one for a piece the corpus taught and
// one for a piece it never saw; one readout tile; and one loading line, so a
// widget waiting on the API and a widget the API refused look the same
// everywhere on the page.

import { ReactNode } from "react";

export const VERB = "#6366f1";
export const MONEY = "#f59e0b";
export const TAUGHT = "#10b981";
export const UNTAUGHT = "#94a3b8";

export function colourFor(topic: string): string {
  return topic === "money" ? MONEY : VERB;
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

export function Waiting({ message }: { message: string | null }) {
  return (
    <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>
  );
}

export function Legend({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{children}</p>
  );
}

export function WordChoice({
  words,
  value,
  onChange,
}: {
  words: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <span className="flex flex-wrap gap-1">
      {words.map((word) => (
        <button
          key={word}
          onClick={() => onChange(word)}
          style={
            word === value ? { backgroundColor: "#334155", color: "white" } : undefined
          }
          className={
            "rounded px-2 py-0.5 font-mono text-xs transition " +
            (word === value
              ? ""
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
          }
        >
          {word}
        </button>
      ))}
    </span>
  );
}

// One bar per neighbour, drawn to whichever is nearest so the differences at
// the top of a list of cosines all near one are still readable.
export function NeighbourBars({
  entries,
  width = "w-20",
}: {
  entries: { word: string; similarity: number; topic: string }[];
  width?: string;
}) {
  const strongest = Math.max(...entries.map((entry) => entry.similarity), 0.001);
  return (
    <div className="space-y-1">
      {entries.map((entry) => (
        <div key={entry.word} className="flex items-center gap-2">
          <span
            className={`${width} shrink-0 font-mono text-xs text-slate-700 dark:text-slate-300`}
          >
            {entry.word}
          </span>
          <span className="h-3 flex-1 rounded bg-slate-100 dark:bg-slate-800">
            <span
              className="block h-3 rounded"
              style={{
                width: `${Math.max(2, (entry.similarity / strongest) * 100)}%`,
                backgroundColor: colourFor(entry.topic),
              }}
            />
          </span>
          <span className="w-14 shrink-0 text-right font-mono text-xs text-slate-500 dark:text-slate-400">
            {entry.similarity.toFixed(4)}
          </span>
        </div>
      ))}
    </div>
  );
}
