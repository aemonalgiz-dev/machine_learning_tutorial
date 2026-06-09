"use client";

// The T and its negation, scored side by side.
//
// The energy is quadratic in the state, so reversing every cell leaves it
// unchanged, and every weighted sum reverses along with the cell it belongs
// to, so a state where every cell agrees with its sum becomes another such
// state. The API scores both under the three stored shapes and reports the
// energy, the fixed-point verdict, the first few weighted sums and how many
// cells each shares with each stored shape; the browser lays the two out.

import { useEffect, useState } from "react";
import { ApiError, StateScores, scoreStates } from "@/lib/concepts/hopfield-network";
import { Failure, PatternGrid, plain, signed } from "./HopfieldGrid";
import { THREE_SHAPES, T_SHAPE, cellsOf } from "./hopfieldFixtures";

const NEGATED_T = T_SHAPE.cells.map((value) => -value);

export function NegationCheck() {
  const [scores, setScores] = useState<StateScores | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setScores(await scoreStates(cellsOf(THREE_SHAPES), [T_SHAPE.cells, NEGATED_T]));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!scores) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const labels = ["the T", "every cell reversed"];

  return (
    <div className="my-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-center gap-8">
        {scores.reports.map((report, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <PatternGrid cells={report.state} size="medium" />
            <span className="text-xs text-slate-500 dark:text-slate-400">{labels[index]}</span>
            <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-1 font-mono text-sm text-slate-800 dark:text-slate-200">
              <dt className="text-xs text-slate-500 dark:text-slate-400">energy</dt>
              <dd>{plain(report.energy, 2)}</dd>
              <dt className="text-xs text-slate-500 dark:text-slate-400">a fixed point</dt>
              <dd>{report.is_fixed_point ? "yes" : "no"}</dd>
              <dt className="text-xs text-slate-500 dark:text-slate-400">cells wanting to move</dt>
              <dd>{report.units_wanting_to_move}</dd>
              <dt className="text-xs text-slate-500 dark:text-slate-400">first five cells read</dt>
              <dd>{report.weighted_sums.slice(0, 5).map((sum) => signed(sum, 2)).join(" ")}</dd>
              <dt className="text-xs text-slate-500 dark:text-slate-400">cells shared with T, L, cross</dt>
              <dd>{report.agreements.join(", ")}</dd>
            </dl>
          </div>
        ))}
      </div>
      <Failure message={message} />
    </div>
  );
}
