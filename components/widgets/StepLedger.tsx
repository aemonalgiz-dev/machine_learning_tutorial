"use client";

// One learning step, traced on two rows of four cells.
//
// The rule reads two counts for every wire. The first is measured with the
// cells held at the two stored rows, the second after the machine has been let
// go for a single alternation and drawn a pair of rows of its own, and the
// weight moves by the rate times the difference. Both count tables are here
// side by side with the difference beside them, and the drawn rows are shown
// too, since a count that surprises you is usually a draw that surprised you.
// Step through the twelve updates and watch the tenth, where the machine
// happens to draw exactly the rows it was shown, both counts agree, and the
// change is zero. The API replays the rule and the browser lays it out.

import { useEffect, useState } from "react";
import {
  ApiError,
  BoltzmannStepTrace,
  traceBoltzmannSteps,
} from "@/lib/concepts/restricted-boltzmann-machine";
import {
  ACTIVE_BUTTON_CLASS,
  CellGrid,
  FOUR_CELL_HIDDEN_UNITS,
  FOUR_CELL_PAIR,
  SMALL_BUTTON_CLASS,
  Stat,
} from "./boltzmannFixtures";

const STEPS_SHOWN = 12;

let cached: Promise<BoltzmannStepTrace> | null = null;

function trace(): Promise<BoltzmannStepTrace> {
  cached ??= traceBoltzmannSteps(
    FOUR_CELL_PAIR,
    FOUR_CELL_HIDDEN_UNITS,
    STEPS_SHOWN,
  );
  return cached;
}

export function StepLedger() {
  const [replay, setReplay] = useState<BoltzmannStepTrace | null>(null);
  const [chosen, setChosen] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setReplay(await trace());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!replay) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const step = replay.steps[chosen - 1];
  const before =
    chosen === 1
      ? replay.starting_weights
      : replay.steps[chosen - 2].weights_after;

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="flex flex-wrap items-center gap-1 pb-3">
        <span className="pr-2 text-sm text-slate-600 dark:text-slate-300">
          Update
        </span>
        {replay.steps.map((one) => (
          <button
            key={one.step_number}
            onClick={() => setChosen(one.step_number)}
            className={
              one.step_number === chosen ? ACTIVE_BUTTON_CLASS : SMALL_BUTTON_CLASS
            }
          >
            {one.step_number}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-6 pb-4">
        <Rows
          title="The two rows it was shown"
          rows={FOUR_CELL_PAIR}
          note="Held here while the first count is taken."
        />
        <Rows
          title="The two rows it drew"
          rows={step.chain_visible}
          amber
          note="One alternation away, and the second count is taken on these."
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {[
                "wire",
                "counted at the rows",
                "counted after the draw",
                "difference",
                "change to the weight",
                "weight before",
                "weight after",
              ].map((heading) => (
                <th
                  key={heading}
                  className="py-2 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {step.data_correlations.flatMap((row, cell) =>
              row.map((counted, unit) => (
                <tr
                  key={`${cell}-${unit}`}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                >
                  <td className="py-1 pr-4 text-slate-700 dark:text-slate-300">
                    cell {cell + 1} to unit {unit + 1}
                  </td>
                  <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">
                    {counted.toFixed(4)}
                  </td>
                  <td className="py-1 pr-4 font-mono text-amber-600 dark:text-amber-400">
                    {step.chain_correlations[cell][unit].toFixed(4)}
                  </td>
                  <td className="py-1 pr-4 font-mono text-slate-500 dark:text-slate-400">
                    {(counted - step.chain_correlations[cell][unit]).toFixed(4)}
                  </td>
                  <td className="py-1 pr-4 font-mono text-indigo-600 dark:text-indigo-400">
                    {step.weight_change[cell][unit] >= 0 ? "+" : "−"}
                    {Math.abs(step.weight_change[cell][unit]).toFixed(4)}
                  </td>
                  <td className="py-1 pr-4 font-mono text-slate-500 dark:text-slate-400">
                    {before[cell][unit].toFixed(4)}
                  </td>
                  <td className="py-1 font-mono text-slate-800 dark:text-slate-200">
                    {step.weights_after[cell][unit].toFixed(4)}
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="The rate" value={step.learning_rate.toFixed(2)} />
        <Stat
          label="Furthest any number moved"
          value={step.largest_movement.toFixed(4)}
          note={step.largest_movement === 0 ? "nothing moved at all" : undefined}
        />
        <Stat
          label="How often each cell was lit"
          value={step.data_visible_means.map((value) => value.toFixed(1)).join(" ")}
          note={step.chain_visible_means
            .map((value) => value.toFixed(1))
            .join(" ")}
        />
        <Stat
          label="What each cell's own weight became"
          value={step.visible_bias_after
            .map((value) => value.toFixed(2))
            .join(" ")}
        />
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        The second row of the third readout is the same count taken on the rows
        the machine drew, and the fourth readout is what the cells&rsquo; own
        weights have reached after this update.
      </p>
    </div>
  );
}

function Rows({
  title,
  rows,
  note,
  amber = false,
}: {
  title: string;
  rows: number[][];
  note: string;
  amber?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </span>
      {rows.map((row, index) => (
        <CellGrid key={index} values={row} columns={row.length} amber={amber} />
      ))}
      <span className="max-w-[16rem] text-xs text-slate-500 dark:text-slate-400">
        {note}
      </span>
    </div>
  );
}
