"use client";

// The same detector swept over three scenes that differ in one thing only: how
// much of them is the target.
//
// The three grounds are drawn from the same random draw, so nothing but the
// targets planted in them changes. Underneath each is what a window cost on
// average, read against the ceiling, which is every rule in the cascade run on
// every window. The API sweeps all three; the browser draws them.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Scenes, fetchScenes } from "@/lib/concepts/haar-cascades";
import { PixelCanvas, Stat } from "./HaarCascadeParts";

const COST = "#e11d48";

export function SceneCostComparison() {
  const [scenes, setScenes] = useState<Scenes | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setScenes(await fetchScenes());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!scenes) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {scenes.scenes.map((one) => (
          <div key={one.label}>
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-950">
              <PixelCanvas rows={one.scene.rows} />
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
              {one.label}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {one.description}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <Stat
                label="rules a window cost"
                value={one.rules_per_window.toFixed(2)}
                tone={COST}
              />
              <Stat
                label="times cheaper than no ordering"
                value={`${one.saving_over_flat.toFixed(2)}×`}
              />
              <Stat
                label="windows past the first stage"
                value={one.windows_reaching[1].toLocaleString()}
              />
              <Stat
                label="windows accepted"
                value={one.n_accepted.toLocaleString()}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        The ceiling is {scenes.most_rules_per_window} rules a window, which is
        what it would cost if nothing were ever thrown away early, and the three
        scenes approach it in the order you would expect.
      </p>
    </div>
  );
}
