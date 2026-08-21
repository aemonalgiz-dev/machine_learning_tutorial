"use client";

// The arrangement a layer settles before any picture arrives.
//
// Move the picture's side and the filter count, and the API builds a layer for
// every combination of window, stride and padding and reads the answer's
// extents off the layer's own shape without sweeping anything. Two counts sit
// beside each row: how many window positions read the picture's corner cell and
// how many read its middle cell, which is the border argument for padding as a
// count rather than a claim, and how many cells no window position reaches at
// all. A row the library refuses carries its refusal instead of numbers. The
// browser sets the two sliders and lays the rows out.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Geometry, readGeometry } from "@/lib/concepts/convolution";

const MIN_SIDE = 4;
const MAX_SIDE = 32;
const MAX_FILTERS = 16;

const KERNEL_SIZES = [1, 3, 5, 7];
const STRIDES = [1, 2, 3];
const PADDINGS = [0, 1, 2];

export function SweepGeometryTable() {
  const [side, setSide] = useState(8);
  const [filters, setFilters] = useState(1);
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setGeometry(
          await readGeometry({
            side,
            n_filters: filters,
            kernel_sizes: KERNEL_SIZES,
            strides: STRIDES,
            paddings: PADDINGS,
          }),
        );
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [side, filters]);

  const rows = geometry?.rows ?? [];
  const keeping = rows.filter((row) => row.keeps_the_side).length;
  const refused = rows.filter((row) => row.refused).length;

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="grid grid-cols-1 gap-3 pb-3 sm:grid-cols-2">
        <Slider
          label="picture side"
          value={side}
          min={MIN_SIDE}
          max={MAX_SIDE}
          onChange={setSide}
        />
        <Slider
          label="filters"
          value={filters}
          min={1}
          max={MAX_FILTERS}
          onChange={setFilters}
        />
      </div>

      <div className="max-h-96 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950">
            <tr className="text-left text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-3 font-medium">window</th>
              <th className="py-1 pr-3 font-medium">stride</th>
              <th className="py-1 pr-3 font-medium">padding</th>
              <th className="py-1 pr-3 font-medium">answers</th>
              <th className="py-1 pr-3 font-medium">numbers out</th>
              <th className="py-1 pr-3 font-medium">parameters</th>
              <th className="py-1 pr-3 font-medium">corner read by</th>
              <th className="py-1 pr-3 font-medium">middle read by</th>
              <th className="py-1 font-medium">cells unread</th>
            </tr>
          </thead>
          <tbody className="font-mono text-slate-700 dark:text-slate-300">
            {rows.map((row) => (
              <tr
                key={`${row.kernel_size}-${row.stride}-${row.padding}`}
                className={
                  "border-t border-slate-200 dark:border-slate-800 " +
                  (row.keeps_the_side
                    ? "bg-indigo-50 dark:bg-indigo-950/40"
                    : "")
                }
              >
                <td className="py-1 pr-3">{row.kernel_size}</td>
                <td className="py-1 pr-3">{row.stride}</td>
                <td className="py-1 pr-3">{row.padding}</td>
                {row.refused ? (
                  <td
                    colSpan={6}
                    className="py-1 text-amber-700 dark:text-amber-400"
                  >
                    {row.detail}
                  </td>
                ) : (
                  <>
                    <td className="py-1 pr-3">({row.answers?.join(", ")})</td>
                    <td className="py-1 pr-3">{row.n_outputs}</td>
                    <td className="py-1 pr-3">{row.parameters}</td>
                    <td className="py-1 pr-3">{row.corner_windows}</td>
                    <td className="py-1 pr-3">{row.centre_windows}</td>
                    <td className="py-1">{row.unread_cells}</td>
                  </>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="py-1">…</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Settings tried" value={rows.length ? String(rows.length) : "…"} />
        <Stat
          label="Keeping the side"
          value={rows.length ? String(keeping) : "…"}
        />
        <Stat label="Refused" value={rows.length ? String(refused) : "…"} />
        <Stat
          label="Picture holds"
          value={geometry ? `${geometry.side * geometry.side} cells` : "…"}
        />
      </div>

      <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-500">
        Shaded rows are the ones whose answer is the same size as the picture.
        The parameter count does not move down the table, because it depends on
        the window and the filter count and on nothing about the picture.
      </p>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <span className="w-24">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="flex-1 accent-indigo-600"
      />
      <span className="w-6 text-right font-mono text-sm">{value}</span>
    </label>
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
