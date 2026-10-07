"use client";

// The arriving gradient meeting a bend that is not the identity.
//
// For each hidden neuron: the slope that arrived, the score the forward
// pass kept, the bend's derivative at that score, and their product, the
// delta. Under the rectifier the middle neuron's score was negative, its
// slope is zero, and its delta is zero whatever arrived. The selector
// swaps the bend so the same three neurons can be seen under a sigmoid or
// a hyperbolic tangent, where no slope is exactly zero and none is one.
// Every row is the API's, refitted per bend.

import { useState } from "react";
import { Equation } from "@/components/concept/Equation";
import { HIDDEN_ACTIVATION_LABELS, HiddenActivation } from "@/lib/concepts/backpropagation";
import { AMBER, HIDDEN_NAMES, show, useWorkedStep, workedRequest } from "./backpropFixtures";

const BENDS: HiddenActivation[] = ["rectified_linear", "sigmoid", "hyperbolic_tangent"];

export function ReluGate() {
  const [bend, setBend] = useState<HiddenActivation>("rectified_linear");
  const { step, message } = useWorkedStep(workedRequest(bend));

  if (!step) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }
  const hidden = step.layers[0];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        hidden activation function
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {BENDS.map((name) => (
            <button key={name} onClick={() => setBend(name)} className={"rounded px-2 py-0.5 text-xs font-medium transition " + (bend === name ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}>{HIDDEN_ACTIVATION_LABELS[name]}</button>
          ))}
        </span>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 dark:text-slate-400">
              <th className="py-1 text-left font-medium">neuron</th>
              <th className="py-1 text-right font-medium">arriving ∂L/∂a</th>
              <th className="py-1 text-right font-medium">original score z</th>
              <th className="py-1 text-right font-medium">activation function&rsquo;s slope g′(z)</th>
              <th className="py-1 text-right font-medium" style={{ color: AMBER }}>delta</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {HIDDEN_NAMES.map((name, index) => (
              <tr key={name} className={`border-t border-slate-200 dark:border-slate-800 ${hidden.slopes[index] === 0 ? "text-slate-400" : ""}`}>
                <td className="py-1.5">{name}</td>
                <td className="py-1.5 text-right">{show(hidden.arriving[index])}</td>
                <td className="py-1.5 text-right">{show(hidden.scores[index])}</td>
                <td className="py-1.5 text-right">{show(hidden.slopes[index])}</td>
                <td className="py-1.5 text-right font-semibold" style={{ color: AMBER }}>{show(hidden.bias_gradient[index])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <>
<p className="mt-2 text-xs text-slate-500 dark:text-slate-400">To propagate a gradient through an activation, first inspect its derivative at the score from the forward pass.</p><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{bend === "rectified_linear" ? "The second hidden neuron's score is −1. ReLU has derivative zero there, so this example contributes no gradient to that neuron's weights through this route." : HIDDEN_ACTIVATION_LABELS[bend] + " has nonzero derivatives at these three scores. The first neuron's score is 3, where the displayed derivative is smallest. This activation step therefore reduces that arriving derivative the most."}</p>
</>
      <Equation>{`delta for h₂ = arriving gradient × activation derivative\n             = ${show(hidden.arriving[1])} × ${show(hidden.slopes[1])}\n             = ${show(hidden.bias_gradient[1])}`}</Equation>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The loss is {show(step.loss_before)}. Changing the activation also changes
        the forward prediction, so it can change the arriving gradients.
      </p>
    </div>
  );
}
