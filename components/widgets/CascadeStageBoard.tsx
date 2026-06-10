"use client";

// The fitted detector, one stage at a time: the rules it chose drawn over an
// example target, and what the stage did to the training windows.
//
// Each rule is one layout at one position and one size, so it can be drawn
// exactly where it reads, added cells in blue and subtracted ones in red. The
// counts beneath are what that stage was handed and what it threw away, which
// is where the falling-away shape of the method first shows itself. The API
// fits the detector and reports both; the browser draws them.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Detector, fetchDetector } from "@/lib/concepts/haar-cascades";
import { PixelGrid, Stat } from "./HaarCascadeParts";

const PLUS = "#4f46e5";
const MINUS = "#e11d48";
const CELL = 16;

export function CascadeStageBoard() {
  const [detector, setDetector] = useState<Detector | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showBackground, setShowBackground] = useState(false);

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

  const beneath = showBackground
    ? detector.example_background
    : detector.example_target;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setShowBackground(false)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
            showBackground
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              : "bg-indigo-600 text-white"
          }`}
        >
          Over a target
        </button>
        <button
          type="button"
          onClick={() => setShowBackground(true)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
            showBackground
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          }`}
        >
          Over a background
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {detector.stages.map((stage) => (
          <div
            key={stage.number}
            className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
          >
            <p className="mb-2 text-sm font-medium text-slate-800 dark:text-slate-200">
              Stage {stage.number}
            </p>
            <div className="flex gap-2">
              {stage.rules.map((rule, position) => (
                <div key={position} className="flex-1">
                  <div className="rounded bg-slate-50 p-1 dark:bg-slate-950">
                    <PixelGrid rows={beneath.rows} cell={CELL}>
                      {rule.cells.map((one, index) => (
                        <rect
                          key={index}
                          x={one.left * CELL}
                          y={one.top * CELL}
                          width={one.width * CELL}
                          height={one.height * CELL}
                          fill={one.sign > 0 ? PLUS : MINUS}
                          fillOpacity={0.45}
                          stroke={one.sign > 0 ? PLUS : MINUS}
                          strokeWidth={1.5}
                        />
                      ))}
                    </PixelGrid>
                  </div>
                  <p className="mt-1 text-[11px] leading-tight text-slate-600 dark:text-slate-400">
                    {rule.arrangement}, cells {rule.cell_height} by{" "}
                    {rule.cell_width}
                  </p>
                  <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    yes when {rule.direction} {rule.threshold.toFixed(2)}
                  </p>
                  <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    voice {rule.voice.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              <Stat
                label="backgrounds handed to it"
                value={stage.negatives_reaching.toLocaleString()}
              />
              <Stat
                label="of those thrown away"
                value={stage.negatives_rejected.toLocaleString()}
                tone={MINUS}
              />
              <Stat
                label="share thrown away"
                value={`${(stage.rejection_share * 100).toFixed(1)}%`}
              />
              <Stat
                label="targets kept"
                value={`${stage.positives_kept} of ${detector.n_targets}`}
                tone={PLUS}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Every stage keeps all {detector.n_targets} targets and each is handed
        only what the stage before it let through, so the second faces{" "}
        {detector.stages[1]?.negatives_reaching.toLocaleString()} backgrounds
        where the first faced{" "}
        {detector.stages[0]?.negatives_reaching.toLocaleString()}.
      </p>
    </div>
  );
}
