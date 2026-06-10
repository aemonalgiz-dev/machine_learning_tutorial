"use client";

// Every window and stride over one picture, with nothing pooled at all.
//
// The API builds a layer for each combination and reads the arrangement off it,
// so the table below is settled before a picture exists. Choose a row and the
// grid beside it shades the cells some window position reaches and leaves the
// rest plain, which is what a stride that does not divide the side leaves
// behind. Every extent, every count and every unvisited position is the
// library's; the browser lays out the table and shades the grid.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Arrangement, ArrangementRow, readArrangement } from "@/lib/concepts/pooling";

const SIDES = [4, 5, 6, 7, 8];
const WINDOWS = [1, 2, 3, 4];
const STRIDES = [1, 2, 3, 4];

export function PoolingArrangement() {
  const [side, setSide] = useState(8);
  const [chosen, setChosen] = useState("2/2");
  const [arrangement, setArrangement] = useState<Arrangement | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setArrangement(
          await readArrangement({
            channels: 1,
            height: side,
            width: side,
            windows: WINDOWS,
            strides: STRIDES,
          }),
        );
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [side]);

  const rows = arrangement?.rows ?? [];
  const selected =
    rows.find((row) => `${row.window}/${row.stride}` === chosen) ?? rows[0] ?? null;

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <label className="flex items-center gap-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        Picture side
        <select
          value={side}
          onChange={(event) => setSide(Number(event.target.value))}
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          {SIDES.map((choice) => (
            <option key={choice} value={choice}>
              {choice} by {choice}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          one channel, so the picture holds {side * side} numbers
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="py-1 pr-3 font-medium">Window</th>
                <th className="py-1 pr-3 font-medium">Stride</th>
                <th className="py-1 pr-3 font-medium">Answers</th>
                <th className="py-1 pr-3 font-medium">Numbers</th>
                <th className="py-1 font-medium">Unreached</th>
              </tr>
            </thead>
            <tbody className="font-mono text-slate-700 dark:text-slate-300">
              {rows.length === 0 && (
                <tr>
                  <td className="py-1">…</td>
                </tr>
              )}
              {rows.map((row) => {
                const key = `${row.window}/${row.stride}`;
                return (
                  <tr
                    key={key}
                    onClick={() => setChosen(key)}
                    className={
                      "cursor-pointer " +
                      (key === chosen
                        ? "bg-indigo-100 dark:bg-indigo-950"
                        : "hover:bg-slate-100 dark:hover:bg-slate-900")
                    }
                  >
                    <td className="py-0.5 pr-3">{row.window}</td>
                    <td className="py-0.5 pr-3">
                      {row.stride}
                      {row.overlaps && !row.refused ? " ↔" : ""}
                    </td>
                    <td className="py-0.5 pr-3">
                      {row.refused
                        ? "refused"
                        : `${row.answers?.[1]} × ${row.answers?.[2]}`}
                    </td>
                    <td className="py-0.5 pr-3">
                      {row.refused ? "" : row.n_outputs}
                    </td>
                    <td className="py-0.5">
                      {row.refused ? "" : row.n_unvisited_cells}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center gap-2">
          <CoverageGrid side={side} row={selected} />
          <span className="max-w-[16rem] text-center text-xs text-slate-500 dark:text-slate-400">
            {selected && !selected.refused
              ? `Window ${selected.window} at a stride of ${selected.stride}. ` +
                (selected.n_unvisited_cells === 0
                  ? "Every cell belongs to at least one window."
                  : `${selected.n_unvisited_cells} of ${side * side} cells belong to no window.`)
              : (selected?.detail ?? "…")}
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Reads"
          value={selected?.reads ? selected.reads.join(" × ") : "…"}
        />
        <Stat
          label="Answers"
          value={selected?.answers ? selected.answers.join(" × ") : "…"}
        />
        <Stat
          label="Numbers carried forward"
          value={
            selected && selected.n_outputs !== null && selected.n_inputs !== null
              ? `${selected.n_outputs} of ${selected.n_inputs}`
              : "…"
          }
        />
        <Stat
          label="Both kinds agree"
          value={selected ? (selected.kinds_agree ? "yes" : "no") : "…"}
        />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

// The picture with the rows and columns no window reaches left plain. Both are
// the API's lists, so the shading is the sweep the layer will actually make.
function CoverageGrid({
  side,
  row,
}: {
  side: number;
  row: ArrangementRow | null;
}) {
  const unreachedRows = new Set(row?.unvisited_rows ?? []);
  const unreachedColumns = new Set(row?.unvisited_columns ?? []);
  return (
    <div
      className="grid gap-0.5"
      style={{ gridTemplateColumns: `repeat(${side}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: side * side }, (_, index) => {
        const gridRow = Math.floor(index / side);
        const gridColumn = index % side;
        const reached =
          row !== null &&
          !row.refused &&
          !unreachedRows.has(gridRow) &&
          !unreachedColumns.has(gridColumn);
        return (
          <div
            key={index}
            className={
              "h-5 w-5 rounded-sm " +
              (reached
                ? "bg-indigo-500/70"
                : "bg-slate-200 dark:bg-slate-800")
            }
          />
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="break-all font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
