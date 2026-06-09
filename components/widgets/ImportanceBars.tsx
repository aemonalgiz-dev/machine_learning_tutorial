"use client";

// Two questions put to one fitted model, drawn as two rows of bars.
//
// The data is the parity puzzle, two coin-flip columns whose disagreement is
// the class and a third column of pure noise, and the API fits a lone tree
// and a random forest on every draw of it. The left bars read the fitted
// model's own splits, crediting each feature with the impurity its questions
// removed. The right bars scramble one column at a time and credit each
// feature with how far the accuracy fell, on the rows the model learned or
// on as many rows it never saw, whichever the switch says. The noise column
// is amber so the eye can follow it across the two readings, and the toggle
// swaps which model is being asked. Every share and every accuracy is the
// library's through the API; the browser only scales them to pixels.

import { useEffect, useState } from "react";
import {
  ApiError,
  ImportanceMeasurement,
  ImportanceShare,
  MAX_ROWS,
  MAX_SEED,
  MIN_ROWS,
  ModelReport,
  RowChoice,
  WORKED_ROWS,
  WORKED_SEED,
  measureImportance,
} from "@/lib/concepts/feature-importance";
import { fillFor, labelFor } from "./featureImportanceFixtures";

type ModelChoice = "lone_tree" | "forest";

const BAR_VIEW = { width: 320, height: 120 };
const LABEL_WIDTH = 96;
const VALUE_WIDTH = 52;
const BAR_HEIGHT = 22;
const ROW_GAP = 14;
const TOP = 12;
const BAR_SPAN = BAR_VIEW.width - LABEL_WIDTH - VALUE_WIDTH;

const ROW_STEP = 50;

// The rows shown while the first answer is still on its way.
const EMPTY_ROWS: ImportanceShare[] = [
  { name: "first", share: 0 },
  { name: "second", share: 0 },
  { name: "distractor", share: 0 },
];

function ShareBars({
  title,
  shares,
  leading,
}: {
  title: string;
  shares: ImportanceShare[] | null;
  leading: string | null;
}) {
  const rows = shares ?? EMPTY_ROWS;

  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {title}
      </h3>
      <svg
        viewBox={`0 0 ${BAR_VIEW.width} ${BAR_VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {rows.map((entry, index) => {
          const y = TOP + index * (BAR_HEIGHT + ROW_GAP);
          const middle = y + BAR_HEIGHT / 2 + 4;
          const leads = leading !== null && entry.name === leading;
          return (
            <g key={entry.name}>
              <text
                x={LABEL_WIDTH - 8}
                y={middle}
                textAnchor="end"
                className={
                  "text-xs " +
                  (leads
                    ? "fill-slate-900 font-semibold dark:fill-slate-100"
                    : "fill-slate-500 font-medium dark:fill-slate-400")
                }
              >
                {labelFor(entry.name)}
              </text>
              <rect
                x={LABEL_WIDTH}
                y={y}
                width={BAR_SPAN}
                height={BAR_HEIGHT}
                rx={3}
                className="fill-slate-200 dark:fill-slate-800"
              />
              {entry.share > 0 && (
                <rect
                  x={LABEL_WIDTH}
                  y={y}
                  width={entry.share * BAR_SPAN}
                  height={BAR_HEIGHT}
                  rx={3}
                  className={fillFor(entry.name)}
                />
              )}
              <text
                x={LABEL_WIDTH + BAR_SPAN + 8}
                y={middle}
                className="fill-slate-700 font-mono text-xs dark:fill-slate-200"
              >
                {shares ? entry.share.toFixed(3) : "…"}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const buttonClass = (active: boolean) =>
  "rounded-md px-3 py-1.5 text-sm font-medium transition " +
  (active
    ? "bg-indigo-600 text-white"
    : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700");

export function ImportanceBars() {
  const [rowCount, setRowCount] = useState(WORKED_ROWS);
  const [seed, setSeed] = useState(WORKED_SEED);
  const [choice, setChoice] = useState<ModelChoice>("forest");
  const [rows, setRows] = useState<RowChoice>("training");
  const [measurement, setMeasurement] = useState<ImportanceMeasurement | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setMeasurement(await measureImportance(rowCount, seed));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [rowCount, seed]);

  const report: ModelReport | null = measurement
    ? choice === "forest"
      ? measurement.forest
      : measurement.lone_tree
    : null;
  const scramble = report ? report[rows] : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => {
            setRowCount(WORKED_ROWS);
            setSeed(WORKED_SEED);
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          The worked draw
        </button>
        <button
          onClick={() => setSeed((current) => (current + 1) % (MAX_SEED + 1))}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Redraw the rows
        </button>
        <div className="ml-auto flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          <button onClick={() => setChoice("lone_tree")} className={buttonClass(choice === "lone_tree")}>
            Lone tree
          </button>
          <button onClick={() => setChoice("forest")} className={buttonClass(choice === "forest")}>
            Forest
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          Rows
          <input
            type="range"
            min={MIN_ROWS}
            max={MAX_ROWS}
            step={ROW_STEP}
            value={rowCount}
            onChange={(event) => setRowCount(Number(event.target.value))}
            className="w-36 accent-indigo-600"
          />
          <span className="w-8 font-mono text-sm">{rowCount}</span>
        </label>
        <span>
          Draw <span className="font-mono">{seed}</span>
        </span>
        <div className="ml-auto flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          <button onClick={() => setRows("training")} className={buttonClass(rows === "training")}>
            Scramble its rows
          </button>
          <button onClick={() => setRows("held_out")} className={buttonClass(rows === "held_out")}>
            Scramble held-out rows
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ShareBars
          title="Reading the splits"
          shares={report?.impurity ?? null}
          leading={report?.leading_by_impurity ?? null}
        />
        <ShareBars
          title={rows === "training" ? "Scrambling a column, on its rows" : "Scrambling a column, held out"}
          shares={scramble?.shares ?? null}
          leading={scramble?.leading ?? null}
        />
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Each row of bars sums to one. The amber column is pure noise, and the
        class is 1 exactly when the two coin flips disagree.
      </p>

      {scramble?.refusal && (
        <p className="mt-2 text-center text-xs text-amber-600 dark:text-amber-400">
          No column&rsquo;s scramble lowered the score, so there are no shares
          to report, and the library&rsquo;s own words are &ldquo;{scramble.refusal}&rdquo;.
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Accuracy on its rows"
          value={report ? report.training_accuracy.toFixed(3) : "…"}
        />
        <Stat
          label="Accuracy held out"
          value={report ? report.held_out_accuracy.toFixed(3) : "…"}
        />
        <Stat
          label="Leads by the splits"
          value={report ? labelFor(report.leading_by_impurity) : "…"}
        />
        <Stat
          label="Leads by scrambling"
          value={scramble ? (scramble.leading ? labelFor(scramble.leading) : "none") : "…"}
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
