"use client";

// The pieces every widget on the learning-the-metric-itself page shares.
//
// The pictures, the kind colours and the small readouts are the ones the page
// on a vector for a picture already draws, imported from there unchanged, so
// a disc is the same green on all three pages about embedding pictures. What
// is added here is what only this page needs: the names of the four spaces in
// the order the tables list them, a two-state button row, and a small line
// chart for a quantity measured once per epoch.

import type { ReactNode } from "react";
import { ApiError } from "@/lib/api";
import type { KindName } from "@/lib/concepts/a-vector-for-a-picture";
import type { SpaceName } from "@/lib/concepts/learning-the-metric-itself";
import {
  KIND_COLOUR,
  KindLabel,
  Pending,
  PictureCells,
  Stat,
} from "@/components/widgets/pictureVectorShared";

export { KIND_COLOUR, KindLabel, Pending, PictureCells, Stat };

export const ALL_KINDS: KindName[] = ["cross", "square", "disc", "bar", "ring"];

export function asKind(kind: string): KindName {
  return (ALL_KINDS as string[]).includes(kind) ? (kind as KindName) : "ring";
}

export const SPACE_ORDER: SpaceName[] = [
  "pixels",
  "classifier_all_four",
  "classifier_three",
  "pairs",
];

export const SPACE_SHORT: Record<SpaceName, string> = {
  pixels: "pixels",
  classifier_all_four: "classifier, four kinds",
  classifier_three: "classifier, three kinds",
  pairs: "trained on pairs",
};

export const SPACE_COLOUR: Record<SpaceName, string> = {
  pixels: "#94a3b8",
  classifier_all_four: "#a78bfa",
  classifier_three: "#6366f1",
  pairs: "#f43f5e",
};

export function Buttons<T extends string | number>({
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
    <div className="inline-flex flex-wrap items-center gap-1.5">
      {label && (
        <span className="mr-1 text-xs text-slate-500 dark:text-slate-400">
          {label}
        </span>
      )}
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md border px-2.5 py-1 text-xs ${
            value === option.value
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export interface Series {
  label: string;
  colour: string;
  epochs: number[];
  values: number[];
  dashed?: boolean;
}

const PANEL = { width: 320, height: 200 };
const PAD = { left: 40, right: 10, top: 16, bottom: 28 };

// One quantity per epoch, several series on shared axes. The vertical scale
// is either plain or logarithmic, since a spread falling from 0.7 to 0.002
// is invisible on a plain scale after its first step.
export function EpochChart({
  series,
  title,
  logarithmic = false,
  lastEpoch,
}: {
  series: Series[];
  title: string;
  logarithmic?: boolean;
  lastEpoch: number;
}) {
  const values = series.flatMap((line) => line.values).filter((value) => value > 0);
  const positive = values.length > 0 ? values : [1];
  const top = logarithmic
    ? Math.pow(10, Math.ceil(Math.log10(Math.max(...positive))))
    : Math.max(...series.flatMap((line) => line.values), 1e-9) * 1.1;
  const bottom = logarithmic
    ? Math.pow(10, Math.floor(Math.log10(Math.min(...positive))))
    : 0;
  const x = (epoch: number) =>
    PAD.left + (epoch / lastEpoch) * (PANEL.width - PAD.left - PAD.right);
  const y = (value: number) => {
    const span = PANEL.height - PAD.top - PAD.bottom;
    if (logarithmic) {
      const clamped = Math.max(value, bottom);
      return (
        PANEL.height -
        PAD.bottom -
        ((Math.log10(clamped) - Math.log10(bottom)) /
          (Math.log10(top) - Math.log10(bottom))) *
          span
      );
    }
    return PANEL.height - PAD.bottom - ((value - bottom) / (top - bottom)) * span;
  };
  const ticks: number[] = [];
  if (logarithmic) {
    for (let power = Math.log10(bottom); power <= Math.log10(top) + 1e-9; power += 1) {
      ticks.push(Math.pow(10, power));
    }
  } else {
    for (let step = 0; step <= 4; step += 1) ticks.push((top * step) / 4);
  }
  return (
    <svg
      viewBox={`0 0 ${PANEL.width} ${PANEL.height}`}
      className="w-full rounded-lg bg-slate-50 dark:bg-slate-950"
      role="img"
      aria-label={title}
    >
      <g className="text-slate-500 dark:text-slate-400" fontSize={9} fill="currentColor">
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={PANEL.width - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="currentColor"
              strokeOpacity={0.15}
            />
            <text x={PAD.left - 4} y={y(tick) + 3} textAnchor="end">
              {logarithmic ? tick.toExponential(0) : tick.toFixed(tick >= 1 ? 1 : 2)}
            </text>
          </g>
        ))}
        <text x={(PANEL.width + PAD.left) / 2} y={PANEL.height - 6} textAnchor="middle">
          epoch, 0 to {lastEpoch}
        </text>
        <text x={PAD.left} y={10}>
          {title}
        </text>
      </g>
      {series.map((line) => (
        <path
          key={line.label}
          d={line.values
            .map(
              (value, index) =>
                `${index === 0 ? "M" : "L"}${x(line.epochs[index]).toFixed(1)},${y(value).toFixed(1)}`,
            )
            .join(" ")}
          fill="none"
          stroke={line.colour}
          strokeWidth={2}
          strokeDasharray={line.dashed ? "4 3" : undefined}
        />
      ))}
    </svg>
  );
}

export function SeriesKey({ series }: { series: Series[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
      {series.map((line) => (
        <span key={line.label} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4"
            style={{ backgroundColor: line.colour }}
          />
          {line.label}
        </span>
      ))}
    </div>
  );
}

export function messageOf(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
