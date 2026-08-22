"use client";

// One distant person, and everything they move.
//
// The crowd's fit with and without one tall, light stranger. The mean
// moves, the covariance changes, the first component turns and the shares
// follow, and the switch shows both fits over the same picture so the
// turn can be seen as a turn. Both fits are the API's.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { FullAnalysis, analyseFully } from "@/lib/concepts/pca";
import { CROWD, FIRST, LOST, OUTLIER } from "./pcaFixtures";

const VIEW = { width: 640, height: 340 };
const PAD = { left: 56, right: 16, top: 16, bottom: 40 };
const DOMAIN = { xMin: 110, xMax: 205, yMin: 15, yMax: 90 };

export function OutlierInfluence() {
  const [without, setWithout] = useState<FullAnalysis | null>(null);
  const [withOutlier, setWithOutlier] = useState<FullAnalysis | null>(null);
  const [included, setIncluded] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [first, second] = await Promise.all([analyseFully(CROWD), analyseFully([...CROWD, OUTLIER])]);
        setWithout(first);
        setWithOutlier(second);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!without || !withOutlier) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const plotX = (value: number) => PAD.left + ((value - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * (VIEW.width - PAD.left - PAD.right);
  const plotY = (value: number) => PAD.top + (1 - (value - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * (VIEW.height - PAD.top - PAD.bottom);
  const reach = 50;
  const axis = (analysis: FullAnalysis, colour: string, width: number, dash?: string) => {
    const first = analysis.components[0];
    return <line x1={plotX(analysis.mean.x - reach * first.dx)} y1={plotY(analysis.mean.y - reach * first.dy)} x2={plotX(analysis.mean.x + reach * first.dx)} y2={plotY(analysis.mean.y + reach * first.dy)} stroke={colour} strokeWidth={width} strokeDasharray={dash} />;
  };
  const angle = (analysis: FullAnalysis) => {
    const first = analysis.components[0];
    return (Math.atan2(first.dy, first.dx) * 180) / Math.PI;
  };
  const turn = Math.abs(((angle(withOutlier) - angle(without) + 90) % 180) - 90);

  return (
    <div>
      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input type="checkbox" checked={included} onChange={(event) => setIncluded(event.target.checked)} className="accent-rose-500" />
        include the stranger at {OUTLIER.x} cm and {OUTLIER.y} kg
      </label>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {axis(without, FIRST, included ? 1.5 : 3, included ? "6 4" : undefined)}
        {included && axis(withOutlier, LOST, 3)}
        {CROWD.map((point, index) => (
          <circle key={index} cx={plotX(point.x)} cy={plotY(point.y)} r={5.5} fill="#334155" stroke="white" strokeWidth={1.5} />
        ))}
        {included && <circle cx={plotX(OUTLIER.x)} cy={plotY(OUTLIER.y)} r={7} fill={LOST} stroke="white" strokeWidth={1.5} />}
        <circle cx={plotX(without.mean.x)} cy={plotY(without.mean.y)} r={4} fill="white" stroke={FIRST} strokeWidth={2} />
        {included && <circle cx={plotX(withOutlier.mean.x)} cy={plotY(withOutlier.mean.y)} r={4} fill="white" stroke={LOST} strokeWidth={2} />}
        <text x={PAD.left + (VIEW.width - PAD.left - PAD.right) / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">height, cm</text>
        <text x={16} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 16 ${VIEW.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">weight, kg</text>
      </svg>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400">
              <th className="py-1 text-left font-medium">fit</th>
              <th className="py-1 text-left font-medium">mean</th>
              <th className="py-1 text-left font-medium">first component</th>
              <th className="py-1 text-left font-medium">its share</th>
              <th className="py-1 text-left font-medium">covariance of height and weight</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {[
              { name: "without", analysis: without, colour: FIRST },
              ...(included ? [{ name: "with the stranger", analysis: withOutlier, colour: LOST }] : []),
            ].map((row) => (
              <tr key={row.name} className="border-t border-slate-200 dark:border-slate-800" style={{ color: row.colour }}>
                <td className="py-1 font-sans">{row.name}</td>
                <td className="py-1">({row.analysis.mean.x.toFixed(1)}, {row.analysis.mean.y.toFixed(1)})</td>
                <td className="py-1">({row.analysis.components[0].dx.toFixed(3)}, {row.analysis.components[0].dy.toFixed(3)})</td>
                <td className="py-1">{row.analysis.components[0].share.toFixed(4)}</td>
                <td className="py-1">{row.analysis.covariance[0][1].toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {included && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          One person in twelve turned the first component by {turn.toFixed(1)} degrees, because a squared deviation grows with the square of the distance and a distant person contributes far more than their one-twelfth share of the rows.
        </p>
      )}
    </div>
  );
}
