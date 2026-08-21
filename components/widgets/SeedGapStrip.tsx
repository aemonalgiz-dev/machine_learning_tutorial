"use client";

// Thirty seeds, one dot each, and which side of zero they fall.
//
// At thirty people the leak on one seed is a coin toss either way, and the
// mean over thirty seeds hides that. Each dot here is one seed's gap, the
// score with the transformer fitted on every row before the folds were dealt
// less the score with it refitted inside each fold. The upper strip is the
// standardizer, whose dots straddle zero; the lower is a column chosen by
// its correlation with a target of noise, whose dots lie almost all to the
// right of it. The API runs the sixty cross-validations; the browser places
// the dots.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { LeakMeasurement, measureLeak } from "@/lib/concepts/pipelines";
import { signed } from "./pipelinesFixtures";

const ROW_COUNT = 30;
const FIRST_SEED = 0;

const VIEW = { width: 640, height: 150 };
const PAD = { left: 200, right: 24 };
const GAP_LEFT = -1.0;
const GAP_RIGHT = 1.0;
const ROWS = [48, 108];
const TICKS = [-1, -0.5, 0, 0.5, 1];

function pixelForGap(gap: number): number {
  const clamped = Math.max(Math.min(gap, GAP_RIGHT), GAP_LEFT);
  return PAD.left + ((clamped - GAP_LEFT) / (GAP_RIGHT - GAP_LEFT)) * (VIEW.width - PAD.left - PAD.right);
}

export function SeedGapStrip() {
  const [measurement, setMeasurement] = useState<LeakMeasurement | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setMeasurement(await measureLeak(ROW_COUNT, FIRST_SEED));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const strips = [
    {
      label: "standardizer",
      gap: measurement?.scaling ?? null,
      fill: "fill-indigo-600",
    },
    {
      label: "column chosen by the target",
      gap: measurement?.selection ?? null,
      fill: "fill-amber-500",
    },
  ];

  return (
    <div>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {TICKS.map((tick) => (
          <g key={`tick${tick}`}>
            <line
              x1={pixelForGap(tick)}
              y1={ROWS[0] - 22}
              x2={pixelForGap(tick)}
              y2={ROWS[1] + 22}
              stroke="currentColor"
              className={tick === 0 ? "text-slate-400 dark:text-slate-600" : "text-slate-200 dark:text-slate-800"}
              strokeWidth={1}
            />
            <text x={pixelForGap(tick)} y={VIEW.height - 6} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
              {tick > 0 ? `+${tick.toFixed(1)}` : tick < 0 ? `−${Math.abs(tick).toFixed(1)}` : "0"}
            </text>
          </g>
        ))}
        {strips.map((strip, row) => (
          <g key={strip.label}>
            <text x={PAD.left - 12} y={ROWS[row] + 4} textAnchor="end" className="fill-slate-700 text-xs font-medium dark:fill-slate-300">
              {strip.label}
            </text>
            {strip.gap &&
              strip.gap.outside_scores.map((outside, seed) => {
                const gap = outside - strip.gap!.inside_scores[seed];
                return (
                  <circle
                    key={`seed${seed}`}
                    cx={pixelForGap(gap)}
                    cy={ROWS[row] + ((seed % 5) - 2) * 4}
                    r={4}
                    className={strip.fill}
                    opacity={0.7}
                  />
                );
              })}
            {strip.gap && (
              <text x={pixelForGap(strip.gap.flattered_by)} y={ROWS[row] - 16} textAnchor="middle" className="fill-slate-700 font-mono text-[10px] font-semibold dark:fill-slate-200">
                mean {signed(strip.gap.flattered_by, 4)}
              </text>
            )}
          </g>
        ))}
      </svg>
      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Each dot is one seed&rsquo;s gap at {ROW_COUNT} people, fitted outside the folds
        less fitted inside them, seeds {FIRST_SEED} to {FIRST_SEED + 29}. Right of zero the
        shortcut flattered the score.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Standardizer, seeds flattered" value={measurement ? `${measurement.scaling.seeds_flattered} of ${measurement.n_seeds}` : "…"} />
        <Stat label="Its largest single-seed gap" value={measurement ? measurement.scaling.largest_gap.toFixed(4) : "…"} />
        <Stat label="Chosen column, seeds flattered" value={measurement ? `${measurement.selection.seeds_flattered} of ${measurement.n_seeds}` : "…"} />
        <Stat label="Its largest single-seed gap" value={measurement ? measurement.selection.largest_gap.toFixed(4) : "…"} />
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
