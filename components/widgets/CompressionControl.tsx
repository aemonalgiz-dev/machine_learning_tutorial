"use client";

// Keeping fewer of five measurements, and what each one kept buys.
//
// Sixty people measured five ways, standardised, and decomposed by the
// library into five components. The bars are each component's share of
// the variance and the line their running total. The slider chooses how
// many to keep and updates the numbers a caller would actually care about:
// how many values are stored per person, how much of the variance those
// values carry, and the total squared error when the five measurements are
// rebuilt from them. Every fit is the library's.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { BodyMeasurements, fetchBodyMeasurements } from "@/lib/concepts/pca";
import { FIRST, KEPT } from "./pcaFixtures";

const CHART = { width: 640, height: 240 };
const PAD = { left: 50, right: 50, top: 16, bottom: 36 };

export function CompressionControl() {
  const [body, setBody] = useState<BodyMeasurements | null>(null);
  const [kept, setKept] = useState(2);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setBody(await fetchBodyMeasurements());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!body) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const count = body.components.length;
  const innerWidth = CHART.width - PAD.left - PAD.right;
  const innerHeight = CHART.height - PAD.top - PAD.bottom;
  const slot = innerWidth / count;
  const barX = (index: number) => PAD.left + index * slot + slot * 0.2;
  const chartY = (value: number) => PAD.top + (1 - value) * innerHeight;
  const total = body.reconstruction_errors[0] + body.components[0].share * 0;
  const worst = body.rows.length * body.names.length;

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-32">components kept</span>
        <input type="range" min={1} max={count} step={1} value={kept} onChange={(event) => setKept(Number(event.target.value))} className="flex-1 accent-indigo-600" />
        <span className="w-10 text-right font-mono">{kept}</span>
      </label>
      <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {[0, 0.5, 1].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={CHART.width - PAD.right} y1={chartY(tick)} y2={chartY(tick)} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={0.5} />
            <text x={PAD.left - 6} y={chartY(tick) + 3} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">{tick.toFixed(1)}</text>
          </g>
        ))}
        {body.components.map((component, index) => (
          <g key={component.name}>
            <rect x={barX(index)} y={chartY(component.share)} width={slot * 0.6} height={innerHeight - (chartY(component.share) - PAD.top)} fill={index < kept ? FIRST : "#cbd5e1"} opacity={0.85} />
            <text x={barX(index) + slot * 0.3} y={chartY(component.share) - 4} textAnchor="middle" className="fill-slate-600 text-[10px] dark:fill-slate-300">{component.share.toFixed(3)}</text>
            <text x={barX(index) + slot * 0.3} y={CHART.height - PAD.bottom + 14} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">component {index + 1}</text>
          </g>
        ))}
        <path d={body.components.map((component, index) => `${index === 0 ? "M" : "L"}${barX(index) + slot * 0.3},${chartY(component.cumulative_share)}`).join(" ")} fill="none" stroke={KEPT} strokeWidth={2} />
        {body.components.map((component, index) => (
          <circle key={component.name} cx={barX(index) + slot * 0.3} cy={chartY(component.cumulative_share)} r={index + 1 === kept ? 6 : 3.5} fill={KEPT} stroke="white" strokeWidth={1.5} />
        ))}
        <text x={CHART.width - PAD.right + 6} y={chartY(body.components[kept - 1].cumulative_share) + 4} className="text-[10px] font-medium" fill={KEPT}>{body.components[kept - 1].cumulative_share.toFixed(3)}</text>
        <text x={CHART.width / 2} y={CHART.height - 4} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">bars are each component&rsquo;s share, the green line is the running total</text>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="values stored per person" value={`${kept} of ${count}`} />
        <Stat label="variance carried" value={body.components[kept - 1].cumulative_share.toFixed(3)} />
        <Stat label="reconstruction error, squared" value={body.reconstruction_errors[kept - 1].toFixed(1)} />
        <Stat label="of the total spread" value={`${((body.reconstruction_errors[kept - 1] / worst) * 100).toFixed(1)}%`} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {body.rows.length} people, {count} standardised measurements, so the total squared spread is {worst} and keeping every component rebuilds it exactly. The first component alone leaves {body.reconstruction_errors[0].toFixed(1)} of that behind{total > 0 ? "" : ""}.
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
