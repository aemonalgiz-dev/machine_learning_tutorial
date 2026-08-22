"use client";

// The most variance and the most useful variance are not the same direction.
//
// Fourteen people whose cloud runs long along height. Unlabelled, the
// library's first component follows that length, as it should. Reveal the
// labels and the two groups differ across the cloud's short axis, weight
// for a given height, which is almost exactly what one component
// discards. The number lines beneath show each person's score on the
// first component, where the groups overlap, and on the second, where
// they part. The fit is the API's and never saw the labels.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { FullAnalysis, analyseFully } from "@/lib/concepts/pca";
import { FIRST, SECOND, SPLIT_CROWD } from "./pcaFixtures";

const VIEW = { width: 640, height: 320 };
const PAD = { left: 56, right: 16, top: 16, bottom: 40 };
const LINE = { width: 640, height: 40 };
const GROUP_COLOURS = ["#0ea5e9", "#f43f5e"];

export function PredictiveDirection() {
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const points = SPLIT_CROWD.map((each) => each.point);

  useEffect(() => {
    (async () => {
      try {
        setAnalysis(await analyseFully(points));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!analysis) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const domain = { xMin: 120, xMax: 205, yMin: 28, yMax: 90 };
  const plotX = (value: number) => PAD.left + ((value - domain.xMin) / (domain.xMax - domain.xMin)) * (VIEW.width - PAD.left - PAD.right);
  const plotY = (value: number) => PAD.top + (1 - (value - domain.yMin) / (domain.yMax - domain.yMin)) * (VIEW.height - PAD.top - PAD.bottom);
  const [first, second] = analysis.components;
  const reach = 45;
  const colour = (index: number) => (revealed ? GROUP_COLOURS[SPLIT_CROWD[index].group] : "#334155");
  const lineFor = (read: (score: { first: number; second: number }) => number, label: string, tint: string) => {
    const values = analysis.scores.map(read);
    const span = Math.max(...values.map((value) => Math.abs(value))) * 1.15 || 1;
    const lineX = (value: number) => PAD.left + ((value + span) / (2 * span)) * (LINE.width - PAD.left - PAD.right);
    return (
      <svg viewBox={`0 0 ${LINE.width} ${LINE.height}`} className="w-full select-none">
        <line x1={PAD.left} x2={LINE.width - PAD.right} y1={LINE.height / 2} y2={LINE.height / 2} stroke={tint} strokeWidth={1.5} />
        <text x={PAD.left - 6} y={LINE.height / 2 + 4} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">{label}</text>
        {values.map((value, index) => (
          <circle key={index} cx={lineX(value)} cy={LINE.height / 2} r={5} fill={colour(index)} stroke="white" strokeWidth={1.5} />
        ))}
      </svg>
    );
  };

  return (
    <div>
      <button onClick={() => setRevealed(!revealed)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
        {revealed ? "Hide the groups" : "Reveal the groups"}
      </button>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <line x1={plotX(analysis.mean.x - reach * first.dx)} y1={plotY(analysis.mean.y - reach * first.dy)} x2={plotX(analysis.mean.x + reach * first.dx)} y2={plotY(analysis.mean.y + reach * first.dy)} stroke={FIRST} strokeWidth={3} />
        <line x1={plotX(analysis.mean.x - reach * 0.4 * second.dx)} y1={plotY(analysis.mean.y - reach * 0.4 * second.dy)} x2={plotX(analysis.mean.x + reach * 0.4 * second.dx)} y2={plotY(analysis.mean.y + reach * 0.4 * second.dy)} stroke={SECOND} strokeWidth={2} />
        {points.map((point, index) => (
          <circle key={index} cx={plotX(point.x)} cy={plotY(point.y)} r={6} fill={colour(index)} stroke="white" strokeWidth={1.5} />
        ))}
        <text x={PAD.left + (VIEW.width - PAD.left - PAD.right) / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">height, cm</text>
        <text x={16} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 16 ${VIEW.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">weight, kg</text>
      </svg>
      {lineFor((score) => score.first, "component 1", FIRST)}
      {lineFor((score) => score.second, "component 2", SECOND)}
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Component 1 carries {(first.share * 100).toFixed(1)} percent of the variance and component 2 the remaining {(second.share * 100).toFixed(1)}. Keep one component and every person is placed on the first line, where the two groups sit on top of each other.
      </p>
    </div>
  );
}
