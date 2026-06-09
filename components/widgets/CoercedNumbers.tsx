"use client";

// What a layer does to numbers that were never meant to be measurements.
//
// Every block a layer reads is turned into floating point and then scanned for
// non-finite entries, and those are the only two things that happen to it. So
// a value handed over as a position in a table keeps whatever fractional part
// it had, keeps whatever sign it had, and, once it is large enough, stops
// being distinguishable from its neighbour. The API hands a bridge layer a row
// of numbers and reports each one as it was asked for and as the layer
// answered with it. Both sides are text, because the browser's own numbers
// would lose the last pair before they ever reached the screen.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  WholeNumberProbe,
  probeWholeNumbers,
} from "@/lib/concepts/shapes-and-flattening";
import {
  INDEX_LIKE_NUMBERS,
  NOT_WHOLE_NUMBERS,
} from "./shapesAndFlatteningFixtures";

// A fixed request shared by whatever asks for it.
let cached: Promise<WholeNumberProbe> | null = null;

function probe(): Promise<WholeNumberProbe> {
  if (cached === null) {
    cached = probeWholeNumbers(INDEX_LIKE_NUMBERS, NOT_WHOLE_NUMBERS);
  }
  return cached;
}

export function CoercedNumbers() {
  const [answer, setAnswer] = useState<WholeNumberProbe | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await probe());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (answer === null) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const rows = [...answer.whole_numbers, ...answer.fractional_values];

  return (
    <div>
      <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span className="flex-1">handed to the layer</span>
          <span className="flex-1">answered with</span>
          <span className="w-24 shrink-0 text-right">a whole number</span>
          <span className="w-20 shrink-0 text-right">survived</span>
        </div>

        {rows.map((report, index) => (
          <div
            key={`${index}-${report.asked}`}
            className="flex items-center gap-3 border-b border-slate-100 py-1.5 text-sm last:border-0 dark:border-slate-800/60"
          >
            <span className="flex-1 font-mono text-slate-800 dark:text-slate-100">
              {report.asked}
            </span>
            <span
              className={
                "flex-1 font-mono " +
                (report.unchanged
                  ? "text-slate-800 dark:text-slate-100"
                  : "text-rose-700 dark:text-rose-300")
              }
            >
              {report.answered}
            </span>
            <span className="w-24 shrink-0 text-right text-slate-600 dark:text-slate-300">
              {report.whole ? "yes" : "no"}
            </span>
            <span
              className={
                "w-20 shrink-0 text-right " +
                (report.unchanged
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-rose-700 dark:text-rose-300")
              }
            >
              {report.unchanged ? "yes" : "no"}
            </span>
          </div>
        ))}

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat
            label="Distinct whole numbers asked for"
            value={String(answer.n_whole_asked)}
          />
          <Stat
            label="Distinct values left afterwards"
            value={String(answer.n_distinct_after)}
          />
          <Stat
            label="Refusals"
            value={answer.refusal === null ? "none" : answer.refusal}
          />
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        A negative position and a value that is not whole both go straight
        through, and the last two rows were told apart by the request and are
        not told apart by the layer.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
