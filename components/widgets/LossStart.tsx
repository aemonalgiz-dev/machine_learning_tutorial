"use client";

// Where the backward pass begins: the loss, and the slope of the loss.
//
// The curve is half the squared miss against a target of 1, drawn from
// its definition, and the slider moves the prediction along it. Two
// numbers are read off at every position, the height of the curve, which
// is the loss, and its steepness, which is the slope, and the page is
// careful that they are different things. The worked point, prediction 5,
// is marked with the API's own loss and loss gradient.

import { useState } from "react";
import { AMBER, INDIGO, show, useWorkedStep, workedRequest } from "./backpropFixtures";

const VIEW = { width: 640, height: 280 };
const PAD = { left: 56, right: 16, top: 16, bottom: 40 };
const TARGET = 1;
const DOMAIN = { min: -3, max: 7 };

export function LossStart() {
  const { step } = useWorkedStep(workedRequest());
  const [prediction, setPrediction] = useState(5);
  const loss = 0.5 * (prediction - TARGET) ** 2;
  const slope = prediction - TARGET;
  const top = 0.5 * (DOMAIN.max - TARGET) ** 2;
  const plotX = (value: number) => PAD.left + ((value - DOMAIN.min) / (DOMAIN.max - DOMAIN.min)) * (VIEW.width - PAD.left - PAD.right);
  const plotY = (value: number) => PAD.top + (1 - value / top) * (VIEW.height - PAD.top - PAD.bottom);
  const curve = Array.from({ length: 101 }, (_, index) => {
    const value = DOMAIN.min + ((DOMAIN.max - DOMAIN.min) * index) / 100;
    return `${index === 0 ? "M" : "L"}${plotX(value)},${plotY(0.5 * (value - TARGET) ** 2)}`;
  }).join(" ");
  const tangent = [prediction - 1.5, prediction + 1.5].map((value) => ({ x: plotX(value), y: plotY(loss + slope * (value - prediction)) }));

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-24">prediction ŷ</span>
        <input type="range" min={DOMAIN.min} max={DOMAIN.max} step={0.1} value={prediction} onChange={(event) => setPrediction(Number(event.target.value))} className="flex-1 accent-indigo-600" />
        <span className="w-10 text-right font-mono">{prediction.toFixed(1)}</span>
      </label>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <path d={curve} fill="none" stroke={INDIGO} strokeWidth={2.5} />
        <line x1={plotX(TARGET)} x2={plotX(TARGET)} y1={PAD.top} y2={VIEW.height - PAD.bottom} className="stroke-slate-300 dark:stroke-slate-700" strokeDasharray="3 3" />
        <text x={plotX(TARGET)} y={PAD.top + 12} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">target 1</text>
        <line x1={tangent[0].x} y1={tangent[0].y} x2={tangent[1].x} y2={tangent[1].y} stroke={AMBER} strokeWidth={2.5} />
        <circle cx={plotX(prediction)} cy={plotY(loss)} r={6} fill={INDIGO} stroke="white" strokeWidth={1.5} />
        {step && <circle cx={plotX(step.prediction)} cy={plotY(step.loss_before)} r={4} fill="none" stroke={AMBER} strokeWidth={2} />}
        <text x={PAD.left + (VIEW.width - PAD.left - PAD.right) / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">prediction ŷ</text>
        <text x={16} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 16 ${VIEW.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">loss, ½(ŷ − 1)²</text>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="the loss, the height of the curve" value={show(loss)} colour={INDIGO} />
        <Stat label="the slope of the loss, ŷ − y" value={show(slope)} colour={AMBER} />
        <Stat label="worked example loss, measured" value={step ? show(step.loss_before) : "…"} colour={INDIGO} />
        <Stat label="worked example slope, measured" value={step ? show(step.loss_gradient) : "…"} colour={AMBER} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        At a prediction of 5 the loss is 8 and its slope is 4. The 8 is how wrong the network is; the 4 is how fast that wrongness changes if the prediction moves, and it is the 4 that travels backward, not the 8.
      </p>
    </div>
  );
}

function Stat({ label, value, colour }: { label: string; value: string; colour: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg font-semibold" style={{ color: colour }}>{value}</div>
    </div>
  );
}
