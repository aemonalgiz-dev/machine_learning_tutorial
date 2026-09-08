"use client";

// The network's training, epoch by epoch, at each of the three weight seeds.
//
// Left, the mean loss over each epoch's batches. Right, the share of the
// training half named correctly after the epoch, and the share of the
// held-out half, which the network never trained on. The chosen seed is drawn
// strongly and the other two faintly behind it, so the spread between starts
// is visible without a second chart. Every point is the API's.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  fetchNetworkReport,
  SEEDS,
  Variant,
  VariantReport,
} from "@/lib/concepts/convolutional-networks";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  Stat,
} from "@/components/widgets/filtersAndEdgesShared";
import { Loading, share } from "@/components/widgets/convolutionalNetworksShared";

const PANEL = { width: 300, height: 200 };
const PAD = { left: 34, right: 10, top: 12, bottom: 26 };

function path(values: number[], top: number): string {
  const x = (epoch: number) =>
    PAD.left + ((epoch - 1) / (values.length - 1)) * (PANEL.width - PAD.left - PAD.right);
  const y = (value: number) =>
    PANEL.height - PAD.bottom - (value / top) * (PANEL.height - PAD.top - PAD.bottom);
  return values
    .map((value, index) => `${index === 0 ? "M" : "L"}${x(index + 1).toFixed(1)},${y(value).toFixed(1)}`)
    .join(" ");
}

function Axes({ top, ticks, label }: { top: number; ticks: number[]; label: string }) {
  const y = (value: number) =>
    PANEL.height - PAD.bottom - (value / top) * (PANEL.height - PAD.top - PAD.bottom);
  return (
    <g className="text-slate-500 dark:text-slate-400" fontSize={9} fill="currentColor">
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={PAD.left} x2={PANEL.width - PAD.right} y1={y(tick)} y2={y(tick)} stroke="currentColor" strokeOpacity={0.15} />
          <text x={PAD.left - 4} y={y(tick) + 3} textAnchor="end">
            {tick}
          </text>
        </g>
      ))}
      <text x={(PANEL.width + PAD.left) / 2} y={PANEL.height - 6} textAnchor="middle">
        epoch, 1 to 40
      </text>
      <text x={PAD.left} y={8}>
        {label}
      </text>
    </g>
  );
}

export function CnnTrainingCurves({ variant = "reference" }: { variant?: Variant }) {
  const [reports, setReports] = useState<VariantReport[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    Promise.all(SEEDS.map((value) => fetchNetworkReport(variant, value)))
      .then(setReports)
      .catch((error) =>
        setMessage(error instanceof ApiError ? error.message : "Something went wrong."),
      );
  }, [variant]);

  if (!reports) return <Loading message={message} />;

  const lossTop = Math.ceil(Math.max(...reports.flatMap((report) => report.history.map((entry) => entry.loss))) * 2) / 2;
  const chosen = reports[seed];

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5">
        <span className="mr-1 text-xs text-slate-600 dark:text-slate-400">weight seed:</span>
        {SEEDS.map((value) => (
          <button key={value} className={value === seed ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS} onClick={() => setSeed(value)}>
            {value}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full rounded-lg bg-slate-50 dark:bg-slate-950">
          <Axes top={lossTop} ticks={[0, lossTop / 2, lossTop]} label="mean loss over the epoch" />
          {reports.map((report) => (
            <path
              key={report.seed}
              d={path(report.history.map((entry) => entry.loss), lossTop)}
              fill="none"
              stroke="#6366f1"
              strokeOpacity={report.seed === seed ? 1 : 0.2}
              strokeWidth={report.seed === seed ? 2 : 1}
            />
          ))}
        </svg>
        <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full rounded-lg bg-slate-50 dark:bg-slate-950">
          <Axes top={1} ticks={[0, 0.25, 0.5, 0.75, 1]} label="share named correctly" />
          {reports.map((report) => (
            <g key={report.seed} strokeOpacity={report.seed === seed ? 1 : 0.2}>
              <path d={path(report.history.map((entry) => entry.training_accuracy), 1)} fill="none" stroke="#94a3b8" strokeWidth={report.seed === seed ? 2 : 1} />
              <path d={path(report.history.map((entry) => entry.held_out_accuracy), 1)} fill="none" stroke="#10b981" strokeWidth={report.seed === seed ? 2 : 1} />
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
        <span><span className="mr-1 inline-block h-2 w-3 bg-slate-400" />training half, {chosen.n_training} pictures</span>
        <span><span className="mr-1 inline-block h-2 w-3 bg-emerald-500" />held-out half, {chosen.n_held_out} pictures</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Stat label="held out, after epoch 40" value={share(chosen.held_out_accuracy)} />
        <Stat label="best held out, and when" value={`${share(chosen.best_held_out_accuracy)}, epoch ${chosen.best_epoch}`} />
        <Stat label="training half, after epoch 40" value={share(chosen.training_accuracy)} />
        <Stat label="final loss" value={chosen.final_loss.toFixed(4)} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Seed {seed} drawn strongly, the other two faintly. This training took {chosen.seconds.toFixed(1)} s on the machine that answered.
      </p>
    </div>
  );
}
