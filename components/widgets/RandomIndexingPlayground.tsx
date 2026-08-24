"use client";

// One fit of the twenty-four documents, with everything a reader can change.
//
// Pick a width, how many non-zero entries a drawn direction carries, which
// draw, and how far a neighbour counts from; the readouts say how far apart the
// two halves came and how far the answer moved from the one the whole table of
// counts gives. The bars are the chosen word against every other word, drawn at
// the position the fit put it and marked where the whole table put it. The API
// fits and measures; the browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  Neighbour,
  RandomIndexingFit,
  WIDTHS,
  WeightingName,
  fetchFit,
} from "@/lib/concepts/random-indexing";
import {
  Choice,
  Legend,
  SHARED,
  Stat,
  Waiting,
  colourFor,
} from "./randomIndexingShared";

const WIDTH = 560;
const ROW = 15;
const LABEL = 66;
const RIGHT = 18;

const WORDS = ["flour", "sugar", "bake", "anchor", "sail", "the"];
const SEEDS = [0, 1, 2, 3, 4];
const NONZEROS = [2, 4, 8, 16];

export function RandomIndexingPlayground() {
  const [dimension, setDimension] = useState(16);
  const [nNonzero, setNonzero] = useState(4);
  const [randomSeed, setSeed] = useState(0);
  const [weighting, setWeighting] = useState<WeightingName>("uniform");
  const [word, setWord] = useState("flour");
  const [fit, setFit] = useState<RandomIndexingFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchFit({
          dimension,
          nNonzero: Math.min(nNonzero, dimension),
          randomSeed,
          weighting,
          word,
        });
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
  }, [dimension, nNonzero, randomSeed, weighting, word]);

  if (!fit) return <Waiting message={message} />;

  const rows: Neighbour[] = [...fit.against_every_word].sort(
    (one, other) => other.similarity - one.similarity,
  );
  const height = rows.length * ROW + 30;
  const span = WIDTH - LABEL - RIGHT;
  const middle = LABEL + span / 2;
  const place = (value: number) => middle + (value / 1.05) * (span / 2);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          <span className="text-xs">how many numbers a position has</span>
          <Choice
            options={WIDTHS.filter((one) => one <= 256).map((one) => ({
              label: String(one),
              value: one,
            }))}
            value={dimension}
            onChange={setDimension}
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs">non-zero entries</span>
          <Choice
            options={NONZEROS.map((one) => ({
              label: String(one),
              value: one,
            }))}
            value={nNonzero}
            onChange={setNonzero}
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs">which draw</span>
          <Choice
            options={SEEDS.map((one) => ({ label: String(one), value: one }))}
            value={randomSeed}
            onChange={setSeed}
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs">a neighbour further away</span>
          <Choice
            options={[
              { label: "counts the same", value: "uniform" as WeightingName },
              { label: "counts less", value: "harmonic" as WeightingName },
            ]}
            value={weighting}
            onChange={setWeighting}
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs">word</span>
          <Choice
            options={WORDS.map((one) => ({ label: one, value: one }))}
            value={word}
            onChange={setWord}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="two words of one subject"
          value={fit.within_similarity.toFixed(4)}
        />
        <Stat
          label="a word of each subject"
          value={fit.across_similarity.toFixed(4)}
        />
        <Stat
          label="moved from the whole table by"
          value={fit.table_gap_mean.toFixed(4)}
        />
        <Stat
          label="pairs of directions at a right angle"
          value={`${(fit.direction_exactly_perpendicular * 100).toFixed(1)}%`}
        />
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="mt-3 w-full rounded-lg bg-slate-50 dark:bg-slate-900/60"
        role="img"
        aria-label={`How close every word is to ${word}`}
      >
        <line
          x1={middle}
          y1={16}
          x2={middle}
          y2={height - 14}
          stroke="#cbd5e1"
          strokeWidth={1}
        />
        {rows.map((row, position) => {
          const y = 22 + position * ROW;
          const from = Math.min(place(row.similarity), middle);
          const to = Math.max(place(row.similarity), middle);
          return (
            <g key={row.word}>
              <text
                x={LABEL - 6}
                y={y + 7}
                fontSize={9}
                textAnchor="end"
                fill={colourFor(row.group)}
              >
                {row.word}
              </text>
              <rect
                x={from}
                y={y}
                width={Math.max(1, to - from)}
                height={ROW - 5}
                rx={1.5}
                fill={colourFor(row.group)}
                fillOpacity={0.7}
              />
              <line
                x1={place(row.table_similarity)}
                y1={y - 1}
                x2={place(row.table_similarity)}
                y2={y + ROW - 4}
                stroke="#0f172a"
                strokeWidth={1.2}
              />
            </g>
          );
        })}
        <text x={LABEL} y={12} fontSize={9} fill={SHARED}>
          bars are this fit, the upright marks are the whole table of counts
        </text>
        <text x={middle + 3} y={height - 3} fontSize={8} fill={SHARED}>
          nothing in common
        </text>
        <text x={WIDTH - RIGHT} y={height - 3} fontSize={8} textAnchor="end" fill={SHARED}>
          the same company
        </text>
      </svg>

      <Legend>
        The words of one subject gather on the right and the words of the other
        fall to the left, and the fit was never told there were two subjects. Cut
        the width to 4 and the ordering falls apart; take it up to 256 and the
        bars settle onto the marks, which is the answer that building the whole
        table would have given.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
