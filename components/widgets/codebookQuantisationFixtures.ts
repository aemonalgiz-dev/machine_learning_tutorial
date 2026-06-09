// The choices every widget on the codebook page offers, in one place.
//
// The pictures and the table sizes are shared rather than repeated, so a widget
// that offers a subset of them takes a slice of these lists instead of writing
// its own. The brightnesses themselves are never here: the API builds each
// picture, cuts it into pairs and measures it, and the browser only draws.

import type { PictureName } from "@/lib/concepts/codebook-quantisation";

export interface PictureChoice {
  name: PictureName;
  label: string;
  short: string;
}

export const PICTURES: PictureChoice[] = [
  { name: "photograph", label: "the photograph", short: "photograph" },
  { name: "poster", label: "the poster", short: "poster" },
  { name: "chart", label: "the printed chart", short: "printed chart" },
  { name: "speckle", label: "the speckled square", short: "speckled square" },
];

export const TABLE_SIZES = [1, 2, 4, 8, 16, 32];

// One hue per picture, so a curve, a swatch and a scatter all agree about which
// picture is which wherever two of them sit on the same screen.
export const PICTURE_COLOURS: Record<PictureName, string> = {
  photograph: "#6366f1",
  poster: "#10b981",
  chart: "#f59e0b",
  speckle: "#ef4444",
};

export const ENTRY_COLOUR = "#e11d48";
export const PIECE_COLOUR = "#64748b";

// Brightness on 0 to 1 as a grey, for drawing a picture and its reconstruction.
export function greyOf(brightness: number): string {
  const level = Math.round(Math.max(0, Math.min(1, brightness)) * 255);
  return `rgb(${level}, ${level}, ${level})`;
}
