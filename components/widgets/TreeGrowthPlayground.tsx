"use client";

// A tree grown one split at a time, with its rectangles growing alongside.
//
// The API grows the tree and lays its nodes out breadth first, each with
// the rectangle of the plane it owns and the counts of who reached it. The
// slider adds one split at a time. Left of the slider's position the nodes
// are questions; at and beyond it they are leaves, predicting their
// majority, and the map on the right is those leaves' rectangles coloured
// by majority. Click a leaf, in the tree or on the map, for its card: who
// reached it, the counts, the majority, the observed shares. The growth
// controls are the library's own, and the whole tree is regrown when one
// changes. Everything drawn is the API's; the browser slides a cursor.

import { useEffect, useState } from "react";
import { ApiError, GrownNode, LabelledPoint, TreeGrowth, growTree } from "@/lib/api";
import { CLEAN_CROWD } from "./SplitInspector";

export const MUDDLED_CROWD: LabelledPoint[] = [
  ...CLEAN_CROWD,
  { x: 145, y: 45, label: 0 },
  { x: 145, y: 55, label: 1 },
  { x: 151, y: 45, label: 1 },
  { x: 151, y: 55, label: 0 },
  { x: 157, y: 45, label: 0 },
  { x: 157, y: 55, label: 1 },
  { x: 148, y: 50, label: 1 },
  { x: 154, y: 50, label: 0 },
  { x: 160, y: 50, label: 1 },
  { x: 147, y: 58, label: 0 },
  { x: 153, y: 58, label: 1 },
  { x: 150, y: 42, label: 1 },
  { x: 156, y: 42, label: 0 },
  { x: 143, y: 50, label: 0 },
];

const CHILD = "#f59e0b";
const ADULT = "#6366f1";
const MAP = { width: 320, height: 300 };
const MAP_PAD = { left: 40, right: 10, top: 10, bottom: 30 };
const TREE = { width: 320, height: 300 };

