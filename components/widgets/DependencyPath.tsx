"use client";

// One hidden weight's route to the loss, drawn without calculating it.
//
// Pick a hidden weight and the diagram lights the path it takes: through
// its neuron's score, its neuron's activation, the output score, the
// prediction, and finally the loss. A weight in the output layer has a
// short path; a hidden weight's is longer, and every stage on it is a
// number the forward pass kept. The values are the API's; the derivatives
// are deliberately absent.

import { useState } from "react";
import { HIDDEN_NAMES, INDIGO, INPUT_NAMES, show, useWorkedStep, workedRequest } from "./backpropFixtures";

const VIEW = { width: 640, height: 220 };

export function DependencyPath() {
  const { step, message } = useWorkedStep(workedRequest());
  const [neuron, setNeuron] = useState(0);
  const [input, setInput] = useState(0);

  if (!step) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }
  const [hidden, output] = step.layers;
  const stops = [
    { label: `w, ${HIDDEN_NAMES[neuron]} from ${INPUT_NAMES[input]}`, value: show(workedRequest().hidden_neurons[neuron].weights[input]) },
    { label: `z ${HIDDEN_NAMES[neuron]}`, value: show(hidden.scores[neuron]) },
    { label: `a ${HIDDEN_NAMES[neuron]}`, value: show(hidden.outputs[neuron]) },
    { label: "z out", value: show(output.scores[0]) },
    { label: "ŷ", value: show(step.prediction) },
    { label: "loss", value: show(step.loss_before) },
  ];
  const stopX = (index: number) => 60 + index * ((VIEW.width - 120) / (stops.length - 1));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        follow the weight into
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {HIDDEN_NAMES.map((name, index) => (
            <button key={name} onClick={() => setNeuron(index)} className={"rounded px-2 py-0.5 text-xs font-medium transition " + (neuron === index ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}>{name}</button>
          ))}
        </span>
        from
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {INPUT_NAMES.map((name, index) => (
            <button key={name} onClick={() => setInput(index)} className={"rounded px-2 py-0.5 text-xs font-medium transition " + (input === index ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}>{name}</button>
          ))}
        </span>
      </div>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {stops.map((stop, index) => (
          <g key={stop.label}>
            {index < stops.length - 1 && (
              <line x1={stopX(index) + 34} y1={110} x2={stopX(index + 1) - 34} y2={110} stroke={INDIGO} strokeWidth={2} markerEnd="url(#arrow)" />
            )}
            <rect x={stopX(index) - 34} y={86} width={68} height={48} rx={8} className="fill-white stroke-indigo-400 dark:fill-slate-900" strokeWidth={1.5} />
            <text x={stopX(index)} y={104} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">{stop.label}</text>
            <text x={stopX(index)} y={124} textAnchor="middle" className="fill-slate-900 font-mono text-sm font-semibold dark:fill-slate-100">{stop.value}</text>
          </g>
        ))}
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={INDIGO} />
          </marker>
        </defs>
        <text x={VIEW.width / 2} y={40} textAnchor="middle" className="fill-slate-600 text-xs dark:fill-slate-300">
          nudge the weight, and the change has to travel every box to the right before it reaches the loss
        </text>
        <text x={VIEW.width / 2} y={180} textAnchor="middle" className="fill-slate-500 text-[11px] dark:fill-slate-400">
          the output weights skip the first three boxes, which is why a single neuron was easy to train
        </text>
      </svg>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {hidden.outputs[neuron] === 0
          ? `${HIDDEN_NAMES[neuron]} scored ${show(hidden.scores[neuron])} and the rectifier turned it to 0, so on this row nothing this weight does reaches the output at all. Hold that thought for section 7.`
          : `Five stages between this weight and the loss, and the question training needs answered is how much a small change at the left end moves the number at the right end.`}
      </p>
    </div>
  );
}
