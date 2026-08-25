"use client";

// What the sweep cost, against three things it could have cost instead, on a
// scale where each step is a factor of ten.
//
// The four bars are the same question answered four ways: the ordering as it
// stands, the same rules with no ordering at all, every reading the fit
// searched over measured at every position, and every reading the window
// admits measured at every position. The API counts all four; the browser
// draws them.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Sweep, fetchSweep } from "@/lib/concepts/haar-cascades";
import { Stat } from "./HaarCascadeParts";

const CASCADE = "#10b981";
const FLAT = "#4f46e5";
const BANK = "#e11d48";

export function SweepCostComparison() {
  const [sweep, setSweep] = useState<Sweep | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSweep(await fetchSweep());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!sweep) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const rows = [
    {
      label: "The cascade, in the order it stands",
      value: sweep.rule_evaluations,
      colour: CASCADE,
    },
    {
      label: "The same rules, every one at every position",
      value: sweep.flat_evaluations,
      colour: FLAT,
    },
    {
      label: "Every reading the fit searched, at every position",
      value: sweep.searched_bank,
      colour: BANK,
    },
    {
      label: "Every reading the window admits, at every position",
      value: sweep.exhaustive_bank,
      colour: BANK,
    },
  ];
  const largest = Math.max(...rows.map((one) => one.value));

  return (
    <div>
      <div className="space-y-2">
        {rows.map((one) => (
          <div key={one.label}>
            <div className="flex items-baseline justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>{one.label}</span>
              <span className="font-mono">{one.value.toLocaleString()}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded"
                style={{
                  width: `${Math.max(
                    (Math.log10(one.value) / Math.log10(largest)) * 100,
                    2,
                  )}%`,
                  backgroundColor: one.colour,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The bars are drawn so that each tenfold step in the count is the same
        length, because otherwise the first bar would be invisible.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        <Stat
          label="times cheaper than the same rules unordered"
          value={`${sweep.saving_over_flat.toFixed(2)}×`}
          tone={FLAT}
        />
        <Stat
          label="times cheaper than the searched readings"
          value={`${sweep.saving_over_searched_bank.toFixed(0)}×`}
        />
        <Stat
          label="times cheaper than every reading"
          value={`${sweep.saving_over_exhaustive_bank.toLocaleString()}×`}
          tone={BANK}
        />
      </div>
    </div>
  );
}
