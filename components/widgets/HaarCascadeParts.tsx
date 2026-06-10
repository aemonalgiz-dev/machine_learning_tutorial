"use client";

// The pieces every widget on the Haar cascades page shares: a readout tile, a
// picture drawn one rectangle per pixel, and the grey a brightness maps to.
//
// A picture is drawn rather than shaded by CSS so that boxes, corners and
// window outlines can be laid over it in the same coordinate system, which is
// the whole point of the drawings on that page. The API computes every number;
// this only turns brightnesses into greys.

import { ReactNode, useEffect, useRef } from "react";

// Brightness to grey. Most pictures on this page run from about 0.1 to about
// 1.0, and the shared scene adds a ramp that takes it a little past one, so
// the value is clamped rather than assumed. The hand-sized picture whose pixel
// at row r and column c is 10r + c runs to 55 instead, so the caller passes
// what the brightest pixel is and the shading is worked out against that.
export function greyOf(value: number, brightest = 1): string {
  const clamped = Math.max(0, Math.min(1, value / brightest));
  const level = Math.round(clamped * 255);
  return `rgb(${level}, ${level}, ${level})`;
}

// The same picture with nothing drawn over it. A sixty-six pixel square scene
// is four and a half thousand rectangles, and three of them side by side is
// enough elements to make a page feel slow, so where no overlay is wanted the
// pixels go onto a canvas instead and the whole picture is one element.
export function PixelCanvas({
  rows,
  className = "",
}: {
  rows: number[][];
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const target = canvas.current;
    if (!target) return;
    const height = rows.length;
    const width = rows[0]?.length ?? 0;
    const context = target.getContext("2d");
    if (!context || width === 0) return;
    const picture = context.createImageData(width, height);
    for (let row = 0; row < height; row += 1) {
      for (let column = 0; column < width; column += 1) {
        const level = Math.round(
          Math.max(0, Math.min(1, rows[row][column])) * 255,
        );
        const at = (row * width + column) * 4;
        picture.data[at] = level;
        picture.data[at + 1] = level;
        picture.data[at + 2] = level;
        picture.data[at + 3] = 255;
      }
    }
    context.putImageData(picture, 0, 0);
  }, [rows]);

  return (
    <canvas
      ref={canvas}
      width={rows[0]?.length ?? 1}
      height={rows.length}
      className={`w-full ${className}`}
      style={{ imageRendering: "pixelated" }}
    />
  );
}

export function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] leading-tight text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div
        className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100"
        style={tone ? { color: tone } : undefined}
      >
        {value}
      </div>
    </div>
  );
}

// One picture, one rectangle per pixel, at a chosen pixel size. Anything drawn
// over it goes in `children`, in the same units, so a caller writes
// `x={left * cell}` and lands on the pixel it meant.
export function PixelGrid({
  rows,
  cell,
  children,
  showValues = false,
  outline = false,
  brightest = 1,
  className = "",
}: {
  rows: number[][];
  cell: number;
  children?: ReactNode;
  showValues?: boolean;
  outline?: boolean;
  brightest?: number;
  className?: string;
}) {
  const height = rows.length;
  const width = rows[0]?.length ?? 0;
  return (
    <svg
      viewBox={`0 0 ${width * cell} ${height * cell}`}
      className={`w-full select-none ${className}`}
      role="img"
    >
      {rows.map((row, rowIndex) =>
        row.map((value, columnIndex) => (
          <rect
            key={`${rowIndex}-${columnIndex}`}
            x={columnIndex * cell}
            y={rowIndex * cell}
            width={cell + 0.4}
            height={cell + 0.4}
            fill={greyOf(value, brightest)}
            stroke={outline ? "rgba(148,163,184,0.45)" : undefined}
            strokeWidth={outline ? 0.4 : undefined}
          />
        )),
      )}
      {showValues &&
        rows.map((row, rowIndex) =>
          row.map((value, columnIndex) => (
            <text
              key={`v-${rowIndex}-${columnIndex}`}
              x={columnIndex * cell + cell / 2}
              y={rowIndex * cell + cell / 2 + cell * 0.14}
              textAnchor="middle"
              fontSize={cell * 0.36}
              fill={value / brightest > 0.55 ? "#0f172a" : "#f8fafc"}
              fontFamily="ui-monospace, monospace"
            >
              {Math.round(value)}
            </text>
          )),
        )}
      {children}
    </svg>
  );
}
