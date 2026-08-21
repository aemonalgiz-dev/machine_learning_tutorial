"use client";

// One gradient checked by nudging, after it has been derived.
//
// Pick any of the nine weights. The chain rule's slope is the API's
// backward pass; the nudge figure is the API remeasuring the loss with
// that weight moved a millionth up and a millionth down. The two agree to
// the ninth decimal, which is what makes the nudge a check on an
// implementation and, at two forward passes per parameter, nothing like a
// method for training one.

import { useState } from "react";
import { CheckedWeight } from "@/lib/concepts/backpropagation";
import { AMBER, HIDDEN_NAMES, INPUT_NAMES, useWorkedStep, workedRequest } from "./backpropFixtures";

const CHOICES: { label: string; check: CheckedWeight }[] = [
  ...HIDDEN_NAMES.flatMap((name, neuron) => INPUT_NAMES.map((input, slot) => ({ label: `${name} from ${input}`, check: { layer_index: 0, neuron_index: neuron, input_index: slot } }))),
  ...HIDDEN_NAMES.map((name, slot) => ({ label: `y from ${name}`, check: { layer_index: 1, neuron_index: 0, input_index: slot } })),
];

export function FiniteDifferenceCheck() {
  const [chosen, setChosen] = useState(6);
  const { step, message } = useWorkedStep(workedRequest("rectified_linear", CHOICES[chosen].check));

  if (!step) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }
  const finite = step.finite_difference;
  const parameters = 13;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        the weight into
        <select value={chosen} onChange={(event) => setChosen(Number(event.target.value))} className="rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {CHOICES.map((choice, index) => (
            <option key={choice.label} value={index}>{choice.label}</option>
          ))}
        </select>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">the chain rule&rsquo;s slope</div>
          <div className="font-mono text-lg font-semibold" style={{ color: AMBER }}>{finite.analytic.toFixed(6)}</div>
        </div>
        <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">[L(w + ε) − L(w − ε)] / 2ε, with ε = {finite.epsilon.toExponential(0)}</div>
          <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">{finite.numerical.toFixed(6)}</div>
        </div>
        <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">disagreement</div>
          <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">{finite.disagreement.toExponential(1)}</div>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Two forward passes per parameter, so checking every one of this network&rsquo;s {parameters} parameters would cost {2 * parameters} forward passes to learn what one backward walk learns for about the price of one. On a million weights it is two million.
      </p>
    </div>
  );
}
