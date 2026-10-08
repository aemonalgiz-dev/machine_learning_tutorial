export interface Point { x: number; y: number }
export interface WireNode extends Point { id: string; height: number }
export const NODE_WIDTH = 220;
export const portY = (port: number) => 78 + port * 36;
export const outputPoint = (node: Point): Point => ({ x: node.x + NODE_WIDTH, y: node.y + portY(0) });
export const inputPoint = (node: Point, port: number): Point => ({ x: node.x, y: node.y + portY(port) });

export function looseWire(from: Point, to: Point): string {
  const reach = Math.max(24, Math.abs(to.x - from.x) / 2);
  return `M${from.x} ${from.y} C${from.x + reach} ${from.y},${to.x - reach} ${to.y},${to.x} ${to.y}`;
}

type Rect = { left: number; right: number; top: number; bottom: number };
const inside = (p: Point, r: Rect) => p.x > r.left && p.x < r.right && p.y > r.top && p.y < r.bottom;
function clearSegment(a: Point, b: Point, obstacles: Rect[]) {
  return !obstacles.some(r => a.y === b.y
    ? a.y > r.top && a.y < r.bottom && Math.max(a.x, b.x) > r.left && Math.min(a.x, b.x) < r.right
    : a.x > r.left && a.x < r.right && Math.max(a.y, b.y) > r.top && Math.min(a.y, b.y) < r.bottom);
}

function roundedPath(points: Point[]): string {
  const simplified: Point[] = [];
  for (const point of points) {
    if (simplified.length && point.x === simplified.at(-1)!.x && point.y === simplified.at(-1)!.y) continue;
    while (simplified.length > 1) {
      const a = simplified.at(-2)!, b = simplified.at(-1)!;
      if ((a.x === b.x && b.x === point.x) || (a.y === b.y && b.y === point.y)) simplified.pop();
      else break;
    }
    simplified.push(point);
  }
  let path = `M${simplified[0].x} ${simplified[0].y}`;
  for (let i = 1; i < simplified.length - 1; i++) {
    const a = simplified[i - 1], b = simplified[i], c = simplified[i + 1];
    const before = Math.hypot(b.x - a.x, b.y - a.y), after = Math.hypot(c.x - b.x, c.y - b.y);
    const radius = Math.min(10, before / 2, after / 2);
    path += ` L${b.x + (a.x - b.x) * radius / before} ${b.y + (a.y - b.y) * radius / before}`;
    path += ` Q${b.x} ${b.y},${b.x + (c.x - b.x) * radius / after} ${b.y + (c.y - b.y) * radius / after}`;
  }
  const last = simplified.at(-1)!;
  return `${path} L${last.x} ${last.y}`;
}

// A small priority queue keeps obstacle routing responsive while pieces move.
type Visit = { key: number; cost: number; score: number };
class Queue {
  items: Visit[] = [];
  push(item: Visit) {
    let i = this.items.length;
    this.items.push(item);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.items[parent].score <= item.score) break;
      this.items[i] = this.items[parent]; i = parent;
    }
    this.items[i] = item;
  }
  pop(): Visit | undefined {
    const first = this.items[0], last = this.items.pop();
    if (this.items.length && last) {
      let i = 0;
      while (i * 2 + 1 < this.items.length) {
        let child = i * 2 + 1;
        if (child + 1 < this.items.length && this.items[child + 1].score < this.items[child].score) child++;
        if (last.score <= this.items[child].score) break;
        this.items[i] = this.items[child]; i = child;
      }
      this.items[i] = last;
    }
    return first;
  }
}

export function wirePath(from: WireNode, to: WireNode, port: number, nodes: WireNode[]): string {
  const start = outputPoint(from), end = inputPoint(to, port);
  const obstacles = nodes.map(n => ({ left: n.x - 12, right: n.x + NODE_WIDTH + 12, top: n.y - 12, bottom: n.y + n.height + 12 }));

  // Most connections can use one smooth, monotone curve between the sockets.
  if (end.x > start.x) {
    const others = obstacles.filter((_, i) => nodes[i].id !== from.id && nodes[i].id !== to.id);
    const reach = Math.max(24, (end.x - start.x) / 2);
    let clear = true;
    for (let i = 1; i < 80 && clear; i++) {
      const t = i / 80, u = 1 - t;
      const point = {
        x: u ** 3 * start.x + 3 * u * u * t * (start.x + reach) + 3 * u * t * t * (end.x - reach) + t ** 3 * end.x,
        y: (u ** 3 + 3 * u * u * t) * start.y + (3 * u * t * t + t ** 3) * end.y,
      };
      clear = !others.some(r => inside(point, r));
    }
    if (clear) return looseWire(start, end);
  }

  // Route around bodies, including the source and destination for backwards
  // connections. Grid lines lie just outside padded node edges, not at a fixed
  // distance below the whole construction.
  const exit = { x: start.x + 24, y: start.y }, entry = { x: end.x - 24, y: end.y };
  const xs = [...new Set([exit.x, entry.x, 4, ...obstacles.flatMap(r => [r.left - 1, r.right + 1])])].sort((a, b) => a - b);
  const ys = [...new Set([exit.y, entry.y, 4, ...obstacles.flatMap(r => [r.top - 1, r.bottom + 1])])].sort((a, b) => a - b);
  const nx = xs.length, count = nx * ys.length;
  const point = (vertex: number): Point => ({ x: xs[vertex % nx], y: ys[Math.floor(vertex / nx)] });
  const source = ys.indexOf(exit.y) * nx + xs.indexOf(exit.x), target = ys.indexOf(entry.y) * nx + xs.indexOf(entry.x);
  const costs = new Float64Array(count * 2).fill(Infinity), parents = new Int32Array(count * 2).fill(-1);
  const blocked = new Int8Array(count).fill(-1), queue = new Queue();
  costs[source * 2] = 0;
  queue.push({ key: source * 2, cost: 0, score: 0 });
  let finish = -1;
  while (queue.items.length) {
    const current = queue.pop()!;
    if (current.cost !== costs[current.key]) continue;
    const vertex = Math.floor(current.key / 2), axis = current.key % 2, a = point(vertex);
    if (vertex === target) { finish = current.key; break; }
    const col = vertex % nx, row = Math.floor(vertex / nx);
    const neighbours = [col > 0 ? vertex - 1 : -1, col + 1 < nx ? vertex + 1 : -1, row > 0 ? vertex - nx : -1, row + 1 < ys.length ? vertex + nx : -1];
    for (let i = 0; i < neighbours.length; i++) {
      const next = neighbours[i]; if (next < 0) continue;
      const b = point(next), direction = i < 2 ? 0 : 1, key = next * 2 + direction;
      if (blocked[next] < 0) blocked[next] = Number(obstacles.some(r => inside(b, r)));
      if (blocked[next] || !clearSegment(a, b, obstacles)) continue;
      const cost = current.cost + Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + (axis === direction ? 0 : 20);
      if (cost >= costs[key]) continue;
      costs[key] = cost; parents[key] = current.key;
      queue.push({ key, cost, score: cost + Math.abs(b.x - entry.x) + Math.abs(b.y - entry.y) });
    }
  }
  // During a drag, overlapping pieces may temporarily leave no clear corridor.
  if (finish < 0) return looseWire(start, end);
  const route: Point[] = [];
  for (let key = finish; key >= 0; key = parents[key]) route.push(point(Math.floor(key / 2)));
  return roundedPath([start, ...route.reverse(), end]);
}
