"use client";

// The same fifty targets shown three ways, and how often each way is found.
//
// The first is fresh targets drawn exactly as the training ones were; the
// second exchanges bright for dark; the third turns the band a quarter. The
// last panel is the reading behind the outcome, which is the first rule's own
// layout on one target and on the same target relit. The API fits the
// detector, runs all three and reads the two values; the browser draws them.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Poses, fetchPoses } from "@/lib/concepts/haar-cascades";
import { PixelGrid, Stat } from "./HaarCascadeParts";

const CELL = 14;
const PLUS = "#4f46e5";
const MINUS = "#e11d48";
const FOUND = "#10b981";

export function PoseGallery() {
  const [poses, setPoses] = useState<Poses | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setPoses(await fetchPoses());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!poses) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const flip = poses.sign_flip;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {poses.poses.map((one) => (
          <div key={one.label}>
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-950">
              <PixelGrid rows={one.example.rows} cell={CELL} />
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
              {one.label}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {one.description}
            </p>
            <div className="mt-2">
              <Stat
                label="found"
                value={`${one.n_found} of ${one.n_shown}`}
                tone={one.n_found > 0 ? FOUND : MINUS}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
        <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">
          The first rule&rsquo;s own layout, {flip.arrangement.toLowerCase()},
          on one target and on the same target relit. Blue is added, red is
          taken away.
        </p>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          <Stat
            label="what it reads on the target"
            value={flip.on_the_target.toFixed(2)}
            tone={PLUS}
          />
          <Stat
            label="what it reads on the relit target"
            value={flip.on_the_relit_target.toFixed(2)}
            tone={MINUS}
          />
          <Stat
            label="the rule votes yes when the reading is"
            value={`${flip.direction} ${flip.threshold.toFixed(2)}`}
          />
          <Stat
            label="so it votes"
            value={`${flip.votes_yes_on_the_target ? "yes" : "no"}, then ${
              flip.votes_yes_on_the_relit_target ? "yes" : "no"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
