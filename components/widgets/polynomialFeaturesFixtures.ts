// The people every widget on the polynomial-features page shares.
//
// Twenty-two of them, measured three ways, height in centimetres, waist girth in
// centimetres and weight in kilograms, running from a 104 cm child to a 191 cm
// adult. Weight follows the two lengths the way the volume of a cylinder does,
// so the relationship bends for a reason and the term that would express it
// exactly is a product of a power.
//
// The twelve builds are a different arrangement of the same question, four
// girths at each of three heights, so that the two columns are uncorrelated and
// a cross term has something to say the powers cannot. The four people are that
// arrangement's corners, small enough to check the expansion by hand.

import { Point } from "@/lib/api";
import { PersonThreeWays } from "@/lib/concepts/polynomial-features";

export const CROWD_HEIGHTS = [
  104, 111, 118, 124, 131, 137, 143, 149, 154, 158, 162, 166, 169, 172, 175,
  178, 180, 183, 185, 187, 189, 191,
];

export const CROWD_GIRTHS = [
  49.0, 55.2, 58.2, 57.2, 60.9, 63.2, 68.5, 69.9, 74.0, 70.2, 79.6, 77.8, 80.9,
  80.5, 81.4, 84.7, 86.4, 85.6, 86.6, 89.4, 86.9, 86.4,
];

export const CROWD_WEIGHTS = [
  16.1, 18.1, 18.1, 21.7, 27.6, 29.1, 35.5, 43.6, 53.1, 45.8, 59.0, 61.1, 68.2,
  65.7, 70.9, 79.3, 79.6, 77.5, 83.9, 89.9, 88.5, 81.3,
];

export const CROWD: Point[] = CROWD_HEIGHTS.map((height, position) => ({
  x: height,
  y: CROWD_WEIGHTS[position],
}));

export const CROWD_PEOPLE: PersonThreeWays[] = CROWD_HEIGHTS.map(
  (height, position) => ({
    height,
    girth: CROWD_GIRTHS[position],
    weight: CROWD_WEIGHTS[position],
  }),
);

// Twelve people arranged as four builds at each of three heights, so height and
// girth carry no information about each other at all.
export const BUILDS: PersonThreeWays[] = [
  { height: 150, girth: 66, weight: 38.5 },
  { height: 150, girth: 76, weight: 51.6 },
  { height: 150, girth: 86, weight: 67.5 },
  { height: 150, girth: 96, weight: 83.0 },
  { height: 165, girth: 66, weight: 41.6 },
  { height: 165, girth: 76, weight: 56.9 },
  { height: 165, girth: 86, weight: 72.3 },
  { height: 165, girth: 96, weight: 90.9 },
  { height: 180, girth: 66, weight: 45.5 },
  { height: 180, girth: 76, weight: 62.2 },
  { height: 180, girth: 86, weight: 79.6 },
  { height: 180, girth: 96, weight: 100.3 },
];

// The four corners of that arrangement, for the expansion worked by hand.
export const FOUR_CORNERS = {
  heights: [150, 150, 180, 180],
  girths: [66, 96, 66, 96],
};

// A crowd measured with no scatter at all, every weight exactly what the shape
// rule says, for the reader who wants to see the fit with nothing in its way.
export const IDEAL_CROWD: Point[] = CROWD_HEIGHTS.map((height, position) => ({
  x: height,
  y: Math.round(
    5.968e-5 * height * CROWD_GIRTHS[position] * CROWD_GIRTHS[position] * 10,
  ) / 10,
}));

// Another crowd of the same kind, drawn fresh each time the button is pressed,
// so a reader can see whether a conclusion survives a different set of people.
export function anotherCrowd(): Point[] {
  return CROWD_HEIGHTS.map((height) => {
    const girth = 0.47 * height + (Math.random() - 0.5) * 6;
    const weight = 5.968e-5 * height * girth * girth + (Math.random() - 0.5) * 8;
    return { x: height, y: Math.round(weight * 10) / 10 };
  });
}

// A hyphen is not a minus sign, and the page writes the real one everywhere
// else, so every readout goes through here on its way to the screen.
function withRealMinus(text: string): string {
  return text.startsWith("-") ? `−${text.slice(1)}` : text;
}

export function formatScore(value: number, places = 4): string {
  if (!Number.isFinite(value)) return "…";
  return withRealMinus(value.toFixed(places));
}

export function formatMagnitude(value: number): string {
  if (!Number.isFinite(value)) return "…";
  if (Math.abs(value) >= 1e12 || (value !== 0 && Math.abs(value) < 0.001)) {
    return withRealMinus(value.toExponential(2));
  }
  if (Math.abs(value) >= 10000) {
    return withRealMinus(Math.round(value).toLocaleString("en-GB"));
  }
  if (Number.isInteger(value)) return withRealMinus(value.toString());
  return withRealMinus(value.toFixed(2));
}
