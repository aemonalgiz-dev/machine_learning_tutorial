"use client";

// Walk one person down a small tree and watch their route light up.
//
// The tree is grown by the API on a sixteen-person crowd built so that both
// of its questions matter, short children the first question settles alone,
// stocky children whose weight is never consulted, slender teenagers the
// second question exists for, and adults who answer no twice. It is kept two
// questions deep on purpose, so the whole map fits in one look. Move the
// sliders or press a visitor and the API reroutes them, using the same
// routing rule predict applies in bulk, so the highlighted path is the
// model's actual answer and not a re-enactment.

import { useEffect, useState } from "react";
import { ApiError, LabelledPoint, TreeWalk, WalkNode, walkTree } from "@/lib/api";

const VIEW = { width: 640, height: 330 };

// Neither feature separates this crowd alone. The stocky children weigh more
// than some adults, and the teenagers stand taller than some adults, so the
// fitted tree has to ask height first and weight second.
const THREE_LEAF_CROWD: LabelledPoint[] = [
  { x: 118, y: 24, label: 0 },
  { x: 122, y: 28, label: 0 },
  { x: 120, y: 25, label: 0 },
  { x: 132, y: 32, label: 0 },
  { x: 128, y: 30, label: 0 },
  { x: 135, y: 34, label: 0 },
  { x: 146, y: 59, label: 0 },
  { x: 140, y: 63, label: 0 },
  { x: 148, y: 67, label: 0 },
  { x: 161, y: 42, label: 0 },
  { x: 168, y: 45, label: 0 },
  { x: 159, y: 57, label: 1 },
  { x: 162, y: 61, label: 1 },
  { x: 178, y: 66, label: 1 },
  { x: 180, y: 78, label: 1 },
  { x: 183, y: 83, label: 1 },
];

const TREE_DEPTH = 2;

const VISITORS = [
  { name: "A small child", height: 125, weight: 30 },
  { name: "A stocky child", height: 147, weight: 62 },
  { name: "A slender teenager", height: 166, weight: 46 },
  { name: "An adult", height: 180, weight: 74 },
];

interface PlacedNode {
  node: WalkNode;
  x: number;
  y: number;
}

interface PlacedEdge {
  from: PlacedNode;
  to: PlacedNode;
  answer: "yes" | "no";
}

// Leaves take evenly spaced slots left to right; each question sits over the
// midpoint of its children. Presentation only, every number in the boxes
// comes from the API.
function placeNodes(root: WalkNode): { nodes: PlacedNode[]; edges: PlacedEdge[] } {
  const leaves: WalkNode[] = [];
  const countLeaves = (node: WalkNode) => {
    if (node.kind === "answer" || (!node.left && !node.right)) {
      leaves.push(node);
      return;
    }
    if (node.left) countLeaves(node.left);
    if (node.right) countLeaves(node.right);
  };
  countLeaves(root);

  const slotWidth = VIEW.width / (leaves.length + 1);
  const rowHeight = 104;
  const nodes: PlacedNode[] = [];
  const edges: PlacedEdge[] = [];

  const place = (node: WalkNode, depth: number): PlacedNode => {
    if (node.kind === "answer" || (!node.left && !node.right)) {
      const slot = leaves.indexOf(node) + 1;
      const placed = { node, x: slot * slotWidth, y: 46 + 2 * rowHeight };
      nodes.push(placed);
      return placed;
    }
    const leftPlaced = node.left ? place(node.left, depth + 1) : null;
    const rightPlaced = node.right ? place(node.right, depth + 1) : null;
    const middle =
      leftPlaced && rightPlaced
        ? (leftPlaced.x + rightPlaced.x) / 2
        : (leftPlaced ?? rightPlaced)!.x;
    const placed = { node, x: middle, y: 46 + depth * rowHeight };
    nodes.push(placed);
    if (leftPlaced) edges.push({ from: placed, to: leftPlaced, answer: "yes" });
    if (rightPlaced) edges.push({ from: placed, to: rightPlaced, answer: "no" });
    return placed;
  };
  place(root, 0);
  return { nodes, edges };
}

function stepSentence(feature: string, value: number, threshold: number, direction: string): string {
  const comparison =
    direction === "left"
      ? `is at or below ${threshold.toFixed(1)}`
      : `is above ${threshold.toFixed(1)}`;
  const turn = direction === "left" ? "left" : "right";
  return `${feature} ${value.toFixed(0)} ${comparison}, so the visitor goes ${turn}`;
}

