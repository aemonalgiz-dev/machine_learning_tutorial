"use client";

// The residuals of two fits, laid out against time.
//
// The left panel is the straight line's misses on the thrown ball, the right
// panel the parabola's. A residual plot puts nothing on the vertical axis but
// the miss, so any shape left in it is shape the model failed to take. The
// line's residuals bend, negative at both ends and positive in the middle,
// which is the arc it could not draw. The parabola's are zero on the ideal
// throw and a shapeless scatter on the noisy one. Both fits and every
// residual come from the API; the browser only draws stems.

import { useEffect, useState } from "react";
import { ApiError, Point, PolynomialFit, fitPolynomial } from "@/lib/api";

const IDEAL_THROW: Point[] = [
  { x: 0, y: 0 },
  { x: 1, y: 15.1 },
  { x: 2, y: 20.4 },
  { x: 3, y: 15.9 },
  { x: 4, y: 1.6 },
];

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

const PANEL = { width: 320, height: 220 };
const PAD = { left: 44, right: 12, top: 14, bottom: 30 };
const PLOT = {
  width: PANEL.width - PAD.left - PAD.right,
  height: PANEL.height - PAD.top - PAD.bottom,
};
const T_RANGE = { min: 0, max: 4 };

// Both panels share one vertical scale so the parabola's residuals are seen
// at the line's scale, which is what makes them look like nothing.
function verticalReach(fits: (PolynomialFit | null)[]): number {
  const largest = Math.max(
    1,
    ...fits.flatMap((fit) => (fit ? fit.residuals.map((residual) => Math.abs(residual)) : [])),
  );
  return Math.ceil(largest / 5) * 5 || 5;
}

export function ResidualPatternChart() {
  const [points, setPoints] = useState<Point[]>(NOISY_THROW);
  const [line, setLine] = useState<PolynomialFit | null>(null);
  const [parabola, setParabola] = useState<PolynomialFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [degreeOne, degreeTwo] = await Promise.all([
          fitPolynomial(points, 1),
          fitPolynomial(points, 2),
        ]);
        setLine(degreeOne);
        setParabola(degreeTwo);
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [points]);

  const reach = verticalReach([line, parabola]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <Button onClick={() => setPoints(IDEAL_THROW)}>The ideal throw</Button>
        <Button onClick={() => setPoints(NOISY_THROW)}>The noisy throw</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel title="Degree 1, a straight line" points={points} fit={line} reach={reach} />
        <Panel title="Degree 2, a parabola" points={points} fit={parabola} reach={reach} />
      </div>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Panel({
  title,
  points,
  fit,
  reach,
}: {
  title: string;
  points: Point[];
  fit: PolynomialFit | null;
  reach: number;
}) {
  const toX = (time: number) => PAD.left + ((time - T_RANGE.min) / (T_RANGE.max - T_RANGE.min)) * PLOT.width;
  const toY = (residual: number) => PAD.top + (1 - (residual + reach) / (2 * reach)) * PLOT.height;
  const zero = toY(0);
  const ticks = [-reach, -reach / 2, 0, reach / 2, reach];

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
      <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
        {ticks.map((tick) => (
          <g key={`tick-${tick}`}>
            <line x1={PAD.left} y1={toY(tick)} x2={PAD.left + PLOT.width} y2={toY(tick)} stroke="currentColor" className={tick === 0 ? "text-slate-400 dark:text-slate-600" : "text-slate-200 dark:text-slate-800"} strokeWidth={tick === 0 ? 1.5 : 1} />
            <text x={PAD.left - 6} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{tick}</text>
          </g>
        ))}
        {fit &&
          points.map((point, index) => {
            const residual = fit.residuals[index];
            const x = toX(point.x);
            return (
              <g key={`stem-${index}`}>
                <line x1={x} y1={zero} x2={x} y2={toY(residual)} stroke="currentColor" className={residual >= 0 ? "text-emerald-500" : "text-rose-500"} strokeWidth={1.5} />
                <circle cx={x} cy={toY(residual)} r={4} className={residual >= 0 ? "fill-emerald-500" : "fill-rose-500"} />
              </g>
            );
          })}
        <text x={PAD.left + PLOT.width / 2} y={PANEL.height - 6} textAnchor="middle" className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">Time (s)</text>
      </svg>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Stat label="RSS" value={fit ? fit.residual_sum_of_squares.toFixed(3) : "…"} />
        <Stat label="R²" value={fit ? fit.r_squared.toFixed(3) : "…"} />
      </div>
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
    <div className="rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
