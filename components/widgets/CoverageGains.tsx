"use client";

// Every choice made on the eighteen sentences, in the order it was made.
//
// The API reports what each chosen piece newly covered. The browser draws one
// bar per choice, so the falling shape is visible at a glance, and hovering a
// bar names the piece it stands for. Nothing here is smoothed; the steps in the
// profile are ties in the objective, where several pieces were worth the same.

import { useEffect, useState } from "react";
import {
  LimitsView,
  fetchLimits,
  messageFor,
} from "@/lib/concepts/greedy-coverage";
import { COVERAGE_COLOUR, END_OF_WORD, Stat } from "./greedyCoverageParts";

const WIDTH = 640;
const HEIGHT = 240;
const PAD_LEFT = 42;
const PAD_RIGHT = 12;
const PAD_TOP = 14;
const PAD_BOTTOM = 34;

export function CoverageGains() {
  const [view, setView] = useState<LimitsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchLimits());
      } catch (error) {
        setMessage(messageFor(error));
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

  const gains = view.gains;
  const highest = Math.max(...gains.map((row) => row.coverage));
  const band = (WIDTH - PAD_LEFT - PAD_RIGHT) / gains.length;
  const barHeight = (value: number) =>
    (value / highest) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
  const shown = gains[hover ?? 0];
  const plain = shown.piece.endsWith(END_OF_WORD)
    ? shown.piece.slice(0, -END_OF_WORD.length)
    : shown.piece;

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={PAD_LEFT}
          y1={HEIGHT - PAD_BOTTOM}
          x2={WIDTH - PAD_RIGHT}
          y2={HEIGHT - PAD_BOTTOM}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
        />
        {gains.map((row, index) => (
          <rect
            key={row.rank}
            x={PAD_LEFT + index * band}
            y={HEIGHT - PAD_BOTTOM - barHeight(row.coverage)}
            width={Math.max(1, band - 1.2)}
            height={barHeight(row.coverage)}
            fill={COVERAGE_COLOUR}
            opacity={hover === null || hover === index ? 0.95 : 0.45}
            onMouseEnter={() => setHover(index)}
          />
        ))}
        <text
          x={PAD_LEFT - 8}
          y={HEIGHT - PAD_BOTTOM - barHeight(highest) + 10}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          {highest}
        </text>
        <text
          x={PAD_LEFT - 8}
          y={HEIGHT - PAD_BOTTOM}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          0
        </text>
        <text
          x={WIDTH / 2}
          y={HEIGHT - 8}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          the pieces in the order they were chosen
        </text>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="chosen" value={`number ${shown.rank + 1}`} />
        <Stat label="the piece" value={plain} />
        <Stat label="positions it covered" value={shown.coverage} />
        <Stat
          label="covered in all"
          value={`${view.covered_positions} of ${view.total_positions}`}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Hover a bar to read it. The heights can only fall, since every piece
        chosen takes positions away from every candidate that is left, and the
        run stops at {gains.length} pieces because no candidate covers anything
        after that.
      </p>
    </div>
  );
}
