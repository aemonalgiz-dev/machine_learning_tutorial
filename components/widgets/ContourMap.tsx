"use client";

// A sampled surface drawn as shaded cells with contour lines, for overlays.
//
// Every loss-surface picture on the descent page is this: a lattice from
// the API shaded darker where the value is larger, white lines of equal
// value traced through it, and whatever the section wants on top, a point,
// an arrow, a path. The overlay is a render function handed the two pixel
// scales, so the caller never repeats the axis arithmetic.

import { ReactNode } from "react";
import { traceContour } from "@/lib/contours";

export interface ContourScale {
  toX: (first: number) => number;
  toY: (second: number) => number;
  clampX: (px: number) => number;
  clampY: (py: number) => number;
}

const CONTOUR_MULTIPLES = [1.02, 1.1, 1.3, 1.8, 3, 6, 12, 30, 80];

export function ContourMap({
  firstAxis,
  secondAxis,
  values,
  width = 320,
  height = 280,
  firstLabel,
  secondLabel,
  children,
}: {
  firstAxis: number[];
  secondAxis: number[];
  values: number[][];
  width?: number;
  height?: number;
  firstLabel: string;
  secondLabel: string;
  children?: (scale: ContourScale) => ReactNode;
}) {
  const pad = { left: 46, right: 10, top: 10, bottom: 34 };
  const plot = { width: width - pad.left - pad.right, height: height - pad.top - pad.bottom };
  const firstMin = firstAxis[0];
  const firstMax = firstAxis[firstAxis.length - 1];
  const secondMin = secondAxis[0];
  const secondMax = secondAxis[secondAxis.length - 1];
  const toX = (first: number) => pad.left + ((first - firstMin) / (firstMax - firstMin)) * plot.width;
  const toY = (second: number) => pad.top + (1 - (second - secondMin) / (secondMax - secondMin)) * plot.height;
  const clampX = (px: number) => Math.min(pad.left + plot.width, Math.max(pad.left, px));
  const clampY = (py: number) => Math.min(pad.top + plot.height, Math.max(pad.top, py));
  const cellWidth = plot.width / (firstAxis.length - 1);
  const cellHeight = plot.height / (secondAxis.length - 1);

  const flat = values.flat();
  const lowest = Math.min(...flat);
  const highest = Math.max(...flat);
  const shade = (value: number) => {
    if (highest <= lowest) return 0.1;
    return 0.04 + 0.7 * (Math.log(value / lowest + 1e-9) / Math.log(highest / lowest + 1e-9));
  };
  const contours = CONTOUR_MULTIPLES.map((multiple) => traceContour(values, lowest * multiple));
  const latticeX = (column: number) => toX(firstMin + (column / (firstAxis.length - 1)) * (firstMax - firstMin));
  const latticeY = (row: number) => toY(secondMin + (row / (secondAxis.length - 1)) * (secondMax - secondMin));

  const format = (value: number) => (Math.abs(value) >= 100 ? value.toFixed(0) : Math.abs(value) >= 1 ? value.toFixed(1) : value.toFixed(2));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
      {values.map((row, rowIndex) =>
        row.map((value, columnIndex) => (
          <rect
            key={`${rowIndex}-${columnIndex}`}
            x={toX(firstAxis[columnIndex]) - cellWidth / 2}
            y={toY(secondAxis[rowIndex]) - cellHeight / 2}
            width={cellWidth + 0.5}
            height={cellHeight + 0.5}
            fill="#6366f1"
            opacity={shade(value)}
          />
        )),
      )}
      {contours.map((segments, level) => (
        <g key={level}>
          {segments.map((segment, position) => (
            <line
              key={position}
              x1={latticeX(segment[0])}
              y1={latticeY(segment[1])}
              x2={latticeX(segment[2])}
              y2={latticeY(segment[3])}
              stroke="white"
              strokeWidth={0.8}
              opacity={0.7}
            />
          ))}
        </g>
      ))}
      <rect x={pad.left} y={pad.top} width={plot.width} height={plot.height} fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
      <text x={pad.left} y={pad.top + plot.height + 14} className="fill-slate-400 text-[10px]">{format(firstMin)}</text>
      <text x={pad.left + plot.width} y={pad.top + plot.height + 14} textAnchor="end" className="fill-slate-400 text-[10px]">{format(firstMax)}</text>
      <text x={pad.left - 4} y={pad.top + plot.height} textAnchor="end" className="fill-slate-400 text-[10px]">{format(secondMin)}</text>
      <text x={pad.left - 4} y={pad.top + 10} textAnchor="end" className="fill-slate-400 text-[10px]">{format(secondMax)}</text>
      <text x={pad.left + plot.width / 2} y={height - 4} textAnchor="middle" className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400">{firstLabel}</text>
      <text x={11} y={pad.top + plot.height / 2} textAnchor="middle" transform={`rotate(-90 11 ${pad.top + plot.height / 2})`} className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400">{secondLabel}</text>
      {children?.({ toX, toY, clampX, clampY })}
    </svg>
  );
}
