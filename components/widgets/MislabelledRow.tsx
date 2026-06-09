"use client";

// Sixteen people scored by a rule on height, and one adult marked a child.
//
// The rule is fixed, score = (height − 152) / scale, and the curve is the
// probability it gives to being an adult at every height, drawn from the
// definition. Each person is a dot at their height on the floor or the
// ceiling according to their label, with a bar for the cost that person
// contributes to the batch. The switch flips one adult's label, and the
// readouts show what that one row does to the whole batch's cost and pull.
// Every cost, pull and accuracy is the library's through the API.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ClassificationBatch,
  scoreClassificationBatch,
} from "@/lib/concepts/loss-functions";
import {
  AMBER,
  INDIGO,
  MISLABELLED_INDEX,
  ROSE,
  SCORED_CROWD,
  SCORE_BOUNDARY,
  scoreOf,
  show,
} from "./lossFixtures";

const VIEW = { width: 640, height: 300 };
const PAD = { left: 56, right: 16, top: 16, bottom: 40 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};
const DOMAIN = { xMin: 105, xMax: 195 };
const DEBOUNCE_MS = 120;

const plotX = (height: number) =>
  PAD.left + ((height - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
const plotY = (probability: number) => PAD.top + (1 - probability) * PLOT.height;

export function MislabelledRow() {
  const [scale, setScale] = useState(5);
  const [flipped, setFlipped] = useState(false);
  const [batch, setBatch] = useState<ClassificationBatch | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const rows = SCORED_CROWD.map((person, index) => ({
    score: scoreOf(person.height, scale),
    label: flipped && index === MISLABELLED_INDEX ? (0 as const) : person.label,
  }));

  useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(async () => {
      try {
        const scored = await scoreClassificationBatch(
          SCORED_CROWD.map((person, index) => ({
            score: scoreOf(person.height, scale),
            label: flipped && index === MISLABELLED_INDEX ? 0 : person.label,
          })),
        );
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
  }, [scale, flipped]);

  const curve = Array.from({ length: 91 }, (_, index) => {
    const height = DOMAIN.xMin + index;
    const probability = 1 / (1 + Math.exp(-scoreOf(height, scale)));
    return `${index === 0 ? "M" : "L"}${plotX(height).toFixed(1)},${plotY(probability).toFixed(1)}`;
  }).join(" ");

  const largestCost = batch ? Math.max(...batch.binary_cross_entropy.row_costs, 1e-9) : 1;
  const reading = batch?.binary_cross_entropy;
  const flippedShare = reading ? reading.row_costs[MISLABELLED_INDEX] / reading.total_row_cost : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          scale of the rule, cm per unit of score
          <select value={scale} onChange={(event) => setScale(Number(event.target.value))} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900">
            <option value={2.5}>2.5, a steep curve</option>
            <option value={5}>5</option>
            <option value={10}>10, a gentle curve</option>
          </select>
        </label>
        <label className="ml-auto flex items-center gap-2">
          <input type="checkbox" checked={flipped} onChange={(event) => setFlipped(event.target.checked)} className="accent-rose-500" />
          mark the 178 cm adult as a child
        </label>
      </div>

      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <path d={curve} fill="none" stroke={INDIGO} strokeWidth={2} />
        <line x1={plotX(SCORE_BOUNDARY)} x2={plotX(SCORE_BOUNDARY)} y1={PAD.top} y2={PAD.top + PLOT.height} className="stroke-slate-300 dark:stroke-slate-700" strokeDasharray="3 3" strokeWidth={1} />
        {SCORED_CROWD.map((person, index) => {
          const label = rows[index].label;
          const bad = flipped && index === MISLABELLED_INDEX;
          const cost = reading ? reading.row_costs[index] : 0;
          const barHeight = (cost / largestCost) * (PLOT.height * 0.6);
          return (
            <g key={index}>
              <rect x={plotX(person.height) - 4} y={label === 1 ? plotY(1) : plotY(0) - barHeight} width={8} height={barHeight} fill={bad ? ROSE : label === 1 ? INDIGO : AMBER} opacity={0.35} />
              <circle cx={plotX(person.height)} cy={plotY(label)} r={bad ? 7 : 5} fill={bad ? ROSE : label === 1 ? INDIGO : AMBER} className="stroke-white dark:stroke-slate-900" strokeWidth={1.5} />
            </g>
          );
        })}
        <text x={PAD.left - 8} y={plotY(1) + 4} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">adult</text>
        <text x={PAD.left - 8} y={plotY(0) + 4} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">child</text>
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">height, cm</text>
      </svg>
      <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
        The curve is the rule&rsquo;s probability of adult. Each bar is that person&rsquo;s cost, drawn from their label towards the middle.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="the value, over 16 rows" value={show(reading?.value)} />
        <Stat label="sum of row costs" value={show(reading?.total_row_cost)} />
        <Stat label="accuracy at one half" value={show(batch?.accuracy)} />
        <Stat label="largest share of the pull" value={show(reading?.largest_pull_share, 3)} />
        <Stat label="the 178 cm person's cost" value={show(reading?.row_costs[MISLABELLED_INDEX])} />
        <Stat label="their share of the total cost" value={show(flippedShare, 3)} />
        <Stat label="their pull, over 16 rows" value={show(reading?.gradients[MISLABELLED_INDEX])} />
        <Stat label="their share of the pull" value={show(reading?.pull_shares[MISLABELLED_INDEX], 3)} />
      </div>
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
