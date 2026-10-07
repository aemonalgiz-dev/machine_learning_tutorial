"use client";

// The drawing the alignment widgets share: a picture with oriented keypoints.
//
// A keypoint here has a direction, so it is drawn as a short arrow from its
// position rather than as a ring, and the arrow turns with the picture, which
// is the thing the page is about. The API computes every number; this only
// paints them.

import type { AlignedKeypoint } from "@/lib/concepts/image-alignment";
import { AGREES, CORNER, MARK, greyShade } from "./keypointDrawing";

export const INLIER = AGREES;
export const OUTLIER = MARK;
export const ARROW = CORNER;

// Pixel rectangles for one picture, offset so two can share an SVG.
export function paintedPixels(
  rows: number[][],
  cell: number,
  shiftX: number,
  shiftY = 0,
  low = 0,
  high = 1,
) {
  const shade = greyShade(low, high);
  return rows.map((row, rowIndex) =>
    row.map((value, columnIndex) => (
      <rect
        key={`${shiftX},${shiftY},${rowIndex},${columnIndex}`}
        x={shiftX + columnIndex * cell}
        y={shiftY + rowIndex * cell}
        width={cell}
        height={cell}
        fill={shade(value).fill}
      />
    )),
  );
}

// A keypoint's direction as an arrow, measured as the page measures one: from
// pointing right, turning towards pointing down.
export function Arrow({
  keypoint,
  cell,
  shiftX = 0,
  shiftY = 0,
  length = 4,
  colour = ARROW,
  faint = false,
}: {
  keypoint: AlignedKeypoint;
  cell: number;
  shiftX?: number;
  shiftY?: number;
  length?: number;
  colour?: string;
  faint?: boolean;
}) {
  const radians = (keypoint.angle_degrees * Math.PI) / 180;
  const x = shiftX + (keypoint.column + 0.5) * cell;
  const y = shiftY + (keypoint.row + 0.5) * cell;
  const tipX = x + Math.cos(radians) * length * cell;
  const tipY = y + Math.sin(radians) * length * cell;
  const headLength = 1.2 * cell;
  const headAngle = 0.5;
  return (
    <g opacity={faint ? 0.35 : 1} shapeRendering="geometricPrecision">
      <line x1={x} y1={y} x2={tipX} y2={tipY} stroke={colour} strokeWidth={Math.max(1.4, cell / 3)} />
      <polygon
        points={[
          [tipX, tipY],
          [
            tipX - headLength * Math.cos(radians - headAngle),
            tipY - headLength * Math.sin(radians - headAngle),
          ],
          [
            tipX - headLength * Math.cos(radians + headAngle),
            tipY - headLength * Math.sin(radians + headAngle),
          ],
        ]
          .map(([px, py]) => `${px},${py}`)
          .join(" ")}
        fill={colour}
      />
      <circle cx={x} cy={y} r={Math.max(1.2, cell * 0.45)} fill={colour} />
    </g>
  );
}

export function degrees(value: number): string {
  return `${value.toFixed(1)}°`;
}
