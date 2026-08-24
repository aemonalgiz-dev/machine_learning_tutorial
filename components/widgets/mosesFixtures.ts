// The texts the Moses widgets share, and the drawing helper.
//
// The first is the same string the API pins in its own tests, so a number a
// widget shows and a number the page quotes come from one string rather than
// from two copies of it that could drift apart.

export const RUNNING_SENTENCE =
  "Dr. Alvarez didn't expect the low-cost re-analysis.";

export const QUOTED_SENTENCE =
  '"Dr. Alvarez didn\'t expect the low-cost re-analysis," she wrote.';

export const ENDS_IN_AN_ABBREVIATION =
  "The re-analysis was signed by Okafor Co.";

export const UNLISTED_ABBREVIATION = "Gov. Reyes asked for the figures.";

export const A_FIGURE_AFTER_THE_STOP = "No. 5 shows the drift.";

export const A_SENTENCE_AFTER_THE_STOP = "No. Nothing shows the drift.";

export const TWO_SENTENCES = "The drift was small. It did not go away.";

export const NUMBERS =
  "Prof. Nakamura said the drift was 5,300 parts per million, not 1,000.";

export const A_FRENCH_ARTICLE = "l'analyse des capteurs";

export const PRESETS: { label: string; text: string }[] = [
  { label: "The running sentence", text: RUNNING_SENTENCE },
  { label: "The same sentence, quoted", text: QUOTED_SENTENCE },
  { label: "Ending in an abbreviation", text: ENDS_IN_AN_ABBREVIATION },
  { label: "An abbreviation nobody listed", text: UNLISTED_ABBREVIATION },
  { label: "A figure after the stop", text: A_FIGURE_AFTER_THE_STOP },
  { label: "A sentence after the stop", text: A_SENTENCE_AFTER_THE_STOP },
  { label: "Two sentences in one text", text: TWO_SENTENCES },
  { label: "Figures and marks", text: NUMBERS },
  { label: "A French article", text: A_FRENCH_ARTICLE },
];

// A space has to be drawn as something, or a piece made of spacing looks like
// nothing at all and a doubled space looks like a single one.
export function visible(text: string): string {
  return text.replace(/ /g, "␣").replace(/\n/g, "⏎").replace(/\t/g, "⇥");
}
