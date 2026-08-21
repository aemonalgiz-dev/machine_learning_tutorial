"use client";

// The lasso's one-feature arithmetic, as a pull that gets shortened.
//
// For the five worked people the data pulls the slope away from zero with a
// numerator of 200. The absolute-value penalty takes λ/2 off that pull, and
// whatever is left is divided by 250 to give the slope. Slide λ and the bar
// shows the original pull, the part removed and the remainder, and the
// remainder reaching zero at λ = 400 is why the lasso path lands on exactly
// zero there. The second panel maps an ordinary slope to a lasso slope for
// the chosen λ, which is flat at zero across the middle, the soft threshold.

import { useState } from "react";

const CROSS = 200;
const SQUARE = 250;

const BAR = { width: 640, height: 90, left: 24, right: 24, y: 30, thickness: 22 };
const MAP = { width: 300, height: 220, left: 40, right: 12, top: 12, bottom: 30 };

export function SoftThresholdSlider() {
  const [penalty, setPenalty] = useState(150);
  const removed = Math.min(penalty / 2, CROSS);
  const remainder = CROSS - removed;
  const slope = remainder / SQUARE;

  const toX = (value: number) => BAR.left + (value / CROSS) * (BAR.width - BAR.left - BAR.right);

  const mapPlot = { width: MAP.width - MAP.left - MAP.right, height: MAP.height - MAP.top - MAP.bottom };
  const reach = 1.2;
  const mapX = (value: number) => MAP.left + ((value + reach) / (2 * reach)) * mapPlot.width;
  const mapY = (value: number) => MAP.top + (1 - (value + reach) / (2 * reach)) * mapPlot.height;
  const threshold = penalty / 2 / SQUARE;
  const softened = (ordinary: number) => Math.sign(ordinary) * Math.max(Math.abs(ordinary) - threshold, 0);
  const mapPath = Array.from({ length: 121 }, (_, index) => {
    const ordinary = -reach + (2 * reach * index) / 120;
    return `${index === 0 ? "M" : "L"} ${mapX(ordinary).toFixed(1)} ${mapY(softened(ordinary)).toFixed(1)}`;
  }).join(" ");

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-8">λ</span>
        <input
          type="range"
          min={0}
          max={500}
          step={5}
          value={penalty}
          onChange={(event) => setPenalty(Number(event.target.value))}
          className="flex-1 accent-amber-500"
        />
        <span className="w-12 text-right font-mono">{penalty}</span>
      </label>

      <svg viewBox={`0 0 ${BAR.width} ${BAR.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <rect x={toX(0)} y={BAR.y} width={toX(remainder) - toX(0)} height={BAR.thickness} className="fill-indigo-500" />
        <rect x={toX(remainder)} y={BAR.y} width={toX(CROSS) - toX(remainder)} height={BAR.thickness} className="fill-amber-400" opacity={0.8} />
        <text x={toX(0)} y={BAR.y - 8} className="fill-slate-500 text-[11px] dark:fill-slate-400">0</text>
        <text x={toX(CROSS)} y={BAR.y - 8} textAnchor="end" className="fill-slate-500 text-[11px] dark:fill-slate-400">the data’s pull, 200</text>
        <text x={(toX(0) + toX(remainder)) / 2} y={BAR.y + BAR.thickness + 18} textAnchor="middle" className="fill-indigo-700 text-[11px] font-medium dark:fill-indigo-300">
          remaining pull {remainder.toFixed(0)}
        </text>
        {removed > 0 && (
          <text x={(toX(remainder) + toX(CROSS)) / 2} y={BAR.y + BAR.thickness + 18} textAnchor="middle" className="fill-amber-700 text-[11px] font-medium dark:fill-amber-300">
            removed, λ/2 = {removed.toFixed(0)}
          </text>
        )}
      </svg>

      <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_300px]">
        <div className="grid grid-cols-2 gap-3 self-start">
          <Stat label="remaining pull, 200 − λ/2" value={remainder.toFixed(1)} />
          <Stat label="lasso slope, remainder / 250" value={slope.toFixed(4)} />
          <Stat label="ordinary slope" value="0.8000" />
          <Stat label="λ where the slope reaches zero" value="400" />
        </div>
        <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-800">
          <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
            <line x1={MAP.left} y1={mapY(0)} x2={MAP.left + mapPlot.width} y2={mapY(0)} stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
            <line x1={mapX(0)} y1={MAP.top} x2={mapX(0)} y2={MAP.top + mapPlot.height} stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
            <path d={`M ${mapX(-reach)} ${mapY(-reach)} L ${mapX(reach)} ${mapY(reach)}`} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeDasharray="3 3" />
            <path d={mapPath} fill="none" stroke="#f59e0b" strokeWidth={2.5} />
            <circle cx={mapX(0.8)} cy={mapY(softened(0.8))} r={5} fill="#f59e0b" stroke="white" strokeWidth={1.5} />
            <text x={MAP.left + mapPlot.width / 2} y={MAP.height - 4} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">ordinary slope in, lasso slope out</text>
            {[-1, 0, 1].map((tick) => (
              <text key={tick} x={mapX(tick)} y={MAP.top + mapPlot.height + 12} textAnchor="middle" className="fill-slate-400 text-[10px]">{tick}</text>
            ))}
          </svg>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            The flat stretch is every ordinary slope the penalty sends to exactly zero. The dot is the worked slope of 0.8.
          </p>
        </div>
      </div>
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
