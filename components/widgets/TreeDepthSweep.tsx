"use client";

// Training and held-out accuracy against the depth cap, on one seeded split.
//
// The API holds back thirty percent of an overlapping crowd by a seeded
// shuffle, grows a tree on the rest at every depth cap from one to six, and
// scores each on both shares. The slider picks a cap and the map shows that
// tree's regions with the held-out people ringed. Training accuracy climbs
// or holds as the cap rises. Held-out accuracy does not have to, and on
// this crowd it stops improving while the training score is still
// climbing, which is the whole argument for not letting training accuracy
// choose the depth. Every fit is the library's.

import { useEffect, useState } from "react";
import { ApiError, LabelledPoint, TreeDepthSweep as Sweep, sweepTreeDepth } from "@/lib/api";
// Forty-four people whose classes overlap the way real measurements do,
// drawn once from two overlapping blobs and frozen. On this crowd a depth
// cap of three fits the training share perfectly and the held-out share
// worse than a cap of one, which is the pattern the section is about.
export const OVERLAP_CROWD: LabelledPoint[] = [
  { x: 142, y: 39, label: 0 },
  { x: 135, y: 16, label: 0 },
  { x: 162, y: 59, label: 0 },
  { x: 136, y: 54, label: 0 },
  { x: 143, y: 38, label: 0 },
  { x: 152, y: 41, label: 0 },
  { x: 136, y: 35, label: 0 },
  { x: 145, y: 44, label: 0 },
  { x: 147, y: 38, label: 0 },
  { x: 142, y: 34, label: 0 },
  { x: 150, y: 47, label: 0 },
  { x: 144, y: 50, label: 0 },
  { x: 128, y: 54, label: 0 },
  { x: 165, y: 25, label: 0 },
  { x: 119, y: 27, label: 0 },
  { x: 150, y: 47, label: 0 },
  { x: 153, y: 54, label: 0 },
  { x: 143, y: 48, label: 0 },
  { x: 138, y: 55, label: 0 },
  { x: 126, y: 40, label: 0 },
  { x: 143, y: 67, label: 0 },
  { x: 131, y: 32, label: 0 },
  { x: 158, y: 80, label: 1 },
  { x: 162, y: 84, label: 1 },
  { x: 143, y: 82, label: 1 },
  { x: 177, y: 51, label: 1 },
  { x: 167, y: 83, label: 1 },
  { x: 166, y: 80, label: 1 },
  { x: 193, y: 71, label: 1 },
  { x: 162, y: 59, label: 1 },
  { x: 173, y: 66, label: 1 },
  { x: 163, y: 67, label: 1 },
  { x: 173, y: 55, label: 1 },
  { x: 147, y: 39, label: 1 },
  { x: 179, y: 69, label: 1 },
  { x: 183, y: 68, label: 1 },
  { x: 156, y: 74, label: 1 },
  { x: 164, y: 53, label: 1 },
  { x: 154, y: 89, label: 1 },
  { x: 169, y: 73, label: 1 },
  { x: 162, y: 60, label: 1 },
  { x: 176, y: 67, label: 1 },
  { x: 156, y: 66, label: 1 },
  { x: 154, y: 70, label: 1 },
];

const CHILD = "#f59e0b";
const ADULT = "#6366f1";
const CHART = { width: 320, height: 220 };
const PAD = { left: 40, right: 10, top: 12, bottom: 30 };
const MAP = { width: 320, height: 220 };
const MAP_PAD = 24;

