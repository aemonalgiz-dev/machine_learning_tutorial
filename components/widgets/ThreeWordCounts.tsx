"use client";

// Three words counted against two contexts, with every rule's answer.
//
// The table is small enough to check with a pencil, and the slider repeats one
// word's counts so a reader can watch which rules notice a longer vector and
// which do not. The plot draws the three positions in the plane the two
// contexts make; the API computes every number under the plot.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { HandView, fetchByHand } from "@/lib/concepts/distance-and-similarity";
import {
  PLAIN_RULE_NAMES,
  TOPIC_COLOUR,
  topicOf,
} from "./distanceAndSimilarityShared";

const PLOT = 300;
const PAD = 34;

export function ThreeWordCounts({
  showScale = true,
  scaledWord = "bake",
}: {
  showScale?: boolean;
  scaledWord?: string;
}) {
  const [times, setTimes] = useState(1);
  const [view, setView] = useState<HandView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchByHand({ times, scaledWord }));
        setMessage(null);
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, [times, scaledWord]);

  if (!view) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const largest = Math.max(
    ...view.rows.flat(),
    1,
  );
  const place = (value: number) => PAD + (value / largest) * (PLOT - 2 * PAD);
  const metrics = Object.keys(view.pairs[0].answers);

  return (
    <div>
      {showScale && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-slate-600 dark:text-slate-300">
            count <span className="font-mono">{scaledWord}</span>&rsquo;s
            company
            <input
              type="range"
              min={1}
              max={4}
              step={1}
              value={times}
              onChange={(event) => setTimes(Number(event.target.value))}
              className="ml-3 align-middle accent-indigo-600"
            />
          </label>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {times === 1 ? "as counted" : `${times} times over`}
          </span>
        </div>
      )}

      <div className="mt-3 grid gap-4 sm:grid-cols-[300px_1fr]">
        <svg
          viewBox={`0 0 ${PLOT} ${PLOT}`}
          className="w-full max-w-[300px] rounded border border-slate-200 dark:border-slate-800"
          role="img"
          aria-label="the three words placed by how often each stood beside the two chosen words"
        >
          <line
            x1={PAD}
            y1={PLOT - PAD}
            x2={PLOT - PAD / 2}
            y2={PLOT - PAD}
            className="stroke-slate-300 dark:stroke-slate-700"
          />
          <line
            x1={PAD}
            y1={PLOT - PAD}
            x2={PAD}
            y2={PAD / 2}
            className="stroke-slate-300 dark:stroke-slate-700"
          />
          <text
            x={PLOT - PAD}
            y={PLOT - 12}
            textAnchor="end"
            className="fill-slate-500 text-[10px]"
          >
            beside {view.contexts[0]}
          </text>
          <text
            x={10}
            y={PAD}
            className="fill-slate-500 text-[10px]"
          >
            beside {view.contexts[1]}
          </text>
          {view.rows.map((row, index) => (
            <g key={view.words[index]}>
              <line
                x1={PAD}
                y1={PLOT - PAD}
                x2={place(row[0])}
                y2={PLOT - place(row[1])}
                stroke={TOPIC_COLOUR[topicOf(view.words[index])]}
                strokeWidth={1.5}
                opacity={0.6}
              />
              <circle
                cx={place(row[0])}
                cy={PLOT - place(row[1])}
                r={4}
                fill={TOPIC_COLOUR[topicOf(view.words[index])]}
              />
              <text
                x={place(row[0]) + 7}
                y={PLOT - place(row[1]) - 5}
                className="fill-slate-600 text-[11px] dark:fill-slate-300"
              >
                {view.words[index]}
              </text>
            </g>
          ))}
        </svg>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">
                  pair
                </th>
                {metrics.map((metric) => (
                  <th
                    key={metric}
                    className="py-1 pr-3 text-right font-semibold text-slate-600 dark:text-slate-400"
                  >
                    {PLAIN_RULE_NAMES[metric] ?? metric}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {view.pairs.map((pair) => (
                <tr
                  key={`${pair.first}-${pair.second}`}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                >
                  <td className="py-1 pr-3 font-mono text-slate-700 dark:text-slate-300">
                    {pair.first} {pair.second}
                  </td>
                  {metrics.map((metric) => (
                    <td
                      key={metric}
                      className="py-1 pr-3 text-right font-mono text-slate-600 dark:text-slate-400"
                    >
                      {pair.answers[metric].toFixed(4)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Counts{" "}
            {view.rows
              .map((row, index) => `${view.words[index]} (${row.join(", ")})`)
              .join(", ")}
            , lengths {view.lengths.map((value) => value.toFixed(4)).join(", ")}.
          </p>
        </div>
      </div>
    </div>
  );
}
