"use client";

// The same crowd twice, one person moved, and two different trees.
//
// The left tree is grown on the muddled crowd as it stands. The right tree
// is grown on the same crowd with one person nudged, or with a handful of
// people left out, and the two are drawn as decision maps with their root
// questions printed. A small change at the root reorganises everything
// below it, which is why a lone tree is unstable and why the forests page
// grows many. The repeated-samples mode grows a tree on each of several
// random four-fifths of the crowd and overlays their root cuts. Every tree
// is the library's.

import { useEffect, useState } from "react";
import { ApiError, LabelledPoint, TreeGrowth, growTree } from "@/lib/api";
import { MUDDLED_CROWD } from "./TreeGrowthPlayground";

const CHILD = "#f59e0b";
const ADULT = "#6366f1";
const MAP = { width: 300, height: 260 };
const PAD = { left: 36, right: 10, top: 10, bottom: 28 };
// The child at 145 cm and 57 kg. Relabelled as an adult, the root question
// moves from height to weight.
const NUDGED_INDEX = 2;
const SAMPLES = 5;

// Seeded pseudo-random subsets, so the page's repeated samples are the same
// samples every time it loads.
function subsample(points: LabelledPoint[], seed: number): LabelledPoint[] {
  let state = seed * 9301 + 49297;
  const next = () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
  const keep = points.map(() => next() > 0.2);
  const chosen = points.filter((_, index) => keep[index]);
  return chosen.length >= 6 ? chosen : points;
}

