"use client";

// One sweep over the scene, with the windows still alive at each stage drawn
// on top of it, and what the sweep cost beside them.
//
// Choose a stage and the scene shows the window positions that were still
// being considered when that stage ran. The first stage considers every
// position, so its picture is the whole grid; by the third there is very
// little left, and the shrinking is the method. The API fits the detector,
// sweeps the scene, names the surviving positions and counts every rule it
// evaluated; the browser only draws them.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Position, Sweep, fetchSweep } from "@/lib/concepts/haar-cascades";
import { PixelGrid, Stat } from "./HaarCascadeParts";

const CELL = 8;
const ALIVE = "#4f46e5";
const FOUND = "#10b981";
const PLANTED = "#f59e0b";

export function CascadeSweepBoard() {
  const [sweep, setSweep] = useState<Sweep | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setSweep(await fetchSweep());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!sweep) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const side = sweep.scene.height;
  const window = sweep.window_side;
  const lastStage = sweep.stages.length;

  // Stage 0 is every position, stages 1 and 2 are the survivors the API named,
  // and the entry past the last stage is what came out the other end.
  const everyPosition: Position[] = [];
  for (let top = 0; top + window <= side; top += 1) {
    for (let left = 0; left + window <= side; left += 1) {
      everyPosition.push({ top, left });
    }
  }
  const layers: Position[][] = [
    everyPosition,
    ...sweep.survivors,
    sweep.accepted,
  ];
  const shown = layers[stage];
  const isOutcome = stage === lastStage;

  const buttons = [
    ...sweep.stages.map((one) => ({
      label: `Into stage ${one.number}`,
      count: one.windows_reaching,
    })),
    { label: "Accepted", count: sweep.n_accepted },
  ];

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {buttons.map((one, position) => (
          <button
            key={one.label}
            type="button"
            onClick={() => setStage(position)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              position === stage
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {one.label} · {one.count.toLocaleString()}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-[3fr_2fr]">
        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-950">
          <PixelGrid rows={sweep.scene.rows} cell={CELL}>
            {shown.map((one) => (
              <rect
                key={`${one.top}-${one.left}`}
                x={one.left * CELL + CELL / 2 - 1.6}
                y={one.top * CELL + CELL / 2 - 1.6}
                width={3.2}
                height={3.2}
                fill={isOutcome ? FOUND : ALIVE}
                opacity={stage === 0 ? 0.35 : 0.9}
              />
            ))}
            {sweep.planted.map((one) => (
              <rect
                key={`planted-${one.top}-${one.left}`}
                x={one.left * CELL}
                y={one.top * CELL}
                width={window * CELL}
                height={window * CELL}
                fill="none"
                stroke={PLANTED}
                strokeWidth={2}
              />
            ))}
          </PixelGrid>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Every dot is the top-left corner of a window still under
            consideration. The three amber outlines are where the targets
            actually are.
          </p>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-1.5">
            <Stat
              label="window positions swept"
              value={sweep.windows_examined.toLocaleString()}
            />
            <Stat
              label="windows accepted"
              value={sweep.n_accepted.toLocaleString()}
              tone={FOUND}
            />
            <Stat
              label="rules evaluated"
              value={sweep.rule_evaluations.toLocaleString()}
              tone={ALIVE}
            />
            <Stat
              label="rules a window costs on average"
              value={sweep.rules_per_window.toFixed(2)}
            />
          </div>
          <div className="mt-3 space-y-1.5">
            {sweep.stages.map((one) => (
              <div key={one.number}>
                <div className="flex items-baseline justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>
                    Stage {one.number}, {one.n_rules}{" "}
                    {one.n_rules === 1 ? "rule" : "rules"}
                  </span>
                  <span className="font-mono">
                    {one.windows_reaching.toLocaleString()} ·{" "}
                    {(one.share_of_all_windows * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${Math.max(one.share_of_all_windows * 100, 0.5)}%`,
                      backgroundColor: ALIVE,
                    }}
                  />
                </div>
              </div>
            ))}
            <div>
              <div className="flex items-baseline justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Accepted</span>
                <span className="font-mono">
                  {sweep.n_accepted.toLocaleString()} ·{" "}
                  {((sweep.n_accepted / sweep.windows_examined) * 100).toFixed(
                    1,
                  )}
                  %
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded"
                  style={{
                    width: `${Math.max(
                      (sweep.n_accepted / sweep.windows_examined) * 100,
                      0.5,
                    )}%`,
                    backgroundColor: FOUND,
                  }}
                />
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Of the {sweep.n_accepted} windows accepted,{" "}
            {sweep.accepted_near_a_target} sit within two pixels of one of the
            three targets and the rest are ground that happens to be brighter
            across its middle.
          </p>
        </div>
      </div>
    </div>
  );
}
