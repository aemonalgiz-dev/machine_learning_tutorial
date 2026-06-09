"use client";

// Every column an expansion builds from two measurements, named and computed.
//
// Four people, two measurements each, and the table underneath is exactly what
// the fit is handed: one row per column, its name, the powers it multiplies
// together, and the four numbers in it. Turn the degree up and the rows
// multiply; turn the products off and the mixed rows disappear while the pure
// powers stay. The API builds the columns and the browser lays them out.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Expansion, expandColumns } from "@/lib/concepts/polynomial-features";
import { FOUR_CORNERS, formatMagnitude } from "./polynomialFeaturesFixtures";

export function TermAssembler() {
  const [degree, setDegree] = useState(2);
  const [products, setProducts] = useState(true);
  const [answer, setAnswer] = useState<Expansion | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const built = await expandColumns(
          [
            { name: "height", values: FOUR_CORNERS.heights },
            { name: "girth", values: FOUR_CORNERS.girths },
          ],
          degree,
          products,
        );
        if (!cancelled) {
          setAnswer(built);
          setMessage(null);
        }
      } catch (error) {
        if (cancelled) return;
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [degree, products]);

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-4 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          Degree
          <input
            type="range"
            min={1}
            max={4}
            step={1}
            value={degree}
            onChange={(event) => setDegree(Number(event.target.value))}
            className="w-28 accent-indigo-600"
          />
          <span className="w-4 font-mono text-sm">{degree}</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={products}
            onChange={(event) => setProducts(event.target.checked)}
            className="accent-indigo-600"
          />
          build the products
        </label>
        <span className="ml-auto font-mono text-sm text-slate-900 dark:text-slate-100">
          {answer ? `${answer.n_terms} columns` : "…"}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                column
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                built from
              </th>
              {["150, 66", "150, 96", "180, 66", "180, 96"].map((person) => (
                <th
                  key={person}
                  className="py-2 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400"
                >
                  {person}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {answer?.terms.map((term) => (
              <tr
                key={term.name}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1.5 pr-4 font-mono text-slate-900 dark:text-slate-100">
                  {term.name}
                </td>
                <td className="py-1.5 pr-4 text-slate-600 dark:text-slate-400">
                  {term.exponents
                    .map((factor) =>
                      factor.exponent === 1
                        ? factor.feature
                        : `${factor.feature} to the ${factor.exponent}`,
                    )
                    .join(" times ")}
                </td>
                {term.values.map((value, position) => (
                  <td
                    key={`${term.name}-${position}`}
                    className="py-1.5 pr-4 text-right font-mono text-slate-800 dark:text-slate-200"
                  >
                    {formatMagnitude(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        The four columns of numbers are four people, written as their height and
        their girth. Every entry is a product of those two numbers and nothing
        else, so each one can be checked with a pencil.
      </p>

      {message && (
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>
      )}
    </div>
  );
}
