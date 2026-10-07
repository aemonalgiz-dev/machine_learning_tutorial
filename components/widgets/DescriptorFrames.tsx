"use client";

// One corner read in its own frame, before and after a quarter turn.
//
// The pattern of pixel pairs is drawn over the corner twice: on the bar,
// turned to the corner's direction, and on the turned bar, turned to the
// turned corner's direction. The pairs land on the same brightness both
// times, which is why the two strings of bits below them are identical. The
// histogram descriptor is drawn as its grid of cells, each a small rose of
// eight directions, and the two grids are identical for the same reason.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { description, type DescribedCorner, type Description } from "@/lib/concepts/image-alignment";
import { Caption, Stat, greyShade } from "./keypointDrawing";
import { ARROW, degrees } from "./alignmentDrawing";

const CELL = 12;
const SHOWN_PAIRS = 40;

function Crop({
  picture,
  corner,
  reach,
}: {
  picture: number[][];
  corner: DescribedCorner;
  reach: number;
}) {
  const shade = greyShade(0, 1);
  const side = 2 * reach + 1;
  const at = (row: number, column: number) => picture[corner.row + row]?.[corner.column + column] ?? 0;
  const centre = reach * CELL + CELL / 2;
  const radians = (corner.angle_degrees * Math.PI) / 180;
  return (
    <svg viewBox={`0 0 ${side * CELL} ${side * CELL}`} className="w-full select-none rounded-md bg-slate-100 dark:bg-slate-900">
      {Array.from({ length: side }, (_, rowIndex) =>
        Array.from({ length: side }, (_, columnIndex) => (
          <rect
            key={`${rowIndex},${columnIndex}`}
            x={columnIndex * CELL}
            y={rowIndex * CELL}
            width={CELL}
            height={CELL}
            fill={shade(at(rowIndex - reach, columnIndex - reach)).fill}
            shapeRendering="crispEdges"
          />
        )),
      )}
      {corner.pairs.slice(0, SHOWN_PAIRS).map((pair, index) => (
        <line
          key={index}
          x1={(pair.first_column + reach + 0.5) * CELL}
          y1={(pair.first_row + reach + 0.5) * CELL}
          x2={(pair.second_column + reach + 0.5) * CELL}
          y2={(pair.second_row + reach + 0.5) * CELL}
          stroke={corner.bits[index] ? "#10b981" : "#f43f5e"}
          strokeWidth={1.2}
          strokeOpacity={0.8}
        />
      ))}
      <line
        x1={centre}
        y1={centre}
        x2={centre + Math.cos(radians) * reach * CELL * 0.8}
        y2={centre + Math.sin(radians) * reach * CELL * 0.8}
        stroke={ARROW}
        strokeWidth={3}
      />
      <circle cx={centre} cy={centre} r={4} fill={ARROW} />
    </svg>
  );
}

function Bits({ bits }: { bits: boolean[] }) {
  const perRow = 32;
  const rows = Math.ceil(bits.length / perRow);
  return (
    <svg viewBox={`0 0 ${perRow * 5} ${rows * 5}`} className="w-full select-none rounded-sm" shapeRendering="crispEdges">
      {bits.map((bit, index) => (
        <rect
          key={index}
          x={(index % perRow) * 5 + 0.4}
          y={Math.floor(index / perRow) * 5 + 0.4}
          width={4.2}
          height={4.2}
          fill={bit ? "#10b981" : "#cbd5e1"}
        />
      ))}
    </svg>
  );
}

function Rose({ histogram, cells, bins }: { histogram: number[]; cells: number; bins: number }) {
  const size = 30;
  const tallest = Math.max(...histogram, 1e-9);
  return (
    <svg viewBox={`0 0 ${cells * size} ${cells * size}`} className="w-full select-none rounded-md bg-slate-100 dark:bg-slate-900">
      {Array.from({ length: cells * cells }, (_, cell) => {
        const cx = (cell % cells) * size + size / 2;
        const cy = Math.floor(cell / cells) * size + size / 2;
        return (
          <g key={cell}>
            <rect x={(cell % cells) * size} y={Math.floor(cell / cells) * size} width={size} height={size} fill="none" stroke="#94a3b8" strokeWidth={0.4} />
            {Array.from({ length: bins }, (_, bin) => {
              const value = histogram[cell * bins + bin] / tallest;
              const radians = (bin / bins) * 2 * Math.PI;
              return (
                <line
                  key={bin}
                  x1={cx}
                  y1={cy}
                  x2={cx + Math.cos(radians) * value * (size / 2 - 2)}
                  y2={cy + Math.sin(radians) * value * (size / 2 - 2)}
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

export function DescriptorFrames() {
  const [report, setReport] = useState<Description | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    description()
      .then(setReport)
      .catch((error: unknown) => {
        if (error instanceof ApiError) setMessage(error.message);
      });
  }, []);

  if (message) return <p className="text-sm text-rose-700 dark:text-rose-300">{message}</p>;
  if (!report) return <p className="text-sm text-slate-500">Reading one corner twice.</p>;

  const reach = Math.floor(report.patch_side / 2);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Crop picture={report.bar} corner={report.before} reach={reach} />
          <Caption>
            The corner at ({report.before.row}, {report.before.column}) facing{" "}
            {degrees(report.before.angle_degrees)}, with the first {SHOWN_PAIRS} of{" "}
            {report.pair_count} pairs.
          </Caption>
          <Bits bits={report.before.bits} />
        </div>
        <div>
          <Crop picture={report.turned} corner={report.after} reach={reach} />
          <Caption>
            The same corner after the turn, at ({report.after.row}, {report.after.column}) facing{" "}
            {degrees(report.after.angle_degrees)}, with the same pairs turned with it.
          </Caption>
          <Bits bits={report.after.bits} />
        </div>
      </div>
      <Caption>
        A green pair is one whose first pixel is darker than its second, and reads as a one.
        The two strings of {report.pair_count} bits differ in {report.hamming.toFixed(0)} places.
      </Caption>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Rose histogram={report.before.histogram} cells={report.cells} bins={report.direction_bins} />
          <Caption>The gradient histogram before, {report.cells} by {report.cells} cells of {report.direction_bins} directions.</Caption>
        </div>
        <div>
          <Rose histogram={report.after.histogram} cells={report.cells} bins={report.direction_bins} />
          <Caption>The gradient histogram after the turn.</Caption>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Bits that differ" value={`${report.hamming.toFixed(0)} of ${report.pair_count}`} />
        <Stat label="Histogram distance" value={report.histogram_distance.toFixed(6)} />
      </div>
    </div>
  );
}
