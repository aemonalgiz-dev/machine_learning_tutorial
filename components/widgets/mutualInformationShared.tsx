"use client";

// The pieces every widget on the pointwise mutual information page needs.
//
// One colour per half of the corpus and a third for the three words both
// halves use; one colour for a score above chance and one for a score below
// it, since the sign is the quantity the whole page turns on; one readout
// tile; and one loading line, so a widget waiting on the API and a widget the
// API refused look the same everywhere on the page.

import { ReactNode } from "react";

export const COOKING = "#f59e0b";
export const SAILING = "#0ea5e9";
export const SHARED = "#94a3b8";
export const ABOVE = "#10b981";
export const BELOW = "#ef4444";
export const ABSENT = "#cbd5e1";
export const ACCENT = "#6366f1";

export function colourFor(topic: string): string {
  if (topic === "cooking") return COOKING;
  if (topic === "sailing") return SAILING;
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
  accent = ACCENT,
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

export function Slider({
  label,
  value,
  minimum,
  maximum,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  step: number;
  format: (value: number) => string;
  onChange: (next: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-300">
      <span className="flex items-baseline justify-between gap-2">
        <span>{label}</span>
        <span className="font-mono text-slate-900 dark:text-slate-100">
          {format(value)}
        </span>
      </span>
      <input
        type="range"
        min={minimum}
        max={maximum}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-indigo-500"
      />
    </label>
  );
}

export function Legend({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{children}</p>
  );
}

// A score is drawn on a scale running from the most negative to the most
// positive, with zero in the middle, so the eye reads independence as the
// centre rather than as an end.
export function scoreColour(score: number | null): string {
  if (score === null) return ABSENT;
  if (score > 0) return ABOVE;
  if (score < 0) return BELOW;
  return SHARED;
}

export function shade(score: number | null, extent: number): string {
  if (score === null) return ABSENT;
  const strength = Math.min(1, Math.abs(score) / extent);
  const base = score >= 0 ? "16, 185, 129" : "239, 68, 68";
  return `rgba(${base}, ${0.12 + 0.78 * strength})`;
}
