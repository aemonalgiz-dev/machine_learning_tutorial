"use client";

// A deliberately overgrown fit, and the penalty that tames it.
//
// The points are the same thrown ball, and every fit here is a degree-9
// polynomial, far more bend than the data deserves. The slider sets the
// penalty. The curve shows what the fit does with it, and the bars underneath
// show the nine coefficients, the real subject. Under ridge they all shrink
// together and never quite reach zero. Under lasso they switch off one by one,
// and the count of surviving terms is read out. Every fit is the library's
// through the API, not the browser's.

import { useEffect, useState } from "react";
import {
  ApiError,
  PenalisedFit,
  PenaltyModel,
  Point,
  fitPenalised,
} from "@/lib/api";

const DOMAIN = { xMin: 0, xMax: 4, yMin: -2, yMax: 26 };
const VIEW = { width: 640, height: 340 };
const PAD = { left: 52, right: 16, top: 12, bottom: 40 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const BARS = { width: 640, height: 170, top: 12, bottom: 30, side: 52 };

// The same fifteen noisy measurements the polynomial page fits.
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

function toPixel(point: { x: number; y: number }) {
  const px =
    PAD.left +
    ((point.x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
  const py =
    PAD.top +
    (1 - (point.y - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height;
  return { px, py };
}

function formatPenalty(penalty: number): string {
  if (penalty >= 1) return penalty.toFixed(penalty >= 10 ? 0 : 1);
  return penalty.toFixed(3);
}

function statusText(fit: PenalisedFit | null, model: PenaltyModel): string {
  if (!fit) return "…";
  if (model === "ridge") {
    return "Under ridge all nine terms shrink together as the penalty grows, though none of them ever reaches exactly zero.";
  }
  if (fit.nonzero_count === 0) {
    return "The penalty has switched every term off, so the curve is a flat line at the mean, a model that has given up on the input entirely.";
  }
  return `Under lasso the penalty has switched terms off outright, leaving ${fit.nonzero_count} of the nine still working.`;
}

export function PenaltyPlayground() {
  const [model, setModel] = useState<PenaltyModel>("ridge");
  const [exponent, setExponent] = useState(-1);
  const [fit, setFit] = useState<PenalisedFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const penalty = Math.round(10 ** exponent * 1000) / 1000;

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setFit(await fitPenalised(NOISY_THROW, model, penalty));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong computing the fit.");
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [model, penalty]);

  const curvePath = fit
    ? fit.curve
        .map((point, index) => {
          const { px, py } = toPixel(point);
          return `${index === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`;
        })
        .join(" ")
    : "";

  const largestBar = fit
    ? Math.max(1e-9, ...fit.coefficients.map((each) => Math.abs(each.value)))
    : 1;
  const barPlotWidth = BARS.width - 2 * BARS.side;
  const barPlotHeight = BARS.height - BARS.top - BARS.bottom;
  const barMiddle = BARS.top + barPlotHeight / 2;
  const barSlot = fit ? barPlotWidth / fit.coefficients.length : barPlotWidth;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <div className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {(["ridge", "lasso"] as PenaltyModel[]).map((option) => (
            <button
              key={option}
              onClick={() => setModel(option)}
              className={
                "rounded px-3 py-1 text-sm font-medium capitalize transition " +
                (model === option
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {option}
            </button>
          ))}
        </div>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          Penalty
          <input
            type="range"
            min={-3}
            max={2}
            step={0.1}
            value={exponent}
            onChange={(event) => setExponent(Number(event.target.value))}
            className="w-40 accent-indigo-600"
          />
          <span className="w-14 font-mono text-sm">{formatPenalty(penalty)}</span>
        </label>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {/* the ball, fixed here so the bars stay the story */}
        {NOISY_THROW.map((point, index) => {
          const { px, py } = toPixel(point);
          return (
            <circle
              key={index}
              cx={px}
              cy={py}
              r={5}
              className="fill-slate-500 dark:fill-slate-400"
            />
          );
        })}

        {fit && (
          <path
            d={curvePath}
            fill="none"
            stroke="currentColor"
            className="text-indigo-500"
            strokeWidth={2.5}
          />
        )}

        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Time (s)
        </text>
      </svg>

      <svg
        viewBox={`0 0 ${BARS.width} ${BARS.height}`}
        className="mt-2 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={BARS.side}
          y1={barMiddle}
          x2={BARS.width - BARS.side}
          y2={barMiddle}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1.5}
        />
        {fit?.coefficients.map((coefficient, index) => {
          const height =
            (Math.abs(coefficient.value) / largestBar) * (barPlotHeight / 2);
          const alive = Math.abs(coefficient.value) > 1e-9;
          const x = BARS.side + index * barSlot + barSlot * 0.2;
          const width = barSlot * 0.6;
          const y = coefficient.value >= 0 ? barMiddle - height : barMiddle;
          return (
            <g key={coefficient.name}>
              <rect
                x={x}
                y={y}
                width={width}
                height={Math.max(alive ? 2 : 0.5, height)}
                className={
                  alive
                    ? coefficient.value >= 0
                      ? "fill-indigo-500"
                      : "fill-amber-500"
                    : "fill-slate-300 dark:fill-slate-700"
                }
              />
              <text
                x={x + width / 2}
                y={BARS.height - 10}
                textAnchor="middle"
                className="fill-slate-400 font-mono text-[11px]"
              >
                {coefficient.name}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The bars are the nine coefficients on a shared scale. Indigo is
        positive, amber is negative, grey is switched off.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="Penalty" value={formatPenalty(penalty)} />
        <Stat label="R²" value={fit ? fit.r_squared.toFixed(3) : "…"} />
        <Stat
          label="Terms still on"
          value={fit ? `${fit.nonzero_count} of 9` : "…"}
        />
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {message ? message : statusText(fit, model)}
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
