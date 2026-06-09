"use client";

// One candidate question, scored the way the split search scores it.
//
// Pick a feature and slide a threshold, and the slider snaps to the
// candidates the search would actually try, the midpoints between
// neighbouring distinct values. The plot draws the cut and colours each
// side, the two containers show what each side holds, and the arithmetic
// runs from counts to shares to Gini to the size-weighted remainder to the
// gain. Three presets are a poor question, a middling one and the clean
// one, so the reader can see what separates them before the search ranks
// every candidate at once. Every impurity is the library's through the API.

import { useEffect, useState } from "react";
import { ApiError, LabelledPoint, SplitInspection, inspectSplit } from "@/lib/api";

export const CLEAN_CROWD: LabelledPoint[] = [
  { x: 147, y: 41, label: 0 },
  { x: 156, y: 53, label: 1 },
  { x: 145, y: 57, label: 0 },
  { x: 159, y: 57, label: 1 },
  { x: 162, y: 61, label: 1 },
  { x: 120, y: 25, label: 0 },
  { x: 122, y: 28, label: 0 },
  { x: 118, y: 24, label: 0 },
  { x: 180, y: 80, label: 1 },
  { x: 183, y: 83, label: 1 },
  { x: 178, y: 78, label: 1 },
];

type FeatureName = "height" | "weight";

const PRESETS: { label: string; feature: FeatureName; threshold: number }[] = [
  { label: "a poor question, height < 121", feature: "height", threshold: 121 },
  { label: "a middling one, height < 146", feature: "height", threshold: 146 },
  { label: "the clean one, height < 151.5", feature: "height", threshold: 151.5 },
];

const VIEW = { width: 640, height: 300 };
const PAD = { left: 52, right: 16, top: 12, bottom: 40 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };
const DOMAIN = { xMin: 110, xMax: 190, yMin: 15, yMax: 90 };

const CHILD = "#f59e0b";
const ADULT = "#6366f1";

