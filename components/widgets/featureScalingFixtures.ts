// The people and the columns every feature-scaling widget on the page shares.
//
// The crowd is the classification pages' crowd, eleven people by height in
// centimetres and weight in kilograms, five children and six adults. Its
// height column is the one column the page puts through five rulers, with
// and without one person's height typed in millimetres by mistake. The five
// readings are the set the page sums by hand, chosen so every centre and
// spread comes out whole.

import { LabelledPoint } from "@/lib/api";

export const CROWD: LabelledPoint[] = [
  { x: 147, y: 41, label: 0 },
  { x: 156, y: 53, label: 1 },
  { x: 145, y: 57, label: 0 },
  { x: 159, y: 57, label: 1 },
  { x: 162, y: 61, label: 1 },
  { x: 120, y: 25, label: 0 },
  { x: 122, y: 28, label: 0 },
  { x: 118, y: 24, label: 0 },
  { x: 180, y: 80, label: 1 },
  { x: 183, y: 83, label: 1 },
  { x: 178, y: 78, label: 1 },
];

export const CROWD_HEIGHTS: number[] = CROWD.map((person) => person.x);

// The person the unit decides. At 150 cm and 60 kg the vote is a child when
// heights are in millimetres and an adult otherwise.
export const DECIDED_QUERY = { x: 150, y: 60 };

// The neighbours page's own query, whose three nearest sit at 5, 10 and 13.
export const NEIGHBOURS_QUERY = { x: 150, y: 45 };

// Five whole numbers whose every centre and spread comes out whole.
export const FIVE_READINGS = [9, 19, 24, 29, 39];

// The same five with the largest dragged far to the right.
export const WITH_AN_OUTLIER = [9, 19, 24, 29, 99];

// Fifteen heights spread evenly about 160, no tails, so all five rulers
// agree about where the middle is and nearly agree about the spread.
export const IDEAL_HEIGHTS = [
  132, 136, 140, 144, 148, 152, 156, 160, 164, 168, 172, 176, 180, 184, 188,
];

export function randomHeights(): number[] {
  return Array.from({ length: 15 }, () =>
    Math.round(120 + Math.random() * 70),
  );
}

// Which person's height is typed in millimetres. The tallest keeps every rank
// where it was; a middle person moves the median by one rank.
export const TALLEST_INDEX = 9;
export const MIDDLE_INDEX = 0;

export const CHILD = "#f59e0b";
export const ADULT = "#6366f1";
export const QUERY = "#10b981";
