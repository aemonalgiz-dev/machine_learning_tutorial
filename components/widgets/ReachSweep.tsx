"use client";

// The radial kernel's reach swept, and what the first axis does at each.
//
// Sixteen gammas, evenly spaced in the logarithm, each a fresh fit. For the
// ring and the ideal case the bars are the gap between the two groups along
// the first kernel direction, above zero where every inner person sits to
// one side of every outer person and below where the groups interleave; for
// the arc the bars count how often the first axis turns back when the
// people are read by height. The lines are the first two shares and the
// total lifted variance, and the marker is where the usual rule of thumb,
// one over the median squared distance, falls. Every fit is the library's,
// through the API.

import { useEffect, useState } from "react";
import { ApiError, Sweep, fetchSweep } from "@/lib/concepts/kernel-pca";
import { ARC, FIRST, GAMMA_STOPS, IDEAL_CASE, IDEAL_INNER_COUNT, INNER_COUNT, KEPT, LOST, RING, SECOND } from "./kernelPcaFixtures";

const VIEW = { width: 640, height: 260 };
const PAD = { left: 48, right: 48, top: 14, bottom: 34 };

type Cloud = "ring" | "ideal" | "arc";

const CLOUDS: Record<Cloud, { points: typeof RING; innerCount?: number; label: string }> = {
  ring: { points: RING, innerCount: INNER_COUNT, label: "the ring" },
  ideal: { points: IDEAL_CASE, innerCount: IDEAL_INNER_COUNT, label: "the ideal case" },
  arc: { points: ARC, label: "the arc" },
};

const sweeps = new Map<Cloud, Promise<Sweep>>();

function sweepFor(cloud: Cloud): Promise<Sweep> {
  const cached = sweeps.get(cloud);
  if (cached) return cached;
  const request = fetchSweep(CLOUDS[cloud].points, GAMMA_STOPS, CLOUDS[cloud].innerCount);
  sweeps.set(cloud, request);
  return request;
}

function tidy(value: number, digits: number): string {
  const rounded = Number(value.toFixed(digits));
  return (Object.is(rounded, -0) ? 0 : rounded).toFixed(digits);
}

