"use client";

// The loss the training loop sees, epoch by epoch, under five arrangements.
//
// One seed, the whole crowd, four hundred full-batch steps at a stride of
// one. The upper chart is the loss the backward pass measured on its way
// forward, and under the batch arrangement that is the loss by the batch's
// own statistics. The lower chart is the batch arrangement's accuracy asked
// two ways after each step, properly while predicting and again while still
// training, which differ because the running figures lag the batch; every
// other arrangement answers identically both ways. Every loss and every
// accuracy is the library's through the API; the browser draws the curves.

import { useEffect, useState } from "react";
import {
  ARRANGEMENT_TITLES,
  Arrangement,
  ArrangementCurve,
  CrowdExperiment,
  failureMessage,
  fetchCrowdExperiment,
} from "@/lib/concepts/normalisation-layers";
import { ARRANGEMENT_COLOURS } from "./normalisationLayersFixtures";

const CHART = { width: 640, height: 260 };
const PAD = { left: 52, right: 20, top: 16, bottom: 36 };
const PLOT = {
  width: CHART.width - PAD.left - PAD.right,
  height: CHART.height - PAD.top - PAD.bottom,
};
const LOWER = { width: 640, height: 200 };
const LOWER_PLOT = {
  width: LOWER.width - PAD.left - PAD.right,
  height: LOWER.height - PAD.top - PAD.bottom,
};
const LOSS_TOP = 1.2;

