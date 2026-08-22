"use client";

// The two scores against the degree, on one pair of axes.
//
// One line is the score on the fifteen people the fit saw and the other the
// score on the seven it did not, at every degree from one up to the degree where
// the fit has as many numbers as people. The second line leaves the frame
// downward, so the vertical axis is clamped and a marker says where each reading
// really is. A third line, when a penalty is switched on, is the same degrees
// with the fitted weights shrunk. The API fits every degree and the browser
// draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { DegreeGap, sweepDegreeGap } from "@/lib/concepts/polynomial-features";
import { CROWD, formatScore } from "./polynomialFeaturesFixtures";

const VIEW = { width: 640, height: 360 };
const PAD = { left: 52, right: 16, top: 20, bottom: 44 };
const FLOOR = 0.5;
const CEILING = 1.0;

const PENALTIES = [0, 0.001, 0.1];

export function DegreeGapCurves() {
  const [penaltyStep, setPenaltyStep] = useState(0);
  const [answer, setAnswer] = useState<DegreeGap | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const penalty = PENALTIES[penaltyStep];

  useEffect(() => {
    let cancelled = false;
    sweepDegreeGap(CROWD, 14, [0.001, 0.1])
      .then((swept) => {
        if (!cancelled) {
          setAnswer(swept);
          setMessage(null);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!answer) {
    return (
      <div className="my-4 text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </div>
    );
  }

  const degrees = answer.readings.map((reading) => reading.degree);
  const lowest = Math.min(...degrees);
  const highest = Math.max(...degrees);

  const toPixel = (degree: number, score: number) => ({
    px:
      PAD.left +
      ((degree - lowest) / Math.max(1, highest - lowest)) *
        (VIEW.width - PAD.left - PAD.right),
    py:
      VIEW.height -
      PAD.bottom -
      ((Math.max(FLOOR, Math.min(CEILING, score)) - FLOOR) /
        (CEILING - FLOOR)) *
        (VIEW.height - PAD.top - PAD.bottom),
  });

  const pathOf = (pick: (index: number) => number) =>
    answer.readings
      .map((reading, index) => {
        const { px, py } = toPixel(reading.degree, pick(index));
        return `${index === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`;
      })
      .join(" ");

  const penalisedAt = (index: number) => {
    const found = answer.readings[index].penalised.find(
      (reading) => reading.penalty === penalty,
    );
    return found ? found.held_out_r_squared : answer.readings[index].held_out_r_squared;
  };

  const belowFloor = answer.readings.filter(
    (reading) => reading.held_out_r_squared < FLOOR,
  );

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-4 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          Penalty on the third line
          <input
            type="range"
            min={0}
            max={PENALTIES.length - 1}
            step={1}
            value={penaltyStep}
            onChange={(event) => setPenaltyStep(Number(event.target.value))}
            className="w-28 accent-emerald-600"
          />
          <span className="w-12 font-mono text-sm">{penalty}</span>
        </label>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {[0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((mark) => {
          const { py } = toPixel(lowest, mark);
          return (
            <g key={mark}>
              <line
                x1={PAD.left}
                y1={py}
                x2={VIEW.width - PAD.right}
                y2={py}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={py + 4}
                textAnchor="end"
                className="fill-slate-500 text-[10px] dark:fill-slate-400"
              >
                {mark.toFixed(1)}
              </text>
            </g>
          );
        })}
        {degrees.map((degree) => {
          const { px } = toPixel(degree, FLOOR);
          return (
            <text
              key={degree}
              x={px}
              y={VIEW.height - PAD.bottom + 16}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {degree}
            </text>
          );
        })}
        <text
          x={VIEW.width - PAD.right}
          y={VIEW.height - 10}
          textAnchor="end"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          degree
        </text>

        {penalty > 0 && (
          <path
            d={pathOf(penalisedAt)}
            fill="none"
            strokeWidth={2}
            strokeDasharray="5 4"
            className="stroke-emerald-600 dark:stroke-emerald-400"
          />
        )}
        <path
          d={pathOf((index) => answer.readings[index].train_r_squared)}
          fill="none"
          strokeWidth={2.5}
          className="stroke-indigo-500"
        />
        <path
          d={pathOf((index) => answer.readings[index].held_out_r_squared)}
          fill="none"
          strokeWidth={2.5}
          className="stroke-amber-500"
        />
        {answer.readings.map((reading) => {
          const { px, py } = toPixel(
            reading.degree,
            reading.held_out_r_squared,
          );
          const clipped = reading.held_out_r_squared < FLOOR;
          return (
            <circle
              key={reading.degree}
              cx={px}
              cy={py}
              r={clipped ? 5 : 3.5}
              className={
                clipped
                  ? "fill-rose-500 dark:fill-rose-400"
                  : "fill-amber-500 dark:fill-amber-400"
              }
            />
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="inline-block h-0.5 w-6 bg-indigo-500" />
          people the fit saw
        </span>
        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="inline-block h-0.5 w-6 bg-amber-500" />
          people it did not
        </span>
        {penalty > 0 && (
          <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="inline-block h-0.5 w-6 bg-emerald-600" />
            the same, weights shrunk
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Best on the held-back people"
          value={`degree ${answer.best_held_out_degree}, ${formatScore(answer.best_held_out_score)}`}
        />
        <Stat
          label="Worst"
          value={`degree ${answer.worst_held_out_degree}, ${formatScore(answer.worst_held_out_score, 1)}`}
        />
        <Stat
          label="Score on the fitted people there"
          value={formatScore(
            answer.readings[answer.readings.length - 1].train_r_squared,
          )}
        />
        <Stat
          label="Where the numbers run out"
          value={`degree ${answer.interpolating_degree}`}
        />
      </div>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        The vertical axis stops at 0.5, and the {belowFloor.length} rose markers
        are readings below it, pinned to the floor rather than drawn where they
        belong. The lowest of them is{" "}
        {formatScore(answer.worst_held_out_score, 1)}.
      </p>

      {message && (
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
