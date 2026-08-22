"use client";

// The cloud sliding until its mean sits on the origin.
//
// The slider moves every person by the same fraction of the same vector,
// the negative of the mean, so the cloud translates without turning or
// changing shape. At zero it is the raw measurements with the mean marked
// and each person's horizontal and vertical deviation drawn; at one it is
// the centred cloud, the deviations unchanged and the mean at the origin.
// The mean is the API's; the slide is arithmetic on it.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { FullAnalysis, analyseFully } from "@/lib/concepts/pca";
import { FIRST, SECOND, WORKED_PEOPLE } from "./pcaFixtures";

const VIEW = { width: 640, height: 380 };
const PAD = { left: 56, right: 16, top: 16, bottom: 40 };
const DOMAIN = { xMin: -30, xMax: 200, yMin: -25, yMax: 95 };

export function CenteringAnimation() {
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [slide, setSlide] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnalysis(await analyseFully(WORKED_PEOPLE));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!analysis) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const plotX = (value: number) => PAD.left + ((value - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * (VIEW.width - PAD.left - PAD.right);
  const plotY = (value: number) => PAD.top + (1 - (value - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * (VIEW.height - PAD.top - PAD.bottom);
  const shift = { x: -slide * analysis.mean.x, y: -slide * analysis.mean.y };
  const moved = (point: Point) => ({ x: point.x + shift.x, y: point.y + shift.y });
  const centre = moved(analysis.mean);

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-32">slide to the origin</span>
        <input type="range" min={0} max={1} step={0.01} value={slide} onChange={(event) => setSlide(Number(event.target.value))} className="flex-1 accent-indigo-600" />
        <span className="w-10 text-right font-mono">{slide.toFixed(2)}</span>
      </label>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <line x1={plotX(0)} x2={plotX(0)} y1={PAD.top} y2={VIEW.height - PAD.bottom} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
        <line x1={PAD.left} x2={VIEW.width - PAD.right} y1={plotY(0)} y2={plotY(0)} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
        {WORKED_PEOPLE.map((point, index) => {
          const here = moved(point);
          return (
            <g key={index}>
              <line x1={plotX(centre.x)} y1={plotY(centre.y)} x2={plotX(here.x)} y2={plotY(centre.y)} stroke={FIRST} strokeWidth={1.5} strokeDasharray="3 3" />
              <line x1={plotX(here.x)} y1={plotY(centre.y)} x2={plotX(here.x)} y2={plotY(here.y)} stroke={SECOND} strokeWidth={1.5} strokeDasharray="3 3" />
            </g>
          );
        })}
        {WORKED_PEOPLE.map((point, index) => {
          const here = moved(point);
          const deviation = analysis.deviations[index];
          return (
            <g key={`p${index}`}>
              <circle cx={plotX(here.x)} cy={plotY(here.y)} r={6} fill="#334155" stroke="white" strokeWidth={1.5} />
              <text x={plotX(here.x) + 9} y={plotY(here.y) - 6} className="fill-slate-600 text-[10px] dark:fill-slate-300">({deviation.x > 0 ? "+" : ""}{deviation.x.toFixed(0)}, {deviation.y > 0 ? "+" : ""}{deviation.y.toFixed(0)})</text>
            </g>
          );
        })}
        <circle cx={plotX(centre.x)} cy={plotY(centre.y)} r={5} fill="white" stroke={FIRST} strokeWidth={2.5} />
        <text x={plotX(centre.x) + 9} y={plotY(centre.y) + 14} className="text-[10px] font-medium" fill={FIRST}>mean ({centre.x.toFixed(0)}, {centre.y.toFixed(0)})</text>
        <text x={PAD.left + (VIEW.width - PAD.left - PAD.right) / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">height, cm, then centred height</text>
        <text x={16} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 16 ${VIEW.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">weight, kg, then centred weight</text>
      </svg>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The labels are each person&rsquo;s deviation from the mean, and they do not change as the cloud slides. Neither do the distances between people, the shape, or the way it leans.
      </p>
    </div>
  );
}
