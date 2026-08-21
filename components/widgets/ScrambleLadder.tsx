"use client";

// What scrambling one column did to the score, drawn as a ladder.
//
// Each lane is one model fitted on the worked draw of the parity puzzle, the
// lone tree above and the forest below. The dashed line in a lane is the
// model's accuracy with every column intact, and each dot is its accuracy
// after that one column was scrambled, averaged over the five scrambles the
// library makes. The bar from dot to dashed line is the drop, which is the
// raw quantity the permutation reading normalises. A column the model leans
// on sends its dot a long way left; a column it never consulted leaves its
// dot on the line, and a column the model was slightly better off without
// puts its dot to the right of it. The switch chooses whether the rows
// scrambled are the ones the model learned or the ones it never saw. Every
// score, drop and total is the library's through the API; the browser only
// places them on the axis.

import { useEffect, useState } from "react";
import {
  ApiError,
  ImportanceMeasurement,
  RowChoice,
  ScrambleReading,
  WORKED_ROWS,
  WORKED_SEED,
  measureImportance,
} from "@/lib/concepts/feature-importance";
import { labelFor } from "./featureImportanceFixtures";

const VIEW = { width: 640, height: 320 };
const PAD = { left: 104, right: 28 };
const PLOT_WIDTH = VIEW.width - PAD.left - PAD.right;

const SCORE_LOW = 0.4;
const SCORE_HIGH = 1.0;
const SCORE_TICKS = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

const ROW_SPACING = 30;
const LANE_TOPS = [24, 164];
const LANE_TITLES = ["Lone tree", "Forest"];
const AXIS_Y = 278;

function scoreToX(score: number): number {
  const clamped = Math.min(SCORE_HIGH, Math.max(SCORE_LOW, score));
  return (
    PAD.left + ((clamped - SCORE_LOW) / (SCORE_HIGH - SCORE_LOW)) * PLOT_WIDTH
  );
}

function strokeFor(name: string): string {
  return name === "distractor"
    ? "text-amber-500 dark:text-amber-400"
    : "text-indigo-600 dark:text-indigo-400";
}

function dotFor(name: string): string {
  return name === "distractor" ? "fill-amber-500" : "fill-indigo-600";
}

function Lane({
  reading,
  top,
  title,
}: {
  reading: ScrambleReading;
  top: number;
  title: string;
}) {
  const intactX = scoreToX(reading.intact_score);
  const firstRowY = top + 24;
  const lastRowY = firstRowY + (reading.steps.length - 1) * ROW_SPACING;

  return (
    <g>
      <text
        x={12}
        y={top + 4}
        className="fill-slate-700 text-xs font-semibold dark:fill-slate-200"
      >
        {title}
      </text>
      <text
        x={intactX}
        y={top + 4}
        textAnchor="middle"
        className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
      >
        {`intact ${reading.intact_score.toFixed(3)}`}
      </text>
      <line
        x1={intactX}
        y1={firstRowY - 14}
        x2={intactX}
        y2={lastRowY + 14}
        stroke="currentColor"
        strokeDasharray="4 3"
        className="text-slate-500 dark:text-slate-400"
        strokeWidth={1.5}
      />
      {reading.steps.map((step, index) => {
        const y = firstRowY + index * ROW_SPACING;
        const dotX = scoreToX(step.shuffled_score);
        const leftOfLine = dotX <= intactX;
        return (
          <g key={step.name}>
            <text
              x={PAD.left - 10}
              y={y + 4}
              textAnchor="end"
              className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
            >
              {labelFor(step.name)}
            </text>
            <line
              x1={PAD.left}
              y1={y}
              x2={PAD.left + PLOT_WIDTH}
              y2={y}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeWidth={1}
            />
            <line
              x1={dotX}
              y1={y}
              x2={intactX}
              y2={y}
              stroke="currentColor"
              className={strokeFor(step.name)}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <circle
              cx={dotX}
              cy={y}
              r={5}
              className={dotFor(step.name) + " stroke-white dark:stroke-slate-900"}
              strokeWidth={1.5}
            />
            <text
              x={leftOfLine ? dotX - 10 : dotX + 10}
              y={y + 4}
              textAnchor={leftOfLine ? "end" : "start"}
              className="fill-slate-700 font-mono text-[10px] dark:fill-slate-200"
            >
              {`drop ${step.drop.toFixed(4)}`}
            </text>
          </g>
        );
      })}
    </g>
  );
}

const buttonClass = (active: boolean) =>
  "rounded-md px-3 py-1.5 text-sm font-medium transition " +
  (active
    ? "bg-indigo-600 text-white"
    : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700");

export function ScrambleLadder({ initialRows = "training" }: { initialRows?: RowChoice }) {
  const [rows, setRows] = useState<RowChoice>(initialRows);
  const [measurement, setMeasurement] = useState<ImportanceMeasurement | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setMeasurement(await measureImportance(WORKED_ROWS, WORKED_SEED));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const forest = measurement ? measurement.forest[rows] : null;
  const forestNoiseShare = forest?.shares
    ? forest.shares.find((entry) => entry.name === "distractor")?.share
    : undefined;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <span className="text-sm text-slate-600 dark:text-slate-300">Rows scrambled</span>
        <div className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          <button onClick={() => setRows("training")} className={buttonClass(rows === "training")}>
            The rows it learned
          </button>
          <button onClick={() => setRows("held_out")} className={buttonClass(rows === "held_out")}>
            Rows it never saw
          </button>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {measurement &&
          [measurement.lone_tree[rows], measurement.forest[rows]].map((reading, index) => (
            <Lane
              key={LANE_TITLES[index]}
              reading={reading}
              top={LANE_TOPS[index]}
              title={LANE_TITLES[index]}
            />
          ))}

        <line
          x1={PAD.left}
          y1={AXIS_Y}
          x2={PAD.left + PLOT_WIDTH}
          y2={AXIS_Y}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1}
        />
        {SCORE_TICKS.map((tick) => (
          <g key={`t${tick}`}>
            <line
              x1={scoreToX(tick)}
              y1={AXIS_Y}
              x2={scoreToX(tick)}
              y2={AXIS_Y + 5}
              stroke="currentColor"
              className="text-slate-300 dark:text-slate-700"
              strokeWidth={1}
            />
            <text
              x={scoreToX(tick)}
              y={AXIS_Y + 18}
              textAnchor="middle"
              className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
            >
              {tick.toFixed(1)}
            </text>
          </g>
        ))}
        <text
          x={PAD.left + PLOT_WIDTH / 2}
          y={VIEW.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          {rows === "training"
            ? "Accuracy on the rows the model learned, one column scrambled"
            : "Accuracy on rows the model never saw, one column scrambled"}
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The dashed line is the intact score, each dot is the score with that
        column scrambled, and the bar between them is the drop. A dot to the
        right of the line is a negative drop, which the reading clamps to zero.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Forest, intact"
          value={forest ? forest.intact_score.toFixed(3) : "…"}
        />
        <Stat
          label="Forest, clamped drops summed"
          value={forest ? forest.drop_total.toFixed(4) : "…"}
        />
        <Stat
          label="Noise column's share"
          value={
            forestNoiseShare !== undefined ? forestNoiseShare.toFixed(3) : "…"
          }
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
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
