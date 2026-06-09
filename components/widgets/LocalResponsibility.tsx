"use client";

// One neuron, three questions, one product.
//
// For the output neuron, the three local slopes are how much the loss
// responds to its output, how much its output responds to its score, and
// how much its score responds to one chosen weight. The chain rule
// multiplies them, and the widget shows the three factors and the
// product for whichever weight is chosen. Every factor is read from the
// API's backward pass.

import { useState } from "react";
import { AMBER, HIDDEN_NAMES, INDIGO, show, useWorkedStep, workedRequest } from "./backpropFixtures";

export function LocalResponsibility() {
  const { step, message } = useWorkedStep(workedRequest());
  const [which, setWhich] = useState(0);

  if (!step) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }
  const output = step.layers[1];
  const isBias = which === 3;
  const lossToOutput = output.arriving[0];
  const outputToScore = output.slopes[0];
  const scoreToWeight = isBias ? 1 : output.inputs[which];
  const product = isBias ? output.bias_gradient[0] : output.weight_gradient[0][which];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        the output neuron&rsquo;s parameter
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {[...HIDDEN_NAMES.map((name, index) => ({ label: `w${index + 1}, from ${name}`, index })), { label: "bias", index: 3 }].map((choice) => (
            <button key={choice.index} onClick={() => setWhich(choice.index)} className={"rounded px-2 py-0.5 text-xs font-medium transition " + (which === choice.index ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}>{choice.label}</button>
          ))}
        </span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
        <Factor question="How much does the loss respond to the neuron's output?" symbol="∂L/∂a" value={show(lossToOutput)} why="the loss is ½(ŷ − y)², whose slope is ŷ − y = 5 − 1" />
        <Times />
        <Factor question="How much does the output respond to the score?" symbol="∂a/∂z" value={show(outputToScore)} why="the output bend is the identity, whose slope is 1 everywhere" />
        <Times />
        <Factor question={isBias ? "How much does the score respond to the bias?" : "How much does the score respond to this weight?"} symbol={isBias ? "∂z/∂b" : `∂z/∂w${which + 1}`} value={show(scoreToWeight)} why={isBias ? "a bias is a weight on an input that is always 1" : `the score is Σ wᵢhᵢ + b, so its slope in w${which + 1} is what that weight multiplied, ${HIDDEN_NAMES[which]} = ${show(output.inputs[which])}`} />
        <Times equals />
        <div className="rounded-lg px-3 py-2" style={{ backgroundColor: `${AMBER}22` }}>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{isBias ? "∂L/∂b" : `∂L/∂w${which + 1}`}</div>
          <div className="font-mono text-2xl font-semibold" style={{ color: AMBER }}>{show(product)}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">the product of the three, which is the chain rule</div>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The first two factors do not depend on which parameter was chosen; <span style={{ color: INDIGO }}>their product is the neuron&rsquo;s delta</span>. Only the third factor changes, and it is whatever the parameter multiplied.
      </p>
    </div>
  );
}

function Factor({ question, symbol, value, why }: { question: string; symbol: string; value: string; why: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-[11px] text-slate-600 dark:text-slate-300">{question}</div>
      <div className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">{symbol}</div>
      <div className="font-mono text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</div>
      <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{why}</div>
    </div>
  );
}

function Times({ equals = false }: { equals?: boolean }) {
  return <div className="self-center text-center font-mono text-xl text-slate-400">{equals ? "=" : "×"}</div>;
}
