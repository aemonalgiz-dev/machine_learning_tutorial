"use client";

// One classifier, three readings of similarity, and the boundary that follows.
//
// The patients are placed by temperature and heart rate, the healthy in a band
// of ordinary vitals with the unwell on every side of them. The machinery
// underneath never changes. The kernel buttons only swap which inner product
// it reads the data through, and the shaded regions show the boundary each
// reading produces, a straight cut under the linear kernel and a closed curve
// once the kernel carries the data somewhere roomier. Every fit is the
// library's through the API, not the browser's.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  KernelAnswer,
  KernelChoice,
  LabelledPoint,
  classifyWithKernel,
} from "@/lib/api";

const DOMAIN = { xMin: 35, xMax: 41, yMin: 40, yMax: 140 };
const VIEW = { width: 640, height: 460 };
const PAD = { left: 56, right: 16, top: 16, bottom: 50 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

// The clinic. Healthy vitals sit in a middle band, and the unwell surround
// them, feverish, hypothermic, racing and slow all at once.
const CLINIC: LabelledPoint[] = [
  { x: 36.6, y: 68, label: 1 },
  { x: 36.8, y: 74, label: 1 },
  { x: 37.0, y: 70, label: 1 },
  { x: 37.2, y: 78, label: 1 },
  { x: 36.9, y: 64, label: 1 },
  { x: 37.1, y: 84, label: 1 },
  { x: 36.7, y: 80, label: 1 },
  { x: 37.3, y: 72, label: 1 },
  { x: 36.5, y: 76, label: 1 },
  { x: 37.0, y: 88, label: 1 },
  { x: 35.2, y: 48, label: 0 },
  { x: 35.5, y: 120, label: 0 },
  { x: 36.0, y: 130, label: 0 },
  { x: 38.9, y: 132, label: 0 },
  { x: 39.5, y: 120, label: 0 },
  { x: 40.2, y: 110, label: 0 },
  { x: 39.8, y: 66, label: 0 },
  { x: 40.5, y: 90, label: 0 },
  { x: 35.4, y: 90, label: 0 },
  { x: 38.8, y: 50, label: 0 },
  { x: 35.8, y: 58, label: 0 },
  { x: 39.9, y: 140, label: 0 },
  { x: 35.1, y: 72, label: 0 },
  { x: 38.5, y: 44, label: 0 },
];

// A clinic a straight line can handle, everyone unwell running a fever.
const FEVER_ONLY: LabelledPoint[] = [
  ...CLINIC.filter((point) => point.label === 1),
  { x: 38.9, y: 132, label: 0 },
  { x: 39.5, y: 120, label: 0 },
  { x: 40.2, y: 110, label: 0 },
  { x: 39.8, y: 96, label: 0 },
  { x: 40.5, y: 90, label: 0 },
  { x: 39.2, y: 118, label: 0 },
  { x: 39.9, y: 140, label: 0 },
  { x: 38.6, y: 104, label: 0 },
];

const MAX_POINTS = 100;

const KERNELS: { key: KernelChoice; label: string }[] = [
  { key: "linear", label: "Linear" },
  { key: "polynomial", label: "Squared" },
  { key: "rbf", label: "Radial" },
];

function toPixel(point: { x: number; y: number }) {
  const px =
    PAD.left +
    ((point.x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
  const py =
    PAD.top +
    (1 - (point.y - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height;
  return { px, py };
}

function toData(px: number, py: number) {
  const clampRound = (value: number, low: number, high: number, step: number) =>
    Math.min(high, Math.max(low, Math.round(value / step) * step));
  return {
    x: clampRound(
      DOMAIN.xMin + ((px - PAD.left) / PLOT.width) * (DOMAIN.xMax - DOMAIN.xMin),
      DOMAIN.xMin,
      DOMAIN.xMax,
      0.1,
    ),
    y: clampRound(
      DOMAIN.yMin +
        (1 - (py - PAD.top) / PLOT.height) * (DOMAIN.yMax - DOMAIN.yMin),
      DOMAIN.yMin,
      DOMAIN.yMax,
      1,
    ),
  };
}

function statusText(answer: KernelAnswer | null, kernel: KernelChoice): string {
  if (!answer) return "…";
  if (kernel === "linear" && answer.accuracy < 0.9) {
    return "A straight boundary cannot wrap around anyone, so the best it can do is give up one side of the unwell.";
  }
  if (kernel === "linear") {
    return "A straight boundary suffices for this data, and no kernel was needed.";
  }
  return "The machinery is unchanged, only its reading of similarity was swapped, and the boundary now closes.";
}

export function KernelPlayground() {
  const [points, setPoints] = useState<LabelledPoint[]>(CLINIC);
  const [kernel, setKernel] = useState<KernelChoice>("linear");
  const [addClass, setAddClass] = useState(0);
  const [answer, setAnswer] = useState<KernelAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await classifyWithKernel(points, kernel));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [points, kernel]);

  const eventToData = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * VIEW.width;
    const py = ((clientY - rect.top) / rect.height) * VIEW.height;
    return toData(px, py);
  }, []);

  const onBackgroundPointerDown = (event: React.PointerEvent) => {
    if (dragging.current !== null) return;
    if (points.length >= MAX_POINTS) return;
    const dropped = eventToData(event.clientX, event.clientY);
    setPoints((current) => [...current, { ...dropped, label: addClass }]);
    dragging.current = points.length;
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointPointerDown = (index: number) => (event: React.PointerEvent) => {
    event.stopPropagation();
    dragging.current = index;
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (dragging.current === null) return;
    const moved = eventToData(event.clientX, event.clientY);
    const index = dragging.current;
    setPoints((current) =>
      current.map((point, i) => (i === index ? { ...point, ...moved } : point)),
    );
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  const removePoint = (index: number) => (event: React.MouseEvent) => {
    event.stopPropagation();
    if (points.length <= 2) return;
    setPoints((current) => current.filter((_, i) => i !== index));
  };

  const regions = answer?.regions;
  const cellWidth = regions ? PLOT.width / regions.cells : 0;
  const cellHeight = regions ? PLOT.height / regions.cells : 0;

  const regionPixel = (column: number, row: number) => {
    if (!regions) return { px: 0, py: 0 };
    const x =
      regions.x_min +
      ((column + 0.5) / regions.cells) * (regions.x_max - regions.x_min);
    const y =
      regions.y_min +
      ((row + 0.5) / regions.cells) * (regions.y_max - regions.y_min);
    return toPixel({ x, y });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => setPoints(CLINIC)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          The clinic
        </button>
        <button
          onClick={() => setPoints(FEVER_ONLY)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Fevers only
        </button>
        <div className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {[
            { label: "Add unwell", value: 0 },
            { label: "Add healthy", value: 1 },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setAddClass(option.value)}
              className={
                "rounded px-3 py-1 text-sm font-medium transition " +
                (addClass === option.value
                  ? option.value === 0
                    ? "bg-amber-500 text-white"
                    : "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {KERNELS.map((option) => (
            <button
              key={option.key}
              onClick={() => setKernel(option.key)}
              className={
                "rounded px-3 py-1 text-sm font-medium transition " +
                (kernel === option.key
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full touch-none select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        onPointerDown={onBackgroundPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {regions?.labels.map((row, rowIndex) =>
          row.map((label, columnIndex) => {
            const { px, py } = regionPixel(columnIndex, rowIndex);
            return (
              <rect
                key={`${rowIndex}-${columnIndex}`}
                x={px - cellWidth / 2}
                y={py - cellHeight / 2}
                width={cellWidth + 0.5}
                height={cellHeight + 0.5}
                className={
                  label === 1 ? "fill-indigo-500/15" : "fill-amber-500/15"
                }
              />
            );
          }),
        )}

        {points.map((point, index) => {
          const { px, py } = toPixel(point);
          return (
            <circle
              key={index}
              cx={px}
              cy={py}
              r={6}
              className={
                point.label === 1
                  ? "cursor-grab fill-indigo-600 stroke-white dark:stroke-slate-900"
                  : "cursor-grab fill-amber-500 stroke-white dark:stroke-slate-900"
              }
              strokeWidth={1.5}
              onPointerDown={onPointPointerDown(index)}
              onDoubleClick={removePoint(index)}
            />
          );
        })}

        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Temperature (°C)
        </text>
        <text
          x={16}
          y={PAD.top + PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 16 ${PAD.top + PLOT.height / 2})`}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Heart rate (bpm)
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Indigo is healthy, amber is unwell. The shading is the fitted
        boundary&rsquo;s answer at every spot.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat
          label="Kernel"
          value={KERNELS.find((each) => each.key === kernel)?.label ?? "…"}
        />
        <Stat label="Accuracy" value={answer ? answer.accuracy.toFixed(3) : "…"} />
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {message ? message : statusText(answer, kernel)}
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