export function TreeStability() {
  const [mode, setMode] = useState<"nudge" | "samples">("nudge");
  const [original, setOriginal] = useState<TreeGrowth | null>(null);
  const [nudged, setNudged] = useState<TreeGrowth | null>(null);
  const [samples, setSamples] = useState<TreeGrowth[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const nudgedCrowd = MUDDLED_CROWD.map((person, index) => (index === NUDGED_INDEX ? { ...person, label: 1 } : person));

  useEffect(() => {
    (async () => {
      try {
        const [first, second, ...rest] = await Promise.all([
          growTree(MUDDLED_CROWD, { maxDepth: 4 }),
          growTree(nudgedCrowd, { maxDepth: 4 }),
          ...Array.from({ length: SAMPLES }, (_, seed) => growTree(subsample(MUDDLED_CROWD, seed + 1), { maxDepth: 4 })),
        ]);
        setOriginal(first);
        setNudged(second);
        setSamples(rest);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    // The crowds are module constants.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!original || !nudged) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const plot = { width: MAP.width - PAD.left - PAD.right, height: MAP.height - PAD.top - PAD.bottom };
  const mapX = (value: number) => PAD.left + ((value - original.x_min) / (original.x_max - original.x_min)) * plot.width;
  const mapY = (value: number) => PAD.top + (1 - (value - original.y_min) / (original.y_max - original.y_min)) * plot.height;
  const leavesOf = (growth: TreeGrowth) => growth.nodes.filter((node) => node.split_order === null);
  const rootOf = (growth: TreeGrowth) => growth.nodes[0];

  const drawMap = (growth: TreeGrowth, crowd: LabelledPoint[], title: string, highlight?: number) => (
    <div>
      <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
      <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {leavesOf(growth).map((leaf) => (
          <rect key={leaf.id} x={mapX(leaf.bounds[0])} y={mapY(leaf.bounds[3])} width={mapX(leaf.bounds[1]) - mapX(leaf.bounds[0])} height={mapY(leaf.bounds[2]) - mapY(leaf.bounds[3])} fill={leaf.majority === 0 ? CHILD : ADULT} opacity={0.2} stroke="white" />
        ))}
        {crowd.map((person, index) => (
          <circle key={index} cx={mapX(person.x)} cy={mapY(person.y)} r={index === highlight ? 6 : 3.5} fill={person.label === 0 ? CHILD : ADULT} stroke={index === highlight ? "#0f172a" : "white"} strokeWidth={index === highlight ? 2.5 : 1} />
        ))}
        <text x={PAD.left + plot.width / 2} y={MAP.height - 6} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">
          root asks {rootOf(growth).feature} &lt; {rootOf(growth).threshold}, {growth.n_leaves} leaves, depth {growth.depth}
        </text>
      </svg>
    </div>
  );

  const changedCells = (() => {
    // Compare the two maps on a coarse lattice of the window.
    let changed = 0;
    const steps = 30;
    const labelAt = (growth: TreeGrowth, x: number, y: number) => {
      const leaf = leavesOf(growth).find((node) => x >= node.bounds[0] && x <= node.bounds[1] && y >= node.bounds[2] && y <= node.bounds[3]);
      return leaf ? leaf.majority : -1;
    };
    for (let row = 0; row < steps; row++) {
      for (let column = 0; column < steps; column++) {
        const x = original.x_min + ((original.x_max - original.x_min) * (column + 0.5)) / steps;
        const y = original.y_min + ((original.y_max - original.y_min) * (row + 0.5)) / steps;
        if (labelAt(original, x, y) !== labelAt(nudged, x, y)) changed++;
      }
    }
    return { changed, total: steps * steps };
  })();

  return (
    <div>
      <div className="flex gap-1 pb-3">
        {[
          { key: "nudge" as const, label: "one person relabelled" },
          { key: "samples" as const, label: "five samples of the crowd" },
        ].map((choice) => (
          <button key={choice.key} onClick={() => setMode(choice.key)} className={`rounded-md border px-3 py-1 text-sm font-medium transition ${mode === choice.key ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-200" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>
            {choice.label}
          </button>
        ))}
      </div>

      {mode === "nudge" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {drawMap(original, MUDDLED_CROWD, "The crowd as it stands", NUDGED_INDEX)}
            {drawMap(nudged, nudgedCrowd, "The ringed person relabelled as an adult", NUDGED_INDEX)}
          </div>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
            One label changed. The root asks {rootOf(original).feature} &lt; {rootOf(original).threshold} before and {rootOf(nudged).feature} &lt; {rootOf(nudged).threshold} after, the leaf count goes from {original.n_leaves} to {nudged.n_leaves}, and the two maps disagree on {changedCells.changed} of {changedCells.total} cells of the window.
          </p>
        </>
      ) : (
        <>
          <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="mx-auto w-full max-w-sm select-none rounded-lg bg-slate-50 dark:bg-slate-950">
            {MUDDLED_CROWD.map((person, index) => (
              <circle key={index} cx={mapX(person.x)} cy={mapY(person.y)} r={3.5} fill={person.label === 0 ? CHILD : ADULT} stroke="white" strokeWidth={1} />
            ))}
            {samples.map((growth, index) => {
              const root = rootOf(growth);
              if (root.feature === null || root.threshold === null) return null;
              return root.feature === "height" ? (
                <line key={index} x1={mapX(root.threshold)} y1={PAD.top} x2={mapX(root.threshold)} y2={PAD.top + plot.height} stroke="#0f172a" strokeWidth={2} opacity={0.6} className="dark:stroke-slate-100" />
              ) : (
                <line key={index} x1={PAD.left} y1={mapY(root.threshold)} x2={PAD.left + plot.width} y2={mapY(root.threshold)} stroke="#ef4444" strokeWidth={2} opacity={0.6} />
              );
            })}
            <text x={PAD.left + plot.width / 2} y={MAP.height - 6} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">five root cuts, each from a tree grown on about four fifths of the crowd</text>
          </svg>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {samples.map((growth, index) => (
              <div key={index} className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                sample {index + 1}: {rootOf(growth).feature} &lt; {rootOf(growth).threshold}, {growth.n_leaves} leaves
              </div>
            ))}
          </div>
        </>
      )}
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
