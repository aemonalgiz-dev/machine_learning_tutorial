"use client";

// One training run, replayed.
//
// The scrubber does not refit anything. The library was asked once, and the
// endpoint recorded the loss after every epoch and the decision region at
// eight points along that single walk, so what the reader steps through is one
// network learning rather than a series of unrelated fits. The shaded map is
// where the network draws its boundary at the chosen moment, and the staircase
// underneath is the loss falling. Changing a setting starts a new run, and the
// caption says so. Every number comes from the library through the API.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  PRESET_TITLES,
  TrainingPreset,
  TrainingRun,
  trainOneNetwork,
} from "@/lib/concepts/training-a-network";

const VIEW = { width: 460, height: 400 };
const PAD = { left: 14, right: 14, top: 14, bottom: 14 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const LOSS_VIEW = { width: 460, height: 170 };
const LOSS_PAD = { left: 52, right: 16, top: 14, bottom: 32 };
const LOSS_PLOT = {
  width: LOSS_VIEW.width - LOSS_PAD.left - LOSS_PAD.right,
  height: LOSS_VIEW.height - LOSS_PAD.top - LOSS_PAD.bottom,
};

const DEBOUNCE_MS = 200;

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const ACTIVE_CLASS =
  "rounded-md border border-indigo-400 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-600 dark:bg-indigo-950 dark:text-indigo-300";

export function TrainingRunPlayground() {
  const [preset, setPreset] = useState<TrainingPreset>("rings");
  const [hiddenWidth, setHiddenWidth] = useState(6);
  const [learningRate, setLearningRate] = useState(0.5);
  const [maxEpochs, setMaxEpochs] = useState(200);
  const [weightSeed, setWeightSeed] = useState(1);
  const [snapshot, setSnapshot] = useState(0);
  const [run, setRun] = useState<TrainingRun | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const key = JSON.stringify({
    preset,
    hiddenWidth,
    learningRate,
    maxEpochs,
    weightSeed,
  });

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const trained = await trainOneNetwork({
          preset,
          hiddenWidth,
          learningRate,
          maxEpochs,
          weightSeed,
        });
        setRun(trained);
        setSnapshot(trained.regions.length - 1);
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // The request is a pure function of the key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const shown = run
    ? run.regions[Math.min(snapshot, run.regions.length - 1)]
    : null;
  const grid = shown?.regions;

  const toPixel = (point: { x: number; y: number }) => {
    if (!grid) return { px: 0, py: 0 };
    return {
      px:
        PAD.left +
        ((point.x - grid.x_min) / (grid.x_max - grid.x_min)) * PLOT.width,
      py:
        PAD.top +
        (1 - (point.y - grid.y_min) / (grid.y_max - grid.y_min)) * PLOT.height,
    };
  };

  const losses = run ? run.readings.map((reading) => reading.loss) : [];
  const highestLoss = losses.length ? Math.max(...losses) : 1;
  const shownEpoch = shown ? shown.epoch : 0;

  // The reading whose loss belongs to the shown epoch. Epoch zero has no
  // reading of its own, and its loss is the starting loss.
  const readingAt =
    run && shownEpoch > 0 ? run.readings[shownEpoch - 1] : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {(Object.keys(PRESET_TITLES) as TrainingPreset[]).map((name) => (
          <button
            key={name}
            onClick={() => setPreset(name)}
            className={name === preset ? ACTIVE_CLASS : BUTTON_CLASS}
          >
            {PRESET_TITLES[name]}
          </button>
        ))}
        <button
          onClick={() => setWeightSeed((current) => (current % 9) + 1)}
          className={BUTTON_CLASS}
        >
          New starting weights
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          hidden units
          <input
            type="range"
            min={2}
            max={8}
            step={1}
            value={hiddenWidth}
            onChange={(event) => setHiddenWidth(Number(event.target.value))}
            className="w-24 accent-indigo-600"
          />
          <span className="w-4 font-mono text-sm">{hiddenWidth}</span>
        </label>
        <label className="flex items-center gap-2">
          step size
          <input
            type="range"
            min={0.05}
            max={1.5}
            step={0.05}
            value={learningRate}
            onChange={(event) => setLearningRate(Number(event.target.value))}
            className="w-24 accent-emerald-600"
          />
          <span className="w-8 font-mono text-sm">
            {learningRate.toFixed(2)}
          </span>
        </label>
        <label className="flex items-center gap-2">
          epochs
          <input
            type="range"
            min={10}
            max={300}
            step={10}
            value={maxEpochs}
            onChange={(event) => setMaxEpochs(Number(event.target.value))}
            className="w-24 accent-amber-600"
          />
          <span className="w-8 font-mono text-sm">{maxEpochs}</span>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <svg
          viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
          className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        >
          {grid &&
            grid.labels.map((row, rowIndex) =>
              row.map((called, columnIndex) => {
                const cellWidth = PLOT.width / grid.cells;
                const cellHeight = PLOT.height / grid.cells;
                return (
                  <rect
                    key={`${rowIndex}-${columnIndex}`}
                    x={PAD.left + columnIndex * cellWidth}
                    y={PAD.top + PLOT.height - (rowIndex + 1) * cellHeight}
                    width={cellWidth + 0.5}
                    height={cellHeight + 0.5}
                    className={
                      called === 1 ? "fill-indigo-500/20" : "fill-amber-500/20"
                    }
                  />
                );
              }),
            )}
          {run &&
            grid &&
            run.points.map((point, index) => {
              const { px, py } = toPixel(point);
              return (
                <circle
                  key={index}
                  cx={px}
                  cy={py}
                  r={4}
                  className={`${point.label === 1 ? "fill-indigo-600" : "fill-amber-500"} stroke-white dark:stroke-slate-900`}
                  strokeWidth={1.2}
                />
              );
            })}
        </svg>

        <div>
          {run && losses.length > 1 && (
            <svg
              viewBox={`0 0 ${LOSS_VIEW.width} ${LOSS_VIEW.height}`}
              className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
            >
              <text
                x={LOSS_PAD.left}
                y={LOSS_PAD.top}
                className="fill-slate-500 text-[11px] dark:fill-slate-400"
              >
                the loss, epoch by epoch
              </text>
              {[0, 0.5, 1].map((share) => {
                const value = share * highestLoss;
                const y =
                  LOSS_PAD.top + (1 - share) * LOSS_PLOT.height;
                return (
                  <g key={share}>
                    <line
                      x1={LOSS_PAD.left}
                      x2={LOSS_PAD.left + LOSS_PLOT.width}
                      y1={y}
                      y2={y}
                      className="stroke-slate-200 dark:stroke-slate-800"
                      strokeWidth={1}
                    />
                    <text
                      x={LOSS_PAD.left - 6}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-slate-500 text-[10px] dark:fill-slate-400"
                    >
                      {value.toFixed(2)}
                    </text>
                  </g>
                );
              })}
              <path
                d={losses
                  .map((loss, index) => {
                    const x =
                      LOSS_PAD.left +
                      (index / (losses.length - 1)) * LOSS_PLOT.width;
                    const y =
                      LOSS_PAD.top +
                      (1 - loss / (highestLoss || 1)) * LOSS_PLOT.height;
                    return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(" ")}
                fill="none"
                strokeWidth={2}
                className="stroke-indigo-600 dark:stroke-indigo-400"
              />
              {shownEpoch > 0 && (
                <line
                  x1={
                    LOSS_PAD.left +
                    ((shownEpoch - 1) / (losses.length - 1)) * LOSS_PLOT.width
                  }
                  y1={LOSS_PAD.top}
                  x2={
                    LOSS_PAD.left +
                    ((shownEpoch - 1) / (losses.length - 1)) * LOSS_PLOT.width
                  }
                  y2={LOSS_PAD.top + LOSS_PLOT.height}
                  className="stroke-amber-500"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                />
              )}
            </svg>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat
              label="Epoch shown"
              value={run ? `${shownEpoch} of ${maxEpochs}` : "…"}
            />
            <Stat
              label="Loss there"
              value={
                readingAt
                  ? readingAt.loss.toFixed(4)
                  : run
                    ? run.starting_loss.toFixed(4)
                    : "…"
              }
            />
            <Stat
              label="Accuracy there"
              value={readingAt ? readingAt.accuracy.toFixed(3) : "…"}
            />
            <Stat
              label="A straight boundary"
              value={run ? run.straight_line_accuracy.toFixed(3) : "…"}
            />
          </div>
        </div>
      </div>

      {run && run.regions.length > 1 && (
        <label className="mt-3 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          replay
          <input
            type="range"
            min={0}
            max={run.regions.length - 1}
            step={1}
            value={Math.min(snapshot, run.regions.length - 1)}
            onChange={(event) => setSnapshot(Number(event.target.value))}
            className="w-full accent-slate-700 dark:accent-slate-300"
          />
          <span className="w-16 font-mono text-sm">epoch {shownEpoch}</span>
        </label>
      )}

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The replay steps through one recorded run. Changing a setting above
        starts a fresh run, it does not continue this one.
      </p>

      {message && (
        <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{message}</p>
      )}
    </div>
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
