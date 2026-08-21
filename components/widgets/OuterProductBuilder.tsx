"use client";

// The weight matrix assembled from what each stored pattern contributes.
//
// For every pair of cells a pattern adds +1 if the two agree in it and -1 if
// they disagree, which is the outer product of the pattern with itself. The
// contributions add, the sum is divided by the cell count, and the diagonal
// is cleared. On the four-cell pair the widget sets the whole thing out as
// tables, one per pattern, then the sum, then the matrix with the diagonal
// cleared, so the reader can check the row the page works by hand. On the
// three shapes it draws the same four matrices as twenty-five by twenty-five
// heat maps, since a table of 625 entries teaches nothing, and the reader
// can click a heat-map cell to read the weight for that pair. The API stores
// the patterns and reports the contributions and the matrix; the browser
// draws.

import { useEffect, useState } from "react";
import { ApiError, Storage, storePatterns } from "@/lib/concepts/hopfield-network";
import { Caption, Failure, Stat, plain } from "./HopfieldGrid";
import { FOUR_CELL_PATTERNS, SIDE, THREE_SHAPES, cellsOf } from "./hopfieldFixtures";

const HEAT = { size: 150, pad: 2 };

export function OuterProductBuilder({ example }: { example: "fourCells" | "threeShapes" }) {
  const [storage, setStorage] = useState<Storage | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pair, setPair] = useState<{ row: number; column: number }>({ row: 0, column: 1 });

  useEffect(() => {
    (async () => {
      try {
        setStorage(await storePatterns(example === "fourCells" ? FOUR_CELL_PATTERNS : cellsOf(THREE_SHAPES)));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [example]);

  if (!storage) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const names = example === "fourCells" ? ["A", "B"] : THREE_SHAPES.map((entry) => entry.name);

  return (
    <div className="my-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      {example === "fourCells" ? (
        <div className="flex flex-wrap items-start justify-center gap-6">
          {storage.contributions.map((contribution, index) => (
            <SmallMatrix
              key={index}
              title={`${names[index]}, cell by cell`}
              values={contribution.products}
              digits={0}
            />
          ))}
          <SmallMatrix title="sum, divided by 4" values={storage.summed} digits={1} shadeDiagonal />
          <SmallMatrix title="diagonal cleared" values={storage.weights} digits={1} />
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap items-start justify-center gap-5">
            {storage.contributions.map((contribution, index) => (
              <HeatMap key={index} title={names[index]} values={contribution.products} scale={1} onPick={setPair} pair={pair} />
            ))}
            <HeatMap title="the weights" values={storage.weights} scale={storage.load} onPick={setPair} pair={pair} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label={`weight, cells ${pair.row + 1} and ${pair.column + 1}`} value={plain(storage.weights[pair.row][pair.column], 2)} />
            <Stat label="agreements minus disagreements" value={String(Math.round(storage.weights[pair.row][pair.column] * storage.n_units))} />
            <Stat label="load, patterns per cell" value={storage.load.toFixed(2)} />
            <Stat label="any cell wired to itself" value={storage.has_self_connections ? "yes" : "no"} />
          </div>
          <Caption>
            Indigo is a positive product or weight and rose a negative one, darker for larger. Click any cell of a map to read
            the weight for that pair of cells; the diagonal of the last map is cleared, which the sum of the first three
            would not be.
          </Caption>
        </div>
      )}
      <Failure message={message} />
    </div>
  );
}

function SmallMatrix({
  title,
  values,
  digits,
  shadeDiagonal = false,
}: {
  title: string;
  values: number[][];
  digits: number;
  shadeDiagonal?: boolean;
}) {
  const headerClass = "px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400";
  const cellClass = "px-2 py-1 text-center font-mono text-sm text-slate-800 dark:text-slate-200";
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-slate-500 dark:text-slate-400">{title}</span>
      <table className="border-collapse">
        <thead>
          <tr>
            <th className={headerClass} />
            {values.map((_, column) => (
              <th key={column} className={headerClass}>
                {column + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {values.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-slate-200 dark:border-slate-800">
              <th className={headerClass + " text-left"}>{rowIndex + 1}</th>
              {row.map((value, column) => (
                <td
                  key={column}
                  className={cellClass + (shadeDiagonal && rowIndex === column ? " bg-amber-100 dark:bg-amber-900/40" : "")}
                >
                  {digits === 0 ? (value > 0 ? "+1" : "−1") : plain(value, digits)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HeatMap({
  title,
  values,
  scale,
  pair,
  onPick,
}: {
  title: string;
  values: number[][];
  scale: number;
  pair: { row: number; column: number };
  onPick: (pair: { row: number; column: number }) => void;
}) {
  const count = values.length;
  const cell = (HEAT.size - 2 * HEAT.pad) / count;
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-slate-500 dark:text-slate-400">{title}</span>
      <svg viewBox={`0 0 ${HEAT.size} ${HEAT.size}`} className="w-36 select-none rounded bg-white dark:bg-slate-900">
        {values.map((row, rowIndex) =>
          row.map((value, column) => {
            const strength = Math.min(1, Math.abs(value) / scale);
            const picked = rowIndex === pair.row && column === pair.column;
            return (
              <rect
                key={`${rowIndex}-${column}`}
                x={HEAT.pad + column * cell}
                y={HEAT.pad + rowIndex * cell}
                width={cell}
                height={cell}
                fill={value > 0 ? "#4f46e5" : value < 0 ? "#e11d48" : "#94a3b8"}
                opacity={value === 0 ? 0.25 : 0.2 + 0.8 * strength}
                stroke={picked ? "#f59e0b" : "none"}
                strokeWidth={picked ? 1.5 : 0}
                className="cursor-pointer"
                onClick={() => onPick({ row: rowIndex, column })}
              />
            );
          }),
        )}
      </svg>
      <span className="text-[10px] text-slate-400 dark:text-slate-500">
        rows and columns are cells 1 to {count}, {SIDE} per grid row
      </span>
    </div>
  );
}
