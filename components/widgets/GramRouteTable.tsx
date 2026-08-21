"use client";

// PCA by two routes on one cloud, laid out so the agreement can be read.
//
// The covariance route builds a two-by-two scatter matrix from the centred
// people and takes its eigenvalues; the Gram route builds an n-by-n table of
// every pair's dot product and takes that table's eigenvalues instead. The
// panels switch on what a section needs: the two Gram tables, the
// eigenvalues by both routes side by side, the one eigenvalue read at its two
// scales with the coefficient that results, and every person's coordinates
// by both routes. Both fits are the library's, through the API, and the
// browser only arranges the numbers into tables.

import { useEffect, useState } from "react";
import { ApiError, GramRoute } from "@/lib/concepts/kernel-pca";
import { gramRouteFor } from "./kernelPcaFixtures";

export type GramPanel = "matrices" | "eigenvalues" | "scales" | "coordinates";

function tidy(value: number, digits: number): string {
  const rounded = Number(value.toFixed(digits));
  return (Object.is(rounded, -0) ? 0 : rounded).toFixed(digits);
}

export function GramRouteTable({ cloud = "four", panels = ["eigenvalues"] }: { cloud?: "four" | "arc"; panels?: GramPanel[] }) {
  const [route, setRoute] = useState<GramRoute | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const has = (panel: GramPanel) => panels.includes(panel);

  useEffect(() => {
    (async () => {
      try {
        setRoute(await gramRouteFor(cloud));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [cloud]);

  if (!route) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const people = route.n_rows;
  const label = (index: number) => `person ${index + 1}`;

  return (
    <div className="space-y-4">
      {has("matrices") && people <= 6 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Matrix title="Every pair's dot product, as measured" values={route.uncentred_gram} digits={0} />
          <Matrix title="The same table, centred" values={route.centred_gram} digits={0} />
        </div>
      )}
      {has("matrices") && people > 6 && (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The tables are {people} by {people} here, too many cells to read, so only their summaries are shown.
        </p>
      )}

      {has("eigenvalues") && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-1 pr-4 font-normal">route</th>
                <th className="py-1 pr-4 font-normal">matrix</th>
                <th className="py-1 font-normal">eigenvalues, largest first</th>
              </tr>
            </thead>
            <tbody className="font-mono text-slate-900 dark:text-slate-100">
              <tr className="border-b border-slate-100 dark:border-slate-800/60">
                <td className="py-1 pr-4 font-sans text-slate-700 dark:text-slate-300">covariance</td>
                <td className="py-1 pr-4">2 by 2 scatter</td>
                <td className="py-1">{route.scatter_eigenvalues.map((value) => tidy(value, 2)).join("   ")}</td>
              </tr>
              <tr>
                <td className="py-1 pr-4 font-sans text-slate-700 dark:text-slate-300">Gram</td>
                <td className="py-1 pr-4">{people} by {people} centred</td>
                <td className="py-1">{route.gram_eigenvalues.slice(0, Math.min(people, 6)).map((value) => tidy(value, 2)).join("   ")}{people > 6 ? "   …" : ""}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="scatter matrix" value={`[${tidy(route.scatter_matrix[0][0], 1)}, ${tidy(route.scatter_matrix[0][1], 1)}; ${tidy(route.scatter_matrix[1][0], 1)}, ${tidy(route.scatter_matrix[1][1], 1)}]`} />
            <Stat label="shares, both routes" value={`${tidy(route.components[0].share, 3)}, ${tidy(route.components[1].share, 3)}`} />
            <Stat label="largest gap between the routes' coordinates" value={route.largest_coordinate_gap.toExponential(1)} />
            <Stat label="Gram eigenvalues past the second, at most" value={people > 2 ? Math.max(...route.gram_eigenvalues.slice(2)).toExponential(1) : "none"} />
          </div>
        </div>
      )}

      {has("scales") && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-1 pr-3 font-normal">direction</th>
                <th className="py-1 pr-3 text-right font-normal">raw eigenvalue</th>
                <th className="py-1 pr-3 text-right font-normal">over n &minus; 1 = {route.divisor}</th>
                <th className="py-1 pr-3 text-right font-normal">square root of raw</th>
                <th className="py-1 pr-3 text-right font-normal">person 1&rsquo;s coefficient</th>
                <th className="py-1 text-right font-normal">coefficients&rsquo; squared length</th>
              </tr>
            </thead>
            <tbody className="font-mono text-slate-900 dark:text-slate-100">
              {route.components.map((component, index) => (
                <tr key={component.name} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                  <td className="py-1 pr-3 font-sans text-slate-700 dark:text-slate-300">{index === 0 ? "first" : "second"}</td>
                  <td className="py-1 pr-3 text-right">{tidy(component.raw_eigenvalue, 2)}</td>
                  <td className="py-1 pr-3 text-right">{tidy(component.variance, 2)}</td>
                  <td className="py-1 pr-3 text-right">{tidy(Math.sqrt(component.raw_eigenvalue), 3)}</td>
                  <td className="py-1 pr-3 text-right">{tidy(component.row_coefficients[0], 4)}</td>
                  <td className="py-1 text-right">{route.coefficient_squared_lengths[index].toExponential(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            The variance column is what ordinary PCA reports for the same people, {route.ordinary_variances.map((value) => tidy(value, 2)).join(" and ")}. The last column is one over the raw eigenvalue, because the unit eigenvector was divided by its square root.
          </p>
        </div>
      )}

      {has("coordinates") && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-1 pr-4 font-normal">person</th>
                <th className="py-1 pr-4 text-right font-normal">first, Gram route</th>
                <th className="py-1 pr-4 text-right font-normal">first, covariance route</th>
                <th className="py-1 pr-4 text-right font-normal">second, Gram route</th>
                <th className="py-1 text-right font-normal">second, covariance route</th>
              </tr>
            </thead>
            <tbody className="font-mono text-slate-900 dark:text-slate-100">
              {route.coordinates.slice(0, 6).map((entry, index) => (
                <tr key={index} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                  <td className="py-1 pr-4 font-sans text-slate-700 dark:text-slate-300">{label(index)}</td>
                  <td className="py-1 pr-4 text-right">{tidy(entry.first, 3)}</td>
                  <td className="py-1 pr-4 text-right">{tidy(route.ordinary_coordinates[index].first, 3)}</td>
                  <td className="py-1 pr-4 text-right">{tidy(entry.second, 3)}</td>
                  <td className="py-1 text-right">{tidy(route.ordinary_coordinates[index].second, 3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {people > 6 ? `The first six of ${people} people. ` : ""}A column negated between the routes is the solver&rsquo;s sign, and the largest gap once signs are dropped is {route.largest_coordinate_gap.toExponential(1)}.
          </p>
        </div>
      )}
    </div>
  );
}

function Matrix({ title, values, digits }: { title: string; values: number[][]; digits: number }) {
  return (
    <div>
      <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">{title}</p>
      <div className="overflow-x-auto rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
        <table className="font-mono text-sm text-slate-900 dark:text-slate-100">
          <tbody>
            {values.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((value, columnIndex) => (
                  <td key={columnIndex} className="px-2 py-0.5 text-right">
                    {tidy(value, digits)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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
