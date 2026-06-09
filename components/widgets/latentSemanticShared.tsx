"use client";

// The pieces every widget on the latent semantic analysis page needs.
//
// One colour per half of a corpus and a third for the words both halves use,
// so a word that belongs to neither is visible without a legend being read;
// one readout tile; one loading line, so a widget waiting on the API and a
// widget the API refused look the same everywhere on the page.

import { ReactNode } from "react";

export const FIRST_HALF = "#f59e0b";
export const SECOND_HALF = "#6366f1";
export const SHARED = "#94a3b8";
export const KEPT = "#10b981";
export const DISCARDED = "#ef4444";

export function colourFor(group: string): string {
  if (group === "cooking" || group === "cat") return FIRST_HALF;
  if (group === "sailing" || group === "boat") return SECOND_HALF;
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

export function Choice<T extends string>({
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
          key={option.value}
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

// A cell of a table shaded by how large its number is, so a reader sees the
// pattern of a matrix before reading any of it.
export function shade(value: number, largest: number, colour: string): string {
  if (largest <= 0) return "transparent";
  const strength = Math.max(0, Math.min(1, value / largest));
  return `color-mix(in srgb, ${colour} ${(strength * 78).toFixed(1)}%, transparent)`;
}
