"use client";

// How many rectangle readings a window admits, against how many pixels it
// holds, on a scale where a straight line means a fixed ratio of growth.
//
// Both counts are drawn so the gap between them can be seen opening: doubling
// the side multiplies the pixels by four and the readings by nearly sixteen.
// The API counts the readings; the browser draws the two curves.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Arrangements, fetchArrangements } from "@/lib/concepts/haar-cascades";
import { Stat } from "./HaarCascadeParts";

const WIDTH = 460;
const HEIGHT = 240;
const PAD = { left: 46, right: 14, top: 14, bottom: 34 };
const FEATURES = "#4f46e5";
const PIXELS = "#64748b";

export function FeatureCountCurve() {
  const [data, setData] = useState<Arrangements | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setData(await fetchArrangements());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!data) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const counts = data.counts;
  const sides = counts.map((one) => one.side);
  const largest = Math.max(...counts.map((one) => one.n_features));
  const x = (side: number) =>
    PAD.left +
    ((Math.log(side) - Math.log(Math.min(...sides))) /
      (Math.log(Math.max(...sides)) - Math.log(Math.min(...sides)))) *
      (WIDTH - PAD.left - PAD.right);
  const y = (value: number) =>
    HEIGHT -
    PAD.bottom -
    (Math.log(Math.max(value, 1)) / Math.log(largest)) *
      (HEIGHT - PAD.top - PAD.bottom);

  const path = (pick: (side: number, pixels: number, features: number) => number) =>
    counts
      .map(
        (one, index) =>
          `${index === 0 ? "M" : "L"} ${x(one.side).toFixed(1)} ${y(
            pick(one.side, one.n_pixels, one.n_features),
          ).toFixed(1)}`,
      )
      .join(" ");

  const window24 = counts.find((one) => one.side === 24);
  const window12 = counts.find((one) => one.side === 12);

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        role="img"
      >
        {[1, 10, 100, 1000, 10000, 100000].map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="rgba(148,163,184,0.28)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 6}
              y={y(tick) + 3}
              textAnchor="end"
              fontSize={9}
              fill="#94a3b8"
              fontFamily="ui-monospace, monospace"
            >
              {tick.toLocaleString()}
            </text>
          </g>
        ))}
        {counts.map((one) => (
          <text
            key={one.side}
            x={x(one.side)}
            y={HEIGHT - PAD.bottom + 14}
            textAnchor="middle"
            fontSize={10}
            fill="#94a3b8"
            fontFamily="ui-monospace, monospace"
          >
            {one.side}
          </text>
        ))}
        <text
          x={(WIDTH + PAD.left) / 2}
          y={HEIGHT - 6}
          textAnchor="middle"
          fontSize={10}
          fill="#94a3b8"
        >
          window side, in pixels
        </text>
        <path
          d={path((_side, pixels) => pixels)}
          fill="none"
          stroke={PIXELS}
          strokeWidth={2}
          strokeDasharray="5 4"
        />
        <path
          d={path((_side, _pixels, features) => features)}
          fill="none"
          stroke={FEATURES}
          strokeWidth={2.5}
        />
        {counts.map((one) => (
          <circle
            key={`dot-${one.side}`}
            cx={x(one.side)}
            cy={y(one.n_features)}
            r={3}
            fill={FEATURES}
          />
        ))}
      </svg>

      <div className="mt-2 flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <span
            className="inline-block h-0.5 w-5"
            style={{ backgroundColor: FEATURES }}
          />
          readings the window admits
        </span>
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <span
            className="inline-block h-0.5 w-5"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${PIXELS} 0 4px, transparent 4px 7px)`,
            }}
          />
          pixels the window holds
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Stat
          label="readings at twelve a side"
          value={(window12?.n_features ?? 0).toLocaleString()}
        />
        <Stat
          label="readings at twenty-four a side"
          value={(window24?.n_features ?? 0).toLocaleString()}
          tone={FEATURES}
        />
        <Stat
          label="readings per pixel at twenty-four"
          value={`${window24?.features_per_pixel ?? 0}`}
        />
        <Stat
          label="growth on doubling the side"
          value={`${data.doubling_factor}×`}
        />
      </div>
    </div>
  );
}
