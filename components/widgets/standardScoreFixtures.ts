// The columns every standard score widget on the page shares.
//
// The orchard itself is fetched from the API, since the API owns the twenty-four
// trees and the numbers they teach. What lives here is only what the playground
// offers as alternatives to the orchard's own trunk girths: the five saplings
// the page sums by hand, an evenly spread column with no tails at all, a column
// with one stray digit in it, and a freshly drawn orchard for the reader who
// wants to see the arithmetic run on something nobody chose.

// Five saplings, chosen so the mean and every squared deviation are whole.
export const NURSERY_ROW = [210, 210, 260, 160, 310];

// Fifteen girths spaced evenly, which is the tidiest column a real orchard
// could plausibly produce and the one the two promises are easiest to read on.
export const EVEN_ROW = [
  160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 480, 512, 544, 576, 608,
];

// The same fifteen with one trunk typed with a stray digit.
export const MISTYPED_ROW = [
  160, 192, 224, 256, 288, 320, 3520, 384, 416, 448, 480, 512, 544, 576, 608,
];

export function randomGirths(): number[] {
  return Array.from({ length: 18 }, () =>
    Math.round(180 + Math.random() * 440),
  );
}

export const GIRTH_COLOUR = "#6366f1";
export const WATER_COLOUR = "#0ea5e9";
export const HIGHLIGHT_COLOUR = "#f59e0b";
