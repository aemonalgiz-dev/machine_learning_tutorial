"use client";

// The data table becoming the design matrix, one stage at a time.
//
// Stage one is the table a person would write down, five moments of the
// thrown ball with a column for t, a column for t² and the measured height.
// Stage two rearranges it into X, a column of ones on the left, the
// coefficient vector β beside it, and the prediction vector ŷ that their
// product gives. Stage three picks out one row and spells the dot product
// out, so the reader can watch 1 × α + t × β₁ + t² × β₂ come to the very
// number the ŷ column holds. The coefficients and every fitted value come
// from the API's degree-2 fit; the browser only rearranges the columns.

import { useEffect, useState } from "react";
import { ApiError, Point, PolynomialFit, fitPolynomial } from "@/lib/api";

const IDEAL_THROW: Point[] = [
  { x: 0, y: 0 },
  { x: 1, y: 15.1 },
  { x: 2, y: 20.4 },
  { x: 3, y: 15.9 },
  { x: 4, y: 1.6 },
];

type Stage = "table" | "matrix" | "row";

const STAGES: { key: Stage; label: string }[] = [
  { key: "table", label: "The table" },
  { key: "matrix", label: "As X, β and ŷ" },
  { key: "row", label: "One row at a time" },
];

const ONES = "text-slate-500 dark:text-slate-400";
const LINEAR = "text-indigo-600 dark:text-indigo-300";
const SQUARED = "text-amber-600 dark:text-amber-300";
const ANSWER = "text-emerald-700 dark:text-emerald-300";

function fixed(value: number, digits = 2): string {
  const text = value.toFixed(digits);
  return text === "-0.00" ? "0.00" : text;
}