function toX(height: number) {
  return PAD.left + ((height - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
}
function toY(weight: number) {
  return PAD.top + (1 - (weight - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height;
}

export function SplitInspector() {
  const [feature, setFeature] = useState<FeatureName>("height");
  const [threshold, setThreshold] = useState(121);
  const [inspection, setInspection] = useState<SplitInspection | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setInspection(await inspectSplit(CLEAN_CROWD, feature, threshold));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [feature, threshold]);

  const candidates = inspection ? inspection.candidates : [];
  const candidateIndex = candidates.length ? candidates.reduce((best, value, index) => (Math.abs(value - threshold) < Math.abs(candidates[best] - threshold) ? index : best), 0) : 0;

  const switchFeature = (next: FeatureName) => {
    setFeature(next);
    setThreshold(next === "height" ? 151.5 : 55);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {PRESETS.map((preset) => (
          <button key={preset.label} onClick={() => { setFeature(preset.feature); setThreshold(preset.threshold); }} className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${feature === preset.feature && threshold === preset.threshold ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-200" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>
            {preset.label}
          </button>
        ))}
        <span className="ml-auto flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {(["height", "weight"] as FeatureName[]).map((option) => (
            <button key={option} onClick={() => switchFeature(option)} className={"rounded px-3 py-1 text-xs font-medium transition " + (feature === option ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}>
              {option}
            </button>
          ))}
        </span>
      </div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-24">{feature} &lt;</span>
        <input type="range" min={0} max={Math.max(0, candidates.length - 1)} step={1} value={candidateIndex} onChange={(event) => setThreshold(candidates[Number(event.target.value)])} className="flex-1 accent-indigo-600" disabled={candidates.length === 0} />
        <span className="w-14 text-right font-mono">{threshold}</span>
      </label>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">The slider snaps to the {candidates.length} candidates the search tries for this feature, each halfway between two neighbouring distinct values.</p>

      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {feature === "height" ? (
          <>
            <rect x={PAD.left} y={PAD.top} width={toX(threshold) - PAD.left} height={PLOT.height} className="fill-amber-100/50 dark:fill-amber-900/20" />
            <rect x={toX(threshold)} y={PAD.top} width={PAD.left + PLOT.width - toX(threshold)} height={PLOT.height} className="fill-indigo-100/50 dark:fill-indigo-900/20" />
            <line x1={toX(threshold)} y1={PAD.top} x2={toX(threshold)} y2={PAD.top + PLOT.height} stroke="#0f172a" strokeWidth={2} strokeDasharray="5 4" className="dark:stroke-slate-100" />
          </>
        ) : (
          <>
            <rect x={PAD.left} y={toY(threshold)} width={PLOT.width} height={PAD.top + PLOT.height - toY(threshold)} className="fill-amber-100/50 dark:fill-amber-900/20" />
            <rect x={PAD.left} y={PAD.top} width={PLOT.width} height={toY(threshold) - PAD.top} className="fill-indigo-100/50 dark:fill-indigo-900/20" />
            <line x1={PAD.left} y1={toY(threshold)} x2={PAD.left + PLOT.width} y2={toY(threshold)} stroke="#0f172a" strokeWidth={2} strokeDasharray="5 4" className="dark:stroke-slate-100" />
          </>
        )}
        {CLEAN_CROWD.map((person, index) => (
          <circle key={index} cx={toX(person.x)} cy={toY(person.y)} r={6} fill={person.label === 0 ? CHILD : ADULT} stroke="white" strokeWidth={1.5} />
        ))}
        {[120, 140, 160, 180].map((tick) => (
          <text key={tick} x={toX(tick)} y={PAD.top + PLOT.height + 16} textAnchor="middle" className="fill-slate-400 text-[11px]">{tick}</text>
        ))}
        {[20, 40, 60, 80].map((tick) => (
          <text key={tick} x={PAD.left - 8} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">{tick}</text>
        ))}
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 4} textAnchor="middle" className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">height (cm) across, weight (kg) up. Amber is children, indigo is adults, and the shaded side is where the answer is yes.</text>
      </svg>

      {inspection && (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Container title="before the question" mixture={inspection.parent} share={1} />
          <Container title={`yes, ${feature} < ${threshold}`} mixture={inspection.left} share={inspection.left.n_samples / inspection.parent.n_samples} />
          <Container title={`no, ${feature} ≥ ${threshold}`} mixture={inspection.right} share={inspection.right.n_samples / inspection.parent.n_samples} />
        </div>
      )}

      {inspection && (
        <div className="mt-3 rounded-md bg-slate-100 px-4 py-3 font-mono text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200">
          <p>weighted remainder = ({inspection.left.n_samples}/{inspection.parent.n_samples}) × {inspection.left.gini.toFixed(4)} + ({inspection.right.n_samples}/{inspection.parent.n_samples}) × {inspection.right.gini.toFixed(4)} = {inspection.weighted_after.toFixed(4)}</p>
          <p className="mt-1">gain = {inspection.parent.gini.toFixed(4)} − {inspection.weighted_after.toFixed(4)} = <span className="font-semibold">{inspection.gain.toFixed(4)}</span></p>
        </div>
      )}
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Container({ title, mixture, share }: { title: string; mixture: SplitInspection["parent"]; share: number }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">{title}</p>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: mixture.children }, (_, index) => <span key={`c${index}`} className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: CHILD }} />)}
        {Array.from({ length: mixture.adults }, (_, index) => <span key={`a${index}`} className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: ADULT }} />)}
        {mixture.n_samples === 0 && <span className="text-xs text-slate-400">nobody</span>}
      </div>
      <div className="mt-2 space-y-0.5 font-mono text-[11px] text-slate-700 dark:text-slate-200">
        <p>{mixture.children} children, {mixture.adults} adults, {mixture.n_samples} in all</p>
        <p>shares {mixture.child_share.toFixed(3)} and {mixture.adult_share.toFixed(3)}</p>
        <p>G = 1 − {mixture.child_share.toFixed(3)}² − {mixture.adult_share.toFixed(3)}² = <span className="font-semibold">{mixture.gini.toFixed(4)}</span></p>
        <p className="text-slate-500 dark:text-slate-400">weight in the average {share.toFixed(3)}</p>
      </div>
    </div>
  );
}
