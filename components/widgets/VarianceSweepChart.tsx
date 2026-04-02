"use client";

// The variance curve hiding behind the arrows above.
//
// Take the four worked people, point a direction through their mean, and
// measure the variance of their shadows along it. Turning that direction
// through half a circle traces the curve drawn here, and it has exactly one
// peak and one trough, a quarter turn apart. Those two angles are the
// principal components, which is the whole claim of the eigenvector route
// made visible. The sweep comes from the API; the browser only draws it.

import { useEffect, useState } from "react";
import {
  ApiError,
  Point,
  SweepComponent,
  VarianceSweep,
  sweepVariance,
} from "@/lib/api";

const VIEW = { width: 640, height: 360 };
const PAD = { left: 56, right: 16, top: 28, bottom: 50 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

// The four people whose deviation sums the page works by hand, copied from
// the playground above so the curve describes the same cloud.
const WORKED_PEOPLE: Point[] = [
  { x: 180, y: 78 },
  { x: 160, y: 58 },
  { x: 175, y: 63 },
  { x: 165, y: 73 },
];

const ANGLE_TICKS = [0, 45, 90, 135, 180];

function angleToPixelX(angleDegrees: number): number {
  return PAD.left + (angleDegrees / 180) * PLOT.width;
}

export function VarianceSweepChart() {
  const [sweep, setSweep] = useState<VarianceSweep | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSweep(await sweepVariance(WORKED_PEOPLE));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const orderedComponents: SweepComponent[] = sweep
    ? [...sweep.components].sort(
        (firstComponent, secondComponent) =>
          secondComponent.variance - firstComponent.variance,
      )
    : [];
  const peakComponent = orderedComponents.length > 0 ? orderedComponents[0] : null;
  const lowComponent = orderedComponents.length > 1 ? orderedComponents[1] : null;

  let curvePointsAttribute = "";
  let varianceFloor: number | null = null;
  let varianceCeiling: number | null = null;

  if (sweep) {
    varianceFloor = Math.min(...sweep.variances);
    varianceCeiling = Math.max(...sweep.variances);
    const varianceSpan = varianceCeiling - varianceFloor || 1;
    const floorForScale = varianceFloor;
    curvePointsAttribute = sweep.angles_degrees
      .map((angleDegrees, index) => {
        const pixelY =
          PAD.top +
          (1 - (sweep.variances[index] - floorForScale) / varianceSpan) *
            PLOT.height;
        return `${angleToPixelX(angleDegrees).toFixed(1)},${pixelY.toFixed(1)}`;
      })
      .join(" ");
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {/* the plot frame */}
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={PAD.top + PLOT.height}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth={1}
        />
        <line
          x1={PAD.left}
          y1={PAD.top + PLOT.height}
          x2={PAD.left + PLOT.width}
          y2={PAD.top + PLOT.height}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth={1}
        />

        {ANGLE_TICKS.map((angleDegrees) => (
          <text
            key={`t${angleDegrees}`}
            x={angleToPixelX(angleDegrees)}
            y={PAD.top + PLOT.height + 18}
            textAnchor="middle"
            className="fill-slate-400 text-xs dark:fill-slate-500"
          >
            {angleDegrees}
          </text>
        ))}

        {varianceCeiling !== null && (
          <text
            x={PAD.left - 8}
            y={PAD.top + 4}
            textAnchor="end"
            className="fill-slate-400 text-xs dark:fill-slate-500"
          >
            {varianceCeiling.toFixed(1)}
          </text>
        )}
        {varianceFloor !== null && (
          <text
            x={PAD.left - 8}
            y={PAD.top + PLOT.height + 4}
            textAnchor="end"
            className="fill-slate-400 text-xs dark:fill-slate-500"
          >
            {varianceFloor.toFixed(1)}
          </text>
        )}

        {/* the component angles, marked where the curve turns */}
        {orderedComponents.map((component, position) => {
          const pixelX = angleToPixelX(component.angle_degrees);
          return (
            <g key={`c${position}`}>
              <line
                x1={pixelX}
                y1={PAD.top}
                x2={pixelX}
                y2={PAD.top + PLOT.height}
                stroke="currentColor"
                className="text-emerald-500"
                strokeWidth={1.5}
                strokeDasharray="5 4"
              />
              <text
                x={pixelX}
                y={PAD.top - 8}
                textAnchor="middle"
                className="fill-emerald-600 text-xs font-medium dark:fill-emerald-400"
              >
                component {position + 1}
              </text>
            </g>
          );
        })}

        {/* the swept variance, one value per direction */}
        {sweep && (
          <polyline
            points={curvePointsAttribute}
            fill="none"
            stroke="currentColor"
            className="text-indigo-500"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        )}

        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Direction angle (degrees)
        </text>
        <text
          x={16}
          y={PAD.top + PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 16 ${PAD.top + PLOT.height / 2})`}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Variance along the direction
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Sweeping a direction around the half turn traces this curve, and its
        peak and trough are exactly the two components the widget above found.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Peak angle (degrees)"
          value={peakComponent ? peakComponent.angle_degrees.toFixed(0) : "…"}
        />
        <Stat
          label="Variance at the peak"
          value={peakComponent ? peakComponent.variance.toFixed(1) : "…"}
        />
        <Stat
          label="Low angle (degrees)"
          value={lowComponent ? lowComponent.angle_degrees.toFixed(0) : "…"}
        />
        <Stat
          label="Variance at the low"
          value={lowComponent ? lowComponent.variance.toFixed(1) : "…"}
        />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
