"use client";

// The creases one hidden layer of rectifiers put into the plane.
//
// Each hidden rectifier reads a weighted sum of height and weight, answers
// zero on one side of the line where that sum is zero and the sum itself on
// the other, so the output neuron's answer is flat on one side of each line
// and tilts on the other. The lines are drawn over the best run's decision
// region for the chosen width, dashed where the unit never switched on for
// anyone, and the table gives each unit's weights and bias in the
// standardised units the network read. The API trained the network; the
// browser converts each crease into the picture's own units and draws it.

import { useEffect, useState } from "react";
import { ApiError, Carving, carveCrowd } from "@/lib/concepts/dense-layers";
import { CarvedCrowdMap } from "./CarvedCrowdMap";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  Stat,
  show,
} from "./denseLayersFixtures";

const WIDTHS = [2, 3, 4, 6];

export function FoldLines() {
  const [width, setWidth] = useState(3);
  const [carving, setCarving] = useState<Carving | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const answer = await carveCrowd([width]);
        if (!cancelled) setCarving(answer);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [width]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {WIDTHS.map((candidate) => (
          <button
            key={candidate}
            onClick={() => setWidth(candidate)}
            className={candidate === width ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
          >
            {`${candidate} units`}
          </button>
        ))}
      </div>
      {!carving ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {message ?? "…"}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-[300px_1fr]">
          <CarvedCrowdMap
            carving={carving}
            folds
            title={`${carving.hidden_widths[0]} creases, seed ${carving.best_seed}`}
          />
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                    {["unit", "weight on height", "weight on weight", "bias", "switched on"].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {carving.folds.map((fold, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                    >
                      <td className="py-1 pr-3 font-mono text-slate-700 dark:text-slate-300">
                        {`h${index + 1}`}
                      </td>
                      <td className="py-1 pr-3 font-mono text-slate-800 dark:text-slate-200">
                        {show(fold.weight_height)}
                      </td>
                      <td className="py-1 pr-3 font-mono text-slate-800 dark:text-slate-200">
                        {show(fold.weight_weight)}
                      </td>
                      <td className="py-1 pr-3 font-mono text-slate-800 dark:text-slate-200">
                        {show(fold.bias)}
                      </td>
                      <td className="py-1 pr-3 text-slate-700 dark:text-slate-300">
                        {fold.dead ? "never, for anyone" : "for someone"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Stat label="best run's accuracy" value={carving.best_accuracy.toFixed(2)} />
              <Stat
                label="its final loss"
                value={carving.runs[carving.best_seed].final_loss.toFixed(4)}
              />
              <Stat label="parameters" value={String(carving.n_parameters)} />
              <Stat
                label="people still wrong"
                value={String(
                  carving.people.filter((person) => person.is_adult !== person.called_adult).length,
                )}
              />
            </div>
          </div>
        </div>
      )}
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
        Weights are in standard units, so a weight on height of 5 means one
        deviation of height, 15.6 centimetres, moves the unit&rsquo;s score
        by five. The boundary can only bend where a crease crosses it.
      </p>
    </div>
  );
}
