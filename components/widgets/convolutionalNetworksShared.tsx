"use client";

// What the widgets on the convolutional networks page share: a colour for each
// arrangement, a map of numbers that can be clicked cell by cell, and a
// picture with a window drawn over it.
//
// The API computes every number; this module decides only how each one is
// drawn. The colour ramps are the filters and edges page's, imported rather
// than copied, so a first-layer map here and an edge map there read alike.

import { ReactNode } from "react";
import {
  brightnessColour,
  magnitudeColour,
  signedColour,
} from "@/components/widgets/filtersAndEdgesShared";
import type { Grid, Variant } from "@/lib/concepts/convolutional-networks";

export const VARIANT_COLOURS: Record<Variant, string> = {
  reference: "#6366f1",
  without_pooling: "#f59e0b",
  one_round: "#0ea5e9",
  dense: "#f43f5e",
};

export const VARIANT_NAMES: Record<Variant, string> = {
  reference: "the network",
  without_pooling: "pooling taken away",
  one_round: "one round only",
  dense: "no convolutions",
};

export function share(value: number, digits = 3): string {
  return value.toFixed(digits);
}

export function percent(value: number, digits = 1): string {
  return `${(100 * value).toFixed(digits)}%`;
}

export function thousands(value: number): string {
  return value.toLocaleString("en-GB");
}

export type CellScale = "brightness" | "magnitude" | "signed";

function colourOf(scale: CellScale, value: number, largest: number, darkest: number) {
  if (scale === "brightness") return brightnessColour(value, darkest, largest);
  if (scale === "signed") return signedColour(value, largest);
  return magnitudeColour(Math.max(0, value), largest);
}

// A grid of numbers, one rect per cell, where a cell can be clicked and the
// chosen one is outlined. A window, in the grid's own cells, can be drawn over
// it as well, clipped to the grid.
export function CellMap({
  rows,
  scale,
  largest,
  darkest = 0,
  selected = null,
  onPick,
  window = null,
  windowColour = "rgb(245, 158, 11)",
  label,
}: {
  rows: Grid;
  scale: CellScale;
  largest: number;
  darkest?: number;
  selected?: { row: number; column: number } | null;
  onPick?: (row: number, column: number) => void;
  window?: { top: number; left: number; bottom: number; right: number } | null;
  windowColour?: string;
  label: string;
}) {
  const height = rows.length;
  const width = rows[0]?.length ?? 0;
  const clipped = window && {
    top: Math.max(0, window.top),
    left: Math.max(0, window.left),
    bottom: Math.min(height - 1, window.bottom),
    right: Math.min(width - 1, window.right),
  };
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={label}
    >
      <rect x={0} y={0} width={width} height={height} fill="rgb(15, 23, 42)" />
      {rows.map((row, rowIndex) =>
        row.map((value, columnIndex) => (
          <rect
            key={`${rowIndex},${columnIndex}`}
            x={columnIndex}
            y={rowIndex}
            width={1}
            height={1}
            fill={colourOf(scale, value, largest, darkest)}
            className={onPick ? "cursor-pointer" : undefined}
            onClick={onPick ? () => onPick(rowIndex, columnIndex) : undefined}
          />
        )),
      )}
      {clipped && (
        <rect
          x={clipped.left + 0.05}
          y={clipped.top + 0.05}
          width={clipped.right - clipped.left + 0.9}
          height={clipped.bottom - clipped.top + 0.9}
          fill="none"
          stroke={windowColour}
          strokeWidth={Math.max(0.12, width / 120)}
        />
      )}
      {selected && (
        <rect
          x={selected.column + 0.06}
          y={selected.row + 0.06}
          width={0.88}
          height={0.88}
          fill="none"
          stroke="rgb(245, 158, 11)"
          strokeWidth={Math.max(0.14, width / 60)}
          pointerEvents="none"
        />
      )}
    </svg>
  );
}

export function Framed({
  title,
  note,
  children,
  width = "w-24",
}: {
  title: string;
  note?: string;
  children: ReactNode;
  width?: string;
}) {
  return (
    <div className={"flex flex-col items-center gap-1 " + width}>
      <span className="text-center text-[11px] font-medium leading-tight text-slate-700 dark:text-slate-300">
        {title}
      </span>
      <div className="w-full overflow-hidden rounded-sm ring-1 ring-slate-300 dark:ring-slate-700">
        {children}
      </div>
      {note && (
        <span className="text-center text-[10px] leading-tight text-slate-500 dark:text-slate-400">
          {note}
        </span>
      )}
    </div>
  );
}

export function Loading({ message }: { message: string | null }) {
  return (
    <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>
  );
}

export function ProbabilityBars({
  names,
  values,
  truth,
}: {
  names: string[];
  values: number[];
  truth?: string;
}) {
  return (
    <div className="space-y-1">
      {names.map((name, index) => (
        <div key={name} className="flex items-center gap-2 text-xs">
          <span
            className={
              "w-24 shrink-0 text-right " +
              (name === truth
                ? "font-semibold text-slate-900 dark:text-slate-100"
                : "text-slate-600 dark:text-slate-400")
            }
          >
            {name}
          </span>
          <div className="h-3 flex-1 rounded bg-slate-200 dark:bg-slate-800">
            <div
              className="h-3 rounded bg-indigo-500"
              style={{ width: `${Math.max(0, Math.min(1, values[index])) * 100}%` }}
            />
          </div>
          <span className="w-12 shrink-0 font-mono text-slate-700 dark:text-slate-300">
            {values[index].toFixed(3)}
          </span>
        </div>
      ))}
    </div>
  );
}
