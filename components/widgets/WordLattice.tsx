"use client";

// One word as the positions between its symbols, and every piece that spans a
// pair of them.
//
// The API reports each arc the starting model holds over the held-out word,
// with the probability it carries and whether it lies on the likeliest path.
// The browser lays the positions out along a line and draws each piece as a
// curve from where it starts to where it ends, so a spelling of the word is a
// walk from the left end to the right end and the count of walks is the count
// of spellings. Hover a curve to read the piece and what the model gives it.

import { useEffect, useState } from "react";
import {
  LatticeArc,
  SpellingsView,
  fetchSpellings,
  messageFor,
} from "@/lib/concepts/the-unigram-language-model";
import { END_OF_WORD, Stat, readProbability } from "./unigramModelParts";

const WIDTH = 640;
const HEIGHT = 260;
const PAD = 44;
const BASELINE = 200;

export function WordLattice() {
  const [view, setView] = useState<SpellingsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [hover, setHover] = useState<LatticeArc | null>(null);
  const [onlyBest, setOnlyBest] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchSpellings());
      } catch (error) {
        setMessage(messageFor(error));
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

  const lattice = view.lattice;
  const positions = lattice.n_positions;
  const step = (WIDTH - 2 * PAD) / (positions - 1);
  const atPosition = (index: number) => PAD + index * step;
  const shown = onlyBest
    ? lattice.arcs.filter((arc) => arc.on_best_path)
    : lattice.arcs;

  const curveFor = (arc: LatticeArc) => {
    const from = atPosition(arc.start);
    const to = atPosition(arc.end);
    const rise = 26 + (arc.end - arc.start) * 30;
    return `M ${from} ${BASELINE} Q ${(from + to) / 2} ${BASELINE - rise} ${to} ${BASELINE}`;
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOnlyBest(!onlyBest)}
          className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          {onlyBest ? "Show every piece" : "Show only the likeliest walk"}
        </button>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={atPosition(0)}
          y1={BASELINE}
          x2={atPosition(positions - 1)}
          y2={BASELINE}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
        />

        {shown.map((arc) => (
          <g
            key={`${arc.start}-${arc.end}`}
            onMouseEnter={() => setHover(arc)}
            onMouseLeave={() => setHover(null)}
          >
            <path
              d={curveFor(arc)}
              fill="none"
              stroke={arc.on_best_path ? "#4f46e5" : "#94a3b8"}
              strokeWidth={arc.on_best_path ? 2.6 : 1.2}
              opacity={
                hover === null || hover === arc ? 1 : arc.on_best_path ? 0.8 : 0.25
              }
            />
            <path
              d={curveFor(arc)}
              fill="none"
              stroke="transparent"
              strokeWidth={12}
            />
          </g>
        ))}

        {Array.from({ length: positions }, (_, index) => (
          <g key={index}>
            <circle
              cx={atPosition(index)}
              cy={BASELINE}
              r={5}
              className="fill-white stroke-slate-400 dark:fill-slate-900 dark:stroke-slate-500"
              strokeWidth={1.5}
            />
            <text
              x={atPosition(index)}
              y={BASELINE + 20}
              textAnchor="middle"
              className="fill-slate-500 text-[11px] dark:fill-slate-400"
            >
              {index}
            </text>
          </g>
        ))}

        {lattice.symbols.map((symbol, index) => (
          <text
            key={`${index}-${symbol}`}
            x={(atPosition(index) + atPosition(index + 1)) / 2}
            y={BASELINE + 40}
            textAnchor="middle"
            className="fill-slate-700 font-mono text-[13px] dark:fill-slate-300"
          >
            {symbol.endsWith(END_OF_WORD)
              ? `${symbol.slice(0, -END_OF_WORD.length)}␣`
              : symbol}
          </text>
        ))}
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="positions" value={positions} />
        <Stat label="pieces that span a pair" value={lattice.arcs.length} />
        <Stat label="walks from end to end" value={lattice.n_paths} />
        <Stat
          label="hovered piece"
          value={
            hover
              ? `${hover.piece.replace(END_OF_WORD, "␣")} at ${readProbability(hover.probability)}`
              : "hover a curve"
          }
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The word is {lattice.word}, which the four-word corpus never contains.
        Every curve is a piece the model holds, drawn from the position it
        starts at to the position it ends at, and a spelling of the word is any
        walk from 0 to {positions - 1}. Indigo is the walk the model calls
        likeliest.
      </p>
    </div>
  );
}
