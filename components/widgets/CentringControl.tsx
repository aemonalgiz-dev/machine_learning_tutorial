"use client";

// Three lines through three points, two of them right and one of them the
// mistake the library made and recorded.
//
// Ridge regression and kernel ridge under the linear kernel are the same fit,
// so their lines lie exactly on top of one another and both pass through the
// mean point, drawn as a ring. The third line centred the target and left the
// inputs alone, which is close enough to read as rounding on a casual glance
// and is wrong. Drag the penalty down toward nothing and watch the two right
// lines climb toward the slope the points really have while the third stays
// where it is. Every line comes from the library through the API.

import { useEffect, useState } from "react";
import {
  ApiError,
  CentringControl as CentringAnswer,
  KernelRidgePoint,
  fitCentringControl,
} from "@/lib/concepts/kernel-ridge";

const VIEW = { width: 640, height: 300 };
const PAD = { left: 48, right: 18, top: 14, bottom: 46 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const DEBOUNCE_MS = 140;

// The same three points the page works by hand, on the line y = 6x.
const WORKED_THREE: KernelRidgePoint[] = [
  { x: 1, y: 6 },
  { x: 2, y: 12 },
  { x: 3, y: 18 },
];

interface Bounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

function boundsOf(answer: CentringAnswer | null): Bounds {
  const xs = WORKED_THREE.map((point) => point.x);
  const ys = WORKED_THREE.map((point) => point.y);
  if (answer) {
    for (const line of [answer.ridge, answer.kernel_ridge, answer.target_only]) {
      for (const sample of line.curve) {
        xs.push(sample.x);
        ys.push(sample.y);
      }
    }
  }
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const yPad = 0.08 * (yMax - yMin || 1);
  return {
    xMin: Math.min(...xs),
    xMax: Math.max(...xs),
    yMin: yMin - yPad,
    yMax: yMax + yPad,
  };
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

export function CentringControl() {
  const [penalty, setPenalty] = useState(1);
  const [answer, setAnswer] = useState<CentringAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await fitCentringControl(WORKED_THREE, penalty));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [penalty]);

  const bounds = boundsOf(answer);
  const meanPixel = answer ? toPixel(answer.mean, bounds) : null;

  return (
    <div className="my-4">
      <label className="flex items-center gap-3 pb-2 text-sm text-slate-600 dark:text-slate-300">
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
          className="w-40 accent-indigo-600"
        />
        <span className="w-16 font-mono text-sm">{penalty.toPrecision(3)}</span>
      </label>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {answer && (
          <>
            <path
              d={pathOf(answer.ridge.curve, bounds)}
              fill="none"
              strokeWidth={6}
              className="stroke-slate-400 dark:stroke-slate-500"
            />
            <path
              d={pathOf(answer.kernel_ridge.curve, bounds)}
              fill="none"
              strokeWidth={2.5}
              className="stroke-indigo-600 dark:stroke-indigo-400"
            />
            <path
              d={pathOf(answer.target_only.curve, bounds)}
              fill="none"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              className="stroke-rose-500"
            />
            {meanPixel && (
              <circle
                cx={meanPixel.px}
                cy={meanPixel.py}
                r={7}
                fill="none"
                strokeWidth={2}
                className="stroke-amber-500"
              />
            )}
          </>
        )}
        {WORKED_THREE.map((point) => {
          const { px, py } = toPixel(point, bounds);
          return (
            <circle
              key={point.x}
              cx={px}
              cy={py}
              r={4}
              className="fill-slate-800 stroke-white dark:fill-slate-100 dark:stroke-slate-900"
              strokeWidth={1.5}
            />
          );
        })}
        <text
          x={PAD.left}
          y={VIEW.height - 26}
          className="fill-slate-500 text-xs dark:fill-slate-400"
        >
          grey and indigo, the two right fits · rose, the target centred alone ·
          ring, the mean point
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Ridge slope"
          value={answer ? answer.ridge.slope.toFixed(3) : "…"}
        />
        <Stat
          label="Kernel ridge slope"
          value={answer ? answer.kernel_ridge.slope.toFixed(3) : "…"}
        />
        <Stat
          label="Target centred alone"
          value={answer ? answer.target_only.slope.toFixed(3) : "…"}
        />
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        {answer
          ? `The two right fits answer ${answer.ridge.at_mean.toFixed(2)} at the mean point, where the target-only fit answers ${answer.target_only.at_mean.toFixed(2)}.`
          : "…"}
      </p>

      {message && (
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>
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
