"use client";

// The five cell layouts, and what each answers on a picture small enough to
// count by hand.
//
// The top row draws the layouts themselves, added cells in blue and subtracted
// ones in red, with the sign total underneath so the two that do not cancel
// are visible as such. The lower panel puts one layout on one hand-drawn
// picture and shows the number that comes back. The API reads every value
// through the table of running totals; the browser only draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Arrangements, fetchArrangements } from "@/lib/concepts/haar-cascades";
import { PixelGrid, Stat } from "./HaarCascadeParts";

const PLUS = "#4f46e5";
const MINUS = "#e11d48";
const SHAPE = 26;

export function ArrangementGallery() {
  const [data, setData] = useState<Arrangements | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setData(await fetchArrangements());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!data) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const worked = data.worked[chosen];
  const cell = 34;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {data.arrangements.map((one) => (
          <div key={one.label}>
            <svg
              viewBox={`0 0 ${one.columns_of_cells * SHAPE} ${
                one.rows_of_cells * SHAPE
              }`}
              className="w-full max-w-[110px]"
              role="img"
            >
              {one.signs.map((row, rowIndex) =>
                row.map((sign, columnIndex) => (
                  <rect
                    key={`${rowIndex}-${columnIndex}`}
                    x={columnIndex * SHAPE}
                    y={rowIndex * SHAPE}
                    width={SHAPE}
                    height={SHAPE}
                    fill={sign > 0 ? PLUS : MINUS}
                    stroke="#ffffff"
                    strokeWidth={1}
                  />
                )),
              )}
            </svg>
            <p className="mt-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
              {one.label}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Reads {one.reads}.
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
              signs add to {one.sign_total}
              {one.balanced ? "" : ", so it does not cancel"}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {data.worked.map((one, position) => (
            <button
              key={one.label}
              type="button"
              onClick={() => setChosen(position)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                position === chosen
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {one.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-950">
            <PixelGrid
              rows={worked.picture.rows}
              cell={cell}
              outline
              className="max-w-[220px]"
            >
              {worked.cells.map((one) => (
                <rect
                  key={`${one.top}-${one.left}`}
                  x={one.left * cell}
                  y={one.top * cell}
                  width={one.width * cell}
                  height={one.height * cell}
                  fill={one.sign > 0 ? PLUS : MINUS}
                  fillOpacity={0.42}
                  stroke={one.sign > 0 ? PLUS : MINUS}
                  strokeWidth={2}
                />
              ))}
            </PixelGrid>
          </div>
          <div className="grid content-start gap-1.5">
            <Stat label="layout" value={worked.arrangement} />
            <Stat
              label="added cells minus subtracted ones"
              value={`${worked.value}`}
              tone={worked.value === 0 ? MINUS : PLUS}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            The same five layouts on a picture with no contrast in it at all,
            once dim and once bright.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                  <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                    Layout
                  </th>
                  <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                    On a dim flat picture
                  </th>
                  <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">
                    On a bright flat picture
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.level.map((one) => (
                  <tr
                    key={one.arrangement}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                  >
                    <td className="py-1.5 pr-4 text-slate-700 dark:text-slate-300">
                      {one.arrangement}
                    </td>
                    <td
                      className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200"
                      style={{ color: one.balanced ? undefined : MINUS }}
                    >
                      {one.on_dim}
                    </td>
                    <td
                      className="py-1.5 font-mono text-slate-800 dark:text-slate-200"
                      style={{ color: one.balanced ? undefined : MINUS }}
                    >
                      {one.on_bright}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
