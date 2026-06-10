"use client";

// Two gradient walks to the same line, one on the recorded heights and one on
// centred heights.
//
// Each walk steps at half the rate that would make it diverge, and the chart
// plots how much of the way to the least-squares answer its slope and its
// level have come, against the number of passes on a logarithmic scale. The
// checkpoints are the library's own walk capped at each pass count, which is
// where the uncapped walk stood at that pass, since a walk starts from zero
// every time and takes the same steps. The API walks; the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { CrowdMeasurements, WalkReport, fetchCrowdMeasurements } from "@/lib/concepts/centring-on-the-mean";
import { CENTRED, RAW } from "./centringFixtures";

const CHART = { width: 640, height: 280 };
const PAD = { left: 52, right: 20, top: 16, bottom: 40 };
const LAST_PASS = 20_000;

export function WalkFromTheMean() {
  const [crowd, setCrowd] = useState<CrowdMeasurements | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCrowd(await fetchCrowdMeasurements());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!crowd) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const innerWidth = CHART.width - PAD.left - PAD.right;
  const innerHeight = CHART.height - PAD.top - PAD.bottom;
  const chartX = (passes: number) => PAD.left + (Math.log10(passes) / Math.log10(LAST_PASS)) * innerWidth;
  const chartY = (fraction: number) => PAD.top + (1 - Math.max(-0.05, Math.min(1.05, fraction)) / 1.05) * innerHeight;

  const distinct = (walk: WalkReport) => walk.checkpoints.filter((point, index, all) => index === 0 || point.passes !== all[index - 1].passes);
  const path = (walk: WalkReport, part: "slope" | "level") =>
    distinct(walk)
      .map((point, index) => {
        const fraction = part === "slope" ? point.slope / walk.target_slope : point.level / walk.target_level;
        return `${index === 0 ? "M" : "L"}${chartX(point.passes)},${chartY(fraction)}`;
      })
      .join(" ");

  const colour = (walk: WalkReport) => (walk.reading === "raw" ? RAW : CENTRED);
  const title = (walk: WalkReport) => (walk.reading === "raw" ? "recorded heights" : "centred heights");

  return (
    <div>
      <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <line x1={PAD.left} x2={CHART.width - PAD.right} y1={chartY(1)} y2={chartY(1)} className="stroke-slate-300 dark:stroke-slate-700" strokeDasharray="3 3" />
        <line x1={PAD.left} x2={CHART.width - PAD.right} y1={chartY(0)} y2={chartY(0)} className="stroke-slate-300 dark:stroke-slate-700" />
        {[1, 10, 100, 1000, 10_000].map((tick) => (
          <g key={tick}>
            <line x1={chartX(tick)} x2={chartX(tick)} y1={PAD.top} y2={CHART.height - PAD.bottom} className="stroke-slate-200 dark:stroke-slate-800" />
            <text x={chartX(tick)} y={CHART.height - PAD.bottom + 14} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">{tick.toLocaleString("en-GB")}</text>
          </g>
        ))}
        <text x={PAD.left - 6} y={chartY(1) + 4} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">all</text>
        <text x={PAD.left - 6} y={chartY(0) + 4} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">none</text>
        {crowd.walks.map((walk) => (
          <g key={walk.reading}>
            <path d={path(walk, "slope")} fill="none" stroke={colour(walk)} strokeWidth={2.5} />
            <path d={path(walk, "level")} fill="none" stroke={colour(walk)} strokeWidth={2} strokeDasharray="6 4" />
            <circle cx={chartX(walk.passes)} cy={chartY(walk.level / walk.target_level)} r={4} fill={colour(walk)} />
            <text x={chartX(walk.passes) - 6} y={chartY(walk.level / walk.target_level) - 8} textAnchor="end" className="text-[10px] font-medium" fill={colour(walk)}>
              {walk.converged ? `stopped itself at ${walk.passes.toLocaleString("en-GB")}` : `cap of ${walk.passes.toLocaleString("en-GB")}, unfinished`}
            </text>
          </g>
        ))}
        <text x={PAD.left + innerWidth / 2} y={CHART.height - 8} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">passes, on a logarithmic scale</text>
        <text x={14} y={PAD.top + innerHeight / 2} textAnchor="middle" transform={`rotate(-90 14 ${PAD.top + innerHeight / 2})`} className="fill-slate-500 text-[10px] dark:fill-slate-400">share of the way to the answer</text>
      </svg>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Solid lines are the slope, dashed lines the level, each as a share of where the least-squares line puts it.</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {crowd.walks.map((walk) => (
          <div key={walk.reading} className="rounded-lg border p-3" style={{ borderColor: `${colour(walk)}66` }}>
            <p className="mb-2 text-sm font-medium" style={{ color: colour(walk) }}>{title(walk)}</p>
            <div className="grid grid-cols-2 gap-1.5">
              <Stat label="cosine, ones and heights" value={Math.abs(walk.ones_cosine) < 1e-6 ? walk.ones_cosine.toExponential(1) : walk.ones_cosine.toFixed(4)} />
              <Stat label="condition number" value={walk.condition_number.toLocaleString("en-GB", { maximumFractionDigits: 1 })} />
              <Stat label="step size" value={walk.learning_rate.toPrecision(3)} />
              <Stat label="passes" value={`${walk.passes.toLocaleString("en-GB")}${walk.converged ? "" : ", unfinished"}`} />
              <Stat label="slope, and its target" value={`${walk.slope.toFixed(4)} of ${walk.target_slope.toFixed(4)}`} />
              <Stat label="level, and its target" value={`${walk.level.toFixed(2)} of ${walk.target_level.toFixed(2)}`} />
            </div>
          </div>
        ))}
      </div>
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
