"use client";

// One word the sentence does not contain, added to the list, and the sentence
// cut differently because of it.
//
// The API scores the same six characters against the same six words, over and
// over, changing nothing except how many times one extra word was counted. That
// extra word shares no character with the sentence, so none of the sentence's own
// candidates changes; what changes is the total every count is divided by, and
// dividing by a larger total costs a reading with four words more than it costs a
// reading with three. The browser draws the two readings' scores against that
// total and marks where they cross.

import { useEffect, useState } from "react";
import {
  GrowthView,
  fetchGrowth,
  messageFor,
} from "@/lib/concepts/the-word-lattice";
import { Loading, Stat } from "./wordLatticeParts";

const WIDTH = 660;
const HEIGHT = 240;
const PAD_LEFT = 56;
const PAD_RIGHT = 16;
const PAD_TOP = 18;
const PAD_BOTTOM = 42;

export function GrowingWordList() {
  const [growth, setGrowth] = useState<GrowthView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setGrowth(await fetchGrowth());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!growth) {
    return <Loading message={message} />;
  }

  const totals = growth.steps.map((step) => step.total_frequency);
  const scores = growth.steps.flatMap((step) => [
    step.whole_score,
    step.split_score,
  ]);
  const lowestTotal = Math.min(...totals);
  const highestTotal = Math.max(...totals);
  const lowestScore = Math.min(...scores);
  const highestScore = Math.max(...scores);

  const x = (total: number) =>
    PAD_LEFT +
    ((total - lowestTotal) / (highestTotal - lowestTotal)) *
      (WIDTH - PAD_LEFT - PAD_RIGHT);
  const y = (score: number) =>
    HEIGHT -
    PAD_BOTTOM -
    ((score - lowestScore) / (highestScore - lowestScore)) *
      (HEIGHT - PAD_TOP - PAD_BOTTOM);

  const first = growth.steps[0];
  const crossing = growth.steps.find((step) => step.whole_wins);

  const lines = [
    {
      name: "read as one word",
      colour: "#10b981",
      values: growth.steps.map((step) => step.whole_score),
    },
    {
      name: "read as its two characters",
      colour: "#f59e0b",
      values: growth.steps.map((step) => step.split_score),
    },
  ];

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-1 break-all font-mono text-base text-slate-900 dark:text-slate-100">
        {growth.text}
      </p>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        Six words counted {growth.base_total} times between them, and then the
        word {growth.added_word} counted a few times more. It occurs nowhere in
        the six characters above.
      </p>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full select-none rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400"
          style={{ minWidth: "440px" }}
        >
          <line
            x1={x(growth.exact_threshold)}
            y1={PAD_TOP}
            x2={x(growth.exact_threshold)}
            y2={HEIGHT - PAD_BOTTOM}
            stroke="currentColor"
            strokeDasharray="4 3"
            strokeWidth={1}
            opacity={0.6}
          />
          <text
            x={x(growth.exact_threshold) + 6}
            y={PAD_TOP + 10}
            fontSize={10}
            fill="currentColor"
          >
            the two are level at {growth.exact_threshold.toFixed(2)}
          </text>
          {growth.steps.map((step) => (
            <text
              key={`tick-${step.total_frequency}`}
              x={x(step.total_frequency)}
              y={HEIGHT - PAD_BOTTOM + 16}
              textAnchor="middle"
              fontSize={10}
              fill="currentColor"
            >
              {step.total_frequency}
            </text>
          ))}
          <text
            x={(WIDTH + PAD_LEFT) / 2}
            y={HEIGHT - 8}
            textAnchor="middle"
            fontSize={10}
            fill="currentColor"
          >
            how many times the whole list has been counted
          </text>
          {lines.map((line) => (
            <g key={line.name}>
              <polyline
                points={growth.steps
                  .map(
                    (step, position) =>
                      `${x(step.total_frequency)},${y(line.values[position])}`,
                  )
                  .join(" ")}
                fill="none"
                stroke={line.colour}
                strokeWidth={2}
              />
              {growth.steps.map((step, position) => (
                <circle
                  key={`${line.name}-${step.total_frequency}`}
                  cx={x(step.total_frequency)}
                  cy={y(line.values[position])}
                  r={3}
                  fill={line.colour}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-4">
        {lines.map((line) => (
          <span
            key={line.name}
            className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
          >
            <span
              className="inline-block h-2 w-4 rounded"
              style={{ backgroundColor: line.colour }}
            />
            {line.name}
          </span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="counted at first" value={`${growth.base_total}`} />
        <Stat
          label="level at"
          value={growth.exact_threshold.toFixed(4)}
        />
        <Stat label="cut moves at" value={`${growth.crossing_total}`} />
        <Stat
          label="one word added, counted"
          value={crossing ? `${crossing.added_frequency}` : "none"}
        />
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1 pr-4 font-medium text-slate-500 dark:text-slate-400">
                counted in all
              </th>
              <th className="py-1 pr-4 font-medium text-slate-500 dark:text-slate-400">
                as one word
              </th>
              <th className="py-1 pr-4 font-medium text-slate-500 dark:text-slate-400">
                as two characters
              </th>
              <th className="py-1 font-medium text-slate-500 dark:text-slate-400">
                what comes back
              </th>
            </tr>
          </thead>
          <tbody>
            {growth.steps.map((step) => (
              <tr
                key={step.total_frequency}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {step.total_frequency}
                </td>
                <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {step.whole_score.toFixed(4)}
                </td>
                <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {step.split_score.toFixed(4)}
                </td>
                <td className="py-1 font-mono text-slate-800 dark:text-slate-200">
                  {step.best.join(" | ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
        At {first.total_frequency} the two characters win and at{" "}
        {growth.crossing_total} the compound does, and nothing about the sentence
        changed in between.
      </p>

      <div className="mt-3 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800/60">
        <p className="mb-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          The control. The same six words counted over again, so every count
          rises together and none of them is new.
        </p>
        <div className="flex flex-wrap gap-3">
          {growth.scalings.map((step) => (
            <span
              key={step.factor}
              className="font-mono text-xs text-slate-700 dark:text-slate-300"
            >
              {step.total_frequency} → {step.best_score.toFixed(4)}
            </span>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
          The total runs from {growth.scalings[0].total_frequency} to{" "}
          {growth.scalings[growth.scalings.length - 1].total_frequency} and the
          score does not move at all, so what turned the answer over above was
          the count of a word this text does not use.
        </p>
      </div>
    </div>
  );
}
