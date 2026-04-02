"use client";

// The balance the logistic derivation sets to zero, drawn per person.
//
// Each bar is one of the twelve worked students, standing at the hours they
// studied. Its height is that student's gap, the outcome minus the fitted
// probability, so a pass the curve doubted throws a tall bar upward and a
// fail the curve half believed in hangs below the line. Setting the gradient
// to zero forces the sum of these gaps to zero, which is why the upward area
// and the downward area cancel. The fit and every gap come from the API; the
// browser only draws rectangles.

import { useEffect, useState } from "react";
import { ApiError, LogisticFit, Outcome, fitLogistic } from "@/lib/api";

const DOMAIN = { xMin: 0, xMax: 10 };
const VIEW = { width: 640, height: 360 };
const PAD = { left: 52, right: 16, top: 20, bottom: 48 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

// A gap is an outcome of zero or one minus a probability, so it cannot leave
// the interval from minus one to one. Fixing the axis there keeps every bar
// on one stated scale.
const GAP_LIMIT = 1;
const GRID_LEVELS = [1, 0.5, 0, -0.5, -1];
const BAR_WIDTH = 12;
const LEARNING_RATE = 0.1;

// The logistic page's twelve worked students, the set its arithmetic uses.
const WORKED_OUTCOMES: Outcome[] = [
  { x: 1, label: 0 },
  { x: 1.5, label: 0 },
  { x: 2, label: 0 },
  { x: 3, label: 0 },
  { x: 3.5, label: 0 },
  { x: 5, label: 0 },
  { x: 4, label: 1 },
  { x: 4.5, label: 1 },
  { x: 5.5, label: 1 },
  { x: 6, label: 1 },
  { x: 7, label: 1 },
  { x: 8, label: 1 },
];

function toPixelX(hours: number): number {
  return (
    PAD.left + ((hours - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width
  );
}

function toPixelY(gap: number): number {
  return PAD.top + ((GAP_LIMIT - gap) / (2 * GAP_LIMIT)) * PLOT.height;
}

interface SignedBar {
  pixelX: number;
  pixelY: number;
  barHeight: number;
  positive: boolean;
}

export function BalanceChart() {
  const [fit, setFit] = useState<LogisticFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setFit(await fitLogistic(WORKED_OUTCOMES, LEARNING_RATE));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong computing the fit.");
      }
    })();
  }, []);

  const zeroLineY = toPixelY(0);

  const bars: SignedBar[] = fit
    ? fit.gaps.flatMap((gap, personIndex) => {
        const person = WORKED_OUTCOMES[personIndex];
        if (!person) return [];
        const gapY = toPixelY(gap);
        return [
          {
            pixelX: toPixelX(person.x) - BAR_WIDTH / 2,
            pixelY: Math.min(zeroLineY, gapY),
            barHeight: Math.abs(zeroLineY - gapY),
            positive: gap >= 0,
          },
        ];
      })
    : [];

  const largestGap = fit ? Math.max(...fit.gaps.map(Math.abs)) : null;
  const positiveGapSum = fit
    ? fit.gaps
        .filter((gap) => gap > 0)
        .reduce((runningTotal, gap) => runningTotal + gap, 0)
    : null;

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {/* gap gridlines, the zero line drawn heavier */}
        {GRID_LEVELS.map((level) => (
          <g key={level}>
            <line
              x1={PAD.left}
              y1={toPixelY(level)}
              x2={PAD.left + PLOT.width}
              y2={toPixelY(level)}
              stroke="currentColor"
              className={
                level === 0
                  ? "text-slate-400 dark:text-slate-600"
                  : "text-slate-200 dark:text-slate-800"
              }
              strokeWidth={level === 0 ? 1.5 : 1}
              strokeDasharray={level === 0 ? undefined : "3 3"}
            />
            <text
              x={PAD.left - 8}
              y={toPixelY(level) + 4}
              textAnchor="end"
              className="fill-slate-400 text-[11px]"
            >
              {level.toFixed(1)}
            </text>
          </g>
        ))}
        {Array.from({ length: 11 }, (_, hour) => (
          <text
            key={hour}
            x={toPixelX(hour)}
            y={PAD.top + PLOT.height + 18}
            textAnchor="middle"
            className="fill-slate-400 text-[11px]"
          >
            {hour}
          </text>
        ))}

        {/* one signed bar per person, height proportional to the gap */}
        {bars.map((bar, index) => (
          <rect
            key={index}
            x={bar.pixelX}
            y={bar.pixelY}
            width={BAR_WIDTH}
            height={bar.barHeight}
            rx={2}
            className={
              bar.positive
                ? "fill-emerald-500 dark:fill-emerald-400"
                : "fill-rose-500 dark:fill-rose-400"
            }
          />
        ))}

        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Hours studied
        </text>
        <text
          x={14}
          y={PAD.top + PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${PAD.top + PLOT.height / 2})`}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Gap, outcome minus probability
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The bars above the line cancel the bars below it almost exactly, which
        is the balance the derivation sets to zero.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Largest single gap"
          value={largestGap !== null ? largestGap.toFixed(3) : "…"}
        />
        <Stat
          label="Sum of positive gaps"
          value={positiveGapSum !== null ? positiveGapSum.toFixed(3) : "…"}
        />
        <Stat
          label="Total of all gaps"
          value={fit ? fit.gap_total.toFixed(4) : "…"}
        />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
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
