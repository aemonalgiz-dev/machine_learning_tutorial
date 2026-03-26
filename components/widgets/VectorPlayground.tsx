"use client";

// Two arrows from the origin, and everything the primer measures on them.
//
// Drag either tip. The readouts show each arrow's length, the distance between
// the two tips, and the dot product, with a line of plain text saying what the
// dot product's sign and size mean about alignment. Every number is computed by
// the API, not in the browser.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, PlanePoint, VectorPair, measureVectors } from "@/lib/api";

const VIEW = 480;
const HALF = VIEW / 2;
const RANGE = 6; // the plane runs -6..6 in both directions
const SCALE = HALF / RANGE;

const START_FIRST: PlanePoint = { x: 3, y: 4 };
const START_SECOND: PlanePoint = { x: 4, y: 3 };

function toPixel(point: PlanePoint) {
  return { px: HALF + point.x * SCALE, py: HALF - point.y * SCALE };
}

function toPlane(px: number, py: number): PlanePoint {
  const snap = (value: number) =>
    Math.max(-RANGE, Math.min(RANGE, Math.round(value * 2) / 2));
  return { x: snap((px - HALF) / SCALE), y: snap((HALF - py) / SCALE) };
}

function alignmentText(pair: VectorPair): string {
  if (pair.cosine === null) {
    return "One arrow has no length, so alignment has no meaning here.";
  }
  if (pair.cosine > 0.9) {
    return "The arrows point almost the same way, so the dot product is large and positive.";
  }
  if (pair.cosine > 0.1) {
    return "The arrows lean the same way, so the dot product is positive.";
  }
  if (pair.cosine > -0.1) {
    return "The arrows are close to perpendicular, so the dot product is close to zero.";
  }
  return "The arrows point against each other, so the dot product is negative.";
}

export function VectorPlayground() {
  const [first, setFirst] = useState<PlanePoint>(START_FIRST);
  const [second, setSecond] = useState<PlanePoint>(START_SECOND);
  const [pair, setPair] = useState<VectorPair | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const dragging = useRef<"first" | "second" | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setPair(await measureVectors(first, second));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [first, second]);

  const pointerToPlane = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * VIEW;
    const py = ((clientY - rect.top) / rect.height) * VIEW;
    return toPlane(px, py);
  }, []);

  const grabFirst = (event: React.PointerEvent) => {
    event.stopPropagation();
    dragging.current = "first";
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const grabSecond = (event: React.PointerEvent) => {
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

  const gridLines = [];
  for (let k = -RANGE; k <= RANGE; k++) {
    const offset = HALF + k * SCALE;
    gridLines.push(
      <line
        key={`v${k}`}
        x1={offset}
        y1={0}
        x2={offset}
        y2={VIEW}
        stroke="currentColor"
        className={k === 0 ? "text-slate-300 dark:text-slate-700" : "text-slate-200 dark:text-slate-800"}
        strokeWidth={k === 0 ? 1.5 : 1}
      />,
      <line
        key={`h${k}`}
        x1={0}
        y1={offset}
        x2={VIEW}
        y2={offset}
        stroke="currentColor"
        className={k === 0 ? "text-slate-300 dark:text-slate-700" : "text-slate-200 dark:text-slate-800"}
        strokeWidth={k === 0 ? 1.5 : 1}
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
          x1={firstPixel.px}
          y1={firstPixel.py}
          x2={secondPixel.px}
          y2={secondPixel.py}
          stroke="currentColor"
          className="text-slate-400 dark:text-slate-600"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />

        <line
          x1={HALF}
          y1={HALF}
          x2={firstPixel.px}
          y2={firstPixel.py}
          stroke="currentColor"
          className="text-indigo-500"
          strokeWidth={2.5}
        />
        <line
          x1={HALF}
          y1={HALF}
          x2={secondPixel.px}
          y2={secondPixel.py}
          stroke="currentColor"
          className="text-amber-500"
          strokeWidth={2.5}
        />

        <circle
          cx={firstPixel.px}
          cy={firstPixel.py}
          r={9}
          className="cursor-grab fill-indigo-600 stroke-white dark:stroke-slate-900"
          strokeWidth={2}
          onPointerDown={grabFirst}
        />
        <circle
          cx={secondPixel.px}
          cy={secondPixel.py}
          r={9}
          className="cursor-grab fill-amber-500 stroke-white dark:stroke-slate-900"
          strokeWidth={2}
          onPointerDown={grabSecond}
        />

        <text
          x={firstPixel.px + 12}
          y={firstPixel.py - 8}
          className="fill-indigo-600 text-sm font-semibold dark:fill-indigo-400"
        >
          a ({first.x}, {first.y})
        </text>
        <text
          x={secondPixel.px + 12}
          y={secondPixel.py + 16}
          className="fill-amber-600 text-sm font-semibold dark:fill-amber-400"
        >
          b ({second.x}, {second.y})
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Drag either arrow tip. Coordinates snap to halves.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Length of a" value={pair ? pair.length_first.toFixed(2) : "…"} />
        <Stat label="Length of b" value={pair ? pair.length_second.toFixed(2) : "…"} />
        <Stat label="Distance a to b" value={pair ? pair.distance.toFixed(2) : "…"} />
        <Stat label="a · b" value={pair ? pair.dot.toFixed(2) : "…"} />
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {message ? message : pair ? alignmentText(pair) : "…"}
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
