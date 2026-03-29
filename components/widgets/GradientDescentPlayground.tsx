"use client";

// Watch gradient descent walk down a curve.
//
// Pick a curve, pick where to start, and set the learning rate. The dots are the
// steps the walk takes: each one reads the slope where it stands and moves
// against it, so it slides toward the bottom where the slope is zero. Turn the
// rate up far enough and the steps overshoot the floor and climb the far wall,
// and the walk runs away. Every descent here is computed by the API, not in the
// browser.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  Descent,
  DescentFunction,
  DescentWindow,
  runGradientDescent,
} from "@/lib/api";

const VIEW = { width: 640, height: 440 };
const PAD = { left: 52, right: 20, top: 20, bottom: 44 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const FUNCTIONS: { key: DescentFunction; label: string }[] = [
  { key: "bowl", label: "One bowl" },
  { key: "valley", label: "Two valleys" },
];

// A sensible starting point for each curve: up a wall, so there is a walk to
// watch rather than an immediate stop at the bottom.
const DEFAULT_START: Record<DescentFunction, number> = { bowl: 5, valley: -3.2 };

const OUTCOME_TEXT: Record<Descent["outcome"], string> = {
  converged: "Settled at the bottom, where the slope is zero.",
  step_limit_reached: "Still moving when it ran out of steps.",
  diverged: "The step was too large: it overshot and ran away.",
};

function projectX(window: DescentWindow, x: number): number {
  return (
    PAD.left +
    ((x - window.x_min) / (window.x_max - window.x_min)) * PLOT.width
  );
}

function projectY(window: DescentWindow, y: number): number {
  return (
    PAD.top +
    (1 - (y - window.y_min) / (window.y_max - window.y_min)) * PLOT.height
  );
}

function unprojectX(window: DescentWindow, px: number): number {
  return window.x_min + ((px - PAD.left) / PLOT.width) * (window.x_max - window.x_min);
}

export function GradientDescentPlayground() {
  const [functionKey, setFunctionKey] = useState<DescentFunction>("bowl");
  const [learningRate, setLearningRate] = useState(0.3);
  const [start, setStart] = useState<number>(DEFAULT_START.bowl);
  const [descent, setDescent] = useState<Descent | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setDescent(
          await runGradientDescent({
            function: functionKey,
            start,
            learning_rate: learningRate,
          }),
        );
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong computing the walk.");
      }
    }, 90);
    return () => clearTimeout(timer);
  }, [functionKey, start, learningRate]);

  const chooseFunction = (key: DescentFunction) => {
    setFunctionKey(key);
    setStart(DEFAULT_START[key]);
  };

  const onSvgClick = useCallback(
    (event: React.PointerEvent) => {
      if (!descent) return;
      const svg = svgRef.current!;
      const rect = svg.getBoundingClientRect();
      const px = ((event.clientX - rect.left) / rect.width) * VIEW.width;
      const clicked = unprojectX(descent.window, px);
      const clamped = Math.min(
        descent.window.x_max,
        Math.max(descent.window.x_min, clicked),
      );
      setStart(Math.round(clamped * 100) / 100);
    },
    [descent],
  );

  const window = descent?.window;

  const curvePath = descent
    ? descent.curve
        .map(
          (point, index) =>
            `${index === 0 ? "M" : "L"} ${projectX(descent.window, point.x).toFixed(2)} ${projectY(descent.window, point.y).toFixed(2)}`,
        )
        .join(" ")
    : "";

  // The tangent at the first step, drawn short, so the "slope is the derivative"
  // claim is something you can see rather than take on faith.
  const tangent =
    descent && descent.path.length > 0 && window
      ? (() => {
          const first = descent.path[0];
          const reach = 0.14 * (window.x_max - window.x_min);
          const leftX = first.x - reach;
          const rightX = first.x + reach;
          return {
            x1: projectX(window, leftX),
            y1: projectY(window, first.y - first.slope * reach),
            x2: projectX(window, rightX),
            y2: projectY(window, first.y + first.slope * reach),
          };
        })()
      : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <div className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {FUNCTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => chooseFunction(option.key)}
              className={
                "rounded px-3 py-1 text-sm font-medium transition " +
                (functionKey === option.key
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          Learning rate
          <input
            type="range"
            min={0.05}
            max={3}
            step={0.05}
            value={learningRate}
            onChange={(event) => setLearningRate(Number(event.target.value))}
            className="w-40 accent-indigo-600"
          />
          <span className="w-10 font-mono text-sm">{learningRate.toFixed(2)}</span>
        </label>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full cursor-crosshair touch-none select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        onPointerDown={onSvgClick}
      >
        {window && (
          <>
            {/* the curve */}
            <path
              d={curvePath}
              fill="none"
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              strokeWidth={2}
            />

            {/* the tangent at the start */}
            {tangent && (
              <line
                x1={tangent.x1}
                y1={tangent.y1}
                x2={tangent.x2}
                y2={tangent.y2}
                stroke="currentColor"
                className="text-amber-500"
                strokeWidth={2}
                strokeDasharray="4 3"
              />
            )}

            {/* the walk: a dot at every step, joined in order */}
            {descent && descent.path.length > 1 && (
              <polyline
                points={descent.path
                  .map(
                    (p) =>
                      `${projectX(window, p.x).toFixed(2)},${projectY(window, p.y).toFixed(2)}`,
                  )
                  .join(" ")}
                fill="none"
                stroke="currentColor"
                className="text-indigo-400/60"
                strokeWidth={1.5}
              />
            )}
            {descent?.path.map((p, index) => (
              <circle
                key={index}
                cx={projectX(window, p.x)}
                cy={projectY(window, p.y)}
                r={index === 0 ? 6 : 3.5}
                className={
                  index === 0
                    ? "fill-white stroke-slate-500 dark:fill-slate-900"
                    : "fill-indigo-500"
                }
                strokeWidth={index === 0 ? 2 : 0}
              />
            ))}

            {/* where it settled */}
            {descent?.minimum && (
              <circle
                cx={projectX(window, descent.minimum.x)}
                cy={projectY(window, descent.minimum.y)}
                r={7}
                className="fill-emerald-500 stroke-white dark:stroke-slate-900"
                strokeWidth={2}
              />
            )}
          </>
        )}
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Click the curve to choose where the walk starts.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Start" value={start.toFixed(2)} />
        <Stat label="Steps taken" value={descent ? String(descent.path.length) : "…"} />
        <Stat
          label="Outcome"
          value={descent ? descent.outcome.replace(/_/g, " ") : "…"}
        />
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {message
          ? message
          : descent
            ? OUTCOME_TEXT[descent.outcome]
            : "Computing the walk…"}
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
