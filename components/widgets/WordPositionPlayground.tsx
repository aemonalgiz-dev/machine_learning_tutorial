"use client";

// Stand at one word and look around from it.
//
// The whole vocabulary is drawn as chips coloured by topic; clicking one moves
// the viewpoint. The panel then shows that word's coordinates, how long its
// vector is, and the words nearest it by angle, each with its cosine drawn as a
// bar. A second chip row picks a partner so a single pair can be read on its
// own. The API fits the table and measures every cosine; the browser only lays
// them out.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  NeighbourAnswer,
  SpaceName,
  WordSpace,
  fetchNeighbours,
  fetchSpace,
} from "@/lib/concepts/a-vector-for-a-word";
import { ACCENT, HOME_WORD, colourOf } from "./wordPositionFixtures";

const BAR = { width: 320, height: 14 };

export function WordPositionPlayground() {
  const [space, setSpace] = useState<SpaceName>("documents");
  const [table, setTable] = useState<WordSpace | null>(null);
  const [word, setWord] = useState(HOME_WORD);
  const [partner, setPartner] = useState("rope");
  const [answer, setAnswer] = useState<NeighbourAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const fetched = await fetchSpace(space);
        setTable(fetched);
        const usable = fetched.words.filter((row) => row.length > 0);
        if (!usable.some((row) => row.word === word)) {
          setWord(usable[0].word);
          setPartner(usable[1].word);
        }
        setMessage(null);
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [space]);

  useEffect(() => {
    if (!table) return;
    if (!table.words.some((row) => row.word === word && row.length > 0)) return;
    (async () => {
      try {
        setAnswer(await fetchNeighbours(word, { space, nResults: 6 }));
        setMessage(null);
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      }
    })();
  }, [table, space, word]);

  if (!table) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const chosen = table.words.find((row) => row.word === word) ?? table.words[0];
  const partnerRow = answer?.by_cosine
    .concat(answer.by_gap)
    .find((row) => row.word === partner);
  const usable = table.words.filter((row) => row.length > 0);
  const widest = Math.max(1e-9, ...(answer?.by_cosine.map((row) => Math.abs(row.cosine)) ?? [1]));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Stand at a word and look around from it
        </p>
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {(
            [
              { label: "the documents", value: "documents" },
              { label: "the five-word sketch", value: "sketch" },
            ] as { label: string; value: SpaceName }[]
          ).map((choice) => (
            <button
              key={choice.value}
              onClick={() => setSpace(choice.value)}
              className={
                "rounded px-2 py-0.5 text-xs font-medium transition " +
                (space === choice.value
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {choice.label}
            </button>
          ))}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {usable.map((row) => (
          <button
            key={row.word}
            onClick={() => setWord(row.word)}
            className={
              "rounded px-2 py-0.5 font-mono text-xs transition " +
              (row.word === word
                ? "text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700")
            }
            style={row.word === word ? { background: colourOf(row.word) } : undefined}
          >
            {row.word}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
            where {chosen.word} sits
          </div>
          <div className="mt-1 font-mono text-sm text-slate-900 dark:text-slate-100">
            ({chosen.vector.map((value) => value.toFixed(4)).join(", ")})
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Stat label="length of the vector" value={chosen.length.toFixed(4)} />
            <Stat
              label={chosen.count === null ? "number in the table" : "times the texts used it"}
              value={chosen.count === null ? String(chosen.token_id) : String(chosen.count)}
            />
          </div>
          <div className="mt-3 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
            one pair on its own
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {usable
              .filter((row) => row.word !== word)
              .map((row) => (
                <button
                  key={row.word}
                  onClick={() => setPartner(row.word)}
                  className={
                    "rounded px-1.5 py-0.5 font-mono text-[11px] transition " +
                    (row.word === partner
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700")
                  }
                >
                  {row.word}
                </button>
              ))}
          </div>
          {partnerRow && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Stat
                label={`cosine, ${chosen.word} and ${partnerRow.word}`}
                value={partnerRow.cosine.toFixed(4)}
              />
              <Stat label="straight-line gap" value={partnerRow.gap.toFixed(4)} />
            </div>
          )}
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
            nearest by angle
          </div>
          {answer ? (
            <svg
              viewBox={`0 0 ${BAR.width} ${answer.by_cosine.length * 22 + 6}`}
              className="mt-1 w-full select-none"
            >
              {answer.by_cosine.map((row, index) => {
                const share = Math.max(0, row.cosine) / widest;
                return (
                  <g key={row.word} transform={`translate(0 ${index * 22})`}>
                    <rect
                      x={84}
                      y={4}
                      width={Math.max(1, share * (BAR.width - 140))}
                      height={BAR.height}
                      rx={2}
                      fill={colourOf(row.word)}
                      opacity={0.85}
                    />
                    <text
                      x={80}
                      y={15}
                      textAnchor="end"
                      className="fill-slate-700 font-mono text-[11px] dark:fill-slate-300"
                    >
                      {row.word}
                    </text>
                    <text
                      x={BAR.width - 4}
                      y={15}
                      textAnchor="end"
                      className="fill-slate-500 font-mono text-[11px] dark:fill-slate-400"
                    >
                      {row.cosine.toFixed(4)}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">…</p>
          )}
          {answer && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Answering took {answer.comparisons} comparisons, one against every
              other word that has a direction.
            </p>
          )}
        </div>
      </div>

      {message && (
        <p className="mt-3 text-sm" style={{ color: ACCENT }}>
          {message}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
