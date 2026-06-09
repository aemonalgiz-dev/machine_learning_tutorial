// The texts, widths and word pairs the hashing widgets share.
//
// Kept in one module so the playground and the collision explorer offer the
// same starting points, and so a number written into two widgets is written
// once. Nothing here is a measurement; every measured figure comes from the API.

export const RUNNING_SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";

export const GREEK_TEXT = "Η έκθεση έφτασε αργά.";

export const CHINESE_TEXT = "报告迟到了。";

export const PUBLISHED_BUCKETS = 16384;

export const TRIGRAM_BUCKETS = 8192;

export interface TextPreset {
  label: string;
  text: string;
}

export const TEXT_PRESETS: TextPreset[] = [
  { label: "the running sentence", text: RUNNING_SENTENCE },
  { label: "a sentence of Greek", text: GREEK_TEXT },
  { label: "a sentence of Chinese", text: CHINESE_TEXT },
  { label: "a capital A and one ideograph", text: "A䁁" },
];

// Widths a reader can move between, ordered so the published one sits in the
// middle of the range rather than at an end of it.
export const WIDTH_CHOICES: number[] = [32, 64, 256, 4096, 16384, 65536];

export const CHARACTER_CHOICES: string[] = ["A", "a", "z", ".", "Η", "报"];

export interface WordPair {
  label: string;
  words: string[];
}

export const WORD_PAIRS: WordPair[] = [
  { label: "cat and cats", words: ["cat", "cats"] },
  { label: "analysis and reanalysis", words: ["analysis", "reanalysis"] },
  { label: "cost and costing", words: ["cost", "costing"] },
  { label: "expect and unexpected", words: ["expect", "unexpected"] },
  { label: "cat and dog", words: ["cat", "dog"] },
  { label: "a repeated letter", words: ["aaa", "aaaa"] },
];
