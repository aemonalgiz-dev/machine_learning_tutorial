"use client";

// What choosing the width buys and what it costs, at six widths.
//
// The API works out, for each width, how many numbers the rows come to at an
// ordinary size and how many characters end up sharing one set of buckets. The
// browser draws the two against each other, so the shape of the trade is the
// picture rather than a claim, and the width nobody can derive is the point
// where a reader has to choose.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { LimitsView, fetchHashingLimits } from "@/lib/concepts/hashing-characters";

const COST_COLOUR = "#f59e0b";
const CROWD_COLOUR = "#6366f1";

export function WidthTradeChart() {
  const [view, setView] = useState<LimitsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchHashingLimits());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!view) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const widest = Math.max(...view.width_trades.map((row) => row.numbers));
  const largestCrowd = Math.max(
    ...view.width_trades.map((row) => row.characters_per_bucket_set),
  );
  const published = view.width_trades.find(
    (row) => row.n_buckets === view.published_buckets,
  );

  return (
    <div>
      <div className="space-y-2">
        {view.width_trades.map((row) => (
          <div key={row.n_buckets} className="text-xs">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                {row.n_buckets.toLocaleString()} buckets
                {row.n_buckets === view.published_buckets
                  ? " (the published one)"
                  : ""}
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-400">
                {row.numbers.toLocaleString()} numbers,{" "}
                {row.characters_per_bucket_set.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                characters to a set
              </span>
            </div>
            <div className="mt-1 space-y-0.5">
              <Bar width={(row.numbers / widest) * 100} colour={COST_COLOUR} />
              <Bar
                width={
                  (row.characters_per_bucket_set / largestCrowd) * 100
                }
                colour={CROWD_COLOUR}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs">
        <Key colour={COST_COLOUR} label="numbers the rows cost" />
        <Key colour={CROWD_COLOUR} label="characters sharing one set of buckets" />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Each bar is scaled against the largest of its own kind, so the two are
        read for their shape rather than against each other. Every step up in
        width multiplies the cost by four and divides the crowd by four, and
        nothing in the two curves marks a place to stop. The published width sits
        at {published ? published.numbers.toLocaleString() : "…"} numbers and{" "}
        {published
          ? published.characters_per_bucket_set.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })
          : "…"}{" "}
        characters to a set.
      </p>
    </div>
  );
}

function Bar({ width, colour }: { width: number; colour: string }) {
  return (
    <div className="h-2 w-full rounded-sm bg-slate-100 dark:bg-slate-800">
      <div
        className="h-2 rounded-sm"
        style={{ width: `${width}%`, backgroundColor: colour }}
      />
    </div>
  );
}

function Key({ colour, label }: { colour: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
      <span
        className="inline-block h-2 w-4 rounded-sm"
        style={{ backgroundColor: colour }}
      />
      {label}
    </span>
  );
}
