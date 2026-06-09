"use client";

// How long the word rows and the document rows ended up, under each architecture.
//
// A word is stepped at every position it appears at, anywhere in the collection;
// a document is stepped only at its own eight positions. Under distributed
// memory that leaves the word rows an order longer than the document rows, and
// under the bag of words, where the word rows are never touched at all, it
// leaves them the other way round. The API fits and measures; the browser draws
// the two ranges on one scale.

import { useEffect, useState } from "react";
import { ApiError, Fits, fetchFits } from "@/lib/concepts/paragraph-vectors";
import { COOKING, Legend, SAILING, Waiting } from "./paragraphVectorsShared";

const VIEW = { width: 640, height: 200 };
const PAD = { left: 150, right: 24, top: 24, bottom: 34 };

export function ParagraphRowLengths() {
  const [fits, setFits] = useState<Fits | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setFits(await fetchFits());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!fits) return <Waiting message={message} />;

  const rows = fits.architectures.flatMap((entry) => [
    {
      key: `${entry.architecture}-word`,
      label: `${entry.label}, word rows`,
      lengths: entry.word_lengths,
      colour: SAILING,
    },
    {
      key: `${entry.architecture}-document`,
      label: `${entry.label}, document rows`,
      lengths: entry.document_lengths,
      colour: COOKING,
    },
  ]);

  const largest = Math.max(...rows.map((row) => row.lengths.largest)) * 1.08;
  const innerWidth = VIEW.width - PAD.left - PAD.right;
  const innerHeight = VIEW.height - PAD.top - PAD.bottom;
  const step = innerHeight / rows.length;
  const plotX = (value: number) => PAD.left + (value / largest) * innerWidth;

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {rows.map((row, index) => {
          const centre = PAD.top + step * (index + 0.5);
          return (
            <g key={row.key}>
              <text
                x={PAD.left - 8}
                y={centre + 4}
                textAnchor="end"
                className="fill-slate-600 text-[10px] dark:fill-slate-400"
              >
                {row.label}
              </text>
              <line
                x1={plotX(row.lengths.smallest)}
                x2={plotX(row.lengths.largest)}
                y1={centre}
                y2={centre}
                stroke={row.colour}
                strokeWidth={8}
                strokeLinecap="round"
                opacity={0.35}
              />
              <circle
                cx={plotX(row.lengths.mean)}
                cy={centre}
                r={5}
                fill={row.colour}
              />
              <text
                x={plotX(row.lengths.largest) + 8}
                y={centre + 4}
                className="fill-slate-700 text-[10px] dark:fill-slate-300"
              >
                {row.lengths.mean.toFixed(2)}
              </text>
            </g>
          );
        })}
        <line
          x1={PAD.left}
          x2={PAD.left + innerWidth}
          y1={VIEW.height - PAD.bottom + 4}
          y2={VIEW.height - PAD.bottom + 4}
          stroke="currentColor"
          strokeWidth={1}
          className="text-slate-300 dark:text-slate-700"
        />
        {[0, largest / 2, largest].map((tick) => (
          <text
            key={tick}
            x={plotX(tick)}
            y={VIEW.height - PAD.bottom + 18}
            textAnchor="middle"
            className="fill-slate-500 text-[10px] dark:fill-slate-400"
          >
            {tick.toFixed(1)}
          </text>
        ))}
        <text
          x={PAD.left + innerWidth / 2}
          y={VIEW.height - 4}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          length of a row
        </text>
      </svg>

      <Legend>
        Each bar runs from the shortest row of that family to the longest, and
        the dot is the mean. Under distributed memory the word rows are the long
        ones and the document rows the short ones, which is why a new
        document&rsquo;s vector starts as a small share of a mean the words
        already dominate. Under the bag of words the word rows were never
        stepped at all, so they stay at the small random values they were drawn
        at.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
