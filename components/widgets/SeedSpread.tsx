"use client";

// Six seeds, and the first of them run twice over.
//
// Every fit here is on the same three shapes at the same width for the same
// number of passes, so the seed is the only thing that differs. The two
// readouts underneath are the whole claim: two fits under one seed agree to the
// last bit, and two fits under different seeds hold weights more than five
// apart. The table shows what survives that, which is that each seed still
// gives the three shapes three different codes, and what does not, which is
// which unit stands for what. The API fits under every seed; the browser
// tabulates.

import { useEffect, useState } from "react";
import {
  ApiError,
  BoltzmannSeeds,
  fitBoltzmannUnderSeeds,
} from "@/lib/concepts/restricted-boltzmann-machine";
import {
  DEFAULT_EPOCHS,
  DEFAULT_HIDDEN_UNITS,
  PATTERNS,
  Stat,
  THREE_SHAPES,
} from "./boltzmannFixtures";

const SEEDS = [0, 1, 2, 3, 4, 5];

let cached: Promise<BoltzmannSeeds> | null = null;

function fitted(): Promise<BoltzmannSeeds> {
  cached ??= fitBoltzmannUnderSeeds(
    PATTERNS,
    DEFAULT_HIDDEN_UNITS,
    DEFAULT_EPOCHS,
    SEEDS,
  );
  return cached;
}

export function SeedSpread() {
  const [answer, setAnswer] = useState<BoltzmannSeeds | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await fitted());
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
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {[
                "seed",
                "gap on the shapes",
                "largest weight",
                ...THREE_SHAPES.map((entry) => `${entry.label} reads`),
                "three different codes",
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
            {answer.runs.map((run) => (
              <tr
                key={run.seed}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {run.seed}
                </td>
                <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {run.reconstruction_error.toFixed(4)}
                </td>
                <td className="py-1 pr-4 font-mono text-slate-500 dark:text-slate-400">
                  {run.largest_weight.toFixed(2)}
                </td>
                {run.codes.map((code, index) => (
                  <td
                    key={index}
                    className="py-1 pr-4 font-mono text-indigo-600 dark:text-indigo-400"
                  >
                    {code.join("")}
                  </td>
                ))}
                <td className="py-1 text-slate-600 dark:text-slate-400">
                  {run.codes_all_distinct ? "yes" : "no"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Two fits under one seed"
          value={answer.repeat_weight_gap.toFixed(1)}
          note="largest gap between matching weights"
        />
        <Stat
          label="Two fits under two seeds"
          value={
            answer.across_seed_weight_gap === null
              ? "…"
              : answer.across_seed_weight_gap.toFixed(2)
          }
          note="the same measurement"
        />
        <Stat
          label="Best and worst gap"
          value={`${Math.min(...answer.runs.map((run) => run.reconstruction_error)).toFixed(4)} to ${Math.max(...answer.runs.map((run) => run.reconstruction_error)).toFixed(4)}`}
        />
        <Stat
          label="Seeds keeping the shapes apart"
          value={`${answer.runs.filter((run) => run.codes_all_distinct).length} of ${answer.runs.length}`}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The code column for each shape is what the three hidden units read off
        it, rounded. Compare the first two rows, where the same shape is read by
        a different pair of units, and the machines are equally good at the job.
      </p>
    </div>
  );
}
