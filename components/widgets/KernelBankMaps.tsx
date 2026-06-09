"use client";

// One layer holding several kernels, and the map each of them answers with.
//
// Tick the kernels the bank is to hold and choose a picture, and the layer is
// built with that many filters and swept once. Every filter reads the same
// picture and answers with a map of its own, so the layer's answer is a stack
// of maps rather than one, which is the arrangement printed underneath. Each
// map carries a marker at the position where that filter answered most
// strongly. The API builds the layer, sweeps it and reads its shape; the
// browser draws the maps and shades them.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Grid, KernelBank, sweepBank } from "@/lib/concepts/convolution";
import {
  KERNEL_PRESETS,
  PICTURE_PRESETS,
  answerShade,
  formatValue,
  largestMagnitude,
  sameGrid,
} from "./convolutionFixtures";

const SMALL_BUTTON_CLASS =
  "rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const SMALL_ACTIVE_BUTTON_CLASS =
  "rounded border border-indigo-600 bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white transition dark:border-indigo-500 dark:bg-indigo-500";

const OPENING_BANK = ["Vertical edge", "Horizontal edge", "Blur"];

export function KernelBankMaps() {
  const [chosen, setChosen] = useState<string[]>(OPENING_BANK);
  const [pictureName, setPictureName] = useState(PICTURE_PRESETS[0].name);
  const [bank, setBank] = useState<KernelBank | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const picture =
    PICTURE_PRESETS.find((preset) => preset.name === pictureName) ??
    PICTURE_PRESETS[0];
  const held = KERNEL_PRESETS.filter((preset) => chosen.includes(preset.name));

  useEffect(() => {
    const cells =
      PICTURE_PRESETS.find((preset) => preset.name === pictureName)?.cells ??
      PICTURE_PRESETS[0].cells;
    const kernels = KERNEL_PRESETS.filter((preset) =>
      chosen.includes(preset.name),
    ).map((preset) => preset.weights);
    const timer = setTimeout(async () => {
      if (kernels.length === 0) {
        setBank(null);
        return;
      }
      try {
        setBank(await sweepBank(cells, kernels, { stride: 1, padding: 0 }));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [chosen, pictureName]);

  const toggle = (name: string) =>
    setChosen((current) =>
      current.includes(name)
        ? current.filter((one) => one !== name)
        : [...current, name],
    );

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <span className="flex flex-wrap items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
          the bank holds
          {KERNEL_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => toggle(preset.name)}
              className={
                chosen.includes(preset.name)
                  ? SMALL_ACTIVE_BUTTON_CLASS
                  : SMALL_BUTTON_CLASS
              }
            >
              {preset.name}
            </button>
          ))}
        </span>
        <span className="flex flex-wrap items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
          picture
          {PICTURE_PRESETS.filter((preset) => preset.name !== "Clear").map(
            (preset) => (
              <button
                key={preset.name}
                onClick={() => setPictureName(preset.name)}
                className={
                  sameGrid(preset.cells, picture.cells)
                    ? SMALL_ACTIVE_BUTTON_CLASS
                    : SMALL_BUTTON_CLASS
                }
              >
                {preset.name}
              </button>
            ),
          )}
        </span>
      </div>

      <div className="flex flex-wrap items-start justify-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            what every filter reads
          </span>
          <div className="grid grid-cols-8 gap-0.5">
            {picture.cells.map((row, rowIndex) =>
              row.map((value, columnIndex) => (
                <div
                  key={`${rowIndex},${columnIndex}`}
                  className={
                    "h-5 w-5 rounded-sm " +
                    (value > 0
                      ? "bg-indigo-600"
                      : "bg-slate-200 dark:bg-slate-700")
                  }
                />
              )),
            )}
          </div>
        </div>

        {held.map((preset, position) => (
          <FilterPanel
            key={preset.name}
            name={preset.name}
            weights={preset.weights}
            values={bank?.maps[position]?.output ?? null}
            strongest={
              bank?.maps[position]
                ? {
                    row: bank.maps[position].strongest_row,
                    column: bank.maps[position].strongest_column,
                    value: bank.maps[position].largest,
                  }
                : null
            }
          />
        ))}
      </div>

      {held.length === 0 && (
        <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
          A layer needs at least one filter. Tick one above.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Reads"
          value={bank ? `(${bank.reads.join(", ")})` : "…"}
        />
        <Stat
          label="Answers"
          value={bank ? `(${bank.answers.join(", ")})` : "…"}
        />
        <Stat
          label="Kernel bank"
          value={bank ? `(${bank.kernel_shape.join(", ")})` : "…"}
        />
        <Stat
          label="Parameters"
          value={bank ? String(bank.parameters.convolution) : "…"}
        />
      </div>

      <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-500">
        {bank
          ? `${bank.n_filters} filters read one channel and answer with ${bank.n_filters} maps of ${bank.answers[1]} by ${bank.answers[2]}, which is ${bank.parameters.n_outputs} numbers from ${bank.parameters.convolution} parameters.`
          : "…"}
      </p>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function FilterPanel({
  name,
  weights,
  values,
  strongest,
}: {
  name: string;
  weights: Grid;
  values: Grid | null;
  strongest: { row: number; column: number; value: number } | null;
}) {
  const largest = values ? largestMagnitude(values) : 0;
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
        {name}
      </span>
      <div className="grid grid-cols-3 gap-0.5">
        {weights.map((row, rowIndex) =>
          row.map((value, columnIndex) => (
            <div
              key={`${rowIndex},${columnIndex}`}
              className="flex h-5 w-7 items-center justify-center rounded-sm bg-white font-mono text-[9px] text-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {formatValue(value)}
            </div>
          )),
        )}
      </div>
      {values ? (
        <div
          className="grid gap-0.5"
          style={{
            gridTemplateColumns: `repeat(${values[0].length}, minmax(0, 1fr))`,
          }}
        >
          {values.map((row, rowIndex) =>
            row.map((value, columnIndex) => {
              const marked =
                strongest !== null &&
                strongest.row === rowIndex &&
                strongest.column === columnIndex;
              return (
                <div
                  key={`${rowIndex},${columnIndex}`}
                  style={{ backgroundColor: answerShade(value, largest) }}
                  className={
                    "flex h-6 w-7 items-center justify-center rounded-sm border font-mono text-[9px] text-slate-800 dark:text-slate-100 " +
                    (marked
                      ? "border-amber-500 ring-2 ring-amber-500"
                      : "border-slate-200 dark:border-slate-800")
                  }
                >
                  {formatValue(value)}
                </div>
              );
            }),
          )}
        </div>
      ) : (
        <div className="flex h-24 w-28 items-center justify-center text-slate-400">
          …
        </div>
      )}
      <span className="text-[11px] text-slate-500 dark:text-slate-400">
        {strongest
          ? `strongest at row ${strongest.row}, column ${strongest.column}`
          : "…"}
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
