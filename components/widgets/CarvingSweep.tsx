"use client";

// One hidden layer of rectifiers on the crowd, at six widths.
//
// Six architectures, one to eight hidden units, each trained from six
// starting seeds for the same fixed number of epochs at the same rate. Each
// panel shows the best of its six runs as a decision region over the crowd,
// and the readouts beneath give how many of the six starts called every
// person correctly, the mean accuracy across them, and how many units ended
// switched off for the whole crowd. The first readout is the logistic
// page's straight boundary on the same people, as the control. The API
// trained every network; the browser draws the six maps.

import { useEffect, useState } from "react";
import { ApiError, Carving, carveCrowd } from "@/lib/concepts/dense-layers";
import { CarvedCrowdMap } from "./CarvedCrowdMap";
import { Stat } from "./denseLayersFixtures";

const WIDTHS = [1, 2, 3, 4, 6, 8];

export function CarvingSweep() {
  const [carvings, setCarvings] = useState<Carving[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCarvings(
          await Promise.all(WIDTHS.map((width) => carveCrowd([width]))),
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
        {message ?? "Training thirty-six networks…"}
      </p>
    );
  }

  const control = carvings[0];

  return (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Straight boundary, the control"
          value={control.straight_line_accuracy.toFixed(2)}
        />
        <Stat label="Epochs per run" value={String(control.epochs)} />
        <Stat label="Learning rate" value={String(control.learning_rate)} />
        <Stat label="Starts per width" value={String(control.runs.length)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {carvings.map((carving) => {
          const dead = carving.runs.reduce(
            (total, run) => total + run.dead_units[0],
            0,
          );
          return (
            <div
              key={carving.hidden_widths[0]}
              className="rounded-lg border border-slate-200 p-2 dark:border-slate-800"
            >
              <CarvedCrowdMap
                carving={carving}
                title={`${carving.hidden_widths[0]} hidden ${carving.hidden_widths[0] === 1 ? "unit" : "units"}, ${carving.n_parameters} parameters, best of ${carving.runs.length}`}
              />
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <Stat
                  label="best accuracy"
                  value={carving.best_accuracy.toFixed(2)}
                />
                <Stat
                  label="mean over starts"
                  value={carving.mean_accuracy.toFixed(3)}
                />
                <Stat
                  label="starts calling everyone"
                  value={`${carving.seeds_reaching_everyone} of ${carving.runs.length}`}
                />
                <Stat label="dead units, all starts" value={String(dead)} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
        A dot ringed in rose is a person the best run still called wrongly.
        The best run is the start with the most people right, and the lowest
        loss among ties.
      </p>
    </div>
  );
}
