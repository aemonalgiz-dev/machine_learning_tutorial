// The texts the what-a-token-is widgets share, and the one drawing helper.
//
// The four texts are the same ones the API pins in its own tests, so a number
// a widget shows and a number the page quotes come from the same string. They
// live here rather than in each widget so that changing one changes both.

export const RUNNING_SENTENCE =
  "Dr. Alvarez didn't expect the low-cost re-analysis.";

export const UNSEEN_SENTENCE = "The calibration drift was larger than expected.";

export const AWKWARD_SENTENCE =
  "Dr.  Alvarez didn't expect\nthe low-cost re-analysis.";

export const ACCENTED_SENTENCE =
  "Dr. Alvarez didn't expect the low-cost re-analysis in Ångström units.";

export const PRESETS: { label: string; text: string }[] = [
  { label: "The running sentence", text: RUNNING_SENTENCE },
  { label: "A sentence with a word the table never saw", text: UNSEEN_SENTENCE },
  { label: "The same sentence, spaced differently", text: AWKWARD_SENTENCE },
  {
    label: "A sentence with letters the table never saw",
    text: ACCENTED_SENTENCE,
  },
];

// A space and a line break have to be drawn as something, or a strip of them
// looks like a strip of empty boxes.
export function visible(piece: string): string {
  return piece.replace(/ /g, "␣").replace(/\n/g, "⏎");
}
