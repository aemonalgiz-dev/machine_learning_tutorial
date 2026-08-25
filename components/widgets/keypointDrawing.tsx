"use client";

// The drawing every widget on the keypoints page shares.
//
// All of them show the same two things beside each other, a picture and a
// score read off it, so both are one component asked for a different shading.
// Brightness is drawn as a grey, which means the same thing in either theme; a
// score is drawn as a wash of colour whose strength is the score and whose
// absence lets the panel behind show through, so a score of zero looks like
// the page rather than like black. The API computes every number; this only
// paints them.

import { memo } from "react";

export const CORNER = "#f59e0b";
export const NEGATIVE = "#0ea5e9";
export const MARK = "#f43f5e";
export const WINDOW = "#6366f1";
export const AGREES = "#10b981";

export interface Mark {
  row: number;
  column: number;
  colour?: string;
  radius?: number;
  label?: string;
}

export interface Box {
  row: number;
  column: number;
  height: number;
  width: number;
  colour?: string;
  dashed?: boolean;
}

export type Shade = (value: number) => { fill: string; opacity: number };

// Brightness as a grey. The low and high of the picture are stretched to the
// full range so a scene that never reaches black is still drawn with contrast.
export function greyShade(low: number, high: number): Shade {
  const span = high - low || 1;
  return (value) => {
    const level = Math.round(255 * Math.min(1, Math.max(0, (value - low) / span)));
    return { fill: `rgb(${level},${level},${level})`, opacity: 1 };
  };
}

// A score as a wash. Positive scores wash amber, negative ones wash blue, and
// zero washes nothing at all, which is what makes flat ground read as empty.
export function scoreShade(high: number, low = 0): Shade {
  const reach = Math.max(Math.abs(high), Math.abs(low), 1e-12);
  return (value) => ({
    fill: value < 0 ? NEGATIVE : CORNER,
    opacity: Math.min(1, Math.abs(value) / reach),
  });
}

export const PixelGrid = memo(function PixelGrid({
  rows,
  shade,
  marks = [],
  boxes = [],
  cell = 8,
  className = "",
}: {
  rows: number[][];
  shade: Shade;
  marks?: Mark[];
  boxes?: Box[];
  cell?: number;
  className?: string;
}) {
  const height = rows.length;
  const width = rows[0]?.length ?? 0;
  return (
    <svg
      viewBox={`0 0 ${width * cell} ${height * cell}`}
      className={`w-full select-none rounded-md bg-slate-100 dark:bg-slate-900 ${className}`}
      shapeRendering="crispEdges"
    >
      {rows.map((row, rowIndex) =>
        row.map((value, columnIndex) => {
          const painted = shade(value);
          if (painted.opacity <= 0) return null;
          return (
            <rect
              key={`${rowIndex},${columnIndex}`}
              x={columnIndex * cell}
              y={rowIndex * cell}
              width={cell}
              height={cell}
              fill={painted.fill}
              fillOpacity={painted.opacity}
            />
          );
        }),
      )}
      {boxes.map((box, index) => (
        <rect
          key={`box${index}`}
          x={box.column * cell}
          y={box.row * cell}
          width={box.width * cell}
          height={box.height * cell}
          fill="none"
          stroke={box.colour ?? WINDOW}
          strokeWidth={Math.max(1.5, cell / 4)}
          strokeDasharray={box.dashed ? `${cell / 2} ${cell / 2}` : undefined}
          shapeRendering="geometricPrecision"
        />
      ))}
      {marks.map((mark, index) => (
        <circle
          key={`mark${index}`}
          cx={(mark.column + 0.5) * cell}
          cy={(mark.row + 0.5) * cell}
          r={(mark.radius ?? 0.9) * cell}
          fill="none"
          stroke={mark.colour ?? MARK}
          strokeWidth={Math.max(1.2, cell / 5)}
          shapeRendering="geometricPrecision"
        />
      ))}
    </svg>
  );
});

// A caption under a drawing, in the size the rest of the site uses for them.
export function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
      {children}
    </p>
  );
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

// A small grid of numbers, for the twenty-five values of one patch.
export function NumberGrid({
  rows,
  places = 2,
  highlight,
}: {
  rows: number[][];
  places?: number;
  highlight?: (value: number) => boolean;
}) {
  return (
    <div
      className="grid gap-0.5"
      style={{ gridTemplateColumns: `repeat(${rows[0]?.length ?? 1}, minmax(0, 1fr))` }}
    >
      {rows.map((row, rowIndex) =>
        row.map((value, columnIndex) => (
          <div
            key={`${rowIndex},${columnIndex}`}
            className={
              "rounded-sm px-1 py-1 text-center font-mono text-[10px] " +
              (highlight?.(value)
                ? "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300")
            }
          >
            {value.toFixed(places)}
          </div>
        )),
      )}
    </div>
  );
}

export const BUTTON =
  "rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

export const ACTIVE_BUTTON =
  "rounded-md border border-indigo-600 bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white transition dark:border-indigo-500 dark:bg-indigo-500";
