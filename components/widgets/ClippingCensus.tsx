"use client";

// What is left of the table once the negative half is thrown away.
//
// The bar splits the 529 pairs the vocabulary can form into three: the ones
// scored above chance, the ones scored below it and set to zero, and the ones
// that were never seen together and are zero for a different reason entirely.
// Below it, subtracting a little more before the clip and watching the first
// block shrink. The API scores and fits at every setting; the browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  ClippingReport,
  fetchClipping,
} from "@/lib/concepts/pointwise-mutual-information";
import {
  ABOVE,
  ABSENT,
  BELOW,
  Legend,
  Stat,
  Waiting,
} from "./mutualInformationShared";

export function ClippingCensus() {
  const [report, setReport] = useState<ClippingReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchClipping();
        if (!cancelled) setReport(next);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!report) return <Waiting message={message} />;

  const blocks = [
    { label: "above chance, kept", value: report.n_above_chance, colour: ABOVE },
    {
      label: "below chance, set to zero",
      value: report.n_below_chance,
      colour: BELOW,
    },
    {
      label: "never seen together, zero already",
      value: report.n_undefined,
      colour: ABSENT,
    },
  ];
  const widest = Math.max(...report.shifts.map((row) => row.n_kept), 1);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="pairs the vocabulary can form" value={String(report.n_cells)} />
        <Stat label="zero after the clip" value={String(report.n_zero_after_clipping)} />
        <Stat label="furthest fall" value={report.lowest_score.toFixed(4)} />
        <Stat
          label="mean of what is thrown away"
          value={report.mean_below_chance.toFixed(4)}
        />
      </div>

      <div className="mt-3 flex h-8 w-full overflow-hidden rounded">
        {blocks.map((block) => (
          <div
            key={block.label}
            style={{
              width: `${(block.value / report.n_cells) * 100}%`,
              backgroundColor: block.colour,
            }}
            className="flex items-center justify-center font-mono text-[10px] text-white"
          >
            {block.value}
          </div>
        ))}
      </div>
      <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-slate-500 dark:text-slate-400">
        {blocks.map((block) => (
          <span key={block.label} className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ backgroundColor: block.colour }}
            />
            {block.label}
          </span>
        ))}
      </div>

      <div className="mt-4 space-y-1">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="w-24 shrink-0">taken off first</span>
          <span className="flex-1">what is left above zero</span>
          <span className="w-24 shrink-0 text-right">how far the halves came apart</span>
        </div>
        {report.shifts.map((row) => (
          <div key={row.shift} className="flex items-center gap-2">
            <span className="w-24 shrink-0 font-mono text-xs text-slate-600 dark:text-slate-300">
              {row.shift.toFixed(4)}
            </span>
            <span className="flex h-3 flex-1 rounded bg-slate-100 dark:bg-slate-800">
              <span
                className="block h-3 rounded"
                style={{
                  width: `${(row.n_kept / widest) * 100}%`,
                  backgroundColor: ABOVE,
                }}
              />
            </span>
            <span className="w-10 shrink-0 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {row.n_kept}
            </span>
            <span className="w-24 shrink-0 text-right font-mono text-xs text-slate-600 dark:text-slate-300">
              {row.gap === null ? "no answer" : row.gap.toFixed(4)}
            </span>
          </div>
        ))}
      </div>

      <Legend>
        The last row takes off more than the largest score in the whole table, so
        nothing survives, every word is left pointing nowhere, and there is no
        angle between two words to report.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
