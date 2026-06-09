"use client";

// How many readings there are, and how much work finding the best one takes, as
// one text gets longer.
//
// The API walks the prefixes of a single run of English words, counts the cuts
// the characters admit, counts how many of those the word list permits, and
// reports how many candidates the search steps along. The browser draws all
// three against the length of the text on a shared logarithmic axis, because two
// of them double with every few characters and the third does not. The gap
// between the top line and the bottom one is the whole reason the best path is
// affordable.

import { useEffect, useState } from "react";
import {
  ScaleView,
  fetchScale,
  grouped,
  messageFor,
} from "@/lib/concepts/the-word-lattice";
import { Loading } from "./wordLatticeParts";

const WIDTH = 660;
const HEIGHT = 260;
const PAD_LEFT = 48;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 40;

// The counts arrive as digits because they outgrow a double; this reads the
// order of magnitude off the digits rather than through a number.
function orderOfMagnitude(digits: string): number {
  const head = Number(digits.slice(0, 15));
  return digits.length - Math.min(15, digits.length) + Math.log10(head);
}

export function ReadingsAgainstSteps() {
  const [scale, setScale] = useState<ScaleView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setScale(await fetchScale());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!scale) {
    return <Loading message={message} />;
  }

  const steps = scale.steps;
  const lengths = steps.map((step) => step.n_characters);
  const lowest = Math.min(...lengths);
  const highest = Math.max(...lengths);
  const tallest = Math.max(
    ...steps.map((step) => orderOfMagnitude(step.n_cuts)),
    1,
  );

  const x = (characters: number) =>
    PAD_LEFT +
    ((characters - lowest) / (highest - lowest)) *
      (WIDTH - PAD_LEFT - PAD_RIGHT);
  const y = (magnitude: number) =>
    HEIGHT - PAD_BOTTOM - (magnitude / tallest) * (HEIGHT - PAD_TOP - PAD_BOTTOM);

  const series = [
    {
      name: "ways to cut the characters",
      colour: "#f43f5e",
      values: steps.map((step) => orderOfMagnitude(step.n_cuts)),
    },
    {
      name: "readings the list permits",
      colour: "#0ea5e9",
      values: steps.map((step) => orderOfMagnitude(step.n_readings)),
    },
    {
      name: "candidates the search steps along",
      colour: "#10b981",
      values: steps.map((step) => Math.log10(step.n_edges)),
    },
  ];

  const last = steps[steps.length - 1];

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-2 break-all font-mono text-sm text-slate-900 dark:text-slate-100">
        {scale.text}
      </p>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        Seven English words run together, matched against{" "}
        {scale.word_list_label}, measured over its first four characters, its
        first eight, and so on.
      </p>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full select-none rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400"
          style={{ minWidth: "440px" }}
        >
          {Array.from({ length: Math.floor(tallest) + 1 }).map((_, decade) => (
            <g key={`decade-${decade}`}>
              <line
                x1={PAD_LEFT}
                y1={y(decade)}
                x2={WIDTH - PAD_RIGHT}
                y2={y(decade)}
                stroke="currentColor"
                strokeWidth={0.5}
                opacity={0.2}
              />
              <text
                x={PAD_LEFT - 8}
                y={y(decade) + 3}
                textAnchor="end"
                fontSize={9}
                fill="currentColor"
              >
                {decade === 0 ? "1" : `10^${decade}`}
              </text>
            </g>
          ))}
          {steps.map((step) => (
            <text
              key={`tick-${step.n_characters}`}
              x={x(step.n_characters)}
              y={HEIGHT - PAD_BOTTOM + 16}
              textAnchor="middle"
              fontSize={10}
              fill="currentColor"
            >
              {step.n_characters}
            </text>
          ))}
          <text
            x={(WIDTH + PAD_LEFT) / 2}
            y={HEIGHT - 8}
            textAnchor="middle"
            fontSize={10}
            fill="currentColor"
          >
            characters of the text
          </text>
          {series.map((line) => (
            <g key={line.name}>
              <polyline
                points={steps
                  .map(
                    (step, position) =>
                      `${x(step.n_characters)},${y(line.values[position])}`,
                  )
                  .join(" ")}
                fill="none"
                stroke={line.colour}
                strokeWidth={2}
              />
              {steps.map((step, position) => (
                <circle
                  key={`${line.name}-${step.n_characters}`}
                  cx={x(step.n_characters)}
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
        {series.map((line) => (
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

      <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
        At the full {last.n_characters} characters there are{" "}
        {grouped(last.n_cuts)} ways to cut them, of which the list permits{" "}
        {grouped(last.n_readings)}, and the search steps along {last.n_edges}{" "}
        candidates after asking about {last.n_lookups} substrings.
      </p>
    </div>
  );
}
