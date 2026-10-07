"use client";

import { useEffect, useState } from "react";
import { ApiError, IdentityCheck, checkIdentity } from "@/lib/concepts/kernel-trick";
import { Equation } from "@/components/concept/Equation";

const FIELD = "w-16 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-center font-mono text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";
const number = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(4);
const vector = (values: number[]) => `(${values.map(number).join(", ")})`;

function Vector({ label, value, onChange }: {
  label: string;
  value: [number, number];
  onChange: (next: [number, number]) => void;
}) {
  return <fieldset className="flex min-w-0 items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
    <legend className="sr-only">Vector {label}</legend>
    <span className="font-mono">{label} = (</span>
    <input aria-label={`${label}, first coordinate`} type="number" step={0.5} value={value[0]} onChange={(event) => onChange([Number(event.target.value), value[1]])} className={FIELD} />
    <span className="font-mono">,</span>
    <input aria-label={`${label}, second coordinate`} type="number" step={0.5} value={value[1]} onChange={(event) => onChange([value[0], Number(event.target.value)])} className={FIELD} />
    <span className="font-mono">)</span>
  </fieldset>;
}

export function KernelIdentityCheck() {
  const [a, setA] = useState<[number, number]>([1, 2]);
  const [b, setB] = useState<[number, number]>([3, 4]);
  const [check, setCheck] = useState<IdentityCheck | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!a.every(Number.isFinite) || !b.every(Number.isFinite)) return;
    let current = true;
    const timer = setTimeout(async () => {
      try {
        const next = await checkIdentity(a, b);
        if (current) { setCheck(next); setMessage(null); }
      } catch (error) {
        if (current) setMessage(error instanceof ApiError ? error.message : "The comparison could not be calculated.");
      }
    }, 120);
    return () => { current = false; clearTimeout(timer); };
  }, [a, b]);

  return <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <Vector label="a" value={a} onChange={(next) => { setCheck(null); setMessage(null); setA(next); }} />
      <Vector label="b" value={b} onChange={(next) => { setCheck(null); setMessage(null); setB(next); }} />
    </div>
    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">The first route constructs the three features for each input. The second route works directly with the original two coordinates. Compare their final results.</p>
    <div aria-live="polite" aria-busy={!check && !message}>
      {check ? <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
          <h4 className="mb-2 font-semibold">1. Build features, then compare</h4>
          <Equation>{`φ(a) = ${vector(check.phi_a)}\nφ(b) = ${vector(check.phi_b)}\n\nφ(a) · φ(b)\n≈ (${number(check.phi_a[0])} × ${number(check.phi_b[0])})\n + (${number(check.phi_a[1])} × ${number(check.phi_b[1])})\n + (${number(check.phi_a[2])} × ${number(check.phi_b[2])})\n≈ ${number(check.lifted_product)}`}</Equation>
        </div>
        <div className="min-w-0 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
          <h4 className="mb-2 font-semibold">2. Compare, then square</h4>
          <Equation>{`a · b\n= (${number(a[0])} × ${number(b[0])})\n + (${number(a[1])} × ${number(b[1])})\n≈ ${number(check.dot_product)}\n\nk(a, b) = (a · b)²\n≈ ${number(check.kernel_value)}`}</Equation>
        </div>
      </div> : <p className="mt-3 text-sm text-slate-500">{message ?? "Calculating both routes…"}</p>}
    </div>
    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Both results come from the SDK. Displayed decimals are rounded; the calculations use full precision. The equality of the two routes comes from the fixed feature map below.</p>
    <Equation>{"φ(x₁, x₂) = (x₁², √2 × x₁ × x₂, x₂²)\nk(a, b) = (a · b)²"}</Equation>
  </div>;
}
