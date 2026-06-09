"use client";

// The learned pair, and what it gives back.
//
// The whole-number four under the batch layer, with the scale and the shift
// of one chosen feature under the reader's hand. At a scale of one and a
// shift of zero the layer's answer is the standardised column exactly. Set
// the scale to the column's own deviation and the shift to its own mean, which
// the undo button does with the figures the API reported, and the answer is
// the raw column back again, to within a rounding the readout prints. The
// standardised column, the answer and the gap to the raw block are all the
// library's through the API; the browser only holds the sliders.

import { useEffect, useState } from "react";
import {
  NormalisedBlock,
  failureMessage,
  normaliseBlock,
} from "@/lib/concepts/normalisation-layers";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  WORKED_BLOCK,
  formatMagnitude,
  formatSigned,
} from "./normalisationLayersFixtures";

const WIDTH = WORKED_BLOCK[0].length;

export function ScaleShiftUndo() {
  const [feature, setFeature] = useState(1);
  const [scale, setScale] = useState<number[]>(Array(WIDTH).fill(1));
  const [shift, setShift] = useState<number[]>(Array(WIDTH).fill(0));
  const [answer, setAnswer] = useState<NormalisedBlock | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await normaliseBlock(WORKED_BLOCK, "batch", { scale, shift }));
        setMessage(null);
      } catch (error) {
        setMessage(failureMessage(error));
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [scale, shift]);

  const setOne = (values: number[], value: number) =>
    values.map((current, index) => (index === feature ? value : current));

  const undo = () => {
    if (!answer) return;
    setScale(answer.statistics.map((statistic) => statistic.deviation));
    setShift(answer.statistics.map((statistic) => statistic.mean ?? 0));
  };

  const standardiseOnly = () => {
    setScale(Array(WIDTH).fill(1));
    setShift(Array(WIDTH).fill(0));
  };

  const statistic = answer?.statistics[feature];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {WORKED_BLOCK[0].map((_, index) => (
          <button
            key={index}
            onClick={() => setFeature(index)}
            className={index === feature ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
          >
            feature {index + 1}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-2">
          <button onClick={standardiseOnly} className={BUTTON_CLASS}>
            Standardise only
          </button>
          <button onClick={undo} className={BUTTON_CLASS} disabled={!answer}>
            Undo exactly
          </button>
        </span>
      </div>

      <div className="grid gap-x-6 gap-y-2 text-sm text-slate-600 sm:grid-cols-2 dark:text-slate-300">
        <label className="flex items-center gap-2">
          scale
          <input
            type="range"
            min={0.1}
            max={12}
            step={0.01}
            value={scale[feature]}
            onChange={(event) => setScale(setOne(scale, Number(event.target.value)))}
            className="flex-1 accent-indigo-600"
          />
          <span className="w-20 text-right font-mono">{scale[feature].toFixed(4)}</span>
        </label>
        <label className="flex items-center gap-2">
          shift
          <input
            type="range"
            min={-12}
            max={12}
            step={0.01}
            value={shift[feature]}
            onChange={(event) => setShift(setOne(shift, Number(event.target.value)))}
            className="flex-1 accent-amber-500"
          />
          <span className="w-20 text-right font-mono">{shift[feature].toFixed(4)}</span>
        </label>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">row</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">raw</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">standardised</th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">scale · standardised + shift</th>
            </tr>
          </thead>
          <tbody>
            {WORKED_BLOCK.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-1.5 pr-4 text-slate-500 dark:text-slate-400">{rowIndex + 1}</td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{row[feature]}</td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {answer ? formatSigned(answer.standardised[rowIndex][feature], 7) : "…"}
                </td>
                <td className="py-1.5 font-mono font-semibold text-indigo-700 dark:text-indigo-300">
                  {answer ? formatSigned(answer.normalised[rowIndex][feature], 7) : "…"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="column mean" value={statistic ? formatSigned(statistic.mean ?? 0, 4) : "…"} />
        <Stat label="column deviation, epsilon inside" value={statistic ? statistic.deviation.toFixed(7) : "…"} />
        <Stat label="largest gap to the raw block" value={answer ? formatMagnitude(answer.largest_gap_to_raw) : "…"} />
        <Stat label="the pair now" value={`${scale[feature].toFixed(4)}, ${shift[feature].toFixed(4)}`} />
      </div>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
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
