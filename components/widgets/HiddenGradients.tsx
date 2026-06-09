"use client";

// The hidden layer's own gradients, by the rule already used once.
//
// Each hidden neuron has a delta from the previous step and read the same
// row, so its weight gradients are its delta times the row and its bias
// gradient is its delta. Nothing new is introduced, which is the point;
// the widget lays the three neurons side by side to make the repetition
// visible. Every number is the API's.

import { AMBER, HIDDEN_NAMES, INPUT_NAMES, show, useWorkedStep, workedRequest } from "./backpropFixtures";

export function HiddenGradients() {
  const { step, message } = useWorkedStep(workedRequest());

  if (!step) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }
  const hidden = step.layers[0];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {HIDDEN_NAMES.map((name, index) => {
          const delta = hidden.bias_gradient[index];
          return (
            <div key={name} className={`rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200 ${delta === 0 ? "opacity-60" : ""}`}>
              <p className="font-sans text-sm font-medium text-slate-700 dark:text-slate-200">{name}</p>
              <p className="mt-1">δ = {show(delta)}</p>
              <p>inputs read ({hidden.inputs.map(show).join(", ")})</p>
              <p className="mt-1 font-semibold" style={{ color: AMBER }}>∂L/∂w = {show(delta)} × ({hidden.inputs.map(show).join(", ")}) = ({hidden.weight_gradient[index].map(show).join(", ")})</p>
              <p className="font-semibold" style={{ color: AMBER }}>∂L/∂b = {show(delta)}</p>
              <p className="mt-1 font-sans text-[10px] text-slate-500 dark:text-slate-400">
                {delta === 0 ? "a delta of zero gives gradients of zero; this neuron sits out the step" : `the weight from ${INPUT_NAMES[1]} gets twice the slope of the weight from ${INPUT_NAMES[0]}, because ${INPUT_NAMES[1]} was twice as large`}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The largest slope in the network is {show(step.largest_movement)}, on h₃&rsquo;s weight from x₂, a delta of 8 times an input of 2. The output layer&rsquo;s largest was 12. No new rule was needed to find any of them.
      </p>
    </div>
  );
}
