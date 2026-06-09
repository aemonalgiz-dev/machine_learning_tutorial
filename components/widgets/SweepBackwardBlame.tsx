"use client";

// The backward pass through one sweep, worked and then checked.
//
// The top half sends a slope of one to every cell of the answer, which makes
// each kernel entry's slope a plain count of what it multiplied and each
// picture cell's blame a plain sum of the kernel entries that read it, so both
// can be checked against a hand count. Beside the kernel slopes sits the same
// nine worked independently by the API from the picture alone. The bottom half
// is the same backward pass on three fixtures, compared against a central
// difference of the loss over every kernel weight, every bias and every input
// value. The API runs both; the browser lays them out and shades the blame.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Backward, Grid, readBackward } from "@/lib/concepts/convolution";
import { formatValue, largestMagnitude } from "./convolutionFixtures";

export function SweepBackwardBlame() {
  const [read, setRead] = useState<Backward | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setRead(await readBackward());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const worked = read?.worked ?? null;

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-center gap-6">
        <Panel
          title="the picture"
          values={worked?.picture ?? null}
          cellClass="h-6 w-6"
          caption={worked ? `${worked.n_lit_cells} cells lit` : "…"}
        />
        <Panel
          title="what the layer says each weight wants"
          values={worked?.kernel_slopes ?? null}
          cellClass="h-8 w-10"
          caption="from the backward pass"
        />
        <Panel
          title="the same nine, counted from the picture"
          values={worked?.kernel_slopes_by_hand ?? null}
          cellClass="h-8 w-10"
          caption={
            worked
              ? worked.slopes_agree
                ? "identical, cell for cell"
                : "these two disagree"
              : "…"
          }
        />
        <Panel
          title="what each picture cell is blamed for"
          values={worked?.blame ?? null}
          cellClass="h-6 w-7"
          caption={
            worked
              ? `${worked.n_cells_receiving_nothing} of 64 receive nothing`
              : "…"
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Slope sent to every answer cell"
          value={worked ? formatValue(worked.arriving) : "…"}
        />
        <Stat
          label="Positions the bias was added at"
          value={worked ? String(worked.n_output_positions) : "…"}
        />
        <Stat
          label="What the bias wants"
          value={worked ? formatValue(worked.bias_slope) : "…"}
        />
        <Stat
          label="The nine weights added up"
          value={worked ? formatValue(worked.kernel_total) : "…"}
        />
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          Against a central difference of the loss
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="py-1 pr-3 font-medium">fixture</th>
                <th className="py-1 pr-3 font-medium">reads</th>
                <th className="py-1 pr-3 font-medium">slopes checked</th>
                <th className="py-1 pr-3 font-medium">worst, kernels</th>
                <th className="py-1 pr-3 font-medium">worst, biases</th>
                <th className="py-1 pr-3 font-medium">worst, inputs</th>
                <th className="py-1 font-medium">largest slope reported</th>
              </tr>
            </thead>
            <tbody className="font-mono text-slate-700 dark:text-slate-300">
              {(read?.checks ?? []).map((check) => (
                <tr
                  key={check.name}
                  className="border-t border-slate-200 dark:border-slate-800"
                >
                  <td className="py-1.5 pr-3 font-sans">{check.name}</td>
                  <td className="py-1.5 pr-3">({check.reads.join(", ")})</td>
                  <td className="py-1.5 pr-3">{check.n_checked}</td>
                  <td className="py-1.5 pr-3">
                    {check.largest_kernel_gap.toExponential(1)}
                  </td>
                  <td className="py-1.5 pr-3">
                    {check.largest_bias_gap.toExponential(1)}
                  </td>
                  <td className="py-1.5 pr-3">
                    {check.largest_input_gap.toExponential(1)}
                  </td>
                  <td className="py-1.5">
                    {check.largest_true_slope.toFixed(3)}
                  </td>
                </tr>
              ))}
              {!read && (
                <tr>
                  <td className="py-1.5">…</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          {read
            ? `Each parameter was moved ${read.step.toExponential(0)} either way and the loss remeasured. The worst disagreement anywhere is ${read.largest_gap_anywhere.toExponential(2)}.`
            : "…"}
        </p>
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Panel({
  title,
  values,
  cellClass,
  caption,
}: {
  title: string;
  values: Grid | null;
  cellClass: string;
  caption: string;
}) {
  const largest = values ? largestMagnitude(values) : 0;
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="max-w-[10rem] text-center text-xs font-medium text-slate-700 dark:text-slate-300">
        {title}
      </span>
      {values ? (
        <div
          className="grid gap-0.5"
          style={{
            gridTemplateColumns: `repeat(${values[0].length}, minmax(0, 1fr))`,
          }}
        >
          {values.map((row, rowIndex) =>
            row.map((value, columnIndex) => (
              <div
                key={`${rowIndex},${columnIndex}`}
                style={{
                  backgroundColor:
                    largest === 0 || value === 0
                      ? "transparent"
                      : value > 0
                        ? `rgba(79, 70, 229, ${(0.15 + 0.7 * (Math.abs(value) / largest)).toFixed(3)})`
                        : `rgba(245, 158, 11, ${(0.15 + 0.7 * (Math.abs(value) / largest)).toFixed(3)})`,
                }}
                className={
                  "flex items-center justify-center rounded-sm border border-slate-200 font-mono text-[10px] text-slate-800 dark:border-slate-800 dark:text-slate-100 " +
                  cellClass
                }
              >
                {value === 0 ? "·" : formatValue(value)}
              </div>
            )),
          )}
        </div>
      ) : (
        <div className="flex h-20 w-20 items-center justify-center text-slate-400">
          …
        </div>
      )}
      <span className="max-w-[10rem] text-center text-[11px] text-slate-500 dark:text-slate-400">
        {caption}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
