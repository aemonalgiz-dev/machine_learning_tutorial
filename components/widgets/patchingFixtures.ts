// The texts the patching widgets share, so no two of them hold their own copy.
//
// Three of these are sentences the byte model behind the page counted over, and
// one is the sentence every page in this section carries, which no corpus here
// contains. Which corpus a text belongs to travels with it, since the answer to
// "where do the blocks fall" is only defined once that is settled.

import type { PatchOptions } from "@/lib/concepts/patching-without-a-vocabulary";

export interface PatchingText {
  label: string;
  text: string;
  options: PatchOptions;
}

export const REPORT_SETTINGS: PatchOptions = {
  source: "reports",
  order: 4,
  threshold: 1.0,
  smoothing: 0.001,
  patchSize: 4,
};

export const SENTENCE_SETTINGS: PatchOptions = {
  source: "one sentence",
  order: 2,
  threshold: 0.5,
  smoothing: 0.001,
  patchSize: 5,
};

export const SEEN_SENTENCE = "The report was expected on Monday.";

export const RUNNING_SENTENCE =
  "Dr. Alvarez didn't expect the low-cost re-analysis.";

export const FIXTURE_SENTENCE = "the cat sat on the mat";

export const PATCHING_TEXTS: PatchingText[] = [
  {
    label: "An Ideal Case",
    text: SEEN_SENTENCE,
    options: REPORT_SETTINGS,
  },
  {
    label: "Another It Read",
    text: "The lowest cost was the reason the report was late.",
    options: REPORT_SETTINGS,
  },
  {
    label: "The Section’s Sentence",
    text: RUNNING_SENTENCE,
    options: REPORT_SETTINGS,
  },
  {
    label: "Six Words, Repeated",
    text: FIXTURE_SENTENCE,
    options: SENTENCE_SETTINGS,
  },
];

// A patch is a run of bytes, and most byte values have nothing to show, so the
// blocks are drawn from the marks the API sends rather than from the text.
export function drawnAs(displays: string[]): string {
  return displays.join("");
}
