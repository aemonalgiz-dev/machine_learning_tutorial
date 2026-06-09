// The texts the widgets of the pattern page offer, in one place.
//
// The first is the sentence every page in this part of the site carries. The
// rest are chosen because each one reaches a branch or a failure the page
// argues about: doubled spacing for the branch that holds a space back, a
// sentence in capitals for the case the seven listed spellings miss, a file
// name for the underscore, a figure and a fraction for the two character
// classes, and a sentence in a script that writes no spaces at all.

export interface PatternFixture {
  name: string;
  text: string;
  note: string;
}

export const PATTERN_FIXTURES: PatternFixture[] = [
  {
    name: "The running sentence",
    text: "Dr. Alvarez didn't expect the low-cost re-analysis.",
    note: "the sentence carried across this part of the site",
  },
  {
    name: "The same, spaced out",
    text: "Dr.  Alvarez  didn't  expect the low-cost re-analysis.",
    note: "two spaces where there was one, which is what the eleventh branch is for",
  },
  {
    name: "A line of notes",
    text: "drift\t0.42\nresidual\t0.07",
    note: "tabs and a line break, which no branch with an optional space can claim",
  },
  {
    name: "Shouted",
    text: "THE DRIFT DIDN'T GO AWAY",
    note: "the same contraction in capitals, which the seven spellings miss",
  },
  {
    name: "A file name",
    text: "re-analysis_2019.csv was signed by Alvarez",
    note: "an underscore, a hyphen and a stop inside one run of characters",
  },
  {
    name: "A figure and a fraction",
    text: "the drift was 1½ per cent of 2019 counts",
    note: "the two characters the published classes and the ones here disagree about",
  },
  {
    name: "A script with no spaces",
    text: "低コストの再分析",
    note: "writing with nothing between its words, where the pattern has nothing to find",
  },
];

export const PATTERN_CHOICES: { key: string; name: string }[] = [
  { key: "the-pattern", name: "the pattern" },
  { key: "without-the-contractions", name: "no contraction branches" },
  { key: "without-the-optional-space", name: "no optional space" },
  { key: "without-the-held-back-space", name: "no held back space" },
  { key: "words-and-marks", name: "words and marks" },
  { key: "runs-with-no-spaces", name: "runs with no spaces" },
  { key: "letters-only", name: "letters only" },
];
