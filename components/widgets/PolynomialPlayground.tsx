"use client";

// A thrown ball, and a polynomial bent through its flight.
//
// Each dot is a measurement of the ball's height at a moment in time,
// draggable like every scatter on this site. The slider chooses the degree,
// how bendy a curve the fit may use, and the readouts show the fitted
// coefficients by name, the R-squared and the residual sum of squares. At
// degree 2 on the ideal throw the physics comes back out of the data. The
// noise slider adds measurement error to exact readings of that same throw,
// so the true arc can be drawn alongside what the fit was actually shown.
// The range control samples the fitted curve past the last measurement,
// which is where a high degree stops resembling a ball. Every fit is the
// library's through the API, not the browser's.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, Point, PolynomialFit, fitPolynomial } from "@/lib/api";

const VIEW = { width: 640, height: 440 };
const PAD = { left: 52, right: 16, top: 16, bottom: 52 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};
const HEIGHT_RANGE = { min: -2, max: 26 };
const DATA_RANGE = { min: 0, max: 4 };

type RangeChoice = "observed" | "near" | "far";

const RANGES: { key: RangeChoice; label: string; from: number; to: number }[] = [
  { key: "observed", label: "Observed range", from: 0, to: 4 },
  { key: "near", label: "A little beyond", from: -1, to: 5 },
  { key: "far", label: "Far beyond", from: -3, to: 7 },
];

// Five exact measurements of h = 20t - 4.9t², the worked example whose
// degree-2 fit recovers 20 and -4.9 to the last digit.
const IDEAL_THROW: Point[] = [
  { x: 0, y: 0 },
  { x: 1, y: 15.1 },
  { x: 2, y: 20.4 },
  { x: 3, y: 15.9 },
  { x: 4, y: 1.6 },
];

// Fifteen noisy measurements of the same throw, the default view.
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

// Fifteen fixed draws, so the noise slider scales one wobble smoothly rather
// than dealing a fresh one at every notch.
const NOISE_DRAWS = [
  0.61, -0.42, 0.18, -0.95, 0.73, 0.09, -0.58, 1.12, -0.31, 0.47, -0.77, 0.26,
  -0.13, 0.88, -0.66,
];

const MAX_POINTS = 100;

function trueHeight(time: number): number {
  return 20 * time - 4.9 * time * time;
}

// Exact readings of the throw at fifteen evenly spaced moments, each shifted
// by its own draw scaled to the chosen noise.
function throwWithNoise(noise: number): Point[] {
  return NOISE_DRAWS.map((draw, index) => {
    const time = Math.round(((index * 4) / 14) * 100) / 100;
    const height = trueHeight(time) + noise * draw;
    return { x: time, y: Math.round(height * 100) / 100 };
  });
}

function randomThrow(): Point[] {
  const launch = 17 + Math.random() * 5;
  return Array.from({ length: 15 }, (_, index) => {
    const time = Math.round(((index * 4) / 14) * 100) / 100;
    const noise = (Math.random() - 0.5) * 9;
    const height = Math.max(
      HEIGHT_RANGE.min,
      Math.min(HEIGHT_RANGE.max, launch * time - 4.9 * time * time + noise),
    );
    return { x: time, y: Math.round(height * 10) / 10 };
  });
}

function formatCoefficient(value: number): string {
  if (Math.abs(value) >= 100) return value.toFixed(0);
  return value.toFixed(2);
}

function formatHeight(value: number): string {
  if (Math.abs(value) >= 1000) return value.toExponential(1);
  return value.toFixed(1);
}

function statusText(fit: PolynomialFit | null, degree: number, range: RangeChoice): string {
  if (!fit) return "…";
  if (range !== "observed") {
    const last = fit.curve[fit.curve.length - 1];
    const first = fit.curve[0];
    return `Beyond the measurements the fitted curve reads ${formatHeight(first.y)} m at t = ${first.x} and ${formatHeight(last.y)} m at t = ${last.x}. Nothing in the data vouches for either.`;
  }
  if (degree === 1) {
    return "A straight line cannot bend, so it cuts across the arc and explains almost none of it.";
  }
  if (fit.r_squared > 0.999 && degree >= 5) {
    return "The curve now passes through nearly every point and R² reads close to 1, though look at what it does between them.";
  }
  return "The curve bends with the data, and R² reports how much of the spread it accounts for.";
}

