"use client";

// Two forest trees on the same crowd, grown side by side one split at a time.
//
// Both trees see every row of the tangled crowd and both are offered one
// feature per split; the only difference is the seed of their feature
// lottery, chosen so that one opens with height and the other with
// weight. The slider makes the same number of splits on both, in the
// order the library made them, and the map colours the cells where the two
// partitions currently disagree. The point is how early a disagreement
// starts and how far it spreads, since every descendant node sees only the
// rows its parent sent it. Every tree is the library's.

import { useEffect, useState } from "react";
import { ApiError, GrownNode, TreeGrowth, growTree } from "@/lib/api";
import { ADULT, CHILD, TANGLED_CROWD } from "./BootstrapMachine";

const MAP = { width: 300, height: 260 };
const PAD = { left: 34, right: 10, top: 10, bottom: 26 };
const CELLS = 40;

function visibleLeaves(growth: TreeGrowth, shownSplits: number): GrownNode[] {
  const isQuestion = (node: GrownNode) => node.split_order !== null && node.split_order < shownSplits;
  const leaves: GrownNode[] = [];
  const walk = (id: number) => {
    const node = growth.nodes[id];
    if (isQuestion(node) && node.left_id !== null && node.right_id !== null) {
      walk(node.left_id);
      walk(node.right_id);
    } else {
      leaves.push(node);
    }
  };
  walk(0);
  return leaves;
}

function labelAt(leaves: GrownNode[], x: number, y: number): number {
  const leaf = leaves.find((node) => x >= node.bounds[0] && x <= node.bounds[1] && y >= node.bounds[2] && y <= node.bounds[3]);
  return leaf ? leaf.majority : 0;
}

export function DivergingGrowth({ seeds }: { seeds: [number, number] }) {
  const [trees, setTrees] = useState<[TreeGrowth, TreeGrowth] | null>(null);
  const [shownSplits, setShownSplits] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const grown = await Promise.all(seeds.map((seed) => growTree(TANGLED_CROWD, { maxFeatures: 1, randomSeed: seed })));
        setTrees([grown[0], grown[1]]);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [seeds]);

  if (!trees) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const [first, second] = trees;
  const mostSplits = Math.max(first.n_splits, second.n_splits);
  const leaves = [visibleLeaves(first, shownSplits), visibleLeaves(second, shownSplits)];
  const cellWidth = (MAP.width - PAD.left - PAD.right) / CELLS;
  const cellHeight = (MAP.height - PAD.top - PAD.bottom) / CELLS;
  const valueX = (column: number) => first.x_min + ((first.x_max - first.x_min) * (column + 0.5)) / CELLS;
  const valueY = (row: number) => first.y_min + ((first.y_max - first.y_min) * (row + 0.5)) / CELLS;
  const mapX = (value: number) => PAD.left + ((value - first.x_min) / (first.x_max - first.x_min)) * (MAP.width - PAD.left - PAD.right);
  const mapY = (value: number) => PAD.top + (1 - (value - first.y_min) / (first.y_max - first.y_min)) * (MAP.height - PAD.top - PAD.bottom);

  let differing = 0;
  const cells: { column: number; row: number; labels: number[] }[] = [];
  for (let row = 0; row < CELLS; row += 1) {
    for (let column = 0; column < CELLS; column += 1) {
      const labels = leaves.map((each) => labelAt(each, valueX(column), valueY(row)));
      if (labels[0] !== labels[1]) differing += 1;
      cells.push({ column, row, labels });
    }
  }

  const lastSplit = (growth: TreeGrowth) => (shownSplits > 0 ? growth.nodes.find((node) => node.split_order === shownSplits - 1) ?? null : null);

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-24">splits made</span>
        <input type="range" min={0} max={mostSplits} step={1} value={shownSplits} onChange={(event) => setShownSplits(Number(event.target.value))} className="flex-1 accent-indigo-600" />
        <span className="w-16 text-right font-mono">{shownSplits} of {mostSplits}</span>
      </label>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {trees.map((growth, which) => {
          const split = lastSplit(growth);
          return (
            <div key={which}>
              <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                Tree {which === 0 ? "A" : "B"}, opens with {growth.nodes[0].feature}
              </p>
              <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
                {cells.map((cell) => (
                  <rect key={`${cell.row}-${cell.column}`} x={PAD.left + cell.column * cellWidth} y={PAD.top + (CELLS - 1 - cell.row) * cellHeight} width={cellWidth + 0.5} height={cellHeight + 0.5} fill={cell.labels[which] === 0 ? CHILD : ADULT} opacity={cell.labels[0] !== cell.labels[1] ? 0.6 : 0.15} />
                ))}
                {TANGLED_CROWD.map((person, index) => (
                  <circle key={index} cx={mapX(person.x)} cy={mapY(person.y)} r={3} fill={person.label === 0 ? CHILD : ADULT} stroke="white" strokeWidth={1} />
                ))}
                <text x={MAP.width / 2} y={MAP.height - 6} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">height, cm</text>
                <text x={10} y={MAP.height / 2} textAnchor="middle" transform={`rotate(-90 10 ${MAP.height / 2})`} className="fill-slate-500 text-[10px] dark:fill-slate-400">weight, kg</text>
              </svg>
              <p className="mt-1 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                {split
                  ? `split ${shownSplits}, ${split.feature} < ${split.threshold} at depth ${split.depth}, on ${split.children + split.adults} people`
                  : shownSplits > growth.n_splits
                    ? `finished at ${growth.n_splits} splits`
                    : "no question asked yet"}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Strong colour marks the cells where the two partitions currently disagree, {differing} of {CELLS * CELLS}. Tree A finishes at {first.n_splits} splits and {first.n_leaves} leaves, tree B at {second.n_splits} and {second.n_leaves}.
      </p>
    </div>
  );
}
