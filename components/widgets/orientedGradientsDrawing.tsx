"use client";

// The drawing every widget on the oriented-gradients page shares.
//
// The API counts the votes and the browser draws them, and the drawing that
// matters is the star: one little burst of strokes per cell, each stroke laid
// along the edge that its bucket stands for and made as long as the weight
// that went into that bucket. A grid of those stars beside the picture is the
// method in one image, and it is far more readable than a row of bars, because
// the strokes come out looking like the edges they were counted from.
//
// A stroke is drawn along the edge rather than along the direction the
// brightness rises, which are a quarter circle apart. Over half a circle a
// direction and its reverse are one thing, so the stroke runs both ways from
// the middle of the cell; over the whole circle they are two things, so it
// runs one way only and a bright bar on dark ground and a dark bar on bright
// ground point opposite ways.

import { ReactNode } from "react";

export const UNIT = 20;
// Drawing units per cell. Nothing depends on the number except that it is
// large enough for a stroke to be visible at the smallest cell counts.

export const STAR_STROKE = "stroke-indigo-500 dark:stroke-indigo-300";
export const GRID_STROKE = "stroke-slate-300 dark:stroke-slate-700";

// One brightness as a grey, scaled so that the darkest pixel of a picture is
// black and the brightest is white. Scaled rather than clamped at nought and
// one, because a relit scene runs past one and would otherwise wash out.
export function greyScale(pixels: number[][]): (value: number) => string {
  let low = Infinity;
  let high = -Infinity;
  for (const row of pixels) {
    for (const value of row) {
      if (value < low) low = value;
      if (value > high) high = value;
    }
  }
  const span = high - low;
  return (value: number) => {
    const share = span === 0 ? 0.5 : (value - low) / span;
    const level = Math.round(Math.max(0, Math.min(1, share)) * 255);
    return `rgb(${level}, ${level}, ${level})`;
  };
}

