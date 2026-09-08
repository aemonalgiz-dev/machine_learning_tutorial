"use client";

// The pieces every widget on the a-vector-for-a-picture page shares.
//
// A picture arrives from the API as sixteen rows of sixteen brightness values
// and is drawn one grey rectangle per pixel, the way the classical vision
// pages draw theirs. Unlike those pages, every picture here is drawn on one
// fixed scale, black at zero and white at one, because this page constantly
// sets two pictures side by side and asks whether they are alike, and giving
// each its own darkest and brightest would make a dim picture and a bright one
// look the same. The noise occasionally takes a pixel just below zero or above
// one, and those are drawn as black or white.
//
// The kind colours are shared by every widget so a disc is the same green in
// the sphere, the neighbour lists and the tables.

import type { ReactNode } from "react";
import type { KindName } from "@/lib/concepts/a-vector-for-a-picture";

export const KIND_COLOUR: Record<KindName, string> = {
  cross: "#6366f1",
  square: "#f59e0b",
  disc: "#10b981",
  bar: "#0ea5e9",
  ring: "#f43f5e",
};

export const TRAINED_KINDS: KindName[] = ["cross", "square", "disc", "bar"];

export function greyOf(value: number): string {
  const level = Math.round(Math.min(1, Math.max(0, value)) * 255);
  return `rgb(${level}, ${level}, ${level})`;
}

export function PictureCells({
  rows,
  cell = 5,
  kind,
  title,
}: {
  rows: number[][];
  cell?: number;
  kind?: KindName;
  title?: string;
}) {
  const size = rows.length * cell;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label={title ?? "A sixteen by sixteen picture, one grey square per pixel"}
      shapeRendering="crispEdges"
      className="max-w-full shrink-0 rounded-sm"
      style={{
        outline: `2px solid ${kind ? KIND_COLOUR[kind] : "#cbd5e1"}`,
        outlineOffset: 1,
      }}
    >
      {rows.map((row, rowIndex) =>
        row.map((value, columnIndex) => (
          <rect
            key={`${rowIndex}-${columnIndex}`}
            x={columnIndex * cell}
            y={rowIndex * cell}
            width={cell}
            height={cell}
            fill={greyOf(value)}
          />
        )),
      )}
    </svg>
  );
}

export function KindLabel({ kind }: { kind: KindName }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: KIND_COLOUR[kind] }}
      />
      {kind}
    </span>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

export function Pending({ message }: { message: string | null }) {
  return (
    <p className="text-sm text-slate-500 dark:text-slate-400">
      {message ?? "…"}
    </p>
  );
}

// A share between zero and one, drawn as a bar behind its own number, for
// the tables whose point is which row is longer.
export function ShareCell({
  value,
  colour = "#6366f1",
}: {
  value: number;
  colour?: string;
}) {
  return (
    <div className="relative min-w-[5.5rem] rounded-sm bg-slate-100 dark:bg-slate-800">
      <div
        className="absolute inset-y-0 left-0 rounded-sm opacity-30"
        style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, backgroundColor: colour }}
      />
      <span className="relative px-1.5 font-mono text-xs text-slate-800 dark:text-slate-200">
        {value.toFixed(4)}
      </span>
    </div>
  );
}

export function Toggle<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  label?: ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      {label && (
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      )}
      <div className="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-slate-700">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-3 py-1 text-xs ${
              value === option.value
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
