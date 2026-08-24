"use client";

// The whole method under the reader's hands: a text, a list of words with counts,
// and a dial for how much other text those counts were taken from.
//
// Everything is computed by the API. It lays out every candidate the list allows
// at every position, counts how many complete readings that leaves, ranks the
// leading few by the sum of their words' log scores, and runs the greedy rule of
// the previous page on the same text and the same list for comparison. Striking a
// word out is the first interesting control, since the list is the whole of what
// the method knows. The second is the dial, which adds counts of a word the text
// does not contain, and which moves the cut anyway.

import { useEffect, useState } from "react";
import {
  SegmentView,
  grouped,
  messageFor,
  segment,
} from "@/lib/concepts/the-word-lattice";
import {
  Legend,
  Loading,
  ReadingRow,
  Stat,
  WordsOfAReading,
  entriesOf,
} from "./wordLatticeParts";

interface Preset {
  label: string;
  text: string;
  wordList: string;
}

const PRESETS: Preset[] = [
  {
    label: "research, or a graduate student",
    text: "研究生命起源",
    wordList: "research life",
  },
  {
    label: "the same words, counted differently",
    text: "研究生命起源",
    wordList: "research student",
  },
  {
    label: "a compound rarer than its characters",
    text: "研究生命起源",
    wordList: "research split",
  },
  {
    label: "we play at the wildlife park",
    text: "我们在野生动物园玩",
    wordList: "park counted",
  },
  {
    label: "the same, on a bare word list",
    text: "我们在野生动物园玩",
    wordList: "park plain",
  },
  {
    label: "five English words run together",
    text: "thewaterunderthetable",
    wordList: "english",
  },
  {
    label: "our sentence, spaces removed",
    text: "Dr.Alvarezdidn'texpectthelow-costre-analysis.",
    wordList: "english",
  },
];

const MAX_CHARACTERS = 60;
const MAX_ADDED = 500;

export function LatticePlayground() {
  const [preset, setPreset] = useState(0);
  const [text, setText] = useState(PRESETS[0].text);
  const [wordList, setWordList] = useState(PRESETS[0].wordList);
  const [removed, setRemoved] = useState<string[]>([]);
  const [added, setAdded] = useState(0);
  const [view, setView] = useState<SegmentView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const struck = removed.join("|");

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const answer = await segment(
          text,
          wordList,
          struck === "" ? [] : struck.split("|"),
          added,
        );
        if (current) {
          setView(answer);
          setMessage(null);
        }
      } catch (error) {
        if (current) setMessage(messageFor(error));
      }
    })();
    return () => {
      current = false;
    };
  }, [text, wordList, struck, added]);

  function choose(position: number) {
    setPreset(position);
    setText(PRESETS[position].text);
    setWordList(PRESETS[position].wordList);
    setRemoved([]);
    setAdded(0);
  }

  function toggle(word: string) {
    setRemoved((current) =>
      current.includes(word)
        ? current.filter((entry) => entry !== word)
        : [...current, word],
    );
  }

  const analysis = view ? view.analysis : null;
  const entries = analysis ? entriesOf(analysis.edges) : new Set<string>();

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          A text with nothing between its words, and a list of words to read it
          with
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((option, position) => (
            <button
              key={option.label}
              type="button"
              onClick={() => choose(position)}
              className={`rounded-md border px-3 py-1 text-sm ${
                preset === position
                  ? "border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Or type your own, up to {MAX_CHARACTERS} characters
        </span>
        <input
          type="text"
          value={text}
          maxLength={MAX_CHARACTERS}
          onChange={(event) => setText(event.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </label>

      {view && view.words_in_list.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            The list, with how often each word was counted. Click one to strike
            it out and watch every later cut move.
          </p>
          <div className="flex flex-wrap gap-1">
            {view.words_in_list.map((entry) => (
              <button
                key={entry.word}
                type="button"
                onClick={() => toggle(entry.word)}
                title={`scores ${entry.log_score.toFixed(4)}`}
                className={`rounded border px-1.5 py-0.5 font-mono text-sm ${
                  removed.includes(entry.word)
                    ? "border-slate-200 text-slate-400 line-through dark:border-slate-700 dark:text-slate-500"
                    : "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-500/60 dark:bg-sky-950/40 dark:text-sky-200"
                }`}
              >
                {entry.word} {entry.frequency}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Counts of one more word added to the list. None of the texts offered
          above contains it, and adding counts still moves their cuts. Now at{" "}
          {added}
        </span>
        <input
          type="range"
          min={0}
          max={MAX_ADDED}
          step={1}
          value={added}
          onChange={(event) => setAdded(Number(event.target.value))}
          className="w-full accent-sky-500"
        />
      </label>

      {message && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{message}</p>
      )}

      {!analysis && !message && <Loading message={null} />}

      {analysis && (
        <>
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              The best path, scoring {analysis.best.total_log_score.toFixed(4)}
            </p>
            <WordsOfAReading words={analysis.best.words} entries={entries} />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="words" value={`${analysis.best.n_words}`} />
            <Stat
              label="readings the list permits"
              value={grouped(analysis.n_readings)}
            />
            <Stat label="candidates to step along" value={`${analysis.n_edges}`} />
            <Stat label="the gap to the next" value={analysis.margin.toFixed(4)} />
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              The leading readings, best first
            </p>
            <ul className="text-sm">
              {analysis.readings.slice(0, 4).map((reading, rank) => (
                <ReadingRow
                  key={reading.words.join("|")}
                  reading={reading}
                  entries={entries}
                  rank={rank + 1}
                />
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              What the greedy rule of the previous page answers for the same text
              and the same list
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {analysis.greedy.map((scan) => (
                <div
                  key={scan.scan}
                  className="rounded-lg border border-slate-200 p-2 dark:border-slate-800"
                >
                  <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {scan.scan}, {scan.n_words} words, {scan.n_lookups}{" "}
                    substrings asked about
                  </p>
                  <WordsOfAReading words={scan.words} entries={entries} />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              The best path asked about {analysis.n_lookups} substrings, since it
              skips none of them.
            </p>
          </div>

          <Legend />
        </>
      )}
    </div>
  );
}
