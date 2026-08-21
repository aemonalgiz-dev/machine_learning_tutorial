"use client";

// The five-by-five grid every Hopfield widget draws, and the readout tile.
//
// A state is one value per cell, +1 lit and -1 dark. The grid can be
// clickable, so a reader damages a probe by hand; it can outline the cells
// that moved on the last step; and it can mark one cell as the one being
// visited, which is what the stepper needs. Nothing here computes anything.

import { SIDE } from "./hopfieldFixtures";

export function PatternGrid({
  cells,
  onFlip,
  changed,
  visiting = null,
  size = "large",
}: {
  cells: number[];
  onFlip?: (index: number) => void;
  changed?: boolean[];
  visiting?: number | null;
  size?: "small" | "medium" | "large";
}) {
  const cellClass = size === "small" ? "h-3.5 w-3.5" : size === "medium" ? "h-5 w-5" : "h-8 w-8";
  const gap = size === "small" ? "gap-0.5" : "gap-1";
  const columns = cells.length === SIDE * SIDE ? "grid-cols-5" : cells.length === 4 ? "grid-cols-4" : "grid-cols-2";
  return (
    <div className={`grid ${columns} ${gap}`}>
      {cells.map((value, index) => {
        const lit = value > 0;
        const outlined = changed?.[index] ?? false;
        const focused = visiting === index;
        const className =
          cellClass +
          " rounded-sm " +
          (lit ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700") +
          (focused ? " ring-2 ring-emerald-500" : outlined ? " ring-2 ring-amber-500" : "") +
          (onFlip ? " cursor-pointer hover:opacity-80" : "");
        if (onFlip) {
          return (
            <button
              key={index}
              type="button"
              aria-label={`cell ${index + 1}, ${lit ? "lit" : "dark"}`}
              onClick={() => onFlip(index)}
              className={className}
            />
          );
        }
        return <div key={index} className={className} />;
      })}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}

export function Caption({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{children}</p>;
}

export function Failure({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>;
}

export function signed(value: number, digits = 2): string {
  const text = Math.abs(value).toFixed(digits);
  return value < 0 ? "−" + text : value > 0 ? "+" + text : text;
}

export function plain(value: number, digits = 2): string {
  const text = Math.abs(value).toFixed(digits);
  return value < 0 ? "−" + text : text;
}
