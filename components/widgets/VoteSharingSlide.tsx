"use client";

// Turning a ramp through a bucket boundary, under both ways of casting a vote.
//
// The API sweeps a picture whose gradient is one known direction at every
// interior pixel from nought to forty-five degrees and reports what an
// interior cell put in each bucket under each rule; the browser draws the two
// histograms side by side and lets the reader drag the angle across the
// boundary. The whole vote leaps from one bucket to the next between nineteen
// and twenty-one degrees; the shared vote slides.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  SharingView,
  fetchVoteSharing,
} from "@/lib/concepts/histogram-of-oriented-gradients";
import { BucketBars, Stat } from "./orientedGradientsDrawing";

export function VoteSharingSlide() {
  const [degrees, setDegrees] = useState(19);
  const [view, setView] = useState<SharingView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetchVoteSharing()
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

  const step = view.steps[degrees];
  const fullestWhole = step.whole.indexOf(Math.max(...step.whole));
  const fullestShared = step.shared.indexOf(Math.max(...step.shared));

  return (
    <div>
      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        the edge runs at
        <input
          type="range"
          min={0}
          max={45}
          step={1}
          value={degrees}
          onChange={(event) => setDegrees(Number(event.target.value))}
          className="flex-1 accent-indigo-600"
        />
        <span className="w-10 text-right font-mono">{degrees}°</span>
      </label>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
          <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
            the whole vote into the bucket it falls in
          </p>
          <BucketBars
            weights={step.whole}
            bucketCentreDegrees={view.bucket_centre_degrees}
            colour="fill-rose-500 dark:fill-rose-400"
          />
          <p className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-300">
            {step.whole
              .map((share) => (share === 0 ? "." : share.toFixed(2)))
              .join("  ")}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
          <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
            the vote shared between the two nearest centres
          </p>
          <BucketBars
            weights={step.shared}
            bucketCentreDegrees={view.bucket_centre_degrees}
          />
          <p className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-300">
            {step.shared
              .map((share) => (share === 0 ? "." : share.toFixed(2)))
              .join("  ")}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="fullest bucket, whole vote"
          value={`${Math.round(view.bucket_centre_degrees[fullestWhole])}°`}
        />
        <Stat
          label="fullest bucket, shared"
          value={`${Math.round(view.bucket_centre_degrees[fullestShared])}°`}
        />
        <Stat
          label={`how far ${view.before_degrees}° to ${view.after_degrees}° moves it, whole`}
          value={view.moved_whole.toFixed(3)}
        />
        <Stat
          label={`the same, shared`}
          value={view.moved_shared.toFixed(3)}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        A bucket covers {view.bucket_span_degrees.toFixed(0)} degrees and is
        centred on the number under its bar. Drag across the boundary at 20
        degrees and watch the left pair jump while the right pair slides; the
        two degrees from {view.before_degrees} to {view.after_degrees} move the
        cell {view.ratio.toFixed(0)} times as far under whole votes.
      </p>
    </div>
  );
}
