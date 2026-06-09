"use client";

// One set of points, fitted twice.
//
// The bold curve is kernel ridge regression through whichever kernel is
// selected, and the grey line behind it is ordinary ridge regression on the
// same points at the same penalty. Under the linear kernel the two lie exactly
// on top of one another, which is the control the page leans on; under every
// other kernel the bold curve bends and the grey line cannot. The dual
// weights underneath are one per point, and the readouts say how far the two
// fits part and how well conditioned the system was. Every curve, weight and
// score comes from the library through the API; the browser scales numbers
// to pixels.

import { useEffect, useState } from "react";
import { Point } from "@/lib/api";
import {
  ApiError,
  KernelChoice,
  KernelName,
  KernelRidgeFit,
  fitKernelRidge,
} from "@/lib/concepts/kernel-ridge";
import {
  ACTIVE_CLASS,
  BUTTON_CLASS,
  DATASET_LABELS,
  DATASET_QUERY,
  DatasetName,
  KERNEL_COLOUR,
  MEAN_COLOUR,
  RIDGE_COLOUR,
  axisLabels,
  boundsOf,
  formatScore,
  formatSmall,
  pointsFor,
  scalesOf,
} from "./kernelRidgeFixtures";

const FRAME = { width: 640, height: 380, left: 52, right: 18, top: 16, bottom: 44 };
const DEBOUNCE_MS = 140;
const DATASETS: DatasetName[] = ["three", "crowd", "throw", "ideal", "random"];

const KERNEL_TITLES: Record<KernelName, string> = {
  linear: "Linear",
  polynomial: "Polynomial",
  rbf: "Radial basis",
  sigmoid: "Sigmoid",
};

// The radial kernel's gamma is in the feature's own squared units, so the
// slider has to reach a thousandth for heights in centimetres and ten for
// times in seconds, and it is logarithmic for that reason.
function gammaFor(dataset: DatasetName): number {
  return dataset === "crowd" ? 0.01 : 1;
}

