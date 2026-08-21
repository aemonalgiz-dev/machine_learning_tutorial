"use client";

// Readouts from the trained network, one panel per question.
//
// All three read the network trained on the whole tangled crowd with dropout
// at one half. The purposes panel asks it to predict while still thinning,
// twenty times over, and follows the one person whose chance swung most,
// beside the check that a dropout layer at rate zero is no dropout layer at
// all. The averaging panel averages four hundred thinned passes against the
// predicting pass, in the raw score the output layer answers with and again
// after the squash. The kept-zeros panel counts, in one training pass, the
// hidden readings that were exactly zero and the share of those the mask
// kept. Every number is the library's through the API.

import { useEffect, useState } from "react";
import {
  DropoutExperiment,
  failureMessage,
  fetchDropoutExperiment,
} from "@/lib/concepts/dropout";

export type ReadoutPanel = "purposes" | "averaging" | "keptZeros";

export function ExperimentReadout({ panel }: { panel: ReadoutPanel }) {
  const [experiment, setExperiment] = useState<DropoutExperiment | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setExperiment(await fetchDropoutExperiment());
      } catch (error) {
        setMessage(failureMessage(error));
      }
    })();
  }, []);

  if (!experiment) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "… the first visit trains seventy-five small networks, which takes ten to twenty seconds"}
      </p>
    );
  }

  const confusion = experiment.confusion;
  const averaging = experiment.averaging;
  const keptZeros = experiment.kept_zeros;

  if (panel === "purposes") {
    const counts = new Map<number, number>();
    for (const accuracy of confusion.training_purpose_accuracies) {
      counts.set(accuracy, (counts.get(accuracy) ?? 0) + 1);
    }
    return (
      <div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="asked while predicting" value={confusion.predicting_accuracy.toFixed(2)} />
          <Stat
            label={`asked while training, ${confusion.training_purpose_accuracies.length} times`}
            value={`${confusion.training_purpose_low.toFixed(2)} to ${confusion.training_purpose_high.toFixed(2)}`}
          />
          <Stat
            label="one person's chance of adult, thinned"
            value={`${confusion.swing_low_chance.toFixed(2)} to ${confusion.swing_high_chance.toFixed(2)}`}
          />
          <Stat
            label="that person while predicting"
            value={confusion.swing_predicting_chance.toFixed(3)}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[...counts.entries()]
            .sort((first, second) => first[0] - second[0])
            .map(([accuracy, count]) => (
              <span
                key={accuracy}
                className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {accuracy.toFixed(2)} on {count} of the calls
              </span>
            ))}
          <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            idle layer against no layer, largest output gap{" "}
            {confusion.identity_control_gap}
          </span>
        </div>
        {message && <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
      </div>
    );
  }

  if (panel === "averaging") {
    return (
      <div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="largest predicting score, in magnitude" value={averaging.largest_predicting_score.toFixed(1)} />
          <Stat label="widest gap of any one thinned pass" value={averaging.largest_single_draw_gap.toFixed(1)} />
          <Stat
            label={`widest gap of the mean over ${averaging.n_draws} passes`}
            value={averaging.largest_score_gap.toFixed(2)}
          />
          <Stat label="widest gap after the squash" value={averaging.largest_chance_gap.toFixed(3)} />
        </div>
        {message && <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="hidden readings in one pass" value={String(keptZeros.n_readings)} />
        <Stat label="exactly zero" value={String(keptZeros.n_zero)} />
        <Stat label="zero and kept by the mask" value={String(keptZeros.n_zero_and_kept)} />
      </div>
      {message && <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
