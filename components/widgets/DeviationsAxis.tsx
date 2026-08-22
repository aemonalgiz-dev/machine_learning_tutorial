"use client";

// The orchard's two columns laid on one axis, once as recorded and once in
// deviations.
//
// The upper pair of lines carries the millimetres and the metres on rulers of
// their own, which is the only way they can be drawn together and is exactly
// why no reading of one can be compared with a reading of the other. The lower
// pair puts both columns on a single axis running from minus three to three,
// where a position means the same thing in both rows. Hover a dot to read the
// tree it belongs to. The counts underneath say how much of each column falls
// inside one, two and three deviations, which the API measures.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Limits, Orchard, fetchLimits, fetchOrchard } from "@/lib/concepts/the-standard-score";
import { GIRTH_COLOUR, HIGHLIGHT_COLOUR, WATER_COLOUR } from "./standardScoreFixtures";

const VIEW = { width: 640, height: 230 };
const PAD = { left: 96, right: 24 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right };

const ROWS = [
  { label: "girth, mm", y: 40 },
  { label: "water, m", y: 84 },
  { label: "girth, deviations", y: 150 },
  { label: "water, deviations", y: 194 },
];

const SCORE_MIN = -3;
const SCORE_MAX = 3;

export function DeviationsAxis() {
  const [orchard, setOrchard] = useState<Orchard | null>(null);
  const [limits, setLimits] = useState<Limits | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [next, bounds] = await Promise.all([fetchOrchard(), fetchLimits()]);
        setOrchard(next);
        setLimits(bounds);
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!orchard || !limits) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const spread = (value: number, smallest: number, largest: number) =>
    PAD.left + ((value - smallest) / (largest - smallest)) * PLOT.width;
  const onScore = (score: number) =>
    PAD.left +
    ((Math.min(SCORE_MAX, Math.max(SCORE_MIN, score)) - SCORE_MIN) /
      (SCORE_MAX - SCORE_MIN)) *
      PLOT.width;

  const lines = [
    {
      colour: GIRTH_COLOUR,
      positions: orchard.girth.values.map((value) =>
        spread(value, orchard.girth.smallest, orchard.girth.largest),
      ),
    },
    {
      colour: WATER_COLOUR,
      positions: orchard.water.values.map((value) =>
        spread(value, orchard.water.smallest, orchard.water.largest),
      ),
    },
    { colour: GIRTH_COLOUR, positions: orchard.girth.scores.map(onScore) },
    { colour: WATER_COLOUR, positions: orchard.water.scores.map(onScore) },
  ];

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <text x={PAD.left} y={18} className="fill-slate-500 text-[11px] dark:fill-slate-400">
          two rulers, one per column, and no position on one means anything on the other
        </text>
        <text x={PAD.left} y={126} className="fill-slate-500 text-[11px] dark:fill-slate-400">
          one ruler, in deviations, where a position means the same in both rows
        </text>
        {[-3, -2, -1, 0, 1, 2, 3].map((tick) => (
          <line
            key={tick}
            x1={onScore(tick)}
            y1={134}
            x2={onScore(tick)}
            y2={206}
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeDasharray={tick === 0 ? undefined : "3 3"}
          />
        ))}
        {[-3, -2, -1, 0, 1, 2, 3].map((tick) => (
          <text
            key={`label-${tick}`}
            x={onScore(tick)}
            y={220}
            textAnchor="middle"
            className="fill-slate-400 text-[10px] dark:fill-slate-500"
          >
            {tick}
          </text>
        ))}
        {ROWS.map((row, rowIndex) => (
          <g key={row.label}>
            <text
              x={PAD.left - 10}
              y={row.y + 4}
              textAnchor="end"
              className="fill-slate-600 text-[11px] dark:fill-slate-300"
            >
              {row.label}
            </text>
            <line
              x1={PAD.left}
              y1={row.y}
              x2={PAD.left + PLOT.width}
              y2={row.y}
              className="stroke-slate-300 dark:stroke-slate-700"
            />
            {lines[rowIndex].positions.map((position, tree) => (
              <circle
                key={tree}
                cx={position}
                cy={row.y}
                r={hovered === tree ? 6 : 4}
                fill={hovered === tree ? HIGHLIGHT_COLOUR : lines[rowIndex].colour}
                opacity={hovered === null || hovered === tree ? 0.9 : 0.3}
                onMouseEnter={() => setHovered(tree)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
          </g>
        ))}
      </svg>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {hovered === null
          ? "Hover a tree to follow it down through the four rows."
          : `That tree's trunk is ${orchard.girth.values[hovered]} mm, which is ${orchard.girth.scores[hovered].toFixed(2)} deviations from the average trunk, and it drank ${orchard.water.values[hovered]} m, which is ${orchard.water.scores[hovered].toFixed(2)} deviations from the average drink.`}
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">column</th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">within one</th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">within two</th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">within three</th>
            </tr>
          </thead>
          <tbody>
            {limits.shares.map((share) => (
              <tr
                key={share.column}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">
                  {share.column === "girth" ? "trunk girth" : "water"}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {share.within_one.toFixed(4)}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {share.within_two.toFixed(4)}
                </td>
                <td className="py-2 font-mono text-slate-800 dark:text-slate-200">
                  {share.within_three.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        A bell curve would put {limits.normal_within_one.toFixed(4)} of its
        weight inside one deviation, {limits.normal_within_two.toFixed(4)} inside
        two and {limits.normal_within_three.toFixed(4)} inside three. Neither
        column has to agree with that, and neither does; the only claim that
        holds for every column is that at least{" "}
        {limits.chebyshev_within_two.toFixed(2)} falls inside two.
      </p>
    </div>
  );
}
