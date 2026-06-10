"use client";

// What one sweep costs, counted and then timed.
//
// The count is exact and is a fact about the method: a three by three grid does
// nine multiplications and eight additions at every pixel, and a gradient needs
// two of those. The seconds are a measurement of whichever machine served the
// request and move a little between runs, which is why they are fetched rather
// than written into the page, and why the figure worth reading is how the
// per-pixel cost falls as the picture grows rather than any single number.

import { useEffect, useState } from "react";
import {
  Operators,
  messageFor,
  readOperators,
} from "@/lib/concepts/filters-and-edges";
import { Failure, PANEL_CLASS, Stat } from "./filtersAndEdgesShared";

export function SweepCost() {
  const [operators, setOperators] = useState<Operators | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setOperators(await readOperators());
        setMessage(null);
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  const scene = operators?.costs.find((cost) => cost.side === 48) ?? null;
  const largest = operators?.costs[operators.costs.length - 1] ?? null;

  return (
    <div className={PANEL_CLASS}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-4 font-medium">Picture</th>
              <th className="py-1 pr-4 font-medium">Pixels</th>
              <th className="py-1 pr-4 font-medium">Multiplications</th>
              <th className="py-1 pr-4 font-medium">Additions</th>
              <th className="py-1 pr-4 font-medium">One sweep</th>
              <th className="py-1 font-medium">Per pixel</th>
            </tr>
          </thead>
          <tbody className="font-mono text-slate-700 dark:text-slate-300">
            {(operators?.costs ?? []).map((cost) => (
              <tr
                key={cost.side}
                className="border-t border-slate-200 dark:border-slate-800"
              >
                <td className="py-1 pr-4">
                  {cost.side} by {cost.side}
                </td>
                <td className="py-1 pr-4">{cost.n_pixels.toLocaleString()}</td>
                <td className="py-1 pr-4">
                  {cost.n_multiplies.toLocaleString()}
                </td>
                <td className="py-1 pr-4">
                  {cost.n_additions.toLocaleString()}
                </td>
                <td className="py-1 pr-4">
                  {(cost.seconds_per_sweep * 1000).toFixed(3)} ms
                </td>
                <td className="py-1">
                  {cost.nanoseconds_per_pixel.toFixed(1)} ns
                </td>
              </tr>
            ))}
            {!operators && (
              <tr>
                <td className="py-2 text-slate-400">…</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Operations per pixel, both directions"
          value={operators ? String(operators.n_operations_per_pixel) : "…"}
        />
        <Stat
          label="Operations for the whole scene"
          value={
            operators
              ? operators.n_operations_for_scene.toLocaleString()
              : "…"
          }
        />
        <Stat
          label="One sweep of the scene"
          value={
            scene ? `${(scene.seconds_per_sweep * 1e6).toFixed(0)} µs` : "…"
          }
        />
        <Stat
          label="Per pixel, at the largest size"
          value={
            largest ? `${largest.nanoseconds_per_pixel.toFixed(1)} ns` : "…"
          }
        />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-500">
        The counts are exact and the times are not, since they are a measurement
        of whichever machine answered this request. What is worth reading off
        them is that the per-pixel figure at 48 by 48 is roughly twice what it
        is at 1024 by 1024, because on a small picture most of the time goes on
        setting the sweep up rather than on doing the arithmetic.
      </p>

      <Failure message={message} />
    </div>
  );
}
