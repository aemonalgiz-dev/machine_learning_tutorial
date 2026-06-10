"use client";

// A fresh draw of two thousand backgrounds and fifty targets, walked stage by
// stage, so that what each stage keeps of each class can be read side by side.
//
// The backgrounds fall away sharply and the targets almost do not, which is
// what a stage calibrated to keep every target it was shown buys and what it
// costs. The one place the targets do fall is the first stage, and nothing
// after it can put them back. The API fits the detector and walks both classes
// through it; the browser draws the two funnels.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Detector, fetchDetector } from "@/lib/concepts/haar-cascades";
import { Stat } from "./HaarCascadeParts";

const BACKGROUNDS = "#e11d48";
const TARGETS = "#10b981";

export function HeldOutFunnel() {
  const [detector, setDetector] = useState<Detector | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setDetector(await fetchDetector());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!detector) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const held = detector.held_out;
  const labels = [
    "Before any stage",
    ...detector.stages.map((one) => `After stage ${one.number}`),
  ];

  const funnel = (
    counts: number[],
    colour: string,
    title: string,
    total: number,
  ) => (
    <div>
      <p className="mb-2 text-sm font-medium" style={{ color: colour }}>
        {title}
      </p>
      <div className="space-y-1.5">
        {counts.map((count, position) => (
          <div key={labels[position]}>
            <div className="flex items-baseline justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>{labels[position]}</span>
              <span className="font-mono">
                {count.toLocaleString()} · {((count / total) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded"
                style={{
                  width: `${Math.max((count / total) * 100, 0.4)}%`,
                  backgroundColor: colour,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2">
        {funnel(
          held.backgrounds_through_each_stage,
          BACKGROUNDS,
          `${held.n_backgrounds.toLocaleString()} fresh backgrounds`,
          held.n_backgrounds,
        )}
        {funnel(
          held.targets_through_each_stage,
          TARGETS,
          `${held.n_targets} fresh targets`,
          held.n_targets,
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Stat
          label="backgrounds past the first stage"
          value={held.backgrounds_through_each_stage[1].toLocaleString()}
          tone={BACKGROUNDS}
        />
        <Stat
          label="backgrounds past all of them"
          value={held.backgrounds_through_each_stage[
            held.backgrounds_through_each_stage.length - 1
          ].toLocaleString()}
        />
        <Stat
          label="share of targets found"
          value={held.recall.toFixed(2)}
          tone={TARGETS}
        />
        <Stat
          label="share of what it names that is a target"
          value={held.precision.toFixed(4)}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The shares one stage passes to the next are{" "}
        {held.background_shares.map((one) => one.toFixed(4)).join(", ")}, and
        multiplying them gives the share that reaches the end.
      </p>
    </div>
  );
}
