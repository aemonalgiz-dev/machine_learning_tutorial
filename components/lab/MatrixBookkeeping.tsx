"use client";

import { useState } from "react";
import { BotieSays } from "@/components/site/Botie";
import { MatrixVectorCalculation } from "./MatrixVectorCalculation";
import { WorkshopValue } from "./WorkshopValue";
import type { Build } from "@/lib/builds/engine";

const button = "min-h-11 rounded-lg border border-line bg-raised px-3 py-2 text-sm font-semibold hover:border-accent-fill disabled:opacity-40";
const steps = ["Start with one bill", "Keep the customers together", "Arrange the records"];

export function MatrixBookkeeping({ build }: { build: Build }) {
  const sample = build.cases[0].data;
  const initial = (sample.loaves as number[]).map((loaves, i) => [loaves, (sample.bottles as number[])[i]]);
  const [step, setStep] = useState(0);
  const [purchases, setPurchases] = useState(initial);
  const [prices, setPrices] = useState(sample.prices as number[]);
  const [customersAsRows, setCustomersAsRows] = useState(false);
  const rows = step === 0 ? purchases.slice(0, 1) : purchases;
  const columnNames = ["Bread", "Milk"];
  function changeQuantity(row: number, column: number, text: string) {
    const number = Number(text);
    if (!Number.isInteger(number) || number < 0 || number > 20) return;
    setPurchases(previous => previous.map((values, i) => i === row ? values.map((value, j) => j === column ? number : value) : values));
  }
  function changePrice(column: number, text: string) {
    const number = Number(text);
    if (!Number.isFinite(number) || number < 0 || number > 20) return;
    setPrices(previous => previous.map((value, i) => i === column ? number : value));
  }
  return <section className="mt-6 min-w-0 space-y-5" aria-label="From purchases to a matrix">
    <h3 className="text-xl font-semibold">Why would we put the purchases in a matrix?</h3>
    <nav className="flex flex-wrap gap-2" aria-label="Matrix walkthrough">
      {steps.map((title, i) => <button key={title} type="button" className={`${button} ${step === i ? "!border-accent-fill text-accent" : ""}`} aria-current={step === i ? "step" : undefined} onClick={() => setStep(i)}>{i + 1}. {title}</button>)}
    </nav>
    <BotieSays>
      {step === 0 ? "Suppose a customer buys some bread and milk. We need the quantity of each item and its price. First find what the bread costs, then what the milk costs, and add them to get the bill. Try changing a quantity or a price below and follow the calculation."
        : step === 1 ? "Now there are several customers. We could write that calculation again for each person, but it follows the same pattern every time. Let's give each customer a row and each item a column. This rectangular arrangement is a matrix. The prices form a vector, an ordered list with bread first and milk second. The order tells us which price belongs to which quantity."
          : "The shop's records give us all the bread quantities in one list and all the milk quantities in another. Collecting those lists gives us two rows, one per item. We want one row per customer before calculating the bills. Swapping rows and columns, called transposing, changes that arrangement without changing any quantities. Try it below and follow where each customer's numbers go."}
    </BotieSays>
    {step < 2 ? <>
      <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
        <p className="mb-3 text-sm font-semibold">Change the purchases</p>
        <div className="max-w-full overflow-auto">
          <table className="w-full border-separate border-spacing-2 text-sm">
            <caption className="sr-only">Editable customer purchases</caption>
            <thead><tr><th scope="col" className="text-left">Customer</th><th scope="col" className="text-xs">Bread (loaves)</th><th scope="col" className="text-xs">Milk (bottles)</th></tr></thead>
            <tbody>{rows.map((values, i) => <tr key={i}><th scope="row" className="text-left">{String.fromCharCode(65 + i)}</th>{values.map((value, j) => <td key={j}><input aria-label={`Customer ${String.fromCharCode(65 + i)} ${columnNames[j].toLowerCase()} quantity`} type="number" min={0} max={20} step={1} value={value} onChange={event => changeQuantity(i, j, event.target.value)} className="min-h-11 w-full min-w-14 rounded-lg border border-line bg-background px-2 font-mono text-accent" /></td>)}</tr>)}</tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">{prices.map((price, i) => <label key={i} className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-xs text-muted">{columnNames[i]} price (coins each)<input aria-label={`${columnNames[i]} price in coins`} type="number" min={0} max={20} step={0.5} value={price} onChange={event => changePrice(i, event.target.value)} className="min-h-11 w-20 rounded-lg border border-line bg-background px-2 font-mono text-sm text-accent" /></label>)}</div>
      </div>
      <MatrixVectorCalculation matrix={rows} vector={prices} purchases />
      <p className="text-sm leading-7 text-muted">{step === 0 ? "Multiplying the matching entries and adding the products is called a dot product. It turns one customer's quantities and the price vector into one bill."
        : "Matrix-vector multiplication performs that dot product for every row. Change one customer's quantity: only that customer's bill changes. Change a price: every customer buying that item is affected. The result is another vector, with one bill in the position of each customer's row."}</p>
    </> : <>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">{columnNames.map((name, column) => <div key={name} className="min-w-0 rounded-xl border border-line bg-surface p-4"><h4 className="mb-2 text-sm font-semibold">{name} quantities, in customer order</h4><WorkshopValue value={purchases.map(row => row[column])} /></div>)}</div>
      <div className="min-w-0 rounded-xl border border-line bg-surface p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <button type="button" className={button} aria-pressed={!customersAsRows} onClick={() => setCustomersAsRows(false)}>Collect the two lists</button>
          <button type="button" className={button} aria-pressed={customersAsRows} onClick={() => setCustomersAsRows(true)}>Swap rows and columns</button>
        </div>
        <p className="mb-3 text-sm leading-7" aria-live="polite">{customersAsRows ? "Now each row is a customer. Bread is the first column and milk is the second, matching the order of the prices." : "Each row is an item: bread, then milk. Each column is a customer. These rows do not yet match our two-entry price vector."}</p>
        <div className="max-w-full overflow-auto"><table className="w-full border-separate border-spacing-2 text-sm" aria-label="Arrangement of purchase records">
          <caption className="mb-2 text-left font-mono text-xs text-muted">{customersAsRows ? "3 rows of customers · 2 columns of items" : "2 rows of items · 3 columns of customers"}</caption>
          <thead><tr><th scope="col">{customersAsRows ? "Customer" : "Item"}</th>{(customersAsRows ? columnNames : ["Customer A", "Customer B", "Customer C"]).map(name => <th scope="col" key={name} className="text-xs font-normal text-muted">{name}</th>)}</tr></thead>
          <tbody>{(customersAsRows ? purchases : columnNames.map((_, j) => purchases.map(row => row[j]))).map((values, i) => <tr key={i}><th scope="row" className="text-xs">{customersAsRows ? `Customer ${String.fromCharCode(65 + i)}` : columnNames[i]}</th>{values.map((value, j) => <td key={j} className="rounded-lg bg-raised p-3 text-center font-mono text-accent">{value}</td>)}</tr>)}</tbody>
        </table></div>
      </div>
      <p className="text-sm leading-7 text-muted">In the workshop, choose the pieces that arrange these records, then connect the matrix and price vector to Matrix times vector. Its first input needs the customer rows. Its second needs the prices. The result must keep the customers in the same order. Select that piece after a run to see the calculation inside it.</p>
      <p className="text-sm leading-7 text-muted">The number of matrix columns must match the number of vector entries: each item needs a price. The number of customers can change, because each row gets its own calculation.</p>
    </>}
    <div className="flex flex-wrap justify-between gap-3">
      <button type="button" className={button} disabled={step === 0} onClick={() => setStep(value => value - 1)}>← Previous step</button>
      {step < 2 && <button type="button" className={button} onClick={() => setStep(value => value + 1)}>Continue with the purchases →</button>}
      <button type="button" className={button} onClick={() => { setPurchases(initial); setPrices(sample.prices as number[]); setCustomersAsRows(false); }}>Reset purchases and prices</button>
    </div>
    <p className="text-xs leading-6 text-muted">These editable purchases are for exploring the calculation. The construction below has its own fixed test cases, so changing this example does not change the challenge.</p>
  </section>;
}
