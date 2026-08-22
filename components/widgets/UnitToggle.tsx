"use client";

// The same people with height written in a different unit.
//
// Metres, centimetres or millimetres, the same eleven heights, and the
// library refits the cloud each time. The covariance matrix changes by
// the factor squared in one cell and by the factor in another, and the
// first component swings from nearly vertical to nearly horizontal, with
// the shares following. Nothing about the people changed. Every fit is
// the API's.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { UnitScaling, rescaleUnits } from "@/lib/concepts/pca";
import { CROWD, FIRST, SECOND } from "./pcaFixtures";

const VIEW = { width: 640, height: 320 };
const PAD = { left: 60, right: 16, top: 16, bottom: 40 };

export function UnitToggle() {
  const [scaling, setScaling] = useState<UnitScaling | null>(null);
  const [chosen, setChosen] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setScaling(await rescaleUnits(CROWD));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!scaling) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const variant = scaling.variants[chosen];
  const heights = CROWD.map((point) => point.x * variant.factor);
  const weights = CROWD.map((point) => point.y);
  const meanX = heights.reduce((sum, value) => sum + value, 0) / heights.length;
  const meanY = weights.reduce((sum, value) => sum + value, 0) / weights.length;
  // Both axes are drawn in their own units at the same pixel scale per
  // standard deviation would hide the point; instead each axis fills the
  // frame, and the arrows are drawn in data units so their tilt is honest.
  const xSpan = Math.max(...heights) - Math.min(...heights);
  const ySpan = Math.max(...weights) - Math.min(...weights);
  const span = Math.max(xSpan, ySpan) * 1.3;
  const domain = { xMin: meanX - span / 2, xMax: meanX + span / 2, yMin: meanY - span / 2, yMax: meanY + span / 2 };
  const plotX = (value: number) => PAD.left + ((value - domain.xMin) / (domain.xMax - domain.xMin)) * (VIEW.width - PAD.left - PAD.right);
  const plotY = (value: number) => PAD.top + (1 - (value - domain.yMin) / (domain.yMax - domain.yMin)) * (VIEW.height - PAD.top - PAD.bottom);
  const [first, second] = variant.components;
  const reach = span * 0.35;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        height in
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {scaling.variants.map((each, index) => (
            <button key={each.unit} onClick={() => setChosen(index)} className={"rounded px-3 py-1 text-sm font-medium transition " + (chosen === index ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}>
              {each.unit}
            </button>
          ))}
        </span>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_230px]">
        <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          <line x1={plotX(meanX - reach * first.dx)} y1={plotY(meanY - reach * first.dy)} x2={plotX(meanX + reach * first.dx)} y2={plotY(meanY + reach * first.dy)} stroke={FIRST} strokeWidth={3} />
          <line x1={plotX(meanX - reach * 0.4 * second.dx)} y1={plotY(meanY - reach * 0.4 * second.dy)} x2={plotX(meanX + reach * 0.4 * second.dx)} y2={plotY(meanY + reach * 0.4 * second.dy)} stroke={SECOND} strokeWidth={2} />
          {heights.map((height, index) => (
            <circle key={index} cx={plotX(height)} cy={plotY(weights[index])} r={5.5} fill="#334155" stroke="white" strokeWidth={1.5} />
          ))}
          <text x={PAD.left + (VIEW.width - PAD.left - PAD.right) / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">height, {variant.unit}, one unit per unit of weight</text>
          <text x={16} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 16 ${VIEW.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">weight, kg</text>
        </svg>
        <div className="text-xs text-slate-600 dark:text-slate-300">
          <p className="font-medium text-slate-700 dark:text-slate-200">covariance matrix</p>
          <div className="mt-1 grid grid-cols-2 gap-1 font-mono">
            {variant.covariance.flat().map((value, index) => (
              <div key={index} className="rounded bg-slate-100 px-2 py-1 text-center dark:bg-slate-800">{value < 1 ? value.toFixed(4) : value.toFixed(1)}</div>
            ))}
          </div>
          <p className="mt-2 font-medium text-slate-700 dark:text-slate-200">first component</p>
          <p className="font-mono">({first.dx.toFixed(3)}, {first.dy.toFixed(3)})</p>
          <p className="font-mono">variance {first.variance < 1 ? first.variance.toFixed(4) : first.variance.toFixed(1)}, share {first.share.toFixed(4)}</p>
          <p className="mt-2 font-medium text-slate-700 dark:text-slate-200">second component</p>
          <p className="font-mono">variance {second.variance < 1 ? second.variance.toFixed(4) : second.variance.toFixed(1)}, share {second.share.toFixed(4)}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The axes are drawn with one unit of height per unit of weight, so the cloud really does flatten onto whichever axis has the bigger numbers, and the first component follows it.
      </p>
    </div>
  );
}