export function ReachSweep() {
  const [cloud, setCloud] = useState<Cloud>("ring");
  const [sweep, setSweep] = useState<Sweep | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSweep(await sweepFor(cloud));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [cloud]);

  if (!sweep) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const entries = sweep.entries;
  const grouped = cloud !== "arc";
  const bars = entries.map((entry) => (grouped ? (entry.first_axis_gap ?? 0) : entry.order_reversals_along_x));
  const barReach = Math.max(...bars.map((value) => Math.abs(value)), 1e-9);
  const innerWidth = VIEW.width - PAD.left - PAD.right;
  const innerHeight = VIEW.height - PAD.top - PAD.bottom;
  const logMin = Math.log10(GAMMA_STOPS[0]);
  const logMax = Math.log10(GAMMA_STOPS[GAMMA_STOPS.length - 1]);
  const chartX = (gamma: number) => PAD.left + ((Math.log10(gamma) - logMin) / (logMax - logMin)) * innerWidth;
  const mid = PAD.top + innerHeight / 2;
  const barY = (value: number) => mid - (value / barReach) * (innerHeight / 2);
  const shareY = (value: number) => PAD.top + (1 - value) * innerHeight;
  const slot = innerWidth / (GAMMA_STOPS.length - 1);
  const ruleOfThumb = 1 / sweep.median_squared_distance;

  const splitting = entries.filter((entry) => (entry.first_axis_gap ?? -1) > 0);
  const peak = entries.reduce((best, entry) => ((entry.first_axis_gap ?? -Infinity) > (best.first_axis_gap ?? -Infinity) ? entry : best), entries[0]);
  const path = (pick: (entry: Sweep["entries"][number]) => number) => entries.map((entry, index) => `${index === 0 ? "M" : "L"}${chartX(entry.gamma)},${shareY(pick(entry))}`).join(" ");

  return (
    <div>
      <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 text-sm dark:border-slate-700 sm:inline-flex">
        {(Object.keys(CLOUDS) as Cloud[]).map((choice) => (
          <button key={choice} onClick={() => setCloud(choice)} className={"rounded px-2 py-0.5 text-xs font-medium transition " + (cloud === choice ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}>
            {CLOUDS[choice].label}
          </button>
        ))}
      </span>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <line x1={PAD.left} x2={VIEW.width - PAD.right} y1={mid} y2={mid} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
        {entries.map((entry, index) => (
          <rect key={index} x={chartX(entry.gamma) - slot * 0.3} y={Math.min(mid, barY(bars[index]))} width={slot * 0.6} height={Math.abs(mid - barY(bars[index]))} fill={bars[index] > 0 ? (grouped ? KEPT : LOST) : LOST} opacity={0.75} />
        ))}
        <path d={path((entry) => entry.first_share)} fill="none" stroke={FIRST} strokeWidth={2} />
        <path d={path((entry) => entry.second_share)} fill="none" stroke={SECOND} strokeWidth={2} />
        <path d={path((entry) => entry.total_variance)} fill="none" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 3" />
        <line x1={chartX(ruleOfThumb)} x2={chartX(ruleOfThumb)} y1={PAD.top} y2={VIEW.height - PAD.bottom} stroke="#f43f5e" strokeWidth={1} strokeDasharray="3 3" />
        <text x={chartX(ruleOfThumb) + 4} y={PAD.top + 10} className="fill-rose-500 text-[9px]">1 / median</text>
        {GAMMA_STOPS.filter((_, index) => index % 3 === 0).map((gamma) => (
          <text key={gamma} x={chartX(gamma)} y={VIEW.height - 18} textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-slate-400">{gamma}</text>
        ))}
        <text x={PAD.left + innerWidth / 2} y={VIEW.height - 4} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">gamma, logarithmic</text>
        <text x={PAD.left - 4} y={mid + 3} textAnchor="end" className="fill-slate-500 text-[9px] dark:fill-slate-400">0</text>
        <text x={PAD.left - 4} y={PAD.top + 8} textAnchor="end" className="fill-slate-500 text-[9px] dark:fill-slate-400">{grouped ? tidy(barReach, 2) : String(barReach)}</text>
        <text x={VIEW.width - PAD.right + 4} y={PAD.top + 8} className="fill-slate-500 text-[9px] dark:fill-slate-400">1.0</text>
        <text x={VIEW.width - PAD.right + 4} y={VIEW.height - PAD.bottom + 3} className="fill-slate-500 text-[9px] dark:fill-slate-400">0.0</text>
      </svg>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        The bars read on the left scale and show {grouped ? "the gap between the two groups along the first kernel direction, green where the groups come apart and rose where they interleave" : "how often the first kernel direction turns back when the people are read by height"}. The lines read on the right scale, the first share in indigo, the second in amber, and the total lifted variance dashed.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {grouped ? (
          <>
            <Stat label="the split holds from gamma" value={splitting.length ? String(splitting[0].gamma) : "never"} />
            <Stat label="to gamma" value={splitting.length ? String(splitting[splitting.length - 1].gamma) : "never"} />
            <Stat label="widest gap, and at which gamma" value={`${tidy(peak.first_axis_gap ?? 0, 3)} at ${peak.gamma}`} />
            <Stat label="one over the median squared distance" value={ruleOfThumb.toFixed(5)} />
          </>
        ) : (
          <>
            <Stat label="reversals at the widest reach" value={String(entries[0].order_reversals_along_x)} />
            <Stat label="reversals at the sharpest" value={String(entries[entries.length - 1].order_reversals_along_x)} />
            <Stat label="first share, widest to sharpest" value={`${tidy(entries[0].first_share, 3)} to ${tidy(entries[entries.length - 1].first_share, 3)}`} />
            <Stat label="one over the median squared distance" value={ruleOfThumb.toFixed(5)} />
          </>
        )}
      </div>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
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
