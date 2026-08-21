"use client";

// The tangled crowd, and what dropout did to it across seeds.
//
// The left panel is the twenty-five people, amber for a child and indigo
// for an adult, with the middle mixed on purpose. The right panel is the
// experiment: at each drop rate, one dot per seed for the training accuracy
// and one for the held-out accuracy pooled over five folds, with the mean
// of each drawn as a bar. The point of drawing every seed is that the
// spread across seeds is the ruler the difference between rates has to be
// measured against. Every accuracy is the library's through the API.

import { useEffect, useState } from "react";
import {
  DropoutExperiment,
  failureMessage,
  fetchDropoutExperiment,
} from "@/lib/concepts/dropout";
import { ADULT, CHILD, TANGLED_CROWD } from "./dropoutFixtures";

const MAP = { width: 280, height: 260 };
const MAP_PAD = 26;
const CHART = { width: 360, height: 260 };
const CHART_PAD = { left: 44, right: 12, top: 16, bottom: 40 };
const CHART_PLOT = {
  width: CHART.width - CHART_PAD.left - CHART_PAD.right,
  height: CHART.height - CHART_PAD.top - CHART_PAD.bottom,
};

const TRAINING = "#6366f1";
const HELD_OUT = "#10b981";

export function DropoutSweep() {
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

  const heights = TANGLED_CROWD.map((person) => person.x);
  const weights = TANGLED_CROWD.map((person) => person.y);
  const heightSpan = { low: Math.min(...heights) - 4, high: Math.max(...heights) + 4 };
  const weightSpan = { low: Math.min(...weights) - 4, high: Math.max(...weights) + 4 };
  const mapX = (height: number) =>
    MAP_PAD + ((height - heightSpan.low) / (heightSpan.high - heightSpan.low)) * (MAP.width - 2 * MAP_PAD);
  const mapY = (weight: number) =>
    MAP.height - MAP_PAD - ((weight - weightSpan.low) / (weightSpan.high - weightSpan.low)) * (MAP.height - 2 * MAP_PAD);

  const slot = CHART_PLOT.width / experiment.sweep.length;
  const accuracyToY = (accuracy: number) =>
    CHART_PAD.top + (1 - (accuracy - 0.5) / 0.5) * CHART_PLOT.height;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[280px_1fr]">
        <div>
          <svg
            viewBox={`0 0 ${MAP.width} ${MAP.height}`}
            className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
          >
            {TANGLED_CROWD.map((person, index) => (
              <circle
                key={index}
                cx={mapX(person.x)}
                cy={mapY(person.y)}
                r={4.5}
                fill={person.label === 0 ? CHILD : ADULT}
                stroke="white"
                strokeWidth={1}
              />
            ))}
            <text
              x={MAP.width / 2}
              y={MAP.height - 6}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              height, cm
            </text>
            <text
              x={10}
              y={MAP.height / 2}
              textAnchor="middle"
              transform={`rotate(-90 10 ${MAP.height / 2})`}
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              weight, kg
            </text>
          </svg>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The tangled crowd, amber for a child and indigo for an adult.
          </p>
        </div>

        <div>
          <svg
            viewBox={`0 0 ${CHART.width} ${CHART.height}`}
            className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
          >
            {[0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((tick) => (
              <g key={tick}>
                <line
                  x1={CHART_PAD.left}
                  x2={CHART_PAD.left + CHART_PLOT.width}
                  y1={accuracyToY(tick)}
                  y2={accuracyToY(tick)}
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeWidth={1}
                />
                <text
                  x={CHART_PAD.left - 6}
                  y={accuracyToY(tick) + 4}
                  textAnchor="end"
                  className="fill-slate-500 text-[10px] dark:fill-slate-400"
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            ))}
            {experiment.sweep.map((reading, index) => {
              const centre = CHART_PAD.left + slot * (index + 0.5);
              const trainingX = centre - slot * 0.18;
              const heldX = centre + slot * 0.18;
              return (
                <g key={reading.drop_probability}>
                  <line
                    x1={trainingX - 14}
                    x2={trainingX + 14}
                    y1={accuracyToY(reading.training_accuracy_mean)}
                    y2={accuracyToY(reading.training_accuracy_mean)}
                    stroke={TRAINING}
                    strokeWidth={3}
                  />
                  <line
                    x1={heldX - 14}
                    x2={heldX + 14}
                    y1={accuracyToY(reading.held_out_accuracy_mean)}
                    y2={accuracyToY(reading.held_out_accuracy_mean)}
                    stroke={HELD_OUT}
                    strokeWidth={3}
                  />
                  {reading.per_seed.map((seed, seedIndex) => (
                    <g key={seed.seed}>
                      <circle
                        cx={trainingX + (seedIndex - 2) * 3}
                        cy={accuracyToY(seed.training_accuracy)}
                        r={3}
                        fill={TRAINING}
                        opacity={0.55}
                      />
                      <circle
                        cx={heldX + (seedIndex - 2) * 3}
                        cy={accuracyToY(seed.held_out_accuracy)}
                        r={3}
                        fill={HELD_OUT}
                        opacity={0.55}
                      />
                    </g>
                  ))}
                  <text
                    x={centre}
                    y={CHART.height - CHART_PAD.bottom + 16}
                    textAnchor="middle"
                    className="fill-slate-600 text-xs dark:fill-slate-300"
                  >
                    {reading.drop_probability === 0
                      ? "no dropout"
                      : `p = ${reading.drop_probability.toFixed(1)}`}
                  </text>
                </g>
              );
            })}
            <text
              x={CHART_PAD.left + CHART_PLOT.width / 2}
              y={CHART.height - 6}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              accuracy, one dot per seed, bar at the mean
            </text>
          </svg>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span style={{ color: TRAINING }}>Indigo</span> is the training
            rows, <span style={{ color: HELD_OUT }}>green</span> the held-out
            people pooled over the folds.
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {experiment.sweep.map((reading) => (
          <Stat
            key={reading.drop_probability}
            label={
              reading.drop_probability === 0
                ? "no dropout"
                : `dropout at ${reading.drop_probability.toFixed(1)}`
            }
            value={`${reading.training_accuracy_mean.toFixed(3)} trained, ${reading.held_out_accuracy_mean.toFixed(3)} held out`}
            detail={`held out across seeds ${reading.held_out_accuracy_low.toFixed(2)} to ${reading.held_out_accuracy_high.toFixed(2)}`}
          />
        ))}
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
      <div className="text-[10px] text-slate-500 dark:text-slate-400">{detail}</div>
    </div>
  );
}
