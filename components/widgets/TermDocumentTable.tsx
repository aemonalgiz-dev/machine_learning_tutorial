"use client";

// The whole table of one corpus, counted and then weighted.
//
// A row is a word and a column is a document, and the shading is how large the
// entry is against the largest entry anywhere in the table, so the pattern
// arrives before the numbers do. Switching to the weighted table leaves the
// zeros exactly where they were and changes only how much a filled cell counts.
// The API counts and weights; the browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  CorpusName,
  TermTable,
  WeightingName,
  fetchTermTable,
} from "@/lib/concepts/latent-semantic-analysis";
import {
  Choice,
  Legend,
  SECOND_HALF,
  Stat,
  Waiting,
  colourFor,
  shade,
} from "./latentSemanticShared";

const WEIGHTINGS: { label: string; value: WeightingName }[] = [
  { label: "plain counts", value: "counts" },
  { label: "weighted counts", value: "weighted" },
];

export function TermDocumentTable({
  corpus = "four",
}: {
  corpus?: CorpusName;
}) {
  const [weighting, setWeighting] = useState<WeightingName>("counts");
  const [table, setTable] = useState<TermTable | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchTermTable(corpus);
        if (!cancelled) {
          setTable(next);
          setMessage(null);
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
  }, [corpus]);

  if (!table) return <Waiting message={message} />;

  const valuesOf = (row: TermTable["rows"][number]) =>
    weighting === "counts" ? row.counts : row.weighted;
  const largest = Math.max(
    ...table.rows.flatMap((row) => valuesOf(row)),
    0.001,
  );
  const share =
    weighting === "counts"
      ? table.count_share_of_a_column
      : table.weighted_share_of_a_column;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <Choice options={WEIGHTINGS} value={weighting} onChange={setWeighting} />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="cells"
          value={`${table.n_nonzero} filled of ${table.n_cells}`}
        />
        <Stat label="empty" value={`${(table.zero_share * 100).toFixed(1)}%`} />
        <Stat
          label={`share of a column taken by ${table.commonest_word}`}
          value={`${(share * 100).toFixed(1)}%`}
        />
        <Stat
          label="words in every document"
          value={
            table.everywhere_words.length
              ? table.everywhere_words.join(", ")
              : "none"
          }
        />
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left font-medium text-slate-500 dark:text-slate-400">
                word
              </th>
              <th className="px-2 py-1 text-right font-medium text-slate-500 dark:text-slate-400">
                in
              </th>
              <th className="px-2 py-1 text-right font-medium text-slate-500 dark:text-slate-400">
                weight
              </th>
              {table.documents.map((document, column) => (
                <th
                  key={document}
                  className="px-1 py-1 text-center font-mono font-normal"
                  style={{ color: colourFor(table.document_groups[column]) }}
                  title={document}
                >
                  {column + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.word}>
                <td
                  className="whitespace-nowrap px-2 py-0.5 font-mono"
                  style={{ color: colourFor(row.group) }}
                >
                  {row.word}
                </td>
                <td className="px-2 py-0.5 text-right font-mono text-slate-500 dark:text-slate-400">
                  {row.document_frequency}
                </td>
                <td className="px-2 py-0.5 text-right font-mono text-slate-500 dark:text-slate-400">
                  {row.weight.toFixed(4)}
                </td>
                {valuesOf(row).map((value, column) => (
                  <td
                    key={`${row.word}-${column}`}
                    className="px-1 py-0.5 text-center font-mono text-slate-800 dark:text-slate-200"
                    style={{
                      backgroundColor: shade(value, largest, SECOND_HALF),
                    }}
                  >
                    {value === 0 ? "·" : value.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Legend>
        The column numbers are documents in the order they were written; hover
        one to read the document. A dot is a cell the corpus never filled, and
        those are in exactly the same places under both weightings, since a
        weight multiplies a count and cannot create one.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
