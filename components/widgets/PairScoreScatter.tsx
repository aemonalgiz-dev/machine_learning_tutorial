"use client";

// Every candidate pair on the eighteen sentences, counted across and scored up.
//
// If the two figures agreed, the points would lie on a rising line and the
// choice of rule would not matter. They do not. The horizontal axis is how
// often the pair occurs, the vertical axis is the ratio on a logarithmic scale
// because the ratios span two decades, and the two labelled points are the pair
// each rule takes first. Hovering a point names it. The API counts and scores
// the pairs; the browser places them.

import { useEffect, useState } from "react";
import { PairScore, ScoringView, fetchScoring, messageFor } from "@/lib/concepts/wordpiece";
import { Stat, formatScore } from "./wordPieceParts";

const WIDTH = 640;
const HEIGHT = 320;
const LEFT = 58;
const RIGHT = 16;
const TOP = 14;
const BOTTOM = 40;

export function PairScoreScatter() {
  const [scoring, setScoring] = useState<ScoringView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [hovered, setHovered] = useState<PairScore | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setScoring(await fetchScoring());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!scoring) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const pairs = scoring.sentence_pairs;
  const counts = pairs.map((pair) => pair.count);
  const logs = pairs.map((pair) => Math.log10(pair.score));
  const maxCount = Math.max(...counts);
  const lowest = Math.min(...logs);
  const highest = Math.max(...logs);

  const placeX = (count: number) =>
    LEFT + ((count - 1) / (maxCount - 1)) * (WIDTH - LEFT - RIGHT);
  const placeY = (score: number) =>
    HEIGHT -
    BOTTOM -
    ((Math.log10(score) - lowest) / (highest - lowest)) * (HEIGHT - TOP - BOTTOM);

  const commonest = scoring.sentence_largest_count;
  const best = scoring.sentence_best_score;
  const shown = hovered ?? best;

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Every candidate pair, how often it occurs against the ratio it scores"
      >
        <line
          x1={LEFT}
          y1={HEIGHT - BOTTOM}
          x2={WIDTH - RIGHT}
          y2={HEIGHT - BOTTOM}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
        />
        <line
          x1={LEFT}
          y1={TOP}
          x2={LEFT}
          y2={HEIGHT - BOTTOM}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
        />
        {[1, 8, 16, 24, 32].map((tick) => (
          <text
            key={tick}
            x={placeX(tick)}
            y={HEIGHT - BOTTOM + 16}
            textAnchor="middle"
            className="fill-slate-500 text-[11px] dark:fill-slate-400"
          >
            {tick}
          </text>
        ))}
        {[0.001, 0.01, 0.1].map((tick) => (
          <text
            key={tick}
            x={LEFT - 8}
            y={placeY(tick) + 4}
            textAnchor="end"
            className="fill-slate-500 text-[11px] dark:fill-slate-400"
          >
            {tick}
          </text>
        ))}
        <text
          x={(LEFT + WIDTH - RIGHT) / 2}
          y={HEIGHT - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          how often the pair occurs
        </text>
        <text
          x={14}
          y={(TOP + HEIGHT - BOTTOM) / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${(TOP + HEIGHT - BOTTOM) / 2})`}
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          the ratio
        </text>

        {pairs.map((pair) => {
          const marked =
            pair === hovered ||
            (pair.left === commonest.left && pair.right === commonest.right) ||
            (pair.left === best.left && pair.right === best.right);
          return (
            <circle
              key={`${pair.left}+${pair.right}`}
              cx={placeX(pair.count)}
              cy={placeY(pair.score)}
              r={marked ? 6 : 3.5}
              className={
                marked
                  ? "fill-indigo-500 dark:fill-indigo-400"
                  : "fill-slate-400/70 dark:fill-slate-500/70"
              }
              onMouseEnter={() => setHovered(pair)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}

        <text
          x={placeX(commonest.count) - 10}
          y={placeY(commonest.score) + 4}
          textAnchor="end"
          className="fill-slate-700 text-[11px] dark:fill-slate-300"
        >
          {commonest.left} {commonest.right}
        </text>
        <text
          x={placeX(best.count) + 12}
          y={placeY(best.score) + 4}
          className="fill-slate-700 text-[11px] dark:fill-slate-300"
        >
          {best.left} {best.right}
        </text>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="candidate pairs" value={scoring.sentence_n_candidates} />
        <Stat label="pair" value={`${shown.left} ${shown.right}`} />
        <Stat
          label="together, and each half"
          value={`${shown.count} of ${shown.left_count} and ${shown.right_count}`}
        />
        <Stat label="the ratio" value={formatScore(shown.score)} />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The commonest pair, {commonest.left} {commonest.right} at{" "}
        {commonest.count}, sits near the bottom right, and the pair the ratio
        takes, {best.left} {best.right} at {best.count}, sits at the top left. Of
        the {scoring.sentence_n_candidates} candidates the commonest is{" "}
        {scoring.sentence_largest_count_rank}th by the ratio. Hover any point to
        read it.
      </p>
    </div>
  );
}
