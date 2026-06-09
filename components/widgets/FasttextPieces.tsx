"use client";

// One word wrapped and cut into every piece of the chosen lengths, with the
// row each piece is kept in.
//
// A piece is green where some word of the corpus owns it too, so a reader can
// see at a glance how much of an unseen word was taught by other words, and
// grey where no sentence ever contained it. Hovering a piece names the words
// that own it. The API cuts the word and hashes the pieces; the browser lays
// them out.

import { FormEvent, useEffect, useState } from "react";
import { ApiError, WordPieces, fetchPieces } from "@/lib/concepts/fasttext";
import { Legend, Stat, TAUGHT, UNTAUGHT, Waiting, WordChoice } from "./fasttextShared";

const WORDS = ["playing", "play", "where", "walking", "market", "queue"];

export function FasttextPieces() {
  const [word, setWord] = useState("playing");
  const [typed, setTyped] = useState("");
  const [minimumLength, setMinimumLength] = useState(3);
  const [maximumLength, setMaximumLength] = useState(6);
  const [report, setReport] = useState<WordPieces | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchPieces({
          word,
          minimumLength,
          maximumLength: Math.max(minimumLength, maximumLength),
        });
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
  }, [word, minimumLength, maximumLength]);

  function lookUp(event: FormEvent) {
    event.preventDefault();
    const wanted = typed.trim().toLowerCase();
    if (wanted) setWord(wanted);
  }

  if (!report) return <Waiting message={message} />;

  const lengths = Array.from(new Set(report.pieces.map((entry) => entry.length)));

  return (
    <div>
      <form
        onSubmit={lookUp}
        className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300"
      >
        <WordChoice words={WORDS} value={report.word} onChange={setWord} />
        <input
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          placeholder="or any word"
          className="w-28 rounded border border-slate-300 bg-white px-2 py-0.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          type="submit"
          className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          cut it up
        </button>
        <label className="flex items-center gap-2">
          shortest
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={minimumLength}
            onChange={(event) => setMinimumLength(Number(event.target.value))}
            className="w-20 accent-indigo-600"
          />
          <span className="w-4 text-right font-mono">{minimumLength}</span>
        </label>
        <label className="flex items-center gap-2">
          longest
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={maximumLength}
            onChange={(event) => setMaximumLength(Number(event.target.value))}
            className="w-20 accent-indigo-600"
          />
          <span className="w-4 text-right font-mono">
            {Math.max(minimumLength, maximumLength)}
          </span>
        </label>
      </form>

      <p className="mt-3 font-mono text-lg text-slate-900 dark:text-slate-100">
        {report.wrapped}
      </p>

      <div className="mt-3 space-y-2">
        {lengths.map((length) => (
          <div key={length} className="flex flex-wrap items-center gap-1">
            <span className="w-16 shrink-0 text-xs text-slate-500 dark:text-slate-400">
              {length} long
            </span>
            {report.pieces
              .filter((entry) => entry.length === length)
              .map((entry) => (
                <span
                  key={entry.piece}
                  title={
                    entry.owners.length
                      ? `row ${entry.bucket}, also written to by ${entry.owners.join(", ")}`
                      : `row ${entry.bucket}, which no word of the corpus writes to`
                  }
                  className="rounded px-1.5 py-0.5 font-mono text-xs"
                  style={{
                    backgroundColor: entry.owners.length ? TAUGHT : UNTAUGHT,
                    color: "white",
                  }}
                >
                  {entry.piece}
                </span>
              ))}
          </div>
        ))}
        {report.pieces.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The wrapped word is too short to hold a piece of that length, so this
            word has none at all and nothing but its own row to stand on.
          </p>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="pieces" value={report.n_pieces.toString()} />
        <Stat label="a corpus word owns" value={report.n_pieces_owned.toString()} />
        <Stat label="rows the corpus wrote to" value={report.shared_buckets.toString()} />
        <Stat
          label="in the corpus"
          value={report.seen ? "yes" : "no"}
        />
      </div>

      <Legend>
        A piece in <span style={{ color: TAUGHT }}>green</span> is one some word of
        the corpus owns as well, so the corpus taught its row; a piece in{" "}
        <span style={{ color: UNTAUGHT }}>grey</span> is one no sentence ever
        contained. Hover a piece to see which words share it and which row it is
        kept in.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
