"use client";

// Backward through the output neuron, one operation at a time.
//
// Four stages: the arriving slope passes through the identity bend and
// becomes the delta; the delta times what each weight read gives each
// weight's gradient; the three collect into one block; and the bias, a
// weight on a constant input of one, gets the delta itself. Every number
// is the API's backward pass over the worked row.

import { useState } from "react";
import { AMBER, HIDDEN_NAMES, INDIGO, show, useWorkedStep, workedRequest } from "./backpropFixtures";

const STAGES = ["through the bend", "one weight", "all three weights", "the bias"];

export function OutputNeuronBackward() {
  const { step, message } = useWorkedStep(workedRequest());
  const [stage, setStage] = useState(0);
  const [which, setWhich] = useState(0);

  if (!step) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }
  const output = step.layers[1];
  const delta = output.bias_gradient[0];

  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
        {STAGES.map((name, index) => (
          <button key={name} onClick={() => setStage(index)} className={"rounded px-3 py-1 text-xs font-medium transition " + (stage === index ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}>
            {index + 1}. {name}
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-slate-100 px-4 py-3 font-mono text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200">
        {stage === 0 && (
          <>
            <p>arriving slope, ∂L/∂a = {show(output.arriving[0])}</p>
            <p>the output bend is the identity, so g′(z) = g′({show(output.scores[0])}) = {show(output.slopes[0])}</p>
            <p className="mt-1 font-semibold" style={{ color: AMBER }}>δ = ∂L/∂a × g′(z) = {show(output.arriving[0])} × {show(output.slopes[0])} = {show(delta)}</p>
            <p className="mt-2 font-sans text-xs text-slate-500 dark:text-slate-400">The delta is the arriving slope after it has passed through the activation. Here the bend did nothing, so the number is unchanged, and that is the point of starting with this neuron.</p>
          </>
        )}
        {stage === 1 && (
          <>
            <div className="mb-2 flex flex-wrap items-center gap-2 font-sans text-xs text-slate-600 dark:text-slate-300">
              the weight from
              <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
                {HIDDEN_NAMES.map((name, index) => (
                  <button key={name} onClick={() => setWhich(index)} className={"rounded px-2 py-0.5 font-medium transition " + (which === index ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700")}>{name}</button>
                ))}
              </span>
            </div>
            <p>z = w₁h₁ + w₂h₂ + w₃h₃ + b</p>
            <p>∂z/∂w{which + 1} = {HIDDEN_NAMES[which]} = {show(output.inputs[which])}, because that is what w{which + 1} multiplied</p>
            <p className="mt-1 font-semibold" style={{ color: AMBER }}>∂L/∂w{which + 1} = δ × {HIDDEN_NAMES[which]} = {show(delta)} × {show(output.inputs[which])} = {show(output.weight_gradient[0][which])}</p>
          </>
        )}
        {stage === 2 && (
          <>
            <p>∂L/∂w = δ × (h₁, h₂, h₃)</p>
            <p className="mt-1 font-semibold" style={{ color: AMBER }}>= {show(delta)} × ({output.inputs.map(show).join(", ")}) = ({output.weight_gradient[0].map(show).join(", ")})</p>
            <p className="mt-2 font-sans text-xs text-slate-500 dark:text-slate-400">One delta, three inputs, three gradients. The middle one is zero because h₂ was zero, not because the weight does not matter in general; on this row it multiplied nothing.</p>
          </>
        )}
        {stage === 3 && (
          <>
            <p>a bias is a weight whose input is always 1</p>
            <p className="mt-1 font-semibold" style={{ color: AMBER }}>∂L/∂b = δ × 1 = {show(delta)}</p>
            <p className="mt-2 font-sans text-xs text-slate-500 dark:text-slate-400">
              <span style={{ color: INDIGO }}>The delta is shared by every parameter of the neuron</span>; each weight&rsquo;s gradient is the delta scaled by the input that travelled across that edge, and the bias&rsquo;s input is one.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
