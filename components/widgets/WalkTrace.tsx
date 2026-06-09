"use client";

// One number followed along a walk, for several walks at once.
//
// The measure is the weight vector's length, its angle to the eigen
// direction, or the angle between two units, read after every person or at
// the end of every epoch, and each variant is one walk of the rule under one
// setting: plain Hebb against Oja, a falling rate against a constant one, one
// multiple of the rate against another. A logarithmic axis is offered because
// the plain rule's length runs into the millions while Oja's stays within a
// few percent of one, and both have to be on the picture. Every value is the
// library's rule stepped through the API; the browser joins the dots.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Rule, Start, Walk, walkHebbian } from "@/lib/concepts/hebbian-pca";
import { FIRST, PEOPLE, PeopleKey, RULE, SECOND, TROUBLE } from "./hebbianPcaFixtures";

const VIEW = { width: 640, height: 260 };
const PAD = { left: 64, right: 16, top: 18, bottom: 36 };
const COLOURS = [FIRST, SECOND, RULE, TROUBLE];

export type Measure = "length" | "angle" | "gap";

export interface Variant {
  label: string;
  rule?: Rule;
  rateMultiplier?: number;
  decay?: boolean;
  nComponents?: 1 | 2;
  start?: Start;
  centre?: boolean;
}

export function WalkTrace({
  people = "four",
  variants,
  measure = "length",
  maxEpochs = 20,
  perStep = false,
  logScale = false,
  ceiling,
}: {
  people?: PeopleKey;
  variants: Variant[];
  measure?: Measure;
  maxEpochs?: number;
  perStep?: boolean;
  logScale?: boolean;
  // The highest value the axis reaches; a walk that overflows runs off the
  // top rather than squashing the walks that did not onto the baseline.
  ceiling?: number;
}) {
  const points = PEOPLE[people];
  const [walks, setWalks] = useState<Walk[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const variantsKey = JSON.stringify(variants);

  useEffect(() => {
    let live = true;
    const requested: Variant[] = JSON.parse(variantsKey);
    (async () => {
      try {
        const answers = await Promise.all(
          requested.map((variant) =>
            walkHebbian(points, {
              rule: variant.rule,
              rateMultiplier: variant.rateMultiplier,
              decay: variant.decay,
              nComponents: variant.nComponents ?? (measure === "gap" ? 2 : 1),
              start: variant.start,
              centre: variant.centre,
              maxEpochs,
            }),
          ),
        );
        if (!live) return;
        setWalks(answers);
        setMessage(null);
      } catch (error) {
        if (!live) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      live = false;
    };
  }, [points, variantsKey, measure, maxEpochs]);

  if (!walks) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const series = walks.map((walk) => {
    const records = perStep ? walk.steps.map((step) => step.weights) : walk.epochs.map((epoch) => epoch.weights);
    return records.map((states) => readMeasure(states, measure));
  });
  const longest = Math.max(1, ...series.map((values) => values.length));
  const allValues = series.flat().filter((value) => Number.isFinite(value) && (!logScale || value > 0));
  const top = Math.min(ceiling ?? Infinity, Math.max(...allValues, logScale ? 1 : 0));
  const bottom = logScale ? Math.min(...allValues, 1) : 0;
  const scaleY = (value: number) => {
    const inner = VIEW.height - PAD.top - PAD.bottom;
    if (logScale) {
      const span = Math.log10(top) - Math.log10(bottom) || 1;
      return PAD.top + (1 - (Math.log10(value) - Math.log10(bottom)) / span) * inner;
    }
    return PAD.top + (1 - value / (top || 1)) * inner;
  };
  const scaleX = (index: number) => PAD.left + ((index + 1) / longest) * (VIEW.width - PAD.left - PAD.right);
  const ticks = logScale ? logTicks(bottom, top) : linearTicks(top);
  const unit = measure === "length" ? "" : "°";

  return (
    <div>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={VIEW.width - PAD.right} y1={scaleY(tick)} y2={scaleY(tick)} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={1} />
            <text x={PAD.left - 6} y={scaleY(tick) + 4} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">{formatTick(tick)}{unit}</text>
          </g>
        ))}
        {series.map((values, index) => (
          <path
            key={index}
            d={values.map((value, position) => `${position === 0 ? "M" : "L"}${scaleX(position)},${scaleY(Math.min(top, logScale ? Math.max(value, bottom) : value))}`).join(" ")}
            fill="none"
            stroke={COLOURS[index % COLOURS.length]}
            strokeWidth={2}
          />
        ))}
        <text x={PAD.left + (VIEW.width - PAD.left - PAD.right) / 2} y={VIEW.height - 6} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">
          {perStep ? `people presented, ${longest} in all` : `epochs, ${longest} in all`}
        </text>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {walks.map((walk, index) => {
          const values = series[index];
          const last = values[values.length - 1];
          return (
            <div key={index} className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
              <div className="text-[11px]" style={{ color: COLOURS[index % COLOURS.length] }}>{variants[index].label}</div>
              <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                {last === undefined ? "…" : formatValue(last)}{unit}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {walk.diverged_at_epoch !== null
                  ? `overflowed on epoch ${walk.diverged_at_epoch}`
                  : walk.converged_at_epoch !== null
                    ? `settled on epoch ${walk.converged_at_epoch}`
                    : `not settled after ${walk.epochs.length} epochs`}
              </div>
            </div>
          );
        })}
      </div>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}

function readMeasure(states: { dx: number; dy: number; length: number; angle_degrees: number }[], measure: Measure): number {
  if (measure === "length") return states[0].length;
  if (measure === "angle") return states[0].angle_degrees;
  if (states.length < 2) return 0;
  const [first, second] = states;
  const alignment = Math.abs(first.dx * second.dx + first.dy * second.dy) / (first.length * second.length);
  return (Math.acos(Math.min(1, alignment)) * 180) / Math.PI;
}

function linearTicks(top: number): number[] {
  if (top <= 0) return [0];
  const rough = top / 4;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((factor) => factor * power).find((candidate) => candidate >= rough) ?? power;
  const ticks: number[] = [];
  for (let value = 0; value <= top + 1e-9; value += step) ticks.push(value);
  return ticks;
}

function logTicks(bottom: number, top: number): number[] {
  const ticks: number[] = [];
  for (let power = Math.floor(Math.log10(bottom)); power <= Math.ceil(Math.log10(top)); power += 1) ticks.push(10 ** power);
  return ticks;
}

function formatTick(value: number): string {
  if (value >= 1e4) return value.toExponential(0);
  if (value >= 1) return value.toString();
  return value.toPrecision(1);
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 1e4) return value.toExponential(2);
  if (Math.abs(value) >= 1) return value.toFixed(3);
  return value.toPrecision(3);
}
