"use client";

// Rise over run, measured on a line the reader can move.
//
// Two points sit on a plane ten wide and twenty tall, and the straight line
// through them is drawn right across the panel. Between the points a dashed
// right triangle shows the run in amber and the rise in emerald, each leg
// labelled with the value the API measured. Drag either point and the slope
// remeasures. Pull the points into a vertical pair and the API answers null,
// because there is no run to divide by. Both axes share one pixel scale, so
// the steepness on screen is the steepness the numbers claim. Every number
// shown comes from the API; only the drawing happens in the browser.

import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { ApiError, LineSlope, PlanePoint, measureLineSlope } from "@/lib/api";

const X_RANGE = 10;
const Y_RANGE = 20;
const SCALE = 36; // pixels per unit, identical on both axes
const VIEW_WIDTH = X_RANGE * SCALE;
const VIEW_HEIGHT = Y_RANGE * SCALE;

const START_FIRST: PlanePoint = { x: 2, y: 3 };
const START_SECOND: PlanePoint = { x: 6, y: 11 };

function snapToHalf(value: number, upperBound: number): number {
  return Math.max(0, Math.min(upperBound, Math.round(value * 2) / 2));
}

function toPixel(point: PlanePoint): { pixelX: number; pixelY: number } {
  return { pixelX: point.x * SCALE, pixelY: VIEW_HEIGHT - point.y * SCALE };
}

function toPlane(pixelX: number, pixelY: number): PlanePoint {
  return {
    x: snapToHalf(pixelX / SCALE, X_RANGE),
    y: snapToHalf((VIEW_HEIGHT - pixelY) / SCALE, Y_RANGE),
  };
}

