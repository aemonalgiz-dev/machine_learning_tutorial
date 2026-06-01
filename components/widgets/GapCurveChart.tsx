"use client";

// The training curve and the held-out curve, finally on one chart.
//
// Every degree from 1 to 9 is offered the same fifteen noisy measurements of
// the thrown ball. Each fit is scored twice, once on the rows it trained on
// and once on rows held back from it. The training scores ratchet upward
// exactly as the degree sweep promised. The held-out scores rise with them
// only while the extra capacity is buying real shape, then turn and collapse,
// and near degree 9 they collapse so far the axis cannot hold them, which is
// what the small arrows pinned to the bottom edge mean. Both curves come from
// the API; the browser only scales and clamps for drawing.

import { useEffect, useState } from "react";
import { ApiError, GapCurve, Point, traceGapCurve } from "@/lib/api";

const VIEW = { width: 640, height: 360 };
const PAD = { left: 52, right: 16, top: 34, bottom: 52 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const AXIS_TOP = 1.05;
const AXIS_BOTTOM = -1;
const AXIS_TICKS: number[] = [-1, 0, 1];
const GUIDE_LINES: number[] = [0, 1];

// The polynomial page's full throw, the same fifteen noisy measurements the
// degree sweep scored. Reusing them is the point, this chart is that chart
// with the honest half added.
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

interface DrawnScore {
  degree: number;
  pixelX: number;
  pixelY: number;
  clamped: boolean;
}

function toPixelY(score: number): number {
  const clamped = Math.max(AXIS_BOTTOM, Math.min(AXIS_TOP, score));
  return PAD.top + ((AXIS_TOP - clamped) / (AXIS_TOP - AXIS_BOTTOM)) * PLOT.height;
}

function toPixelX(
  degree: number,
  lowestDegree: number,
  highestDegree: number,
): number {
  return (
    PAD.left + ((degree - lowestDegree) / (highestDegree - lowestDegree)) * PLOT.width
  );
}

function toDrawnScores(degrees: number[], scores: number[]): DrawnScore[] {
  const lowestDegree = degrees[0];
  const highestDegree = degrees[degrees.length - 1];
  return degrees.map((degree, position) => {
    const score = scores[position];
    return {
      degree,
      pixelX: toPixelX(degree, lowestDegree, highestDegree),
      pixelY: toPixelY(score),
      clamped: score < AXIS_BOTTOM,
    };
  });
}

function toPolylinePoints(drawnScores: DrawnScore[]): string {
  return drawnScores
    .map((drawnScore) => `${drawnScore.pixelX},${drawnScore.pixelY}`)
    .join(" ");
}

export function GapCurveChart() {
  const [curve, setCurve] = useState<GapCurve | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCurve(await traceGapCurve(NOISY_THROW));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const trainingDrawn = curve
    ? toDrawnScores(curve.degrees, curve.train_scores)
    : [];
  const heldOutDrawn = curve
    ? toDrawnScores(curve.degrees, curve.held_out_scores)
    : [];

  const degreeNinePosition = curve ? curve.degrees.indexOf(9) : -1;
  const trainingAtNine =
    curve && degreeNinePosition >= 0
      ? curve.train_scores[degreeNinePosition].toFixed(3)
      : "…";
  const heldOutAtNine =
    curve && degreeNinePosition >= 0
      ? curve.held_out_scores[degreeNinePosition].toFixed(0)
      : "…";

  let bestHeldOutDegree = "…";
  if (curve && curve.held_out_scores.length > 0) {
    let bestPosition = 0;
    for (
      let candidatePosition = 1;
      candidatePosition < curve.held_out_scores.length;
      candidatePosition++
    ) {
      if (
        curve.held_out_scores[candidatePosition] >
        curve.held_out_scores[bestPosition]
      ) {
        bestPosition = candidatePosition;
      }
    }
    bestHeldOutDegree = curve.degrees[bestPosition].toFixed(0);
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {GUIDE_LINES.map((guide) => (
          <line
            key={`guide-${guide}`}
            x1={PAD.left}
            y1={toPixelY(guide)}
            x2={PAD.left + PLOT.width}
            y2={toPixelY(guide)}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
          />
        ))}

        {AXIS_TICKS.map((tick) => (
          <text
            key={`tick-${tick}`}
            x={PAD.left - 10}
            y={toPixelY(tick) + 4}
            textAnchor="end"
            className="fill-slate-400 text-[11px]"
          >
            {tick.toFixed(0)}
          </text>
        ))}

        {trainingDrawn.length > 0 && (
          <polyline
            points={toPolylinePoints(trainingDrawn)}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="text-indigo-500 dark:text-indigo-400"
          />
        )}
        {heldOutDrawn.length > 0 && (
          <polyline
            points={toPolylinePoints(heldOutDrawn)}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="text-amber-500 dark:text-amber-400"
          />
        )}

        {trainingDrawn.map((drawnScore) => (
          <circle
            key={`training-dot-${drawnScore.degree}`}
            cx={drawnScore.pixelX}
            cy={drawnScore.pixelY}
            r={3.5}
            className="fill-indigo-500 dark:fill-indigo-400"
          />
        ))}
        {heldOutDrawn.map((drawnScore) => (
          <circle
            key={`held-out-dot-${drawnScore.degree}`}
            cx={drawnScore.pixelX}
            cy={drawnScore.pixelY}
            r={3.5}
            className="fill-amber-500 dark:fill-amber-400"
          />
        ))}

        {heldOutDrawn
          .filter((drawnScore) => drawnScore.clamped)
          .map((drawnScore) => (
            <path
              key={`held-out-arrow-${drawnScore.degree}`}
              d={`M ${drawnScore.pixelX - 4} ${drawnScore.pixelY + 4} L ${drawnScore.pixelX + 4} ${drawnScore.pixelY + 4} L ${drawnScore.pixelX} ${drawnScore.pixelY + 11} Z`}
              className="fill-amber-500 dark:fill-amber-400"
            />
          ))}

        {curve?.degrees.map((degree) => (
          <text
            key={`degree-label-${degree}`}
            x={toPixelX(degree, curve.degrees[0], curve.degrees[curve.degrees.length - 1])}
            y={PAD.top + PLOT.height + 24}
            textAnchor="middle"
            className="fill-slate-400 text-[11px]"
          >
            {degree}
          </text>
        ))}

        <g>
          <line
            x1={PAD.left + 8}
            y1={16}
            x2={PAD.left + 34}
            y2={16}
            stroke="currentColor"
            strokeWidth={2}
            className="text-indigo-500 dark:text-indigo-400"
          />
          <circle
            cx={PAD.left + 21}
            cy={16}
            r={3}
            className="fill-indigo-500 dark:fill-indigo-400"
          />
          <text
            x={PAD.left + 40}
            y={20}
            className="fill-slate-600 text-[11px] font-medium dark:fill-slate-300"
          >
            Training R²
          </text>
          <line
            x1={PAD.left + 128}
            y1={16}
            x2={PAD.left + 154}
            y2={16}
            stroke="currentColor"
            strokeWidth={2}
            className="text-amber-500 dark:text-amber-400"
          />
          <circle
            cx={PAD.left + 141}
            cy={16}
            r={3}
            className="fill-amber-500 dark:fill-amber-400"
          />
          <text
            x={PAD.left + 160}
            y={20}
            className="fill-slate-600 text-[11px] font-medium dark:fill-slate-300"
          >
            Held-out R²
          </text>
        </g>

        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Degree
        </text>
        <text
          x={14}
          y={PAD.top + PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${PAD.top + PLOT.height / 2})`}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          R²
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The indigo curve can only climb as the degree rises, while the amber
        one turns around, and the turn is where honest capacity ends.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="Training at degree 9" value={trainingAtNine} />
        <Stat label="Held out at degree 9" value={heldOutAtNine} />
        <Stat label="Best held-out degree" value={bestHeldOutDegree} />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
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
