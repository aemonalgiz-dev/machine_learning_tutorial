// Shared constants for the a-vector-for-a-word widgets.
//
// No numbers live here: every quantity the widgets draw comes from the API.
// What is shared is which words belong to which topic, so a picture can colour
// them, and the palette the page uses throughout.

export const COOKING_WORDS: readonly string[] = [
  "flour",
  "sugar",
  "butter",
  "eggs",
  "oven",
  "bake",
  "stir",
  "whisk",
  "dough",
  "pan",
];

export const SAILING_WORDS: readonly string[] = [
  "sail",
  "wind",
  "boat",
  "harbour",
  "anchor",
  "tide",
  "mast",
  "rope",
  "deck",
  "crew",
];

export const SHARED_WORDS: readonly string[] = ["and", "the", "we"];

export type Topic = "cooking" | "sailing" | "shared";

export function topicOf(word: string): Topic {
  if (COOKING_WORDS.includes(word)) return "cooking";
  if (SAILING_WORDS.includes(word)) return "sailing";
  return "shared";
}

export const COOKING_COLOUR = "#d97706";
export const SAILING_COLOUR = "#0ea5e9";
export const SHARED_COLOUR = "#94a3b8";
export const ACCENT = "#4f46e5";
export const CONTRAST = "#db2777";

export function colourOf(word: string): string {
  const topic = topicOf(word);
  if (topic === "cooking") return COOKING_COLOUR;
  if (topic === "sailing") return SAILING_COLOUR;
  return SHARED_COLOUR;
}

// The word the page stands at whenever it needs one, and the one it uses to
// show a question the vocabulary cannot answer.
export const HOME_WORD = "sail";
export const ABSENT_WORD = "kettle";
