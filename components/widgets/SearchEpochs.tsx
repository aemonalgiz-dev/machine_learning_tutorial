"use client";

// The greedy walk on eighteen sentences, pass by pass.
//
// The API runs the same fit under a rising bound on how many passes it may
// make, and reports where the walk stood after each: how many pieces it held,
// what the description cost, and which pieces it gained and lost since the
// pass before. The browser draws the falling cost and lists the churn, so it
// is visible that a pass both adds and removes rather than only adding.

import { useEffect, useState } from "react";
import { SearchView, fetchSearch, messageFor } from "@/lib/concepts/morfessor";
import { Pieces, Stat, nats } from "./morfessorParts";

const WIDTH = 640;
const HEIGHT = 220;
const PAD_LEFT = 58;
const PAD_RIGHT = 18;
const PAD_TOP = 16;
const PAD_BOTTOM = 40;

export function SearchEpochs() {
  const [search, setSearch] = useState<SearchView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSearch(await fetchSearch());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!search) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const rows = search.sentence_epochs;
  const highest = Math.max(...rows.map((row) => row.cost));
  const lowest = Math.min(...rows.map((row) => row.cost));
  const positionX = (index: number) =>
    PAD_LEFT + (index / (rows.length - 1)) * (WIDTH - PAD_LEFT - PAD_RIGHT);
  const positionY = (cost: number) =>
    PAD_TOP +
    ((highest - cost) / (highest - lowest)) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
  const shown = rows[hover ?? rows.length - 1];

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <path
          d={rows
            .map(
              (row, index) =>
                `${index === 0 ? "M" : "L"} ${positionX(index).toFixed(1)} ${positionY(row.cost).toFixed(1)}`,
            )
            .join(" ")}
          fill="none"
          stroke="#6366f1"
          strokeWidth={2}
        />
        {rows.map((row, index) => (
          <g key={row.epoch} onMouseEnter={() => setHover(index)}>
            <circle
              cx={positionX(index)}
              cy={positionY(row.cost)}
              r={hover === index ? 6 : 4}
              fill={row.converged ? "#10b981" : "#6366f1"}
            />
            <text
              x={positionX(index)}
              y={HEIGHT - PAD_BOTTOM + 16}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {row.epoch}
            </text>
            <rect
              x={positionX(index) - 14}
              y={PAD_TOP}
              width={28}
              height={HEIGHT - PAD_TOP - PAD_BOTTOM}
              fill="transparent"
            />
          </g>
        ))}
        <text
          x={PAD_LEFT - 8}
          y={positionY(highest) + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          {highest.toFixed(0)}
        </text>
        <text
          x={PAD_LEFT - 8}
          y={positionY(lowest) + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          {lowest.toFixed(0)}
        </text>
        <text
          x={(PAD_LEFT + WIDTH - PAD_RIGHT) / 2}
          y={HEIGHT - 8}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          passes over the corpus
        </text>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="pass" value={shown.epoch} />
        <Stat label="pieces held" value={shown.n_morphs} />
        <Stat label="total, in nats" value={nats(shown.cost)} />
        <Stat
          label="gained, lost"
          value={`${shown.gained.length}, ${shown.lost.length}`}
        />
      </div>

      {(shown.gained.length > 0 || shown.lost.length > 0) && (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          {shown.gained.length > 0 && (
            <div>
              <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                gained on this pass
              </p>
              <Pieces pieces={shown.gained.slice(0, 18)} tone="highlight" />
            </div>
          )}
          {shown.lost.length > 0 && (
            <div>
              <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                dropped on this pass
              </p>
              <Pieces pieces={shown.lost.slice(0, 18)} tone="muted" />
            </div>
          )}
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Eighteen sentences, with the text half of the cost weighted at{" "}
        {search.sentence_weight}. Hover a point to read the pass. The green
        point is where the walk stopped, because a pass changed the total by
        less than the amount that counts as no change.
      </p>
    </div>
  );
}
