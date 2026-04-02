"use client";

// Drag a point along a curve and read the slope there.
//
// This is the derivative on its own, before any walking: at each point the
// dashed line is the tangent, the straight line that grazes the curve there, and
// its slope is the derivative. Drag toward the bottom and the tangent flattens
// and the slope passes through zero. Every slope is the API's, not the browser's.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, Tangent, curveTangent } from "@/lib/api";

const VIEW = { width: 640, height: 380 };
const PAD = { left: 20, right: 20, top: 20, bottom: 28 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const START_X = -2;

function projectX(
  window: Tangent["window"],
  x: number,
): number {
  return (
    PAD.left + ((x - window.x_min) / (window.x_max - window.x_min)) * PLOT.width
  );
}

function projectY(window: Tangent["window"], y: number): number {
  return (
    PAD.top +
    (1 - (y - window.y_min) / (window.y_max - window.y_min)) * PLOT.height
  );
}

function unprojectX(window: Tangent["window"], px: number): number {
  return (
    window.x_min + ((px - PAD.left) / PLOT.width) * (window.x_max - window.x_min)
  );
}

function describeSlope(slope: number): string {
  if (slope < -0.05) {
    return "The curve is falling here, so the slope is negative.";
  }
  if (slope > 0.05) {
    return "The curve is rising here, so the slope is positive.";
  }
  return "The curve is flat here, so the slope is zero. This is the bottom.";
}

export function TangentExplorer() {
  const [x, setX] = useState(START_X);
  const [tangent, setTangent] = useState<Tangent | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const dragging = useRef(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setTangent(await curveTangent({ function: "bowl", x }));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [x]);

  const pointerToX = useCallback(
    (clientX: number): number | null => {
      if (!tangent) return null;
      const svg = svgRef.current!;
      const rect = svg.getBoundingClientRect();
      const px = ((clientX - rect.left) / rect.width) * VIEW.width;
      const raw = unprojectX(tangent.window, px);
      return Math.min(
        tangent.window.x_max,
        Math.max(tangent.window.x_min, Math.round(raw * 100) / 100),
      );
    },
    [tangent],
  );

  const onPointerDown = (event: React.PointerEvent) => {
    dragging.current = true;
    svgRef.current?.setPointerCapture(event.pointerId);
    const next = pointerToX(event.clientX);
    if (next !== null) setX(next);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging.current) return;
    const next = pointerToX(event.clientX);
    if (next !== null) setX(next);
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  const window = tangent?.window;

  const curvePath =
    tangent && window
      ? tangent.curve
          .map(
            (point, index) =>
              `${index === 0 ? "M" : "L"} ${projectX(window, point.x).toFixed(2)} ${projectY(window, point.y).toFixed(2)}`,
          )
          .join(" ")
      : "";

  // The tangent, drawn clear across the window so it reads as a straight line
  // grazing the curve. The SVG viewport clips a steep one.
  const tangentLine =
    tangent && window
      ? {
          x1: projectX(window, window.x_min),
          y1: projectY(
            window,
            tangent.point.y + tangent.point.slope * (window.x_min - tangent.point.x),
          ),
          x2: projectX(window, window.x_max),
          y2: projectY(
            window,
            tangent.point.y + tangent.point.slope * (window.x_max - tangent.point.x),
          ),
        }
      : null;

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full cursor-ew-resize touch-none select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {window && tangent && (
          <>
            <path
              d={curvePath}
              fill="none"
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              strokeWidth={2}
            />
            {tangentLine && (
              <line
                x1={tangentLine.x1}
                y1={tangentLine.y1}
                x2={tangentLine.x2}
                y2={tangentLine.y2}
                stroke="currentColor"
                className="text-amber-500"
                strokeWidth={2}
                strokeDasharray="5 3"
              />
            )}
            <circle
              cx={projectX(window, tangent.point.x)}
              cy={projectY(window, tangent.point.y)}
              r={8}
              className="fill-indigo-600 stroke-white dark:stroke-slate-900"
              strokeWidth={2}
            />
          </>
        )}
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Drag the point along the curve.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat label="Point (x)" value={x.toFixed(2)} />
        <Stat
          label="Slope f'(x)"
          value={tangent ? tangent.point.slope.toFixed(2) : "…"}
        />
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {message ? message : tangent ? describeSlope(tangent.point.slope) : "…"}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
