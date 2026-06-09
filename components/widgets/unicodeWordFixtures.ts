// The texts the Unicode word boundary widgets share, and the drawing helper.
//
// The first two are the same strings the API pins in its own tests, so a number
// a widget shows and a number the page quotes come from one string rather than
// from two copies of it that could drift apart.

export const RUNNING_SENTENCE =
  "Dr. Alvarez didn't expect the low-cost re-analysis.";

export const SHORT_TEXT = "Dr. Alvarez didn't";

export const A_NUMBER = "3.14 and 1,000 and 12:30";

export const JAPANESE = "アルバレス博士は驚いた";

export const A_FILE_NAME = "re-analysis_2019.csv";

export const MARKED_UP = 'She wrote "low-cost" (twice) in her notes.';

export const AN_ABBREVIATION = "The U.S. sensors arrived.";

export const PRESETS: { label: string; text: string }[] = [
  { label: "The running sentence", text: RUNNING_SENTENCE },
  { label: "An abbreviation", text: AN_ABBREVIATION },
  { label: "Numbers and a time", text: A_NUMBER },
  { label: "Quotes and brackets", text: MARKED_UP },
  { label: "A Japanese sentence", text: JAPANESE },
  { label: "A file name", text: A_FILE_NAME },
];

// A space and a line break have to be drawn as something, or a segment made of
// spacing looks like nothing at all and a doubled space looks like a single one.
export function visible(text: string): string {
  return text.replace(/ /g, "␣").replace(/\n/g, "⏎").replace(/\t/g, "⇥");
}
