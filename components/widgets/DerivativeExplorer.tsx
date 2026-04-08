"use client";

// The derivative, built from the average rate of change.
//
// Two points sit on the curve. The solid line through them is the secant, and
// its slope is the average rate of change across the gap between them. Shrink the
// gap with the slider and the second point slides toward the base, the secant
// rotates onto the dashed tangent, and its slope closes in on the derivative at
// the base. Drag the base point to read the derivative anywhere along the curve.
// Every slope is the API's, not the browser's.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, Secant, curveSecant } from "@/lib/api";

const VIEW = { width: 640, height: 380 };
const PAD = { left: 20, right: 20, top: 20, bottom: 28 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

// The widget opens on the exact configuration the primer's worked example uses,
// base 3 with a gap of 2, so the first row of the prose's table is what the
// reader sees on load.
const START_BASE = 3;
const START_GAP = 2;

function projectX(window: Secant["window"], x: number): number {
  return (
    PAD.left + ((x - window.x_min) / (window.x_max - window.x_min)) * PLOT.width
  );
}

function projectY(window: Secant["window"], y: number): number {
  return (
    PAD.top +
    (1 - (y - window.y_min) / (window.y_max - window.y_min)) * PLOT.height
  );
}

function unprojectX(window: Secant["window"], px: number): number {
  return (
    window.x_min + ((px - PAD.left) / PLOT.width) * (window.x_max - window.x_min)
  );
}

// A straight line of a given slope through a point, drawn clear across the
// window. The SVG viewport clips a steep one.
function lineAcross(
  window: Secant["window"],
  throughX: number,
  throughY: number,
  slope: number,
) {
  return {
    x1: projectX(window, window.x_min),
    y1: projectY(window, throughY + slope * (window.x_min - throughX)),
    x2: projectX(window, window.x_max),
    y2: projectY(window, throughY + slope * (window.x_max - throughX)),
  };
}

export function DerivativeExplorer() {
  const [base, setBase] = useState(START_BASE);
  const [gap, setGap] = useState(START_GAP);
  const [secant, setSecant] = useState<Secant | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const dragging = useRef(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setSecant(await curveSecant({ function: "bowl", base, gap }));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [base, gap]);

  const pointerToX = useCallback(
    (clientX: number): number | null => {
      if (!secant) return null;
      const svg = svgRef.current!;
      const rect = svg.getBoundingClientRect();
      const px = ((clientX - rect.left) / rect.width) * VIEW.width;
      const raw = unprojectX(secant.window, px);
      return Math.min(
        secant.window.x_max,
        Math.max(secant.window.x_min, Math.round(raw * 100) / 100),
      );
    },
    [secant],
  );

  const onPointerDown = (event: React.PointerEvent) => {
    dragging.current = true;
    svgRef.current?.setPointerCapture(event.pointerId);
    const next = pointerToX(event.clientX);
    if (next !== null) setBase(next);
  };
  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging.current) return;
    const next = pointerToX(event.clientX);
    if (next !== null) setBase(next);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  const window = secant?.window;
  const closed = secant ? Math.abs(secant.secant_slope - secant.tangent_slope) < 0.05 : false;

  const curvePath =
    secant && window
      ? secant.curve
          .map(
            (point, index) =>
              `${index === 0 ? "M" : "L"} ${projectX(window, point.x).toFixed(2)} ${projectY(window, point.y).toFixed(2)}`,
          )
          .join(" ")
      : "";

  const tangentLine =
    secant && window
      ? lineAcross(
          window,
          secant.base_point.x,
          secant.base_point.y,
          secant.tangent_slope,
        )
      : null;

  const secantLine =
    secant && window
      ? lineAcross(
          window,
          secant.base_point.x,
          secant.base_point.y,
          secant.secant_slope,
        )
      : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Drag the base point along the curve.
        </span>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          Gap
          <input
            type="range"
            min={0.02}
            max={4}
            step={0.02}
            value={gap}
            onChange={(event) => setGap(Number(event.target.value))}
            className="w-40 accent-indigo-600"
          />
          <span className="w-10 font-mono text-sm">{gap.toFixed(2)}</span>
        </label>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full cursor-ew-resize touch-none select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {window && secant && (
          <>
            <path
              d={curvePath}
              fill="none"
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              strokeWidth={2}
            />
            {/* the tangent: the derivative at the base, drawn dashed */}
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
            {/* the secant: the average rate across the gap, drawn solid */}
            {secantLine && (
              <line
                x1={secantLine.x1}
                y1={secantLine.y1}
                x2={secantLine.x2}
                y2={secantLine.y2}
                stroke="currentColor"
                className="text-indigo-500"
                strokeWidth={2}
              />
            )}
            {/* the second point */}
            <circle
              cx={projectX(window, secant.second_point.x)}
              cy={projectY(window, secant.second_point.y)}
              r={5}
              className="fill-slate-400 stroke-white dark:stroke-slate-900"
              strokeWidth={1.5}
            />
            {/* the base point */}
            <circle
              cx={projectX(window, secant.base_point.x)}
              cy={projectY(window, secant.base_point.y)}
              r={8}
              className="fill-indigo-600 stroke-white dark:stroke-slate-900"
              strokeWidth={2}
            />
          </>
        )}
      </svg>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Average slope"
          value={secant ? secant.secant_slope.toFixed(2) : "…"}
          tone="indigo"
        />
        <Stat
          label="Derivative f'(x)"
          value={secant ? secant.tangent_slope.toFixed(2) : "…"}
          tone="amber"
        />
        <Stat label="Gap" value={gap.toFixed(2)} tone="plain" />
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {message
          ? message
          : closed
            ? "The gap is tiny, so the secant has all but become the tangent: the average slope has reached the derivative."
            : "The solid secant is the average slope across the gap. Shrink the gap and it rotates onto the dashed tangent, the derivative at the base."}
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "indigo" | "amber" | "plain";
}) {
  const valueColor =
    tone === "indigo"
      ? "text-indigo-600 dark:text-indigo-400"
      : tone === "amber"
        ? "text-amber-600 dark:text-amber-400"
        : "text-slate-900 dark:text-slate-100";
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`font-mono text-lg font-semibold ${valueColor}`}>
        {value}
      </div>
    </div>
  );
}
