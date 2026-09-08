"use client";

// Two walks forgetting where they began.
//
// The first view follows the chance of a vowel in two walks of the
// vowel-and-consonant chain, one started at a vowel and one at a consonant,
// and draws where both end up as a dashed line. They cross before they meet,
// because the chain's second eigenvalue is negative. The second view is the
// distance from settled on a logarithmic scale, where a constant factor per
// step is a straight line, for that chain and for the worst of the twenty-seven
// starts of the letter chain. The API walks both chains; the browser draws.

import { useEffect, useState } from "react";
import {
  LettersView,
  VowelsView,
  fetchLetters,
  fetchVowels,
  messageFor,
} from "@/lib/concepts/markov-chains";
import {
  ACTIVE_CLASS,
  AMBER,
  BUTTON_CLASS,
  Caption,
  INDIGO,
  Loading,
  ROSE,
  SLATE,
  Stat,
  readProbability,
  stateMark,
} from "./markovParts";

const WIDTH = 640;
const HEIGHT = 240;
const PAD_LEFT = 50;
const PAD_RIGHT = 16;
const PAD_TOP = 14;
const PAD_BOTTOM = 38;

export function MarkovForgetting() {
  const [vowels, setVowels] = useState<VowelsView | null>(null);
  const [letters, setLetters] = useState<LettersView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [panel, setPanel] = useState<"walks" | "distance">("walks");

  useEffect(() => {
    (async () => {
      try {
        const [first, second] = await Promise.all([fetchVowels(), fetchLetters()]);
        setVowels(first);
        setLetters(second);
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!vowels || !letters) return <Loading message={message} />;

  const rows = vowels.after;
  const settled = vowels.counted.stationary[0];

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPanel("walks")}
          className={panel === "walks" ? ACTIVE_CLASS : BUTTON_CLASS}
        >
          Two walks
        </button>
        <button
          type="button"
          onClick={() => setPanel("distance")}
          className={panel === "distance" ? ACTIVE_CLASS : BUTTON_CLASS}
        >
          Distance from settled
        </button>
      </div>

      {panel === "walks" ? (
        <Walks rows={rows} settled={settled} />
      ) : (
        <Distances vowels={vowels} letters={letters} />
      )}

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="second eigenvalue, vowels and consonants"
          value={vowels.second_eigenvalue.toFixed(4)}
        />
        <Stat
          label="distance from a vowel start, one step"
          value={rows[1].distance_from_vowel.toFixed(4)}
        />
        <Stat
          label="the same, two steps"
          value={rows[2].distance_from_vowel.toFixed(4)}
        />
        <Stat
          label={`letters, worst start after ${letters.mixing[3].n_steps} steps`}
          value={`${stateMark(letters.mixing[3].worst_start)}, ${letters.mixing[3].worst_distance.toFixed(4)}`}
        />
      </div>
    </div>
  );
}

function Walks({
  rows,
  settled,
}: {
  rows: VowelsView["after"];
  settled: number;
}) {
  const last = rows[rows.length - 1].n_steps;
  const toX = (step: number) =>
    PAD_LEFT + (step / last) * (WIDTH - PAD_LEFT - PAD_RIGHT);
  const toY = (value: number) =>
    PAD_TOP + (1 - value) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
  const series = [
    { name: "from a vowel", colour: INDIGO, read: (row: (typeof rows)[number]) => row.vowel_from_vowel },
    { name: "from a consonant", colour: SLATE, read: (row: (typeof rows)[number]) => row.vowel_from_consonant },
  ];

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
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
        <line
          x1={PAD_LEFT}
          x2={WIDTH - PAD_RIGHT}
          y1={toY(settled)}
          y2={toY(settled)}
          stroke={AMBER}
          strokeDasharray="5 4"
        />
        {series.map((line) => (
          <g key={line.name}>
            <path
              d={rows
                .map(
                  (row, index) =>
                    `${index === 0 ? "M" : "L"} ${toX(row.n_steps).toFixed(1)} ${toY(line.read(row)).toFixed(1)}`,
                )
                .join(" ")}
              fill="none"
              stroke={line.colour}
              strokeWidth={2}
            />
            {rows.map((row) => (
              <circle
                key={row.n_steps}
                cx={toX(row.n_steps)}
                cy={toY(line.read(row))}
                r={3}
                fill={line.colour}
              />
            ))}
          </g>
        ))}
        {rows.map((row) => (
          <text
            key={row.n_steps}
            x={toX(row.n_steps)}
            y={HEIGHT - PAD_BOTTOM + 14}
            textAnchor="middle"
            className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
          >
            {row.n_steps}
          </text>
        ))}
        <text
          x={(PAD_LEFT + WIDTH - PAD_RIGHT) / 2}
          y={HEIGHT - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          steps taken, and the chance the walk is at a vowel
        </text>
      </svg>
      <Caption>
        Indigo starts at a vowel and grey at a consonant. The dashed amber line
        is {settled.toFixed(4)}, the chance of a vowel the chain settles at,
        and both walks reach it by overshooting in turn.
      </Caption>
    </div>
  );
}

function Distances({
  vowels,
  letters,
}: {
  vowels: VowelsView;
  letters: LettersView;
}) {
  const lastStep = Math.max(
    vowels.after[vowels.after.length - 1].n_steps,
    letters.mixing[letters.mixing.length - 1].n_steps,
  );
  const floor = -8;
  const toX = (step: number) =>
    PAD_LEFT + (step / lastStep) * (WIDTH - PAD_LEFT - PAD_RIGHT);
  const toY = (value: number) => {
    const logged = Math.max(floor, Math.log10(Math.max(value, 1e-300)));
    return PAD_TOP + (logged / floor) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
  };
  const classPoints = vowels.after.map((row) => ({
    step: row.n_steps,
    value: row.distance_from_vowel,
  }));
  const letterPoints = letters.mixing.map((row) => ({
    step: row.n_steps,
    value: row.worst_distance,
  }));
  const series = [
    { name: "vowels and consonants, from a vowel", colour: INDIGO, points: classPoints },
    { name: "letters, from the worst start", colour: ROSE, points: letterPoints },
  ];

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {[1, 1e-2, 1e-4, 1e-6, 1e-8].map((tick) => (
          <g key={tick}>
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
              {tick === 1 ? "1" : tick.toExponential(0)}
            </text>
          </g>
        ))}
        {series.map((line) => (
          <g key={line.name}>
            <path
              d={line.points
                .map(
                  (point, index) =>
                    `${index === 0 ? "M" : "L"} ${toX(point.step).toFixed(1)} ${toY(point.value).toFixed(1)}`,
                )
                .join(" ")}
              fill="none"
              stroke={line.colour}
              strokeWidth={2}
            />
            {line.points.map((point) => (
              <circle
                key={point.step}
                cx={toX(point.step)}
                cy={toY(point.value)}
                r={3}
                fill={line.colour}
              >
                <title>{`${point.step} steps, ${readProbability(point.value)}`}</title>
              </circle>
            ))}
          </g>
        ))}
        {[0, 5, 10, 15].map((step) => (
          <text
            key={step}
            x={toX(step)}
            y={HEIGHT - PAD_BOTTOM + 14}
            textAnchor="middle"
            className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
          >
            {step}
          </text>
        ))}
        <text
          x={(PAD_LEFT + WIDTH - PAD_RIGHT) / 2}
          y={HEIGHT - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          steps taken
        </text>
      </svg>
      <Caption>
        Indigo is the two-state chain started at a vowel, a straight line
        because every step multiplies the distance by the same{" "}
        {Math.abs(vowels.second_eigenvalue).toFixed(4)}. Rose is the letter
        chain from whichever of its twenty-seven starts is furthest away at
        each step, q for the first four steps and v after.
      </Caption>
    </div>
  );
}
