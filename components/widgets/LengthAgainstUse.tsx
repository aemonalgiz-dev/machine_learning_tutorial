"use client";

// A word's use count against the length of its vector, under two fits.
//
// Two panels on one corpus. The left is the counting fit the rest of this
// topic works on, the right the fit that learns by predicting neighbours, and
// the trend runs the opposite way in the two, which is the point of showing
// them together. The API fits both and measures both correlations; the browser
// places dots.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  LengthsView,
  fetchLengths,
} from "@/lib/concepts/distance-and-similarity";
import { TOPIC_COLOUR, topicOf } from "./distanceAndSimilarityShared";

const WIDTH = 300;
const HEIGHT = 210;
const PAD = 38;

export function LengthAgainstUse() {
  const [view, setView] = useState<LengthsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchLengths());
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

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Panel
        heading="counted, then squeezed"
        note={`${view.counting_dimension} numbers a word`}
        correlation={view.counting_correlation}
        points={view.rows.map((row) => ({
          word: row.word,
          x: row.use_count,
          y: row.counting_length,
        }))}
      />
      <Panel
        heading="learned by predicting neighbours"
        note={`${view.predicting_dimension} numbers a word`}
        correlation={view.predicting_correlation}
        points={view.rows.map((row) => ({
          word: row.word,
          x: row.use_count,
          y: row.predicting_length,
        }))}
      />
    </div>
  );
}

function Panel({
  heading,
  note,
  correlation,
  points,
}: {
  heading: string;
  note: string;
  correlation: number;
  points: { word: string; x: number; y: number }[];
}) {
  const lowestUse = Math.min(...points.map((point) => point.x));
  const highestUse = Math.max(...points.map((point) => point.x));
  const highestLength = Math.max(...points.map((point) => point.y));
  const placeX = (value: number) =>
    PAD +
    ((value - lowestUse) / Math.max(highestUse - lowestUse, 1)) *
      (WIDTH - PAD - 14);
  const placeY = (value: number) =>
    HEIGHT - PAD - (value / (highestLength * 1.1)) * (HEIGHT - PAD - 16);

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        {heading}
      </p>
      <p className="text-[0.65rem] text-slate-400 dark:text-slate-500">
        {note}
      </p>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-1 w-full"
        role="img"
        aria-label={`${heading}: how often each word was used against how long its position came out`}
      >
        <line
          x1={PAD}
          y1={HEIGHT - PAD}
          x2={WIDTH - 10}
          y2={HEIGHT - PAD}
          className="stroke-slate-300 dark:stroke-slate-700"
        />
        <line
          x1={PAD}
          y1={HEIGHT - PAD}
          x2={PAD}
          y2={12}
          className="stroke-slate-300 dark:stroke-slate-700"
        />
        <text
          x={WIDTH - 10}
          y={HEIGHT - 14}
          textAnchor="end"
          className="fill-slate-500 text-[10px]"
        >
          times used
        </text>
        <text x={4} y={16} className="fill-slate-500 text-[10px]">
          length
        </text>
        <text
          x={PAD - 4}
          y={HEIGHT - PAD + 4}
          textAnchor="end"
          className="fill-slate-400 text-[9px]"
        >
          0
        </text>
        <text
          x={PAD - 4}
          y={placeY(highestLength) + 4}
          textAnchor="end"
          className="fill-slate-400 text-[9px]"
        >
          {highestLength.toFixed(2)}
        </text>
        {points.map((point) => (
          <circle
            key={point.word}
            cx={placeX(point.x)}
            cy={placeY(point.y)}
            r={3.5}
            fill={TOPIC_COLOUR[topicOf(point.word)]}
            opacity={0.85}
          >
            <title>
              {point.word}, used {point.x} times, length {point.y.toFixed(4)}
            </title>
          </circle>
        ))}
      </svg>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        correlation {correlation.toFixed(4)}
      </p>
    </div>
  );
}
