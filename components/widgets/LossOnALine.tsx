"use client";

// One line's guesses at everyone's weight, priced three ways.
//
// The people are the page's, the line is the reader's, set by its slope and
// intercept, and the grey sticks are each person's miss. Beneath the picture
// the three regression losses score the whole batch: the cost each person
// contributes before the division by the row count, the value after it, and
// what share of the batch's total pull each person carries. The line and
// its misses are drawn from the definition; every cost and pull is the
// library's through the API.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import {
  REGRESSION_LOSS_NAMES,
  RegressionBatch,
  RegressionLossName,
  scoreRegressionBatch,
} from "@/lib/concepts/loss-functions";
import {
  AMBER,
  GREEN,
  IDEAL_FIFTEEN,
  INDIGO,
  MEASURED_FOUR,
  WORKED_INTERCEPT,
  WORKED_KNEE,
  WORKED_SLOPE,
  randomPeople,
  show,
} from "./lossFixtures";

const VIEW = { width: 640, height: 320 };
const PAD = { left: 56, right: 16, top: 16, bottom: 40 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};
const DOMAIN = { xMin: 145, xMax: 200, yMin: 40, yMax: 100 };
const BARS = { width: 640, rowHeight: 18 };
const DEBOUNCE_MS = 120;

const LABELS: Record<RegressionLossName, string> = {
  squared_error: "squared error",
  absolute_error: "absolute error",
  huber_error: "Huber",
};

const COLOURS: Record<RegressionLossName, string> = {
  squared_error: INDIGO,
  absolute_error: AMBER,
  huber_error: GREEN,
};

interface Scenario {
  label: string;
  people: Point[];
  slope: number;
  intercept: number;
}