export function TreeGrowthPlayground({
  points = MUDDLED_CROWD,
  showControls = true,
}: {
  points?: LabelledPoint[];
  showControls?: boolean;
}) {
  const [maxDepth, setMaxDepth] = useState(6);
  const [minLeaf, setMinLeaf] = useState(1);
  const [minSplit, setMinSplit] = useState(2);
  const [minDecrease, setMinDecrease] = useState(0);
  const [growth, setGrowth] = useState<TreeGrowth | null>(null);
  const [shownSplits, setShownSplits] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const grown = await growTree(points, { maxDepth, minSamplesLeaf: minLeaf, minSamplesSplit: minSplit, minImpurityDecrease: minDecrease });
        setGrowth(grown);
        setShownSplits(grown.n_splits);
        setSelected(null);
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [points, maxDepth, minLeaf, minSplit, minDecrease]);

  if (!growth) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const isQuestion = (node: GrownNode) => node.split_order !== null && node.split_order < shownSplits;
  // The leaves at this step are nodes reachable from the root whose parent
  // is a question and which are not questions themselves.
  const visible = new Set<number>();
  const walk = (id: number) => {
    visible.add(id);
    const node = growth.nodes[id];
    if (isQuestion(node) && node.left_id !== null && node.right_id !== null) {
      walk(node.left_id);
      walk(node.right_id);
    }
  };
  walk(0);
  const leaves = growth.nodes.filter((node) => visible.has(node.id) && !isQuestion(node));
  const correct = leaves.reduce((sum, leaf) => sum + Math.max(leaf.children, leaf.adults), 0);
  const total = growth.nodes[0].children + growth.nodes[0].adults;
  const lastSplit = shownSplits > 0 ? growth.nodes.find((node) => node.split_order === shownSplits - 1) ?? null : null;

  const mapX = (value: number) => MAP_PAD.left + ((value - growth.x_min) / (growth.x_max - growth.x_min)) * (MAP.width - MAP_PAD.left - MAP_PAD.right);
  const mapY = (value: number) => MAP_PAD.top + (1 - (value - growth.y_min) / (growth.y_max - growth.y_min)) * (MAP.height - MAP_PAD.top - MAP_PAD.bottom);

  // Tree layout: depth down the page, leaves spread across by in-order position.
  const positions = new Map<number, { x: number; y: number }>();
  let column = 0;
  const place = (id: number, depth: number) => {
    const node = growth.nodes[id];
    if (isQuestion(node) && node.left_id !== null && node.right_id !== null) {
      place(node.left_id, depth + 1);
      place(node.right_id, depth + 1);
      const left = positions.get(node.left_id)!;
      const right = positions.get(node.right_id)!;
      positions.set(id, { x: (left.x + right.x) / 2, y: depth });
    } else {
      positions.set(id, { x: column, y: depth });
      column += 1;
    }
  };
  place(0, 0);
  const columns = Math.max(1, column);
  const depthReached = Math.max(...Array.from(positions.values()).map((position) => position.y));
  const treeX = (value: number) => 20 + ((value + 0.5) / columns) * (TREE.width - 40);
  const treeY = (depth: number) => 24 + (depth / Math.max(1, depthReached)) * (TREE.height - 60);
  const selectedNode = selected !== null ? growth.nodes[selected] : null;

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-24">splits made</span>
        <input type="range" min={0} max={growth.n_splits} step={1} value={shownSplits} onChange={(event) => { setShownSplits(Number(event.target.value)); setSelected(null); }} className="flex-1 accent-indigo-600" />
        <span className="w-16 text-right font-mono">{shownSplits} of {growth.n_splits}</span>
      </label>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {lastSplit ? `Split ${shownSplits}: ${lastSplit.feature} < ${lastSplit.threshold}, at depth ${lastSplit.depth}, on ${lastSplit.children + lastSplit.adults} people, gain ${lastSplit.gain!.toFixed(4)}.` : "No question asked yet. One leaf holds everyone and predicts the majority."}
        {" "}{leaves.length} {leaves.length === 1 ? "leaf" : "leaves"}, training accuracy {(correct / total).toFixed(3)}.
      </p>

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <svg viewBox={`0 0 ${TREE.width} ${TREE.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          {Array.from(visible).map((id) => {
            const node = growth.nodes[id];
            if (!isQuestion(node) || node.left_id === null || node.right_id === null) return null;
            const here = positions.get(id)!;
            const left = positions.get(node.left_id)!;
            const right = positions.get(node.right_id)!;
            return (
              <g key={`edge-${id}`}>
                <line x1={treeX(here.x)} y1={treeY(here.y)} x2={treeX(left.x)} y2={treeY(left.y)} stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
                <line x1={treeX(here.x)} y1={treeY(here.y)} x2={treeX(right.x)} y2={treeY(right.y)} stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
                <text x={(treeX(here.x) + treeX(left.x)) / 2 - 6} y={(treeY(here.y) + treeY(left.y)) / 2} textAnchor="end" className="fill-slate-400 text-[9px]">yes</text>
                <text x={(treeX(here.x) + treeX(right.x)) / 2 + 6} y={(treeY(here.y) + treeY(right.y)) / 2} className="fill-slate-400 text-[9px]">no</text>
              </g>
            );
          })}
          {Array.from(visible).map((id) => {
            const node = growth.nodes[id];
            const here = positions.get(id)!;
            const question = isQuestion(node);
            return (
              <g key={`node-${id}`} onClick={() => setSelected(id)} className="cursor-pointer">
                {question ? (
                  <>
                    <rect x={treeX(here.x) - 34} y={treeY(here.y) - 10} width={68} height={20} rx={4} className={selected === id ? "fill-slate-800 dark:fill-slate-200" : "fill-white stroke-slate-400 dark:fill-slate-900 dark:stroke-slate-600"} />
                    <text x={treeX(here.x)} y={treeY(here.y) + 4} textAnchor="middle" className={`text-[9px] font-medium ${selected === id ? "fill-white dark:fill-slate-900" : "fill-slate-700 dark:fill-slate-200"}`}>
                      {node.feature === "height" ? "h" : "w"} &lt; {node.threshold}
                    </text>
                  </>
                ) : (
                  <>
                    <circle cx={treeX(here.x)} cy={treeY(here.y)} r={11} fill={node.majority === 0 ? CHILD : ADULT} stroke={selected === id ? "#0f172a" : "white"} strokeWidth={selected === id ? 3 : 1.5} />
                    <text x={treeX(here.x)} y={treeY(here.y) + 3} textAnchor="middle" className="fill-white text-[8px] font-semibold">{node.children}/{node.adults}</text>
                  </>
                )}
              </g>
            );
          })}
          <text x={TREE.width / 2} y={TREE.height - 6} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">the tree, questions as boxes, leaves as circles labelled children/adults</text>
        </svg>

        <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          {leaves.map((leaf) => (
            <rect
              key={`rect-${leaf.id}`}
              x={mapX(leaf.bounds[0])}
              y={mapY(leaf.bounds[3])}
              width={mapX(leaf.bounds[1]) - mapX(leaf.bounds[0])}
              height={mapY(leaf.bounds[2]) - mapY(leaf.bounds[3])}
              fill={leaf.majority === 0 ? CHILD : ADULT}
              opacity={selected === leaf.id ? 0.45 : 0.18}
              stroke="white"
              strokeWidth={1}
              onClick={() => setSelected(leaf.id)}
              className="cursor-pointer"
            />
          ))}
          {points.map((person, index) => (
            <circle key={index} cx={mapX(person.x)} cy={mapY(person.y)} r={4} fill={person.label === 0 ? CHILD : ADULT} stroke="white" strokeWidth={1} />
          ))}
          <text x={MAP_PAD.left + (MAP.width - MAP_PAD.left - MAP_PAD.right) / 2} y={MAP.height - 6} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">height across, weight up, one rectangle per leaf</text>
        </svg>
      </div>

      {selectedNode && (
        <div className="mt-3 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
          <p className="mb-1 font-medium text-slate-700 dark:text-slate-200">
            {isQuestion(selectedNode) ? `Question: ${selectedNode.feature} < ${selectedNode.threshold}` : "Leaf"}
            <span className="ml-2 text-xs font-normal text-slate-500">depth {selectedNode.depth}</span>
          </p>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs text-slate-700 dark:text-slate-200 sm:grid-cols-4">
            <div className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">{selectedNode.children + selectedNode.adults} people reached it</div>
            <div className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">{selectedNode.children} children, {selectedNode.adults} adults</div>
            <div className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">majority {selectedNode.majority === 0 ? "child" : "adult"}</div>
            <div className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
              shares {(selectedNode.children / (selectedNode.children + selectedNode.adults)).toFixed(2)} and {(selectedNode.adults / (selectedNode.children + selectedNode.adults)).toFixed(2)}
            </div>
            {isQuestion(selectedNode) && selectedNode.gain !== null && (
              <div className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">gain {selectedNode.gain.toFixed(4)}</div>
            )}
            <div className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
              owns {selectedNode.bounds[0].toFixed(0)} to {selectedNode.bounds[1].toFixed(0)} cm, {selectedNode.bounds[2].toFixed(0)} to {selectedNode.bounds[3].toFixed(0)} kg
            </div>
          </div>
        </div>
      )}

      {showControls && (
        <div className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          <Control label="maximum depth" value={maxDepth} min={1} max={6} step={1} onChange={setMaxDepth} />
          <Control label="minimum people in a leaf" value={minLeaf} min={1} max={6} step={1} onChange={setMinLeaf} />
          <Control label="minimum people to split" value={minSplit} min={2} max={12} step={1} onChange={setMinSplit} />
          <Control label="minimum impurity decrease" value={minDecrease} min={0} max={0.2} step={0.01} onChange={setMinDecrease} />
        </div>
      )}
      <p className="mt-2 font-mono text-xs text-slate-600 dark:text-slate-300">
        fully grown under these controls: depth {growth.depth}, {growth.n_leaves} leaves, training accuracy {growth.accuracy.toFixed(3)}
      </p>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Control({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
      <span className="w-44">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="flex-1 accent-slate-600" />
      <span className="w-10 text-right font-mono">{step < 1 ? value.toFixed(2) : value}</span>
    </label>
  );
}
