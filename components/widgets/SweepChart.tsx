"use client";

// Rates against the threshold, read off one fit of the twelve.
//
// The boundary and every person's chance are computed once, and the API
// then reads the table at every hundredth from 0.01 to 0.99. The chart draws
// whichever rates a section asks for against the threshold, with a slider
// that moves a marker along them and reports the four counts underneath it.
// A rate the library refuses at a threshold, precision above the highest
// chance for instance, is simply absent from its curve rather than drawn as
// zero. The API sweeps; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, LabelledPoint } from "@/lib/api";
import {
  ClassifierEvaluation,
  ThresholdReading,
  evaluateAtThreshold,
} from "@/lib/concepts/judging-a-classifier";
import { AMBER, EMERALD, INDIGO, OVERLAPPING_CROWD, ROSE, rate } from "./judgingAClassifierFixtures";

const VIEW = { width: 640, height: 260 };
const PAD = { left: 56, right: 20, top: 18, bottom: 40 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };

export type SweepSeries = "accuracy" | "precision" | "recall" | "false_positive_rate" | "f_one" | "f_half" | "f_two";

const SERIES_LABEL: Record<SweepSeries, string> = {
  accuracy: "accuracy",
  precision: "precision",
  recall: "recall",
  false_positive_rate: "false positive rate",
  f_one: "F1",
  f_half: "F0.5, leaning to precision",
  f_two: "F2, leaning to recall",
};

const SERIES_COLOUR: Record<SweepSeries, string> = {
  accuracy: "#64748b",
  precision: AMBER,
  recall: INDIGO,
  false_positive_rate: ROSE,
  f_one: INDIGO,
  f_half: AMBER,
  f_two: EMERALD,
};

export function SweepChart({
  series = ["precision", "recall"],
  crowd = OVERLAPPING_CROWD,
  initialThreshold = 0.5,
  showPeaks = false,
}: {
  series?: SweepSeries[];
  crowd?: LabelledPoint[];
  initialThreshold?: number;
  showPeaks?: boolean;
}) {
  const [threshold, setThreshold] = useState(initialThreshold);
  const [answer, setAnswer] = useState<ClassifierEvaluation | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await evaluateAtThreshold(crowd, 0.5));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [crowd]);

  if (!answer) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const thresholdToX = (value: number) => PAD.left + value * PLOT.width;
  const rateToY = (value: number) => PAD.top + (1 - value) * PLOT.height;
  const valueOf = (reading: ThresholdReading, name: SweepSeries): number | null => reading[name];
  const current = answer.curve.reduce((closest, reading) =>
    Math.abs(reading.threshold - threshold) < Math.abs(closest.threshold - threshold) ? reading : closest,
  );

  const path = (name: SweepSeries) => {
    let drawing = false;
    return answer.curve
      .map((reading) => {
        const value = valueOf(reading, name);
        if (value === null) {
          drawing = false;
          return "";
        }
        const command = drawing ? "L" : "M";
        drawing = true;
        return `${command}${thresholdToX(reading.threshold).toFixed(1)},${rateToY(value).toFixed(1)}`;
      })
      .filter(Boolean)
      .join(" ");
  };

  return (
    <div className="my-4">
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        threshold
        <input type="range" min={0.01} max={0.99} step={0.01} value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} className="flex-1 accent-indigo-600" />
        <span className="w-10 font-mono">{threshold.toFixed(2)}</span>
      </label>

      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-2 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={PAD.left + PLOT.width} y1={rateToY(tick)} y2={rateToY(tick)} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={1} />
            <text x={PAD.left - 8} y={rateToY(tick) + 4} textAnchor="end" className="fill-slate-500 text-[11px] dark:fill-slate-400">{tick.toFixed(2)}</text>
            <text x={thresholdToX(tick)} y={PAD.top + PLOT.height + 14} textAnchor="middle" className="fill-slate-500 text-[11px] dark:fill-slate-400">{tick.toFixed(2)}</text>
          </g>
        ))}
        {series.map((name) => (
          <path key={name} d={path(name)} fill="none" strokeWidth={2} stroke={SERIES_COLOUR[name]} />
        ))}
        {showPeaks &&
          series
            .filter((name): name is "f_one" | "f_half" | "f_two" => name === "f_one" || name === "f_half" || name === "f_two")
            .map((name) => (
              <g key={`peak-${name}`}>
                <line x1={thresholdToX(answer.best[name].threshold)} x2={thresholdToX(answer.best[name].threshold)} y1={rateToY(answer.best[name].value)} y2={PAD.top + PLOT.height} stroke={SERIES_COLOUR[name]} strokeDasharray="3 3" strokeWidth={1} />
                <circle cx={thresholdToX(answer.best[name].threshold)} cy={rateToY(answer.best[name].value)} r={4} fill={SERIES_COLOUR[name]} stroke="white" strokeWidth={1} />
              </g>
            ))}
        <line x1={thresholdToX(threshold)} x2={thresholdToX(threshold)} y1={PAD.top} y2={PAD.top + PLOT.height} className="stroke-slate-500 dark:stroke-slate-400" strokeDasharray="3 3" strokeWidth={1.5} />
        {series.map((name) => {
          const value = valueOf(current, name);
          return value === null ? null : <circle key={`dot-${name}`} cx={thresholdToX(current.threshold)} cy={rateToY(value)} r={5} fill={SERIES_COLOUR[name]} stroke="white" strokeWidth={1.5} />;
        })}
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 6} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
          Threshold across, the rate up, read at every hundredth
        </text>
      </svg>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
        {series.map((name) => (
          <span key={name} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: SERIES_COLOUR[name] }} />
            {SERIES_LABEL[name]}
          </span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="called adult, is adult" value={String(current.true_positives)} />
        <Stat label="called adult, is child" value={String(current.false_positives)} />
        <Stat label="called child, is adult" value={String(current.false_negatives)} />
        <Stat label="called child, is child" value={String(current.true_negatives)} />
        {series.map((name) => (
          <Stat key={`stat-${name}`} label={SERIES_LABEL[name]} value={rate(valueOf(current, name))} />
        ))}
      </div>
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