export function TreeDepthSweep({ points = OVERLAP_CROWD }: { points?: LabelledPoint[] }) {
  const [sweep, setSweep] = useState<Sweep | null>(null);
  const [index, setIndex] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSweep(await sweepTreeDepth(points, 6));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [points]);

  if (!sweep) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const scores = sweep.scores;
  const shown = scores[Math.min(index, scores.length) - 1];
  const held = new Set(sweep.held_out_indices);
  const plot = { width: CHART.width - PAD.left - PAD.right, height: CHART.height - PAD.top - PAD.bottom };
  const toX = (position: number) => PAD.left + (position / (scores.length - 1)) * plot.width;
  const toY = (accuracy: number) => PAD.top + (1 - accuracy) * plot.height;
  const line = (pick: (score: Sweep["scores"][number]) => number) => scores.map((score, position) => `${position === 0 ? "M" : "L"} ${toX(position).toFixed(1)} ${toY(pick(score)).toFixed(1)}`).join(" ");

  const regions = shown.regions;
  const cell = (MAP.width - 2 * MAP_PAD) / regions.cells;
  const mapX = (column: number) => MAP_PAD + column * cell;
  const mapY = (row: number) => MAP.height - MAP_PAD - (row + 1) * cell;
  const personX = (x: number) => mapX(((x - regions.x_min) / (regions.x_max - regions.x_min)) * (regions.cells - 1)) + cell / 2;
  const personY = (y: number) => mapY(((y - regions.y_min) / (regions.y_max - regions.y_min)) * (regions.cells - 1)) + cell / 2;

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-24">depth cap</span>
        <input type="range" min={1} max={scores.length} step={1} value={index} onChange={(event) => setIndex(Number(event.target.value))} className="flex-1 accent-indigo-600" />
        <span className="w-8 text-right font-mono">{index}</span>
      </label>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
            {[0.5, 0.75, 1].map((tick) => (
              <g key={tick}>
                <line x1={PAD.left} y1={toY(tick)} x2={PAD.left + plot.width} y2={toY(tick)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <text x={PAD.left - 6} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{tick}</text>
              </g>
            ))}
            <path d={line((score) => score.train_accuracy)} fill="none" stroke="#6366f1" strokeWidth={2} />
            <path d={line((score) => score.held_out_accuracy)} fill="none" stroke="#f59e0b" strokeWidth={2} />
            {scores.map((score, position) => (
              <g key={position}>
                <circle cx={toX(position)} cy={toY(score.train_accuracy)} r={3.5} fill="#6366f1" />
                <circle cx={toX(position)} cy={toY(score.held_out_accuracy)} r={3.5} fill="#f59e0b" />
                <text x={toX(position)} y={PAD.top + plot.height + 14} textAnchor="middle" className="fill-slate-400 text-[10px]">{score.max_depth}</text>
              </g>
            ))}
            <line x1={toX(index - 1)} y1={PAD.top} x2={toX(index - 1)} y2={PAD.top + plot.height} stroke="currentColor" className="text-slate-500" strokeDasharray="4 3" />
            <text x={PAD.left + 4} y={PAD.top + 12} className="text-[10px] font-medium" fill="#6366f1">training</text>
            <text x={PAD.left + 4} y={PAD.top + 24} className="text-[10px] font-medium" fill="#f59e0b">held out</text>
            <text x={PAD.left + plot.width / 2} y={CHART.height - 2} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">depth cap</text>
          </svg>
        </div>
        <div>
          <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
            {regions.labels.map((row, rowIndex) =>
              row.map((label, columnIndex) => (
                <rect key={`${rowIndex}-${columnIndex}`} x={mapX(columnIndex)} y={mapY(rowIndex)} width={cell + 0.5} height={cell + 0.5} fill={label === 0 ? CHILD : ADULT} opacity={0.2} />
              )),
            )}
            {points.map((person, position) => (
              <circle key={position} cx={personX(person.x)} cy={personY(person.y)} r={held.has(position) ? 5 : 3.5} fill={held.has(position) ? "none" : person.label === 0 ? CHILD : ADULT} stroke={held.has(position) ? (person.label === 0 ? CHILD : ADULT) : "white"} strokeWidth={held.has(position) ? 2.5 : 1} />
            ))}
            <text x={MAP.width / 2} y={MAP.height - 6} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">regions at this cap, held-out people as rings</text>
          </svg>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="depth reached" value={String(shown.depth_reached)} />
        <Stat label="leaves" value={String(shown.n_leaves)} />
        <Stat label="training accuracy" value={shown.train_accuracy.toFixed(3)} />
        <Stat label="held-out accuracy" value={shown.held_out_accuracy.toFixed(3)} />
      </div>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
