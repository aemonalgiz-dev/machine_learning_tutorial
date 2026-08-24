"use client";

// The pieces every widget on the random indexing page needs.
//
// One colour per half of the collection and a third for the words both halves
// use, so a word that belongs to neither is visible without a legend being
// read; one colour for a positive entry of a drawn direction and one for a
// negative, since a reader has to tell those apart at a glance; one readout
// tile; one loading line, so a widget waiting on the API and a widget the API
// refused look the same everywhere on the page.

import { ReactNode } from "react";

export const FIRST_HALF = "#f59e0b";
export const SECOND_HALF = "#6366f1";
export const SHARED = "#94a3b8";
export const POSITIVE = "#0ea5e9";
export const NEGATIVE = "#f43f5e";
export const MEASURED = "#10b981";
export const PREDICTED = "#a855f7";

export function colourFor(group: string): string {
  if (group === "cooking" || group === "cat") return FIRST_HALF;
  if (group === "sailing" || group === "dog") return SECOND_HALF;
  return SHARED;
}

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

export function Waiting({ message }: { message: string | null }) {
  return (
    <p className="text-sm text-slate-500 dark:text-slate-400">
      {message ?? "…"}
    </p>
  );
}

export function Choice<T extends string | number>({
  options,
  value,
  onChange,
  accent = SECOND_HALF,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (next: T) => void;
  accent?: string;
}) {
  return (
    <span className="flex flex-wrap gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
      {options.map((option) => (
        <button
          key={String(option.value)}
          onClick={() => onChange(option.value)}
          style={
            option.value === value
              ? { backgroundColor: accent, color: "white" }
              : undefined
          }
          className={
            "rounded px-2 py-0.5 text-xs font-medium transition " +
            (option.value === value
              ? ""
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
          }
        >
          {option.label}
        </button>
      ))}
    </span>
  );
}

export function Legend({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
      {children}
    </p>
  );
}

// One drawn direction as a row of squares. A filled square is a non-zero entry
// and an empty one is a zero, which is what makes the sparsity a thing to look
// at rather than a thing to be told.
export function DirectionRow({
  entries,
  cell = 13,
  gap = 2,
}: {
  entries: number[];
  cell?: number;
  gap?: number;
}) {
  const width = entries.length * (cell + gap);
  return (
    <svg
      viewBox={`0 0 ${width} ${cell + gap}`}
      width={width}
      height={cell + gap}
      role="img"
      aria-label="one drawn direction, one square per position"
      className="shrink-0"
    >
      {entries.map((entry, position) => (
        <rect
          key={position}
          x={position * (cell + gap)}
          y={0}
          width={cell}
          height={cell}
          rx={2}
          fill={entry > 0 ? POSITIVE : entry < 0 ? NEGATIVE : "transparent"}
          stroke={entry === 0 ? "#cbd5e1" : "none"}
          strokeWidth={0.8}
        />
      ))}
    </svg>
  );
}
