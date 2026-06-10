"use client";

// The crudest possible edge decision, and the two ways it goes wrong at once.
//
// Drag the threshold and the map keeps the pixels at or above it. The two counts
// beneath say how many of the kept pixels lie on flat ground, which is noise
// surviving, and how many pixels on a real boundary have been dropped, which is
// a real edge being lost. There is no position of the slider where both are
// zero, and the widget says which of the two is happening rather than leaving it
// to be inferred from the picture.
//
// The API scores every threshold against two populations it reads off the same
// scene drawn without its brightness ramp, so which pixels are really on a
// boundary is known rather than guessed. The browser draws the map and the
// curve.

import { useEffect, useState } from "react";
import {
  Thresholds,
  messageFor,
  readThresholds,
} from "@/lib/concepts/filters-and-edges";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  Failure,
  MapPanel,
  PANEL_CLASS,
  PixelMap,
  Stat,
} from "./filtersAndEdgesShared";

const CHART_WIDTH = 460;
const CHART_HEIGHT = 170;
const LEFT = 40;
const BOTTOM = 26;

export function ThresholdSweep() {
  const [thresholds, setThresholds] = useState<Thresholds | null>(null);
  const [threshold, setThreshold] = useState(0.9);
  const [clean, setClean] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setThresholds(await readThresholds());
        setMessage(null);
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  const magnitude = thresholds
    ? clean
      ? thresholds.clean_magnitude
      : thresholds.magnitude
    : null;
  const kept = magnitude
    ? magnitude.map((row) => row.map((value) => (value >= threshold ? 1 : 0)))
    : null;
  const row =
    thresholds?.rows.reduce((closest, one) =>
      Math.abs(one.threshold - threshold) < Math.abs(closest.threshold - threshold)
        ? one
        : closest,
    ) ?? null;

  const worstWrong = Math.max(
    1,
    ...(thresholds?.rows.map((one) => one.flat_kept) ?? [1]),
  );

  return (
    <div className={PANEL_CLASS}>
      {thresholds && magnitude && kept && row ? (
        <>
          <div className="flex flex-wrap items-center gap-1 pb-3 text-xs text-slate-600 dark:text-slate-300">
            the picture is
            <button
              onClick={() => setClean(true)}
              className={clean ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
            >
              drawn by arithmetic
            </button>
            <button
              onClick={() => setClean(false)}
              className={!clean ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
            >
              carrying sensor noise
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-5">
            <MapPanel
              title="how sharp the change is"
              scale="magnitude"
              low="0"
              high={thresholds.largest_magnitude.toFixed(2)}
              note={
                clean
                  ? `flat ground answers between ${thresholds.clean_flat_low.toFixed(4)} and ${thresholds.clean_flat_high.toFixed(4)}`
                  : `flat ground now answers as high as ${thresholds.noisy_flat_high.toFixed(4)}`
              }
            >
              <PixelMap
                rows={magnitude}
                scale="magnitude"
                largest={thresholds.largest_magnitude}
              />
            </MapPanel>
            <MapPanel
              title={`kept at ${threshold.toFixed(1)}`}
              scale="brightness"
              low="dropped"
              high="kept"
              note={
                clean
                  ? "on the clean picture every threshold in a wide window is perfect"
                  : `${row.flat_kept} flat pixels survive and ${row.edge_lost} boundary pixels are lost`
              }
            >
              <PixelMap rows={kept} scale="brightness" largest={1} />
            </MapPanel>
          </div>

          <label className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            threshold on how sharp the change is
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.1}
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
              className="w-64 accent-indigo-600"
            />
            <span className="font-mono">{threshold.toFixed(1)}</span>
          </label>

          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="mt-3 h-auto w-full"
            role="img"
            aria-label="how many pixels each threshold labels wrongly"
          >
            <line
              x1={LEFT}
              y1={CHART_HEIGHT - BOTTOM}
              x2={CHART_WIDTH - 8}
              y2={CHART_HEIGHT - BOTTOM}
              stroke="currentColor"
              className="text-slate-300 dark:text-slate-700"
            />
            {(["flat_kept", "edge_lost"] as const).map((which) => (
              <polyline
                key={which}
                fill="none"
                stroke={
                  which === "flat_kept"
                    ? "rgb(217, 119, 6)"
                    : "rgb(79, 70, 229)"
                }
                strokeWidth={2}
                points={thresholds.rows
                  .map((one) => {
                    const x =
                      LEFT + ((one.threshold - 0.1) / 2.9) * (CHART_WIDTH - LEFT - 12);
                    const y =
                      CHART_HEIGHT -
                      BOTTOM -
                      (one[which] / worstWrong) * (CHART_HEIGHT - BOTTOM - 12);
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(" ")}
              />
            ))}
            <line
              x1={LEFT + ((threshold - 0.1) / 2.9) * (CHART_WIDTH - LEFT - 12)}
              y1={8}
              x2={LEFT + ((threshold - 0.1) / 2.9) * (CHART_WIDTH - LEFT - 12)}
              y2={CHART_HEIGHT - BOTTOM}
              stroke="currentColor"
              strokeDasharray="3 3"
              className="text-slate-400 dark:text-slate-500"
            />
            {[0, 1, 2, 3].map((mark) => (
              <text
                key={mark}
                x={LEFT + ((mark - 0.1) / 2.9) * (CHART_WIDTH - LEFT - 12)}
                y={CHART_HEIGHT - BOTTOM + 14}
                textAnchor="middle"
                className="fill-slate-500 text-[9px] dark:fill-slate-400"
              >
                {mark}
              </text>
            ))}
            <text
              x={LEFT}
              y={20}
              className="fill-amber-600 text-[10px] dark:fill-amber-400"
            >
              flat pixels kept
            </text>
            <text
              x={LEFT}
              y={34}
              className="fill-indigo-600 text-[10px] dark:fill-indigo-400"
            >
              boundary pixels lost
            </text>
            <text
              x={LEFT}
              y={CHART_HEIGHT - 4}
              className="fill-slate-500 text-[9px] dark:fill-slate-400"
            >
              the threshold
            </text>
          </svg>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              label="Flat pixels kept"
              value={`${row.flat_kept} of ${thresholds.n_flat_pixels}`}
            />
            <Stat
              label="Boundary pixels lost"
              value={`${row.edge_lost} of ${thresholds.n_edge_pixels}`}
            />
            <Stat
              label="Faint boundary pixels lost"
              value={`${row.faint_lost} of ${thresholds.n_faint_pixels}`}
            />
            <Stat label="Wrong either way" value={String(row.n_wrong)} />
          </div>

          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-500">
            {clean
              ? `Drawn by arithmetic the picture has no noise, so flat ground never answers above ${thresholds.clean_flat_high.toFixed(4)} and the faintest real boundary answers ${thresholds.highest_clean_threshold.toFixed(4)}. Every threshold between those two labels all ${thresholds.n_pixels} pixels correctly.`
              : `With noise at ${thresholds.noise_level} the two ranges overlap, since flat ground reaches ${thresholds.noisy_flat_high.toFixed(4)} and the faintest boundary sits at ${thresholds.highest_clean_threshold.toFixed(4)}. The best threshold in the sweep is ${thresholds.best_threshold.toFixed(1)} and it still leaves ${thresholds.best_wrong} pixels on the wrong side.`}
          </p>
        </>
      ) : (
        <p className="py-12 text-center text-slate-400">…</p>
      )}

      <Failure message={message} />
    </div>
  );
}
