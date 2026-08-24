"use client";

// How the two tables grow as sentences arrive, and what the next sentence costs.
//
// The API feeds the six sentences in one at a time, builds both tables after
// each, and then encodes the sentence that has not arrived yet against tables
// that have never met it. The browser draws the two growth lines and lists the
// pieces of that next sentence neither table could already spell.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { GrowthView, fetchVocabularyGrowth } from "@/lib/concepts/what-a-token-is";

const CHART = { width: 460, height: 240 };
const PAD = { left: 42, right: 14, top: 16, bottom: 34 };

const CHARACTER_COLOUR = "#6366f1";
const WORD_COLOUR = "#10b981";

export function VocabularyGrowthChart() {
  const [view, setView] = useState<GrowthView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchVocabularyGrowth());
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

  const steps = view.steps;
  const highest = Math.max(
    ...steps.map((step) => Math.max(step.character_table, step.word_table)),
  );
  const ceiling = Math.ceil(highest / 10) * 10;

  const plotWidth = CHART.width - PAD.left - PAD.right;
  const plotHeight = CHART.height - PAD.top - PAD.bottom;
  const positionX = (index: number) =>
    PAD.left + (index / (steps.length - 1)) * plotWidth;
  const positionY = (value: number) =>
    PAD.top + plotHeight - (value / ceiling) * plotHeight;

  const path = (pick: (step: GrowthView["steps"][number]) => number) =>
    steps
      .map(
        (step, index) =>
          `${index === 0 ? "M" : "L"} ${positionX(index).toFixed(1)} ${positionY(
            pick(step),
          ).toFixed(1)}`,
      )
      .join(" ");

  const gridValues = [0, ceiling / 2, ceiling];
  const withNext = steps.filter((step) => step.next_text !== null);

  return (
    <div>
      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {gridValues.map((value) => (
          <g key={value}>
            <line
              x1={PAD.left}
              x2={CHART.width - PAD.right}
              y1={positionY(value)}
              y2={positionY(value)}
              stroke="currentColor"
              strokeWidth={0.5}
              className="text-slate-300 dark:text-slate-700"
            />
            <text
              x={PAD.left - 6}
              y={positionY(value) + 3.5}
              textAnchor="end"
              className="fill-slate-500 text-[9px] dark:fill-slate-400"
            >
              {value}
            </text>
          </g>
        ))}

        <path
          d={path((step) => step.character_table)}
          fill="none"
          stroke={CHARACTER_COLOUR}
          strokeWidth={2}
        />
        <path
          d={path((step) => step.word_table)}
          fill="none"
          stroke={WORD_COLOUR}
          strokeWidth={2}
        />

        {steps.map((step, index) => (
          <g key={step.n_texts}>
            <circle
              cx={positionX(index)}
              cy={positionY(step.character_table)}
              r={3}
              fill={CHARACTER_COLOUR}
            />
            <circle
              cx={positionX(index)}
              cy={positionY(step.word_table)}
              r={3}
              fill={WORD_COLOUR}
            />
            <text
              x={positionX(index)}
              y={CHART.height - PAD.bottom + 14}
              textAnchor="middle"
              className="fill-slate-500 text-[9px] dark:fill-slate-400"
            >
              {step.n_texts}
            </text>
          </g>
        ))}

        <text
          x={PAD.left + plotWidth / 2}
          y={CHART.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          sentences seen
        </text>
      </svg>

      <div className="mt-2 flex flex-wrap gap-4 text-xs">
        <Key colour={CHARACTER_COLOUR} label="one number per character" />
        <Key colour={WORD_COLOUR} label="one number per whole word" />
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                built from
              </th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                characters
              </th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                whole words
              </th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">
                of the next sentence, unseen
              </th>
            </tr>
          </thead>
          <tbody>
            {withNext.map((step) => (
              <tr
                key={step.n_texts}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {step.n_texts === 1
                    ? "1 sentence"
                    : `${step.n_texts} sentences`}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {step.character_table}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {step.word_table}
                </td>
                <td className="py-1.5 font-mono text-slate-800 dark:text-slate-200">
                  {step.next_unknown_characters} of {step.next_character_tokens}{" "}
                  characters, {step.next_unknown_words} of {step.next_word_tokens}{" "}
                  words
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Both counts include the one stand-in the table reserves at number 0. The
        last row has no entry for an unseen sentence because there is no seventh
        sentence to try.
      </p>
    </div>
  );
}

function Key({ colour, label }: { colour: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
      <span
        className="inline-block h-2 w-4 rounded-sm"
        style={{ backgroundColor: colour }}
      />
      {label}
    </span>
  );
}
