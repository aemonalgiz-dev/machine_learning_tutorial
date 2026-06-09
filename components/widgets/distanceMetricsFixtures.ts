// The people every distance-metrics widget shares.
//
// The borderline case is the k-nearest page's crowd, five children and six
// adults, with a query whose nearest three sit at Euclidean distances 5, 10
// and 13, and the pair the page works by hand is that query against its
// nearest person, a gap of 3 and 4. The ideal case is two well-separated
// clumps with the query deep inside one, so every metric agrees. The three
// of one height are the people cosine fails the triangle inequality on. The
// random crowd is drawn in the browser, since it is input and not a
// measurement.

import { LabelledPoint, Point } from "@/lib/api";

export const WORKED_PEOPLE: LabelledPoint[] = [
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

export const WORKED_QUERY: Point = { x: 150, y: 45 };

export const WORKED_NEAREST: Point = { x: 147, y: 41 };

export const CROWD: Point[] = WORKED_PEOPLE.map(({ x, y }) => ({ x, y }));

export const IDEAL_PEOPLE: LabelledPoint[] = [
  { x: 118, y: 24, label: 0 },
  { x: 120, y: 27, label: 0 },
  { x: 122, y: 25, label: 0 },
  { x: 124, y: 29, label: 0 },
  { x: 119, y: 30, label: 0 },
  { x: 125, y: 26, label: 0 },
  { x: 121, y: 32, label: 0 },
  { x: 126, y: 31, label: 0 },
  { x: 117, y: 28, label: 0 },
  { x: 176, y: 74, label: 1 },
  { x: 179, y: 78, label: 1 },
  { x: 182, y: 76, label: 1 },
  { x: 185, y: 80, label: 1 },
  { x: 178, y: 82, label: 1 },
  { x: 183, y: 84, label: 1 },
  { x: 180, y: 72, label: 1 },
  { x: 186, y: 77, label: 1 },
];

export const IDEAL_QUERY: Point = { x: 122, y: 28 };

// Three people of one height, 45, 52 and 60 kilograms. Every p-norm makes
// the two legs by way of the middle one sum to the direct route exactly;
// cosine makes them sum to half of it.
export const SAME_HEIGHT_TRIPLE: [Point, Point, Point] = [
  { x: 150, y: 45 },
  { x: 150, y: 60 },
  { x: 150, y: 52 },
];

// The query, an adult from the far clump, and the query's nearest person as
// the way station, which is a triple cosine passes.
export const OFF_LINE_TRIPLE: [Point, Point, Point] = [
  { x: 150, y: 45 },
  { x: 180, y: 80 },
  { x: 147, y: 41 },
];

// Pairs whose first column is a colour code, 0, 1 or 2, beside a size of
// 5, so the only question is whether the codes agree.
export const CODE_PAIRS = [
  { label: "codes two apart", first: { x: 0, y: 5 }, second: { x: 2, y: 5 } },
  { label: "codes one apart", first: { x: 0, y: 5 }, second: { x: 1, y: 5 } },
  { label: "the same code", first: { x: 0, y: 5 }, second: { x: 0, y: 5 } },
  {
    label: "0.3 against 0.1 + 0.2",
    first: { x: 0.3, y: 5 },
    second: { x: 0.1 + 0.2, y: 5 },
  },
];

// Pairs of counts, a rare thing beside a common one, so a gap of one means
// something different in each column.
export const COUNT_PAIRS = [
  {
    label: "from zero to one",
    first: { x: 0, y: 100 },
    second: { x: 1, y: 101 },
  },
  {
    label: "from one to two",
    first: { x: 1, y: 100 },
    second: { x: 2, y: 101 },
  },
  {
    label: "a thousandth to two thousandths",
    first: { x: 0.001, y: 100 },
    second: { x: 0.002, y: 101 },
  },
  { label: "zero against zero", first: { x: 0, y: 0 }, second: { x: 0, y: 1 } },
];

export function randomCrowd(): LabelledPoint[] {
  const around = (
    centreX: number,
    centreY: number,
    label: number,
    count: number,
  ): LabelledPoint[] =>
    Array.from({ length: count }, () => ({
      x: Math.round(centreX + (Math.random() - 0.5) * 44),
      y: Math.round(centreY + (Math.random() - 0.5) * 38),
      label,
    }));
  return [...around(137, 40, 0, 8), ...around(163, 62, 1, 8)];
}

// Three significant figures, so 5 reads as 5.00, 13 as 13.0 and a cosine
// distance of 0.000189 keeps the digits that distinguish it from its
// neighbours.
export function formatDistance(value: number): string {
  return value.toPrecision(3);
}
