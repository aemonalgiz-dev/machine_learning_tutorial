"use client";

// What the output neuron hands down to the hidden layer.
//
// The output neuron has its own gradients now. The hidden neurons still
// do not know how their outputs affected the loss, and the answer for each
// is the output delta times the weight on the edge between them, because
// that weight is exactly how much the output score moves per unit of that
// hidden output. Clicking a hidden neuron shows its line of the
// calculation. The block is the API's passed_down.

import { useState } from "react";
import { AMBER, HIDDEN_NAMES, INDIGO, show, useWorkedStep, workedRequest } from "./backpropFixtures";

const VIEW = { width: 640, height: 260 };
const HIDDEN_YS = [60, 130, 200];

export function PassDown() {
  const { step, message } = useWorkedStep(workedRequest());
  const [which, setWhich] = useState(0);

  if (!step) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }
  const output = step.layers[1];
  const weights = workedRequest().output_neuron.weights;
  const delta = output.bias_gradient[0];

  return (
    <div>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {HIDDEN_YS.map((y, index) => (
          <g key={index} className="cursor-pointer" onClick={() => setWhich(index)}>
            <line x1={190} y1={y} x2={430} y2={130} stroke={which === index ? INDIGO : "#cbd5e1"} strokeWidth={which === index ? 3 : 1.5} />
            <text x={310} y={(y + 130) / 2 - 6} textAnchor="middle" className="fill-slate-600 font-mono text-[10px] dark:fill-slate-300">w{index + 1} = {show(weights[index])}</text>
            <circle cx={160} cy={y} r={26} className={which === index ? "fill-indigo-50 stroke-indigo-500 dark:fill-indigo-950" : "fill-white stroke-slate-400 dark:fill-slate-900 dark:stroke-slate-600"} strokeWidth={1.5} />
            <text x={160} y={y - 4} textAnchor="middle" className="fill-slate-500 text-[11px] dark:fill-slate-400">{HIDDEN_NAMES[index]}</text>
            <text x={160} y={y + 10} textAnchor="middle" className="fill-slate-900 font-mono text-[11px] font-semibold dark:fill-slate-100">a {show(output.inputs[index])}</text>
            <text x={100} y={y + 4} textAnchor="end" className="font-mono text-[11px] font-semibold" fill={AMBER}>∂L/∂{HIDDEN_NAMES[index]} = {show(output.passed_down[index])}</text>
          </g>
        ))}
        <circle cx={460} cy={130} r={30} className="fill-white stroke-indigo-500 dark:fill-slate-900" strokeWidth={1.5} />
        <text x={460} y={126} textAnchor="middle" className="fill-slate-500 text-[11px] dark:fill-slate-400">output</text>
        <text x={460} y={140} textAnchor="middle" className="font-mono text-[11px] font-semibold" fill={AMBER}>δ {show(delta)}</text>
        <text x={560} y={134} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">z = Σ wᵢ hᵢ</text>
      </svg>
      <div className="mt-3 rounded-lg bg-slate-100 px-4 py-3 font-mono text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200">
        <p>∂z_out/∂{HIDDEN_NAMES[which]} = w{which + 1} = {show(weights[which])}, because the score is a sum and {HIDDEN_NAMES[which]} appears in it once, multiplied by w{which + 1}</p>
        <p className="mt-1 font-semibold" style={{ color: AMBER }}>∂L/∂{HIDDEN_NAMES[which]} = δ_out × w{which + 1} = {show(delta)} × {show(weights[which])} = {show(output.passed_down[which])}</p>
        <p className="mt-2">passed down to the hidden layer, all three at once ({output.passed_down.map(show).join(", ")})</p>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The layer has done two different things. It computed gradients for its own parameters, which it keeps, and it reported how sensitive the loss is to each of its inputs, which it hands down. The hidden layer will read that report as its own arriving slope.
      </p>
    </div>
  );
}
