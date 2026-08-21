// The chains and the arrangements every widget on the shape page shares.
//
// One running example throughout: a grey picture of a handwritten digit,
// twenty-eight rows by twenty-eight columns and one channel, which is the
// picture the postal networks read. The deep chain is what a reader would
// actually build over it, and the small chain is the same idea at a size a
// pencil can follow. Both live here rather than in the widgets, so a number
// the page quotes cannot drift between two copies of the same list.

import { LayerSpec } from "@/lib/concepts/shapes-and-flattening";

// The picture the whole page is about, as the first layer's own reads.
export const DIGIT_PICTURE = [1, 28, 28];

// The small square the derivation is worked over by hand.
export const SMALL_PICTURE = [1, 8, 8];

// Two convolutions each followed by a pooling layer, a bridge, and two dense
// layers. Every extent in it is computed by the API from these settings.
export const DEEP_CHAIN: LayerSpec[] = [
  {
    kind: "conv",
    reads: DIGIT_PICTURE,
    n_filters: 8,
    kernel_size: 3,
    stride: 1,
    padding: 0,
  },
  { kind: "pool", reads: null, summary: "max", window: 2, stride: 2 },
  {
    kind: "conv",
    reads: null,
    n_filters: 16,
    kernel_size: 3,
    stride: 1,
    padding: 0,
  },
  { kind: "pool", reads: null, summary: "max", window: 2, stride: 2 },
  { kind: "flatten", reads: null },
  { kind: "dense", reads: null, n_neurons: 32 },
  { kind: "dense", reads: null, n_neurons: 10 },
];

// The same chain with the bridge taken out, which is the mistake the page is
// named for at the scale a reader would meet it.
export const DEEP_CHAIN_WITHOUT_THE_BRIDGE: LayerSpec[] = DEEP_CHAIN.filter(
  (layer) => layer.kind !== "flatten",
);

// The four-layer chain small enough to check with a pencil.
export const SMALL_CHAIN: LayerSpec[] = [
  {
    kind: "conv",
    reads: SMALL_PICTURE,
    n_filters: 4,
    kernel_size: 3,
    stride: 1,
    padding: 0,
  },
  { kind: "pool", reads: null, summary: "max", window: 2, stride: 2 },
  { kind: "flatten", reads: null },
  { kind: "dense", reads: null, n_neurons: 10 },
];

export const SMALL_CHAIN_WITHOUT_THE_BRIDGE: LayerSpec[] = SMALL_CHAIN.filter(
  (layer) => layer.kind !== "flatten",
);

// The seams the join widget offers, each one a case the page names.
export interface SeamFixture {
  label: string;
  beneath: number[];
  above: number[];
}

export const SEAMS: SeamFixture[] = [
  {
    label: "the first convolution against a dense layer",
    beneath: [8, 26, 26],
    above: [5408],
  },
  {
    label: "the same picture against a bridge that reads it",
    beneath: [8, 26, 26],
    above: [8, 26, 26],
  },
  {
    label: "the same count with the channels moved",
    beneath: [8, 26, 26],
    above: [26, 8, 26],
  },
  {
    label: "the same count halved and doubled",
    beneath: [8, 26, 26],
    above: [4, 52, 26],
  },
  {
    label: "the picture width, which the counts also refuse",
    beneath: [8, 26, 26],
    above: [784],
  },
  {
    label: "the small chain, where the bridge is missing",
    beneath: [4, 3, 3],
    above: [36],
  },
  { label: "two rows of one width", beneath: [36], above: [36] },
  { label: "two rows of different widths", beneath: [36], above: [10] },
];

// The shapes the extent probe offers, including the two the library refuses.
export interface ShapeFixture {
  label: string;
  reads: number[];
  answers: number[];
}

export const STATED_SHAPES: ShapeFixture[] = [
  {
    label: "the first convolution of the digit chain",
    reads: DIGIT_PICTURE,
    answers: [8, 26, 26],
  },
  {
    label: "a row of the same 5408 numbers",
    reads: [5408],
    answers: [10],
  },
  {
    label: "eight numbers arranged, which is not a row of eight",
    reads: [2, 2, 2],
    answers: [8],
  },
  { label: "a height of zero", reads: [1, 0, 28], answers: [10] },
  { label: "a negative width", reads: [1, 28, -1], answers: [10] },
  { label: "a side with no extents at all", reads: [], answers: [10] },
];

// One square layer, its one step's worth of data, and the rate it moves at.
// Square because it stands at two positions of one chain, so it has to read
// exactly what it answers with.
export const SHARED_LAYER = {
  weights: [
    [1.0, 0.5],
    [-0.5, 2.0],
  ],
  biases: [0.0, 0.0],
  rows: [
    [1.0, 2.0],
    [3.0, -1.0],
  ],
  targets: [
    [0.0, 0.0],
    [1.0, 1.0],
  ],
};

// Numbers a layer might be handed if anything here took indices. The last two
// are the consecutive whole numbers float64 stops being able to tell apart,
// sent as text so the browser's own numbers do not lose them first.
export const INDEX_LIKE_NUMBERS = [
  "0",
  "3",
  "-1",
  "9007199254740992",
  "9007199254740993",
];

export const NOT_WHOLE_NUMBERS = [2.9999999999999996, -1.5];
