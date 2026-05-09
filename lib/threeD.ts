// A small hand-rolled 3D projection for the site's rotatable pictures.
//
// No library is brought in for this, deliberately. The rotation is two of the
// linear algebra primer's own matrices applied one after the other, a turn
// about the vertical axis and then a tilt toward the viewer, followed by an
// orthographic drop of the depth coordinate. Every widget maps its data into
// the [-1, 1] cube first, so one projector serves them all. Depth comes back
// with each projected point so a widget can paint far things first.

export interface Point3 {
  x: number;
  y: number;
  z: number;
}

export interface Projected {
  px: number;
  py: number;
  depth: number;
}

export interface Orbit {
  yaw: number;
  pitch: number;
}

// Project a point from the [-1, 1] cube onto the screen square.
export function project(
  point: Point3,
  orbit: Orbit,
  half: number,
  scale: number,
): Projected {
  const cosYaw = Math.cos(orbit.yaw);
  const sinYaw = Math.sin(orbit.yaw);
  const cosPitch = Math.cos(orbit.pitch);
  const sinPitch = Math.sin(orbit.pitch);

  const turnedX = point.x * cosYaw - point.y * sinYaw;
  const turnedY = point.x * sinYaw + point.y * cosYaw;

  const depth = turnedY * cosPitch - point.z * sinPitch;
  const up = turnedY * sinPitch + point.z * cosPitch;

  return {
    px: half + turnedX * scale,
    py: half - up * scale,
    depth,
  };
}

// Map a value from [low, high] to [-1, 1].
export function toCube(value: number, low: number, high: number): number {
  if (high === low) return 0;
  return ((value - low) / (high - low)) * 2 - 1;
}

// The twelve edges of the [-1, 1] cube, for drawing the frame.
export const CUBE_EDGES: [Point3, Point3][] = (() => {
  const corners: Point3[] = [];
  for (const x of [-1, 1]) {
    for (const y of [-1, 1]) {
      for (const z of [-1, 1]) {
        corners.push({ x, y, z });
      }
    }
  }
  const edges: [Point3, Point3][] = [];
  for (let i = 0; i < corners.length; i++) {
    for (let j = i + 1; j < corners.length; j++) {
      const a = corners[i];
      const b = corners[j];
      const differences =
        Number(a.x !== b.x) + Number(a.y !== b.y) + Number(a.z !== b.z);
      if (differences === 1) edges.push([a, b]);
    }
  }
  return edges;
})();
