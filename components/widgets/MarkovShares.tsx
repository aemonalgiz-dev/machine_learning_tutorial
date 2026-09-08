"use client";

// Where the letter chain settles, against how often each letter occurs.
//
// Three bars for each of the twenty-seven symbols. Indigo is the chain's
// stationary distribution, grey is the share of the first two chapters, which
// the chain was counted on, and amber is the share of the third chapter, which
// it never saw. The first two agree almost by construction; the third is the
// check the construction does not force. The API solves for the distribution
// and counts the letters; the browser draws.

import { useEffect, useState } from "react";
import { LettersView, fetchLetters, messageFor } from "@/lib/concepts/markov-chains";
import {
  AMBER,
  Caption,
  INDIGO,
  Loading,
  SLATE,
  Stat,
  readProbability,
  stateMark,
  stateName,
} from "./markovParts";

const WIDTH = 660;
const HEIGHT = 230;
const PAD_LEFT = 40;
const PAD_RIGHT = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 26;

export function MarkovShares() {
  const [view, setView] = useState<LettersView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchLetters());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) return <Loading message={message} />;

  const rows = view.shares;
  const largest = Math.max(
    ...rows.flatMap((row) => [row.stationary, row.counted, row.held_back]),
  );
  const group = (WIDTH - PAD_LEFT - PAD_RIGHT) / rows.length;
  const bar = group / 3.6;
  const toHeight = (value: number) =>
    (value / largest) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
  const series = [
    { name: "where the chain settles", colour: INDIGO, read: (row: (typeof rows)[number]) => row.stationary },
    { name: "the first two chapters", colour: SLATE, read: (row: (typeof rows)[number]) => row.counted },
    { name: "the third chapter", colour: AMBER, read: (row: (typeof rows)[number]) => row.held_back },
  ];

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {[0, 0.05, 0.1, 0.15, 0.2].map((tick) => (
          <g key={tick}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={HEIGHT - PAD_BOTTOM - toHeight(tick)}
              y2={HEIGHT - PAD_BOTTOM - toHeight(tick)}
              className="stroke-slate-200 dark:stroke-slate-800"
            />
            <text
              x={PAD_LEFT - 5}
              y={HEIGHT - PAD_BOTTOM - toHeight(tick) + 3}
              textAnchor="end"
              className="fill-slate-500 font-mono text-[9px] dark:fill-slate-400"
            >
              {tick.toFixed(2)}
            </text>
          </g>
        ))}
        {rows.map((row, index) => {
          const left = PAD_LEFT + index * group + (group - 3 * bar) / 2;
          return (
            <g key={row.state}>
              {series.map((line, position) => (
                <rect
                  key={line.name}
                  x={left + position * bar}
                  y={HEIGHT - PAD_BOTTOM - toHeight(line.read(row))}
                  width={bar}
                  height={toHeight(line.read(row))}
                  fill={line.colour}
                >
                  <title>{`${stateName(row.state)}, ${line.name}, ${readProbability(line.read(row))}`}</title>
                </rect>
              ))}
              <text
                x={PAD_LEFT + index * group + group / 2}
                y={HEIGHT - 9}
                textAnchor="middle"
                className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
              >
                {stateMark(row.state)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
        {series.map((line) => (
          <span key={line.name} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: line.colour }}
            />
            {line.name}
          </span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat
          label="largest gap, the chapters it counted"
          value={view.largest_gap_counted.toFixed(4)}
        />
        <Stat
          label={`largest gap, a walk of ${view.walk_length.toLocaleString()} letters`}
          value={view.largest_gap_walk.toFixed(4)}
        />
        <Stat
          label="largest gap, the chapter it never saw"
          value={view.largest_gap_held_back.toFixed(4)}
        />
      </div>
      <Caption>
        Hover a bar for its value. The space is the tallest group because one
        symbol in five is a space, and the three bars beside it differ in the
        third decimal place.
      </Caption>
    </div>
  );
}
