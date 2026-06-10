"use client";

// What a rectangle total costs, counted and then timed.
//
// The counting half is the claim: a box of one pixel and a box of 360,000
// pixels name the same four table entries. The timing half is the check, run
// afresh each time the API restarts, so the ratios move by a few percent from
// one run to the next. The last row is the honest other side of it, which is
// that the table has to be built before any of this is free.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ReadingCost, fetchReadingCost } from "@/lib/concepts/haar-cascades";
import { Stat } from "./HaarCascadeParts";

const TABLE = "#4f46e5";
const PIXELS = "#e11d48";

export function ReadingCostPanel() {
  const [cost, setCost] = useState<ReadingCost | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCost(await fetchReadingCost());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!cost) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const longest = Math.max(cost.pixel_large_microseconds, 1);
  const bar = (value: number, colour: string) => (
    <div className="h-2.5 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
      <div
        className="h-full rounded"
        style={{
          width: `${Math.max((value / longest) * 100, 0.6)}%`,
          backgroundColor: colour,
        }}
      />
    </div>
  );

  const rows: { label: string; value: number; colour: string }[] = [
    {
      label: "table, one pixel",
      value: cost.table_small_microseconds,
      colour: TABLE,
    },
    {
      label: `table, ${cost.side} by ${cost.side}`,
      value: cost.table_large_microseconds,
      colour: TABLE,
    },
    {
      label: "adding pixels, one pixel",
      value: cost.pixel_small_microseconds,
      colour: PIXELS,
    },
    {
      label: `adding pixels, ${cost.side} by ${cost.side}`,
      value: cost.pixel_large_microseconds,
      colour: PIXELS,
    },
  ];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                Box
              </th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                Pixels inside it
              </th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">
                Table entries read
              </th>
            </tr>
          </thead>
          <tbody>
            {cost.boxes.map((one) => (
              <tr
                key={`${one.height}x${one.width}`}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {one.height} by {one.width}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {one.n_pixels.toLocaleString()}
                </td>
                <td
                  className="py-1.5 font-mono font-semibold"
                  style={{ color: TABLE }}
                >
                  {one.n_lookups}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-1.5">
        {rows.map((one) => (
          <div key={one.label}>
            <div className="flex items-baseline justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>{one.label}</span>
              <span className="font-mono">
                {one.value.toFixed(2)} microseconds
              </span>
            </div>
            {bar(one.value, one.colour)}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Stat
          label="times more pixels in the large box"
          value={cost.times_larger.toLocaleString()}
        />
        <Stat
          label="times longer the table took"
          value={`${cost.table_ratio.toFixed(2)}×`}
          tone={TABLE}
        />
        <Stat
          label="times longer adding pixels took"
          value={`${cost.pixel_ratio.toFixed(0)}×`}
          tone={PIXELS}
        />
        <Stat
          label="large reads before the table repays itself"
          value={cost.reads_to_repay_the_table.toFixed(0)}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Each figure is the average of {cost.repetitions.toLocaleString()}{" "}
        repetitions, timed when this page was first opened, so it moves by a few
        percent between runs. Building the table over the {cost.side} by{" "}
        {cost.side} picture took {cost.build_microseconds.toFixed(0)}{" "}
        microseconds, which is why the last figure matters.
      </p>
    </div>
  );
}
