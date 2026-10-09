"use client";

import { useState } from "react";
import { dot } from "@/lib/builds/tools";
import { show } from "@/lib/builds/engine";

/** Follow an actual matrix-vector input pair, including a learner's incorrect one. */
export function MatrixVectorCalculation({ matrix, vector, purchases = false }: {
  matrix: number[][]; vector: number[]; purchases?: boolean;
}) {
  const [selected, setSelected] = useState(0);
  const row = Math.min(selected, matrix.length - 1);
  const names = matrix.map((_, i) => purchases ? `Customer ${String.fromCharCode(65 + i)}` : `Row ${i + 1}`);
  const columns = vector.map((_, i) => purchases && i < 2 ? ["Bread", "Milk"][i] : `Entry ${i + 1}`);
  const totals = matrix.map(values => dot(values, vector));
  return <section aria-label="Follow the matrix calculation" className="min-w-0 rounded-xl border border-line bg-surface p-4 sm:p-5">
    <h4 className="font-semibold">Where does each answer come from?</h4>
    <p className="mt-2 text-sm leading-7 text-muted">Select a row. Each of its entries meets the matching entry in the vector. Add those contributions to get that row&apos;s answer.</p>
    <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-w-0 overflow-auto">
        <table className="w-full border-separate border-spacing-1 text-sm">
          <caption className="mb-2 text-left font-semibold">{purchases ? "Purchases" : "Matrix"}<span className="mt-1 block font-mono text-xs font-normal text-muted">{matrix.length} rows · {vector.length} columns</span></caption>
          <thead><tr><th scope="col" className="text-left">{purchases ? "Customer" : "Row"}</th>{columns.map(name => <th scope="col" key={name} className="px-2 text-xs font-normal text-muted">{name}</th>)}</tr></thead>
          <tbody>{matrix.map((values, i) => <tr key={i} className={i === row ? "bg-accent-soft" : "bg-raised"}>
            <th scope="row" className="rounded-l-lg text-left"><button type="button" aria-pressed={i === row} aria-label={`Follow ${names[i]}`} onClick={() => setSelected(i)} className="min-h-11 px-2 text-xs font-semibold underline underline-offset-4">{names[i]}</button></th>
            {values.map((value, j) => <td key={j} className="px-2 text-center font-mono text-accent">{show(value)}</td>)}
          </tr>)}</tbody>
        </table>
      </div>
      <div className="min-w-0 overflow-auto">
        <table className="w-full border-separate border-spacing-1 text-sm">
          <caption className="mb-2 text-left font-semibold">{purchases ? "Price vector" : "Vector"}<span className="mt-1 block font-mono text-xs font-normal text-muted">{vector.length} entries · same column order</span></caption>
          <thead><tr><th scope="col" className="text-left text-xs text-muted">{purchases ? "Item" : "Entry"}</th><th scope="col" className="text-xs text-muted">{purchases ? "Coins each" : "Value"}</th></tr></thead>
          <tbody>{vector.map((value, i) => <tr key={i} className="bg-raised"><th scope="row" className="px-2 py-3 text-left text-xs font-normal">{columns[i]}</th><td className="px-2 text-center font-mono text-accent">{show(value)}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="min-w-0 overflow-auto">
        <table className="w-full border-separate border-spacing-1 text-sm" aria-label="Calculated results">
          <caption className="mb-2 text-left font-semibold">{purchases ? "Bills in coins" : "Result vector"}<span className="mt-1 block font-mono text-xs font-normal text-muted">{matrix.length} answers · one per row</span></caption>
          <thead><tr><th scope="col" className="text-left text-xs text-muted">{purchases ? "Customer" : "Row"}</th><th scope="col" className="text-xs text-muted">Result</th></tr></thead>
          <tbody>{totals.map((value, i) => <tr key={i} className={i === row ? "bg-accent-soft" : "bg-raised"}><th scope="row" className="px-2 py-3 text-left text-xs font-normal">{names[i]}</th><td className="px-2 text-center font-mono text-accent">{show(value)}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
    <div className="mt-4 rounded-lg border border-accent-fill/40 bg-background p-4" aria-live="polite" aria-atomic="true">
      <p className="mb-2 text-sm font-semibold">Follow {names[row]}</p>
      <pre className="max-h-52 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-7 text-accent" data-testid="matrix-row-calculation">{[
        ...matrix[row].map((value, i) => `${columns[i]}: ${show(value)} × ${show(vector[i])} = ${show(value * vector[i])}`),
        "",
        `${matrix[row].map((value, i) => show(value * vector[i])).join(" + ")} = ${show(totals[row])}${purchases ? " coins" : ""}`,
      ].join("\n")}</pre>
    </div>
  </section>;
}
