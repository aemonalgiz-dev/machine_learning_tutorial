"use client";

// Hunt for the directions a matrix only stretches.
//
// The indigo arrow is yours to drag. The amber arrow is where the matrix sends
// it. Off the dashed lines the image points a different way, because the matrix
// turned the arrow. Sweep the arrow onto a dashed line and the two arrows fall
// into line, the readout switches to the stretch factor, and you are standing on
// an eigen direction. The presets swap the matrix, and under the rotation no
// direction ever lines up. Every arrow is the API's, not the browser's.

import { useCallback, useEffect, useRef, useState } from "react";
import { AppliedVector, Matrix2x2, PlanePoint, applyMatrix } from "@/lib/api";

const VIEW = 480;
const HALF = VIEW / 2;
const RANGE = 6;
const SCALE = HALF / RANGE;

const WORKED: Matrix2x2 = { a: 2, b: 1, c: 1, d: 2 };

const PRESETS: { label: string; matrix: Matrix2x2 }[] = [
  { label: "The worked matrix", matrix: WORKED },
  { label: "Stretch", matrix: { a: 2, b: 0, c: 0, d: 0.5 } },
  { label: "Shear", matrix: { a: 1, b: 1, c: 0, d: 1 } },
  { label: "Rotation", matrix: { a: 0, b: -1, c: 1, d: 0 } },
];

const START_VECTOR: PlanePoint = { x: 2, y: 0 };

function toPixel(point: PlanePoint) {
  return { px: HALF + point.x * SCALE, py: HALF - point.y * SCALE };
}

function statusText(applied: AppliedVector, vector: PlanePoint): string {
  if (vector.x === 0 && vector.y === 0) {
    return "Drag the arrow away from the origin so there is a direction to test.";
  }
  if (applied.aligned && applied.factor !== null) {
    return `The arrows line up. This direction is only stretched, by ${applied.factor.toFixed(2)}, so it is an eigen direction.`;
  }
  if (applied.angle_degrees !== null && applied.angle_degrees < 8) {
    return "Very close. The image is nearly in line with your arrow, so a kept direction is a nudge away.";
  }
  return "The image points a different way. The matrix turned this arrow, so this is not a kept direction.";
}

export function EigenPlayground() {
  const [matrix, setMatrix] = useState<Matrix2x2>(WORKED);
  const [vector, setVector] = useState<PlanePoint>(START_VECTOR);
  const [applied, setApplied] = useState<AppliedVector | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const dragging = useRef(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setApplied(await applyMatrix(matrix, vector));
        setMessage(null);
      } catch (error) {
        setMessage(
          error instanceof Error && error.name === "ApiError"
            ? error.message
            : "Something went wrong.",
        );
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [matrix, vector]);

  const pointerToPlane = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * VIEW;
    const py = ((clientY - rect.top) / rect.height) * VIEW;
    const snap = (value: number) =>
      Math.max(-RANGE, Math.min(RANGE, Math.round(value * 2) / 2));
    return { x: snap((px - HALF) / SCALE), y: snap((HALF - py) / SCALE) };
  }, []);

  const onPointerDown = (event: React.PointerEvent) => {
    dragging.current = true;
    setVector(pointerToPlane(event.clientX, event.clientY));
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging.current) return;
    setVector(pointerToPlane(event.clientX, event.clientY));
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  const vectorPixel = toPixel(vector);
  const imagePixel = applied ? toPixel(applied.image) : null;

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
      <div className="flex flex-wrap gap-2 pb-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setMatrix(preset.matrix)}
            className={
              "rounded-md border px-3 py-1.5 text-sm font-medium transition " +
              (matrix.a === preset.matrix.a &&
              matrix.b === preset.matrix.b &&
              matrix.c === preset.matrix.c &&
              matrix.d === preset.matrix.d
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700")
            }
          >
            {preset.label}
          </button>
        ))}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="mx-auto w-full max-w-md cursor-crosshair touch-none select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {gridLines}

        {/* the kept directions, if the matrix has any */}
        {applied?.eigen.map((direction, index) => (
          <line
            key={index}
            x1={toPixel({ x: -RANGE * direction.x, y: -RANGE * direction.y }).px}
            y1={toPixel({ x: -RANGE * direction.x, y: -RANGE * direction.y }).py}
            x2={toPixel({ x: RANGE * direction.x, y: RANGE * direction.y }).px}
            y2={toPixel({ x: RANGE * direction.x, y: RANGE * direction.y }).py}
            stroke="currentColor"
            className="text-emerald-500"
            strokeWidth={2}
            strokeDasharray="6 4"
          />
        ))}

        {/* the image, where the matrix sends the arrow */}
        {imagePixel && (
          <>
            <line
              x1={HALF}
              y1={HALF}
              x2={imagePixel.px}
              y2={imagePixel.py}
              stroke="currentColor"
              className="text-amber-500"
              strokeWidth={2.5}
            />
            <circle
              cx={imagePixel.px}
              cy={imagePixel.py}
              r={6}
              className="fill-amber-500 stroke-white dark:stroke-slate-900"
              strokeWidth={1.5}
            />
          </>
        )}

        {/* the arrow being tested */}
        <line
          x1={HALF}
          y1={HALF}
          x2={vectorPixel.px}
          y2={vectorPixel.py}
          stroke="currentColor"
          className="text-indigo-600 dark:text-indigo-400"
          strokeWidth={2.5}
        />
        <circle
          cx={vectorPixel.px}
          cy={vectorPixel.py}
          r={9}
          className="cursor-grab fill-indigo-600 stroke-white dark:stroke-slate-900"
          strokeWidth={2}
        />
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Drag the indigo arrow. The amber arrow is where the matrix sends it.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Your arrow v" value={`(${vector.x}, ${vector.y})`} />
        <Stat
          label="Its image Av"
          value={
            applied
              ? `(${applied.image.x.toFixed(1)}, ${applied.image.y.toFixed(1)})`
              : "…"
          }
        />
        <Stat
          label="Turn between them"
          value={
            applied && applied.angle_degrees !== null
              ? `${applied.angle_degrees.toFixed(1)}°`
              : "…"
          }
        />
        <Stat
          label="Stretch factor"
          value={
            applied && applied.aligned && applied.factor !== null
              ? `×${applied.factor.toFixed(2)}`
              : "…"
          }
        />
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {message ? message : applied ? statusText(applied, vector) : "…"}
      </p>
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
