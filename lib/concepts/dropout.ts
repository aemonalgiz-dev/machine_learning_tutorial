// The dropout page's one endpoint. A row of unit values is pushed through a
// seeded dropout layer, once while predicting and many times while training,
// and everything the widget draws comes back from that one run.

import { ApiError, postJson } from "@/lib/api";

// What the endpoint answers. `scale` is one over the keep probability, the
// factor every survivor is multiplied by. `mask` is the first draw's scaled
// mask as the library carried it, `scale` where a unit survived and zero
// where it did not, and `kept` is that mask read as a flag. `running_means`
// holds the mean so far of every unit's training output after each draw, so
// its last row is `mean_output`, and `times_kept` counts each unit's
// survivals across the draws, read from the masks and never from the
// outputs.
export interface DropoutApplication {
  scale: number;
  training_output: number[];
  mask: number[];
  kept: boolean[];
  predicting_output: number[];
  n_draws: number;
  times_kept: number[];
  running_means: number[][];
  mean_output: number[];
  largest_gap: number;
}

export async function applyDropout(
  values: number[],
  dropProbability: number,
  randomSeed: number,
  drawCount: number,
): Promise<DropoutApplication> {
  return postJson<DropoutApplication>("/concepts/dropout/apply", {
    values,
    drop_probability: dropProbability,
    random_seed: randomSeed,
    n_draws: drawCount,
  });
}

// The sentence the widget shows when a request fails, the API's own when it
// refused the ask, and a plain one for anything else.
export function failureMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
