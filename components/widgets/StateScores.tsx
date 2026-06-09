"use client";

// Five grids put to one fitted machine, and the score it gives each.
//
// The bar is the score, drawn to the left of the line where the score is
// negative and to the right where it is positive, and lower means the machine
// finds the grid more plausible. Three of the grids are shapes it learned, one
// is a shape it never saw, one is a scatter of lit cells, and one is the T with
// every cell reversed. Beside each is what the hidden units read off it and
// what comes back down. The API fits once and scores every grid against that
// one fit; the browser draws the bars.

import { useEffect, useState } from "react";
import {
  ApiError,
  BoltzmannStates,
  scoreBoltzmannStates,
} from "@/lib/concepts/restricted-boltzmann-machine";
import {
  CellGrid,
  DAMAGED_T,
  DEFAULT_EPOCHS,
  DEFAULT_HIDDEN_UNITS,
  PATTERNS,
  REVERSED_T,
  SCATTER,
  SQUARE_SHAPE,
  T_SHAPE,
  codeOf,
} from "./boltzmannFixtures";

const ROWS: { label: string; note: string; cells: number[] }[] = [
  { label: "the T", note: "one of the three it learned", cells: T_SHAPE.cells },
  {
    label: "the T with five cells flipped",
    note: "never shown, and near one that was",
    cells: DAMAGED_T,
  },
  {
    label: "thirteen cells at random",
    note: "never shown, and near nothing",
    cells: SCATTER,
  },
  {
    label: "the square",
    note: "never shown, and a shape all the same",
    cells: SQUARE_SHAPE.cells,
  },
  {
    label: "the T reversed",
    note: "every lit cell dark and every dark cell lit",
    cells: REVERSED_T,
  },
];

const STATES = ROWS.map((row) => row.cells);

let cached: Promise<BoltzmannStates> | null = null;

function scored(): Promise<BoltzmannStates> {
  cached ??= scoreBoltzmannStates(
    PATTERNS,
    DEFAULT_HIDDEN_UNITS,
    DEFAULT_EPOCHS,
    STATES,
  );
  return cached;
}

const CHART = { width: 420, height: 44 };

export function StateScores() {
  const [answer, setAnswer] = useState<BoltzmannStates | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await scored());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!answer) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const scores = answer.states.map((row) => row.free_energy);
  const lowest = Math.min(...scores, 0);
  const highest = Math.max(...scores, 0);
  const span = highest - lowest || 1;
  const positionOf = (value: number) =>
    ((value - lowest) / span) * (CHART.width - 20) + 10;
  const zero = positionOf(0);

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="space-y-3">
        {ROWS.map((row, index) => {
          const document = answer.states[index];
          const at = positionOf(document.free_energy);
          return (
            <div key={row.label} className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <CellGrid values={row.cells} size="small" />
                <CellGrid values={document.reconstruction} size="small" amber />
              </div>
              <div className="min-w-[10rem] flex-1">
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  {row.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {row.note}, read as {codeOf(document.hidden_probabilities)}
                </div>
              </div>
              <svg
                viewBox={`0 0 ${CHART.width} ${CHART.height}`}
                className="w-full max-w-md select-none"
              >
                <line
                  x1={zero}
                  y1={4}
                  x2={zero}
                  y2={CHART.height - 4}
                  stroke="currentColor"
                  className="text-slate-300 dark:text-slate-700"
                  strokeWidth={1}
                />
                <rect
                  x={Math.min(at, zero)}
                  y={12}
                  width={Math.abs(at - zero)}
                  height={16}
                  className={
                    document.free_energy < 0
                      ? "fill-indigo-600"
                      : "fill-amber-500"
                  }
                />
                <text
                  x={document.free_energy < 0 ? at - 4 : at + 4}
                  y={24}
                  textAnchor={document.free_energy < 0 ? "end" : "start"}
                  className="fill-slate-600 text-[11px] font-medium dark:fill-slate-300"
                >
                  {document.free_energy.toFixed(2)}
                </text>
              </svg>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        The left grid of each pair is what was put in and the amber grid is what
        came back. The bar is the score, running left from the upright line as
        the machine finds the grid more plausible and right as it finds it less.
        Every grid started within a tenth of every other before any learning, so
        the whole spread here was made by the five hundred passes.
      </p>
    </div>
  );
}
