"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { calculateModern, controlsFor, type ExampleInputs, type ModernTopic, type ModernView } from "@/lib/concepts/modern-learning";

const inputClass = "min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";
const format = (value: string | number) => typeof value === "string" ? value
  : Math.abs(value) < 0.00005 ? "0" : Number.isInteger(value) ? String(value) : value.toFixed(4);

export function ModernLearningExample({ topic }: { topic: ModernTopic }) {
  const controls = controlsFor(topic);
  const [inputs, setInputs] = useState<ExampleInputs>(() => Object.fromEntries(controls.map(control => [control.key, control.initial])));
  const [state, setState] = useState<{ view: ModernView | null; error: string | null; pending: boolean }>({ view: null, error: null, pending: true });
  const [attempt, setAttempt] = useState(0);
  const change = (key: string, value: string | number | boolean) => setInputs(previous => ({ ...previous, [key]: value }));

  useEffect(() => {
    let current = true;
    Promise.resolve().then(() => { if (current) setState({ view: null, error: null, pending: true }); });
    const timer = setTimeout(() => {
      if (typeof inputs.query === "string" && !inputs.query.trim()) {
        if (current) setState({ view: null, pending: false, error: "Enter a word or phrase to search the passages." });
        return;
      }
      calculateModern(topic, inputs).then(
        view => { if (current) setState({ view, error: null, pending: false }); },
        error => { if (current) setState({ view: null, error: error instanceof ApiError ? error.message : "The example could not be calculated.", pending: false }); },
      );
    }, 150);
    return () => { current = false; clearTimeout(timer); };
  }, [topic, inputs, attempt]);

  return <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2">{controls.map(control => <label key={control.key} className="flex min-w-0 flex-col gap-2 text-sm text-slate-700 dark:text-slate-300">
      {control.kind === "checkbox" ? <span className="flex items-start gap-2"><input type="checkbox" className="mt-1 accent-indigo-600" checked={inputs[control.key] === true} onChange={event => change(control.key, event.target.checked)} />{control.label}</span> : <>
        <span>{control.label}{control.kind === "range" && <>: <span className="font-mono">{String(inputs[control.key])}</span></>}</span>
        {control.kind === "range" ? <input type="range" min={control.min} max={control.max} step={control.step} value={Number(inputs[control.key])} onChange={event => change(control.key, Number(event.target.value))} className="w-full accent-indigo-600" />
          : control.kind === "select" ? <select className={inputClass} value={String(inputs[control.key])} onChange={event => change(control.key, event.target.value)}>{control.options.map(option => <option key={option}>{option}</option>)}</select>
          : <input type="text" className={inputClass} maxLength={160} value={String(inputs[control.key])} onChange={event => change(control.key, event.target.value)} />}
      </>}
    </label>)}</div>
    <div aria-live="polite" aria-busy={state.pending} className="space-y-5">
      {state.pending ? <p className="text-sm text-slate-500">Calculating the example…</p> : state.error ? <div><p role="alert" className="text-sm text-rose-600">{state.error}</p><button type="button" onClick={() => setAttempt(value => value + 1)} className="mt-2 text-sm font-medium text-indigo-600 underline dark:text-indigo-400">Try again</button></div> : state.view && <>
        <p className="text-sm text-slate-600 dark:text-slate-400">{state.view.notice}</p>
        {state.view.tables.map(table => <div key={table.title} className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700" tabIndex={0} role="region" aria-label={table.title}>
          <table className="w-full text-left text-sm">
            <caption className="px-3 py-2 text-left font-semibold text-slate-800 dark:text-slate-200">{table.title}</caption>
            <thead className="bg-slate-50 dark:bg-slate-800"><tr>{table.columns.map((column, index) => <th key={index} scope="col" className="px-3 py-2 font-medium">{column}</th>)}</tr></thead>
            <tbody>{table.rows.map((row, index) => <tr key={index} className="border-t border-slate-100 dark:border-slate-800">{row.map((cell, position) => <td key={position} className={`px-3 py-2 ${typeof cell === "number" ? "whitespace-nowrap font-mono tabular-nums" : "min-w-20"}`}>{format(cell)}</td>)}</tr>)}</tbody>
          </table>
          {!table.rows.length && <p className="px-3 pb-3 text-sm text-slate-500">No matching passages.</p>}
        </div>)}
        <p className="text-xs text-slate-500">Displayed numbers are rounded. The calculation uses full precision.</p>
        {state.view.notes.map(note => <p key={note} className="text-sm text-slate-600 dark:text-slate-400">{note}</p>)}
      </>}
    </div>
  </div>;
}
