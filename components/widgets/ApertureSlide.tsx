"use client";

// A five-wide window slid down one straight edge, stop by stop.
//
// The slider moves the window; the drawing shows where it is; the two bars
// underneath are how far what it sees is from the patch at the middle of the
// edge and from the patch at the corner above it. Five of the fifteen stops sit
// at a distance of exactly zero from the edge patch and exactly one sits at zero
// from the corner patch, which is the aperture problem as a pair of integers.
// The API cuts every patch and measures every distance; the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Aperture, fetchAperture } from "@/lib/concepts/keypoints-and-descriptors";
import {
  AGREES,
  CORNER,
  Caption,
  PixelGrid,
  Stat,
  WINDOW,
  greyShade,
} from "./keypointDrawing";

const CHART = { width: 640, height: 190 };
const PAD = { left: 46, right: 14, top: 14, bottom: 30 };

export function ApertureSlide() {
  const [report, setReport] = useState<Aperture | null>(null);
  const [stop, setStop] = useState(7);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setReport(await fetchAperture());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!report) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const here = report.steps[Math.min(stop, report.steps.length - 1)];
  const half = Math.floor(report.edge_patch.length / 2);
  const furthest = Math.max(
    ...report.steps.map((step) =>
      Math.max(step.distance_from_edge, step.distance_from_corner),
    ),
  );
  const innerWidth = CHART.width - PAD.left - PAD.right;
  const innerHeight = CHART.height - PAD.top - PAD.bottom;
  const stepWidth = innerWidth / report.steps.length;
  const barX = (index: number) => PAD.left + index * stepWidth;
  const barTop = (value: number) =>
    PAD.top + (1 - value / (furthest || 1)) * innerHeight;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[170px_140px_1fr]">
        <div>
          <PixelGrid
            rows={report.picture}
            shade={greyShade(0, 1)}
            cell={7}
            boxes={[
              {
                row: here.row - half,
                column: report.column - half,
                height: report.edge_patch.length,
                width: report.edge_patch.length,
                colour: WINDOW,
              },
            ]}
            marks={[
              { row: report.corner_row, column: report.column, colour: CORNER },
              { row: report.edge_row, column: report.column, colour: AGREES },
            ]}
          />
          <Caption>
            the window at row {here.row}, with the corner in amber and the
            middle of the edge in green
          </Caption>
        </div>
        <div>
          <PixelGrid rows={here.patch} shade={greyShade(0, 1)} cell={26} />
          <Caption>what the window sees</Caption>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            slide the window
            <input
              type="range"
              min={0}
              max={report.steps.length - 1}
              step={1}
              value={stop}
              onChange={(event) => setStop(Number(event.target.value))}
              className="flex-1 accent-indigo-600"
            />
            <span className="w-8 text-right font-mono">{here.row}</span>
          </label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat
              label="distance from the edge patch"
              value={here.distance_from_edge.toFixed(6)}
            />
            <Stat
              label="distance from the corner patch"
              value={here.distance_from_corner.toFixed(6)}
            />
            <Stat
              label="stops matching the edge patch exactly"
              value={`${report.edge_matches} of ${report.steps.length}`}
            />
            <Stat
              label="stops matching the corner patch exactly"
              value={`${report.corner_matches} of ${report.steps.length}`}
            />
          </div>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="mt-3 w-full select-none rounded-md bg-slate-50 dark:bg-slate-950"
      >
        {report.steps.map((step, index) => (
          <g key={step.row}>
            <rect
              x={barX(index) + 2}
              y={barTop(step.distance_from_edge)}
              width={stepWidth / 2 - 3}
              height={Math.max(
                1.5,
                PAD.top + innerHeight - barTop(step.distance_from_edge),
              )}
              fill={AGREES}
              fillOpacity={step.row === here.row ? 1 : 0.55}
            />
            <rect
              x={barX(index) + stepWidth / 2 + 1}
              y={barTop(step.distance_from_corner)}
              width={stepWidth / 2 - 3}
              height={Math.max(
                1.5,
                PAD.top + innerHeight - barTop(step.distance_from_corner),
              )}
              fill={CORNER}
              fillOpacity={step.row === here.row ? 1 : 0.55}
            />
            <text
              x={barX(index) + stepWidth / 2}
              y={CHART.height - 10}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {step.row}
            </text>
          </g>
        ))}
        <line
          x1={PAD.left}
          x2={CHART.width - PAD.right}
          y1={PAD.top + innerHeight}
          y2={PAD.top + innerHeight}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
        />
        <text
          x={PAD.left - 6}
          y={PAD.top + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          {furthest.toFixed(2)}
        </text>
        <text
          x={PAD.left - 6}
          y={PAD.top + innerHeight + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          0
        </text>
      </svg>
      <Caption>
        green is the distance from the patch at the middle of the edge, amber
        from the patch at the corner. A bar of zero height means the window is
        seeing something it cannot tell apart from the reference.
      </Caption>
    </div>
  );
}
