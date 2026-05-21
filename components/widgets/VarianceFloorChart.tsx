"use client";

// The floor under a committee's variance, drawn.
//
// Averaging many judges divides the independent part of their noise by the
// size of the committee, but the part they share survives the averaging
// untouched. Each curve traces the variance of the committee's answer as
// members are added, one curve per correlation between the judges, and each
// dashed line marks that correlation itself, which is exactly the level the
// curve is heading for and can never pass. Growing the committee closes the
// gap to the floor; nothing about the committee lowers the floor. Every
// number comes from the API, and the browser only draws them.

import { useEffect, useState } from "react";
import {
  ApiError,
  CommitteeVariance,
  VarianceCurve,
  traceCommitteeVariance,
} from "@/lib/api";

const MEMBER_COUNT = 60;

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 340;
const MARGIN_LEFT = 46;
const MARGIN_RIGHT = 64;
const MARGIN_TOP = 14;
const MARGIN_BOTTOM = 36;
const PLOT_WIDTH = VIEW_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const PLOT_HEIGHT = VIEW_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;

const VARIANCE_TICKS = [0, 0.25, 0.5, 0.75, 1];
const MEMBER_TICKS = [1, 15, 30, 45, 60];

interface CurvePalette {
  line: string;
  label: string;
}

const CURVE_PALETTES: CurvePalette[] = [
  {
    line: "text-indigo-500 dark:text-indigo-400",
    label: "fill-indigo-500 dark:fill-indigo-400",
  },
  {
    line: "text-amber-500 dark:text-amber-400",
    label: "fill-amber-500 dark:fill-amber-400",
  },
  {
    line: "text-rose-500 dark:text-rose-400",
    label: "fill-rose-500 dark:fill-rose-400",
  },
];

function horizontalForMembers(memberCount: number): number {
  return MARGIN_LEFT + ((memberCount - 1) / (MEMBER_COUNT - 1)) * PLOT_WIDTH;
}

function verticalForVariance(varianceValue: number): number {
  return MARGIN_TOP + (1 - varianceValue) * PLOT_HEIGHT;
}

function polylinePoints(members: number[], curve: VarianceCurve): string {
  return members
    .map(
      (memberCount, index) =>
        `${horizontalForMembers(memberCount).toFixed(2)},${verticalForVariance(
          curve.variances[index],
        ).toFixed(2)}`,
    )
    .join(" ");
}

export function VarianceFloorChart() {
  const [chart, setChart] = useState<CommitteeVariance | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setChart(await traceCommitteeVariance(MEMBER_COUNT));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="mx-auto w-full max-w-lg select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {VARIANCE_TICKS.map((tick) => (
          <g key={`v${tick}`}>
            <line
              x1={MARGIN_LEFT}
              y1={verticalForVariance(tick)}
              x2={MARGIN_LEFT + PLOT_WIDTH}
              y2={verticalForVariance(tick)}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeWidth={1}
            />
            <text
              x={MARGIN_LEFT - 6}
              y={verticalForVariance(tick) + 3}
              textAnchor="end"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {tick.toFixed(2)}
            </text>
          </g>
        ))}

        {MEMBER_TICKS.map((tick) => (
          <text
            key={`m${tick}`}
            x={horizontalForMembers(tick)}
            y={MARGIN_TOP + PLOT_HEIGHT + 14}
            textAnchor="middle"
            className="fill-slate-500 text-[10px] dark:fill-slate-400"
          >
            {tick}
          </text>
        ))}

        {chart &&
          chart.curves.map((curve, curveIndex) => {
            const palette = CURVE_PALETTES[curveIndex % CURVE_PALETTES.length];
            return (
              <g key={`floor${curveIndex}`}>
                <line
                  x1={MARGIN_LEFT}
                  y1={verticalForVariance(curve.correlation)}
                  x2={MARGIN_LEFT + PLOT_WIDTH}
                  y2={verticalForVariance(curve.correlation)}
                  stroke="currentColor"
                  className={palette.line}
                  strokeWidth={1}
                  strokeDasharray="5 4"
                  opacity={0.6}
                />
                <text
                  x={MARGIN_LEFT + PLOT_WIDTH + 6}
                  y={verticalForVariance(curve.correlation) + 3}
                  textAnchor="start"
                  className={`${palette.label} text-[10px] font-medium`}
                >
                  floor {curve.correlation.toFixed(1)}
                </text>
              </g>
            );
          })}

        {chart &&
          chart.curves.map((curve, curveIndex) => (
            <polyline
              key={`curve${curveIndex}`}
              points={polylinePoints(chart.members, curve)}
              fill="none"
              stroke="currentColor"
              className={CURVE_PALETTES[curveIndex % CURVE_PALETTES.length].line}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          ))}

        <text
          x={MARGIN_LEFT + PLOT_WIDTH / 2}
          y={VIEW_HEIGHT - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Committee size
        </text>
        <text
          x={12}
          y={MARGIN_TOP + PLOT_HEIGHT / 2}
          textAnchor="middle"
          transform={`rotate(-90 12 ${MARGIN_TOP + PLOT_HEIGHT / 2})`}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Variance of the average
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Each curve falls fast and then flattens onto its own floor, and no
        committee size digs below it.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {chart
          ? chart.curves.map((curve, curveIndex) => (
              <Stat
                key={`stat${curveIndex}`}
                label={`Correlation ${curve.correlation.toFixed(1)}, at ${MEMBER_COUNT} members`}
                value={curve.variances[curve.variances.length - 1].toFixed(3)}
              />
            ))
          : CURVE_PALETTES.map((palette, placeholderIndex) => (
              <Stat
                key={`stat${placeholderIndex}`}
                label={`Variance at ${MEMBER_COUNT} members`}
                value="…"
              />
            ))}
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
