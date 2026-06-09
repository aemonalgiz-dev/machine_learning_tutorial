// The texts the splitting-on-spaces widgets share, and the one drawing helper.
//
// The first two are the same strings the API pins in its own tests, so a number
// a widget shows and a number the page quotes come from one string rather than
// from two copies of it that could drift apart.

export const RUNNING_SENTENCE =
  "Dr. Alvarez didn't expect the low-cost re-analysis.";

export const ODD_SPACING =
  "Dr.  Alvarez didn't expect\nthe low-cost re-analysis.";

export const MARKED_UP_SENTENCE =
  'She wrote "low-cost" (twice) in her notes.';

export const WITHOUT_SPACES = "我来到北京清华大学";

export const NOTHING_TO_CUT = "   ";

export const PRESETS: { label: string; text: string }[] = [
  { label: "The running sentence", text: RUNNING_SENTENCE },
  { label: "The same sentence, spaced differently", text: ODD_SPACING },
  { label: "A sentence carrying quotes and brackets", text: MARKED_UP_SENTENCE },
  { label: "Writing with no spaces in it", text: WITHOUT_SPACES },
  { label: "Nothing but spaces", text: NOTHING_TO_CUT },
];

// A space and a line break have to be drawn as something, or the gap between two
// pieces looks like nothing at all and a doubled space looks like a single one.
export function visible(text: string): string {
  return text.replace(/ /g, "␣").replace(/\n/g, "⏎").replace(/\t/g, "⇥");
}
