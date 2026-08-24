// The texts the bytes-and-characters widgets share, and the drawing helper.
//
// They are the same strings the API pins in its own tests, so a number a widget
// shows and a number the page quotes come from one place. They live here rather
// than in each widget so that changing one changes every widget at once.

export const RUNNING_SENTENCE =
  "Dr. Alvarez didn't expect the low-cost re-analysis.";

export const ACCENTED_SENTENCE =
  "Dr. Alvarez didn't expect the low-cost re-analysis in Ångström units.";

export const GREEK_SENTENCE = "Η έκθεση έφτασε αργά.";

// The three texts the two comparison panels both read, in one order.
export const THREE_TEXTS = [
  { label: "the running sentence", text: RUNNING_SENTENCE },
  { label: "two letters the corpus never used", text: ACCENTED_SENTENCE },
  { label: "a script the corpus never met", text: GREEK_SENTENCE },
];

export const PRESETS: { label: string; text: string }[] = [
  { label: "The running sentence", text: RUNNING_SENTENCE },
  { label: "Two letters the corpus never used", text: ACCENTED_SENTENCE },
  { label: "A script the corpus never met", text: GREEK_SENTENCE },
  { label: "One sentence of Chinese", text: "报告迟到了。" },
  { label: "One raised thumb", text: "👍" },
];

// A space and a line break have to be drawn as something, or a strip of them
// looks like a strip of empty boxes.
export function visible(piece: string): string {
  return piece.replace(/ /g, "␣").replace(/\n/g, "⏎");
}
