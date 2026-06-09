"use client";

// One spelling used for two unrelated things, and where a table with one row
// per spelling has to put it.
//
// The corpus is the running one with a single substitution: a word of the
// cooking half and a word of the sailing half are both respelled roll, so one
// row now carries both sets of company. The bar is where each word falls on the
// direction that separates the halves. The API refits and measures; the browser
// draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  Senses,
  fetchSenses,
} from "@/lib/concepts/latent-semantic-analysis";
import {
  Legend,
  SHARED,
  Stat,
  Waiting,
  colourFor,
} from "./latentSemanticShared";

const WIDTH = 560;
const HEIGHT = 120;
const PADDING = 24;

export function TwoSensesOneRow() {
  const [report, setReport] = useState<Senses | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchSenses();
        if (!cancelled) {
          setReport(next);
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

  if (!report) return <Waiting message={message} />;

  const marks = [
    {
      word: report.cooking_example,
      value: report.cooking_word_second_coordinate,
      group: "cooking",
    },
    { word: report.word, value: report.second_coordinate, group: "shared" },
    {
      word: report.sailing_example,
      value: report.sailing_word_second_coordinate,
      group: "sailing",
    },
  ];
  const reach =
    Math.max(...marks.map((mark) => Math.abs(mark.value)), 0.001) * 1.25;
  const across = (value: number) =>
    PADDING + ((value + reach) / (2 * reach)) * (WIDTH - 2 * PADDING);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat
          label={`${report.word} against ${report.cooking_example}`}
          value={report.similarity_to_cooking_word.toFixed(4)}
        />
        <Stat
          label={`${report.word} against ${report.sailing_example}`}
          value={report.similarity_to_sailing_word.toFixed(4)}
        />
        <Stat
          label={`${report.word} against ${report.shared_example}`}
          value={report.similarity_to_a_shared_word.toFixed(4)}
        />
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-3 w-full rounded-lg bg-slate-50 dark:bg-slate-900/60"
        role="img"
        aria-label="Where one spelling with two senses falls on the separating direction"
      >
        <line
          x1={PADDING}
          y1={HEIGHT / 2}
          x2={WIDTH - PADDING}
          y2={HEIGHT / 2}
          stroke="#cbd5e1"
          strokeWidth={1.5}
        />
        <line
          x1={across(0)}
          y1={26}
          x2={across(0)}
          y2={HEIGHT - 30}
          stroke="#94a3b8"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <text
          x={across(0)}
          y={HEIGHT - 12}
          fontSize={10}
          textAnchor="middle"
          fill={SHARED}
        >
          neither half
        </text>
        {marks.map((mark) => (
          <g key={mark.word}>
            <circle
              cx={across(mark.value)}
              cy={HEIGHT / 2}
              r={7}
              fill={colourFor(mark.group)}
              fillOpacity={0.5}
              stroke={colourFor(mark.group)}
            />
            <text
              x={across(mark.value)}
              y={HEIGHT / 2 - 14}
              fontSize={11}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
              fill={colourFor(mark.group)}
            >
              {mark.word}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-2 flex flex-wrap gap-2">
        {report.nearest.slice(0, 5).map((row) => (
          <span
            key={row.word}
            className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] dark:bg-slate-800"
            style={{ color: colourFor(row.group) }}
          >
            {row.word} {row.similarity.toFixed(4)}
          </span>
        ))}
      </div>

      <Legend>
        The chips are the words nearest {report.word} in the refitted space,
        commonest use first. It has landed exactly on the line marked neither
        half, and its nearest neighbours are the three words that carry no topic
        at all, which is a spelling with two senses being described as a word
        that means nothing.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
