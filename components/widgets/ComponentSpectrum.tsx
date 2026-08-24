"use client";

// What each direction of the table accounts for, and what a cut keeps.
//
// One bar per direction, its height the share of the table that direction
// carries, shaded green up to the cut and red past it; the line is the running
// total. Drag the cut and watch how much of the table is being thrown away for
// how few numbers. The API decomposes; the browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  LatentFit,
  fitLatentSpace,
} from "@/lib/concepts/latent-semantic-analysis";
import {
  DISCARDED,
  KEPT,
  Legend,
  SHARED,
  Stat,
  Waiting,
} from "./latentSemanticShared";

const WIDTH = 560;
const HEIGHT = 220;
const PADDING = 36;

export function ComponentSpectrum() {
  const [cut, setCut] = useState(2);
  const [fit, setFit] = useState<LatentFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fitLatentSpace({ dimension: cut });
        if (!cancelled) {
          setFit(next);
          setMessage(null);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cut]);

  if (!fit) return <Waiting message={message} />;

  const components = fit.components;
  const tallest = Math.max(...components.map((one) => one.share), 0.001);
  const step = (WIDTH - 2 * PADDING) / components.length;
  const barWidth = Math.max(3, step * 0.62);
  const bottom = HEIGHT - PADDING;
  const top = 18;
  const height = (share: number) => ((share / tallest) * (bottom - top));
  const runningUp = (cumulative: number) =>
    bottom - cumulative * (bottom - top);

  const path = components
    .map(
      (one, position) =>
        `${position === 0 ? "M" : "L"} ${(PADDING + step * (position + 0.5)).toFixed(1)} ${runningUp(one.cumulative).toFixed(1)}`,
    )
    .join(" ");

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          <span className="text-xs">directions kept</span>
          <input
            type="range"
            min={1}
            max={16}
            step={1}
            value={cut}
            onChange={(event) => setCut(Number(event.target.value))}
            className="w-40 accent-emerald-500"
          />
          <span className="font-mono text-xs">{fit.dimension}</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="of the table kept"
          value={`${(fit.kept_share * 100).toFixed(1)}%`}
        />
        <Stat
          label="numbers kept"
          value={`${fit.numbers_kept} of ${fit.numbers_in_the_table}`}
        />
        <Stat
          label="squared error of the rebuild"
          value={fit.reconstruction_error.toFixed(4)}
        />
        <Stat
          label="directions with any spread"
          value={String(fit.rank)}
        />
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-3 w-full rounded-lg bg-slate-50 dark:bg-slate-900/60"
        role="img"
        aria-label="Each direction's share of the table, with the running total"
      >
        {components.map((one, position) => (
          <rect
            key={one.position}
            x={PADDING + step * (position + 0.5) - barWidth / 2}
            y={bottom - height(one.share)}
            width={barWidth}
            height={Math.max(0.6, height(one.share))}
            fill={position < fit.dimension ? KEPT : DISCARDED}
            fillOpacity={position < fit.dimension ? 0.75 : 0.4}
          />
        ))}
        <path d={path} fill="none" stroke={SHARED} strokeWidth={1.5} />
        <line
          x1={PADDING}
          y1={bottom}
          x2={WIDTH - PADDING}
          y2={bottom}
          stroke="#cbd5e1"
        />
        <line
          x1={PADDING + step * fit.dimension}
          y1={top - 6}
          x2={PADDING + step * fit.dimension}
          y2={bottom}
          stroke="#0f172a"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        {components.map((one, position) =>
          position % 2 === 0 ? (
            <text
              key={`label-${one.position}`}
              x={PADDING + step * (position + 0.5)}
              y={bottom + 13}
              fontSize={9}
              textAnchor="middle"
              fill={SHARED}
            >
              {one.position}
            </text>
          ) : null,
        )}
        <text x={PADDING} y={12} fontSize={10} fill={SHARED}>
          bars are what one direction accounts for, the line is the running
          total
        </text>
      </svg>

      <Legend>
        The bars fall away sharply after the first two and then flatten, and
        past the fourteenth they are exactly nothing, since twenty-three words
        over twenty-four documents built in this pattern leave only fourteen
        directions with any spread in them at all.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
