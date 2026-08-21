"use client";

// The one table a kernel model reads.
//
// For the three people the Gram matrix is laid out entry by entry, with the
// centred heights beside it, so a reader can multiply two of them and find
// the entry. For the fifteen throws it is drawn as a heat map, where the
// linear kernel's outer-product stripes, the polynomial kernel's brighter
// corners and the radial kernel's band along the diagonal are the whole
// difference between the fits. The eigenvalues underneath say how many
// directions the unpenalised system has no answer along. The API builds the
// matrix on the centred rows exactly as the fit does; the browser colours it.

import { useEffect, useState } from "react";
import { ApiError, GramMatrix, KernelChoice, fetchGram } from "@/lib/concepts/kernel-ridge";
import { ACTIVE_CLASS, BUTTON_CLASS, NOISY_THROW, THREE_PEOPLE } from "./kernelRidgeFixtures";

const CELL = 28;
const MAP_PAD = 30;

type Choice = "linear" | "polynomial" | "rbf";

const CHOICES: { name: Choice; label: string; kernel: KernelChoice }[] = [
  { name: "linear", label: "Linear", kernel: { name: "linear" } },
  { name: "polynomial", label: "Polynomial, degree 2", kernel: { name: "polynomial", degree: 2 } },
  { name: "rbf", label: "Radial basis, gamma 1", kernel: { name: "rbf", gamma: 1 } },
];

export function GramMatrixView({ dataset }: { dataset: "three" | "throw" }) {
  const [choice, setChoice] = useState<Choice>("linear");
  const [gram, setGram] = useState<GramMatrix | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const points = dataset === "three" ? THREE_PEOPLE : NOISY_THROW;

  useEffect(() => {
    (async () => {
      try {
        const kernel = CHOICES.find((each) => each.name === choice)!.kernel;
        setGram(await fetchGram(points, kernel));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [choice, points]);

  const format = (value: number) => (Math.abs(value) < 1e-9 ? "0" : Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(3));

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {CHOICES.map((each) => (
          <button key={each.name} onClick={() => setChoice(each.name)} className={each.name === choice ? ACTIVE_CLASS : BUTTON_CLASS}>
            {each.label}
          </button>
        ))}
      </div>

      {!gram && <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>}

      {gram && dataset === "three" && (
        <div className="overflow-x-auto">
          <table className="border-collapse font-mono text-sm">
            <thead>
              <tr>
                <th className="py-1 pr-4 text-left font-medium text-slate-500 dark:text-slate-400">centred height</th>
                {gram.centred_x.map((value, index) => (
                  <th key={index} className="px-3 py-1 text-right font-medium text-slate-500 dark:text-slate-400">{format(value)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gram.matrix.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-slate-100 dark:border-slate-800/60">
                  <td className="py-1 pr-4 text-slate-500 dark:text-slate-400">{format(gram.centred_x[rowIndex])}</td>
                  {row.map((value, columnIndex) => (
                    <td key={columnIndex} className="px-3 py-1 text-right text-slate-800 dark:text-slate-200">{format(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {gram && dataset === "throw" && <HeatMap gram={gram} points={points.map((point) => point.x)} />}

      {gram && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="smallest eigenvalue" value={gram.eigenvalues[0].toExponential(2)} />
          <Stat label="largest eigenvalue" value={gram.eigenvalues[gram.eigenvalues.length - 1].toFixed(3)} />
          <Stat label="eigenvalues at zero" value={`${gram.zero_eigenvalues} of ${gram.eigenvalues.length}`} />
          <Stat label="symmetric" value={gram.symmetric ? "yes" : "no"} />
        </div>
      )}
      {message && gram && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>}
    </div>
  );
}

function HeatMap({ gram, points }: { gram: GramMatrix; points: number[] }) {
  const size = gram.matrix.length;
  const width = MAP_PAD + size * CELL + 8;
  const height = MAP_PAD + size * CELL + 8;
  const largest = Math.max(...gram.matrix.flat().map((value) => Math.abs(value))) || 1;
  const colour = (value: number) => {
    const share = Math.min(1, Math.abs(value) / largest);
    return value >= 0 ? `rgba(99, 102, 241, ${0.08 + 0.92 * share})` : `rgba(244, 63, 94, ${0.08 + 0.92 * share})`;
  };
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md select-none rounded-lg bg-slate-50 dark:bg-slate-950">
      {gram.matrix.map((row, rowIndex) =>
        row.map((value, columnIndex) => (
          <rect key={`${rowIndex}-${columnIndex}`} x={MAP_PAD + columnIndex * CELL} y={MAP_PAD + rowIndex * CELL} width={CELL - 1} height={CELL - 1} fill={colour(value)}>
            <title>{`rows at ${points[rowIndex]} s and ${points[columnIndex]} s, ${value.toFixed(3)}`}</title>
          </rect>
        )),
      )}
      {points.map((value, index) => (
        <text key={`c${index}`} x={MAP_PAD + index * CELL + CELL / 2} y={MAP_PAD - 8} textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-slate-400">{value.toFixed(1)}</text>
      ))}
      {points.map((value, index) => (
        <text key={`r${index}`} x={MAP_PAD - 4} y={MAP_PAD + index * CELL + CELL / 2 + 3} textAnchor="end" className="fill-slate-500 text-[8px] dark:fill-slate-400">{value.toFixed(1)}</text>
      ))}
    </svg>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
