"use client";

// One kernel family swept across its parameter, as small multiples.
//
// The same points fitted six times, at six degrees of the polynomial kernel
// or six gammas of the radial one, each panel with its score and the
// condition number of the system that was solved. Laid side by side the
// question is not which is best but what the parameter buys and what it
// costs, which a single curve with a slider hides. Every fit is the
// library's; the browser tiles them.

import { useEffect, useState } from "react";
import { Point } from "@/lib/api";
import { ApiError, KernelChoice, KernelRidgeFit, fitKernelRidge } from "@/lib/concepts/kernel-ridge";
import { DATASET_QUERY, KERNEL_COLOUR, MEAN_COLOUR, boundsOf, formatScore, formatSmall, pointsFor, scalesOf } from "./kernelRidgeFixtures";

const FRAME = { width: 300, height: 190, left: 8, right: 8, top: 8, bottom: 8 };

export function KernelGallery({
  family,
  dataset,
  values,
  penalty = 1,
}: {
  family: "polynomial" | "rbf";
  dataset: "throw" | "crowd";
  values: number[];
  penalty?: number;
}) {
  const [fits, setFits] = useState<KernelRidgeFit[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const points: Point[] = pointsFor(dataset);
  const key = JSON.stringify({ family, dataset, values, penalty });

  useEffect(() => {
    (async () => {
      try {
        const kernels: KernelChoice[] = values.map((value) => (family === "polynomial" ? { name: "polynomial", degree: value } : { name: "rbf", gamma: value }));
        setFits(await Promise.all(kernels.map((kernel) => fitKernelRidge(points, kernel, penalty, DATASET_QUERY[dataset]))));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!fits) return <p className="my-4 text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;

  const bounds = boundsOf(points, fits.map((fit) => fit.curve), 60);
  const { plotX, plotY, pathOf, plotWidth } = scalesOf(bounds, FRAME);

  return (
    <div className="my-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fits.map((fit, index) => (
          <div key={index} className="rounded-lg border border-slate-200 p-2 dark:border-slate-800">
            <svg viewBox={`0 0 ${FRAME.width} ${FRAME.height}`} className="w-full select-none rounded bg-slate-50 dark:bg-slate-950">
              <line x1={FRAME.left} x2={FRAME.left + plotWidth} y1={plotY(fit.target_mean)} y2={plotY(fit.target_mean)} stroke={MEAN_COLOUR} strokeWidth={1} strokeDasharray="2 4" />
              <path d={pathOf(fit.curve)} fill="none" strokeWidth={2} stroke={KERNEL_COLOUR} />
              {points.map((point, each) => (
                <circle key={each} cx={plotX(point.x)} cy={plotY(point.y)} r={3} className="fill-slate-800 stroke-white dark:fill-slate-100 dark:stroke-slate-900" strokeWidth={1} />
              ))}
            </svg>
            <div className="mt-1 flex items-baseline justify-between font-mono text-xs text-slate-700 dark:text-slate-300">
              <span>{family === "polynomial" ? `degree ${values[index]}` : `gamma ${formatSmall(values[index])}`}</span>
              <span>R² {formatScore(fit.r_squared)}</span>
            </div>
            <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">condition {fit.condition_number.toExponential(1)} · largest weight {fit.max_abs_dual_weight.toFixed(2)}</div>
          </div>
        ))}
      </div>
      {message && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>}
    </div>
  );
}
