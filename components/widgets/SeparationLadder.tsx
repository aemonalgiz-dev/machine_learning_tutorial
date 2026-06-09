"use client";

// Every rule scored on the one thing nobody told it: which half a document is in.
//
// For each rule, the average angle between two documents of one half and the
// average angle between two documents of different halves, on one scale, with
// the smallest within-half figure and the largest between-half figure marked so
// the gap between the two populations can be read rather than the two averages
// alone. The API pools every document under every rule and measures; the browser
// draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  CorpusName,
  Separation,
  SeparationRow,
  fetchSeparation,
} from "@/lib/concepts/pooling-a-text";
import {
  COOKING,
  Choice,
  Legend,
  SAILING,
  Waiting,
  signed,
} from "./poolingATextShared";

const CORPORA: { label: string; value: CorpusName }[] = [
  { label: "twenty-four documents", value: "documents" },
  { label: "six two-word documents", value: "sketch" },
];

const WIDTH = 560;
const ROW = 42;
const LEFT = 132;
const RIGHT = 62;

export function SeparationLadder({ corpus: fixed }: { corpus?: CorpusName }) {
  const [corpus, setCorpus] = useState<CorpusName>(fixed ?? "documents");
  const [separation, setSeparation] = useState<Separation | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchSeparation();
        if (!cancelled) {
          setSeparation(next);
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

  if (!separation) return <Waiting message={message} />;

  const rows: SeparationRow[] = separation.rows.filter(
    (row) => row.corpus === corpus,
  );
  const height = rows.length * ROW + 30;
  const across = (value: number) =>
    LEFT + ((value + 1) / 2) * (WIDTH - LEFT - RIGHT);

  return (
    <div>
      {fixed === undefined && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Choice options={CORPORA} value={corpus} onChange={setCorpus} />
        </div>
      )}

      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="w-full rounded-lg bg-slate-50 dark:bg-slate-900/60"
        role="img"
        aria-label="Each rule scored on how far apart it puts the two halves"
      >
        <line
          x1={across(0)}
          y1={16}
          x2={across(0)}
          y2={height - 16}
          stroke="#cbd5e1"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        {[-1, 0, 1].map((mark) => (
          <text
            key={mark}
            x={across(mark)}
            y={height - 4}
            fontSize={9}
            textAnchor="middle"
            fill="#94a3b8"
            fontFamily="ui-monospace, monospace"
          >
            {mark === 0 ? "0" : mark === 1 ? "+1" : "−1"}
          </text>
        ))}
        {rows.map((row, position) => {
          const middle = 30 + position * ROW;
          return (
            <g key={row.method}>
              <text
                x={LEFT - 8}
                y={middle - 3}
                fontSize={10}
                textAnchor="end"
                fill="#64748b"
              >
                {row.method_label}
              </text>
              <text
                x={LEFT - 8}
                y={middle + 9}
                fontSize={9}
                textAnchor="end"
                fill="#94a3b8"
                fontFamily="ui-monospace, monospace"
              >
                {row.width} numbers
              </text>
              <line
                x1={across(row.within_smallest)}
                y1={middle - 8}
                x2={across(row.within_mean)}
                y2={middle - 8}
                stroke={SAILING}
                strokeWidth={7}
                strokeOpacity={0.28}
                strokeLinecap="round"
              />
              <circle
                cx={across(row.within_mean)}
                cy={middle - 8}
                r={4.5}
                fill={SAILING}
              />
              <line
                x1={across(row.between_mean)}
                y1={middle + 6}
                x2={across(row.between_largest)}
                y2={middle + 6}
                stroke={COOKING}
                strokeWidth={7}
                strokeOpacity={0.28}
                strokeLinecap="round"
              />
              <circle
                cx={across(row.between_mean)}
                cy={middle + 6}
                r={4.5}
                fill={COOKING}
              />
              <text
                x={WIDTH - 6}
                y={middle + 3}
                fontSize={9}
                textAnchor="end"
                fill={row.margin > 0 ? "#10b981" : "#ef4444"}
                fontFamily="ui-monospace, monospace"
              >
                {signed(row.margin)}
              </text>
            </g>
          );
        })}
      </svg>

      <Legend>
        The indigo dot is the average similarity between two documents of the
        same half and its bar reaches out to the least alike such pair; the amber
        dot is the average between two documents of different halves and its bar
        reaches out to the most alike such pair. The figure on the right is the
        least alike same-half pair minus the most alike different-half pair, so
        it is green only when every same-half pair is nearer than every
        different-half pair, and on the twenty-four documents the two counting
        rules never manage it.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
