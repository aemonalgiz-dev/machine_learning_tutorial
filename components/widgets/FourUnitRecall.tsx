"use client";

// The worked example's four cells, as the library actually built them.
//
// Two patterns over four cells, (+1, +1, -1, -1) and (+1, +1, -1, +1), stored
// and then probed with the first pattern's first cell flipped. The table is
// the weight matrix the library formed, which the page works by hand pair by
// pair, and the rows beneath it are the walk, one cell moving on the first
// pass and nothing on the second. Every weight and every energy comes from
// the API; the browser only sets them in a table.

import { useEffect, useState } from "react";
import { ApiError, Recall, recallPattern } from "@/lib/api";

const FIRST_PATTERN = [1, 1, -1, -1];
const SECOND_PATTERN = [1, 1, -1, 1];
const FIRST_CELL_FLIPPED = [-1, 1, -1, -1];

function asSigns(state: number[]): string {
  return "(" + state.map((value) => (value > 0 ? "+1" : "−1")).join(", ") + ")";
}

export function FourUnitRecall() {
  const [answer, setAnswer] = useState<Recall | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(
          await recallPattern(
            [FIRST_PATTERN, SECOND_PATTERN],
            FIRST_CELL_FLIPPED,
          ),
        );
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const headerClass =
    "px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400";
  const cellClass =
    "px-3 py-1.5 text-center font-mono text-sm text-slate-800 dark:text-slate-200";

  return (
    <div className="my-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-center gap-8">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className={headerClass}>w</th>
              {[1, 2, 3, 4].map((unit) => (
                <th key={unit} className={headerClass}>
                  cell {unit}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3].map((row) => (
              <tr
                key={row}
                className="border-t border-slate-200 dark:border-slate-800"
              >
                <th className={headerClass + " text-left"}>cell {row + 1}</th>
                {[0, 1, 2, 3].map((column) => (
                  <td key={column} className={cellClass}>
                    {answer ? answer.weights[row][column].toFixed(1) : "…"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-2 font-mono text-sm text-slate-800 dark:text-slate-200">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              probe{" "}
            </span>
            {asSigns(FIRST_CELL_FLIPPED)}
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {" "}
              energy {answer ? answer.initial_energy.toFixed(1) : "…"}
            </span>
          </div>
          {answer?.passes.map((recallPass) => (
            <div key={recallPass.pass_number}>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                pass {recallPass.pass_number}{" "}
              </span>
              {asSigns(recallPass.state)}
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {" "}
                {recallPass.units_changed} moved, energy{" "}
                {recallPass.energy_after.toFixed(1)}
              </span>
            </div>
          ))}
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {answer
              ? answer.settled_into.pattern_index === 0
                ? "settled into A, a fixed point, at a load of " +
                  answer.load.toFixed(1)
                : "settled somewhere other than A"
              : "…"}
          </div>
        </div>
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
