"use client";

// A 2x2 matrix moving the whole plane.
//
// Type the four entries, or load a preset, and watch what the matrix does to a
// grid. The faint grid is the plane before, the darker one is the plane after,
// the two arrows are where the basis arrows land, which are exactly the columns
// of the matrix, and the shaded shape is what became of the unit square. When
// the matrix has directions it only stretches, they are drawn as dashed lines
// with their stretch factors in the readouts. Everything is computed by the API,
// not in the browser.

import { useEffect, useState } from "react";
import { ApiError, Matrix2x2, PlaneTransform, transformPlane } from "@/lib/api";

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

function px(x: number) {
  return HALF + x * SCALE;
}
function py(y: number) {
  return HALF - y * SCALE;
}

export function MatrixPlayground() {
  const [matrix, setMatrix] = useState<Matrix2x2>(WORKED);
  const [plane, setPlane] = useState<PlaneTransform | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setPlane(await transformPlane(matrix));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 90);
    return () => clearTimeout(timer);
  }, [matrix]);

  const setEntry = (key: keyof Matrix2x2) => (raw: string) => {
    const value = Number(raw);
    if (Number.isFinite(value) && Math.abs(value) <= 10) {
      setMatrix((current) => ({ ...current, [key]: value }));
    }
  };

  const originalGrid = [];
  for (let k = -RANGE; k <= RANGE; k++) {
    originalGrid.push(
      <line
        key={`v${k}`}
        x1={px(k)}
        y1={0}
        x2={px(k)}
        y2={VIEW}
        stroke="currentColor"
        className="text-slate-200 dark:text-slate-800"
        strokeWidth={1}
      />,
      <line
        key={`h${k}`}
        x1={0}
        y1={py(k)}
        x2={VIEW}
        y2={py(k)}
        stroke="currentColor"
        className="text-slate-200 dark:text-slate-800"
        strokeWidth={1}
      />,
    );
  }

  const squarePath = plane
    ? plane.unit_square
        .map((corner, index) => `${index === 0 ? "M" : "L"} ${px(corner.x)} ${py(corner.y)}`)
        .join(" ") + " Z"
    : "";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xl text-slate-400">[</span>
          <div className="grid grid-cols-2 gap-2">
            <MatrixEntry value={matrix.a} onChange={setEntry("a")} />
            <MatrixEntry value={matrix.b} onChange={setEntry("b")} />
            <MatrixEntry value={matrix.c} onChange={setEntry("c")} />
            <MatrixEntry value={matrix.d} onChange={setEntry("d")} />
          </div>
          <span className="font-mono text-2xl text-slate-400">]</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setMatrix(preset.matrix)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="mx-auto w-full max-w-md select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {originalGrid}

        {plane && (
          <>
            {/* the plane after: each grid line, moved */}
            {plane.grid_lines.map((segment, index) => (
              <line
                key={index}
                x1={px(segment.x1)}
                y1={py(segment.y1)}
                x2={px(segment.x2)}
                y2={py(segment.y2)}
                stroke="currentColor"
                className="text-indigo-300 dark:text-indigo-900"
                strokeWidth={1}
              />
            ))}

            {/* the unit square, after */}
            <path
              d={squarePath}
              className="fill-indigo-500/20 stroke-indigo-500"
              strokeWidth={1.5}
            />

            {/* the directions the matrix only stretches */}
            {plane.eigen.map((direction, index) => (
              <line
                key={`e${index}`}
                x1={px(-RANGE * direction.x)}
                y1={py(-RANGE * direction.y)}
                x2={px(RANGE * direction.x)}
                y2={py(RANGE * direction.y)}
                stroke="currentColor"
                className="text-emerald-500"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
            ))}

            {/* where the basis arrows land, the matrix's two columns */}
            <line
              x1={HALF}
              y1={HALF}
              x2={px(plane.basis_first.x)}
              y2={py(plane.basis_first.y)}
              stroke="currentColor"
              className="text-indigo-600 dark:text-indigo-400"
              strokeWidth={3}
            />
            <line
              x1={HALF}
              y1={HALF}
              x2={px(plane.basis_second.x)}
              y2={py(plane.basis_second.y)}
              stroke="currentColor"
              className="text-amber-500"
              strokeWidth={3}
            />
            <circle
              cx={px(plane.basis_first.x)}
              cy={py(plane.basis_first.y)}
              r={6}
              className="fill-indigo-600 stroke-white dark:stroke-slate-900"
              strokeWidth={1.5}
            />
            <circle
              cx={px(plane.basis_second.x)}
              cy={py(plane.basis_second.y)}
              r={6}
              className="fill-amber-500 stroke-white dark:stroke-slate-900"
              strokeWidth={1.5}
            />
          </>
        )}
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat
          label="First arrow (1, 0) lands at"
          value={
            plane
              ? `(${plane.basis_first.x.toFixed(1)}, ${plane.basis_first.y.toFixed(1)})`
              : "…"
          }
        />
        <Stat
          label="Second arrow (0, 1) lands at"
          value={
            plane
              ? `(${plane.basis_second.x.toFixed(1)}, ${plane.basis_second.y.toFixed(1)})`
              : "…"
          }
        />
        {plane &&
          plane.eigen.map((direction, index) => (
            <Stat
              key={index}
              label={`Kept direction ${index + 1}`}
              value={`×${direction.value.toFixed(2)} along (${direction.x.toFixed(2)}, ${direction.y.toFixed(2)})`}
            />
          ))}
        {plane && !plane.has_real_eigen && (
          <div className="col-span-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            This matrix turns every direction, so there is no direction it only
            stretches.
          </div>
        )}
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function MatrixEntry({
  value,
  onChange,
}: {
  value: number;
  onChange: (raw: string) => void;
}) {
  return (
    <input
      type="number"
      value={value}
      step={0.5}
      min={-10}
      max={10}
      onChange={(event) => onChange(event.target.value)}
      className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-center font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
    />
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
