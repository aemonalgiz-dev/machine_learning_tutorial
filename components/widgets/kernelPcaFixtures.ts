// The people every kernel PCA widget on the page shares.
//
// The ring is thirty-six people measured by height and weight, twelve of
// about one build near the middle and twenty-four around them at roughly
// thirty units out in every direction, so the fact that separates the two
// groups, how far from the typical twelve someone is, runs along no straight
// axis. The arc is the PCA page's twelve people along a bend, carried over
// so the two pages measure the same thing. The measured four are the PCA
// page's, whose centred Gram matrix is two blocks the page sums by hand.
// The ideal case is a tighter eight inside a wider sixteen, which the radial
// kernel splits across a far wider band of reaches than the ring allows.

import { Point } from "@/lib/api";
import { GramRoute, fetchGramRoute } from "@/lib/concepts/kernel-pca";

export const INNER_COUNT = 12;

export const RING: Point[] = [
  { x: 169.7, y: 60.3 },
  { x: 167.2, y: 65.1 },
  { x: 164.8, y: 69.7 },
  { x: 160.6, y: 69.2 },
  { x: 155.7, y: 68.4 },
  { x: 150.1, y: 64.6 },
  { x: 150.1, y: 61.2 },
  { x: 151.1, y: 53.9 },
  { x: 155.5, y: 50.7 },
  { x: 159.9, y: 49.4 },
  { x: 164.1, y: 52.0 },
  { x: 168.5, y: 54.5 },
  { x: 190.0, y: 58.8 },
  { x: 190.1, y: 67.8 },
  { x: 185.6, y: 74.8 },
  { x: 181.2, y: 81.6 },
  { x: 172.3, y: 85.9 },
  { x: 166.3, y: 89.0 },
  { x: 159.4, y: 89.5 },
  { x: 150.3, y: 87.3 },
  { x: 145.8, y: 87.5 },
  { x: 140.2, y: 82.1 },
  { x: 132.5, y: 75.2 },
  { x: 131.4, y: 70.0 },
  { x: 129.8, y: 62.2 },
  { x: 130.6, y: 52.1 },
  { x: 133.5, y: 44.9 },
  { x: 140.9, y: 38.2 },
  { x: 145.6, y: 33.9 },
  { x: 152.5, y: 31.8 },
  { x: 160.0, y: 30.3 },
  { x: 166.3, y: 31.9 },
  { x: 173.5, y: 31.7 },
  { x: 179.6, y: 38.4 },
  { x: 186.9, y: 45.6 },
  { x: 188.0, y: 51.0 },
];

export const ARC: Point[] = [
  { x: 120, y: 80 },
  { x: 128, y: 62 },
  { x: 136, y: 49 },
  { x: 144, y: 40 },
  { x: 152, y: 35 },
  { x: 160, y: 33 },
  { x: 168, y: 35 },
  { x: 176, y: 40 },
  { x: 184, y: 49 },
  { x: 192, y: 62 },
  { x: 200, y: 80 },
  { x: 156, y: 33 },
];

export const MEASURED_FOUR: Point[] = [
  { x: 180, y: 78 },
  { x: 160, y: 58 },
  { x: 175, y: 63 },
  { x: 165, y: 73 },
];

export const IDEAL_INNER_COUNT = 8;

export const IDEAL_CASE: Point[] = [
  { x: 162.9, y: 60.9 },
  { x: 161.7, y: 63.2 },
  { x: 158.8, y: 64.0 },
  { x: 157.1, y: 61.5 },
  { x: 156.3, y: 58.8 },
  { x: 158.6, y: 57.3 },
  { x: 161.1, y: 56.6 },
  { x: 163.7, y: 58.0 },
  { x: 190.8, y: 63.1 },
  { x: 189.5, y: 75.8 },
  { x: 180.6, y: 85.2 },
  { x: 169.1, y: 90.2 },
  { x: 156.6, y: 93.8 },
  { x: 144.4, y: 89.1 },
  { x: 135.2, y: 80.3 },
  { x: 130.3, y: 68.9 },
  { x: 126.7, y: 56.7 },
  { x: 131.4, y: 44.6 },
  { x: 140.1, y: 35.6 },
  { x: 150.2, y: 27.4 },
  { x: 163.3, y: 27.2 },
  { x: 175.1, y: 31.8 },
  { x: 184.0, y: 40.4 },
  { x: 192.1, y: 50.3 },
];

// The reaches the sliders step through, sharpest last. Evenly spaced in the
// logarithm, because the kernel's behaviour changes by ratios rather than by
// differences.
export const GAMMA_STOPS = [
  0.0003, 0.0005, 0.0008, 0.001, 0.0015, 0.002, 0.003, 0.004, 0.005, 0.007,
  0.01, 0.015, 0.02, 0.03, 0.05, 0.1,
];

export const RING_GAMMA = 0.005;
export const ARC_GAMMA = 0.002;

export const gammaIndex = (gamma: number) =>
  Math.max(0, GAMMA_STOPS.indexOf(gamma));

// A fresh ring of people: a tight inner group and a loose outer one, with the
// radii, the counts and the wobble drawn at random, so no two are alike and
// every one is the running example's shape.
export function randomRing(): { points: Point[]; innerCount: number } {
  const innerCount = 8 + Math.floor(Math.random() * 6);
  const outerCount = 14 + Math.floor(Math.random() * 10);
  const innerRadius = 5 + Math.random() * 7;
  const outerRadius = 24 + Math.random() * 10;
  const ring = (count: number, radius: number, wobble: number) =>
    Array.from({ length: count }, (_, index) => {
      const angle = (2 * Math.PI * index) / count + Math.random() * 0.4;
      const reach = radius + (Math.random() - 0.5) * wobble;
      return {
        x: Number((160 + reach * Math.cos(angle)).toFixed(1)),
        y: Number((60 + reach * Math.sin(angle)).toFixed(1)),
      };
    });
  return {
    points: [...ring(innerCount, innerRadius, 3), ...ring(outerCount, outerRadius, 6)],
    innerCount,
  };
}

// The two-route decomposition of a fixed cloud never changes, and several
// widgets read it, so it is fetched once per cloud and shared.
const gramRoutes = new Map<"four" | "arc", Promise<GramRoute>>();

export function gramRouteFor(cloud: "four" | "arc"): Promise<GramRoute> {
  const cached = gramRoutes.get(cloud);
  if (cached) return cached;
  const request = fetchGramRoute(cloud === "four" ? MEASURED_FOUR : ARC);
  gramRoutes.set(cloud, request);
  return request;
}

export const INNER = "#6366f1";
export const OUTER = "#f59e0b";
export const FIRST = "#6366f1";
export const SECOND = "#f59e0b";
export const KEPT = "#10b981";
export const LOST = "#f43f5e";

// The arc's people shaded by height, so a fold shows as the two ends sharing
// one colour on the far side of an axis.
export function heightShade(x: number): string {
  const share = Math.min(1, Math.max(0, (x - 120) / 80));
  const hue = 245 - 205 * share;
  return `hsl(${hue.toFixed(0)} 70% 50%)`;
}
