"use client";

// The two vocabularies of the same size, laid out side by side.
//
// The API fits both methods on the eighteen sentences at one size and reports
// the rows each chose above the alphabet, in the order each chose them. The
// browser marks the rows both hold and lets a reader switch to the readings of
// four texts, which is where the difference in shape turns into a difference in
// what a word costs.

import { useEffect, useState } from "react";
import {
  MatchedView,
  fetchMatched,
  messageFor,
} from "@/lib/concepts/greedy-coverage";
import { Choices, Piece, Pieces, Stat } from "./greedyCoverageParts";

type Panel = "rows" | "readings";

export function TwoVocabularies() {
  const [view, setView] = useState<MatchedView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>("rows");

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchMatched());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const compared = view.compared;
  const shared = new Set(compared.shared);

  return (
    <div>
      <Choices
        label="show"
        chosen={panel}
        onChoose={setPanel}
        options={[
          { value: "rows", label: "The rows each chose" },
          { value: "readings", label: "What four texts cost" },
        ]}
      />

      {panel === "rows" ? (
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              chosen by coverage
            </p>
            <div className="flex flex-wrap gap-1">
              {compared.coverage_pieces.map((piece, index) => (
                <Piece
                  key={`${index}-${piece}`}
                  text={piece}
                  tone={shared.has(piece) ? "chosen" : "plain"}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              grown by merging
            </p>
            <div className="flex flex-wrap gap-1">
              {compared.merging_pieces.map((piece, index) => (
                <Piece
                  key={`${index}-${piece}`}
                  text={piece}
                  tone={shared.has(piece) ? "rival" : "plain"}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {view.readings.map((reading) => (
            <div
              key={reading.label}
              className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800"
            >
              <p className="mb-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                {reading.text}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-[11px] text-indigo-700 dark:text-indigo-300">
                    by coverage, {reading.coverage.length} pieces
                  </p>
                  <Pieces pieces={reading.coverage} />
                </div>
                <div>
                  <p className="mb-1 text-[11px] text-emerald-700 dark:text-emerald-300">
                    by merging, {reading.merging.length} pieces
                  </p>
                  <Pieces pieces={reading.merging} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="rows each chose" value={compared.coverage_pieces.length} />
        <Stat label="rows they share" value={compared.shared.length} />
        <Stat
          label="whole words held"
          value={`${compared.coverage_whole_words} and ${compared.merging_whole_words}`}
        />
        <Stat
          label="mean piece length"
          value={`${compared.coverage_mean_length.toFixed(2)} and ${compared.merging_mean_length.toFixed(2)}`}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Both were asked for {compared.size} tokens on the same corpus, and both
        learned {compared.coverage_pieces.length} rows above the same alphabet. A
        coloured row is one the other vocabulary also holds. Each pair of
        readouts gives the coverage figure first.
      </p>
    </div>
  );
}
