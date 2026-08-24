"use client";

// The table of who appeared near whom, built once, at whichever reach and
// distance rule the reader picks.
//
// The five-word sentence is small enough that every cell can be checked with a
// pencil, and the whole corpus shows what the same rule produces at
// thirty-seven words: two shaded blocks with nothing between them. The readouts
// underneath say how much of the table is blank and how many counts came out
// below one, which is the number the reach quietly decides. The API counts; the
// browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  CountTable,
  TextChoice,
  WeightingName,
  fetchCountTable,
} from "@/lib/concepts/glove";
import { Choice, Legend, Stat, Waiting, colourFor } from "./gloveShared";

const GRID = 340;

const TEXTS: { label: string; value: TextChoice }[] = [
  { label: "one sentence", value: "one-sentence" },
  { label: "two sentences", value: "two-sentences" },
  { label: "the whole corpus", value: "corpus" },
];

export function GloveCooccurrenceTable() {
  const [text, setText] = useState<TextChoice>("one-sentence");
  const [window, setWindow] = useState(2);
  const [weighting, setWeighting] = useState<WeightingName>("harmonic");
  const [table, setTable] = useState<CountTable | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [hover, setHover] = useState<{ row: number; column: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchCountTable(text, window, weighting);
        if (!cancelled) {
          setTable(next);
          setMessage(null);
          setHover(null);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [text, window, weighting]);

  if (!table) return <Waiting message={message} />;

  const size = table.words.length;
  const small = size <= 8;
  const cell = GRID / size;
  const largest = table.largest;
  const shown = hover
    ? {
        row: table.words[hover.row],
        column: table.words[hover.column],
        value: table.table[hover.row][hover.column],
      }
    : null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <Choice options={TEXTS} value={text} onChange={setText} />
        <Choice
          options={[
            { label: "one over the distance", value: "harmonic" as WeightingName },
            { label: "one full count", value: "uniform" as WeightingName },
          ]}
          value={weighting}
          onChange={setWeighting}
          accent="#f59e0b"
        />
        <label className="flex items-center gap-2">
          reach
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={window}
            onChange={(event) => setWindow(Number(event.target.value))}
            className="w-20 accent-indigo-600"
          />
          <span className="w-4 text-right font-mono">{window}</span>
        </label>
      </div>

      <div className="flex flex-wrap gap-6">
        {small ? (
          <div className="overflow-x-auto">
            <table className="border-collapse text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-1" />
                  {table.words.map((word, index) => (
                    <th
                      key={word}
                      className="px-2 py-1 font-mono font-semibold"
                      style={{ color: colourFor(table.topics[index]) }}
                    >
                      {word}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.table.map((row, rowIndex) => (
                  <tr key={table.words[rowIndex]}>
                    <th
                      className="px-2 py-1 text-right font-mono font-semibold"
                      style={{ color: colourFor(table.topics[rowIndex]) }}
                    >
                      {table.words[rowIndex]}
                    </th>
                    {row.map((value, columnIndex) => (
                      <td
                        key={`${rowIndex}-${columnIndex}`}
                        className="px-2 py-1 text-center font-mono"
                        style={{
                          backgroundColor:
                            value === 0
                              ? "transparent"
                              : `${colourFor(table.topics[rowIndex])}${Math.round(
                                  30 + 170 * (value / largest),
                                )
                                  .toString(16)
                                  .padStart(2, "0")}`,
                          color: value === 0 ? "#94a3b8" : undefined,
                        }}
                      >
                        {value === 0 ? "·" : value.toFixed(1)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${GRID + 8} ${GRID + 8}`}
            className="w-full max-w-[350px] select-none rounded-lg bg-slate-50 p-1 dark:bg-slate-950"
          >
            {table.table.map((row, rowIndex) =>
              row.map((value, columnIndex) => (
                <rect
                  key={`${rowIndex}-${columnIndex}`}
                  x={4 + columnIndex * cell}
                  y={4 + rowIndex * cell}
                  width={cell + 0.4}
                  height={cell + 0.4}
                  fill={value === 0 ? "transparent" : colourFor(table.topics[rowIndex])}
                  opacity={value === 0 ? 0 : 0.18 + 0.82 * (value / largest)}
                  stroke={value === 0 ? "#cbd5e1" : "none"}
                  strokeWidth={0.25}
                  onMouseEnter={() => setHover({ row: rowIndex, column: columnIndex })}
                />
              )),
            )}
          </svg>
        )}

        <div className="min-w-[220px] flex-1">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="words" value={String(size)} />
            <Stat label="cells" value={String(table.n_cells)} />
            <Stat
              label="cells holding nothing"
              value={`${table.n_cells - table.n_nonzero} (${(table.zero_share * 100).toFixed(1)}%)`}
            />
            <Stat label="every count added up" value={table.total.toFixed(1)} />
            <Stat
              label="counts below one"
              value={`${table.below_one} (${(table.below_one_share * 100).toFixed(1)}%)`}
            />
            <Stat
              label="mean logarithm of a count"
              value={table.mean_logarithm.toFixed(4)}
            />
          </div>
          <div className="mt-2 rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            {shown ? (
              <p>
                {shown.row} beside {shown.column}: {shown.value.toFixed(3)}
              </p>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">
                {small ? "read a cell off the grid" : "hover a cell to read one count"}
              </p>
            )}
            <p className="mt-1">
              largest:{" "}
              {table.largest_pairs
                .slice(0, 3)
                .map((pair) => `${pair.word} ~ ${pair.context} ${pair.count.toFixed(1)}`)
                .join(", ")}
            </p>
          </div>
        </div>
      </div>

      <Legend>
        Under the first distance rule a neighbour {window > 1 ? "two positions away counts a half and one three away a third" : "next door counts one"}
        , so the counts are not whole numbers; under the second every position
        inside the reach counts one full time. Shading runs from the smallest
        count to the largest, and an outlined cell is a pair that never occurred
        at all, which is a cell the fit has no term for.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