const plotX = (height: number) =>
  PAD.left + ((height - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
const plotY = (weight: number) =>
  PAD.top + (1 - (weight - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height;

export function LossOnALine() {
  const [people, setPeople] = useState<Point[]>(MEASURED_FOUR);
  const [slope, setSlope] = useState(WORKED_SLOPE);
  const [intercept, setIntercept] = useState(WORKED_INTERCEPT);
  const [knee, setKnee] = useState(WORKED_KNEE);
  const [batch, setBatch] = useState<RegressionBatch | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const predictions = people.map((person) => slope * person.x + intercept);

  useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(async () => {
      try {
        const rows = people.map((person) => ({
          prediction: slope * person.x + intercept,
          truth: person.y,
        }));
        const scored = await scoreRegressionBatch(rows, knee);
        if (!cancelled) {
          setBatch(scored);
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
  }, [people, slope, intercept, knee]);

  const load = (scenario: Scenario) => {
    setPeople(scenario.people);
    setSlope(scenario.slope);
    setIntercept(scenario.intercept);
  };

  const scenarios: Scenario[] = [
    { label: "An Ideal Case", people: IDEAL_FIFTEEN, slope: 0.8, intercept: -68 },
    { label: "The measured four", people: MEASURED_FOUR, slope: WORKED_SLOPE, intercept: WORKED_INTERCEPT },
  ];

  const lineStart = { x: DOMAIN.xMin, y: slope * DOMAIN.xMin + intercept };
  const lineEnd = { x: DOMAIN.xMax, y: slope * DOMAIN.xMax + intercept };
  const barsHeight = PAD.top + people.length * BARS.rowHeight + 8;
  const largestCost = batch
    ? Math.max(...REGRESSION_LOSS_NAMES.flatMap((name) => batch[name].row_costs), 1e-9)
    : 1;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.label}
            type="button"
            onClick={() => load(scenario)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {scenario.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => load({ label: "random", people: randomPeople(), slope: 0.6, intercept: -40 })}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Random people
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          slope, kg per cm
          <input type="range" min={0} max={1.5} step={0.05} value={slope} onChange={(event) => setSlope(Number(event.target.value))} className="w-28 accent-indigo-600" />
          <span className="w-10 font-mono">{slope.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2">
          intercept, kg
          <input type="range" min={-120} max={20} step={1} value={intercept} onChange={(event) => setIntercept(Number(event.target.value))} className="w-28 accent-indigo-600" />
          <span className="w-12 font-mono">{show(intercept, 0)}</span>
        </label>
        <label className="flex items-center gap-2">
          Huber knee, kg
          <input type="range" min={1} max={10} step={1} value={knee} onChange={(event) => setKnee(Number(event.target.value))} className="w-24 accent-emerald-600" />
          <span className="w-6 font-mono">{knee}</span>
        </label>
      </div>

      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <line x1={plotX(lineStart.x)} y1={plotY(lineStart.y)} x2={plotX(lineEnd.x)} y2={plotY(lineEnd.y)} stroke={INDIGO} strokeWidth={2} />
        {people.map((person, index) => (
          <g key={index}>
            <line x1={plotX(person.x)} y1={plotY(person.y)} x2={plotX(person.x)} y2={plotY(predictions[index])} className="stroke-slate-400 dark:stroke-slate-600" strokeWidth={1.5} strokeDasharray="3 3" />
            <circle cx={plotX(person.x)} cy={plotY(predictions[index])} r={3} fill={INDIGO} />
            <circle cx={plotX(person.x)} cy={plotY(person.y)} r={5.5} className="fill-slate-700 stroke-white dark:fill-slate-200 dark:stroke-slate-900" strokeWidth={1.5} />
          </g>
        ))}
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">height, cm</text>
        <text x={16} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 16 ${VIEW.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">weight, kg</text>
      </svg>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {REGRESSION_LOSS_NAMES.map((name) => (
          <Stat key={name} label={`${LABELS[name]}, the value`} value={show(batch?.[name].value)} colour={COLOURS[name]} />
        ))}
        {REGRESSION_LOSS_NAMES.map((name) => (
          <Stat key={`${name}-total`} label={`${LABELS[name]}, sum of row costs`} value={show(batch?.[name].total_row_cost)} colour={COLOURS[name]} />
        ))}
        {REGRESSION_LOSS_NAMES.map((name) => (
          <Stat key={`${name}-share`} label={`${LABELS[name]}, largest share of the pull`} value={show(batch?.[name].largest_pull_share, 3)} colour={COLOURS[name]} />
        ))}
      </div>

      <svg viewBox={`0 0 ${BARS.width} ${barsHeight}`} className="mt-3 w-full select-none">
        <text x={PAD.left} y={PAD.top - 4} className="fill-slate-500 text-[10px] dark:fill-slate-400">each person&rsquo;s own cost under the three losses, before the division by the row count</text>
        {people.map((person, index) => {
          const y = PAD.top + index * BARS.rowHeight;
          return (
            <g key={index}>
              <text x={PAD.left - 6} y={y + 12} textAnchor="end" className="fill-slate-600 text-[10px] dark:fill-slate-300">
                {person.x} cm, miss {batch ? show(batch.misses[index], 1) : "…"}
              </text>
              {REGRESSION_LOSS_NAMES.map((name, position) => {
                const cost = batch ? batch[name].row_costs[index] : 0;
                return (
                  <rect key={name} x={PAD.left} y={y + position * 5} width={(cost / largestCost) * (BARS.width - PAD.left - PAD.right)} height={4} fill={COLOURS[name]} opacity={0.85} />
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-3 font-medium">person</th>
              <th className="py-1 pr-3 font-medium">miss, kg</th>
              {REGRESSION_LOSS_NAMES.map((name) => (
                <th key={name} className="py-1 pr-3 font-medium" style={{ color: COLOURS[name] }}>{LABELS[name]} pull</th>
              ))}
              <th className="py-1 font-medium">inside the knee</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {people.map((person, index) => (
              <tr key={index} className="border-t border-slate-200 dark:border-slate-800">
                <td className="py-1 pr-3 font-sans">{person.x} cm, {person.y} kg</td>
                <td className="py-1 pr-3">{show(batch?.misses[index], 2)}</td>
                {REGRESSION_LOSS_NAMES.map((name) => (
                  <td key={name} className="py-1 pr-3">{show(batch?.[name].gradients[index])}</td>
                ))}
                <td className="py-1 font-sans">{batch ? (batch.inside_knee[index] ? "yes" : "no") : "…"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}

function Stat({ label, value, colour }: { label: string; value: string; colour?: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400" style={colour ? { color: colour } : undefined}>{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
