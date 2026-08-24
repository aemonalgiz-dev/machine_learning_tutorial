"use client";

// A character table growing as one more language arrives, beside a byte table
// that cannot.
//
// The API starts from eighteen English sentences, adds one language's sentence
// at a time, and after each one counts the distinct characters everything so far
// has used and the distinct byte values everything so far has touched. The
// browser draws the three lines: the character table, the byte values actually
// used, and the fixed height of the byte table itself.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { GrowthView, fetchAlphabetGrowth } from "@/lib/concepts/bytes-and-characters";

const CHART = { width: 470, height: 250 };
const PAD = { left: 34, right: 12, top: 14, bottom: 52 };

const CHARACTER_COLOUR = "#6366f1";
const USED_COLOUR = "#10b981";
const TABLE_COLOUR = "#f59e0b";

export function AlphabetGrowthChart() {
  const [view, setView] = useState<GrowthView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchAlphabetGrowth());
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
  const ceiling = Math.max(...steps.map((step) => step.byte_table));
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

  const last = steps[steps.length - 1];

  return (
    <div>
      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {[0, 64, 128, 192, 256].map((value) => (
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
              x={PAD.left - 5}
              y={positionY(value) + 3.5}
              textAnchor="end"
              className="fill-slate-500 text-[9px] dark:fill-slate-400"
            >
              {value}
            </text>
          </g>
        ))}

        <path
          d={path((step) => step.byte_table)}
          fill="none"
          stroke={TABLE_COLOUR}
          strokeWidth={2}
        />
        <path
          d={path((step) => step.byte_values_used)}
          fill="none"
          stroke={USED_COLOUR}
          strokeWidth={2}
        />
        <path
          d={path((step) => step.character_table)}
          fill="none"
          stroke={CHARACTER_COLOUR}
          strokeWidth={2}
        />

        {steps.map((step, index) => (
          <g key={step.label}>
            <circle
              cx={positionX(index)}
              cy={positionY(step.character_table)}
              r={2.5}
              fill={CHARACTER_COLOUR}
            />
            <circle
              cx={positionX(index)}
              cy={positionY(step.byte_values_used)}
              r={2.5}
              fill={USED_COLOUR}
            />
            <text
              x={positionX(index)}
              y={CHART.height - PAD.bottom + 12}
              textAnchor="end"
              transform={`rotate(-45 ${positionX(index)} ${
                CHART.height - PAD.bottom + 12
              })`}
              className="fill-slate-500 text-[8px] dark:fill-slate-400"
            >
              {index === 0 ? "18 English" : step.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-2 flex flex-wrap gap-4 text-xs">
        <Key colour={CHARACTER_COLOUR} label="characters the texts have used" />
        <Key colour={USED_COLOUR} label="byte values the texts have touched" />
        <Key colour={TABLE_COLOUR} label="entries in the byte table" />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Twelve languages, one short sentence each, arriving from left to right.
        The character count reaches {last.character_table} and is still rising at
        the last sentence; the byte table is {last.byte_table} at every point on
        the chart, including before any of the twelve arrived, and{" "}
        {last.byte_table - last.byte_values_used} of its entries have still never
        been touched.
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
