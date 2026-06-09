// Marching squares over one level of a lattice, for the contour pictures.
//
// The loss surfaces on the descent page and the RSS valley on the penalty
// page are both sampled lattices from the API, and both want lines of equal
// value drawn over them. This traces one level and returns line segments in
// lattice units, column then row, so the caller maps them to pixels however
// its axes run.

export type ContourSegment = [number, number, number, number];

export function traceContour(grid: number[][], level: number): ContourSegment[] {
  const segments: ContourSegment[] = [];
  const rows = grid.length;
  const columns = grid[0].length;
  const cross = (a: number, b: number) => (level - a) / (b - a);
  for (let row = 0; row < rows - 1; row++) {
    for (let column = 0; column < columns - 1; column++) {
      const topLeft = grid[row][column];
      const topRight = grid[row][column + 1];
      const bottomLeft = grid[row + 1][column];
      const bottomRight = grid[row + 1][column + 1];
      const code =
        (topLeft >= level ? 8 : 0) +
        (topRight >= level ? 4 : 0) +
        (bottomRight >= level ? 2 : 0) +
        (bottomLeft >= level ? 1 : 0);
      if (code === 0 || code === 15) continue;
      const top: [number, number] = [column + cross(topLeft, topRight), row];
      const right: [number, number] = [column + 1, row + cross(topRight, bottomRight)];
      const bottom: [number, number] = [column + cross(bottomLeft, bottomRight), row + 1];
      const left: [number, number] = [column, row + cross(topLeft, bottomLeft)];
      const join = (first: [number, number], second: [number, number]) =>
        segments.push([first[0], first[1], second[0], second[1]]);
      switch (code) {
        case 1: case 14: join(left, bottom); break;
        case 2: case 13: join(bottom, right); break;
        case 3: case 12: join(left, right); break;
        case 4: case 11: join(top, right); break;
        case 5: join(top, left); join(bottom, right); break;
        case 6: case 9: join(top, bottom); break;
        case 7: case 8: join(top, left); break;
        case 10: join(top, right); join(bottom, left); break;
      }
    }
  }
  return segments;
}
