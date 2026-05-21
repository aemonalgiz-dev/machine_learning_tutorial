"use client";

// Six polynomial fits of the ideal throw, scored side by side.
//
// Each bar is one degree offered to the same five exact measurements of the
// thrown ball, and its height is the R-squared that fit earns on the very
// rows it trained on. Degree 2 recovers the physics, and the bars barely
// move after it, yet none of them ever comes back down. A higher degree can
// always reuse the lower one's curve and bend a little closer besides, so
// the training score is a ratchet. The sweep is the library's through the
// API; the browser only draws the bars.

import { useEffect, useState } from "react";
import { ApiError, DegreeScore, Point, sweepDegrees } from "@/lib/api";

const VIEW = { width: 640, height: 360 };
const PAD = { left: 52, right: 16, top: 30, bottom: 52 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const MAX_DEGREE = 6;

const AXIS_TICKS: number[] = [0, 0.25, 0.5, 0.75, 1];

// The polynomial page's full throw, fifteen noisy measurements, the very
// data the section walks the degree upward on. Noise is the point here, a
// clean arc would jump to 1.000 at degree 2 and leave the bars nothing to
// show about chasing it.
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

function toPixelY(rSquared: number): number {
  const clamped = Math.max(0, Math.min(1, rSquared));
  return PAD.top + (1 - clamped) * PLOT.height;
}

function readoutAtDegree(scores: DegreeScore[] | null, degree: number): string {
  if (!scores) return "…";
  const found = scores.find((score) => score.degree === degree);
  return found ? found.r_squared.toFixed(3) : "…";
}

export function DegreeSweepChart() {
  const [scores, setScores] = useState<DegreeScore[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const sweep = await sweepDegrees(NOISY_THROW, MAX_DEGREE);
        setScores(sweep.scores);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const highest =
    scores && scores.length > 0
      ? scores.reduce((best, candidate) =>
          candidate.degree > best.degree ? candidate : best,
        )
      : null;

  const slotWidth = scores && scores.length > 0 ? PLOT.width / scores.length : 0;
  const barWidth = slotWidth * 0.6;

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {AXIS_TICKS.map((tick) => (
          <g key={`tick-${tick}`}>
            <line
              x1={PAD.left}
              y1={toPixelY(tick)}
              x2={PAD.left + PLOT.width}
              y2={toPixelY(tick)}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
            />
            <text
              x={PAD.left - 10}
              y={toPixelY(tick) + 4}
              textAnchor="end"
              className="fill-slate-400 text-[11px]"
            >
              {tick.toFixed(2)}
            </text>
          </g>
        ))}

        {scores?.map((score, index) => {
          const barLeft = PAD.left + slotWidth * index + (slotWidth - barWidth) / 2;
          const barTop = toPixelY(score.r_squared);
          const barCenter = barLeft + barWidth / 2;
          return (
            <g key={`bar-${score.degree}`}>
              <rect
                x={barLeft}
                y={barTop}
                width={barWidth}
                height={PAD.top + PLOT.height - barTop}
                rx={3}
                className="fill-indigo-500 dark:fill-indigo-400"
              />
              <text
                x={barCenter}
                y={barTop - 6}
                textAnchor="middle"
                className="fill-slate-600 text-[11px] font-medium dark:fill-slate-300"
              >
                {score.r_squared.toFixed(3)}
              </text>
              <text
                x={barCenter}
                y={PAD.top + PLOT.height + 20}
                textAnchor="middle"
                className="fill-slate-400 text-[11px]"
              >
                {score.degree}
              </text>
            </g>
          );
        })}

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
          R² on the training rows
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The bars can only climb or hold as the degree rises, which is exactly
        why the training score cannot be the judge.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="R² at degree 1" value={readoutAtDegree(scores, 1)} />
        <Stat label="R² at degree 2" value={readoutAtDegree(scores, 2)} />
        <Stat
          label={highest ? `R² at degree ${highest.degree}` : "R² at the top degree"}
          value={highest ? highest.r_squared.toFixed(3) : "…"}
        />
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
