"use client";

import { useEffect, useState, type DependencyList, type ReactNode } from "react";
import { ApiError } from "@/lib/api";
import {
  attend, encodePositions, radial, recur, residual, updateEmbedding,
  type Colour, type RecurrentKind, type Word,
} from "@/lib/concepts/network-building-blocks";
import { Equation } from "@/components/concept/Equation";

const number = (value: number) => Math.abs(value) < 0.00005 ? "0" : value.toFixed(4);
const vector = (values: number[]) => `[${values.map(number).join(", ")}]`;

function useCalculation<T>(calculate: () => Promise<T>, dependencies: DependencyList) {
  const [result, setResult] = useState<{ view: T | null; error: string | null; pending: boolean }>({
    view: null, error: null, pending: true,
  });
  useEffect(() => {
    let current = true;
    Promise.resolve().then(() => {
      if (current) setResult({ view: null, error: null, pending: true });
    });
    const timer = setTimeout(() => {
      calculate().then(
        (view) => { if (current) setResult({ view, error: null, pending: false }); },
        (error) => {
          if (current) setResult({ view: null, pending: false, error: error instanceof ApiError ? error.message : "The example could not be calculated." });
        },
      );
    }, 100);
    return () => { current = false; clearTimeout(timer); };
    // Each caller lists the inputs used by its calculation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  return result;
}

function Result({ state, children }: { state: { pending: boolean; error: string | null }; children: ReactNode }) {
  return <div className="mt-5 space-y-4" aria-live="polite" aria-busy={state.pending}>
    {state.pending ? <p className="text-sm text-slate-500">Calculating the example…</p> : state.error ? <p role="alert" className="text-sm text-rose-600">{state.error}</p> : children}
  </div>;
}

function Slider({ label, value, min, max, step = 1, change }: {
  label: string; value: number; min: number; max: number; step?: number; change: (value: number) => void;
}) {
  return <label className="flex min-w-0 flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
    <span>{label}: <span className="font-mono">{value}</span></span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => change(Number(event.target.value))} className="w-full accent-indigo-600" />
  </label>;
}

function Table({ caption, columns, rows }: { caption: string; columns: string[]; rows: ReactNode[][] }) {
  return <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
    <table className="w-full whitespace-nowrap text-left text-sm">
      <caption className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">{caption}</caption>
      <thead className="bg-slate-50 dark:bg-slate-800"><tr>{columns.map((column) => <th key={column} scope="col" className="px-3 py-2 font-medium">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index} className="border-t border-slate-100 dark:border-slate-800">{row.map((cell, column) => <td key={column} className="px-3 py-2 font-mono">{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}

const selectClass = "rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200";

export function AttentionExplorer() {
  const [tokens, setTokens] = useState<Colour[]>(["red", "blue", "red"]);
  const [heads, setHeads] = useState(1);
  const [causal, setCausal] = useState(false);
  const [positions, setPositions] = useState(false);
  const state = useCalculation(() => attend(tokens, heads, causal, positions), [tokens, heads, causal, positions]);
  const view = state.view;
  return <div>
    <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">These colour names have assigned vectors. The four projection matrices are identities, so the example exposes the arithmetic without claiming to have learned language.</p>
    <div className="flex flex-wrap gap-3">{tokens.map((token, index) => <label key={index} className="text-sm">Token {index + 1}{" "}<select className={selectClass} value={token} onChange={(event) => setTokens(tokens.map((item, position) => position === index ? event.target.value as Colour : item))}>{["red", "blue", "green"].map((colour) => <option key={colour}>{colour}</option>)}</select></label>)}</div>
    <div className="mt-4 flex flex-wrap gap-4 text-sm">
      <label>Heads <select className={selectClass} value={heads} onChange={(event) => setHeads(Number(event.target.value))}><option value={1}>1</option><option value={2}>2</option></select></label>
      <label><input type="checkbox" checked={causal} onChange={(event) => setCausal(event.target.checked)} /> Block future tokens</label>
      <label><input type="checkbox" checked={positions} onChange={(event) => setPositions(event.target.checked)} /> Add positional encoding</label>
    </div>
    <Result state={state}>{view && <>
      <Table caption="Vectors entering attention" columns={["Token", "Vector"]} rows={view.tokens.map((token, index) => [`${index + 1}: ${token}`, vector(view.inputs[index])])} />
      {view.shares.map((shares, head) => <div key={head} className="space-y-3">
        <Table caption={`Head ${head + 1}: each row reads from the columns`} columns={["Reading token", ...view.tokens.map((token, index) => `${index + 1}: ${token}`)]} rows={shares.map((row, index) => [`${index + 1}: ${view.tokens[index]}`, ...row.map((share, column) => <span key={column} className="block rounded px-2 py-1 text-center" style={{ backgroundColor: `rgb(99 102 241 / ${0.08 + share * 0.35})` }}>{number(share)}</span>)])} />
        <details className="text-sm"><summary className="cursor-pointer font-medium">Inspect this head&apos;s queries, keys, and values</summary><Table caption="The three roles at each position" columns={["Position", "Query", "Key", "Value"]} rows={view.tokens.map((_, index) => [index + 1, vector(view.queries[head][index]), vector(view.keys[head][index]), vector(view.values[head][index])])} /></details>
      </div>)}
      <p className="text-sm">Each row&apos;s shares total one before rounding. A blocked entry is exactly zero.</p>
      <Table caption="Output after gathering values and joining the heads" columns={["Position", "Output vector"]} rows={view.outputs.map((row, index) => [index + 1, vector(row)])} />
    </>}</Result>
  </div>;
}

export function EmbeddingExplorer() {
  const [tokens, setTokens] = useState<Word[]>(["cat", "dog", "cat"]);
  const [rate, setRate] = useState(0.1);
  const state = useCalculation(() => updateEmbedding(tokens, rate), [tokens, rate]);
  const view = state.view;
  return <div>
    <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">For this exercise, we assign a target vector to each word and take one training step from the same starting table. Real tasks usually supply prediction targets, from which embedding gradients are calculated.</p>
    <div className="mb-4 flex flex-wrap gap-3">{tokens.map((token, index) => <label key={index} className="text-sm">Word {index + 1}{" "}<select className={selectClass} value={token} onChange={(event) => setTokens(tokens.map((item, position) => position === index ? event.target.value as Word : item))}>{["cat", "dog", "mat"].map((word) => <option key={word}>{word}</option>)}</select></label>)}</div>
    <Slider label="Learning rate" value={rate} min={0} max={0.1} step={0.01} change={setRate} />
    <Result state={state}>{view && <>
      <Table caption="Look up each ID, then compare with its assigned target" columns={["Word", "ID", "Looked-up vector", "Target"]} rows={tokens.map((token, index) => [token, view.identifiers[index], vector(view.looked_up[index]), vector(view.targets[index])])} />
      <Table caption="One update to the shared table" columns={["Word", "Before", "Gradient", "After"]} rows={view.vocabulary.map((word, index) => [word, vector(view.before[index]), vector(view.gradient[index]), vector(view.after[index])])} />
      <Equation>{`Loss before the step: ${number(view.loss_before)}\nLoss after the step:  ${number(view.loss_after)}`}</Equation>
      <p className="text-sm">Repeated words add their contributions to the same row. A word absent from the sequence leaves its row unchanged.</p>
    </>}</Result>
  </div>;
}

export function PositionExplorer() {
  const [steps, setSteps] = useState(4);
  const [wavelength, setWavelength] = useState(10000);
  const state = useCalculation(() => encodePositions(steps, wavelength), [steps, wavelength]);
  const view = state.view;
  return <div>
    <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">Every position starts with the same token vector. Only its position changes.</p>
    <div className="grid gap-4 sm:grid-cols-2"><Slider label="Sequence length" value={steps} min={1} max={8} change={setSteps} /><label className="text-sm">Frequency base <select className={selectClass} value={wavelength} onChange={(event) => setWavelength(Number(event.target.value))}><option value={10000}>10000</option><option value={100}>100</option><option value={2}>2</option></select></label></div>
    <Result state={state}>{view && <Table caption="Add a different position vector to each occurrence" columns={["Position", "Token vector", "Position vector", "Result"]} rows={view.inputs.map((row, index) => [index, vector(row), vector(view.pattern[index]), vector(view.outputs[index])])} />}</Result>
  </div>;
}

export function RecurrentExplorer() {
  const [kind, setKind] = useState<RecurrentKind>("lstm");
  const [steps, setSteps] = useState(6);
  const [signal, setSignal] = useState(1);
  const [forget, setForget] = useState(1);
  const state = useCalculation(() => recur(kind, steps, signal, forget), [kind, steps, signal, forget]);
  const view = state.view;
  return <div>
    <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">A signal arrives at the first step. Later inputs are zero. These cells use chosen weights to expose their operations; this is not a trained performance comparison.</p>
    <label className="text-sm">Cell <select className={selectClass} value={kind} onChange={(event) => setKind(event.target.value as RecurrentKind)}><option value="simple">Simple recurrent</option><option value="lstm">LSTM</option><option value="gru">GRU</option></select></label>
    <div className="mt-4 grid gap-4 sm:grid-cols-2"><Slider label="Steps" value={steps} min={2} max={12} change={setSteps} /><Slider label="First input" value={signal} min={-3} max={3} step={0.25} change={setSignal} />{kind === "lstm" && <Slider label="Forget gate bias" value={forget} min={-3} max={3} step={0.25} change={setForget} />}</div>
    <Result state={state}>{view && <>
      <Table caption="Follow the state through the sequence" columns={["Step", "Input", "Hidden state", ...(kind === "lstm" ? ["Cell memory"] : [])]} rows={view.inputs.map((input, index) => [index + 1, number(input), number(view.states[index]), ...(kind === "lstm" ? [number(view.cells[index])] : [])])} />
      <details className="text-sm"><summary className="cursor-pointer font-medium">Inspect gates and the gradient reaching each input</summary><div className="mt-3 space-y-3"><Table caption="Gate values at every step" columns={["Step", ...view.gate_names]} rows={view.gates.map((row, index) => [index + 1, ...row.map(number)])} /><Table caption="Derivative of the final hidden state with respect to each input" columns={["Input step", "Derivative"]} rows={view.input_slopes.map((slope, index) => [index + 1, number(slope)])} /></div></details>
    </>}</Result>
  </div>;
}

export function RadialExplorer() {
  const [probe, setProbe] = useState(1);
  const [width, setWidth] = useState(1);
  const state = useCalculation(() => radial(probe, width), [probe, width]);
  const view = state.view;
  const colours = ["#6366f1", "#059669", "#d97706"];
  return <div>
    <div className="grid gap-4 sm:grid-cols-2"><Slider label="Input" value={probe} min={-3} max={3} step={0.1} change={setProbe} /><Slider label="Width of each unit" value={width} min={0.2} max={3} step={0.1} change={setWidth} /></div>
    <Result state={state}>{view && <>
      <svg viewBox="0 0 600 235" className="w-full" role="img" aria-label="Three radial basis responses, peaking at their centres of minus one, zero, and one">
        <path d="M40 20V200H570" fill="none" stroke="currentColor" opacity="0.4" />
        {view.centres.map((centre, unit) => <path key={centre} fill="none" stroke={colours[unit]} strokeWidth="2.5" d={view.curve_inputs.map((input, index) => `${index === 0 ? "M" : "L"}${40 + (input + 3) / 6 * 530},${200 - view.curve_outputs[index][unit] * 180}`).join(" ")} />)}
        <line x1={40 + (probe + 3) / 6 * 530} x2={40 + (probe + 3) / 6 * 530} y1="20" y2="200" stroke="currentColor" strokeDasharray="4 4" />
        <text x="18" y="25" fill="currentColor" fontSize="12">1</text><text x="18" y="200" fill="currentColor" fontSize="12">0</text><text x="36" y="220" fill="currentColor" fontSize="12">−3</text><text x="300" y="220" fill="currentColor" fontSize="12">0</text><text x="565" y="220" fill="currentColor" fontSize="12">3</text>
      </svg>
      <Table caption="Response at the selected input" columns={["Centre", "Squared distance", "Output"]} rows={view.centres.map((centre, index) => [<span key={centre} style={{ color: colours[index] }}>{centre}</span>, number(view.distances_squared[index]), number(view.outputs[index])])} />
      <details className="text-sm"><summary className="cursor-pointer font-medium">Inspect parameter derivatives</summary><Table caption="Derivative of the sum of the three outputs" columns={["Centre", "Centre derivative", "Width derivative"]} rows={view.centres.map((centre, index) => [centre, number(view.centre_slopes[index]), number(view.width_slopes[index])])} /></details>
    </>}</Result>
  </div>;
}

export function ResidualExplorer() {
  const [value, setValue] = useState(1);
  const [weight, setWeight] = useState(0.5);
  const state = useCalculation(() => residual(value, weight), [value, weight]);
  const view = state.view;
  return <div>
    <div className="grid gap-4 sm:grid-cols-2"><Slider label="Input" value={value} min={-3} max={3} step={0.1} change={setValue} /><Slider label="Branch weight" value={weight} min={-3} max={3} step={0.1} change={setWeight} /></div>
    <Result state={state}>{view && <>
      <Equation>{`Branch: F(x) = tanh(weight × input)\nF(${number(value)}) = tanh(${number(weight)} × ${number(value)}) ≈ ${number(view.inner_output)}\n\nResidual output = input + branch output\n                ≈ ${number(value)} + (${number(view.inner_output)})\n                ≈ ${number(view.output)}`}</Equation>
      <Equation>{`Derivative through the branch ≈ ${number(view.inner_slope)}\nDerivative through the shortcut = 1\nCombined derivative ≈ 1 + (${number(view.inner_slope)})\n                    ≈ ${number(view.slope)}`}</Equation>
      <p className="text-sm">At a zero branch weight, the output preserves the input. A negative branch derivative can cancel part or all of the shortcut&apos;s derivative.</p>
    </>}</Result>
  </div>;
}
