"use client";

// The forward pass, one stage at a time, with everything it leaves behind.
//
// The slider reveals the worked row's journey through the 2-3-1 network,
// stage by stage: the inputs, the hidden scores, the hidden activations,
// the output score, the prediction, the loss. Every value is boxed because
// every one of them is kept, and the backward pass will ask for each. No
// derivative appears here. The values are the API's forward pass.

import { useState } from "react";
import { HIDDEN_NAMES, INDIGO, INPUT_NAMES, show, useWorkedStep, workedRequest } from "./backpropFixtures";

const STAGES = [
  { title: "the input row", note: "two numbers, read by every hidden neuron" },
  { title: "hidden scores z", note: "each neuron's weighted sum of the row plus its bias" },
  { title: "hidden activations a", note: "each score after the rectifier, max(0, z)" },
  { title: "output score", note: "the output neuron's weighted sum of the three activations" },
  { title: "the prediction ŷ", note: "the output bend is the identity, so the score is the answer" },
  { title: "the loss", note: "half the squared miss against the target" },
];

export function ForwardTrace() {
  const { step, message } = useWorkedStep(workedRequest());
  const [stage, setStage] = useState(STAGES.length - 1);

  if (!step) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }
  const [hidden, output] = step.layers;
  const box = (label: string, value: string, lit: boolean) => (
    <div key={label} className={`rounded-md border px-2 py-1 font-mono text-xs transition ${lit ? "border-indigo-400 bg-indigo-50 text-slate-900 dark:bg-indigo-950/40 dark:text-slate-100" : "border-slate-200 text-slate-300 dark:border-slate-800 dark:text-slate-700"}`}>
      <div className="text-[10px] font-sans">{label}</div>
      <div className="font-semibold">{lit ? value : "·"}</div>
    </div>
  );

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-24">stage</span>
        <input type="range" min={0} max={STAGES.length - 1} step={1} value={stage} onChange={(event) => setStage(Number(event.target.value))} className="flex-1 accent-indigo-600" />
        <span className="w-44 text-right text-xs">{STAGES[stage].title}</span>
      </label>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{STAGES[stage].note}</p>
      <div className="mt-3 grid grid-cols-6 gap-2">
        <div className="space-y-1">{INPUT_NAMES.map((name, index) => box(name, show(step.layers[0].inputs[index]), stage >= 0))}</div>
        <div className="space-y-1">{HIDDEN_NAMES.map((name, index) => box(`z ${name}`, show(hidden.scores[index]), stage >= 1))}</div>
        <div className="space-y-1">{HIDDEN_NAMES.map((name, index) => box(`a ${name}`, show(hidden.outputs[index]), stage >= 2))}</div>
        <div className="space-y-1">{box("z out", show(output.scores[0]), stage >= 3)}</div>
        <div className="space-y-1">{box("ŷ", show(step.prediction), stage >= 4)}</div>
        <div className="space-y-1">{box("loss", show(step.loss_before), stage >= 5)}{box("target", "1", stage >= 5)}</div>
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Six kinds of number, all kept. The scores are kept because a bend&rsquo;s slope has to be evaluated where the forward pass evaluated the bend; the activations are kept because they are what the next layer&rsquo;s weights multiplied. <span style={{ color: INDIGO }}>Nothing here is a derivative yet.</span>
      </p>
    </div>
  );
}
