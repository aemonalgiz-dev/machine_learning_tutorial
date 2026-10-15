"use client";

import { useId } from "react";
import type { Delivery } from "@/lib/builds/regression-journey";

export function DeliveryPlot({ rows, lines, label }: { rows: readonly Delivery[]; lines: { label: string; predict: (distance: number) => number; color: string; dashed?: boolean }[]; label: string }) {
  const clipId = useId().replace(/:/g, "");
  const left = 58, top = 18, width = 640, height = 240;
  const x = (distance: number) => left + distance / 6 * width;
  const y = (minutes: number) => top + height - minutes / 44 * height;
  const sampled = lines.map(line => ({ ...line, values: Array.from({ length: 121 }, (_, index) => {
    try { return line.predict(index / 20); } catch { return NaN; }
  }) }));
  const outsideRange = sampled.some(line => line.values.some(value => !Number.isFinite(value) || value < 0 || value > 44));
  return <figure className="my-4">
    <svg viewBox="0 0 720 310" role="img" aria-label={label} className="w-full rounded-xl bg-background">
      <title>{label}</title><desc>The horizontal axis is delivery distance from zero to six kilometres. The vertical axis is delivery time in minutes. Dots are observations. Lines show model predictions. The table below gives the observations.</desc>
      <defs><clipPath id={clipId}><rect x={left} y={top} width={width} height={height}/></clipPath></defs>
      {[0, 10, 20, 30, 40].map(tick => <g key={tick}><line x1={left} x2={left + width} y1={y(tick)} y2={y(tick)} stroke="currentColor" opacity=".12"/><text x={left - 10} y={y(tick) + 4} textAnchor="end" fill="currentColor" fontSize="12">{tick}</text></g>)}
      {[0, 1, 2, 3, 4, 5, 6].map(tick => <text key={tick} x={x(tick)} y={height + top + 20} textAnchor="middle" fill="currentColor" fontSize="12">{tick}</text>)}
      <text x="370" y="303" textAnchor="middle" fill="currentColor" fontSize="13">Delivery distance (km)</text><text transform="translate(16 145) rotate(-90)" textAnchor="middle" fill="currentColor" fontSize="13">Delivery time (min)</text>
      <g clipPath={`url(#${clipId})`}>
        {sampled.map(line => <path key={line.label} d={line.values.map((value, index) => Number.isFinite(value) ? `${index && Number.isFinite(line.values[index - 1]) ? "L" : "M"}${x(index / 20)},${y(value)}` : "").join(" ")} fill="none" stroke={line.color} strokeWidth="3" strokeDasharray={line.dashed ? "7 5" : undefined}/>)}
        {rows.map((row, index) => <circle key={index} cx={x(row.distance)} cy={y(row.minutes)} r="5.5" fill="currentColor" stroke="var(--background)" strokeWidth="2"><title>{row.distance} km, observed {row.minutes} min</title></circle>)}
      </g>
    </svg>
    <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted"><span>● Recorded deliveries</span>{lines.map(line => <span key={line.label} className="flex items-center gap-2"><span aria-hidden="true" style={{ borderColor: line.color, borderTopWidth: 3, borderTopStyle: line.dashed ? "dashed" : "solid" }} className="inline-block w-5"/>{line.label}</span>)}</figcaption>
    {outsideRange && <p className="mt-2 text-xs leading-6 text-muted">Some predictions fall outside the plotted range or cannot be calculated. Gaps are omitted from the lines. Negative delivery times would be unusable.</p>}
    <details className="mt-3 text-xs"><summary className="min-h-11 cursor-pointer content-center">Read the plotted observations</summary><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th className="p-2">Distance (km)</th><th className="p-2">Observed (min)</th></tr></thead><tbody>{rows.map((row, index) => <tr key={index}><td className="p-2 font-mono">{row.distance}</td><td className="p-2 font-mono">{row.minutes}</td></tr>)}</tbody></table></div></details>
  </figure>;
}
