"use client";

// Two phases that must not be mixed: compute every gradient, then move.
//
// The left column is every gradient the backward pass produced, frozen,
// while no parameter has moved. The right column is every parameter after
// one step at the chosen learning rate, each the old value minus the rate
// times its gradient. Beneath is the second forward pass on the moved
// network, which is a different network, with different scores, different
// activations and a different loss. The step and both losses are the
// API's.

import { useState } from "react";
import { AMBER, GREEN, HIDDEN_NAMES, INPUT_NAMES, show, useWorkedStep, workedRequest } from "./backpropFixtures";

export function UpdateThenReforward() {
  const [rate, setRate] = useState(0.05);
  const { step, message } = useWorkedStep(workedRequest("rectified_linear", { layer_index: 1, neuron_index: 0, input_index: 0 }, rate));
  const before = workedRequest();

  if (!step) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }
  const [hidden, output] = step.layers;
  const row = (label: string, old: number, gradient: number, after: number) => (
    <tr key={label} className="border-t border-slate-200 dark:border-slate-800">
      <td className="py-1 pr-2 font-mono">{label}</td>
      <td className="py-1 pr-2 text-right font-mono">{show(old)}</td>
      <td className="py-1 pr-2 text-right font-mono" style={{ color: AMBER }}>{show(gradient)}</td>
      <td className="py-1 text-right font-mono" style={{ color: GREEN }}>{show(old)} − {rate.toFixed(2)} × {show(gradient)} = {show(after)}</td>
    </tr>
  );

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-28">learning rate η</span>
        <input type="range" min={0.01} max={0.5} step={0.01} value={rate} onChange={(event) => setRate(Number(event.target.value))} className="flex-1 accent-indigo-600" />
        <span className="w-10 text-right font-mono">{rate.toFixed(2)}</span>
      </label>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-2 text-left font-medium">parameter</th>
              <th className="py-1 pr-2 text-right font-medium">before</th>
              <th className="py-1 pr-2 text-right font-medium" style={{ color: AMBER }}>phase one, its gradient</th>
              <th className="py-1 text-right font-medium" style={{ color: GREEN }}>phase two, θ − η ∂L/∂θ</th>
            </tr>
          </thead>
          <tbody>
            {HIDDEN_NAMES.flatMap((name, neuron) => [
              ...INPUT_NAMES.map((input, slot) => row(`${name} from ${input}`, before.hidden_neurons[neuron].weights[slot], hidden.weight_gradient[neuron][slot], hidden.weights_after[neuron][slot])),
              row(`${name} bias`, before.hidden_neurons[neuron].bias, hidden.bias_gradient[neuron], hidden.biases_after[neuron]),
            ])}
            {HIDDEN_NAMES.map((name, slot) => row(`y from ${name}`, before.output_neuron.weights[slot], output.weight_gradient[0][slot], output.weights_after[0][slot]))}
            {row("y bias", before.output_neuron.bias, output.bias_gradient[0], output.biases_after[0])}
          </tbody>
        </table>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="loss before the step" value={show(step.loss_before)} />
        <Stat label="prediction before" value={show(step.prediction)} />
        <Stat label="prediction after, second forward pass" value={show(step.prediction_after)} />
        <Stat label="loss after" value={show(step.loss_after)} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {step.loss_after < step.loss_before
          ? `At η = ${rate.toFixed(2)} the loss falls from ${show(step.loss_before)} to ${show(step.loss_after)}. The gradients in the amber column describe the network as it was; after the move they describe nothing, and the next step needs a fresh forward pass through the green network.`
          : `At η = ${rate.toFixed(2)} the step overshoots and the loss rises from ${show(step.loss_before)} to ${show(step.loss_after)}. The gradients were right; the stride was too long for them.`}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
