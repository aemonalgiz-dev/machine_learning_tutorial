"use client";

// What the squeeze repairs, and what it costs to repair it.
//
// The first view takes pairs that the table as counted rates at exactly
// nothing, because they share no document, and reads the same pairs off two
// fits. The second view draws, for each width, the whole range of angles
// between two words of one half against the mean angle across the halves, so
// the gain and the loss are in one picture. The API measures; the browser
// draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  Sharpness,
  fetchSharpness,
} from "@/lib/concepts/latent-semantic-analysis";
import {
  Choice,
  FIRST_HALF,
  Legend,
  SECOND_HALF,
  SHARED,
  Stat,
  Waiting,
} from "./latentSemanticShared";

type View = "pairs" | "widths";

const VIEWS: { label: string; value: View }[] = [
  { label: "pairs the table cannot place", value: "pairs" },
  { label: "what each width costs", value: "widths" },
];

const WIDTH = 560;
const ROW_HEIGHT = 30;
const PADDING = 130;

export function SqueezeTradeoff() {
  const [view, setView] = useState<View>("pairs");
  const [report, setReport] = useState<Sharpness | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchSharpness();
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

  if (view === "pairs") {
    const pairs = [
      ...report.document_pairs.slice(0, 2).map((pair) => ({
        label: `${pair.first} / ${pair.second}`,
        pair,
      })),
      {
        label: `${report.crossing_pair.first} / ${report.crossing_pair.second}`,
        pair: report.crossing_pair,
      },
      ...report.word_pairs.slice(0, 3).map((pair) => ({
        label: `${pair.first} / ${pair.second}`,
        pair,
      })),
      ...report.word_pairs.slice(-1).map((pair) => ({
        label: `${pair.first} / ${pair.second}`,
        pair,
      })),
    ];

    return (
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Choice options={VIEWS} value={view} onChange={setView} />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Stat
            label="pairs of words in one half"
            value={`${report.n_word_pairs_at_zero} of ${report.n_word_pairs} at nothing`}
          />
          <Stat
            label="pairs of documents in one half"
            value={`${report.n_document_pairs_at_zero} of ${report.n_document_pairs} at nothing`}
          />
          <Stat
            label="pairs across the halves"
            value={`${report.n_across_document_pairs_at_zero} of ${report.n_across_document_pairs} at nothing`}
          />
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                <th className="py-1.5 pr-4 font-medium text-slate-500 dark:text-slate-400">
                  the pair
                </th>
                <th className="py-1.5 pr-4 text-right font-medium text-slate-500 dark:text-slate-400">
                  the table itself
                </th>
                <th className="py-1.5 pr-4 text-right font-medium text-slate-500 dark:text-slate-400">
                  {report.narrow_dimension} directions
                </th>
                <th className="py-1.5 text-right font-medium text-slate-500 dark:text-slate-400">
                  {report.wide_dimension} directions
                </th>
              </tr>
            </thead>
            <tbody>
              {pairs.map(({ label, pair }) => (
                <tr
                  key={label}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                >
                  <td className="py-1.5 pr-4 font-mono text-slate-700 dark:text-slate-300">
                    {label}
                  </td>
                  <td className="py-1.5 pr-4 text-right font-mono text-slate-800 dark:text-slate-200">
                    {pair.raw.toFixed(4)}
                  </td>
                  <td className="py-1.5 pr-4 text-right font-mono text-slate-800 dark:text-slate-200">
                    {pair.narrow.toFixed(4)}
                  </td>
                  <td className="py-1.5 text-right font-mono text-slate-800 dark:text-slate-200">
                    {pair.wide.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Legend>
          The third row is the one to read twice. Those two documents come from
          opposite halves and the table as counted rates them above the two
          rows above it, which come from one half and share no word at all.
        </Legend>
        {message && (
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            {message}
          </p>
        )}
      </div>
    );
  }

  const rows = report.widths;
  const height = rows.length * ROW_HEIGHT + 34;
  const across = (value: number) =>
    PADDING + ((value + 0.05) / 1.1) * (WIDTH - PADDING - 20);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <Choice options={VIEWS} value={view} onChange={setView} />
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="w-full rounded-lg bg-slate-50 dark:bg-slate-900/60"
        role="img"
        aria-label="The range of angles inside a half at each width"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
            <line
              x1={across(tick)}
              y1={16}
              x2={across(tick)}
              y2={height - 20}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
            <text
              x={across(tick)}
              y={height - 6}
              fontSize={9}
              textAnchor="middle"
              fill={SHARED}
            >
              {tick.toFixed(2)}
            </text>
          </g>
        ))}
        {rows.map((row, position) => {
          const middle = 26 + position * ROW_HEIGHT;
          return (
            <g key={row.label}>
              <text
                x={PADDING - 8}
                y={middle + 3}
                fontSize={10}
                textAnchor="end"
                fill={SHARED}
              >
                {row.label}
              </text>
              <line
                x1={across(row.within_smallest)}
                y1={middle}
                x2={across(row.within_largest)}
                y2={middle}
                stroke={FIRST_HALF}
                strokeWidth={7}
                strokeOpacity={0.35}
                strokeLinecap="round"
              />
              <circle
                cx={across(row.within_mean)}
                cy={middle}
                r={4}
                fill={FIRST_HALF}
              />
              <circle
                cx={across(row.across_mean)}
                cy={middle}
                r={4}
                fill={SECOND_HALF}
              />
            </g>
          );
        })}
      </svg>

      <Legend>
        The amber band is every angle between two words of one half, from the
        smallest to the largest, and the amber dot is their mean; the indigo dot
        is the mean angle between a word of one half and a word of the other.
        Keeping two directions pushes the indigo dot to nothing, which is the
        method working, and collapses the amber band to a point, which is the
        same fit no longer able to tell any two words of one half apart.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
