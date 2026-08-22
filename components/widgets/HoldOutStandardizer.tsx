"use client";

// Standardizing held-out rows with the training numbers, against standardizing
// them with their own.
//
// The crowd's eleven heights sit on the top line; click a person to hold them
// out of the fit. The mean and deviation are learned from whoever is left, and
// the held-out heights are then put on two number lines. The first uses the
// training numbers, which is the contract; the second refits on the held-out
// rows alone, which is the leak. A line predicting weight from standardized
// height is fitted on the training rows and reads both, and the table says
// what it answered against the true weights. The API learns, scales and
// predicts; the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { HoldOut, standardizeHeldOut } from "@/lib/concepts/feature-scaling";
import { CROWD } from "./featureScalingFixtures";

const VIEW = { width: 640, height: 60 };
const PAD = { left: 28, right: 28 };
const BASELINE = 34;
const HEIGHT_RANGE = { min: 110, max: 190 };
const SCALED_RANGE = { min: -3, max: 3 };

const TRAINING = "#6366f1";
const HELD_OUT = "#f59e0b";

const PRESETS = [
  { label: "the three tallest", indices: [8, 9, 10] },
  { label: "a mixed three", indices: [4, 7, 10] },
];

const PLAIN = CROWD.map((person) => ({ x: person.x, y: person.y }));

export function HoldOutStandardizer() {
  const [heldOut, setHeldOut] = useState<number[]>(PRESETS[0].indices);
  const [answer, setAnswer] = useState<HoldOut | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await standardizeHeldOut(PLAIN, heldOut));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [heldOut]);

  const toggle = (index: number) => {
    setHeldOut((current) =>
      current.includes(index) ? current.filter((each) => each !== index) : [...current, index].sort((a, b) => a - b),
    );
  };

  const rawX = (height: number) => PAD.left + ((height - HEIGHT_RANGE.min) / (HEIGHT_RANGE.max - HEIGHT_RANGE.min)) * (VIEW.width - PAD.left - PAD.right);
  const scaledX = (value: number) => {
    const clamped = Math.min(SCALED_RANGE.max, Math.max(SCALED_RANGE.min, value));
    return PAD.left + ((clamped - SCALED_RANGE.min) / (SCALED_RANGE.max - SCALED_RANGE.min)) * (VIEW.width - PAD.left - PAD.right);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-2 text-sm text-slate-600 dark:text-slate-300">
        <span>hold out</span>
        {PRESETS.map((preset) => (
          <button key={preset.label} onClick={() => setHeldOut(preset.indices)} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
            {preset.label}
          </button>
        ))}
        <span className="ml-auto text-xs">or click a person to hold them out</span>
      </div>

      <NumberLine label="heights, cm" ticks={[120, 140, 160, 180]} tickX={rawX}>
        {CROWD.map((person, index) => (
          <circle key={index} cx={rawX(person.x)} cy={BASELINE - 9} r={6} fill={heldOut.includes(index) ? HELD_OUT : TRAINING} stroke="white" strokeWidth={1.5} className="cursor-pointer" onClick={() => toggle(index)} />
        ))}
      </NumberLine>

      {!answer ? (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>
      ) : (
        <>
          <NumberLine label={`standardized with the training numbers, mean ${answer.training_mean.toFixed(1)} and deviation ${answer.training_deviation.toFixed(1)}`} ticks={[-3, -2, -1, 0, 1, 2, 3]} tickX={scaledX}>
            {answer.training_scaled.map((value, index) => (
              <circle key={`t${index}`} cx={scaledX(value)} cy={BASELINE - 9} r={4.5} fill={TRAINING} opacity={0.6} stroke="white" strokeWidth={1} />
            ))}
            {answer.by_training.map((value, index) => (
              <circle key={`h${index}`} cx={scaledX(value)} cy={BASELINE - 9} r={6} fill={HELD_OUT} stroke="white" strokeWidth={1.5} />
            ))}
          </NumberLine>
          <NumberLine label={`standardized with their own numbers, mean ${answer.own_mean.toFixed(1)} and deviation ${answer.own_deviation.toFixed(1)}`} ticks={[-3, -2, -1, 0, 1, 2, 3]} tickX={scaledX}>
            {answer.by_own.map((value, index) => (
              <circle key={`o${index}`} cx={scaledX(value)} cy={BASELINE - 9} r={6} fill={HELD_OUT} stroke="white" strokeWidth={1.5} />
            ))}
          </NumberLine>

          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="training mean, deviation" value={`${answer.training_mean.toFixed(1)}, ${answer.training_deviation.toFixed(1)}`} />
            <Stat label="held-out mean, training numbers" value={answer.mean_by_training.toFixed(2)} />
            <Stat label="held-out mean, own numbers" value="0.00" />
            <Stat label="line on standardized height" value={`${answer.intercept.toFixed(1)} + ${answer.slope.toFixed(1)} z`} />
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                  {["held-out person", "height, cm", "predicted, training numbers", "predicted, own numbers", "actual weight, kg"].map((heading) => (
                    <th key={heading} className="py-1.5 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {answer.held_out_indices.map((personIndex, row) => (
                  <tr key={personIndex} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                    <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{personIndex + 1}</td>
                    <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{CROWD[personIndex].x}</td>
                    <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{answer.predictions_by_training[row].toFixed(1)}</td>
                    <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{answer.predictions_by_own[row].toFixed(1)}</td>
                    <td className="py-1.5 font-mono text-slate-800 dark:text-slate-200">{answer.actual_weights[row].toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}

function NumberLine({ label, ticks, tickX, children }: { label: string; ticks: number[]; tickX: (value: number) => number; children: React.ReactNode }) {
  return (
    <div className="mt-2">
      <p className="mb-1 text-xs text-slate-600 dark:text-slate-300">{label}</p>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <line x1={PAD.left} x2={VIEW.width - PAD.right} y1={BASELINE} y2={BASELINE} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={tickX(tick)} x2={tickX(tick)} y1={BASELINE} y2={BASELINE + 5} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
            <text x={tickX(tick)} y={BASELINE + 17} textAnchor="middle" className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400">{tick}</text>
          </g>
        ))}
        {children}
      </svg>
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
