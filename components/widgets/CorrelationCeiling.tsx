"use client";

// The committee's variance against its size, with the shared part drawn in.
//
// Members of equal variance and equal pairwise correlation ρ average to a
// variance of ρ + (1 − ρ)/B, in units of one member's own variance. The
// slider sets ρ and the curve is drawn against B. The reducible part,
// (1 − ρ)/B, falls away as members are added; the shared part, ρ, is a
// floor no number of members lowers. The three fixed curves come from the
// API's own trace of the same formula, and the slider's curve is that
// formula at whatever ρ the reader chooses. Its assumptions are printed
// beneath it because it is a model of the effect, not a measurement.

import { useEffect, useState } from "react";
import { ApiError, CommitteeVariance, traceCommitteeVariance } from "@/lib/api";

const VIEW = { width: 640, height: 300 };
const PAD = { left: 52, right: 16, top: 12, bottom: 40 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };
const MEMBERS = 100;

export function CorrelationCeiling() {
  const [correlation, setCorrelation] = useState(0.4);
  const [members, setMembers] = useState(25);
  const [traced, setTraced] = useState<CommitteeVariance | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setTraced(await traceCommitteeVariance(MEMBERS));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
      }
    })();
  }, []);

  const toX = (size: number) => PAD.left + ((size - 1) / (MEMBERS - 1)) * PLOT.width;
  const toY = (variance: number) => PAD.top + (1 - variance) * PLOT.height;
  const curve = (rho: number) => Array.from({ length: MEMBERS }, (_, index) => `${index === 0 ? "M" : "L"} ${toX(index + 1).toFixed(1)} ${toY(rho + (1 - rho) / (index + 1)).toFixed(1)}`).join(" ");
  const here = correlation + (1 - correlation) / members;

  return (
    <div>
      <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="w-28">correlation ρ</span>
          <input type="range" min={0} max={0.95} step={0.01} value={correlation} onChange={(event) => setCorrelation(Number(event.target.value))} className="flex-1 accent-indigo-600" />
          <span className="w-10 text-right font-mono">{correlation.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="w-28">members B</span>
          <input type="range" min={1} max={MEMBERS} step={1} value={members} onChange={(event) => setMembers(Number(event.target.value))} className="flex-1 accent-amber-500" />
          <span className="w-10 text-right font-mono">{members}</span>
        </label>
      </div>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} y1={toY(tick)} x2={PAD.left + PLOT.width} y2={toY(tick)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <text x={PAD.left - 8} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">{tick}</text>
          </g>
        ))}
        {traced?.curves.map((each) => (
          <path key={each.correlation} d={each.variances.map((variance, index) => `${index === 0 ? "M" : "L"} ${toX(traced.members[index]).toFixed(1)} ${toY(variance).toFixed(1)}`).join(" ")} fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth={1.5} />
        ))}
        {traced?.curves.map((each) => (
          <text key={`label-${each.correlation}`} x={PAD.left + PLOT.width + 2} y={toY(each.correlation) + 4} className="fill-slate-400 text-[10px]">ρ = {each.correlation}</text>
        ))}
        <rect x={PAD.left} y={toY(correlation)} width={PLOT.width} height={toY(0) - toY(correlation)} fill="#6366f1" opacity={0.08} />
        <line x1={PAD.left} y1={toY(correlation)} x2={PAD.left + PLOT.width} y2={toY(correlation)} stroke="#6366f1" strokeDasharray="5 4" />
        <path d={curve(correlation)} fill="none" stroke="#6366f1" strokeWidth={2.5} />
        <circle cx={toX(members)} cy={toY(here)} r={6} fill="#f59e0b" stroke="white" strokeWidth={1.5} />
        {[1, 25, 50, 75, 100].map((tick) => (
          <text key={tick} x={toX(tick)} y={PAD.top + PLOT.height + 16} textAnchor="middle" className="fill-slate-400 text-[11px]">{tick}</text>
        ))}
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 4} textAnchor="middle" className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">members B</text>
        <text x={14} y={PAD.top + PLOT.height / 2} textAnchor="middle" transform={`rotate(-90 14 ${PAD.top + PLOT.height / 2})`} className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">committee variance, as a share of one member&rsquo;s</text>
      </svg>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="shared part, ρ" value={correlation.toFixed(3)} />
        <Stat label="reducible part, (1 − ρ) / B" value={((1 - correlation) / members).toFixed(3)} />
        <Stat label="committee variance" value={here.toFixed(3)} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The shaded band is the floor, ρ, that adding members never lowers. The formula assumes numeric member outputs of equal variance, one common pairwise correlation, and an equal-weight average, which a majority vote of trees only approximates.
      </p>
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
