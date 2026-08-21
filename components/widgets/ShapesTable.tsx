"use client";

// The hand calculation written as the matrices it always was.
//
// For each layer, the shapes of x, z, a, W, δ and ∂L/∂W, with the actual
// worked numbers inside them, so the four matrix lines can be read back
// against the scalar arithmetic already done. The delta column times the
// input row is the outer product that fills the weight gradient, and the
// transposed weights times the delta is the passed-down block. Every
// entry is the API's.

import { AMBER, GREEN, INDIGO, show, useWorkedStep, workedRequest } from "./backpropFixtures";

export function ShapesTable() {
  const { step, message } = useWorkedStep(workedRequest());

  if (!step) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }
  const request = workedRequest();
  const layers = [
    { name: "hidden layer, 2 in, 3 out", layer: step.layers[0], weights: request.hidden_neurons.map((neuron) => neuron.weights) },
    { name: "output layer, 3 in, 1 out", layer: step.layers[1], weights: [request.output_neuron.weights] },
  ];

  return (
    <div className="space-y-4">
      {layers.map((entry) => {
        const inputs = entry.layer.inputs.length;
        const outputs = entry.layer.scores.length;
        return (
          <div key={entry.name} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">{entry.name}</p>
            <div className="grid gap-2 text-xs sm:grid-cols-3">
              <Block title={`x, ${inputs} × 1`} rows={entry.layer.inputs.map((value) => [value])} />
              <Block title={`W, ${outputs} × ${inputs}`} rows={entry.weights} />
              <Block title={`z = Wx + b, ${outputs} × 1`} rows={entry.layer.scores.map((value) => [value])} />
              <Block title={`a = g(z), ${outputs} × 1`} rows={entry.layer.outputs.map((value) => [value])} />
              <Block title={`δ = arriving ⊙ g′(z), ${outputs} × 1`} rows={entry.layer.bias_gradient.map((value) => [value])} colour={AMBER} />
              <Block title={`∂L/∂W = δ xᵀ, ${outputs} × ${inputs}`} rows={entry.layer.weight_gradient} colour={AMBER} />
              <Block title={`∂L/∂b = δ, ${outputs} × 1`} rows={entry.layer.bias_gradient.map((value) => [value])} colour={AMBER} />
              <Block title={`∂L/∂x = Wᵀ δ, ${inputs} × 1`} rows={entry.layer.passed_down.map((value) => [value])} colour={GREEN} />
              <div className="rounded-md bg-slate-100 px-2 py-1.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <span style={{ color: INDIGO }}>the same rows as the hand calculation.</span> δ xᵀ is a column of {outputs} times a row of {inputs}, one entry per weight; Wᵀ δ sums each input&rsquo;s routes through every neuron.
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Block({ title, rows, colour }: { title: string; rows: number[][]; colour?: string }) {
  return (
    <div className="rounded-md bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{title}</div>
      <div className="mt-1 inline-grid gap-x-3 font-mono text-sm" style={{ gridTemplateColumns: `repeat(${rows[0].length}, auto)`, color: colour }}>
        {rows.flatMap((row, rowIndex) => row.map((value, columnIndex) => <span key={`${rowIndex}-${columnIndex}`} className="text-right">{show(value)}</span>))}
      </div>
    </div>
  );
}
