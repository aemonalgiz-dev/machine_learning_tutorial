// The texts the Penn Treebank widgets share, and the drawing helper.
//
// The first two are the same strings the API pins in its own tests, so a number
// a widget shows and a number the page quotes come from one string rather than
// from two copies of it that could drift apart.

export const RUNNING_SENTENCE =
  "Dr. Alvarez didn't expect the low-cost re-analysis.";

export const QUOTED_SENTENCE =
  '"Dr. Alvarez didn\'t expect the low-cost re-analysis," she wrote.';

export const TWO_SENTENCES = "The drift was small. It did not go away.";

export const ENDS_IN_AN_ABBREVIATION = "The analysis was run by Alvarez et al.";

export const NUMBERS = "It cost 1,000 at 3:30, or about 3.14% of $5,000,000.";

export const BRACKETED = "The U.S. Navy (est. 1775) bought 1,000 ships.";

export const NOT_PROSE = "e-mail me at a@b.com #now";

export const PRESETS: { label: string; text: string }[] = [
  { label: "The running sentence", text: RUNNING_SENTENCE },
  { label: "The same sentence, quoted", text: QUOTED_SENTENCE },
  { label: "Two sentences in one text", text: TWO_SENTENCES },
  { label: "Ending in an abbreviation", text: ENDS_IN_AN_ABBREVIATION },
  { label: "Numbers and marks", text: NUMBERS },
  { label: "Brackets", text: BRACKETED },
  { label: "Writing that is not prose", text: NOT_PROSE },
];

// A space has to be drawn as something, or a piece made of spacing looks like
// nothing at all and a doubled space looks like a single one.
export function visible(text: string): string {
  return text.replace(/ /g, "␣").replace(/\n/g, "⏎").replace(/\t/g, "⇥");
}
