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
        hidden bend
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
              <th className="py-1 text-right font-medium">bend&rsquo;s slope g′(z)</th>
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
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {bend === "rectified_linear"
          ? "The rectifier's slope is 1 where the score was positive and 0 where it was not. h₂ scored −1, so an arriving −4 is multiplied by 0 and nothing passes; the neuron receives no update from this row. The loss on this row is " + show(step.loss_before) + "."
          : `Under the ${HIDDEN_ACTIVATION_LABELS[bend]} every slope is strictly between 0 and 1, so every neuron receives some of what arrived, and h₁, whose score of 3 sits far out on the flat part of the curve, receives the least. The loss on this row is ${show(step.loss_before)}, since the bend changed the forward pass too.`}
      </p>
    </div>
  );
}
