"use client";

// The whole method under the reader's hands: a text, a word list, and the two
// ends the scan can start from.
//
// Everything is computed by the API. It scans the text from each end and both
// ways, reports the pieces with the span each came from and whether the list
// held it, counts the candidates the scan asked about, and searches every
// reading to find the fewest pieces any of them could have used. Striking an
// entry out of the list is the interesting control, since the whole of the
// method's knowledge is in that list, and taking one word out of it is enough to
// change where every later cut falls.

import { useEffect, useState } from "react";
import {
  Analysis,
  SCANS,
  Scan,
  SegmentView,
  grouped,
  messageFor,
  readingFor,
  segment,
} from "@/lib/concepts/maximum-matching";
import { Cut, Legend, Stat } from "./maximumMatchingParts";

interface Preset {
  label: string;
  text: string;
  wordList: string;
}

const PRESETS: Preset[] = [
  {
    label: "we play at the wildlife park",
    text: "我们在野生动物园玩",
    wordList: "park",
  },
  {
    label: "research, or a graduate student",
    text: "研究生命起源",
    wordList: "origins",
  },
  {
    label: "a surname the list has never seen",
    text: "阿尔瓦雷斯研究生命起源",
    wordList: "origins",
  },
  {
    label: "four English words run together",
    text: "thetabledownthere",
    wordList: "english",
  },
  {
    label: "our sentence, spaces removed",
    text: "Dr.Alvarezdidn'texpectthelow-costre-analysis.",
    wordList: "english",
  },
];

const MAX_CHARACTERS = 60;

export function MaximumMatchingPlayground() {
  const [preset, setPreset] = useState(0);
  const [text, setText] = useState(PRESETS[0].text);
  const [wordList, setWordList] = useState(PRESETS[0].wordList);
  const [removed, setRemoved] = useState<string[]>([]);
  const [scan, setScan] = useState<Scan>("left to right");
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
  }, [text, wordList, struck]);

  function choose(position: number) {
    setPreset(position);
    setText(PRESETS[position].text);
    setWordList(PRESETS[position].wordList);
    setRemoved([]);
  }

  function toggle(word: string) {
    setRemoved((current) =>
      current.includes(word)
        ? current.filter((entry) => entry !== word)
        : [...current, word],
    );
  }

  const analysis: Analysis | null = view ? view.analysis : null;
  const reading = analysis ? readingFor(analysis, scan) : null;

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          A text with nothing between its words
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

      <div className="flex flex-wrap gap-2">
        {SCANS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setScan(option)}
            className={`rounded-md border px-3 py-1 text-sm ${
              scan === option
                ? "border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {option === "both" ? "run both and keep one" : `scan ${option}`}
          </button>
        ))}
      </div>

      {view && view.words_in_list.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            The word list. Click an entry to strike it out and see where the cuts
            move.
          </p>
          <div className="flex flex-wrap gap-1">
            {view.words_in_list.map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => toggle(word)}
                className={`rounded border px-1.5 py-0.5 font-mono text-sm ${
                  removed.includes(word)
                    ? "border-slate-200 text-slate-400 line-through dark:border-slate-700 dark:text-slate-500"
                    : "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-500/60 dark:bg-sky-950/40 dark:text-sky-200"
                }`}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      )}

      {message && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{message}</p>
      )}

      {analysis && reading && (
        <>
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              {scan === "both"
                ? `Both scans run, and the ${reading.chosen_scan} answer kept, because ${reading.decided_by}`
                : `The cut, scanning ${scan}`}
            </p>
            <Cut pieces={reading.pieces} />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="pieces" value={`${reading.n_pieces}`} />
            <Stat label="lone characters" value={`${reading.n_single_characters}`} />
            <Stat
              label="candidates asked about"
              value={`${reading.n_lookups}`}
            />
            <Stat label="ways to cut it" value={grouped(analysis.n_cuts)} />
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            The list holds {analysis.n_words_in_list} words, the longest{" "}
            {analysis.longest_entry} characters. Searching every reading whose
            pieces are entries or lone characters, the fewest any of them uses is{" "}
            {analysis.shortest.n_pieces}.{" "}
            {analysis.greedy_reaches_shortest
              ? "The left-to-right scan reached that."
              : "The left-to-right scan did not reach that, so it passed a shorter reading by."}
          </p>

          <Legend />
        </>
      )}
    </div>
  );
}
