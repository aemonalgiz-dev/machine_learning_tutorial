"use client";

// Drawing a grid of numbers as a picture, which every widget on the filters
// and edges page needs and none of the earlier widgets on this site did.
//
// The API computes every number; this module only decides what colour each one
// is drawn in. One SVG rect per pixel is comfortable at 48 by 48, and a viewBox
// of one unit per pixel means the same component draws a 6 by 6 picture and a
// 48 by 48 one at whatever size the layout gives it.
//
// Three scales, because the three quantities on this page are different kinds
// of number and a reader has to be told which one they are looking at.
// Brightness runs from none to all of it and gets a plain dark-to-light ramp.
// A rate of change is signed and gets a diverging scale, indigo one way and
// amber the other through a neutral middle, on the site's usual pair. A
// magnitude is never negative and gets a ramp of its own so it cannot be
// mistaken for a brightness. Every panel carries a legend saying which of the
// three it is drawn in, because the same grey means opposite things under the
// first and the second.
//
// The colours are opaque rather than an alpha over the page, so a picture reads
// the same in both themes for the reason a photograph does.

import { ReactNode } from "react";
import { Grid } from "@/lib/concepts/filters-and-edges";

export type Scale = "brightness" | "signed" | "magnitude";

export const SCALE_NAMES: Record<Scale, string> = {
  brightness: "dark to light, none to all of it",
  signed: "amber falling, neutral flat, indigo rising",
  magnitude: "black flat, bright a sharp change",
};

function mixed(
  low: [number, number, number],
  high: [number, number, number],
  share: number,
): string {
  const clamped = Math.max(0, Math.min(1, share));
  const channel = (index: number) =>
    Math.round(low[index] + (high[index] - low[index]) * clamped);
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

// A brightness, as a plain ramp from very dark to very light.
export function brightnessColour(
  value: number,
  darkest: number,
  brightest: number,
): string {
  const span = brightest - darkest;
  return mixed([11, 17, 32], [248, 250, 252], span === 0 ? 0 : (value - darkest) / span);
}

// A signed rate of change, diverging from a neutral middle. Amber where the
// brightness falls in the direction being asked about and indigo where it
// rises, at a strength proportional to the share of the largest rate anywhere
// on the map.
export function signedColour(value: number, largest: number): string {
  if (largest === 0) return "rgb(100, 116, 139)";
  const share = Math.abs(value) / largest;
  const middle: [number, number, number] = [100, 116, 139];
  return value >= 0
    ? mixed(middle, [67, 56, 202], share)
    : mixed(middle, [180, 83, 9], share);
}

// A magnitude, which is never negative, on a ramp of its own.
export function magnitudeColour(value: number, largest: number): string {
  return mixed([9, 9, 18], [253, 224, 71], largest === 0 ? 0 : value / largest);
}

export function colourFor(
  scale: Scale,
  value: number,
  largest: number,
  darkest = 0,
): string {
  if (scale === "brightness") return brightnessColour(value, darkest, largest);
  if (scale === "signed") return signedColour(value, largest);
  return magnitudeColour(value, largest);
}

export function largestOf(rows: Grid): number {
  return Math.max(0, ...rows.flat().map((value) => Math.abs(value)));
}

export function smallestOf(rows: Grid): number {
  return Math.min(...rows.flat());
}

export interface Marker {
  row: number;
  column: number;
  colour?: string;
}

// One grid of numbers drawn as a picture, one rect per pixel.
//
// `markers` outlines particular pixels, which is how a widget points at the
// window a piece of arithmetic came from. `strokes` draws a short line inside
// each pixel at the angle given, which is how a direction is shown, since a
// colour cannot carry an angle that wraps round.
export function PixelMap({
  rows,
  scale,
  largest,
  darkest = 0,
  markers = [],
  strokes = null,
  strokeAt = null,
  gridLines = false,
  className = "",
}: {
  rows: Grid;
  scale: Scale;
  largest: number;
  darkest?: number;
  markers?: Marker[];
  strokes?: Grid | null;
  strokeAt?: Grid | null;
  gridLines?: boolean;
  className?: string;
}) {
  const height = rows.length;
  const width = rows[0]?.length ?? 0;
  const strokeFloor =
    strokes && strokeAt ? 0.12 * largestOf(strokeAt) : 0;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={"h-auto w-full " + className}
      role="img"
      aria-label={`a ${height} by ${width} grid of values`}
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
            fill={colourFor(scale, value, largest, darkest)}
            stroke={gridLines ? "rgba(148, 163, 184, 0.35)" : "none"}
            strokeWidth={gridLines ? 0.03 : 0}
          />
        )),
      )}
      {strokes &&
        strokeAt &&
        strokes.map((row, rowIndex) =>
          row.map((angle, columnIndex) => {
            const weight = Math.abs(strokeAt[rowIndex][columnIndex]);
            if (weight <= strokeFloor) return null;
            const half = 0.42;
            const centreX = columnIndex + 0.5;
            const centreY = rowIndex + 0.5;
            return (
              <line
                key={`stroke-${rowIndex},${columnIndex}`}
                x1={centreX - half * Math.cos(angle)}
                y1={centreY - half * Math.sin(angle)}
                x2={centreX + half * Math.cos(angle)}
                y2={centreY + half * Math.sin(angle)}
                stroke="rgb(248, 250, 252)"
                strokeWidth={0.14}
                strokeLinecap="round"
              />
            );
          }),
        )}
      {markers.map((marker) => (
        <rect
          key={`marker-${marker.row},${marker.column}`}
          x={marker.column + 0.06}
          y={marker.row + 0.06}
          width={0.88}
          height={0.88}
          fill="none"
          stroke={marker.colour ?? "rgb(245, 158, 11)"}
          strokeWidth={0.16}
        />
      ))}
    </svg>
  );
}

