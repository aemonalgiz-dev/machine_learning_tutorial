// The pictures the pooling page carries from its first paragraph to its last.
//
// One four by four patch, chosen so its four windows of two sum to 12, 8, 4 and
// 16 and each holds a single largest value, which is what makes both kinds
// checkable with a pencil. One eight by eight lit along a single column, for
// watching what a sideways nudge does. One flat patch where every window is a
// four-way tie. And a seeded random patch, so the reader can leave the arranged
// numbers behind without leaving the page.

import { Grid } from "@/lib/concepts/pooling";

export const PATCH_SIDE = 4;
export const STROKE_SIDE = 8;

// The patch. Under a window of two at a stride of two a maximum answers
// [[5, 4], [2, 7]] and an average answers [[3, 2], [1, 4]].
export const PATCH: Grid = [
  [1, 5, 1, 3],
  [4, 2, 4, 0],
  [0, 1, 3, 1],
  [2, 1, 7, 5],
];

// The patch's top-left window, the four cells the page differentiates by hand.
export const TOP_LEFT_WINDOW: Grid = [
  [1, 5],
  [4, 2],
];

// Sixteen equal cells, where the maximum of every window is a four-way tie.
export const FLAT_PATCH: Grid = Array.from({ length: PATCH_SIDE }, () =>
  Array.from({ length: PATCH_SIDE }, () => 5),
);

export const STROKE_COLUMN = 2;
export const STROKE_VALUE = 9;

// One bright column on an eight by eight. It starts in the third column, so
// under a window of two at a stride of two one nudge keeps it inside the same
// windows and two carry it across a boundary.
export function verticalStroke(column: number = STROKE_COLUMN): Grid {
  return Array.from({ length: STROKE_SIDE }, () =>
    Array.from({ length: STROKE_SIDE }, (_, position) =>
      position === column ? STROKE_VALUE : 0,
    ),
  );
}

// A patch of whole numbers from zero to nine, drawn from a seeded generator so
// the same click gives a different picture and no click gives a surprise the
// endpoint would refuse.
export function randomPatch(side: number, seed: number): Grid {
  let state = (seed * 2654435761) % 2147483647;
  const next = () => {
    state = (state * 48271) % 2147483647;
    return state / 2147483647;
  };
  return Array.from({ length: side }, () =>
    Array.from({ length: side }, () => Math.floor(next() * 10)),
  );
}
