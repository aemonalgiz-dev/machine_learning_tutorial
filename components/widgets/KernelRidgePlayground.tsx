"use client";

// One set of points, fitted twice.
//
// The bold curve is kernel ridge regression through whichever kernel is
// selected, and the faint straight line is ordinary ridge regression on the
// same points at the same penalty. Under the linear kernel the two lie exactly
// on top of one another, which is the control the page leans on; under every
// other kernel the bold curve bends and the faint line cannot. The dual
// weights underneath are one per point, and clicking a point shows what that
// row contributes. Every curve, every weight and every score comes from the
// library through the API, and the browser only scales numbers to pixels.

import { useEffect, useState } from "react";
import {
  ApiError,
  KernelChoice,
  KernelName,
  KernelRidgeFit,
  KernelRidgePoint,
  fitKernelRidge,
} from "@/lib/concepts/kernel-ridge";

const VIEW = { width: 640, height: 380 };
const PAD = { left: 52, right: 18, top: 16, bottom: 44 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const DEBOUNCE_MS = 140;

// Three points on the line y = 6x, whose ridge fit at penalty one has whole
// numbers throughout and whose dual weights are minus two, zero and two.
const WORKED_THREE: KernelRidgePoint[] = [
  { x: 1, y: 6 },
  { x: 2, y: 12 },
  { x: 3, y: 18 },
];

// The polynomial page's thrown ball, which no straight line can follow.
const THROWN_BALL: KernelRidgePoint[] = [
  { x: 0.0, y: 0.7 },
  { x: 0.29, y: 5.2 },
  { x: 0.57, y: 9.5 },
  { x: 0.86, y: 13.0 },
  { x: 1.14, y: 16.9 },
  { x: 1.43, y: 18.1 },
  { x: 1.71, y: 19.4 },
  { x: 2.0, y: 21.0 },
  { x: 2.29, y: 19.6 },
  { x: 2.57, y: 19.1 },
  { x: 2.86, y: 16.8 },
  { x: 3.14, y: 13.6 },
  { x: 3.43, y: 11.1 },
  { x: 3.71, y: 6.2 },
  { x: 4.0, y: 1.2 },
];

const KERNEL_TITLES: Record<KernelName, string> = {
  linear: "Linear",
  polynomial: "Polynomial",
  rbf: "Radial basis",
  sigmoid: "Sigmoid",
};

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const ACTIVE_CLASS =
  "rounded-md border border-indigo-400 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-600 dark:bg-indigo-950 dark:text-indigo-300";

interface Bounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

// The drawn window covers the points and both curves, with a little room, so
// a radial curve drifting back toward the mean past the data stays visible.
function boundsOf(points: KernelRidgePoint[], answer: KernelRidgeFit | null): Bounds {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  if (answer) {
    for (const sample of [...answer.curve, ...answer.ridge_curve]) {
      xs.push(sample.x);
      ys.push(sample.y);
    }
  }
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const yPad = 0.08 * (yMax - yMin || 1);
  return { xMin, xMax, yMin: yMin - yPad, yMax: yMax + yPad };
}

function toPixel(point: KernelRidgePoint, bounds: Bounds) {
  const spanX = bounds.xMax - bounds.xMin || 1;
  const spanY = bounds.yMax - bounds.yMin || 1;
  return {
    px: PAD.left + ((point.x - bounds.xMin) / spanX) * PLOT.width,
    py: PAD.top + (1 - (point.y - bounds.yMin) / spanY) * PLOT.height,
  };
}

function pathOf(samples: KernelRidgePoint[], bounds: Bounds): string {
  return samples
    .map((sample, index) => {
      const { px, py } = toPixel(sample, bounds);
      return `${index === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(" ");
}

export function KernelRidgePlayground() {
  const [points, setPoints] = useState<KernelRidgePoint[]>(WORKED_THREE);
  const [kernelName, setKernelName] = useState<KernelName>("linear");
  const [degree, setDegree] = useState(2);
  const [gamma, setGamma] = useState(1);
  const [constant, setConstant] = useState(0);
  const [penalty, setPenalty] = useState(1);
  const [queryX, setQueryX] = useState(2.5);
  const [answer, setAnswer] = useState<KernelRidgeFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const kernel: KernelChoice =
    kernelName === "linear"
      ? { name: "linear" }
      : kernelName === "polynomial"
        ? { name: "polynomial", degree }
        : kernelName === "rbf"
          ? { name: "rbf", gamma }
          : { name: "sigmoid", gamma, constant };

  const key = JSON.stringify({ points, kernel, penalty, queryX });

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await fitKernelRidge(points, kernel, penalty, queryX));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // The request is a pure function of the key, so the key is the one
    // dependency that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const bounds = boundsOf(points, answer);
  const coincide = answer !== null && answer.largest_gap < 1e-9;

  const loadPoints = (next: KernelRidgePoint[], query: number) => {
    setPoints(next);
    setQueryX(query);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => loadPoints(WORKED_THREE, 2.5)}
          className={points === WORKED_THREE ? ACTIVE_CLASS : BUTTON_CLASS}
        >
          Three points
        </button>
        <button
          onClick={() => loadPoints(THROWN_BALL, 2.0)}
          className={points === THROWN_BALL ? ACTIVE_CLASS : BUTTON_CLASS}
        >
          The thrown ball
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 pb-3">
        {(Object.keys(KERNEL_TITLES) as KernelName[]).map((name) => (
          <button
            key={name}
            onClick={() => setKernelName(name)}
            className={name === kernelName ? ACTIVE_CLASS : BUTTON_CLASS}
          >
            {KERNEL_TITLES[name]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          penalty
          <input
            type="range"
            min={-3}
            max={2}
            step={0.25}
            value={Math.log10(penalty)}
            onChange={(event) =>
              setPenalty(Number(10 ** Number(event.target.value)))
            }
            className="w-32 accent-indigo-600"
          />
          <span className="w-16 font-mono text-sm">{penalty.toPrecision(3)}</span>
        </label>
        {kernelName === "polynomial" && (
          <label className="flex items-center gap-2">
            degree
            <input
              type="range"
              min={1}
              max={6}
              step={1}
              value={degree}
              onChange={(event) => setDegree(Number(event.target.value))}
              className="w-24 accent-emerald-600"
            />
            <span className="w-4 font-mono text-sm">{degree}</span>
          </label>
        )}
        {(kernelName === "rbf" || kernelName === "sigmoid") && (
          <label className="flex items-center gap-2">
            gamma
            <input
              type="range"
              min={0.1}
              max={5}
              step={0.1}
              value={gamma}
              onChange={(event) => setGamma(Number(event.target.value))}
              className="w-24 accent-emerald-600"
            />
            <span className="w-8 font-mono text-sm">{gamma.toFixed(1)}</span>
          </label>
        )}
        {kernelName === "sigmoid" && (
          <label className="flex items-center gap-2">
            constant
            <input
              type="range"
              min={-2}
              max={2}
              step={0.5}
              value={constant}
              onChange={(event) => setConstant(Number(event.target.value))}
              className="w-24 accent-emerald-600"
            />
            <span className="w-8 font-mono text-sm">{constant.toFixed(1)}</span>
          </label>
        )}
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {answer && (
          <>
            <path
              d={pathOf(answer.ridge_curve, bounds)}
              fill="none"
              strokeWidth={coincide ? 6 : 2}
              strokeDasharray={coincide ? undefined : "6 4"}
              className="stroke-slate-400 dark:stroke-slate-500"
            />
            <path
              d={pathOf(answer.curve, bounds)}
              fill="none"
              strokeWidth={2.5}
              className="stroke-indigo-600 dark:stroke-indigo-400"
            />
          </>
        )}
        {points.map((point) => {
          const { px, py } = toPixel(point, bounds);
          return (
            <circle
              key={`${point.x},${point.y}`}
              cx={px}
              cy={py}
              r={4}
              className="fill-slate-800 stroke-white dark:fill-slate-100 dark:stroke-slate-900"
              strokeWidth={1.5}
            />
          );
        })}
        {answer && (
          <line
            x1={toPixel({ x: queryX, y: bounds.yMin }, bounds).px}
            y1={PAD.top}
            x2={toPixel({ x: queryX, y: bounds.yMin }, bounds).px}
            y2={PAD.top + PLOT.height}
            className="stroke-amber-500"
            strokeDasharray="3 3"
            strokeWidth={1.5}
          />
        )}
        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 8}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          The bold curve is the kernel fit, the grey one ordinary ridge
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Kernel fit R²"
          value={answer ? answer.r_squared.toFixed(3) : "…"}
        />
        <Stat
          label="Ridge line R²"
          value={answer ? answer.ridge_r_squared.toFixed(3) : "…"}
        />
        <Stat
          label={`Kernel at x = ${queryX}`}
          value={answer ? answer.prediction_at_query.toFixed(3) : "…"}
        />
        <Stat
          label={`Ridge at x = ${queryX}`}
          value={answer ? answer.ridge_at_query.toFixed(3) : "…"}
        />
      </div>

      <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-500">
        {coincide
          ? "The two fits coincide at every sample, which is what the linear kernel means."
          : `The two fits differ by up to ${answer ? answer.largest_gap.toFixed(3) : "…"} across the drawn range.`}
      </p>

      {answer && (
        <div className="mt-3">
          <div className="mb-1 text-xs text-slate-500 dark:text-slate-400">
            Dual weights, one per point
            {answer.implied_slope !== null
              ? `, implying a slope of ${answer.implied_slope.toFixed(3)}`
              : ", with no slope to imply"}
          </div>
          <div className="flex flex-wrap gap-1 font-mono text-xs">
            {answer.dual_weights.map((weight, index) => (
              <span
                key={index}
                className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {weight.toFixed(3)}
              </span>
            ))}
          </div>
        </div>
      )}

      {message && (
        <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{message}</p>
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
