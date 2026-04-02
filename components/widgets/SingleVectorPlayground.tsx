"use client";

// One arrow, and the right triangle hiding under it.
//
// Drag the tip. The arrow's shadow on the x axis is the east walk, drawn in
// amber, and the climb from the axis up to the tip is the north walk, drawn in
// emerald. Squaring each walk and adding gives the squared length, and its
// square root is the length of the arrow, which is Pythagoras doing the
// measuring. Every number comes from the API, not from the browser.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, PlanePoint, SingleVector, measureVector } from "@/lib/api";

const VIEW = 480;
const HALF = VIEW / 2;
const RANGE = 6; // the plane runs -6..6 in both directions
const SCALE = HALF / RANGE;

const START: PlanePoint = { x: 3, y: 4 };

function toPixel(point: PlanePoint) {
  return { pixelX: HALF + point.x * SCALE, pixelY: HALF - point.y * SCALE };
}

function toPlane(pixelX: number, pixelY: number): PlanePoint {
  const snap = (value: number) =>
    Math.max(-RANGE, Math.min(RANGE, Math.round(value * 2) / 2));
  return { x: snap((pixelX - HALF) / SCALE), y: snap((HALF - pixelY) / SCALE) };
}

export function SingleVectorPlayground() {
  const [vector, setVector] = useState<PlanePoint>(START);
  const [measure, setMeasure] = useState<SingleVector | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const dragging = useRef<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setMeasure(await measureVector(vector));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [vector]);

  const pointerToPlane = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const pixelX = ((clientX - rect.left) / rect.width) * VIEW;
    const pixelY = ((clientY - rect.top) / rect.height) * VIEW;
    return toPlane(pixelX, pixelY);
  }, []);

  const onTipPointerDown = (event: React.PointerEvent) => {
    event.stopPropagation();
    dragging.current = true;
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging.current) return;
    setVector(pointerToPlane(event.clientX, event.clientY));
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  const tipPixel = toPixel(vector);
  const footPixel = toPixel({ x: vector.x, y: 0 });

  const gridLines = [];
  for (let gridStep = -RANGE; gridStep <= RANGE; gridStep++) {
    const offset = HALF + gridStep * SCALE;
    gridLines.push(
      <line
        key={`v${gridStep}`}
        x1={offset}
        y1={0}
        x2={offset}
        y2={VIEW}
        stroke="currentColor"
        className={gridStep === 0 ? "text-slate-300 dark:text-slate-700" : "text-slate-200 dark:text-slate-800"}
        strokeWidth={gridStep === 0 ? 1.5 : 1}
      />,
      <line
        key={`h${gridStep}`}
        x1={0}
        y1={offset}
        x2={VIEW}
        y2={offset}
        stroke="currentColor"
        className={gridStep === 0 ? "text-slate-300 dark:text-slate-700" : "text-slate-200 dark:text-slate-800"}
        strokeWidth={gridStep === 0 ? 1.5 : 1}
      />,
    );
  }

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="mx-auto w-full max-w-md touch-none select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {gridLines}

        <line
          x1={HALF}
          y1={HALF}
          x2={footPixel.pixelX}
          y2={footPixel.pixelY}
          stroke="currentColor"
          className="text-amber-500"
          strokeWidth={2}
          strokeDasharray="4 3"
        />
        <line
          x1={footPixel.pixelX}
          y1={footPixel.pixelY}
          x2={tipPixel.pixelX}
          y2={tipPixel.pixelY}
          stroke="currentColor"
          className="text-emerald-500"
          strokeWidth={2}
          strokeDasharray="4 3"
        />

        <line
          x1={HALF}
          y1={HALF}
          x2={tipPixel.pixelX}
          y2={tipPixel.pixelY}
          stroke="currentColor"
          className="text-indigo-500"
          strokeWidth={2.5}
        />

        <circle
          cx={tipPixel.pixelX}
          cy={tipPixel.pixelY}
          r={9}
          className="cursor-grab fill-indigo-600 stroke-white dark:stroke-slate-900"
          strokeWidth={2}
          onPointerDown={onTipPointerDown}
        />

        <text
          x={(HALF + footPixel.pixelX) / 2}
          y={HALF + 16}
          textAnchor="middle"
          className="fill-amber-600 text-xs font-semibold dark:fill-amber-400"
        >
          east
        </text>
        <text
          x={footPixel.pixelX + 8}
          y={(footPixel.pixelY + tipPixel.pixelY) / 2}
          className="fill-emerald-600 text-xs font-semibold dark:fill-emerald-400"
        >
          north
        </text>
        <text
          x={tipPixel.pixelX + 12}
          y={tipPixel.pixelY - 8}
          className="fill-indigo-600 text-sm font-semibold dark:fill-indigo-400"
        >
          v ({vector.x}, {vector.y})
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Drag the tip and watch the two walks and the Pythagoras total remeasure.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="East" value={measure ? measure.east.toFixed(1) : "…"} />
        <Stat label="North" value={measure ? measure.north.toFixed(1) : "…"} />
        <Stat
          label="East² + north²"
          value={measure ? measure.length_squared.toFixed(1) : "…"}
        />
        <Stat label="Length" value={measure ? measure.length.toFixed(2) : "…"} />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
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
