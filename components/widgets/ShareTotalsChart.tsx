"use client";

// Thirty-two window sides, and whether an average's shares add up to one.
//
// Each tile is one window side. The library's average pooling hands every
// position in a window one over the number of positions, and the tile asks
// what those shares come to when the layer's backward pass adds them up,
// through the API. Emerald tiles sum to one to the last bit and amber tiles
// miss, and the table underneath prints every amber total in full. Every
// total is the layer's; the browser colours the tiles.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ShareTotals, sumWindowShares } from "@/lib/concepts/pooling";

const LARGEST_SIDE = 32;
const QUOTED_SIDE = 7;

export function ShareTotalsChart() {
  const [totals, setTotals] = useState<ShareTotals | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setTotals(await sumWindowShares("average", LARGEST_SIDE));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const inexact = totals ? totals.totals.filter((entry) => !entry.exact) : [];
  const quoted = totals
    ? (totals.totals.find((entry) => entry.side === QUOTED_SIDE) ?? null)
    : null;

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="grid grid-cols-8 gap-1">
        {totals
          ? totals.totals.map((entry) => (
              <div
                key={entry.side}
                title={`side ${entry.side}, ${entry.positions} shares, total ${entry.total}`}
                className={
                  "flex h-9 items-center justify-center rounded font-mono text-sm font-semibold " +
                  (entry.exact
                    ? "bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100"
                    : "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100")
                }
              >
                {entry.side}
              </div>
            ))
          : Array.from({ length: LARGEST_SIDE }, (_, index) => (
              <div
                key={index}
                className="h-9 rounded bg-slate-200 dark:bg-slate-800"
              />
            ))}
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Window sides one to thirty-two under average pooling. Emerald adds up
        to one exactly, amber misses in the last bit or two.
      </p>

      {inexact.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="py-1 pr-3 font-medium">Side</th>
                <th className="py-1 pr-3 font-medium">Shares summed</th>
                <th className="py-1 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="font-mono text-slate-700 dark:text-slate-300">
              {inexact.map((entry) => (
                <tr key={entry.side}>
                  <td className="py-0.5 pr-3">{entry.side}</td>
                  <td className="py-0.5 pr-3">{entry.positions}</td>
                  <td className="py-0.5">{String(entry.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Sides that miss"
          value={
            totals ? `${totals.n_inexact} of ${totals.totals.length}` : "…"
          }
        />
        <Stat
          label={`Side ${QUOTED_SIDE} adds up to`}
          value={quoted ? String(quoted.total) : "…"}
        />
        <Stat
          label="Furthest from one"
          value={
            totals
              ? `side ${totals.worst_side}, by ${totals.worst_gap.toExponential(1)}`
              : "…"
          }
        />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="break-all font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
