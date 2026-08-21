"use client";

// The two numbers that fall as the walk goes on, and what they leave moving.
//
// The upper chart draws the step and the reach against the epoch, each scaled
// to its own starting value so the two shapes can be compared on one pair of
// axes. The step falls geometrically and the reach falls in a straight line,
// which is not decoration: the step matters by its order of magnitude and the
// reach is counted in cells, so the middle of the walk should be the middle of
// its range. The lower chart counts how many cells still take at least a
// thousandth of the winner's step, which is the reach expressed as a number of
// cells rather than as a width. Drag the epoch marker to read any point of the
// walk. The API reads both curves out of the library's own schedules and runs
// the library's own neighbourhood at each; the browser draws them.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  EpochSchedule,
  Schedules,
  readSchedules,
} from "@/lib/concepts/self-organising-map";
import { SLIDER_LABEL_CLASS, STAT_CLASS } from "./selfOrganisingMapFixtures";

const CURVE = { width: 640, height: 220 };
const COUNT = { width: 640, height: 150 };
const PAD = { left: 52, right: 20, top: 18, bottom: 34 };

const STEP_COLOUR = "#4f46e5";
const REACH_COLOUR = "#f59e0b";
const COUNT_COLOUR = "#0ea5e9";

export function ReachAndStepCurves({
  gridWidth = 3,
  gridHeight = 3,
  maxEpochs = 100,
}: {
  gridWidth?: number;
  gridHeight?: number;
  maxEpochs?: number;
}) {
  const [answer, setAnswer] = useState<Schedules | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [epoch, setEpoch] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await readSchedules(gridWidth, gridHeight, maxEpochs));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [gridWidth, gridHeight, maxEpochs]);

  if (!answer) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const first = answer.epochs[0];
  const here: EpochSchedule = answer.epochs[Math.min(epoch, maxEpochs) - 1];

  const innerWidth = CURVE.width - PAD.left - PAD.right;
  const curveHeight = CURVE.height - PAD.top - PAD.bottom;
  const countHeight = COUNT.height - PAD.top - PAD.bottom;
  const atEpoch = (value: number) =>
    PAD.left + ((value - 1) / Math.max(1, maxEpochs - 1)) * innerWidth;
  const atShare = (share: number) => PAD.top + (1 - share) * curveHeight;
  const atCount = (count: number) =>
    PAD.top + (1 - count / answer.n_units) * countHeight;

  const path = (read: (point: EpochSchedule) => number, top: number) =>
    answer.epochs
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"}${atEpoch(point.epoch)},${atShare(read(point) / top)}`,
      )
      .join(" ");

  const countPath = answer.epochs
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${atEpoch(point.epoch)},${atCount(point.moving_units)}`,
    )
    .join(" ");

  return (
    <div>
      <label className={SLIDER_LABEL_CLASS + " pb-2"}>
        Epoch
        <input
          type="range"
          min={1}
          max={maxEpochs}
          step={1}
          value={epoch}
          onChange={(event) => setEpoch(Number(event.target.value))}
          className="w-48 accent-indigo-600"
        />
        <span className="w-10 font-mono text-sm">{here.epoch}</span>
      </label>

      <svg
        viewBox={`0 0 ${CURVE.width} ${CURVE.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <path
          d={path((point) => point.rate, first.rate)}
          fill="none"
          stroke={STEP_COLOUR}
          strokeWidth={2.5}
        />
        <path
          d={path((point) => point.radius, first.radius)}
          fill="none"
          stroke={REACH_COLOUR}
          strokeWidth={2.5}
        />
        <line
          x1={atEpoch(here.epoch)}
          x2={atEpoch(here.epoch)}
          y1={PAD.top}
          y2={CURVE.height - PAD.bottom}
          className="stroke-slate-400 dark:stroke-slate-500"
          strokeWidth={1.5}
        />
        <circle
          cx={atEpoch(here.epoch)}
          cy={atShare(here.rate / first.rate)}
          r={5}
          fill={STEP_COLOUR}
        />
        <circle
          cx={atEpoch(here.epoch)}
          cy={atShare(here.radius / first.radius)}
          r={5}
          fill={REACH_COLOUR}
        />
        <text
          x={PAD.left + 8}
          y={PAD.top + 14}
          className="text-[11px] font-semibold"
          fill={STEP_COLOUR}
        >
          the step, as a share of its start
        </text>
        <text
          x={PAD.left + 8}
          y={PAD.top + 30}
          className="text-[11px] font-semibold"
          fill={REACH_COLOUR}
        >
          the reach, as a share of its start
        </text>
        <text
          x={PAD.left - 6}
          y={PAD.top + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          1
        </text>
        <text
          x={PAD.left - 6}
          y={CURVE.height - PAD.bottom + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          0
        </text>
      </svg>

      <svg
        viewBox={`0 0 ${COUNT.width} ${COUNT.height}`}
        className="mt-2 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <path
          d={countPath}
          fill="none"
          stroke={COUNT_COLOUR}
          strokeWidth={2.5}
        />
        <line
          x1={atEpoch(here.epoch)}
          x2={atEpoch(here.epoch)}
          y1={PAD.top}
          y2={COUNT.height - PAD.bottom}
          className="stroke-slate-400 dark:stroke-slate-500"
          strokeWidth={1.5}
        />
        <circle
          cx={atEpoch(here.epoch)}
          cy={atCount(here.moving_units)}
          r={5}
          fill={COUNT_COLOUR}
        />
        <text
          x={PAD.left + 8}
          y={PAD.top + 14}
          className="text-[11px] font-semibold"
          fill={COUNT_COLOUR}
        >
          {`cells taking a thousandth of the winner's step, of ${answer.n_units}`}
        </text>
        {[1, maxEpochs].map((tick) => (
          <text
            key={tick}
            x={atEpoch(tick)}
            y={COUNT.height - PAD.bottom + 16}
            textAnchor="middle"
            className="fill-slate-500 text-[10px] dark:fill-slate-400"
          >
            {`epoch ${tick}`}
          </text>
        ))}
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="the step" value={here.rate.toFixed(4)} />
        <Stat label="the reach, in cells" value={here.radius.toFixed(3)} />
        <Stat
          label="share taken one cell away"
          value={
            here.neighbour_score < 0.001
              ? here.neighbour_score.toExponential(1)
              : here.neighbour_score.toFixed(4)
          }
        />
        <Stat
          label="cells still moving"
          value={`${here.moving_units} of ${answer.n_units}`}
        />
      </div>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={STAT_CLASS}>
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