export function DesignMatrixBuilder() {
  const [stage, setStage] = useState<Stage>("table");
  const [row, setRow] = useState(1);
  const [fit, setFit] = useState<PolynomialFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setFit(await fitPolynomial(IDEAL_THROW, 2));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const named = fit ? Object.fromEntries(fit.coefficients.map((each) => [each.name, each.value])) : null;
  const alpha = fit ? fit.intercept : null;
  const betaOne = named ? named["t"] : null;
  const betaTwo = named ? named["t^2"] : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {STAGES.map((each) => (
          <button
            key={each.key}
            onClick={() => setStage(each.key)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
              stage === each.key
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-200"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {each.label}
          </button>
        ))}
      </div>

      {stage === "table" && (
        <div className="overflow-x-auto rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
          <table className="mx-auto border-collapse font-mono text-sm">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-700">
                <th className="px-4 py-1.5 text-left font-sans font-semibold text-slate-600 dark:text-slate-400">observation</th>
                <th className={`px-4 py-1.5 font-semibold ${LINEAR}`}>t</th>
                <th className={`px-4 py-1.5 font-semibold ${SQUARED}`}>t²</th>
                <th className="px-4 py-1.5 font-semibold text-slate-700 dark:text-slate-200">height h</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-200">
              {IDEAL_THROW.map((point, index) => (
                <tr key={index} className="border-b border-slate-200 last:border-0 dark:border-slate-800">
                  <td className="px-4 py-1.5 text-left font-sans text-slate-500 dark:text-slate-400">{index + 1}</td>
                  <td className={`px-4 py-1.5 text-center ${LINEAR}`}>{point.x}</td>
                  <td className={`px-4 py-1.5 text-center ${SQUARED}`}>{point.x * point.x}</td>
                  <td className="px-4 py-1.5 text-center">{point.y}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
            The t² column was manufactured from the t column before any fitting began.
          </p>
        </div>
      )}

      {stage === "matrix" && (
        <div className="overflow-x-auto rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
          <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-sm">
            <Bracket label="X">
              {IDEAL_THROW.map((point, index) => (
                <div key={index} className="flex gap-4">
                  <span className={`w-6 text-right ${ONES}`}>1</span>
                  <span className={`w-6 text-right ${LINEAR}`}>{point.x}</span>
                  <span className={`w-6 text-right ${SQUARED}`}>{point.x * point.x}</span>
                </div>
              ))}
            </Bracket>
            <span className="text-slate-500">×</span>
            <Bracket label="β">
              <div className={`text-right ${ONES}`}>{alpha === null ? "…" : fixed(alpha)}</div>
              <div className={`text-right ${LINEAR}`}>{betaOne === null ? "…" : fixed(betaOne)}</div>
              <div className={`text-right ${SQUARED}`}>{betaTwo === null ? "…" : fixed(betaTwo)}</div>
            </Bracket>
            <span className="text-slate-500">=</span>
            <Bracket label="ŷ">
              {IDEAL_THROW.map((_, index) => (
                <div key={index} className={`text-right ${ANSWER}`}>
                  {fit ? fixed(fit.fitted[index]) : "…"}
                </div>
              ))}
            </Bracket>
          </div>
          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
            The column of ones is what carries the intercept. Multiplied by α, it adds
            the same α to every row.
          </p>
        </div>
      )}

      {stage === "row" && (
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
          <div className="flex flex-wrap items-center justify-center gap-2 pb-3 text-xs text-slate-600 dark:text-slate-300">
            row
            {IDEAL_THROW.map((_, index) => (
              <button
                key={index}
                onClick={() => setRow(index)}
                className={`h-7 w-7 rounded-full border text-xs font-medium transition ${
                  row === index
                    ? "border-indigo-500 bg-indigo-500 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="space-y-2 text-center font-mono text-sm text-slate-800 dark:text-slate-200">
            <p>
              (<span className={ONES}>1</span>, <span className={LINEAR}>{IDEAL_THROW[row].x}</span>,{" "}
              <span className={SQUARED}>{IDEAL_THROW[row].x * IDEAL_THROW[row].x}</span>) · (
              <span className={ONES}>{alpha === null ? "α" : fixed(alpha)}</span>,{" "}
              <span className={LINEAR}>{betaOne === null ? "β₁" : fixed(betaOne)}</span>,{" "}
              <span className={SQUARED}>{betaTwo === null ? "β₂" : fixed(betaTwo)}</span>)
            </p>
            <p>
              = <span className={ONES}>1 × {alpha === null ? "α" : fixed(alpha)}</span> +{" "}
              <span className={LINEAR}>
                {IDEAL_THROW[row].x} × {betaOne === null ? "β₁" : fixed(betaOne)}
              </span>{" "}
              +{" "}
              <span className={SQUARED}>
                {IDEAL_THROW[row].x * IDEAL_THROW[row].x} × {betaTwo === null ? "β₂" : fixed(betaTwo)}
              </span>
            </p>
            <p>
              = <span className={ONES}>{alpha === null ? "…" : fixed(alpha)}</span> +{" "}
              <span className={LINEAR}>{betaOne === null ? "…" : fixed(betaOne * IDEAL_THROW[row].x)}</span> +{" "}
              <span className={SQUARED}>
                {betaTwo === null ? "…" : fixed(betaTwo * IDEAL_THROW[row].x * IDEAL_THROW[row].x)}
              </span>
            </p>
            <p className={`text-base font-semibold ${ANSWER}`}>
              = {fit ? fixed(fit.fitted[row]) : "…"}
              <span className="ml-3 text-sm font-normal text-slate-500 dark:text-slate-400">
                measured {IDEAL_THROW[row].y}
              </span>
            </p>
          </div>
          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
            Row {row + 1} of X dotted with β is entry {row + 1} of ŷ. The matrix product does this
            for all five rows at once.
          </p>
        </div>
      )}

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Bracket({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <span className="mb-1 font-sans text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>
      <div className="flex flex-col gap-1 rounded-md border-y-2 border-slate-400 px-3 py-2 dark:border-slate-500">
        {children}
      </div>
    </div>
  );
}
