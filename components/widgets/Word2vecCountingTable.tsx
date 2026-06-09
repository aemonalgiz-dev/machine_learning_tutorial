"use client";

// The table you get by counting, and what it costs.
//
// Every word of the corpus down the side and along the top, each cell shaded
// by how often the two appeared within three positions of each other. The
// blank quarters are the two lists never sharing a sentence, which is the
// pattern the whole page is about; the readouts underneath say how much of the
// table is blank, how wide a row is, and how well two whole rows compared
// directly already tell the lists apart. The API counts and measures; the
// browser draws.

import { useEffect, useState } from "react";
import { ApiError, CountingTable, fetchCountingTable } from "@/lib/concepts/word2vec";
import { Legend, MONEY, Stat, VERB, Waiting } from "./word2vecShared";

const GRID = 372;

export function Word2vecCountingTable() {
  const [table, setTable] = useState<CountingTable | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [hover, setHover] = useState<{ row: number; column: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setTable(await fetchCountingTable());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!table) return <Waiting message={message} />;

  const size = table.words.length;
  const cell = GRID / size;
  const largest = Math.max(...table.table.flat());
  const shown = hover
    ? {
        row: table.words[hover.row],
        column: table.words[hover.column],
        value: table.table[hover.row][hover.column],
      }
    : null;

  return (
    <div>
      <div className="flex flex-wrap gap-6">
        <svg
          viewBox={`0 0 ${GRID + 8} ${GRID + 8}`}
          className="w-full max-w-[380px] select-none rounded-lg bg-slate-50 p-1 dark:bg-slate-950"
        >
          {table.table.map((row, rowIndex) =>
            row.map((value, columnIndex) => (
              <rect
                key={`${rowIndex}-${columnIndex}`}
                x={4 + columnIndex * cell}
                y={4 + rowIndex * cell}
                width={cell + 0.4}
                height={cell + 0.4}
                fill={value === 0 ? "transparent" : table.topics[rowIndex] === "money" ? MONEY : VERB}
                opacity={value === 0 ? 0 : 0.15 + 0.85 * (value / largest)}
                stroke={value === 0 ? "#cbd5e1" : "none"}
                strokeWidth={0.25}
                onMouseEnter={() => setHover({ row: rowIndex, column: columnIndex })}
              />
            )),
          )}
        </svg>
        <div className="min-w-[220px] flex-1">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="words in the corpus" value={String(size)} />
            <Stat label="cells in the table" value={String(table.n_cells)} />
            <Stat label="cells holding zero" value={`${table.n_zero_cells} (${(table.zero_share * 100).toFixed(1)}%)`} />
            <Stat label="numbers in a 12-wide table" value={String(table.vector_numbers)} />
            <Stat label="rows of one list, compared" value={table.within_topic.toFixed(4)} />
            <Stat label="rows across the two lists" value={table.across_topic.toFixed(4)} />
          </div>
          <div className="mt-2 rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            {shown ? (
              <p>
                {shown.row} beside {shown.column}: {shown.value.toFixed(3)}
              </p>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">
                hover a cell to read one count
              </p>
            )}
            <p className="mt-1">
              largest count beside {table.largest_for_walked.length > 0 ? "walked" : ""}:{" "}
              {table.largest_for_walked
                .map((entry) => `${entry.word} ${entry.similarity.toFixed(2)}`)
                .join(", ")}
            </p>
          </div>
        </div>
      </div>
      <Legend>
        A neighbour two positions away counts a half and one three away a third,
        so the counts are not whole numbers. Shading runs from the smallest count
        to the largest; an outlined cell is a pair that never occurred at all.
      </Legend>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
