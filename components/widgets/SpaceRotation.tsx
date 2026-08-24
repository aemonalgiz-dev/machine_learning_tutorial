"use client";

// Turn the whole table and watch what moves.
//
// A slider turns the first two coordinates of every word by the same angle.
// The first coordinate of the watched word swings across most of its range, and
// the two panels beneath report what did not move: the largest change in any
// pair's cosine, the largest change in any word's length, and the watched
// word's nearest neighbours before and after. The API turns the table and
// re-measures every pair; the browser draws the swing.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { RotationView, fetchRotation } from "@/lib/concepts/a-vector-for-a-word";
import { ACCENT, CONTRAST, colourOf } from "./wordPositionFixtures";

const VIEW = { width: 620, height: 220 };
const PAD = { left: 60, right: 20, top: 16, bottom: 34 };

export function SpaceRotation({ word = "sail" }: { word?: string }) {
  const [angle, setAngle] = useState(0);
  const [view, setView] = useState<RotationView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setView(await fetchRotation(angle, word));
        setMessage(null);
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      }
    }, 40);
    return () => clearTimeout(timer);
  }, [angle, word]);

  if (!view) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const firsts = view.rows.map((row) => row.after[0]);
  const originals = view.rows.map((row) => row.before[0]);
  const low = Math.min(...firsts, ...originals);
  const high = Math.max(...firsts, ...originals);
  const plotX = (value: number) =>
    PAD.left + ((value - low) / (high - low || 1)) * (VIEW.width - PAD.left - PAD.right);

  return (
    <div>
      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        turn the whole table by
        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={angle}
          onChange={(event) => setAngle(Number(event.target.value))}
          className="flex-1 accent-indigo-600"
        />
        <span className="w-12 text-right font-mono">{angle}°</span>
      </label>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="mt-2 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={PAD.left}
          x2={VIEW.width - PAD.right}
          y1={70}
          y2={70}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
        />
        <line
          x1={PAD.left}
          x2={VIEW.width - PAD.right}
          y1={140}
          y2={140}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
        />
        <text x={PAD.left} y={40} className="fill-slate-500 text-[11px] dark:fill-slate-400">
          first coordinate, before the turn
        </text>
        <text x={PAD.left} y={110} className="fill-slate-500 text-[11px] dark:fill-slate-400">
          first coordinate, after the turn
        </text>
        {view.rows.map((row) => (
          <circle
            key={`b${row.word}`}
            cx={plotX(row.before[0])}
            cy={70}
            r={row.word === word ? 6 : 4}
            fill={row.word === word ? ACCENT : colourOf(row.word)}
            opacity={row.word === word ? 1 : 0.5}
          >
            <title>{row.word}</title>
          </circle>
        ))}
        {view.rows.map((row) => (
          <circle
            key={`a${row.word}`}
            cx={plotX(row.after[0])}
            cy={140}
            r={row.word === word ? 6 : 4}
            fill={row.word === word ? ACCENT : colourOf(row.word)}
            opacity={row.word === word ? 1 : 0.5}
          >
            <title>{row.word}</title>
          </circle>
        ))}
        <line
          x1={plotX(view.watched.before[0])}
          y1={76}
          x2={plotX(view.watched.after[0])}
          y2={134}
          stroke={CONTRAST}
          strokeWidth={2}
          strokeDasharray="4 3"
        />
        <text
          x={plotX(view.watched.after[0])}
          y={162}
          textAnchor="middle"
          className="fill-slate-600 font-mono text-[11px] dark:fill-slate-300"
        >
          {word}
        </text>
        <text
          x={PAD.left}
          y={VIEW.height - 8}
          className="fill-slate-500 text-xs dark:fill-slate-400"
        >
          every word&rsquo;s first coordinate, on one scale
        </text>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label={`${word}, first coordinate`}
          value={`${view.watched.before[0].toFixed(4)} to ${view.watched.after[0].toFixed(4)}`}
        />
        <Stat
          label={`${word}, its length`}
          value={`${view.watched.length_before.toFixed(4)} to ${view.watched.length_after.toFixed(4)}`}
        />
        <Stat
          label="largest change in any cosine"
          value={view.worst_cosine_change.toExponential(2)}
        />
        <Stat
          label="words whose nearest word is unchanged"
          value={`${view.n_top_unchanged} of ${view.n_words}`}
        />
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Listing heading={`nearest ${word}, before`} rows={view.neighbours_before} />
        <Listing heading={`nearest ${word}, after`} rows={view.neighbours_after} />
      </div>

      {message && <p className="mt-2 text-sm text-rose-600">{message}</p>}
    </div>
  );
}

function Listing({
  heading,
  rows,
}: {
  heading: string;
  rows: { word: string; cosine: number }[];
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-800">
      <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {heading}
      </div>
      <div className="mt-1 font-mono text-xs text-slate-700 dark:text-slate-300">
        {rows.map((row) => `${row.word} ${row.cosine.toFixed(4)}`).join(", ")}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