export function ArrangementCurves({ showPurposes = true }: { showPurposes?: boolean }) {
  const [experiment, setExperiment] = useState<CrowdExperiment | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [shown, setShown] = useState<Arrangement[]>(["none", "batch", "layer"]);

  useEffect(() => {
    (async () => {
      try {
        setExperiment(await fetchCrowdExperiment());
      } catch (error) {
        setMessage(failureMessage(error));
      }
    })();
  }, []);

  if (!experiment) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "… the first visit trains a hundred and thirty small networks, which takes ten to twenty seconds"}
      </p>
    );
  }

  const epochs = experiment.epochs;
  const epochToX = (epoch: number, width: number) => PAD.left + (epoch / epochs) * width;
  const lossToY = (loss: number) => PAD.top + (1 - Math.min(loss, LOSS_TOP) / LOSS_TOP) * PLOT.height;
  const accuracyToY = (accuracy: number) => PAD.top + (1 - (accuracy - 0.5) / 0.5) * LOWER_PLOT.height;
  const pathOf = (
    curve: ArrangementCurve,
    pick: (reading: ArrangementCurve["readings"][number]) => number,
    toY: (value: number) => number,
    width: number,
  ) =>
    curve.readings
      .map((reading, index) => `${index === 0 ? "M" : "L"} ${epochToX(reading.epoch, width)} ${toY(pick(reading))}`)
      .join(" ");

  const toggle = (arrangement: Arrangement) =>
    setShown((current) =>
      current.includes(arrangement)
        ? current.length > 1
          ? current.filter((each) => each !== arrangement)
          : current
        : [...current, arrangement],
    );

  const visible = experiment.curves.filter((curve) => shown.includes(curve.arrangement));
  const batch = experiment.curves.find((curve) => curve.arrangement === "batch");
  const differing = batch
    ? batch.readings.filter((reading) => reading.predicting_accuracy !== reading.training_accuracy).length
    : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {experiment.curves.map((curve) => {
          const colour = ARRANGEMENT_COLOURS[curve.arrangement];
          const on = shown.includes(curve.arrangement);
          return (
            <button
              key={curve.arrangement}
              onClick={() => toggle(curve.arrangement)}
              className={
                "rounded-md border px-3 py-1.5 text-sm font-medium transition " +
                (on
                  ? "text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200")
              }
              style={on ? { backgroundColor: colour, borderColor: colour } : undefined}
            >
              {ARRANGEMENT_TITLES[curve.arrangement]}
            </button>
          );
        })}
      </div>

      <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {[0, 0.3, 0.6, 0.9, 1.2].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={PAD.left + PLOT.width} y1={lossToY(tick)} y2={lossToY(tick)} className={tick === experiment.loss_threshold ? "stroke-amber-400" : "stroke-slate-200 dark:stroke-slate-800"} strokeWidth={1} strokeDasharray={tick === experiment.loss_threshold ? "4 3" : undefined} />
            <text x={PAD.left - 8} y={lossToY(tick) + 4} textAnchor="end" className="fill-slate-500 text-xs dark:fill-slate-400">
              {tick.toFixed(1)}
            </text>
          </g>
        ))}
        {[0, 100, 200, 300, 400].map((tick) => (
          <text key={tick} x={epochToX(tick, PLOT.width)} y={CHART.height - PAD.bottom + 16} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">
            {tick}
          </text>
        ))}
        {visible.map((curve) => (
          <path key={curve.arrangement} d={pathOf(curve, (reading) => reading.loss, lossToY, PLOT.width)} fill="none" stroke={ARRANGEMENT_COLOURS[curve.arrangement]} strokeWidth={1.8} />
        ))}
        <text x={PAD.left + PLOT.width / 2} y={CHART.height - 4} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">
          epochs
        </text>
        <text x={14} y={PAD.top + PLOT.height / 2} textAnchor="middle" transform={`rotate(-90 14 ${PAD.top + PLOT.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">
          loss the backward pass measured
        </text>
      </svg>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The dashed line is a loss of {experiment.loss_threshold}, which each curve is timed against below.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {experiment.curves.map((curve) => (
          <Stat
            key={curve.arrangement}
            label={ARRANGEMENT_TITLES[curve.arrangement]}
            value={`under ${experiment.loss_threshold} at epoch ${curve.first_epoch_below_threshold ?? "never"}`}
            detail={`ends at ${curve.final_loss.toFixed(4)}, accuracy ${curve.final_accuracy.toFixed(2)}`}
            colour={ARRANGEMENT_COLOURS[curve.arrangement]}
          />
        ))}
      </div>

      {showPurposes && batch && (
        <>
          <svg viewBox={`0 0 ${LOWER.width} ${LOWER.height}`} className="mt-4 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
            {[0.5, 0.75, 1.0].map((tick) => (
              <g key={tick}>
                <line x1={PAD.left} x2={PAD.left + LOWER_PLOT.width} y1={accuracyToY(tick)} y2={accuracyToY(tick)} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={1} />
                <text x={PAD.left - 8} y={accuracyToY(tick) + 4} textAnchor="end" className="fill-slate-500 text-xs dark:fill-slate-400">
                  {tick.toFixed(2)}
                </text>
              </g>
            ))}
            <path d={pathOf(batch, (reading) => reading.training_accuracy, accuracyToY, LOWER_PLOT.width)} fill="none" stroke={ARRANGEMENT_COLOURS.batch} strokeWidth={1.6} strokeDasharray="5 4" />
            <path d={pathOf(batch, (reading) => reading.predicting_accuracy, accuracyToY, LOWER_PLOT.width)} fill="none" stroke={ARRANGEMENT_COLOURS.batch} strokeWidth={1.6} />
            <text x={PAD.left + LOWER_PLOT.width / 2} y={LOWER.height - 4} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">
              the batch arrangement, asked while predicting (solid) and while still training (dashed)
            </text>
          </svg>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            The two readings differ on {differing} of the {epochs} epochs. At epoch 10 the network answers {batch.readings[9].predicting_accuracy.toFixed(2)} by its running figures and {batch.readings[9].training_accuracy.toFixed(2)} by the batch&rsquo;s own.
          </p>
        </>
      )}
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value, detail, colour }: { label: string; value: string; detail: string; colour: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-[11px]" style={{ color: colour }}>{label}</div>
      <div className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">{value}</div>
      <div className="text-[10px] text-slate-500 dark:text-slate-400">{detail}</div>
    </div>
  );
}