// The bar underneath a picture saying which of the three scales it is drawn in.
export function ScaleLegend({
  scale,
  low,
  high,
}: {
  scale: Scale;
  low: string;
  high: string;
}) {
  const samples = Array.from({ length: 21 }, (_, index) => index / 20);
  return (
    <div className="mt-1 w-full">
      <svg viewBox="0 0 21 1.4" className="h-3 w-full" role="presentation">
        {samples.map((share, index) => (
          <rect
            key={index}
            x={index}
            y={0}
            width={1}
            height={1.4}
            fill={
              scale === "signed"
                ? signedColour(2 * share - 1, 1)
                : scale === "magnitude"
                  ? magnitudeColour(share, 1)
                  : brightnessColour(share, 0, 1)
            }
          />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
        <span>{low}</span>
        <span className="text-center">{SCALE_NAMES[scale]}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

// A picture with a caption over it and a scale under it, which is the
// arrangement every panel on this page uses.
export function MapPanel({
  title,
  children,
  scale,
  low,
  high,
  note,
  width = "w-44",
}: {
  title: string;
  children: ReactNode;
  scale: Scale;
  low: string;
  high: string;
  note?: string;
  width?: string;
}) {
  return (
    <div className={"flex flex-col items-center gap-1 " + width}>
      <span className="text-center text-xs font-medium text-slate-700 dark:text-slate-300">
        {title}
      </span>
      <div className="w-full overflow-hidden rounded-sm ring-1 ring-slate-300 dark:ring-slate-700">
        {children}
      </div>
      <ScaleLegend scale={scale} low={low} high={high} />
      {note && (
        <span className="text-center text-[11px] leading-tight text-slate-500 dark:text-slate-400">
          {note}
        </span>
      )}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="break-words font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

export const BUTTON_CLASS =
  "rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

export const ACTIVE_BUTTON_CLASS =
  "rounded border border-indigo-600 bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white transition dark:border-indigo-500 dark:bg-indigo-500";

export const PANEL_CLASS = "rounded-lg bg-slate-50 p-4 dark:bg-slate-950";

export function Failure({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
  );
}

// Short enough to sit inside a cell.
export function short(value: number): string {
  if (Number.isInteger(value)) return String(value);
  if (Math.abs(value) < 0.005) return "0";
  return value.toFixed(2);
}
