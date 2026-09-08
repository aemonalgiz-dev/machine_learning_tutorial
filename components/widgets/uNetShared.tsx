"use client";

// What the widgets on the U-Net page share: a colour for each arrangement, and
// a mask drawn cell by cell, either as the true shape with its edge marked or
// as the network's answer coloured by whether each pixel was right.
//
// The API computes every number and every mask; this module decides only how
// each one is drawn.

import type { Grid } from "@/lib/concepts/u-net";

export const WITH_SKIP_COLOUR = "#6366f1";
export const WITHOUT_SKIP_COLOUR = "#f59e0b";

export const ERROR_COLOURS = {
  shape: "rgb(99, 102, 241)",
  ground: "rgb(15, 23, 42)",
  missed: "rgb(245, 158, 11)",
  invented: "rgb(244, 63, 94)",
};

export function fixed(value: number, digits = 3): string {
  return value.toFixed(digits);
}

export function percent(value: number, digits = 1): string {
  return `${(100 * value).toFixed(digits)}%`;
}

// A mask as a grid of cells. As "truth", the shape is light and the pixels on
// either side of its edge carry a small amber mark. As "errors", a pixel the
// network got right is indigo if it is shape and dark if it is ground, a shape
// pixel it missed is amber and a ground pixel it called shape is rose.
export function MaskMap({
  truth,
  called,
  boundary,
  mode,
  label,
}: {
  truth: Grid;
  called?: Grid;
  boundary?: Grid;
  mode: "truth" | "errors";
  label: string;
}) {
  const height = truth.length;
  const width = truth[0]?.length ?? 0;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={label}
    >
      <rect x={0} y={0} width={width} height={height} fill={ERROR_COLOURS.ground} />
      {truth.map((row, rowIndex) =>
        row.map((value, columnIndex) => {
          let fill: string;
          if (mode === "truth" || !called) {
            fill = value ? "rgb(241, 245, 249)" : ERROR_COLOURS.ground;
          } else {
            const answer = called[rowIndex][columnIndex];
            if (answer === value) fill = value ? ERROR_COLOURS.shape : ERROR_COLOURS.ground;
            else fill = value ? ERROR_COLOURS.missed : ERROR_COLOURS.invented;
          }
          return (
            <rect
              key={`${rowIndex},${columnIndex}`}
              x={columnIndex}
              y={rowIndex}
              width={1}
              height={1}
              fill={fill}
            />
          );
        }),
      )}
      {mode === "truth" &&
        boundary?.map((row, rowIndex) =>
          row.map((value, columnIndex) =>
            value ? (
              <circle
                key={`edge-${rowIndex},${columnIndex}`}
                cx={columnIndex + 0.5}
                cy={rowIndex + 0.5}
                r={0.16}
                fill="rgb(245, 158, 11)"
              />
            ) : null,
          ),
        )}
    </svg>
  );
}

export function ErrorLegend() {
  const entries: [string, string][] = [
    [ERROR_COLOURS.shape, "shape, called shape"],
    [ERROR_COLOURS.missed, "shape, called ground"],
    [ERROR_COLOURS.invented, "ground, called shape"],
  ];
  return (
    <div className="flex flex-wrap gap-3 text-[11px] text-slate-600 dark:text-slate-400">
      {entries.map(([colour, words]) => (
        <span key={words} className="flex items-center gap-1">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: colour }}
          />
          {words}
        </span>
      ))}
    </div>
  );
}
