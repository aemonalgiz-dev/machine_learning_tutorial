"use client";

// The four-cell recall opened up into its eight visits.
//
// Two patterns over four cells stored, then A probed with its first cell
// flipped. The library visits the cells one at a time in a seeded order, and
// each row here is one visit: which cell, what its connections told it, what
// it held before and after, and the energy once it had moved or had not. One
// cell moves, on the very first visit, and the other seven visits confirm
// that nothing else wants to. Every sum and every energy comes from the API;
// the browser sets them in a table.

import { useEffect, useState } from "react";
import { ApiError, UnitWalk, walkByUnit } from "@/lib/concepts/hopfield-network";
import { Failure, plain, signed } from "./HopfieldGrid";
import { FOUR_CELL_DAMAGED, FOUR_CELL_PATTERNS, asSigns } from "./hopfieldFixtures";

export function FourCellVisits() {
  const [walk, setWalk] = useState<UnitWalk | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setWalk(await walkByUnit(FOUR_CELL_PATTERNS, FOUR_CELL_DAMAGED));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!walk) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const headerClass = "px-3 py-1.5 text-left text-xs font-medium text-slate-500 dark:text-slate-400";
  const cellClass = "px-3 py-1.5 font-mono text-sm text-slate-800 dark:text-slate-200";

  return (
    <div className="my-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <p className="mb-2 font-mono text-sm text-slate-800 dark:text-slate-200">
        <span className="text-xs text-slate-500 dark:text-slate-400">probe </span>
        {asSigns(FOUR_CELL_DAMAGED)}
        <span className="text-xs text-slate-500 dark:text-slate-400"> energy {plain(walk.initial_energy, 1)}</span>
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={headerClass}>visit</th>
              <th className={headerClass}>pass</th>
              <th className={headerClass}>cell</th>
              <th className={headerClass}>reads</th>
              <th className={headerClass}>held</th>
              <th className={headerClass}>becomes</th>
              <th className={headerClass}>energy after</th>
            </tr>
          </thead>
          <tbody>
            {walk.visits.map((visit) => (
              <tr
                key={visit.visit_number}
                className={
                  "border-t border-slate-200 dark:border-slate-800" +
                  (visit.flipped ? " bg-amber-100/70 dark:bg-amber-900/30" : "")
                }
              >
                <td className={cellClass}>{visit.visit_number}</td>
                <td className={cellClass}>{visit.pass_number}</td>
                <td className={cellClass}>{visit.unit + 1}</td>
                <td className={cellClass}>{signed(visit.weighted_sum, 1)}</td>
                <td className={cellClass}>{visit.value_before > 0 ? "+1" : "−1"}</td>
                <td className={cellClass}>
                  {visit.value_after > 0 ? "+1" : "−1"}
                  {visit.flipped ? " moved" : ""}
                </td>
                <td className={cellClass}>{plain(visit.energy_after, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {walk.passes.length} passes, the second moving nothing, and the walk reports {walk.stopped_because}; the rest is{" "}
        {walk.settled_into.pattern_index === 0 && !walk.settled_into.flipped ? "A" : "not A"}, a fixed point, at a load of{" "}
        {walk.load.toFixed(1)}. The shaded row is the one visit that moved a cell.
      </p>
      <Failure message={message} />
    </div>
  );
}
