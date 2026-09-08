"use client";

// What the chain says several letters on, against what the text does.
//
// For each gap from one letter to five, indigo is the chain's own answer to
// the chance of a vowel that many letters after a vowel, the table raised to
// that power. Grey is the text's answer, counted directly from every pair of
// letters that far apart in the first two chapters, and amber the same count
// in the third. At a gap of one the chain and its text agree exactly, since the
// table is that count. The second view runs the check on text the letter chain
// wrote itself, where one letter of memory is true by construction and any
// miss comes from grouping letters into two classes. The API counts and walks;
// the browser draws.

import { useEffect, useState } from "react";
import { VowelsView, fetchVowels, messageFor } from "@/lib/concepts/markov-chains";
import {
  ACTIVE_CLASS,
  AMBER,
  BUTTON_CLASS,
  Caption,
  INDIGO,
  Loading,
  SLATE,
  Stat,
} from "./markovParts";

const WIDTH = 640;
const HEIGHT = 240;
const PAD_LEFT = 50;
const PAD_RIGHT = 16;
const PAD_TOP = 14;
const PAD_BOTTOM = 38;

type Row = VowelsView["gaps"][number];

interface Line {
  name: string;
  colour: string;
  dashed: boolean;
  read: (row: Row) => number;
}

const ALICE: Line[] = [
  { name: "what the chain says", colour: INDIGO, dashed: false, read: (row) => row.chain_vowel_after_vowel },
  { name: "what the first two chapters do", colour: SLATE, dashed: false, read: (row) => row.text_vowel_after_vowel },
  { name: "what the third chapter does", colour: AMBER, dashed: true, read: (row) => row.held_back_vowel_after_vowel },
];

const WRITTEN: Line[] = [
  { name: "what its chain says", colour: INDIGO, dashed: false, read: (row) => row.written_chain_vowel_after_vowel },
  { name: "what the written text does", colour: SLATE, dashed: false, read: (row) => row.written_text_vowel_after_vowel },
];

export function MarkovTwoStep() {
  const [view, setView] = useState<VowelsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [text, setText] = useState<"alice" | "written">("alice");

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchVowels());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) return <Loading message={message} />;

  const rows = view.gaps;
  const lines = text === "alice" ? ALICE : WRITTEN;
  const values = rows.flatMap((row) => lines.map((line) => line.read(row)));
  const low = Math.floor(Math.min(...values) * 20) / 20;
  const high = Math.ceil(Math.max(...values) * 20) / 20;
  const toX = (gap: number) =>
    PAD_LEFT + ((gap - 1) / (rows.length - 1)) * (WIDTH - PAD_LEFT - PAD_RIGHT);
  const toY = (value: number) =>
    PAD_TOP + ((high - value) / (high - low)) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
  const ticks: number[] = [];
  for (let tick = low; tick <= high + 1e-9; tick += 0.05) ticks.push(tick);
  const two = rows[1];

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setText("alice")}
          className={text === "alice" ? ACTIVE_CLASS : BUTTON_CLASS}
        >
          Alice
        </button>
        <button
          type="button"
          onClick={() => setText("written")}
          className={text === "written" ? ACTIVE_CLASS : BUTTON_CLASS}
        >
          Text the letter chain wrote
        </button>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {ticks.map((tick) => (
          <g key={tick.toFixed(2)}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={toY(tick)}
              y2={toY(tick)}
              className="stroke-slate-200 dark:stroke-slate-800"
            />
            <text
              x={PAD_LEFT - 6}
              y={toY(tick) + 3}
              textAnchor="end"
              className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
            >
              {tick.toFixed(2)}
            </text>
          </g>
        ))}
        {lines.map((line) => (
          <g key={line.name}>
            <path
              d={rows
                .map(
                  (row, index) =>
                    `${index === 0 ? "M" : "L"} ${toX(row.gap).toFixed(1)} ${toY(line.read(row)).toFixed(1)}`,
                )
                .join(" ")}
              fill="none"
              stroke={line.colour}
              strokeWidth={2}
              strokeDasharray={line.dashed ? "5 4" : undefined}
            />
            {rows.map((row) => (
              <circle
                key={row.gap}
                cx={toX(row.gap)}
                cy={toY(line.read(row))}
                r={3.5}
                fill={line.colour}
              />
            ))}
          </g>
        ))}
        {rows.map((row) => (
          <text
            key={row.gap}
            x={toX(row.gap)}
            y={HEIGHT - PAD_BOTTOM + 14}
            textAnchor="middle"
            className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
          >
            {row.gap}
          </text>
        ))}
        <text
          x={(PAD_LEFT + WIDTH - PAD_RIGHT) / 2}
          y={HEIGHT - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          letters after a vowel, and the chance that letter is a vowel too
        </text>
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
        {lines.map((line) => (
          <span key={line.name} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: line.colour }}
            />
            {line.name}
          </span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="two letters on, the chain"
          value={lines[0].read(two).toFixed(4)}
        />
        <Stat
          label="two letters on, the text"
          value={lines[1].read(two).toFixed(4)}
        />
        <Stat
          label="the chain misses by"
          value={(lines[0].read(two) - lines[1].read(two)).toFixed(4)}
        />
        <Stat
          label="letters in the text"
          value={
            text === "alice"
              ? view.counted.n_symbols.toLocaleString()
              : view.written_length.toLocaleString()
          }
        />
      </div>
      <Caption>
        {text === "alice"
          ? "The third chapter was never counted, and it sides with the text rather than with the chain."
          : "Twenty thousand symbols written by the chain over every letter and the space, then read as vowels and consonants with the spaces dropped."}
      </Caption>
    </div>
  );
}
