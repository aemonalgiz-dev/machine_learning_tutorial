"use client";

// The machine's whole view of the clinic, one kernel at a time.
//
// Twenty-four patients make a twenty-four by twenty-four table of kernel
// values, and once it exists the fit never looks at a temperature or a
// heart rate again. The heat map is that table, the strip beneath it is the
// table's eigenvalues, and the readouts say whether the table came from a
// kernel at all. Under the sigmoid the answer is no, some eigenvalues are
// negative, and the readouts show the library's ridge solver refusing the
// matrix while the classifier's ascent runs on it regardless. The API
// builds the matrix and tests it; the browser only colours cells.

import { useEffect, useState } from "react";
import {
  ApiError,
  ClinicGram,
  KernelChoice,
  fetchClinicGram,
} from "@/lib/concepts/kernel-trick";
import { CLINIC } from "./kernelTrickFixtures";

const CELL = 14;
const GRID = CELL * CLINIC.length;
const STRIP = { width: 560, height: 90, pad: 28 };

type KernelName = "linear" | "polynomial" | "rbf" | "sigmoid";

const KERNELS: { key: KernelName; label: string; choice: KernelChoice }[] = [
  { key: "linear", label: "Linear", choice: { name: "linear" } },
  { key: "polynomial", label: "Squared", choice: { name: "polynomial", degree: 2, constant: 1 } },
  { key: "rbf", label: "Radial", choice: { name: "rbf", gamma: 1 } },
  { key: "sigmoid", label: "Sigmoid, constant −1", choice: { name: "sigmoid", gamma: 1, constant: -1 } },
];

const cache = new Map<KernelName, Promise<ClinicGram>>();
function gramFor(name: KernelName): Promise<ClinicGram> {
  const found = cache.get(name);
  if (found) return found;
  const choice = KERNELS.find((each) => each.key === name)!.choice;
  const pending = fetchClinicGram(CLINIC, choice).catch((error) => {
    cache.delete(name);
    throw error;
  });
  cache.set(name, pending);
  return pending;
}

function cellColour(value: number, low: number, high: number): string {
  // Zero is white; positive values run to indigo and negative to amber.
  if (value >= 0) {
    const share = high > 0 ? value / high : 0;
    return `rgba(99, 102, 241, ${0.08 + 0.85 * share})`;
  }
  const share = low < 0 ? value / low : 0;
  return `rgba(245, 158, 11, ${0.08 + 0.85 * share})`;
}

export function ClinicGramMatrix() {
  const [kernel, setKernel] = useState<KernelName>("rbf");
  const [gram, setGram] = useState<ClinicGram | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const answer = await gramFor(kernel);
        if (!cancelled) {
          setGram(answer);
          setMessage(null);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kernel]);

  const high = gram ? Math.max(...gram.values.flat()) : 1;
  const low = gram ? Math.min(...gram.values.flat()) : 0;
  const eigenHigh = gram ? Math.max(...gram.eigenvalues, 0) : 1;
  const eigenLow = gram ? Math.min(...gram.eigenvalues, 0) : 0;
  const stripX = (value: number) =>
    STRIP.pad + ((value - eigenLow) / (eigenHigh - eigenLow || 1)) * (STRIP.width - 2 * STRIP.pad);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
        {KERNELS.map((option) => (
          <button
            key={option.key}
            onClick={() => setKernel(option.key)}
            className={
              "rounded px-3 py-1 text-sm font-medium transition " +
              (kernel === option.key
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-[auto_1fr]">
        <svg
          viewBox={`0 0 ${GRID} ${GRID}`}
          className="mx-auto w-full max-w-[336px] select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        >
          {gram &&
            gram.values.map((row, rowIndex) =>
              row.map((value, columnIndex) => (
                <rect
                  key={`${rowIndex}-${columnIndex}`}
                  x={columnIndex * CELL}
                  y={rowIndex * CELL}
                  width={CELL}
                  height={CELL}
                  fill={cellColour(value, low, high)}
                />
              )),
            )}
          {/* the healthy ten occupy the first rows and columns */}
          <line x1={0} x2={GRID} y1={10 * CELL} y2={10 * CELL} className="stroke-slate-400" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={10 * CELL} x2={10 * CELL} y1={0} y2={GRID} className="stroke-slate-400" strokeWidth={1} strokeDasharray="3 3" />
        </svg>

        <div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="kernel" value={gram ? gram.kernel_description : "…"} />
            <Stat label="symmetric" value={gram ? (gram.symmetric ? "yes" : "no") : "…"} />
            <Stat label="largest eigenvalue" value={gram ? gram.largest_eigenvalue.toFixed(3) : "…"} />
            <Stat
              label="smallest eigenvalue"
              value={gram ? gram.smallest_eigenvalue.toFixed(gram.smallest_eigenvalue < -0.001 ? 3 : 6) : "…"}
            />
            <Stat label="negative eigenvalues" value={gram ? String(gram.n_negative_eigenvalues) : "…"} />
            <Stat label="ridge solve accepts it" value={gram ? (gram.ridge_accepts ? "yes" : "no, refused") : "…"} />
            <Stat
              label="classifier ascent on it"
              value={gram ? `runs, accuracy ${gram.classifier.accuracy.toFixed(3)}` : "…"}
            />
            <Stat label="support vectors" value={gram ? `${gram.classifier.n_support_vectors} of ${CLINIC.length}` : "…"} />
          </div>
          {gram?.ridge_refusal && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              The ridge solver&rsquo;s refusal reads, in part, &ldquo;
              {gram.ridge_refusal.split(" -- ")[0]}&rdquo;.
            </p>
          )}
        </div>
      </div>

      <svg viewBox={`0 0 ${STRIP.width} ${STRIP.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <line x1={STRIP.pad} x2={STRIP.width - STRIP.pad} y1={STRIP.height / 2} y2={STRIP.height / 2} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
        <line x1={stripX(0)} x2={stripX(0)} y1={STRIP.height / 2 - 14} y2={STRIP.height / 2 + 14} className="stroke-slate-500" strokeWidth={1.5} />
        <text x={stripX(0)} y={STRIP.height / 2 + 28} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">0</text>
        {gram &&
          gram.eigenvalues.map((value, index) => (
            <circle
              key={index}
              cx={stripX(value)}
              cy={STRIP.height / 2}
              r={5}
              fill={value < -1e-9 ? "#f59e0b" : "#6366f1"}
              fillOpacity={0.7}
              stroke="white"
              strokeWidth={1}
            />
          ))}
        <text x={STRIP.width - STRIP.pad} y={STRIP.height / 2 + 28} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">
          the twenty-four eigenvalues of the table
        </text>
      </svg>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Rows and columns are the patients in the order they arrived, the ten
        healthy first, and the dashed lines mark where they end. Indigo is a
        positive kernel value and amber a negative one. Eigenvalues drawn in
        amber are negative, which no kernel can produce.
      </p>

      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="break-words font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
