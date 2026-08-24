"use client";

// The whole move under one set of controls: an old corpus, a new one, a size
// for each vocabulary, and a text read by both.
//
// The API fits both corpora, asks the library which old tokens each new token
// is made of, and returns every mapping together with the counts over them and
// the two readings of the text. The browser only draws. Dropping a size below
// its corpus's own alphabet is left reachable on purpose, because the refusal
// that comes back says something the slider cannot.

import { useEffect, useMemo, useState } from "react";
import {
  CorpusChoice,
  TransferView,
  messageFor,
  moveVocabulary,
} from "@/lib/concepts/moving-a-vocabulary";
import {
  CORPUS_LABELS,
  Pieces,
  RouteChip,
  Stat,
} from "./movingAVocabularyParts";

const BOUNDS: Record<CorpusChoice, { size: number; min: number; max: number }> =
  {
    reports: { size: 137, min: 12, max: 160 },
    kitchen: { size: 137, min: 12, max: 160 },
    four_words: { size: 22, min: 12, max: 30 },
  };

const ORDER: CorpusChoice[] = ["reports", "kitchen", "four_words"];

export function VocabularyMovePlayground() {
  const [sourceCorpus, setSourceCorpus] = useState<CorpusChoice>("reports");
  const [targetCorpus, setTargetCorpus] = useState<CorpusChoice>("kitchen");
  const [sourceSize, setSourceSize] = useState(BOUNDS.reports.size);
  const [targetSize, setTargetSize] = useState(BOUNDS.kitchen.size);
  const [text, setText] = useState(
    "The warm dough doubled before the butter was folded in.",
  );
  const [move, setMove] = useState<TransferView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [onlyChanged, setOnlyChanged] = useState(false);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const answer = await moveVocabulary(
          sourceCorpus,
          targetCorpus,
          sourceSize,
          targetSize,
          text,
        );
        if (current) {
          setMove(answer);
          setMessage(null);
        }
      } catch (error) {
        if (current) setMessage(messageFor(error));
      }
    })();
    return () => {
      current = false;
    };
  }, [sourceCorpus, targetCorpus, sourceSize, targetSize, text]);

  const shown = useMemo(
    () =>
      (move?.rows ?? []).filter((row) => !onlyChanged || row.route !== "copied"),
    [move, onlyChanged],
  );

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">
            The vocabulary the model was trained with
          </p>
          <div className="flex flex-wrap gap-2">
            {ORDER.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSourceCorpus(key);
                  setSourceSize(BOUNDS[key].size);
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  sourceCorpus === key
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {CORPUS_LABELS[key]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">
            The vocabulary it is moving to
          </p>
          <div className="flex flex-wrap gap-2">
            {ORDER.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setTargetCorpus(key);
                  setTargetSize(BOUNDS[key].size);
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  targetCorpus === key
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {CORPUS_LABELS[key]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-slate-600 dark:text-slate-400">
          Old vocabulary size
          <span className="ml-2 font-mono text-slate-800 dark:text-slate-200">
            {sourceSize}
          </span>
          <input
            type="range"
            min={BOUNDS[sourceCorpus].min}
            max={BOUNDS[sourceCorpus].max}
            step={1}
            value={sourceSize}
            onChange={(event) => setSourceSize(Number(event.target.value))}
            className="mt-1 w-full accent-indigo-600"
          />
        </label>
        <label className="block text-sm text-slate-600 dark:text-slate-400">
          New vocabulary size
          <span className="ml-2 font-mono text-slate-800 dark:text-slate-200">
            {targetSize}
          </span>
          <input
            type="range"
            min={BOUNDS[targetCorpus].min}
            max={BOUNDS[targetCorpus].max}
            step={1}
            value={targetSize}
            onChange={(event) => setTargetSize(Number(event.target.value))}
            className="mt-1 w-full accent-indigo-600"
          />
        </label>
      </div>

      <label className="mb-3 block text-sm text-slate-600 dark:text-slate-400">
        A text to read with each of them
        <input
          type="text"
          value={text}
          maxLength={120}
          onChange={(event) => setText(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 font-mono text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        />
      </label>

      {message && (
        <p className="rounded-md border-l-4 border-amber-400 bg-amber-50/70 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/70 dark:bg-amber-950/30 dark:text-amber-200">
          {message}
        </p>
      )}

      {!move && !message && (
        <p className="text-sm text-slate-500 dark:text-slate-400">…</p>
      )}

      {move && !message && (
        <>
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat
              label="new tokens"
              value={`${move.summary.n_target_tokens} from ${move.summary.n_source_tokens}`}
            />
            <Stat label="copied exactly" value={move.summary.n_copied} />
            <Stat label="read again" value={move.summary.n_rebuilt} />
            <Stat
              label="nothing to read"
              value={move.summary.n_nothing}
            />
          </div>

          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              The text under the old vocabulary, {move.source_reading.n_pieces}{" "}
              pieces
            </p>
            <Pieces pieces={move.source_reading.pieces} tone="muted" />
            <p className="mb-2 mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              The same text under the new one, {move.target_reading.n_pieces}{" "}
              pieces
            </p>
            <Pieces pieces={move.target_reading.pieces} tone="learned" />
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Every token of the new vocabulary, and the old rows it is made
                of
              </p>
              <button
                type="button"
                onClick={() => setOnlyChanged(!onlyChanged)}
                className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {onlyChanged ? "show all" : "hide the copied ones"}
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-1 pr-3 font-medium">new token</th>
                    <th className="py-1 pr-3 font-medium">rule</th>
                    <th className="py-1 font-medium">old rows</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 dark:text-slate-300">
                  {shown.map((row) => (
                    <tr
                      key={row.target_id}
                      className="border-t border-slate-100 align-top dark:border-slate-800/60"
                    >
                      <td className="py-1 pr-3">
                        <Pieces
                          pieces={[row.target_token]}
                          tone={row.route === "copied" ? "highlight" : "plain"}
                        />
                      </td>
                      <td className="py-1 pr-3">
                        <RouteChip route={row.route} />
                      </td>
                      <td className="py-1">
                        {row.n_source_ids === 0 ? (
                          <span className="text-slate-400">none</span>
                        ) : (
                          <Pieces pieces={row.source_tokens} tone="muted" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            The new corpus costs {move.source_corpus_pieces} pieces under the
            old vocabulary and {move.target_corpus_pieces} under the new one.
            Move a vocabulary into itself and every token is copied; move it
            between two corpora and the count of copied tokens is roughly the
            alphabet they share.
          </p>
        </>
      )}
    </div>
  );
}
