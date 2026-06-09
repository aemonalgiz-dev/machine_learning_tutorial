"use client";

// One layer of six against two layers of three, at the same parameter count.
//
// Two inputs into six rectifiers into one output is twenty-five numbers, and
// so is two inputs into three into three into one, so the two architectures
// can be set against each other with nothing but the arrangement changed.
// Two layers of six sit beside them as the case with room to spare. Each
// column shows the best run's region and every start's accuracy and final
// loss, so the reader can see both what each arrangement can reach and how
// often this loop reaches it. The API trained all eighteen networks.

import { useEffect, useState } from "react";
import { ApiError, Carving, carveCrowd } from "@/lib/concepts/dense-layers";
import { CarvedCrowdMap } from "./CarvedCrowdMap";
import { Stat } from "./denseLayersFixtures";

const ARCHITECTURES: { widths: number[]; title: string }[] = [
  { widths: [6], title: "2 → 6 → 1, one hidden layer" },
  { widths: [3, 3], title: "2 → 3 → 3 → 1, two hidden layers" },
  { widths: [6, 6], title: "2 → 6 → 6 → 1, two wide layers" },
];

export function WidthAgainstDepth() {
  const [carvings, setCarvings] = useState<Carving[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCarvings(
          await Promise.all(
            ARCHITECTURES.map((architecture) => carveCrowd(architecture.widths)),
          ),
        );
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!carvings) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "Training eighteen networks…"}
      </p>
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {carvings.map((carving, index) => (
          <div
            key={index}
            className="rounded-lg border border-slate-200 p-2 dark:border-slate-800"
          >
            <CarvedCrowdMap
              carving={carving}
              title={`${ARCHITECTURES[index].title}, ${carving.n_parameters} parameters`}
            />
            <table className="mt-2 w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                  {["start", "accuracy", "loss", "dead"].map((heading) => (
                    <th
                      key={heading}
                      className="py-1 pr-2 font-semibold text-slate-600 dark:text-slate-400"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {carving.runs.map((run) => (
                  <tr
                    key={run.seed}
                    className={`border-b border-slate-100 last:border-0 dark:border-slate-800/60 ${
                      run.seed === carving.best_seed ? "font-semibold" : ""
                    }`}
                  >
                    <td className="py-0.5 pr-2 font-mono text-slate-700 dark:text-slate-300">
                      {run.seed}
                    </td>
                    <td
                      className={`py-0.5 pr-2 font-mono ${
                        run.accuracy === 1
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {run.accuracy.toFixed(2)}
                    </td>
                    <td className="py-0.5 pr-2 font-mono text-slate-800 dark:text-slate-200">
                      {run.final_loss.toFixed(4)}
                    </td>
                    <td className="py-0.5 pr-2 font-mono text-slate-800 dark:text-slate-200">
                      {run.dead_units.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <Stat
                label="starts calling everyone"
                value={`${carving.seeds_reaching_everyone} of ${carving.runs.length}`}
              />
              <Stat label="mean accuracy" value={carving.mean_accuracy.toFixed(3)} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
        The dead column counts, per hidden layer, the units that never
        switched on for anyone in the crowd by the end of the run. The bold
        row is the start whose region is drawn.
      </p>
    </div>
  );
}