export function SlopePlayground() {
  const [first, setFirst] = useState<PlanePoint>(START_FIRST);
  const [second, setSecond] = useState<PlanePoint>(START_SECOND);
  const [measurement, setMeasurement] = useState<LineSlope | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const dragging = useRef<"first" | "second" | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setMeasurement(await measureLineSlope(first, second));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [first, second]);

  const pointerToPlane = useCallback((clientX: number, clientY: number) => {
    const svgElement = svgRef.current!;
    const bounds = svgElement.getBoundingClientRect();
    const pixelX = ((clientX - bounds.left) / bounds.width) * VIEW_WIDTH;
    const pixelY = ((clientY - bounds.top) / bounds.height) * VIEW_HEIGHT;
    return toPlane(pixelX, pixelY);
  }, []);

  const onGrabFirst = (event: React.PointerEvent) => {
    event.stopPropagation();
    dragging.current = "first";
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onGrabSecond = (event: React.PointerEvent) => {
    event.stopPropagation();
    dragging.current = "second";
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging.current) return;
    const point = pointerToPlane(event.clientX, event.clientY);
    if (dragging.current === "first") setFirst(point);
    else setSecond(point);
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  const firstPixel = toPixel(first);
  const secondPixel = toPixel(second);
  const cornerPixel = toPixel({ x: second.x, y: first.y });

  // The line through both points, extended to the panel edges. The svg clips
  // whatever falls outside the viewBox.
  let lineStart: { pixelX: number; pixelY: number };
  let lineEnd: { pixelX: number; pixelY: number };
  if (second.x === first.x) {
    lineStart = toPixel({ x: first.x, y: 0 });
    lineEnd = toPixel({ x: first.x, y: Y_RANGE });
  } else {
    const slopeForDrawing = (second.y - first.y) / (second.x - first.x);
    lineStart = toPixel({ x: 0, y: first.y - first.x * slopeForDrawing });
    lineEnd = toPixel({
      x: X_RANGE,
      y: first.y + (X_RANGE - first.x) * slopeForDrawing,
    });
  }

  let runLabelOffset = second.y >= first.y ? 16 : -8;
  if (cornerPixel.pixelY + runLabelOffset > VIEW_HEIGHT - 4) runLabelOffset = -8;
  if (cornerPixel.pixelY + runLabelOffset < 12) runLabelOffset = 16;
  const riseLabelAnchor = second.x > X_RANGE / 2 ? "end" : "start";
  const riseLabelOffset = riseLabelAnchor === "end" ? -8 : 8;

  const runLabel = measurement ? measurement.run.toFixed(1) : "…";
  const riseLabel = measurement ? measurement.rise.toFixed(1) : "…";
  const slopeLabel = measurement
    ? measurement.slope === null
      ? "undefined"
      : measurement.slope.toFixed(2)
    : "…";

  const verticalMessage =
    measurement && measurement.slope === null
      ? "A vertical pair has no run to divide by, so the slope is undefined."
      : null;

  const gridLines: ReactElement[] = [];
  for (let gridValue = 0; gridValue <= X_RANGE; gridValue++) {
    gridLines.push(
      <line
        key={`vertical${gridValue}`}
        x1={gridValue * SCALE}
        y1={0}
        x2={gridValue * SCALE}
        y2={VIEW_HEIGHT}
        stroke="currentColor"
        className={
          gridValue === 0
            ? "text-slate-300 dark:text-slate-700"
            : "text-slate-200 dark:text-slate-800"
        }
        strokeWidth={gridValue === 0 ? 1.5 : 1}
      />,
    );
  }
  for (let gridValue = 0; gridValue <= Y_RANGE; gridValue++) {
    gridLines.push(
      <line
        key={`horizontal${gridValue}`}
        x1={0}
        y1={VIEW_HEIGHT - gridValue * SCALE}
        x2={VIEW_WIDTH}
        y2={VIEW_HEIGHT - gridValue * SCALE}
        stroke="currentColor"
        className={
          gridValue === 0
            ? "text-slate-300 dark:text-slate-700"
            : "text-slate-200 dark:text-slate-800"
        }
        strokeWidth={gridValue === 0 ? 1.5 : 1}
      />,
    );
  }

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="mx-auto w-full max-w-xs touch-none select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {gridLines}

        <line
          x1={lineStart.pixelX}
          y1={lineStart.pixelY}
          x2={lineEnd.pixelX}
          y2={lineEnd.pixelY}
          stroke="currentColor"
          className="text-indigo-500 dark:text-indigo-400"
          strokeWidth={2}
        />

        <line
          x1={firstPixel.pixelX}
          y1={firstPixel.pixelY}
          x2={cornerPixel.pixelX}
          y2={cornerPixel.pixelY}
          stroke="currentColor"
          className="text-amber-500 dark:text-amber-400"
          strokeWidth={2}
          strokeDasharray="5 4"
        />
        <line
          x1={cornerPixel.pixelX}
          y1={cornerPixel.pixelY}
          x2={secondPixel.pixelX}
          y2={secondPixel.pixelY}
          stroke="currentColor"
          className="text-emerald-500 dark:text-emerald-400"
          strokeWidth={2}
          strokeDasharray="5 4"
        />

        <text
          x={(firstPixel.pixelX + cornerPixel.pixelX) / 2}
          y={cornerPixel.pixelY + runLabelOffset}
          textAnchor="middle"
          className="fill-amber-600 text-sm font-semibold dark:fill-amber-400"
        >
          run {runLabel}
        </text>
        <text
          x={cornerPixel.pixelX + riseLabelOffset}
          y={(cornerPixel.pixelY + secondPixel.pixelY) / 2}
          textAnchor={riseLabelAnchor}
          className="fill-emerald-600 text-sm font-semibold dark:fill-emerald-400"
        >
          rise {riseLabel}
        </text>

        <circle
          cx={firstPixel.pixelX}
          cy={firstPixel.pixelY}
          r={9}
          className="cursor-grab fill-indigo-600 stroke-white dark:stroke-slate-900"
          strokeWidth={2}
          onPointerDown={onGrabFirst}
        />
        <circle
          cx={secondPixel.pixelX}
          cy={secondPixel.pixelY}
          r={9}
          className="cursor-grab fill-indigo-600 stroke-white dark:stroke-slate-900"
          strokeWidth={2}
          onPointerDown={onGrabSecond}
        />
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Drag either point and watch rise over run remeasure.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="Rise" value={riseLabel} />
        <Stat label="Run" value={runLabel} />
        <Stat label="Slope" value={slopeLabel} />
      </div>

      {(message ?? verticalMessage) && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message ?? verticalMessage}
        </p>
      )}
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
