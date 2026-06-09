"use client";

// One word's row of the table, as the corpus wrote it and as the kept
// directions rebuild it.
//
// The upper strip is what was counted, six documents filled and eighteen empty;
// the lower is what comes back when only a few directions are kept. Watch the
// empty cells of the word's own half fill in, which is the whole of what the
// squeeze does, and watch them fill in with something that is not a count. The
// API decomposes and rebuilds; the browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  Reconstruction,
  fetchReconstruction,
} from "@/lib/concepts/latent-semantic-analysis";
import {
  Choice,
  DISCARDED,
  Legend,
  SECOND_HALF,
  Stat,
  Waiting,
  colourFor,
  shade,
} from "./latentSemanticShared";

const WORDS: { label: string; value: string }[] = [
  { label: "flour", value: "flour" },
  { label: "whisk", value: "whisk" },
  { label: "anchor", value: "anchor" },
  { label: "the", value: "the" },
];

function Strip({
  values,
  groups,
  documents,
  largest,
}: {
  values: number[];
  groups: string[];
  documents: string[];
  largest: number;
}) {
  return (
    <div className="flex gap-[2px]">
      {values.map((value, column) => (
        <div
          key={column}
          title={`${documents[column]}, at ${value.toFixed(4)}`}
          className="flex h-9 flex-1 items-center justify-center rounded-sm border text-[9px] font-mono"
          style={{
            backgroundColor:
              value < 0
                ? shade(-value, largest, DISCARDED)
                : shade(value, largest, SECOND_HALF),
            borderColor: colourFor(groups[column]),
            borderWidth: 1,
          }}
        >
          {value === 0 ? "" : value.toFixed(2)}
        </div>
      ))}
    </div>
  );
}

export function RebuiltRow() {
  const [word, setWord] = useState("flour");
  const [dimension, setDimension] = useState(2);
  const [report, setReport] = useState<Reconstruction | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchReconstruction(dimension, word);
        if (!cancelled) {
          setReport(next);
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
  }, [word, dimension]);

  if (!report) return <Waiting message={message} />;

  const largest = Math.max(
    ...report.row_original.map(Math.abs),
    ...report.row_rebuilt.map(Math.abs),
    0.001,
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <Choice options={WORDS} value={word} onChange={setWord} />
        <label className="flex items-center gap-2">
          <span className="text-xs">directions kept</span>
          <input
            type="range"
            min={1}
            max={14}
            step={1}
            value={dimension}
            onChange={(event) => setDimension(Number(event.target.value))}
            className="w-32 accent-emerald-500"
          />
          <span className="font-mono text-xs">{report.dimension}</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="documents the word was in"
          value={String(report.row_seen_in)}
        />
        <Stat
          label="documents the rebuild fills"
          value={String(report.row_filled_in)}
        />
        <Stat
          label="mean over the cells left empty"
          value={report.empty_cell_mean.toFixed(4)}
        />
        <Stat
          label="rebuilt cells below zero"
          value={`${report.n_negative}, least ${report.most_negative.toFixed(4)}`}
        />
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        as the corpus wrote it
      </p>
      <Strip
        values={report.row_original}
        groups={report.document_groups}
        documents={report.documents}
        largest={largest}
      />
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        rebuilt from {report.dimension} direction
        {report.dimension === 1 ? "" : "s"}, which hold{" "}
        {(report.kept_share * 100).toFixed(1)}% of the table
      </p>
      <Strip
        values={report.row_rebuilt}
        groups={report.document_groups}
        documents={report.documents}
        largest={largest}
      />

      <Legend>
        Twenty-four cells, one per document, bordered amber for cooking and
        indigo for sailing; hover one to read its document. Blue shading is a
        positive entry and red a negative one, which a count can never be and a
        rebuilt table can. At two directions the whole cooking half of the row
        fills to about the same height, which is the fit saying that this word
        belongs to those documents whether or not it was used in them.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
