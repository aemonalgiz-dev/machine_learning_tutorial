"use client";

// One linear neuron, three losses, three lines, and one mistyped weight.
//
// The same people, the same neuron, the same four hundred steps, and the only
// thing that changes between the three lines is which loss handed the neuron
// its slope. The switch swaps one person's weight for its digits transposed,
// 72.5 kilograms entered as 27.5, and the three lines answer that one bad row
// by very different amounts. The closed-form least squares line is fetched
// alongside as a check that the squared-error walk arrived. Every fit is the
// library's through the API; the browser draws the lines.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import {
  DescendedLines,
  REGRESSION_LOSS_NAMES,
  RegressionLossName,
  descendLine,
} from "@/lib/concepts/loss-functions";
import {
  AMBER,
  GREEN,
  IDEAL_FIFTEEN,
  INDIGO,
  MISTYPED_PERSON,
  ROSE,
  WORKED_KNEE,
  randomPeople,
  show,
} from "./lossFixtures";

const VIEW = { width: 640, height: 360 };
const PAD = { left: 56, right: 16, top: 16, bottom: 40 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};
const DOMAIN = { xMin: 145, xMax: 200, yMin: 20, yMax: 100 };
const DEBOUNCE_MS = 120;

// The height the page reads each line's guess at, the mistyped person's own.
const READ_AT = MISTYPED_PERSON.x;

const LABELS: Record<RegressionLossName, string> = {
  squared_error: "squared error",
  absolute_error: "absolute error",
  huber_error: "Huber, knee 5 kg",
};

const COLOURS: Record<RegressionLossName, string> = {
  squared_error: INDIGO,
  absolute_error: AMBER,
  huber_error: GREEN,
};

const plotX = (height: number) =>
  PAD.left + ((height - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
const plotY = (weight: number) =>
  PAD.top + (1 - (weight - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height;

// The mistyped person replaces whoever shares their height, or joins the end
// when nobody does, so the switch always adds exactly one bad row.
function withMistyped(people: Point[], mistyped: boolean): Point[] {
  if (!mistyped) return people;
  const position = people.findIndex((person) => person.x === MISTYPED_PERSON.x);
  if (position < 0) return [...people, MISTYPED_PERSON];
  return people.map((person, index) => (index === position ? MISTYPED_PERSON : person));
}

export function ThreeLossesOneBadRow() {
  const [people, setPeople] = useState<Point[]>(IDEAL_FIFTEEN);
  const [mistyped, setMistyped] = useState(false);
  const [lines, setLines] = useState<DescendedLines | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const shown = withMistyped(people, mistyped);

  useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(async () => {
      try {
        const fitted = await descendLine(withMistyped(people, mistyped), WORKED_KNEE);
        if (!cancelled) {
          setLines(fitted);
          setMessage(null);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [people, mistyped]);

  const buttonClass =
    "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button type="button" onClick={() => setPeople(IDEAL_FIFTEEN)} className={buttonClass}>An Ideal Case</button>
        <button type="button" onClick={() => setPeople(randomPeople())} className={buttonClass}>Random people</button>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={mistyped} onChange={(event) => setMistyped(event.target.checked)} className="accent-rose-500" />
          one weight mistyped, 72.5 entered as 27.5
        </label>
      </div>

      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {lines &&
          REGRESSION_LOSS_NAMES.map((name) => {
            const line = lines[name];
            return (
              <line
                key={name}
                x1={plotX(DOMAIN.xMin)}
                y1={plotY(line.slope * DOMAIN.xMin + line.intercept)}
                x2={plotX(DOMAIN.xMax)}
                y2={plotY(line.slope * DOMAIN.xMax + line.intercept)}
                stroke={COLOURS[name]}
                strokeWidth={2}
                strokeDasharray={name === "huber_error" ? "6 4" : undefined}
              />
            );
          })}
        {shown.map((person, index) => {
          const bad = mistyped && person === MISTYPED_PERSON;
          return (
            <circle
              key={index}
              cx={plotX(person.x)}
              cy={plotY(Math.max(DOMAIN.yMin, Math.min(DOMAIN.yMax, person.y)))}
              r={bad ? 7 : 5.5}
              fill={bad ? ROSE : undefined}
              className={bad ? "stroke-white dark:stroke-slate-900" : "fill-slate-700 stroke-white dark:fill-slate-200 dark:stroke-slate-900"}
              strokeWidth={1.5}
            />
          );
        })}
        <line x1={plotX(READ_AT)} x2={plotX(READ_AT)} y1={PAD.top} y2={PAD.top + PLOT.height} className="stroke-slate-300 dark:stroke-slate-700" strokeDasharray="3 3" strokeWidth={1} />
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">height, cm</text>
        <text x={16} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 16 ${VIEW.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">weight, kg</text>
      </svg>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {REGRESSION_LOSS_NAMES.map((name) => (
          <div key={name} className="rounded-lg border p-2" style={{ borderColor: `${COLOURS[name]}66` }}>
            <p className="mb-1 text-xs font-medium" style={{ color: COLOURS[name] }}>{LABELS[name]}</p>
            <div className="grid grid-cols-1 gap-1">
              <Stat label="slope, intercept" value={lines ? `${show(lines[name].slope, 4)}, ${show(lines[name].intercept, 2)}` : "…"} />
              <Stat label={`guess at ${READ_AT} cm`} value={lines ? show(lines[name].slope * READ_AT + lines[name].intercept, 2) : "…"} />
              <Stat label="loss, start to finish" value={lines ? `${show(lines[name].starting_loss, 3)} to ${show(lines[name].final_loss, 4)}` : "…"} />
              <Stat label="largest slope left in the neuron" value={lines ? lines[name].final_largest_movement.toExponential(1) : "…"} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Four hundred steps at a rate of 0.1 on standardised heights, from a flat line at the mean weight. The closed-form least squares line is {lines ? `${show(lines.least_squares.slope, 4)}, ${show(lines.least_squares.intercept, 2)}` : "…"}, and the squared-error walk is within {lines ? lines.descent_gap.toExponential(1) : "…"} of it.
      </p>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
