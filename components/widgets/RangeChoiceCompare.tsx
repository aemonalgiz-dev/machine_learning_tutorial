"use client";

// A bright thing on a dark ground beside its opposite, under each range.
//
// The API describes a bar and the same bar with its brightness turned inside
// out, once over half a circle and once over the whole one, and measures how
// far apart the two descriptions come out. The browser draws the two
// histograms and the distance. Over half a circle the two answers are the same
// vector; over the whole circle they are as far apart as two answers of that
// length can be.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  RangeView,
  fetchRangeChoice,
} from "@/lib/concepts/histogram-of-oriented-gradients";
import { BucketBars, Stat } from "./orientedGradientsDrawing";

export function RangeChoiceCompare() {
  const [whole, setWhole] = useState(false);
  const [view, setView] = useState<RangeView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetchRangeChoice()
      .then((answer) => live && setView(answer))
      .catch((error) => {
        if (!live) return;
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      });
    return () => {
      live = false;
    };
  }, []);

  if (!view) {
    return (
      <p className="text-sm text-amber-600 dark:text-amber-400">
        {message ?? "…"}
      </p>
    );
  }

  const pair = whole ? view.bar[1] : view.bar[0];
  const scenePair = whole ? view.scene[1] : view.scene[0];

  return (
    <div>
      <span className="flex w-fit flex-wrap gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
        {[
          [false, "half a circle, 9 buckets"],
          [true, "the whole circle, 18 buckets"],
        ].map(([value, label]) => (
          <button
            key={String(label)}
            onClick={() => setWhole(Boolean(value))}
            className={
              "rounded px-2 py-0.5 text-xs font-medium transition " +
              (whole === value
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
            }
          >
            {String(label)}
          </button>
        ))}
      </span>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {[pair.here, pair.inverted].map((side, index) => (
          <div
            key={side.picture}
            className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950"
          >
            <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
              {side.picture_label}
            </p>
            <BucketBars
              weights={side.shares}
              bucketCentreDegrees={side.bucket_centre_degrees}
              colour={
                index === 0
                  ? "fill-indigo-500 dark:fill-indigo-400"
                  : "fill-rose-500 dark:fill-rose-400"
              }
              labelEvery={side.shares.length > 12 ? 3 : 1}
            />
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              weight in{" "}
              {side.occupied_buckets
                .map((bucket) =>
                  `${Math.round(side.bucket_centre_degrees[bucket])}°`,
                )
                .join(" and ")}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="the bar and its opposite, apart by"
          value={pair.distance === 0 ? "0" : pair.distance.toFixed(5)}
        />
        <Stat
          label="out of an answer of length"
          value={pair.description_length.toFixed(3)}
        />
        <Stat
          label="the whole scene and its opposite"
          value={
            scenePair.distance < 1e-10
              ? scenePair.distance.toExponential(1)
              : scenePair.distance.toFixed(4)
          }
        />
        <Stat
          label="out of an answer of length"
          value={scenePair.description_length.toFixed(3)}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The bars are labelled by the direction each bucket is centred on, in
        degrees. Turning a picture&rsquo;s brightness inside out reverses every
        edge without moving any of them, and the two settings disagree about
        whether that is a change at all.
      </p>
    </div>
  );
}
