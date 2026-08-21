"use client";

// The same three people, three ways of handing the heights over.
//
// Raw, the loss over intercept and slope is a valley fifty million times
// longer than it is wide, because the two settings pull against each other
// near heights of 170. Centred, the level and the slope stop pulling
// against each other and the contours line up with the axes, though the
// bowl is still seventeen times steeper one way than the other. Scaled by
// the library's own standard deviation, the two curvatures are equal and
// the contours are circles. The same learning rate is walked across all
// three, and the walk that runs away on raw heights arrives on centred ones
// and lands in a single pass on scaled ones at η = 0.5. Every lattice, every
// curvature and every walk is the API's.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { LossSurface, Parameterisation, sampleLossSurface } from "@/lib/concepts/gradient-descent-regression";
import { ContourMap } from "./ContourMap";

const WORKED_THREE: Point[] = [
  { x: 165, y: 62 },
  { x: 170, y: 68 },
  { x: 175, y: 68 },
];

const MODES: { key: Parameterisation; label: string }[] = [
  { key: "raw", label: "raw heights" },
  { key: "centred", label: "centred" },
  { key: "scaled", label: "centred and scaled" },
];
const PASSES = 200;

function formatBig(value: number): string {
  if (!Number.isFinite(value)) return "∞";
  if (value >= 1e5) return value.toExponential(2);
  if (value >= 100) return value.toFixed(0);
  return value.toFixed(value >= 10 ? 1 : 3);
}

export function ConditioningPlayground() {
  const [mode, setMode] = useState<Parameterisation>("raw");
  const [rate, setRate] = useState(0.02);
  const [surfaces, setSurfaces] = useState<Partial<Record<Parameterisation, LossSurface>>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const answers = await Promise.all(MODES.map((each) => sampleLossSurface(WORKED_THREE, each.key, rate, PASSES)));
        setSurfaces(Object.fromEntries(MODES.map((each, index) => [each.key, answers[index]])));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [rate]);

  const surface = surfaces[mode];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex gap-1">
          {MODES.map((each) => (
            <button
              key={each.key}
              onClick={() => setMode(each.key)}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                mode === each.key
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-200"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {each.label}
            </button>
          ))}
        </span>
        <label className="ml-auto flex items-center gap-2">
          rate
          <input type="range" min={-5} max={0} step={0.05} value={Math.log10(rate)} onChange={(event) => setRate(Number((10 ** Number(event.target.value)).toPrecision(3)))} className="w-36 accent-indigo-600" />
          <span className="w-20 font-mono">{rate.toPrecision(3)}</span>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_260px]">
        {surface ? (
          <ContourMap firstAxis={surface.first_axis} secondAxis={surface.second_axis} values={surface.losses} width={360} height={300} firstLabel={surface.first_name} secondLabel={surface.second_name}>
            {({ toX, toY, clampX, clampY }) => (
              <>
                <path d={surface.walk.map((step, position) => `${position === 0 ? "M" : "L"} ${clampX(toX(step.first)).toFixed(1)} ${clampY(toY(step.second)).toFixed(1)}`).join(" ")} fill="none" stroke="#0f172a" strokeWidth={1.5} opacity={0.85} />
                <circle cx={toX(surface.optimum.first)} cy={toY(surface.optimum.second)} r={5} fill="#10b981" stroke="white" strokeWidth={1.5} />
                <circle cx={clampX(toX(surface.walk[surface.walk.length - 1].first))} cy={clampY(toY(surface.walk[surface.walk.length - 1].second))} r={4} fill="#0f172a" stroke="white" strokeWidth={1.5} />
              </>
            )}
          </ContourMap>
        ) : (
          <p className="text-sm text-slate-500">…</p>
        )}
        <div className="grid grid-cols-2 gap-2 self-start sm:grid-cols-1">
          <Stat label="smallest curvature" value={surface ? formatBig(surface.smallest_curvature) : "…"} />
          <Stat label="largest curvature" value={surface ? formatBig(surface.largest_curvature) : "…"} />
          <Stat label="condition number" value={surface ? formatBig(surface.condition_number) : "…"} />
          <Stat label="largest safe rate" value={surface ? surface.divergence_threshold.toPrecision(3) : "…"} />
          <Stat label="optimum" value={surface ? `(${surface.optimum.first.toFixed(2)}, ${surface.optimum.second.toFixed(3)})` : "…"} />
          <Stat label="loss there" value={surface ? surface.optimum.loss.toFixed(2) : "…"} />
          <Stat label="walk at this rate" value={surface ? `${surface.outcome.replace(/_/g, " ")}, ${surface.walk.length - 1} passes` : "…"} />
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The lattice is centred on the optimum and wide enough to hold the start at zero. The contours cannot show a valley fifty million to one at this resolution, which is itself the point about raw heights.
      </p>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
