// The fixtures the Markov chains widgets share.
//
// The texts themselves live in the API, since every chain on the page is
// counted there. What lives here is the one short text a reader can check with a
// pencil, the size of the book the random passage is drawn from, and the
// settings the playground offers, so two widgets never disagree about them.

// Alice calling her cat, from the third chapter. Thirteen letters once the
// spaces go, and twelve steps between them.
export const ALICE_CALLING_HER_CAT = "oh my dear dinah";

// How many sentences the first three chapters hold, and how many consecutive
// sentences the random passage takes from them.
export const ALICE_SENTENCE_COUNT = 189;
export const RUN_LENGTH = 6;

// The smoothings the playground's slider steps through. Zero is the counted
// table as it stands; two is past the point where a short text's rows go flat.
export const PLAYGROUND_SMOOTHINGS = [0, 0.1, 0.5, 1, 2];

// The furthest ahead the playground walks.
export const PLAYGROUND_MAX_STEPS = 20;
