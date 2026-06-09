"use client";

// What each width costs, measured against the table that was never built.
//
// The bars are how far the angle between two words of a subject moved away
// from the answer the whole table of counts gives, averaged over all 190 such
// pairs; the line is how many of the twenty-three drawn directions still share
// a position with another. The two fall together, which is the argument the
// section makes. The API fits at every width; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, Costs, fetchCosts } from "@/lib/concepts/random-indexing";
import {
  Legend,
  MEASURED,
  PREDICTED,
  SHARED,
  Stat,
  Waiting,
} from "./randomIndexingShared";

const WIDTH = 560;
const HEIGHT = 220;
const LEFT = 40;
const RIGHT = 40;
const TOP = 20;
const BOTTOM = 32;

export function WidthAgainstTheTable() {
  const [costs, setCosts] = useState<Costs | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchCosts();
        if (!cancelled) {
          setCosts(next);
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
  }, []);

  if (!costs) return <Waiting message={message} />;

  const rows = costs.widths;
  const step = (WIDTH - LEFT - RIGHT) / rows.length;
  const bottom = HEIGHT - BOTTOM;
  const tallest = Math.max(...rows.map((one) => one.gap_mean));
  const mostColliding = Math.max(...rows.map((one) => one.colliding_pairs));
  const up = (value: number) => bottom - (value / tallest) * (bottom - TOP);
  const upRight = (value: number) =>
    bottom - (value / mostColliding) * (bottom - TOP);
  const at = (position: number) => LEFT + step * (position + 0.5);

  const path = rows
    .map(
      (one, position) =>
        `${position === 0 ? "M" : "L"} ${at(position).toFixed(1)} ${upRight(one.colliding_pairs).toFixed(1)}`,
    )
    .join(" ");

  const narrow = rows[0];
  const first = rows.find((one) => one.shared_neighbours === costs.n_top);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="pairs of words compared"
          value="190"
        />
        <Stat
          label={`worst move, at ${narrow.dimension} numbers`}
          value={narrow.gap_mean.toFixed(4)}
        />
        <Stat
          label="width recovering the whole neighbour list"
          value={first ? String(first.dimension) : "not reached"}
        />
        <Stat
          label="cells the whole table would have held"
          value={String(costs.table_cells)}
        />
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-3 w-full rounded-lg bg-slate-50 dark:bg-slate-900/60"
        role="img"
        aria-label="How far each width's answer falls from the whole table's"
      >
        <line x1={LEFT} y1={bottom} x2={WIDTH - RIGHT} y2={bottom} stroke="#cbd5e1" />
        {rows.map((one, position) => (
          <g key={one.dimension}>
            <rect
              x={at(position) - step * 0.28}
              y={up(one.gap_mean)}
              width={step * 0.56}
              height={Math.max(0.8, bottom - up(one.gap_mean))}
              rx={2}
              fill={MEASURED}
              fillOpacity={0.7}
            />
            <text
              x={at(position)}
              y={HEIGHT - 18}
              fontSize={8}
              textAnchor="middle"
              fill={SHARED}
            >
              {one.dimension}
            </text>
            <text
              x={at(position)}
              y={HEIGHT - 6}
              fontSize={8}
              textAnchor="middle"
              fill={one.shared_neighbours === costs.n_top ? MEASURED : SHARED}
            >
              {one.shared_neighbours}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke={PREDICTED} strokeWidth={1.6} />
        {rows.map((one, position) => (
          <circle
            key={`collide-${one.dimension}`}
            cx={at(position)}
            cy={upRight(one.colliding_pairs)}
            r={2.4}
            fill={PREDICTED}
          />
        ))}
        <text x={LEFT} y={12} fontSize={9} fill={MEASURED}>
          bars are how far the angles moved
        </text>
        <text x={WIDTH - RIGHT} y={12} fontSize={9} textAnchor="end" fill={PREDICTED}>
          line is pairs of directions still sharing a position
        </text>
        <text x={4} y={TOP + 4} fontSize={8} fill={SHARED}>
          {tallest.toFixed(2)}
        </text>
        <text x={WIDTH - 4} y={TOP + 4} fontSize={8} textAnchor="end" fill={SHARED}>
          {mostColliding}
        </text>
      </svg>

      <Legend>
        The bottom row of numbers is how many of {costs.reference_word}&rsquo;s{" "}
        {costs.n_top} nearest words the fit agrees with the whole table about.
        Even at {rows[rows.length - 1].dimension} numbers a word, wider than the
        whole table is on a side, the angles are still{" "}
        {rows[rows.length - 1].gap_mean.toFixed(4)} away from the table&rsquo;s
        own, because {rows[rows.length - 1].colliding_pairs} pairs of directions
        still share a position.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
