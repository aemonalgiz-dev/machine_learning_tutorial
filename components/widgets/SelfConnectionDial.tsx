"use client";

// A weight put back on the diagonal the storage rule cleared.
//
// The slider sets one self weight on every diagonal entry of the fitted
// matrix, and the readouts say what the probe's cells then read. A self
// weight adds the same constant to every state's energy, so the landscape's
// order is untouched, and what it changes is the update: a cell's own value
// times the self weight is always a vote for staying put, so above a certain
// size no cell ever moves and the network hands back whatever it was given.
// Two probes, the four-cell pair's damaged A and the scrambled T under three
// shapes. The API computes every sum, energy and verdict; the browser draws
// the grid and highlights the cells that still want to move.

import { useEffect, useState } from "react";
import { ApiError, SelfConnection, connectToSelf } from "@/lib/concepts/hopfield-network";
import { Caption, Failure, PatternGrid, Stat, plain, signed } from "./HopfieldGrid";
import { BUTTON_CLASS, FOUR_CELL_DAMAGED, FOUR_CELL_PATTERNS, SCRAMBLED_T, THREE_SHAPES, cellsOf } from "./hopfieldFixtures";

type Probe = "fourCells" | "scrambledT";

export function SelfConnectionDial() {
  const [probe, setProbe] = useState<Probe>("fourCells");
  const [selfWeight, setSelfWeight] = useState(0);
  const [answer, setAnswer] = useState<SelfConnection | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const patterns = probe === "fourCells" ? FOUR_CELL_PATTERNS : cellsOf(THREE_SHAPES);
  const state = probe === "fourCells" ? FOUR_CELL_DAMAGED : SCRAMBLED_T;

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await connectToSelf(patterns, state, selfWeight));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 40);
    return () => clearTimeout(timer);
    // The patterns and the state follow from the probe choice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [probe, selfWeight]);

  const wanting = answer ? state.map((_, index) => answer.units_wanting_to_move_with.includes(index)) : undefined;

  return (
    <div className="my-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex gap-2">
          <button onClick={() => setProbe("fourCells")} className={BUTTON_CLASS + (probe === "fourCells" ? " ring-2 ring-indigo-400" : "")}>
            Damaged A, four cells
          </button>
          <button onClick={() => setProbe("scrambledT")} className={BUTTON_CLASS + (probe === "scrambledT" ? " ring-2 ring-indigo-400" : "")}>
            Scrambled T, three shapes
          </button>
        </div>
        <label className="flex flex-1 items-center gap-2">
          self weight
          <input
            type="range"
            min={0}
            max={2}
            step={0.25}
            value={selfWeight}
            onChange={(event) => setSelfWeight(Number(event.target.value))}
            className="flex-1 accent-indigo-600"
          />
          <span className="w-10 text-right font-mono">{selfWeight.toFixed(2)}</span>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-start justify-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <PatternGrid cells={state} changed={wanting} size={probe === "fourCells" ? "large" : "medium"} />
          <span className="text-xs text-slate-500 dark:text-slate-400">the probe, with the cells that still want to move outlined</span>
        </div>
        {answer && probe === "fourCells" && (
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">cell</th>
                <th className="px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">reads, diagonal cleared</th>
                <th className="px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">reads, self weight added</th>
              </tr>
            </thead>
            <tbody>
              {state.map((value, index) => (
                <tr key={index} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-2 py-1 text-center font-mono text-sm text-slate-800 dark:text-slate-200">
                    {index + 1} ({value > 0 ? "+1" : "−1"})
                  </td>
                  <td className="px-2 py-1 text-center font-mono text-sm text-slate-800 dark:text-slate-200">
                    {signed(answer.weighted_sums_without[index], 2)}
                  </td>
                  <td className="px-2 py-1 text-center font-mono text-sm text-slate-800 dark:text-slate-200">
                    {signed(answer.weighted_sums_with[index], 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="cells wanting to move, cleared" value={answer ? String(answer.units_wanting_to_move_without.length) : "…"} />
        <Stat label="cells wanting to move, with self weight" value={answer ? String(answer.units_wanting_to_move_with.length) : "…"} />
        <Stat label="energy of the probe, cleared and with" value={answer ? `${plain(answer.probe_energy_without, 2)}, ${plain(answer.probe_energy_with, 2)}` : "…"} />
        <Stat label="largest row sum off the diagonal" value={answer ? answer.largest_row_sum.toFixed(2) : "…"} />
      </div>
      <Caption>
        The energy shift is the same for every state, {answer ? plain(answer.energy_shift, 2) : "…"} here, which is minus a half of
        the self weight times the cell count. A self weight above the largest row sum leaves no cell able to move whatever
        the probe.
      </Caption>
      <Failure message={message} />
    </div>
  );
}
