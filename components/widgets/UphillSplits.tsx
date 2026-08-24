"use client";

// Every first move available to the search, at two repeat counts.
//
// The API takes the twelve inflected forms with every word left whole and
// prices each of the fifty-four ways of cutting exactly one word in two,
// reporting how much that cut changes the total description length. The
// browser draws the two sets on one axis with zero marked, so a reader can see
// the whole field of moves slide from partly below the line to entirely above
// it when the same words are repeated more often.

import { useEffect, useState } from "react";
import { SplitRow, StallView, fetchStall, messageFor } from "@/lib/concepts/morfessor";
import { Stat, nats } from "./morfessorParts";

const WIDTH = 640;
const HEIGHT = 200;
const PAD_LEFT = 96;
const PAD_RIGHT = 24;
const ROW_TOP = 46;
const ROW_GAP = 66;

export function UphillSplits() {
  const [stall, setStall] = useState<StallView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [hover, setHover] = useState<SplitRow | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setStall(await fetchStall());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!stall) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const sets = stall.split_sets;
  const everyDelta = sets.flatMap((set) => set.rows.map((row) => row.delta));
  const lowest = Math.min(...everyDelta);
  const highest = Math.max(...everyDelta);
  const positionX = (delta: number) =>
    PAD_LEFT +
    ((delta - lowest) / (highest - lowest)) * (WIDTH - PAD_LEFT - PAD_RIGHT);
  const zero = positionX(0);
  const shown = hover ?? sets[1].rows[0];

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={zero}
          y1={20}
          x2={zero}
          y2={HEIGHT - 34}
          className="stroke-slate-400 dark:stroke-slate-600"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <text
          x={zero}
          y={16}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          no change
        </text>

        {sets.map((set, index) => {
          const top = ROW_TOP + index * ROW_GAP;
          return (
            <g key={set.repeats}>
              <text
                x={PAD_LEFT - 10}
                y={top + 4}
                textAnchor="end"
                className="fill-slate-600 text-[11px] dark:fill-slate-300"
              >
                {set.repeats} times each
              </text>
              <line
                x1={PAD_LEFT}
                y1={top}
                x2={WIDTH - PAD_RIGHT}
                y2={top}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth={1}
              />
              {set.rows.map((row) => (
                <circle
                  key={`${row.word}-${row.left}`}
                  cx={positionX(row.delta)}
                  cy={top}
                  r={row === shown ? 6 : 4}
                  fill={row.delta < 0 ? "#10b981" : "#f97316"}
                  fillOpacity={0.65}
                  onMouseEnter={() => setHover(row)}
                />
              ))}
              <text
                x={PAD_LEFT}
                y={top + 20}
                className="fill-slate-500 text-[10px] dark:fill-slate-400"
              >
                {set.n_downhill} of {set.n_splits} shorten the description
              </text>
            </g>
          );
        })}

        <text
          x={(PAD_LEFT + WIDTH - PAD_RIGHT) / 2}
          y={HEIGHT - 10}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          change in the total description length, in nats
        </text>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="the word" value={shown.word} />
        <Stat label="cut into" value={`${shown.left} + ${shown.right}`} />
        <Stat label="change, in nats" value={nats(shown.delta)} />
        <Stat label="moves available" value={sets[0].n_splits} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Green shortens the description and orange lengthens it. Hover a point to
        read which cut it is. The cheapest move is the same one at both repeat
        counts, played into play and ed, and it goes from{" "}
        {nats(sets[0].rows[0].delta)} nats to {nats(sets[1].rows[0].delta)}.
      </p>
    </div>
  );
}