export function PolynomialPlayground() {
  const [points, setPoints] = useState<Point[]>(NOISY_THROW);
  const [degree, setDegree] = useState(2);
  const [noise, setNoise] = useState(0);
  const [range, setRange] = useState<RangeChoice>("observed");
  const [showTruth, setShowTruth] = useState(false);
  const [fit, setFit] = useState<PolynomialFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | null>(null);

  const chosenRange = RANGES.find((each) => each.key === range) ?? RANGES[0];
  const timeRange = { min: chosenRange.from, max: chosenRange.to };

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setFit(
          await fitPolynomial(
            points,
            degree,
            range === "observed" ? undefined : { from: chosenRange.from, to: chosenRange.to },
          ),
        );
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong computing the fit.");
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [points, degree, range, chosenRange.from, chosenRange.to]);

  const toPixel = useCallback(
    (point: Point) => {
      const px = PAD.left + ((point.x - timeRange.min) / (timeRange.max - timeRange.min)) * PLOT.width;
      const py = PAD.top + (1 - (point.y - HEIGHT_RANGE.min) / (HEIGHT_RANGE.max - HEIGHT_RANGE.min)) * PLOT.height;
      return { px, py };
    },
    [timeRange.min, timeRange.max],
  );

  const eventToData = useCallback(
    (clientX: number, clientY: number): Point => {
      const svg = svgRef.current!;
      const rect = svg.getBoundingClientRect();
      const px = ((clientX - rect.left) / rect.width) * VIEW.width;
      const py = ((clientY - rect.top) / rect.height) * VIEW.height;
      const clamp = (value: number, low: number, high: number) =>
        Math.min(high, Math.max(low, Math.round(value * 100) / 100));
      return {
        x: clamp(
          timeRange.min + ((px - PAD.left) / PLOT.width) * (timeRange.max - timeRange.min),
          DATA_RANGE.min,
          DATA_RANGE.max,
        ),
        y: clamp(
          HEIGHT_RANGE.min + (1 - (py - PAD.top) / PLOT.height) * (HEIGHT_RANGE.max - HEIGHT_RANGE.min),
          HEIGHT_RANGE.min,
          HEIGHT_RANGE.max,
        ),
      };
    },
    [timeRange.min, timeRange.max],
  );

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
    setPoints((current) => current.map((point, index) => (index === dragging.current ? moved : point)));
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  const removePoint = (index: number) => (event: React.MouseEvent) => {
    event.stopPropagation();
    if (points.length <= 2) return;
    setPoints((current) => current.filter((_, position) => position !== index));
  };

  // Curves are clamped to the plot in pixels only, so a wild swing beyond
  // the data runs along the frame's edge rather than off the page.
  const clampY = (py: number) => Math.min(PAD.top + PLOT.height, Math.max(PAD.top, py));
  const pathOf = (samples: Point[]) =>
    samples
      .map((point, index) => {
        const { px, py } = toPixel(point);
        return `${index === 0 ? "M" : "L"} ${px.toFixed(2)} ${clampY(py).toFixed(2)}`;
      })
      .join(" ");

  const curvePath = fit ? pathOf(fit.curve) : "";
  const truthPath = pathOf(
    Array.from({ length: 81 }, (_, index) => {
      const time = timeRange.min + ((timeRange.max - timeRange.min) * index) / 80;
      return { x: time, y: trueHeight(time) };
    }),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <Button onClick={() => setPoints(IDEAL_THROW)}>An Ideal Case</Button>
        <Button onClick={() => setPoints(NOISY_THROW)}>Full throw</Button>
        <Button onClick={() => setPoints(randomThrow())}>Random throw</Button>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          Degree
          <input
            type="range"
            min={1}
            max={9}
            step={1}
            value={degree}
            onChange={(event) => setDegree(Number(event.target.value))}
            className="w-36 accent-indigo-600"
          />
          <span className="w-5 font-mono text-sm">{degree}</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          Noise
          <input
            type="range"
            min={0}
            max={6}
            step={0.25}
            value={noise}
            onChange={(event) => {
              const chosen = Number(event.target.value);
              setNoise(chosen);
              setPoints(throwWithNoise(chosen));
            }}
            className="w-28 accent-amber-500"
          />
          <span className="w-10 font-mono text-sm">{noise.toFixed(2)} m</span>
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={showTruth}
            onChange={(event) => setShowTruth(event.target.checked)}
            className="accent-indigo-600"
          />
          show the true throw
        </label>
        <span className="ml-auto flex flex-wrap gap-1">
          {RANGES.map((each) => (
            <button
              key={each.key}
              onClick={() => setRange(each.key)}
              className={`rounded-md border px-2 py-1 text-xs font-medium transition ${
                range === each.key
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-200"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {each.label}
            </button>
          ))}
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
        <Grid timeRange={timeRange} toPixel={toPixel} />

        {range !== "observed" && (
          <rect
            x={toPixel({ x: DATA_RANGE.min, y: 0 }).px}
            y={PAD.top}
            width={toPixel({ x: DATA_RANGE.max, y: 0 }).px - toPixel({ x: DATA_RANGE.min, y: 0 }).px}
            height={PLOT.height}
            className="fill-indigo-100/50 dark:fill-indigo-900/20"
          />
        )}

        {showTruth && (
          <path d={truthPath} fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth={2} strokeDasharray="6 4" />
        )}

        {fit && (
          <path d={curvePath} fill="none" stroke="currentColor" className="text-indigo-500" strokeWidth={2.5} />
        )}

        {points.map((point, index) => {
          const { px, py } = toPixel(point);
          return (
            <circle
              key={`pt-${index}`}
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

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="R²" value={fit ? fit.r_squared.toFixed(3) : "…"} />
        <Stat label="RSS" value={fit ? fit.residual_sum_of_squares.toFixed(2) : "…"} />
        <Stat label="Coefficients" value={String(degree + 1)} />
        <Stat label="Points" value={String(points.length)} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Chip label="intercept" value={fit ? formatCoefficient(fit.intercept) : "…"} />
        {fit?.coefficients.map((coefficient) => (
          <Chip key={coefficient.name} label={coefficient.name} value={formatCoefficient(coefficient.value)} />
        ))}
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {message ? message : statusText(fit, degree, range)}
      </p>
    </div>
  );
}

function Button({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      {children}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      {label} {value}
    </span>
  );
}

function Grid({
  timeRange,
  toPixel,
}: {
  timeRange: { min: number; max: number };
  toPixel: (point: Point) => { px: number; py: number };
}) {
  const lines = [];
  for (let time = timeRange.min; time <= timeRange.max; time += 1) {
    const { px } = toPixel({ x: time, y: HEIGHT_RANGE.min });
    lines.push(
      <g key={`gx-${time}`}>
        <line x1={px} y1={PAD.top} x2={px} y2={PAD.top + PLOT.height} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
        <text x={px} y={PAD.top + PLOT.height + 20} textAnchor="middle" className="fill-slate-400 text-[11px]">
          {time}
        </text>
      </g>,
    );
  }
  for (let height = 0; height <= HEIGHT_RANGE.max; height += 5) {
    const { py } = toPixel({ x: timeRange.min, y: height });
    lines.push(
      <g key={`gy-${height}`}>
        <line x1={PAD.left} y1={py} x2={PAD.left + PLOT.width} y2={py} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
        <text x={PAD.left - 10} y={py + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
          {height}
        </text>
      </g>,
    );
  }
  return (
    <>
      {lines}
      <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 6} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
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
