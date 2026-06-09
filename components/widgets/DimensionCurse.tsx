"use client";

// How much further the farthest row is than the nearest, as features grow.
//
// Two hundred rows drawn uniformly, every row measured against every
// other, and for each row the ratio of the farthest distance beyond the
// nearest to the nearest itself. In one feature the nearest row is
// thousands of times nearer than the farthest; in two hundred it is a
// quarter nearer. The curve is that ratio's median over the rows, drawn on
// two logarithmic axes, one line per metric, with the table underneath
// giving the mean as well. The API measures; the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  DimensionsAnswer,
  METRIC_NAMES,
  METRIC_TITLES,
  MetricName,
  measureDimensions,
} from "@/lib/concepts/distance-metrics";

const N_POINTS = 200;
const SEED = 0;

// One request for the page, however many times the widget mounts.
let cached: Promise<DimensionsAnswer> | null = null;
function dimensionsOnce(): Promise<DimensionsAnswer> {
  if (!cached) cached = measureDimensions(N_POINTS, SEED);
  return cached;
}

const VIEW = { width: 640, height: 320 };
const PAD = { left: 64, right: 16, top: 16, bottom: 44 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

// Hamming answers exactly one everywhere on continuous rows, so its ratio
// is zero and cannot sit on a logarithmic axis; the table carries it.
const DRAWN: readonly MetricName[] = METRIC_NAMES.filter(
  (metric) => metric !== "hamming",
);

const STROKES: Record<MetricName, string> = {
  euclidean: "text-indigo-600 dark:text-indigo-400",
  manhattan: "text-amber-500",
  chebyshev: "text-rose-500",
  cosine: "text-emerald-500",
  hamming: "text-slate-400",
  canberra: "text-sky-500",
};

const Y_MIN = 0.1;
const Y_MAX = 1_000_000;

export function DimensionCurse() {
  const [answer, setAnswer] = useState<DimensionsAnswer | null>(null);
  const [shown, setShown] = useState<Set<MetricName>>(
    new Set(["euclidean", "manhattan", "chebyshev", "cosine", "canberra"]),
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let stale = false;
    (async () => {
      try {
        const body = await dimensionsOnce();
        if (stale) return;
        setAnswer(body);
      } catch (error) {
        if (stale) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      stale = true;
    };
  }, []);

  const toggle = (metric: MetricName) =>
    setShown((current) => {
      const next = new Set(current);
      if (next.has(metric)) next.delete(metric);
      else next.add(metric);
      return next;
    });

  const xMin = Math.log10(1);
  const xMax = Math.log10(200);
  const toX = (dimensions: number) =>
    PAD.left + ((Math.log10(dimensions) - xMin) / (xMax - xMin)) * PLOT.width;
  const toY = (value: number) => {
    const clamped = Math.min(Y_MAX, Math.max(Y_MIN, value));
    return (
      PAD.top +
      (1 -
        (Math.log10(clamped) - Math.log10(Y_MIN)) /
          (Math.log10(Y_MAX) - Math.log10(Y_MIN))) *
        PLOT.height
    );
  };

  const yTicks = [0.1, 1, 10, 100, 1000, 10_000, 100_000, 1_000_000];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {DRAWN.map((metric) => (
          <button
            key={metric}
            onClick={() => toggle(metric)}
            className={
              "rounded-md border px-3 py-1 text-sm font-medium transition " +
              (shown.has(metric)
                ? `border-current ${STROKES[metric]}`
                : "border-slate-300 text-slate-400 dark:border-slate-700 dark:text-slate-500")
            }
          >
            {METRIC_TITLES[metric]}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={PAD.left + PLOT.width}
              y1={toY(tick)}
              y2={toY(tick)}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={toY(tick) + 4}
              textAnchor="end"
              className="fill-slate-500 text-[11px] dark:fill-slate-400"
            >
              {tick >= 1 ? tick.toLocaleString() : tick}
            </text>
          </g>
        ))}
        {(answer?.dimensions ?? [1, 2, 5, 10, 50, 200]).map((dimensions) => (
          <text
            key={dimensions}
            x={toX(dimensions)}
            y={PAD.top + PLOT.height + 16}
            textAnchor="middle"
            className="fill-slate-500 text-[11px] dark:fill-slate-400"
          >
            {dimensions}
          </text>
        ))}
        <line
          x1={PAD.left}
          x2={PAD.left + PLOT.width}
          y1={toY(1)}
          y2={toY(1)}
          stroke="currentColor"
          className="text-slate-400 dark:text-slate-500"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        {answer &&
          answer.metrics
            .filter((entry) => shown.has(entry.metric))
            .map((entry) => {
              const drawable = entry.contrasts.filter(
                (each) => each.median_relative_contrast > 0,
              );
              const path = drawable
                .map(
                  (each, index) =>
                    `${index === 0 ? "M" : "L"} ${toX(each.dimensions).toFixed(1)} ${toY(each.median_relative_contrast).toFixed(1)}`,
                )
                .join(" ");
              return (
                <g key={entry.metric} className={STROKES[entry.metric]}>
                  <path
                    d={path}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  />
                  {drawable.map((each) => (
                    <circle
                      key={each.dimensions}
                      cx={toX(each.dimensions)}
                      cy={toY(each.median_relative_contrast)}
                      r={3.5}
                      fill="currentColor"
                    />
                  ))}
                </g>
              );
            })}
        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          features, logarithmic
        </text>
        <text
          x={14}
          y={PAD.top + PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${PAD.top + PLOT.height / 2})`}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          (farthest − nearest) / nearest, median
        </text>
      </svg>
      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Below the dashed line at one, the farthest row is less than twice as
        far as the nearest. Cosine in one feature is left off, since every
        one-feature row points the same way and its ratio is zero.
      </p>

      {answer && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm text-slate-700 dark:text-slate-300">
            <thead>
              <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
                <th className="py-1 pr-3 font-medium">Features</th>
                {METRIC_NAMES.map((metric) => (
                  <th key={metric} className="py-1 pr-3 font-medium">
                    {METRIC_TITLES[metric]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {answer.dimensions.map((dimensions, row) => (
                <tr
                  key={dimensions}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  <td className="py-1 pr-3 font-mono">{dimensions}</td>
                  {answer.metrics.map((entry) => (
                    <td key={entry.metric} className="py-1 pr-3 font-mono">
                      {ratioText(entry.contrasts[row].median_relative_contrast)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Medians over the {answer.n_points} rows at seed {answer.seed}. The
            means are larger where one row sits almost on top of another, and
            in two features under cosine the mean is{" "}
            {answer.metrics
              .find((entry) => entry.metric === "cosine")
              ?.contrasts[1].relative_contrast.toExponential(2)}{" "}
            against a median of{" "}
            {answer.metrics
              .find((entry) => entry.metric === "cosine")
              ?.contrasts[1].median_relative_contrast.toExponential(2)}
            .
          </p>
        </div>
      )}

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
      {!answer && !message && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">…</p>
      )}
    </div>
  );
}

function ratioText(value: number): string {
  if (value === 0) return "0";
  if (value >= 100) return value.toFixed(0);
  return value.toFixed(3);
}
