"use client";

// The same people in two coordinate systems.
//
// On the left the crowd in height and weight, with the two component axes
// drawn through the mean. On the right the same crowd with those axes laid
// flat, each person placed by their two scores, which is what the
// library's transform returns. Selecting a person shows the same
// individual in both, and the strip beneath writes the transform as the
// matrix product it is, the centred rows times the component columns.
// Every score is the API's.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { FullAnalysis, analyseFully } from "@/lib/concepts/pca";
import { CROWD, FIRST, SECOND } from "./pcaFixtures";

const VIEW = { width: 310, height: 290 };
const PAD = { left: 46, right: 12, top: 14, bottom: 36 };
const LEFT = { xMin: 110, xMax: 190, yMin: 15, yMax: 90 };
const RIGHT = { xMin: -60, xMax: 60, yMin: -20, yMax: 20 };

export function CoordinateChange() {
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [selected, setSelected] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnalysis(await analyseFully(CROWD));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!analysis) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const frame = (domain: typeof LEFT) => ({
    x: (value: number) => PAD.left + ((value - domain.xMin) / (domain.xMax - domain.xMin)) * (VIEW.width - PAD.left - PAD.right),
    y: (value: number) => PAD.top + (1 - (value - domain.yMin) / (domain.yMax - domain.yMin)) * (VIEW.height - PAD.top - PAD.bottom),
  });
  const left = frame(LEFT);
  const right = frame(RIGHT);
  const [first, second] = analysis.components;
  const reach = 42;
  const score = analysis.scores[selected];
  const deviation = analysis.deviations[selected];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">Height and weight coordinates</p>
          <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
            <line x1={left.x(analysis.mean.x - reach * first.dx)} y1={left.y(analysis.mean.y - reach * first.dy)} x2={left.x(analysis.mean.x + reach * first.dx)} y2={left.y(analysis.mean.y + reach * first.dy)} stroke={FIRST} strokeWidth={2} />
            <line x1={left.x(analysis.mean.x - reach * 0.5 * second.dx)} y1={left.y(analysis.mean.y - reach * 0.5 * second.dy)} x2={left.x(analysis.mean.x + reach * 0.5 * second.dx)} y2={left.y(analysis.mean.y + reach * 0.5 * second.dy)} stroke={SECOND} strokeWidth={2} />
            {CROWD.map((point, index) => (
              <circle key={index} cx={left.x(point.x)} cy={left.y(point.y)} r={index === selected ? 7 : 5} fill={index === selected ? FIRST : "#334155"} stroke="white" strokeWidth={1.5} className="cursor-pointer" onClick={() => setSelected(index)} />
            ))}
            <text x={VIEW.width / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">height, cm</text>
            <text x={12} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 12 ${VIEW.height / 2})`} className="fill-slate-500 text-[10px] dark:fill-slate-400">weight, kg</text>
          </svg>
        </div>
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">Component coordinates</p>
          <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
            <line x1={right.x(RIGHT.xMin)} x2={right.x(RIGHT.xMax)} y1={right.y(0)} y2={right.y(0)} stroke={FIRST} strokeWidth={2} />
            <line x1={right.x(0)} x2={right.x(0)} y1={right.y(RIGHT.yMin)} y2={right.y(RIGHT.yMax)} stroke={SECOND} strokeWidth={2} />
            {analysis.scores.map((each, index) => (
              <circle key={index} cx={right.x(each.first)} cy={right.y(each.second)} r={index === selected ? 7 : 5} fill={index === selected ? FIRST : "#334155"} stroke="white" strokeWidth={1.5} className="cursor-pointer" onClick={() => setSelected(index)} />
            ))}
            <text x={VIEW.width / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">score on component 1</text>
            <text x={12} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 12 ${VIEW.height / 2})`} className="fill-slate-500 text-[10px] dark:fill-slate-400">score on component 2</text>
          </svg>
        </div>
      </div>
      <div className="mt-3 overflow-x-auto rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
        <p>
          person {selected + 1}, centred <span className="text-slate-500">(d height, d weight)</span> = ({deviation.x.toFixed(1)}, {deviation.y.toFixed(1)})
        </p>
        <p className="mt-1">
          <span className="text-slate-500">[ d height  d weight ]</span>{" × "}
          <span style={{ color: FIRST }}>[ {first.dx.toFixed(2)} </span><span style={{ color: SECOND }}>{second.dx.toFixed(2)} ]</span>{" "}
          <span className="text-slate-500">= [ s₁  s₂ ]</span>
        </p>
        <p className="pl-[9.5rem]">
          <span style={{ color: FIRST }}>[ {first.dy.toFixed(2)} </span><span style={{ color: SECOND }}>{second.dy.toFixed(2)} ]</span>
        </p>
        <p className="mt-1">
          s₁ = {first.dx.toFixed(2)} × {deviation.x.toFixed(1)} + {first.dy.toFixed(2)} × {deviation.y.toFixed(1)} = <span className="font-semibold">{score.first.toFixed(2)}</span>
        </p>
        <p>
          s₂ = {second.dx.toFixed(2)} × {deviation.x.toFixed(1)} + {second.dy.toFixed(2)} × {deviation.y.toFixed(1)} = <span className="font-semibold">{score.second.toFixed(2)}</span>
        </p>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The right-hand picture is the left one turned until the indigo axis lies flat. Nobody moved relative to anybody else; the axes did.
      </p>
    </div>
  );
}
