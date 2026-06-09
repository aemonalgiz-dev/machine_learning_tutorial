// The fixtures the widgets on the rounding page share.
//
// The four numbers are chosen so that every case a reader needs appears once:
// one coordinate lands well inside, one lands exactly on a rung, one sits near
// the middle and one all but reaches the end. The level choices are the
// published configuration, a configuration whose counts are all even, and one
// whose counts are all odd, which is where the two rounding rules agree.

export const CHOSEN_VECTOR: readonly number[] = [1.0, -0.5, 0.2, 3.0];

export const LEVEL_CHOICES: readonly {
  label: string;
  levels: readonly number[];
}[] = [
  { label: "8, 5, 5, 5", levels: [8, 5, 5, 5] },
  { label: "4, 4, 4, 4", levels: [4, 4, 4, 4] },
  { label: "5, 5, 5, 5", levels: [5, 5, 5, 5] },
  { label: "2, 2, 2, 2", levels: [2, 2, 2, 2] },
  { label: "3, 3, 3, 3", levels: [3, 3, 3, 3] },
];
