"use client";

// One recorded run, read three ways.
//
// The API walks two hundred epochs once and reports, after each of them, the
// loss it measured on the way forward, the share of the crowd it then called
// correctly, and the largest single slope anywhere in the chain. Those are the
// three things a loop can watch, and they do not move together: the loss falls
// smoothly, the accuracy climbs in flat steps, and the largest slope rises
// before it falls. The browser draws the three curves and picks out the epochs
// the page names.

import { useEffect, useState } from "react";
import {
  TrainingRun,
  failureMessage,
  trainOneNetwork,
} from "@/lib/concepts/training-a-network";

const CHART = { width: 640, height: 260 };
const PAD = { left: 54, right: 54, top: 16, bottom: 34 };
const PLOT = {
  width: CHART.width - PAD.left - PAD.right,
  height: CHART.height - PAD.top - PAD.bottom,
};

let recorded: Promise<TrainingRun> | null = null;

function fetchRecordedRun(): Promise<TrainingRun> {
  recorded ??= trainOneNetwork({
    preset: "rings",
    hiddenWidth: 6,
    learningRate: 0.5,
    maxEpochs: 200,
    weightSeed: 1,
  });
  return recorded;
}

export function EpochReadout() {
  const [run, setRun] = useState<TrainingRun | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setRun(await fetchRecordedRun());
      } catch (error) {
        setMessage(failureMessage(error));
      }
    })();
  }, []);

  if (!run) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "… walking two hundred epochs"}
      </p>
    );
  }

  const readings = run.readings;
  const epochs = readings.length;
  const highestLoss = Math.max(...readings.map((reading) => reading.loss));
  const highestMovement = Math.max(
    ...readings.map((reading) => reading.largest_movement),
  );

  const toX = (epoch: number) =>
    PAD.left + ((epoch - 1) / (epochs - 1)) * PLOT.width;
  const lossY = (loss: number) =>
    PAD.top + (1 - loss / highestLoss) * PLOT.height;
  const shareY = (share: number) => PAD.top + (1 - share) * PLOT.height;
  const movementY = (movement: number) =>
    PAD.top + (1 - movement / highestMovement) * PLOT.height;

  const pathOf = (
    pick: (reading: TrainingRun["readings"][number]) => number,
    toValueY: (value: number) => number,
  ) =>
    readings
      .map(
        (reading, index) =>
          `${index === 0 ? "M" : "L"}${toX(reading.epoch).toFixed(1)},${toValueY(pick(reading)).toFixed(1)}`,
      )
      .join(" ");

  const firstPerfect = readings.find((reading) => reading.accuracy === 1.0);
  const last = readings[readings.length - 1];
  const withinAHundredth = readings.find(
    (reading) => reading.loss - run.final_loss < 0.01,
  );
  const loudest = readings.reduce((best, reading) =>
    reading.largest_movement > best.largest_movement ? reading : best,
  );

  return (
    <div>
      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((share) => (
          <g key={share}>
            <line
              x1={PAD.left}
              x2={PAD.left + PLOT.width}
              y1={shareY(share)}
              y2={shareY(share)}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={shareY(share) + 4}
              textAnchor="end"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {(share * highestLoss).toFixed(2)}
            </text>
            <text
              x={PAD.left + PLOT.width + 8}
              y={shareY(share) + 4}
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {share.toFixed(2)}
            </text>
          </g>
        ))}
        <path
          d={pathOf((reading) => reading.loss, lossY)}
          fill="none"
          stroke="#6366f1"
          strokeWidth={2}
        />
        <path
          d={pathOf((reading) => reading.accuracy, shareY)}
          fill="none"
          stroke="#22c55e"
          strokeWidth={2}
        />
        <path
          d={pathOf((reading) => reading.largest_movement, movementY)}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={1.6}
          strokeDasharray="4 3"
        />
        {firstPerfect && (
          <line
            x1={toX(firstPerfect.epoch)}
            x2={toX(firstPerfect.epoch)}
            y1={PAD.top}
            y2={PAD.top + PLOT.height}
            className="stroke-slate-400 dark:stroke-slate-600"
            strokeDasharray="2 3"
            strokeWidth={1.2}
          />
        )}
        {[1, 50, 100, 150, 200].map((epoch) => (
          <text
            key={epoch}
            x={toX(epoch)}
            y={CHART.height - PAD.bottom + 16}
            textAnchor="middle"
            className="fill-slate-500 text-[10px] dark:fill-slate-400"
          >
            {epoch}
          </text>
        ))}
        <text
          x={PAD.left + PLOT.width / 2}
          y={CHART.height - 4}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          epochs
        </text>
      </svg>

      <div className="mt-2 flex flex-wrap gap-4 text-xs">
        <Key colour="#6366f1" label="loss, left scale" />
        <Key colour="#22c55e" label="accuracy, right scale" />
        <Key colour="#f59e0b" label="largest slope in the chain, rescaled" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="Loss before any step"
          value={run.starting_loss.toFixed(4)}
        />
        <Stat label="Loss at the end" value={run.final_loss.toFixed(4)} />
        <Stat
          label="First epoch calling everybody correctly"
          value={firstPerfect ? String(firstPerfect.epoch) : "never"}
        />
        <Stat
          label="Largest slope, and where"
          value={`${loudest.largest_movement.toFixed(4)} at ${loudest.epoch}`}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The loss is still falling at epoch {last.epoch}, and only from epoch{" "}
        {withinAHundredth ? withinAHundredth.epoch : last.epoch} onward is it
        within a hundredth of where it finishes.
      </p>

      {message && (
        <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Key({ colour, label }: { colour: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
      <span
        className="inline-block h-2 w-6 rounded"
        style={{ backgroundColor: colour }}
      />
      {label}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
