"use client";

// The first component pointed one way, then the other.
//
// The library reports the crowd's first direction with whatever sign its
// solver returned. Flipping it negates every score and nothing else: the
// axis drawn through the cloud is the same line, the shares are the same
// numbers, and every person's one-component reconstruction lands on the
// same spot. The fit is the API's; the flip is a sign.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { FullAnalysis, analyseFully } from "@/lib/concepts/pca";
import { CROWD, FIRST, KEPT } from "./pcaFixtures";

const VIEW = { width: 640, height: 340 };
const PAD = { left: 56, right: 16, top: 16, bottom: 40 };
const DOMAIN = { xMin: 110, xMax: 190, yMin: 15, yMax: 90 };

export function SignFlip() {
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnalysis(await analyseFully(CROWD));
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
  const sign = flipped ? -1 : 1;
  const first = analysis.components[0];
  const direction = { dx: sign * first.dx, dy: sign * first.dy };
  const reach = 45;
  const tip = { x: analysis.mean.x + reach * direction.dx, y: analysis.mean.y + reach * direction.dy };
  const tail = { x: analysis.mean.x - reach * direction.dx, y: analysis.mean.y - reach * direction.dy };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <button onClick={() => setFlipped(!flipped)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
          Flip the sign
        </button>
        <span className="font-mono">u₁ = ({direction.dx.toFixed(2)}, {direction.dy.toFixed(2)})</span>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_220px]">
        <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          <line x1={plotX(tail.x)} y1={plotY(tail.y)} x2={plotX(tip.x)} y2={plotY(tip.y)} stroke={FIRST} strokeWidth={1.5} strokeDasharray="6 4" />
          <line x1={plotX(analysis.mean.x)} y1={plotY(analysis.mean.y)} x2={plotX(tip.x)} y2={plotY(tip.y)} stroke={FIRST} strokeWidth={3.5} />
          <circle cx={plotX(tip.x)} cy={plotY(tip.y)} r={5} fill={FIRST} />
          {CROWD.map((point, index) => (
            <g key={index}>
              <circle cx={plotX(analysis.reconstructions[index].x)} cy={plotY(analysis.reconstructions[index].y)} r={4} fill={KEPT} />
              <circle cx={plotX(point.x)} cy={plotY(point.y)} r={5.5} fill="#334155" stroke="white" strokeWidth={1.5} />
            </g>
          ))}
          <text x={PAD.left + (VIEW.width - PAD.left - PAD.right) / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">height, cm</text>
          <text x={16} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 16 ${VIEW.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">weight, kg</text>
        </svg>
        <div className="text-xs text-slate-600 dark:text-slate-300">
          <p className="font-medium text-slate-700 dark:text-slate-200">first-component scores</p>
          <div className="mt-1 grid grid-cols-2 gap-x-2 font-mono">
            {analysis.scores.map((score, index) => (
              <span key={index}>{index + 1}. {(sign * score.first) > 0 ? "+" : ""}{(sign * score.first).toFixed(1)}</span>
            ))}
          </div>
          <p className="mt-2">share of component 1 <span className="font-mono font-semibold">{first.share.toFixed(4)}</span></p>
          <p>reconstructions <span className="font-mono font-semibold">unmoved</span></p>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The fitted direction came back as ({first.dx.toFixed(2)}, {first.dy.toFixed(2)}), pointing toward shorter and lighter. Flipped, the arrow points the other way along the same dashed line, every score changes sign, and the green shadows do not move.
      </p>
    </div>
  );
}
