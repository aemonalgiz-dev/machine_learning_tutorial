"use client";

// The 121 check, on any two vectors the reader types.
//
// Two routes to one number. The long route lifts both vectors through the
// worked degree-2 map and takes the ordinary inner product of the results;
// the short route takes the inner product of the raw vectors and squares
// it. The API computes both with the library's own kernels and hands back
// every intermediate, so the reader can watch the two columns agree on
// (1, 2) and (3, 4) and then break the agreement if they can. The browser
// only lays the numbers out.

import { useEffect, useState } from "react";
import { ApiError, IdentityCheck, checkIdentity } from "@/lib/concepts/kernel-trick";

const FIELD =
  "w-16 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-center font-mono text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

function Vector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: [number, number];
  onChange: (next: [number, number]) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <span className="font-mono">{label} = (</span>
      <input
        type="number"
        step={0.5}
        value={value[0]}
        onChange={(event) => onChange([Number(event.target.value), value[1]])}
        className={FIELD}
      />
      <span className="font-mono">,</span>
      <input
        type="number"
        step={0.5}
        value={value[1]}
        onChange={(event) => onChange([value[0], Number(event.target.value)])}
        className={FIELD}
      />
      <span className="font-mono">)</span>
    </label>
  );
}

export function KernelIdentityCheck() {
  const [a, setA] = useState<[number, number]>([1, 2]);
  const [b, setB] = useState<[number, number]>([3, 4]);
  const [check, setCheck] = useState<IdentityCheck | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!a.every(Number.isFinite) || !b.every(Number.isFinite)) return;
    const timer = setTimeout(async () => {
      try {
        setCheck(await checkIdentity(a, b));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [a, b]);

  const number = (value: number) =>
    Number.isInteger(value) ? String(value) : value.toFixed(4);
  const vector = (values: number[]) => `(${values.map(number).join(", ")})`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Vector label="a" value={a} onChange={setA} />
        <Vector label="b" value={b} onChange={setB} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            The long route, lift then multiply
          </p>
          <div className="space-y-1 font-mono text-sm text-slate-800 dark:text-slate-200">
            <p>φ(a) = {check ? vector(check.phi_a) : "…"}</p>
            <p>φ(b) = {check ? vector(check.phi_b) : "…"}</p>
            <p className="font-semibold">
              φ(a) · φ(b) = {check ? number(check.lifted_product) : "…"}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            The short route, multiply then square
          </p>
          <div className="space-y-1 font-mono text-sm text-slate-800 dark:text-slate-200">
            <p>a · b = {check ? number(check.dot_product) : "…"}</p>
            <p>&nbsp;</p>
            <p className="font-semibold">
              (a · b)² = {check ? number(check.kernel_value) : "…"}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The lift is φ(x) = (x₁², √2·x₁x₂, x₂²). Both routes are computed the same
        way, the plain inner product on the lifted vectors and the squared
        kernel on the raw ones.
      </p>

      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
