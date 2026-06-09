// The bits every distance-and-similarity widget needs, kept in one place.
//
// The words a reader can stand at, and the colours the two topics are drawn
// in. The API decides everything numeric; this file only decides what is shown
// and in what colour.

export const WORD_CHOICES = ["sail", "oven", "rope", "the"] as const;

// What each rule is called wherever a reader sees it, so a column heading and
// the prose around it use one vocabulary. The names match the ones the API
// sends alongside every ranking; these exist for the one widget whose response
// carries readings without them.
export const PLAIN_RULE_NAMES: Record<string, string> = {
  euclidean: "straight line",
  manhattan: "summed gaps",
  chebyshev: "worst coordinate",
  cosine: "angle",
  hamming: "coordinates that differ",
  canberra: "gaps against their size",
};

export const COOKING_WORDS = [
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

export const SAILING_WORDS = [
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

export type Topic = "cooking" | "sailing" | "shared";

export function topicOf(word: string): Topic {
  if (COOKING_WORDS.includes(word)) return "cooking";
  if (SAILING_WORDS.includes(word)) return "sailing";
  return "shared";
}

export const TOPIC_COLOUR: Record<Topic, string> = {
  cooking: "#c2410c",
  sailing: "#0369a1",
  shared: "#64748b",
};

export function topicClasses(word: string): string {
  const topic = topicOf(word);
  if (topic === "cooking") {
    return "text-orange-700 dark:text-orange-300";
  }
  if (topic === "sailing") {
    return "text-sky-700 dark:text-sky-300";
  }
  return "text-slate-500 dark:text-slate-400";
}
