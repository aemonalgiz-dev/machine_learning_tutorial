"use client";

// The same three shapes given to both models, and the same grids put to both.
//
// The left column is what went in. The middle column is where the memory of the
// page before this one comes to rest from it, which is always one of the three
// shapes or one of them inverted, cell for cell. The right column is what this
// machine gives back, which is a probability per cell and need not be any shape
// at all. The two number columns are each model's score for the grid and for
// the grid with every cell reversed, and the memory's pair are the same number
// every time. The API fits both models on the same shapes; the browser lays the
// two answers side by side.

import { useEffect, useState } from "react";
import {
  ApiError,
  BoltzmannAgainstMemory,
  compareBoltzmannWithMemory,
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
  Stat,
  THREE_SHAPES,
  T_SHAPE,
} from "./boltzmannFixtures";

const ROWS = [
  { label: "the T", cells: T_SHAPE.cells },
  { label: "the T reversed", cells: REVERSED_T },
  { label: "the T with five cells flipped", cells: DAMAGED_T },
  { label: "the square, never shown", cells: SQUARE_SHAPE.cells },
  { label: "thirteen cells at random", cells: SCATTER },
];

const STATES = ROWS.map((row) => row.cells);

let cached: Promise<BoltzmannAgainstMemory> | null = null;

function compared(): Promise<BoltzmannAgainstMemory> {
  cached ??= compareBoltzmannWithMemory(
    PATTERNS,
    DEFAULT_HIDDEN_UNITS,
    DEFAULT_EPOCHS,
    STATES,
  );
  return cached;
}

export function MemoryBeside() {
  const [answer, setAnswer] = useState<BoltzmannAgainstMemory | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await compared());
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

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {[
                "put in",
                "where the memory rests",
                "what the machine gives back",
                "memory, and reversed",
                "machine, and reversed",
              ].map((heading) => (
                <th
                  key={heading}
                  className="py-2 pr-4 align-bottom font-semibold text-slate-600 last:pr-0 dark:text-slate-400"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, index) => {
              const report = answer.reports[index];
              return (
                <tr
                  key={row.label}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                >
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <CellGrid values={row.cells} size="small" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {row.label}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <CellGrid values={report.settled} size="small" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {nameOfRest(report.settled_into, report.settled_inverted)}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <CellGrid values={report.rebuilt} size="small" amber />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {report.rebuilt_rounds_to === null
                          ? "rounds to no stored shape"
                          : `rounds to ${THREE_SHAPES[report.rebuilt_rounds_to].name}`}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                    {report.memory_energy.toFixed(2)}
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {report.reversed_memory_energy.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2 font-mono text-slate-800 dark:text-slate-200">
                    {report.free_energy.toFixed(2)}
                    <span className="block text-xs text-amber-600 dark:text-amber-400">
                      {report.reversed_free_energy.toFixed(2)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat
          label="Memory, grid against reversal"
          value={answer.largest_memory_reversal_gap.toFixed(1)}
          note="largest gap over the five grids"
        />
        <Stat
          label="Machine, grid against reversal"
          value={answer.largest_reversal_gap.toFixed(2)}
          note="the same measurement"
        />
        <Stat
          label="Grids the memory answered with a stored shape"
          value={`${answer.reports.filter((report) => report.settled_into !== null).length} of ${answer.reports.length}`}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The lower figure in each number column is the score for the grid with
        every cell reversed. Read the two columns down and the difference between
        the models is one number wide.
      </p>
    </div>
  );
}

function nameOfRest(into: number | null, inverted: boolean): string {
  if (into === null) return "nothing it stored";
  return inverted
    ? `${THREE_SHAPES[into].name}, inverted`
    : THREE_SHAPES[into].name;
}
