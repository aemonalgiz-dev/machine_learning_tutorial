"use client";

// One classifier, three readings of similarity, and the boundary that follows.
//
// The patients are placed by temperature and heart rate, the healthy in a band
// of ordinary vitals with the unwell on every side of them. The machinery
// underneath never changes. The kernel buttons only swap which inner product
// it reads the data through, the shaded regions show the boundary each
// reading produces, and the ringed patients are the support vectors, the
// rows the boundary actually depends on. The reach slider is the radial
// kernel's gamma and the capacity buttons are the price of a margin
// violation. Every fit is the library's through the API, not the browser's.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  ClassifyAnswer,
  KernelChoice,
  LabelledPoint,
  classifyClinic,
} from "@/lib/concepts/kernel-trick";
import { CLINIC, DOMAIN, FEVER_ONLY, randomClinic } from "./kernelTrickFixtures";

const VIEW = { width: 640, height: 460 };
const PAD = { left: 56, right: 16, top: 16, bottom: 50 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};
const MAX_POINTS = 100;
const GAMMA_STEPS = [0.03, 0.1, 0.3, 1, 3, 10, 30, 100];
const CAPACITIES = [0.1, 1, 10, 100];

type KernelName = "linear" | "polynomial" | "rbf";

const KERNELS: { key: KernelName; label: string }[] = [
  { key: "linear", label: "Linear" },
  { key: "polynomial", label: "Squared" },
  { key: "rbf", label: "Radial" },
];

function choiceFor(name: KernelName, gamma: number): KernelChoice {
  if (name === "linear") return { name: "linear" };
  if (name === "polynomial") return { name: "polynomial", degree: 2, constant: 1 };
  return { name: "rbf", gamma };
}

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

function statusText(answer: ClassifyAnswer | null, kernel: KernelName): string {
  if (!answer) return "…";
  if (kernel === "linear" && answer.fit.accuracy < 0.9) {
    return "A straight boundary cannot wrap around anyone, so the best it can do is give up one side of the unwell.";
  }
  if (kernel === "linear") {
    return "A straight boundary suffices for this data, and no kernel was needed.";
  }
  if (answer.fit.support_share >= 0.999) {
    return "Every patient is a support vector, which is the fit keeping one island per row rather than finding a shape.";
  }
  return "The machinery is unchanged, only its reading of similarity was swapped, and the boundary now closes.";
}

export function KernelPlayground() {
  const [points, setPoints] = useState<LabelledPoint[]>(CLINIC);
  const [kernel, setKernel] = useState<KernelName>("linear");
  const [gammaIndex, setGammaIndex] = useState(3);
  const [capacity, setCapacity] = useState(1);
  const [addClass, setAddClass] = useState(0);
  const [answer, setAnswer] = useState<ClassifyAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | null>(null);
  const gamma = GAMMA_STEPS[gammaIndex];

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await classifyClinic(points, choiceFor(kernel, gamma), capacity));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [points, kernel, gamma, capacity]);

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
  const support = new Set(answer?.fit.support_positions ?? []);

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

  const buttonClass =
    "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";
  const toggleClass = (active: boolean) =>
    "rounded px-3 py-1 text-sm font-medium transition " +
    (active
      ? "bg-indigo-600 text-white"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button onClick={() => setPoints(CLINIC)} className={buttonClass}>
          The clinic
        </button>
        <button onClick={() => setPoints(FEVER_ONLY)} className={buttonClass}>
          An Ideal Case
        </button>
        <button onClick={() => setPoints(randomClinic())} className={buttonClass}>
          Random clinic
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
              className={toggleClass(kernel === option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className={"flex flex-1 items-center gap-2 " + (kernel === "rbf" ? "" : "opacity-40")}>
          reach, gamma
          <input
            type="range"
            min={0}
            max={GAMMA_STEPS.length - 1}
            step={1}
            value={gammaIndex}
            disabled={kernel !== "rbf"}
            onChange={(event) => setGammaIndex(Number(event.target.value))}
            className="flex-1 accent-indigo-600"
          />
          <span className="w-10 text-right font-mono">{gamma}</span>
        </label>
        <span className="flex items-center gap-2">
          capacity
          <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
            {CAPACITIES.map((option) => (
              <button
                key={option}
                onClick={() => setCapacity(option)}
                className={
                  "rounded px-2 py-0.5 text-xs font-medium transition " +
                  (capacity === option
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
                }
              >
                {option}
              </button>
            ))}
          </span>
        </span>
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
            <g key={index}>
              {support.has(index) && (
                <circle
                  cx={px}
                  cy={py}
                  r={10}
                  fill="none"
                  className="stroke-emerald-500"
                  strokeWidth={2}
                />
              )}
              <circle
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
            </g>
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
        Indigo is healthy, amber is unwell, and a green ring marks a support
        vector. The shading is the fitted boundary&rsquo;s answer at every
        spot. Click to add a patient, drag to move one, double-click to remove.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Training accuracy"
          value={answer ? answer.fit.accuracy.toFixed(3) : "…"}
        />
        <Stat
          label="Held out, on a second clinic"
          value={answer ? answer.held_out_accuracy.toFixed(3) : "…"}
        />
        <Stat
          label="Support vectors"
          value={
            answer
              ? `${answer.fit.n_support_vectors} of ${points.length}`
              : "…"
          }
        />
        <Stat
          label="Ascent steps"
          value={
            answer
              ? `${answer.fit.epochs_run}${answer.fit.converged ? "" : ", at the ceiling"}`
              : "…"
          }
        />
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
