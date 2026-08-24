"use client";

// Choose a corpus, a vocabulary size and a text, and watch the pieces arrive.
//
// The API chooses the pieces and reads the text back; the browser draws what
// came out. The list is in the order the pieces were chosen, each with the
// positions it newly covered, so the falling numbers are visible while the
// dial moves. Everything below the dial is measured rather than described.

import { useEffect, useState } from "react";
import {
  CorpusChoice,
  FitView,
  fitGreedyCoverage,
  messageFor,
} from "@/lib/concepts/greedy-coverage";
import { Choices, Pieces, SIZE_LABEL, Stat } from "./greedyCoverageParts";

const SMALLEST: Record<CorpusChoice, number> = {
  four_words: 12,
  sentences: 52,
};
const LARGEST: Record<CorpusChoice, number> = {
  four_words: 30,
  sentences: 140,
};
const OPENING: Record<CorpusChoice, number> = {
  four_words: 14,
  sentences: 100,
};
const SUGGESTED: Record<CorpusChoice, string> = {
  four_words: "lowest",
  sentences: "Dr. Alvarez didn't expect the low-cost re-analysis.",
};

export function GreedyCoveragePlayground() {
  const [corpus, setCorpus] = useState<CorpusChoice>("sentences");
  const [size, setSize] = useState(OPENING.sentences);
  const [text, setText] = useState(SUGGESTED.sentences);
  const [view, setView] = useState<FitView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const answer = await fitGreedyCoverage(corpus, size, text);
        if (live) {
          setView(answer);
          setMessage(null);
        }
      } catch (error) {
        if (live) {
          setMessage(messageFor(error));
        }
      }
    })();
    return () => {
      live = false;
    };
  }, [corpus, size, text]);

  const choose = (next: CorpusChoice) => {
    setCorpus(next);
    setSize(OPENING[next]);
    setText(SUGGESTED[next]);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <Choices
          label="corpus"
          chosen={corpus}
          onChoose={choose}
          options={(["four_words", "sentences"] as CorpusChoice[]).map(
            (value) => ({ value, label: SIZE_LABEL[value] }),
          )}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            vocabulary size
          </span>
          <input
            type="range"
            min={SMALLEST[corpus]}
            max={LARGEST[corpus]}
            step={1}
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
            className="w-44 accent-indigo-500"
          />
          <span className="w-10 font-mono text-sm text-slate-800 dark:text-slate-200">
            {size}
          </span>
        </div>
      </div>

      <label className="mt-3 block">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          a text to read with it
        </span>
        <input
          type="text"
          value={text}
          maxLength={200}
          onChange={(event) => setText(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
      </label>

      {message && (
        <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/60 dark:bg-amber-950/30 dark:text-amber-200">
          {message}
        </p>
      )}

      {!view && !message && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">…</p>
      )}

      {view && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat
              label="tokens it managed"
              value={`${view.learned} of ${view.asked}`}
            />
            <Stat label="pieces chosen" value={view.n_pieces} />
            <Stat
              label="positions covered"
              value={`${view.covered_positions} of ${view.total_positions}`}
            />
            <Stat
              label="corpus, in pieces"
              value={`${view.corpus_pieces} from ${view.corpus_bare_pieces}`}
            />
          </div>

          <div className="mt-4">
            <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
              the text, cut by those pieces: {view.n_text_pieces} in all
              {view.unknown_pieces > 0 &&
                `, ${view.unknown_pieces} of them a stand-in`}
            </p>
            <Pieces pieces={view.text_pieces} />
            <p className="mt-2 font-mono text-xs text-slate-600 dark:text-slate-400">
              glued back: {view.decoded || "nothing"}
              {view.round_trip_exact ? "  (exact)" : "  (not what went in)"}
            </p>
          </div>

          <div className="mt-4">
            <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
              the pieces, in the order they were chosen, with the positions each
              newly covered
            </p>
            <div className="max-h-48 overflow-y-auto rounded-md border border-slate-200 p-2 dark:border-slate-800">
              <div className="flex flex-wrap gap-1.5">
                {view.pieces.map((row) => (
                  <span
                    key={row.rank}
                    className="rounded border border-indigo-300 bg-indigo-50 px-1.5 py-0.5 font-mono text-xs text-indigo-900 dark:border-indigo-500/60 dark:bg-indigo-950/40 dark:text-indigo-200"
                  >
                    {row.piece.endsWith("</w>")
                      ? row.piece.slice(0, -4)
                      : row.piece}
                    {row.piece.endsWith("</w>") && (
                      <span className="ml-0.5 opacity-60">&#9141;</span>
                    )}
                    <span className="ml-1 text-indigo-500 dark:text-indigo-400">
                      {row.coverage}
                    </span>
                  </span>
                ))}
                {view.pieces.length === 0 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    nothing above the alphabet yet
                  </span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
