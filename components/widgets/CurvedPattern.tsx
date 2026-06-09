"use client";

// A one-dimensional pattern no straight axis follows.
//
// Twelve people along a bend. There is one number that places each of
// them, their position along the curve, and the library's first component
// cannot find it, because it is a straight line and the pattern is not.
// The green shadows are the one-component reconstructions and the stubs
// what they lose, which here is most of the shape. The fit is the API's.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { FullAnalysis, analyseFully } from "@/lib/concepts/pca";
import { ARC, FIRST, KEPT, LOST } from "./pcaFixtures";

const VIEW = { width: 640, height: 320 };
const PAD = { left: 56, right: 16, top: 16, bottom: 40 };
const DOMAIN = { xMin: 110, xMax: 210, yMin: 20, yMax: 90 };

export function CurvedPattern() {
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnalysis(await analyseFully(ARC));
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
  const first = analysis.components[0];
  const reach = 55;
  const ordered = [...ARC].sort((left, right) => left.x - right.x);

  return (
    <div>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <path d={ordered.map((point, index) => `${index === 0 ? "M" : "L"}${plotX(point.x)},${plotY(point.y)}`).join(" ")} fill="none" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1.5} strokeDasharray="4 4" />
        <line x1={plotX(analysis.mean.x - reach * first.dx)} y1={plotY(analysis.mean.y - reach * first.dy)} x2={plotX(analysis.mean.x + reach * first.dx)} y2={plotY(analysis.mean.y + reach * first.dy)} stroke={FIRST} strokeWidth={3} />
        {ARC.map((point, index) => {
          const shadow = analysis.reconstructions[index];
          return (
            <g key={index}>
              <line x1={plotX(point.x)} y1={plotY(point.y)} x2={plotX(shadow.x)} y2={plotY(shadow.y)} stroke={LOST} strokeWidth={1.5} />
              <circle cx={plotX(shadow.x)} cy={plotY(shadow.y)} r={4} fill={KEPT} />
              <circle cx={plotX(point.x)} cy={plotY(point.y)} r={5.5} fill="#334155" stroke="white" strokeWidth={1.5} />
            </g>
          );
        })}
        <text x={PAD.left + (VIEW.width - PAD.left - PAD.right) / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">height, cm</text>
        <text x={16} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 16 ${VIEW.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">weight, kg</text>
      </svg>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="share of component 1" value={first.share.toFixed(3)} />
        <Stat label="share of component 2" value={analysis.components[1].share.toFixed(3)} />
        <Stat label="one-component reconstruction error" value={analysis.reconstruction_error_one.toFixed(0)} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The dashed curve is the pattern, one number per person, and the indigo line is the best straight axis through it. The two groups at the ends of the bend are folded onto the same stretch of the line.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
