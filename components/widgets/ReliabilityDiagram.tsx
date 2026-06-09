"use client";

// The chances against the outcomes, binned into fifths.
//
// Every person's chance of being adult is placed in one of five bins, and
// each bin is drawn as a dot at the mean chance of the people in it against
// the share of them who really were adults, sized by how many it holds. A
// bin on the diagonal is a bin whose chances meant what they said. The
// readouts give the expected calibration error, which is the count-weighted
// gap between the dots and the diagonal, the Brier score, which is the mean
// squared gap between each chance and its 0 or 1 outcome, and the mean
// chance beside the observed rate. The buttons switch crowds. The API fits
// and bins; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, LabelledPoint } from "@/lib/api";
import {
  ClassifierEvaluation,
  evaluateAtThreshold,
} from "@/lib/concepts/judging-a-classifier";
import {
  AMBER,
  IDEAL_CROWD,
  INDIGO,
  OVERLAPPING_CROWD,
  RARE_CROWD,
  buttonClass,
} from "./judgingAClassifierFixtures";

const VIEW = { width: 640, height: 320 };
const PAD = { left: 56, right: 20, top: 18, bottom: 44 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };

const CROWDS: Record<string, LabelledPoint[]> = {
  "the twelve": OVERLAPPING_CROWD,
  "adults rare": RARE_CROWD,
  "an ideal case": IDEAL_CROWD,
};

export function ReliabilityDiagram() {
  const [crowdName, setCrowdName] = useState("the twelve");
  const [answer, setAnswer] = useState<ClassifierEvaluation | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await evaluateAtThreshold(CROWDS[crowdName], 0.5);
        if (cancelled) return;
        setAnswer(result);
        setMessage(null);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [crowdName]);

  if (!answer) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const toX = (value: number) => PAD.left + value * PLOT.width;
  const toY = (value: number) => PAD.top + (1 - value) * PLOT.height;
  const reliability = answer.reliability;
  const people = CROWDS[crowdName].length;

  return (
    <div className="my-4">
      <span className="flex w-fit gap-1 rounded-md border border-slate-300 p-0.5 text-sm dark:border-slate-700">
        {Object.keys(CROWDS).map((name) => (
          <button key={name} onClick={() => setCrowdName(name)} className={buttonClass(crowdName === name)}>
            {name}
          </button>
        ))}
      </span>

      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-2 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {reliability.bins.map((bin, index) => (
          <rect key={`band-${index}`} x={toX(bin.lower)} y={PAD.top} width={toX(bin.upper) - toX(bin.lower)} height={PLOT.height} fill={index % 2 === 0 ? INDIGO : "transparent"} opacity={0.04} />
        ))}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={PAD.left + PLOT.width} y1={toY(tick)} y2={toY(tick)} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={1} />
            <text x={PAD.left - 8} y={toY(tick) + 4} textAnchor="end" className="fill-slate-500 text-[11px] dark:fill-slate-400">{tick.toFixed(1)}</text>
            <text x={toX(tick)} y={PAD.top + PLOT.height + 14} textAnchor="middle" className="fill-slate-500 text-[11px] dark:fill-slate-400">{tick.toFixed(1)}</text>
          </g>
        ))}
        <line x1={toX(0)} y1={toY(0)} x2={toX(1)} y2={toY(1)} stroke={AMBER} strokeDasharray="5 4" strokeWidth={1.5} />
        <text x={toX(0.9)} y={toY(0.94)} textAnchor="end" className="text-[10px] font-medium" fill={AMBER}>chances that mean what they say</text>
        {reliability.bins.map((bin, index) =>
          bin.mean_probability === null || bin.observed_share === null ? (
            <text key={`empty-${index}`} x={toX((bin.lower + bin.upper) / 2)} y={PAD.top + 12} textAnchor="middle" className="fill-slate-400 text-[10px] dark:fill-slate-600">empty</text>
          ) : (
            <g key={`bin-${index}`}>
              <line x1={toX(bin.mean_probability)} x2={toX(bin.mean_probability)} y1={toY(bin.mean_probability)} y2={toY(bin.observed_share)} stroke={INDIGO} strokeWidth={1} strokeDasharray="2 2" />
              <circle cx={toX(bin.mean_probability)} cy={toY(bin.observed_share)} r={4 + 1.6 * Math.sqrt(bin.count)} fill={INDIGO} opacity={0.85} stroke="white" strokeWidth={1.5} />
              <text x={toX(bin.mean_probability)} y={toY(bin.observed_share) + 4} textAnchor="middle" className="fill-white text-[10px] font-semibold">{bin.count}</text>
            </g>
          ),
        )}
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 6} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
          Mean chance in the bin across, share who were adults up, each dot labelled with how many people it holds
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="expected calibration error" value={reliability.expected_calibration_error.toFixed(4)} />
        <Stat label="Brier score" value={reliability.brier_score.toFixed(4)} />
        <Stat label="mean chance, over everybody" value={reliability.mean_probability.toFixed(4)} />
        <Stat label="observed adult rate" value={reliability.observed_rate.toFixed(4)} />
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-3 font-medium">bin</th>
              <th className="py-1 pr-3 font-medium">people</th>
              <th className="py-1 pr-3 font-medium">mean chance</th>
              <th className="py-1 font-medium">share who are adults</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {reliability.bins.map((bin, index) => (
              <tr key={index} className="border-t border-slate-200 dark:border-slate-800">
                <td className="py-1 pr-3">{bin.lower.toFixed(1)} to {bin.upper.toFixed(1)}</td>
                <td className="py-1 pr-3">{bin.count}</td>
                <td className="py-1 pr-3">{bin.mean_probability === null ? "empty" : bin.mean_probability.toFixed(4)}</td>
                <td className="py-1">{bin.observed_share === null ? "empty" : bin.observed_share.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {people} people, judged on the rows the boundary was fitted to.
      </p>
      {message && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>}
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
