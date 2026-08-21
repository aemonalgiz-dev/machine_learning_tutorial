"use client";

// How much each hidden unit matters on its own, after each kind of training.
//
// Two networks trained on the whole tangled crowd, one with no dropout and
// one with dropout at one half. For each, every hidden unit is silenced in
// turn at prediction time and the training accuracy of what is left is
// measured, so a tall drop is a unit the rest of the network cannot do
// without. The library trains the networks and answers every silenced
// version through the API; the browser draws one bar per unit.

import { useEffect, useState } from "react";
import {
  DropoutExperiment,
  UnitAblation,
  failureMessage,
  fetchDropoutExperiment,
} from "@/lib/concepts/dropout";

const CHART = { width: 310, height: 220 };
const PAD = { left: 40, right: 8, top: 18, bottom: 30 };
const PLOT = {
  width: CHART.width - PAD.left - PAD.right,
  height: CHART.height - PAD.top - PAD.bottom,
};

export function UnitLeaningChart() {
  const [experiment, setExperiment] = useState<DropoutExperiment | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setExperiment(await fetchDropoutExperiment());
      } catch (error) {
        setMessage(failureMessage(error));
      }
    })();
  }, []);

  if (!experiment) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "… the first visit trains seventy-five small networks, which takes ten to twenty seconds"}
      </p>
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {experiment.ablations.map((ablation) => (
          <Panel key={ablation.drop_probability} ablation={ablation} />
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Each bar is the training accuracy with that one unit silenced; the
        dashed line is the accuracy with every unit present. Both networks
        were trained on all twenty-five people under seed{" "}
        {experiment.seeds[0]} for {experiment.epochs} epochs.
      </p>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Panel({ ablation }: { ablation: UnitAblation }) {
  const colour = ablation.drop_probability === 0 ? "#64748b" : "#f59e0b";
  const slot = PLOT.width / ablation.silenced.length;
  const accuracyToY = (accuracy: number) => PAD.top + (1 - (accuracy - 0.5) / 0.5) * PLOT.height;
  return (
    <div>
      <p className="mb-1 text-sm font-medium" style={{ color: colour }}>
        {ablation.drop_probability === 0
          ? "Trained with no dropout"
          : `Trained with dropout at ${ablation.drop_probability.toFixed(1)}`}
      </p>
      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {[0.5, 0.75, 1.0].map((tick) => (
          <text
            key={tick}
            x={PAD.left - 6}
            y={accuracyToY(tick) + 4}
            textAnchor="end"
            className="fill-slate-500 text-[10px] dark:fill-slate-400"
          >
            {tick.toFixed(2)}
          </text>
        ))}
        {ablation.silenced.map((accuracy, index) => (
          <rect
            key={index}
            x={PAD.left + index * slot + slot * 0.15}
            y={accuracyToY(accuracy)}
            width={slot * 0.7}
            height={accuracyToY(0.5) - accuracyToY(accuracy)}
            fill={colour}
            opacity={ablation.dead[index] ? 0.3 : 0.85}
          />
        ))}
        <line
          x1={PAD.left}
          x2={PAD.left + PLOT.width}
          y1={accuracyToY(ablation.intact_accuracy)}
          y2={accuracyToY(ablation.intact_accuracy)}
          className="stroke-slate-700 dark:stroke-slate-200"
          strokeWidth={1.2}
          strokeDasharray="4 3"
        />
        <text
          x={PAD.left + PLOT.width / 2}
          y={CHART.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          hidden unit silenced, 1 to {ablation.silenced.length}
        </text>
      </svg>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <Stat label="all units present" value={ablation.intact_accuracy.toFixed(2)} />
        <Stat label="mean drop" value={ablation.mean_drop.toFixed(3)} />
        <Stat label="largest drop" value={ablation.largest_drop.toFixed(2)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[10px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
