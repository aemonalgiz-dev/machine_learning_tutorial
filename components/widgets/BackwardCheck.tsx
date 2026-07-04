"use client";

// The backward pass through a normalising layer, checked against a finite
// difference.
//
// A block, a layer and a slope arriving at every output that counts up from
// one, so no two entries pull alike. The three grids are the library's
// passed-down block, the naive block that treats each band's centre and
// deviation as constants and answers the arriving slope over the deviation,
// and a central finite difference of the objective taken through the layer's
// own forward pass. The readouts are how far each of the first two is from
// the third, and the sum of each block along its bands, which is zero exactly
// for a centring layer's true gradient. Every number is the library's through
// the API, including the naive block, which the API computes for comparison.

import { useEffect, useState } from "react";
import { NormalisationLayer } from "@/lib/api";
import {
  BackwardCheck as BackwardCheckReading,
  checkBackwardPass,
  failureMessage,
} from "@/lib/concepts/normalisation-layers";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  THREE_FEATURES,
  WORKED_BLOCK,
  formatMagnitude,
  formatSigned,
} from "./normalisationLayersFixtures";

const LAYERS: { layer: NormalisationLayer; label: string }[] = [
  { layer: "batch", label: "Batch" },
  { layer: "layer", label: "Layer" },
  { layer: "rms", label: "RMS" },
];

const BLOCKS: { name: string; rows: number[][] }[] = [
  { name: "The whole-number four", rows: WORKED_BLOCK },
  { name: "Three features", rows: THREE_FEATURES },
];

export function BackwardCheck({
  initialLayer = "batch",
  initialBlock = 0,
}: {
  initialLayer?: NormalisationLayer;
  initialBlock?: number;
}) {
  const [layer, setLayer] = useState<NormalisationLayer>(initialLayer);
  const [block, setBlock] = useState(initialBlock);
  const [reading, setReading] = useState<BackwardCheckReading | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setReading(await checkBackwardPass(BLOCKS[block].rows, layer));
        setMessage(null);
      } catch (error) {
        setMessage(failureMessage(error));
      }
    })();
  }, [layer, block]);

  const rows = BLOCKS[block].rows;
  const bandWord = layer === "batch" ? "column" : "row";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {BLOCKS.map((choice, index) => (
          <button
            key={choice.name}
            onClick={() => setBlock(index)}
            className={index === block ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
          >
            {choice.name}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1">
          {LAYERS.map((choice) => (
            <button
              key={choice.layer}
              onClick={() => setLayer(choice.layer)}
              className={choice.layer === layer ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
            >
              {choice.label}
            </button>
          ))}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Grid title="the block, and the slope arriving" rows={rows} second={reading?.arriving ?? null} raw />
        <Grid title="passed down, the three-route form" rows={reading?.passed_down ?? null} accent="text-indigo-700 dark:text-indigo-300" />
        <Grid title="naive, slope over deviation" rows={reading?.naive ?? null} accent="text-rose-600 dark:text-rose-400" />
        <Grid title="finite difference" rows={reading?.finite_difference ?? null} accent="text-emerald-700 dark:text-emerald-400" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="largest true slope" value={reading ? reading.largest_true_slope.toFixed(4) : "…"} />
        <Stat label="three-route form to finite difference" value={reading ? formatMagnitude(reading.largest_gap) : "…"} />
        <Stat label="naive to finite difference" value={reading ? reading.largest_naive_gap.toFixed(4) : "…"} />
        <Stat label={`largest ${bandWord} sum, three-route form`} value={reading ? formatMagnitude(reading.largest_band_sum) : "…"} />
        <Stat label={`largest ${bandWord} sum, naive`} value={reading ? reading.largest_naive_band_sum.toFixed(4) : "…"} />
        <Stat label="scale slope, shift slope" value={reading ? `${reading.scale_slope.map((value) => formatSigned(value, 2)).join(" ")} · ${reading.shift_slope.map((value) => formatSigned(value, 0)).join(" ")}` : "…"} />
      </div>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Grid({
  title,
  rows,
  second = null,
  raw = false,
  accent = "text-slate-800 dark:text-slate-200",
}: {
  title: string;
  rows: number[][] | null;
  second?: number[][] | null;
  raw?: boolean;
  accent?: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-950">
      <p className="mb-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <div className="space-y-0.5">
        {(rows ?? [[]]).map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((value, columnIndex) => (
              <div
                key={columnIndex}
                className={`flex-1 rounded bg-white px-1 py-0.5 text-center font-mono text-[11px] dark:bg-slate-900 ${accent}`}
              >
                {raw ? value : formatSigned(value, 4)}
                {raw && second && (
                  <span className="block text-[10px] text-slate-400">↓ {second[rowIndex][columnIndex]}</span>
                )}
              </div>
            ))}
            {row.length === 0 && <span className="text-xs text-slate-400">…</span>}
          </div>
        ))}
      </div>
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
