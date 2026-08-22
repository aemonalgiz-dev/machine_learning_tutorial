"use client";

// Three lines through one cloud, each minimising a different miss.
//
// Weight predicted from height misses vertically. Height predicted from
// weight misses horizontally. The first component misses perpendicularly.
// Three objectives, three lines, and the buttons switch which set of
// misses is drawn so the difference can be seen as a difference in what
// was being minimised. All three fits are the library's.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { VersusRegression, compareWithRegression } from "@/lib/concepts/pca";
import { CROWD, FIRST, LOST, SECOND } from "./pcaFixtures";

const VIEW = { width: 640, height: 360 };
const PAD = { left: 56, right: 16, top: 16, bottom: 40 };
const DOMAIN = { xMin: 110, xMax: 190, yMin: 15, yMax: 90 };

type Which = "forward" | "backward" | "component";

export function RegressionVersusPca() {
  const [answer, setAnswer] = useState<VersusRegression | null>(null);
  const [which, setWhich] = useState<Which>("forward");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await compareWithRegression(CROWD));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!answer) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const plotX = (value: number) => PAD.left + ((value - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * (VIEW.width - PAD.left - PAD.right);
  const plotY = (value: number) => PAD.top + (1 - (value - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * (VIEW.height - PAD.top - PAD.bottom);
  const forward = (x: number) => answer.weight_on_height.intercept + answer.weight_on_height.slope * x;
  const backward = (y: number) => answer.height_on_weight.intercept + answer.height_on_weight.slope * y;
  const first = answer.first_component;
  const componentFoot = (x: number, y: number) => {
    const t = (x - answer.mean.x) * first.dx + (y - answer.mean.y) * first.dy;
    return { x: answer.mean.x + t * first.dx, y: answer.mean.y + t * first.dy };
  };
  const lines: { key: Which; label: string; colour: string; residual: number; from: { x: number; y: number }; to: { x: number; y: number } }[] = [
    { key: "forward", label: "weight from height, vertical misses", colour: SECOND, residual: answer.weight_on_height.residual_sum, from: { x: DOMAIN.xMin, y: forward(DOMAIN.xMin) }, to: { x: DOMAIN.xMax, y: forward(DOMAIN.xMax) } },
    { key: "backward", label: "height from weight, horizontal misses", colour: LOST, residual: answer.height_on_weight.residual_sum, from: { x: backward(DOMAIN.yMin), y: DOMAIN.yMin }, to: { x: backward(DOMAIN.yMax), y: DOMAIN.yMax } },
    { key: "component", label: "first component, perpendicular misses", colour: FIRST, residual: answer.perpendicular_residual_sum, from: { x: answer.mean.x - 60 * first.dx, y: answer.mean.y - 60 * first.dy }, to: { x: answer.mean.x + 60 * first.dx, y: answer.mean.y + 60 * first.dy } },
  ];
  const chosen = lines.find((line) => line.key === which)!;

  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-md border border-slate-300 p-0.5 text-sm dark:border-slate-700">
        {lines.map((line) => (
          <button key={line.key} onClick={() => setWhich(line.key)} className={"rounded px-3 py-1 text-xs font-medium transition " + (which === line.key ? "text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")} style={which === line.key ? { backgroundColor: line.colour } : undefined}>
            {line.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {lines.map((line) => (
          <line key={line.key} x1={plotX(line.from.x)} y1={plotY(line.from.y)} x2={plotX(line.to.x)} y2={plotY(line.to.y)} stroke={line.colour} strokeWidth={which === line.key ? 3 : 1.5} opacity={which === line.key ? 1 : 0.5} />
        ))}
        {CROWD.map((point, index) => {
          const foot = which === "forward" ? { x: point.x, y: forward(point.x) } : which === "backward" ? { x: backward(point.y), y: point.y } : componentFoot(point.x, point.y);
          return (
            <g key={index}>
              <line x1={plotX(point.x)} y1={plotY(point.y)} x2={plotX(foot.x)} y2={plotY(foot.y)} stroke={chosen.colour} strokeWidth={1.5} />
              <circle cx={plotX(point.x)} cy={plotY(point.y)} r={5.5} fill="#334155" stroke="white" strokeWidth={1.5} />
            </g>
          );
        })}
        <text x={PAD.left + (VIEW.width - PAD.left - PAD.right) / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">height, cm</text>
        <text x={16} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 16 ${VIEW.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">weight, kg</text>
      </svg>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {lines.map((line) => (
          <div key={line.key} className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
            <div className="text-[11px]" style={{ color: line.colour }}>{line.label}</div>
            <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
              {line.key === "forward" ? `slope ${answer.weight_on_height.slope.toFixed(3)}` : line.key === "backward" ? `slope ${(1 / answer.height_on_weight.slope).toFixed(3)} as drawn` : `slope ${(first.dy / first.dx).toFixed(3)}`}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">its own squared misses total {line.residual.toFixed(1)}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Each line is the best at its own kind of miss and not at the others&rsquo;. The three totals are not comparable to one another, since each measures a different distance; what is comparable is that three sensible objectives give three different lines through the same eleven people.
      </p>
    </div>
  );
}