export function TreeWalkPlayground() {
  const [height, setHeight] = useState(166);
  const [weight, setWeight] = useState(46);
  const [walk, setWalk] = useState<TreeWalk | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const routed = await walkTree(THREE_LEAF_CROWD, TREE_DEPTH, {
          x: height,
          y: weight,
        });
        if (!cancelled) {
          setWalk(routed);
          setMessage(null);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [height, weight]);

  const visited = new Set<number>();
  if (walk) {
    walk.steps.forEach((step) => visited.add(step.node_id));
    visited.add(walk.leaf_id);
  }

  const placed = walk ? placeNodes(walk.tree) : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {VISITORS.map((visitor) => (
          <button
            key={visitor.name}
            onClick={() => {
              setHeight(visitor.height);
              setWeight(visitor.weight);
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {visitor.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-6 pb-3">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          Height
          <input
            type="range"
            min={110}
            max={195}
            step={1}
            value={height}
            onChange={(event) => setHeight(Number(event.target.value))}
            className="w-40 accent-indigo-600"
          />
          <span className="w-14 font-mono text-slate-900 dark:text-slate-100">
            {height} cm
          </span>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          Weight
          <input
            type="range"
            min={20}
            max={90}
            step={1}
            value={weight}
            onChange={(event) => setWeight(Number(event.target.value))}
            className="w-40 accent-indigo-600"
          />
          <span className="w-14 font-mono text-slate-900 dark:text-slate-100">
            {weight} kg
          </span>
        </label>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {placed &&
          placed.edges.map((edge, index) => {
            const onPath =
              visited.has(edge.from.node.id) && visited.has(edge.to.node.id);
            const labelX = (edge.from.x + edge.to.x) / 2;
            const labelY = (edge.from.y + edge.to.y) / 2 + 4;
            return (
              <g key={`edge${index}`}>
                <line
                  x1={edge.from.x}
                  y1={edge.from.y + 24}
                  x2={edge.to.x}
                  y2={edge.to.y - 24}
                  stroke="currentColor"
                  strokeWidth={onPath ? 3 : 1.5}
                  className={
                    onPath
                      ? "text-emerald-500"
                      : "text-slate-300 dark:text-slate-700"
                  }
                />
                <text
                  x={labelX + (edge.answer === "yes" ? -14 : 14)}
                  y={labelY}
                  textAnchor="middle"
                  className={
                    onPath
                      ? "fill-emerald-600 text-[12px] font-medium dark:fill-emerald-400"
                      : "fill-slate-400 text-[12px]"
                  }
                >
                  {edge.answer}
                </text>
              </g>
            );
          })}

        {placed &&
          placed.nodes.map((entry) => {
            const onPath = visited.has(entry.node.id);
            const isAnswer = entry.node.kind === "answer";
            const boxWidth = isAnswer ? 118 : 172;
            const title = isAnswer
              ? entry.node.label === 1
                ? "adult"
                : "child"
              : `${entry.node.feature} ≤ ${entry.node.threshold?.toFixed(1)}?`;
            return (
              <g key={entry.node.id}>
                <rect
                  x={entry.x - boxWidth / 2}
                  y={entry.y - 24}
                  width={boxWidth}
                  height={48}
                  rx={isAnswer ? 24 : 8}
                  strokeWidth={onPath ? 2.5 : 1.5}
                  stroke="currentColor"
                  className={
                    onPath
                      ? isAnswer
                        ? "fill-emerald-100 text-emerald-500 dark:fill-emerald-950"
                        : "fill-white text-emerald-500 dark:fill-slate-900"
                      : "fill-white text-slate-300 dark:fill-slate-900 dark:text-slate-700"
                  }
                />
                <text
                  x={entry.x}
                  y={entry.y - 2}
                  textAnchor="middle"
                  className={
                    onPath
                      ? "fill-slate-900 text-[14px] font-semibold dark:fill-slate-100"
                      : "fill-slate-500 text-[14px] dark:fill-slate-400"
                  }
                >
                  {title}
                </text>
                <text
                  x={entry.x}
                  y={entry.y + 16}
                  textAnchor="middle"
                  className="fill-slate-400 text-[11px]"
                >
                  {entry.node.samples} people
                </text>
              </g>
            );
          })}
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Press a visitor or move the sliders, and the route lights up as the
        tree asks its questions.
      </p>

      <div className="mt-3 space-y-1">
        {walk &&
          walk.steps.map((step, index) => (
            <p
              key={step.node_id}
              className="text-sm text-slate-600 dark:text-slate-400"
            >
              <span className="font-mono text-slate-400">{index + 1}.</span>{" "}
              {stepSentence(step.feature, step.value, step.threshold, step.direction)}
            </p>
          ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Questions asked"
          value={walk ? String(walk.steps.length) : "…"}
        />
        <Stat
          label="The answer"
          value={walk ? (walk.prediction === 1 ? "adult" : "child") : "…"}
        />
        <Stat
          label="People at that leaf"
          value={
            walk
              ? String(findSamples(walk.tree, walk.leaf_id) ?? "…")
              : "…"
          }
        />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function findSamples(node: WalkNode, wanted: number): number | null {
  if (node.id === wanted) return node.samples;
  for (const child of [node.left, node.right]) {
    if (child) {
      const found = findSamples(child, wanted);
      if (found !== null) return found;
    }
  }
  return null;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
