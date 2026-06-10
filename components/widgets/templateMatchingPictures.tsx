"use client";

// Drawing a picture, which is what this section needs and nothing else on the
// site does.
//
// The API sends a grid of brightness values and the browser draws one small
// rectangle per pixel. At forty-eight pixels a side that is 2,304 rectangles,
// which a browser handles without complaint and which keeps every pixel a real
// element that can be inspected, rather than a blur inside a bitmap.
//
// Greyscale is the whole difficulty. A brightness value here is not bounded to
// any range: the scene runs from empty ground to a lit shape, a score surface
// under one rule runs from a large positive number down to zero and under
// another from minus one to one. So each grid carries its own darkest and
// brightest value, every drawing maps that pair onto black and white, and every
// caller is expected to tell the reader which pair it used. Mapping a fixed
// range instead would silently show two surfaces on scales that have nothing to
// do with each other.
//
// The greys are absolute rather than theme-aware, because they are the
// picture's own content and inverting them in a dark theme would be showing a
// different picture. What is theme-aware is everything around them: the frame,
// the axis numbers and the labels.

import { PictureGrid } from "@/lib/concepts/template-matching";

// The colours a position is marked in. Chosen to read against both the darkest
// and the brightest grey a picture can hold, since a mark may land anywhere.
export const MARK_COLOURS = {
  indigo: "#6366f1",
  amber: "#f59e0b",
  emerald: "#10b981",
  rose: "#f43f5e",
  sky: "#38bdf8",
} as const;

export type MarkColour = keyof typeof MARK_COLOURS;

export interface Mark {
  row: number;
  column: number;
  height: number;
  width: number;
  colour: MarkColour;
  dashed?: boolean;
  label?: string;
}

// One pixel's grey, as a proportion of the way from the grid's darkest value to
// its brightest. A grid with no variation at all would divide by nothing, and
// comes back mid-grey rather than as a division by zero.
export function greyOf(value: number, grid: PictureGrid): string {
  const span = grid.brightest - grid.darkest;
  const share = span === 0 ? 0.5 : (value - grid.darkest) / span;
  const level = Math.round(Math.min(1, Math.max(0, share)) * 255);
  return `rgb(${level}, ${level}, ${level})`;
}

export function PicturePlot({
  grid,
  marks = [],
  cell = 8,
  title,
  onPixel,
  highlight,
}: {
  grid: PictureGrid;
  marks?: Mark[];
  cell?: number;
  title?: string;
  onPixel?: (row: number, column: number) => void;
  highlight?: { row: number; column: number; height: number; width: number };
}) {
  const width = grid.width * cell;
  const height = grid.height * cell;

  return (
    <figure className="m-0">
      {title && (
        <figcaption className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          {title}
        </figcaption>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={title ?? "A picture drawn one rectangle per pixel"}
        className="max-w-full rounded-sm ring-1 ring-slate-300 dark:ring-slate-700"
      >
        <rect x={0} y={0} width={width} height={height} fill={greyOf(grid.darkest, grid)} />
        {grid.rows.map((row, rowIndex) =>
          row.map((value, columnIndex) => (
            <rect
              key={`${rowIndex}-${columnIndex}`}
              x={columnIndex * cell}
              y={rowIndex * cell}
              width={cell}
              height={cell}
              fill={greyOf(value, grid)}
              onClick={onPixel ? () => onPixel(rowIndex, columnIndex) : undefined}
              style={onPixel ? { cursor: "pointer" } : undefined}
            />
          )),
        )}
        {highlight && (
          <rect
            x={highlight.column * cell}
            y={highlight.row * cell}
            width={highlight.width * cell}
            height={highlight.height * cell}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="2 2"
          />
        )}
        {marks.map((mark) => (
          <g key={`${mark.colour}-${mark.row}-${mark.column}-${mark.label ?? ""}`}>
            <rect
              x={mark.column * cell}
              y={mark.row * cell}
              width={mark.width * cell}
              height={mark.height * cell}
              fill="none"
              stroke={MARK_COLOURS[mark.colour]}
              strokeWidth={2}
              strokeDasharray={mark.dashed ? "3 3" : undefined}
            />
          </g>
        ))}
      </svg>
    </figure>
  );
}

// What black and white stand for in the drawing just above. Every picture on
// this page is followed by one of these, because a grey without its scale says
// nothing about the number it came from.
export function GreyScaleKey({
  grid,
  darkLabel = "darkest",
  brightLabel = "brightest",
  digits = 2,
}: {
  grid: PictureGrid;
  darkLabel?: string;
  brightLabel?: string;
  digits?: number;
}) {
  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
      <span className="inline-block h-3 w-3 rounded-sm ring-1 ring-slate-300 dark:ring-slate-600" style={{ background: "rgb(0,0,0)" }} />
      <span>
        black is {darkLabel} {grid.darkest.toFixed(digits)}
      </span>
      <span className="inline-block h-3 w-3 rounded-sm ring-1 ring-slate-300 dark:ring-slate-600" style={{ background: "rgb(255,255,255)" }} />
      <span>
        white is {brightLabel} {grid.brightest.toFixed(digits)}
      </span>
    </p>
  );
}

// A small readout beside a picture. Same shape as the stat helpers on the other
// pages, repeated here so the vision widgets do not import one another.
export function Stat({
  label,
  value,
  tone = "plain",
}: {
  label: string;
  value: string;
  tone?: "plain" | "good" | "bad";
}) {
  const colour =
    tone === "good"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "bad"
        ? "text-rose-600 dark:text-rose-400"
        : "text-slate-900 dark:text-slate-100";
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className={`font-mono text-sm ${colour}`}>{value}</div>
    </div>
  );
}

// The small square of colour a legend line opens with.
export function Swatch({ colour }: { colour: MarkColour }) {
  return (
    <span
      className="inline-block h-3 w-3 shrink-0 rounded-sm"
      style={{ background: MARK_COLOURS[colour] }}
    />
  );
}
