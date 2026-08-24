"use client";

// What the reach does to the counts, and what that does to the answer.
//
// Down the left, the share of the counts that came out below one, whose
// logarithms are therefore negative. Down the right, how much further apart the
// two halves of the corpus ended up than words from the same half, once at each
// of three starts. The two columns are the same sweep read twice, and the reach
// that puts fewest counts below one is the only one where all three starts
// separate the halves. The API counts and fits; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, WindowSweep, fetchWindowSweep } from "@/lib/concepts/glove";
import { ASTRONOMY, FALLING, HELD, Legend, Waiting } from "./gloveShared";

const PANEL = { width: 640, height: 240 };
const PAD = { left: 40, right: 40, top: 24, bottom: 44 };

export function GloveWindowSweep() {
  const [sweep, setSweep] = useState<WindowSweep | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSweep(await fetchWindowSweep());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!sweep) return <Waiting message={message} />;

  const innerWidth = PANEL.width - PAD.left - PAD.right;
  const innerHeight = PANEL.height - PAD.top - PAD.bottom;
  const columnWidth = innerWidth / sweep.rows.length;
  const largestGap = Math.max(
    ...sweep.rows.flatMap((row) => row.gaps_by_seed.map(Math.abs)),
    0.05,
  );
  const shareY = (share: number) => PAD.top + share * innerHeight;
  const gapY = (gap: number) =>
    PAD.top + innerHeight / 2 - (gap / largestGap) * (innerHeight / 2);

  return (
    <div>
      <svg
        viewBox={`0 0 ${PANEL.width} ${PANEL.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={PAD.left}
          y1={gapY(0)}
          x2={PANEL.width - PAD.right}
          y2={gapY(0)}
          stroke="#cbd5e1"
          strokeWidth={1}
        />
        {sweep.rows.map((row, index) => {
          const centre = PAD.left + (index + 0.5) * columnWidth;
          return (
            <g key={row.window}>
              <rect
                x={centre - columnWidth * 0.36}
                y={PAD.top}
                width={columnWidth * 0.24}
                height={shareY(row.below_one_share) - PAD.top}
                fill={ASTRONOMY}
                opacity={0.35}
              />
              <text
                x={centre - columnWidth * 0.24}
                y={shareY(row.below_one_share) + 12}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] dark:fill-slate-400"
              >
                {(row.below_one_share * 100).toFixed(0)}%
              </text>
              {row.gaps_by_seed.map((gap, seedIndex) => (
                <circle
                  key={seedIndex}
                  cx={centre + columnWidth * (0.08 + seedIndex * 0.12)}
                  cy={gapY(gap)}
                  r={5}
                  fill={gap > 0 ? FALLING : HELD}
                  opacity={0.85}
                />
              ))}
              <text
                x={centre}
                y={PANEL.height - PAD.bottom + 16}
                textAnchor="middle"
                className="fill-slate-600 text-[11px] dark:fill-slate-300"
              >
                reach {row.window}
              </text>
              <text
                x={centre}
                y={PANEL.height - PAD.bottom + 30}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] dark:fill-slate-400"
              >
                {row.n_pairs} pairs, mean logarithm{" "}
                {row.mean_logarithm >= 0 ? "+" : "−"}
                {Math.abs(row.mean_logarithm).toFixed(2)}
              </text>
            </g>
          );
        })}
        <text
          x={PAD.left - 6}
          y={PAD.top + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          100%
        </text>
        <text
          x={PANEL.width - PAD.right + 6}
          y={gapY(0) + 4}
          textAnchor="start"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          0.00
        </text>
        <text
          x={PANEL.width - PAD.right + 6}
          y={gapY(largestGap) + 4}
          textAnchor="start"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          {largestGap.toFixed(2)}
        </text>
      </svg>

      <Legend>
        The pale bar in each column is the share of that reach&rsquo;s counts that
        came out below one, so their logarithms are negative; the dots beside it
        are how much more alike two words of one half are than two words from
        different halves, once for each of the {sweep.seeds.length} starts, green
        above the line and red below it. A red dot is a fit that placed words
        from different halves nearer to each other than words from the same half.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
