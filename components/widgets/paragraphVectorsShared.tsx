"use client";

// The pieces every paragraph-vector widget on this page needs.
//
// One colour per subject, so a document that landed among the wrong subject's
// documents is visible without a legend being read; one readout tile; one
// loading line, so a widget waiting on the API and a widget the API refused
// look the same everywhere on the page; and one row of buttons.

import { ReactNode } from "react";

export const COOKING = "#6366f1";
export const SAILING = "#0ea5e9";
export const FALLING = "#10b981";
export const RISING = "#ef4444";
export const NEUTRAL = "#94a3b8";

export function colourForTopic(topic: string): string {
  return topic === "sailing" ? SAILING : COOKING;
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

export function Choice<T extends string>({
  options,
  value,
  onChange,
  accent = COOKING,
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
    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{children}</p>
  );
}