export function KernelRidgePlayground() {
  const [dataset, setDataset] = useState<DatasetName>("three");
  const [points, setPoints] = useState<Point[]>(pointsFor("three"));
  const [kernelName, setKernelName] = useState<KernelName>("linear");
  const [degree, setDegree] = useState(2);
  const [logGamma, setLogGamma] = useState(0);
  const [constant, setConstant] = useState(0);
  const [logPenalty, setLogPenalty] = useState(0);
  const [queryX, setQueryX] = useState(DATASET_QUERY.three);
  const [answer, setAnswer] = useState<KernelRidgeFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const penalty = 10 ** logPenalty;
  const gamma = 10 ** logGamma;
  const kernel: KernelChoice =
    kernelName === "linear"
      ? { name: "linear" }
      : kernelName === "polynomial"
        ? { name: "polynomial", degree }
        : kernelName === "rbf"
          ? { name: "rbf", gamma }
          : { name: "sigmoid", gamma, constant };

  const key = JSON.stringify({ points, kernel, penalty, queryX });

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await fitKernelRidge(points, kernel, penalty, queryX));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // The request is a pure function of the key, so the key is the one
    // dependency that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const bounds = boundsOf(points, answer ? [answer.curve, answer.ridge_curve] : [], 200);
  const { plotX, plotY, pathOf, plotWidth, plotHeight } = scalesOf(bounds, FRAME);
  const coincide = answer !== null && answer.largest_gap < 1e-9;
  const labels = axisLabels(dataset);
  const xs = points.map((point) => point.x);
  const queryMin = Math.min(...xs);
  const queryMax = Math.max(...xs);

  const choose = (next: DatasetName) => {
    const nextPoints = pointsFor(next);
    setDataset(next);
    setPoints(nextPoints);
    setQueryX(next === "random" ? DATASET_QUERY.throw : DATASET_QUERY[next]);
    setLogGamma(Math.log10(gammaFor(next)));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {DATASETS.map((name) => (
          <button key={name} onClick={() => choose(name)} className={dataset === name ? ACTIVE_CLASS : BUTTON_CLASS}>
            {DATASET_LABELS[name]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 pb-3">
        {(Object.keys(KERNEL_TITLES) as KernelName[]).map((name) => (
          <button key={name} onClick={() => setKernelName(name)} className={name === kernelName ? ACTIVE_CLASS : BUTTON_CLASS}>
            {KERNEL_TITLES[name]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          penalty
          <input type="range" min={-3} max={2} step={0.25} value={logPenalty} onChange={(event) => setLogPenalty(Number(event.target.value))} className="w-32 accent-indigo-600" />
          <span className="w-16 font-mono text-sm">{formatSmall(penalty)}</span>
        </label>
        {kernelName === "polynomial" && (
          <label className="flex items-center gap-2">
            degree
            <input type="range" min={1} max={6} step={1} value={degree} onChange={(event) => setDegree(Number(event.target.value))} className="w-24 accent-emerald-600" />
            <span className="w-4 font-mono text-sm">{degree}</span>
          </label>
        )}
        {(kernelName === "rbf" || kernelName === "sigmoid") && (
          <label className="flex items-center gap-2">
            gamma
            <input type="range" min={-4} max={2} step={0.25} value={logGamma} onChange={(event) => setLogGamma(Number(event.target.value))} className="w-28 accent-emerald-600" />
            <span className="w-16 font-mono text-sm">{formatSmall(gamma)}</span>
          </label>
        )}
        {kernelName === "sigmoid" && (
          <label className="flex items-center gap-2">
            constant
            <input type="range" min={-2} max={2} step={0.25} value={constant} onChange={(event) => setConstant(Number(event.target.value))} className="w-24 accent-emerald-600" />
            <span className="w-10 font-mono text-sm">{constant.toFixed(2)}</span>
          </label>
        )}
        <label className="flex items-center gap-2">
          ask at
          <input type="range" min={queryMin} max={queryMax} step={(queryMax - queryMin) / 100} value={queryX} onChange={(event) => setQueryX(Number(event.target.value))} className="w-28 accent-amber-500" />
          <span className="w-14 font-mono text-sm">{queryX.toFixed(2)}</span>
        </label>
      </div>

      <svg viewBox={`0 0 ${FRAME.width} ${FRAME.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {answer && (
          <>
            <line x1={FRAME.left} x2={FRAME.left + plotWidth} y1={plotY(answer.target_mean)} y2={plotY(answer.target_mean)} stroke={MEAN_COLOUR} strokeWidth={1} strokeDasharray="2 4" />
            <path d={pathOf(answer.ridge_curve)} fill="none" strokeWidth={coincide ? 6 : 2} strokeDasharray={coincide ? undefined : "6 4"} stroke={RIDGE_COLOUR} />
            <path d={pathOf(answer.curve)} fill="none" strokeWidth={2.5} stroke={KERNEL_COLOUR} />
            <line x1={plotX(queryX)} x2={plotX(queryX)} y1={FRAME.top} y2={FRAME.top + plotHeight} className="stroke-amber-500" strokeDasharray="3 3" strokeWidth={1.5} />
          </>
        )}
        {points.map((point, index) => (
          <circle key={index} cx={plotX(point.x)} cy={plotY(point.y)} r={4} className="fill-slate-800 stroke-white dark:fill-slate-100 dark:stroke-slate-900" strokeWidth={1.5} />
        ))}
        <text x={FRAME.left + plotWidth / 2} y={FRAME.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">{labels.x}</text>
        <text x={14} y={FRAME.top + plotHeight / 2} textAnchor="middle" transform={`rotate(-90 14 ${FRAME.top + plotHeight / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">{labels.y}</text>
        <text x={FRAME.left + plotWidth} y={FRAME.top + 12} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">bold, the kernel fit · grey, ordinary ridge · dotted, the target mean</text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="kernel fit R²" value={answer ? formatScore(answer.r_squared) : "…"} />
        <Stat label="ridge line R²" value={answer ? formatScore(answer.ridge_r_squared) : "…"} />
        <Stat label={`kernel at ${queryX.toFixed(2)}`} value={answer ? answer.prediction_at_query.toFixed(3) : "…"} />
        <Stat label={`ridge at ${queryX.toFixed(2)}`} value={answer ? answer.ridge_at_query.toFixed(3) : "…"} />
        <Stat label="largest gap between the two" value={answer ? (coincide ? "0 to rounding" : answer.largest_gap.toFixed(3)) : "…"} />
        <Stat label="rows the model keeps" value={answer ? String(answer.n_training_rows) : "…"} />
        <Stat label="smallest Gram eigenvalue" value={answer ? answer.gram_smallest_eigenvalue.toExponential(2) : "…"} />
        <Stat label="condition number, with penalty" value={answer ? answer.condition_number.toExponential(2) : "…"} />
      </div>

      {answer && (
        <div className="mt-3">
          <div className="mb-1 text-xs text-slate-500 dark:text-slate-400">
            Dual weights, one per point in the order drawn
            {answer.implied_slope !== null ? `, adding up through the centred inputs to a slope of ${answer.implied_slope.toFixed(4)}` : ", with no slope to add up to"}
          </div>
          <div className="flex flex-wrap gap-1 font-mono text-xs">
            {answer.dual_weights.map((weight, index) => (
              <span key={index} className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{weight.toFixed(3)}</span>
            ))}
          </div>
        </div>
      )}

      {message && <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{message}</p>}
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
