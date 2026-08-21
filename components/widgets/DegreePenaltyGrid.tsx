"use client";

// Two dials at once, and what the grid costs.
//
// Every combination of a polynomial degree in height and a ridge penalty is
// one candidate, and the candidates are laid out as the lattice they are,
// degree down the side and penalty along the top, each cell shaded by its
// cross-validated score and the winner ringed. The readouts count the
// candidates, which is the product of the two ranges, and the fits, which is
// that times the folds. Widen either range and both counts multiply. The API
// runs the search and the browser draws the lattice.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { GridOutcome, searchGrid } from "@/lib/concepts/grid-search";
import { TWELVE_PEOPLE, formatScore } from "./gridSearchFixtures";

const ALL_DEGREES = [1, 2, 3, 4];
const ALL_PENALTIES = [0.001, 0.01, 0.1, 1, 10, 100];
const DEBOUNCE_MS = 160;

const CELL = 76;
const HEAD = 44;
const SIDE = 70;

function shade(score: number, low: number, high: number): number {
  if (high - low < 1e-12) return 0.6;
  return 0.12 + (0.78 * (Math.max(score, low) - low)) / (high - low);
}

export function DegreePenaltyGrid() {
  const [degreeCount, setDegreeCount] = useState(3);
  const [penaltyCount, setPenaltyCount] = useState(4);
  const [folds, setFolds] = useState(3);
  const [answer, setAnswer] = useState<GridOutcome | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const degrees = ALL_DEGREES.slice(0, degreeCount);
  const penalties = ALL_PENALTIES.slice(1, 1 + penaltyCount);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const searched = await searchGrid(TWELVE_PEOPLE, degrees, penalties, folds);
        if (cancelled) return;
        setAnswer(searched);
        setMessage(null);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // The ranges are derived from the two counts, which are the dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [degreeCount, penaltyCount, folds]);

  const width = SIDE + penalties.length * CELL;
  const height = HEAD + degrees.length * CELL;
  const low = answer ? Math.max(answer.worst_score, -1) : 0;
  const high = answer ? answer.best_score : 1;

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-4 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          degrees
          <input
            type="range"
            min={1}
            max={ALL_DEGREES.length}
            step={1}
            value={degreeCount}
            onChange={(event) => setDegreeCount(Number(event.target.value))}
            className="w-20 accent-indigo-600"
          />
          <span className="w-4 font-mono text-sm">{degreeCount}</span>
        </label>
        <label className="flex items-center gap-2">
          penalties
          <input
            type="range"
            min={1}
            max={ALL_PENALTIES.length - 1}
            step={1}
            value={penaltyCount}
            onChange={(event) => setPenaltyCount(Number(event.target.value))}
            className="w-20 accent-amber-600"
          />
          <span className="w-4 font-mono text-sm">{penaltyCount}</span>
        </label>
        <label className="flex items-center gap-2">
          folds
          <input
            type="range"
            min={2}
            max={4}
            step={1}
            value={folds}
            onChange={(event) => setFolds(Number(event.target.value))}
            className="w-20 accent-emerald-600"
          />
          <span className="w-4 font-mono text-sm">{folds}</span>
        </label>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto w-full max-w-lg select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {penalties.map((penalty, column) => (
          <text
            key={penalty}
            x={SIDE + column * CELL + CELL / 2}
            y={HEAD - 14}
            textAnchor="middle"
            className="fill-slate-500 text-[11px] dark:fill-slate-400"
          >
            penalty {penalty}
          </text>
        ))}
        {degrees.map((degree, row) => (
          <text
            key={degree}
            x={SIDE - 8}
            y={HEAD + row * CELL + CELL / 2 + 4}
            textAnchor="end"
            className="fill-slate-500 text-[11px] dark:fill-slate-400"
          >
            degree {degree}
          </text>
        ))}
        {answer &&
          answer.cells.map((cell) => {
            const row = degrees.indexOf(cell.degree);
            const column = penalties.indexOf(cell.penalty);
            if (row < 0 || column < 0) return null;
            const x = SIDE + column * CELL;
            const y = HEAD + row * CELL;
            const winner =
              cell.degree === answer.best_degree && cell.penalty === answer.best_penalty;
            return (
              <g key={`${cell.degree}-${cell.penalty}`}>
                <rect
                  x={x + 3}
                  y={y + 3}
                  width={CELL - 6}
                  height={CELL - 6}
                  rx={6}
                  fill="#6366f1"
                  opacity={shade(cell.score, low, high)}
                />
                {winner && (
                  <rect
                    x={x + 3}
                    y={y + 3}
                    width={CELL - 6}
                    height={CELL - 6}
                    rx={6}
                    fill="none"
                    strokeWidth={3}
                    className="stroke-indigo-700 dark:stroke-indigo-300"
                  />
                )}
                <text
                  x={x + CELL / 2}
                  y={y + CELL / 2 + 4}
                  textAnchor="middle"
                  className="fill-slate-900 font-mono text-[12px] dark:fill-slate-100"
                >
                  {formatScore(cell.score, 3)}
                </text>
              </g>
            );
          })}
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Candidates" value={answer ? `${degrees.length} × ${penalties.length} = ${answer.n_candidates}` : "…"} />
        <Stat label="Models fitted" value={answer ? `${answer.n_candidates} × ${folds} = ${answer.n_fits}` : "…"} />
        <Stat
          label="Winner"
          value={answer ? `degree ${answer.best_degree}, penalty ${answer.best_penalty}` : "…"}
        />
        <Stat label="Spread, and held-out" value={answer ? `${formatScore(answer.score_spread)}, ${formatScore(answer.honest_score)}` : "…"} />
      </div>

      {message && (
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
