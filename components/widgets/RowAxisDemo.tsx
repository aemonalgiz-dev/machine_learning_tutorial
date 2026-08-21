"use client";

// Twenty of the crowd, standardised along the row instead of down the column.
//
// A person is a row of two numbers, a height in centimetres and a weight in
// kilograms, and the row layers read their mean and deviation from those two
// numbers alone. With two numbers the deviation is half their difference, so
// every person comes back as one and minus one in some order, and the only
// thing the layer has kept is which number was larger. The RMS layer divides
// without centring and keeps the rows apart, though what it has kept is
// their proportion and not their size. Every answer is the library's through
// the API; the browser lays the rows out.

import { useEffect, useState } from "react";
import {
  NormalisedBlock,
  failureMessage,
  normaliseBlock,
} from "@/lib/concepts/normalisation-layers";
import {
  TWENTY_OF_THE_CROWD,
  formatMagnitude,
  formatSigned,
} from "./normalisationLayersFixtures";

const SHOWN = 8;

export function RowAxisDemo() {
  const [layer, setLayer] = useState<NormalisedBlock | null>(null);
  const [rms, setRms] = useState<NormalisedBlock | null>(null);
  const [batch, setBatch] = useState<NormalisedBlock | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [first, second, third] = await Promise.all([
          normaliseBlock(TWENTY_OF_THE_CROWD, "layer"),
          normaliseBlock(TWENTY_OF_THE_CROWD, "rms"),
          normaliseBlock(TWENTY_OF_THE_CROWD, "batch"),
        ]);
        setLayer(first);
        setRms(second);
        setBatch(third);
      } catch (error) {
        setMessage(failureMessage(error));
      }
    })();
  }, []);

  if (!layer || !rms || !batch) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const widest = Math.max(
    ...layer.normalised.flatMap((row) => row.map((value) => Math.abs(Math.abs(value) - 1))),
  );
  const distinct = new Set(
    layer.normalised.map((row) => row.map((value) => Math.round(value * 1e6) / 1e6).join(",")),
  ).size;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">person</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">height, weight</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">down the columns, batch</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">along the row, layer</th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">along the row, RMS</th>
            </tr>
          </thead>
          <tbody>
            {TWENTY_OF_THE_CROWD.slice(0, SHOWN).map((person, index) => (
              <tr key={index} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-1.5 pr-4 text-slate-500 dark:text-slate-400">{index + 1}</td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{person[0]}, {person[1]}</td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{pair(batch.normalised[index])}</td>
                <td className="py-1.5 pr-4 font-mono text-rose-600 dark:text-rose-400">{pair(layer.normalised[index])}</td>
                <td className="py-1.5 font-mono text-emerald-700 dark:text-emerald-400">{pair(rms.normalised[index])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The first {SHOWN} of the twenty; the rest read the same way.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="distinct rows after layer normalisation, of 20" value={String(distinct)} />
        <Stat label="widest distance from ±1, layer" value={formatMagnitude(widest)} />
        <Stat label="person 1, row mean and deviation" value={`${layer.statistics[0].mean}, ${layer.statistics[0].deviation.toFixed(7)}`} />
        <Stat label="column means, batch" value={`${batch.statistics[0].mean}, ${batch.statistics[1].mean}`} />
      </div>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function pair(values: number[]): string {
  return values.map((value) => formatSigned(value, 4)).join(", ");
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
