"use client";

// Where the cuts land, plotted against how many blocks they make.
//
// The API cuts all eighteen sentences at every fixed block size from one to
// twelve and at six thresholds, and sorts every cut into the three places one
// can fall. The browser plots the share that landed inside a word against the
// number of blocks, with the share of all positions in the corpus that fall
// inside a word drawn across it, since that is what cutting anywhere would give.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  CutLandingView,
  LandingRow,
  fetchCutLanding,
} from "@/lib/concepts/patching-without-a-vocabulary";

const WIDTH = 720;
const HEIGHT = 300;
const LEFT = 52;
const RIGHT = WIDTH - 16;
const TOP = 18;
const BOTTOM = HEIGHT - 46;

const FIXED_COLOUR = "#f59e0b";
const ENTROPY_COLOUR = "#6366f1";

export function CutLandingChart() {
  const [view, setView] = useState<CutLandingView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchCutLanding());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!view) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const every = [...view.fixed, ...view.thresholds];
  const lowest = Math.min(...every.map((row) => row.n_patches));
  const highest = Math.max(...every.map((row) => row.n_patches));
  const span = Math.log10(highest) - Math.log10(lowest);

  function xOf(row: LandingRow): number {
    const along = (Math.log10(row.n_patches) - Math.log10(lowest)) / span;
    return LEFT + along * (RIGHT - LEFT);
  }

  function yOf(share: number): number {
    return BOTTOM - share * (BOTTOM - TOP);
  }

  function pathOf(rows: LandingRow[]): string {
    return rows
      .map(
        (row, position) =>
          `${position === 0 ? "M" : "L"} ${xOf(row).toFixed(1)} ${yOf(
            row.share_inside_a_word,
          ).toFixed(1)}`,
      )
      .join(" ");
  }

  const uninformed = view.share_of_positions_inside_a_word;
  const atTheThreshold = view.thresholds.find(
    (row) => row.setting === view.threshold,
  );
  const nearest = view.fixed.reduce((best, row) =>
    atTheThreshold &&
    Math.abs(row.n_patches - atTheThreshold.n_patches) <
      Math.abs(best.n_patches - atTheThreshold.n_patches)
      ? row
      : best,
  );

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="Share of cuts landing inside a word against the number of blocks"
        >
          {[0, 0.2, 0.4, 0.6, 0.8].map((share) => (
            <g key={share}>
              <line
                x1={LEFT}
                y1={yOf(share)}
                x2={RIGHT}
                y2={yOf(share)}
                className="stroke-slate-200 dark:stroke-slate-800"
              />
              <text
                x={LEFT - 8}
                y={yOf(share) + 3}
                textAnchor="end"
                className="fill-slate-400 dark:fill-slate-500"
                fontSize="9"
                fontFamily="monospace"
              >
                {Math.round(share * 100)}%
              </text>
            </g>
          ))}

          <line
            x1={LEFT}
            y1={yOf(uninformed)}
            x2={RIGHT}
            y2={yOf(uninformed)}
            className="stroke-slate-500"
            strokeDasharray="5 3"
          />
          <text
            x={RIGHT}
            y={yOf(uninformed) - 5}
            textAnchor="end"
            className="fill-slate-500 dark:fill-slate-400"
            fontSize="10"
          >
            cutting anywhere at all: {(uninformed * 100).toFixed(1)}%
          </text>

          <path
            d={pathOf(view.fixed)}
            fill="none"
            stroke={FIXED_COLOUR}
            strokeWidth="2"
          />
          <path
            d={pathOf(view.thresholds)}
            fill="none"
            stroke={ENTROPY_COLOUR}
            strokeWidth="2"
          />

          {view.fixed.map((row) => (
            <circle
              key={`fixed-${row.setting}`}
              cx={xOf(row)}
              cy={yOf(row.share_inside_a_word)}
              r={3}
              fill={FIXED_COLOUR}
            />
          ))}
          {view.thresholds.map((row) => (
            <circle
              key={`entropy-${row.setting}`}
              cx={xOf(row)}
              cy={yOf(row.share_inside_a_word)}
              r={3}
              fill={ENTROPY_COLOUR}
            />
          ))}

          {view.thresholds.map((row) => (
            <text
              key={`entropy-label-${row.setting}`}
              x={xOf(row)}
              y={yOf(row.share_inside_a_word) - 8}
              textAnchor="middle"
              fill={ENTROPY_COLOUR}
              fontSize="9"
              fontFamily="monospace"
            >
              {row.setting}
            </text>
          ))}
          {view.fixed
            .filter((row) => [1, 4, 8, 12].includes(row.setting))
            .map((row) => (
              <text
                key={`fixed-label-${row.setting}`}
                x={xOf(row)}
                y={yOf(row.share_inside_a_word) + 15}
                textAnchor="middle"
                fill={FIXED_COLOUR}
                fontSize="9"
                fontFamily="monospace"
              >
                {row.setting}
              </text>
            ))}

          <line
            x1={LEFT}
            y1={BOTTOM}
            x2={RIGHT}
            y2={BOTTOM}
            className="stroke-slate-300 dark:stroke-slate-600"
          />
          <text
            x={(LEFT + RIGHT) / 2}
            y={HEIGHT - 22}
            textAnchor="middle"
            className="fill-slate-500 dark:fill-slate-400"
            fontSize="10"
          >
            blocks the eighteen sentences came to, fewest on the left
          </text>
        </svg>
      </div>

      <div className="mt-1 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-4 rounded-sm"
            style={{ backgroundColor: FIXED_COLOUR }}
          />
          a fixed number of bytes, labelled with that number
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-4 rounded-sm"
            style={{ backgroundColor: ENTROPY_COLOUR }}
          />
          cut by uncertainty, labelled with the threshold in bits
        </span>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The orange line wanders between{" "}
        {(Math.min(...view.fixed.map((row) => row.share_inside_a_word)) * 100).toFixed(1)}
        % and{" "}
        {(Math.max(...view.fixed.map((row) => row.share_inside_a_word)) * 100).toFixed(1)}
        % with the dashed line running through it, because the rule that draws it
        has not read the text. At {atTheThreshold?.n_patches} blocks the blue
        line puts{" "}
        {atTheThreshold
          ? (atTheThreshold.share_inside_a_word * 100).toFixed(1)
          : "…"}
        % of its cuts inside a word, against{" "}
        {(nearest.share_inside_a_word * 100).toFixed(1)}% for the nearest orange
        point at {nearest.n_patches} blocks.
      </p>
    </div>
  );
}