export function PixelPicture({
  pixels,
  cellSide,
  title,
  highlight,
}: {
  pixels: number[][];
  cellSide?: number;
  title?: string;
  highlight?: { row: number; column: number } | null;
}) {
  const height = pixels.length;
  const width = pixels[0]?.length ?? 0;
  const grey = greyScale(pixels);
  const lines: ReactNode[] = [];
  if (cellSide) {
    for (let column = cellSide; column < width; column += cellSide) {
      lines.push(
        <line
          key={`down-${column}`}
          x1={column}
          y1={0}
          x2={column}
          y2={height}
          className="stroke-amber-400/70"
          strokeWidth={0.18}
        />,
      );
    }
    for (let row = cellSide; row < height; row += cellSide) {
      lines.push(
        <line
          key={`across-${row}`}
          x1={0}
          y1={row}
          x2={width}
          y2={row}
          className="stroke-amber-400/70"
          strokeWidth={0.18}
        />,
      );
    }
  }
  return (
    <div>
      {title && (
        <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
          {title}
        </p>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full rounded border border-slate-200 dark:border-slate-800"
        shapeRendering="crispEdges"
      >
        {pixels.map((row, down) =>
          row.map((brightness, across) => (
            <rect
              key={`${down}-${across}`}
              x={across}
              y={down}
              width={1}
              height={1}
              fill={grey(brightness)}
            />
          )),
        )}
        {lines}
        {highlight && cellSide && (
          <rect
            x={highlight.column * cellSide}
            y={highlight.row * cellSide}
            width={cellSide}
            height={cellSide}
            fill="none"
            className="stroke-rose-500"
            strokeWidth={0.5}
          />
        )}
      </svg>
    </div>
  );
}

// The star grid. One burst per cell, one stroke per bucket, the stroke's
// length the share of that cell's weight the bucket holds and its darkness the
// share of the heaviest cell in the grid, so a quiet cell beside a loud one
// looks quiet rather than being stretched to fill its square.
export function CellStarGrid({
  cells,
  bucketCentreDegrees,
  signed,
  selected,
  onSelect,
  scaleAcrossTheGrid = true,
}: {
  cells: number[][][];
  bucketCentreDegrees: number[];
  signed: boolean;
  selected?: { row: number; column: number } | null;
  onSelect?: (cell: { row: number; column: number }) => void;
  scaleAcrossTheGrid?: boolean;
}) {
  const nRows = cells.length;
  const nColumns = cells[0]?.length ?? 0;

  let heaviest = 0;
  for (const row of cells) {
    for (const cell of row) {
      const weight = cell.reduce((total, value) => total + value, 0);
      if (weight > heaviest) heaviest = weight;
    }
  }

  const strokes: ReactNode[] = [];
  cells.forEach((row, down) => {
    row.forEach((cell, across) => {
      const weight = cell.reduce((total, value) => total + value, 0);
      const centreX = across * UNIT + UNIT / 2;
      const centreY = down * UNIT + UNIT / 2;
      const loudness = heaviest === 0 ? 0 : weight / heaviest;
      const biggest = Math.max(...cell, 0);
      cell.forEach((value, bucket) => {
        if (value <= 0 || weight <= 0) return;
        const share = value / (biggest || 1);
        const reach =
          (scaleAcrossTheGrid ? Math.sqrt(loudness) : 1) *
          share *
          (UNIT / 2 - 0.8);
        if (reach < 0.15) return;
        const along = ((bucketCentreDegrees[bucket] + 90) * Math.PI) / 180;
        const stepX = Math.cos(along) * reach;
        const stepY = Math.sin(along) * reach;
        strokes.push(
          <line
            key={`${down}-${across}-${bucket}`}
            x1={signed ? centreX : centreX - stepX}
            y1={signed ? centreY : centreY - stepY}
            x2={centreX + stepX}
            y2={centreY + stepY}
            className={STAR_STROKE}
            strokeWidth={0.5 + 1.1 * share}
            strokeLinecap="round"
            strokeOpacity={0.3 + 0.7 * share}
          />,
        );
      });
    });
  });

  const grid: ReactNode[] = [];
  for (let column = 0; column <= nColumns; column += 1) {
    grid.push(
      <line
        key={`down-${column}`}
        x1={column * UNIT}
        y1={0}
        x2={column * UNIT}
        y2={nRows * UNIT}
        className={GRID_STROKE}
        strokeWidth={0.3}
      />,
    );
  }
  for (let row = 0; row <= nRows; row += 1) {
    grid.push(
      <line
        key={`across-${row}`}
        x1={0}
        y1={row * UNIT}
        x2={nColumns * UNIT}
        y2={row * UNIT}
        className={GRID_STROKE}
        strokeWidth={0.3}
      />,
    );
  }

  return (
    <svg
      viewBox={`0 0 ${nColumns * UNIT} ${nRows * UNIT}`}
      className="w-full select-none rounded border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
    >
      {grid}
      {strokes}
      {selected && (
        <rect
          x={selected.column * UNIT}
          y={selected.row * UNIT}
          width={UNIT}
          height={UNIT}
          fill="none"
          className="stroke-rose-500"
          strokeWidth={0.7}
        />
      )}
      {onSelect &&
        cells.map((row, down) =>
          row.map((_, across) => (
            <rect
              key={`hit-${down}-${across}`}
              x={across * UNIT}
              y={down * UNIT}
              width={UNIT}
              height={UNIT}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onSelect({ row: down, column: across })}
            />
          )),
        )}
    </svg>
  );
}

// One cell's histogram as upright bars, for the reader who wants the numbers
// the star was drawn from.
export function BucketBars({
  weights,
  bucketCentreDegrees,
  height = 90,
  colour = "fill-indigo-500 dark:fill-indigo-400",
  labelEvery = 1,
}: {
  weights: number[];
  bucketCentreDegrees: number[];
  height?: number;
  colour?: string;
  labelEvery?: number;
}) {
  const width = 240;
  const bottom = height - 16;
  const tallest = Math.max(...weights, 1e-12);
  const step = width / weights.length;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full select-none">
      <line
        x1={0}
        y1={bottom}
        x2={width}
        y2={bottom}
        className={GRID_STROKE}
        strokeWidth={0.8}
      />
      {weights.map((weight, bucket) => {
        const tall = (weight / tallest) * (bottom - 4);
        return (
          <rect
            key={`bar-${bucket}`}
            x={bucket * step + step * 0.15}
            y={bottom - tall}
            width={step * 0.7}
            height={Math.max(tall, 0)}
            className={colour}
          />
        );
      })}
      {bucketCentreDegrees.map((degrees, bucket) =>
        bucket % labelEvery === 0 ? (
          <text
            key={`label-${bucket}`}
            x={bucket * step + step / 2}
            y={height - 4}
            textAnchor="middle"
            className="fill-slate-500 text-[7px] dark:fill-slate-400"
          >
            {Math.round(degrees)}
          </text>
        ) : null,
      )}
    </svg>
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

// A number small enough to be nothing, written so a reader can see at a glance
// that it is nothing rather than counting zeros.
export function tiny(value: number): string {
  if (value === 0) return "0";
  if (Math.abs(value) < 1e-6) return value.toExponential(1);
  return value.toFixed(4);
}
