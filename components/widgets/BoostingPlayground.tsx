"use client";

// Gradient boosting assembling a fit one stump at a time.
//
// The points are the thrown ball, the members are depth-one stumps, and the
// rounds slider is the thing to drag. One round is a flat shelf or two, ten
// rounds rough out the arc, and hundreds trace the noise. The learning rate
// sets how much of each stump's correction is kept. Every fit is the
// library's through the API, not the browser's.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, BoostingAnswer, Point, fitBoosting } from "@/lib/api";

const DOMAIN = { xMin: 0, xMax: 4, yMin: -2, yMax: 26 };
const VIEW = { width: 640, height: 440 };
const PAD = { left: 52, right: 16, top: 16, bottom: 52 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

// The same fifteen noisy measurements the polynomial and penalty pages fit.
const NOISY_THROW: Point[] = [
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

// The three points the page works two rounds on by hand.
const WORKED_POINTS: Point[] = [
  { x: 1, y: 2 },
  { x: 2, y: 6 },
  { x: 3, y: 10 },
];


function randomThrow(): Point[] {
  const launch = 17 + Math.random() * 5;
  return Array.from({ length: 15 }, (_, index) => {
    const t = Math.round(((index * 4) / 14) * 100) / 100;
    const noise = (Math.random() - 0.5) * 9;
    const h = Math.max(
      DOMAIN.yMin,
      Math.min(DOMAIN.yMax, launch * t - 4.9 * t * t + noise),
    );
    return { x: t, y: Math.round(h * 10) / 10 };
  });
}

const MAX_POINTS = 100;

function toPixel(point: Point) {
  const px =
    PAD.left +
    ((point.x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
  const py =
    PAD.top +
    (1 - (point.y - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height;
  return { px, py };
}

function toData(px: number, py: number): Point {
  const clamp = (value: number, low: number, high: number) =>
    Math.min(high, Math.max(low, Math.round(value * 100) / 100));
  return {
    x: clamp(
      DOMAIN.xMin + ((px - PAD.left) / PLOT.width) * (DOMAIN.xMax - DOMAIN.xMin),
      DOMAIN.xMin,
      DOMAIN.xMax,
    ),
    y: clamp(
      DOMAIN.yMin +
        (1 - (py - PAD.top) / PLOT.height) * (DOMAIN.yMax - DOMAIN.yMin),
      DOMAIN.yMin,
      DOMAIN.yMax,
    ),
  };
}

function statusText(answer: BoostingAnswer | null, rounds: number): string {
  if (!answer) return "…";
  if (rounds <= 2) {
    return "A round or two in, the fit is a shelf or three, the first rough corrections.";
  }
  if (answer.r_squared > 0.999) {
    return "R² has reached 1 to three decimals, which by now you know to read as a warning rather than a triumph.";
  }
  return "Each round fits a stump to whatever the fit still gets wrong, and the shelves accumulate into the arc.";
}

export function BoostingPlayground() {
  const [points, setPoints] = useState<Point[]>(NOISY_THROW);
  const [rounds, setRounds] = useState(10);
  const [learningRate, setLearningRate] = useState(0.3);
  const [answer, setAnswer] = useState<BoostingAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await fitBoosting(points, rounds, learningRate));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong computing the fit.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [points, rounds, learningRate]);

  const eventToData = useCallback((clientX: number, clientY: number): Point => {
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
    setPoints((current) => [...current, dropped]);
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
    setPoints((current) =>
      current.map((point, index) =>
        index === dragging.current ? moved : point,
      ),
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

  const curvePath = answer
    ? answer.curve
        .map((point, index) => {
          const { px, py } = toPixel(point);
          return `${index === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`;
        })
        .join(" ")
    : "";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 pb-3">
        <button
          onClick={() => setPoints(NOISY_THROW)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Full throw
        </button>
        <button
          onClick={() => setPoints(WORKED_POINTS)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          An Ideal Case
        </button>
        <button
          onClick={() => setPoints(randomThrow())}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Random throw
        </button>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          Rounds
          <input
            type="range"
            min={1}
            max={300}
            step={1}
            value={rounds}
            onChange={(event) => setRounds(Number(event.target.value))}
            className="w-32 accent-indigo-600"
          />
          <span className="w-8 font-mono text-sm">{rounds}</span>
        </label>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          Learning rate
          <input
            type="range"
            min={0.05}
            max={1}
            step={0.05}
            value={learningRate}
            onChange={(event) => setLearningRate(Number(event.target.value))}
            className="w-28 accent-indigo-600"
          />
          <span className="w-10 font-mono text-sm">
            {learningRate.toFixed(2)}
          </span>
        </label>
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
        <Grid />

        {answer && (
          <path
            d={curvePath}
            fill="none"
            stroke="currentColor"
            className="text-indigo-500"
            strokeWidth={2.5}
          />
        )}

        {points.map((point, index) => {
          const { px, py } = toPixel(point);
          return (
            <circle
              key={index}
              cx={px}
              cy={py}
              r={7}
              className="cursor-grab fill-slate-700 stroke-white dark:fill-slate-200 dark:stroke-slate-900"
              strokeWidth={2}
              onPointerDown={onPointPointerDown(index)}
              onDoubleClick={removePoint(index)}
            />
          );
        })}
      </svg>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="Rounds" value={String(rounds)} />
        <Stat label="Learning rate" value={learningRate.toFixed(2)} />
        <Stat label="R²" value={answer ? answer.r_squared.toFixed(3) : "…"} />
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {message ? message : statusText(answer, rounds)}
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

function Grid() {
  const lines = [];
  for (let gx = DOMAIN.xMin; gx <= DOMAIN.xMax; gx += 1) {
    const { px } = toPixel({ x: gx, y: DOMAIN.yMin });
    lines.push(
      <g key={`gx-${gx}`}>
        <line
          x1={px}
          y1={PAD.top}
          x2={px}
          y2={PAD.top + PLOT.height}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
        />
        <text
          x={px}
          y={PAD.top + PLOT.height + 20}
          textAnchor="middle"
          className="fill-slate-400 text-[11px]"
        >
          {gx}
        </text>
      </g>,
    );
  }
  for (let gy = 0; gy <= DOMAIN.yMax; gy += 5) {
    const { py } = toPixel({ x: DOMAIN.xMin, y: gy });
    lines.push(
      <g key={`gy-${gy}`}>
        <line
          x1={PAD.left}
          y1={py}
          x2={PAD.left + PLOT.width}
          y2={py}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
        />
        <text
          x={PAD.left - 10}
          y={py + 4}
          textAnchor="end"
          className="fill-slate-400 text-[11px]"
        >
          {gy}
        </text>
      </g>,
    );
  }
  return (
    <>
      {lines}
      <text
        x={PAD.left + PLOT.width / 2}
        y={VIEW.height - 6}
        textAnchor="middle"
        className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
      >
        Time (s)
      </text>
      <text
        x={14}
        y={PAD.top + PLOT.height / 2}
        textAnchor="middle"
        transform={`rotate(-90 14 ${PAD.top + PLOT.height / 2})`}
        className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
      >
        Height (m)
      </text>
    </>
  );
}
