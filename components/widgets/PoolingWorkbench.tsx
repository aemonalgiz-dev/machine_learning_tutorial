"use client";

// Texts in, one position each out, under whichever rule the reader picks.
//
// The reader edits up to three short texts, chooses a collection and one of the
// six ways of turning a text into a position, and reads back each text's
// coordinates and the angle between every pair. The presets are the cases the
// page argues from, so a reader can walk the whole argument here before meeting
// it in prose. The API pools and compares; the browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  CorpusName,
  METHOD_LABELS,
  MethodName,
  Pooled,
  poolTexts,
} from "@/lib/concepts/pooling-a-text";
import { Choice, Legend, Stat, Waiting, colourFor, signed } from "./poolingATextShared";

const CORPORA: { label: string; value: CorpusName }[] = [
  { label: "twenty-four documents", value: "documents" },
  { label: "six two-word documents", value: "sketch" },
];

const METHODS: { label: string; value: MethodName }[] = [
  { label: "counted", value: "counts" },
  { label: "counted, weighted", value: "weighted-counts" },
  { label: "averaged", value: "average" },
  { label: "averaged, weighted", value: "weighted-average" },
  { label: "smooth weights", value: "smooth-weights" },
  { label: "smooth, direction out", value: "smooth-inverse-frequency" },
];

const PRESETS: Record<CorpusName, { label: string; texts: string[] }[]> = {
  documents: [
    {
      label: "two about sailing, one about cooking",
      texts: [
        "the crew and the boat and we sail",
        "the flour and the dough and we bake",
        "the wind and the tide and we anchor",
      ],
    },
    {
      label: "the same four words, two orders",
      texts: ["crew sail the boat", "boat sail the crew"],
    },
    {
      label: "a text about both halves",
      texts: [
        "the crew and the boat and the flour and the dough",
        "the crew and the boat and we sail",
        "the flour and the dough and we bake",
      ],
    },
    {
      label: "words never used here",
      texts: ["zebra kettle telescope", "the crew and the boat and we sail"],
    },
  ],
  sketch: [
    {
      label: "two about animals, one about finance",
      texts: ["the cat the dog", "the pet the cat", "the stock the bond"],
    },
    {
      label: "one document, four words",
      texts: ["the cat the dog"],
    },
  ],
};

export function PoolingWorkbench() {
  const [corpus, setCorpus] = useState<CorpusName>("documents");
  const [method, setMethod] = useState<MethodName>("average");
  const [texts, setTexts] = useState<string[]>(PRESETS.documents[0].texts);
  const [pooled, setPooled] = useState<Pooled | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setPooled(await poolTexts({ corpus, method, texts }));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [corpus, method, texts]);

  const chooseCorpus = (next: CorpusName) => {
    setCorpus(next);
    setTexts(PRESETS[next][0].texts);
  };

  const edit = (position: number, value: string) =>
    setTexts(texts.map((text, index) => (index === position ? value : text)));

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <Choice options={CORPORA} value={corpus} onChange={chooseCorpus} />
        <Choice options={METHODS} value={method} onChange={setMethod} />
      </div>

      <div className="mb-3 flex flex-wrap gap-1">
        {PRESETS[corpus].map((preset) => (
          <button
            key={preset.label}
            onClick={() => setTexts(preset.texts)}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {texts.map((text, position) => (
          <input
            key={position}
            value={text}
            maxLength={120}
            onChange={(event) => edit(position, event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 font-mono text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            aria-label={`text ${position + 1}`}
          />
        ))}
      </div>

      {!pooled ? (
        <div className="mt-3">
          <Waiting message={message} />
        </div>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="rule" value={METHOD_LABELS[pooled.method]} />
            <Stat label="numbers per text" value={String(pooled.dimension)} />
            <Stat
              label="closest pair"
              value={
                pooled.largest_similarity === null
                  ? "none"
                  : signed(pooled.largest_similarity)
              }
            />
            <Stat
              label="furthest pair"
              value={
                pooled.smallest_similarity === null
                  ? "none"
                  : signed(pooled.smallest_similarity)
              }
            />
          </div>

          <div className="mt-3 space-y-2">
            {pooled.texts.map((entry, position) => (
              <div
                key={position}
                className="rounded-lg border border-slate-200 p-2 dark:border-slate-800"
              >
                <div className="flex flex-wrap gap-1">
                  {entry.words.map((word, index) => (
                    <span
                      key={`${word}-${index}`}
                      className="rounded px-1.5 py-0.5 font-mono text-[11px]"
                      style={{
                        color: colourFor(
                          entry.shares[index]?.group ?? "shared",
                        ),
                        backgroundColor: "rgba(148,163,184,0.14)",
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
                <div className="mt-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {entry.vector.length > 8
                    ? `${entry.known_words} of ${entry.words.length} words have a place, in a list of ${entry.vector.length} numbers`
                    : `(${entry.vector.map((value) => value.toFixed(4)).join(", ")})`}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-1">
            {pooled.pairs.map((pair) => (
              <div
                key={`${pair.first}-${pair.second}`}
                className="flex items-center gap-2 text-xs"
              >
                <span className="w-24 shrink-0 font-mono text-slate-500 dark:text-slate-400">
                  {pair.first + 1} against {pair.second + 1}
                </span>
                <span className="flex h-2.5 flex-1 rounded bg-slate-100 dark:bg-slate-800">
                  <span
                    className="block h-2.5 rounded"
                    style={{
                      width: `${Math.max(0, Math.min(1, ((pair.similarity ?? 0) + 1) / 2)) * 100}%`,
                      backgroundColor:
                        (pair.similarity ?? 0) >= 0 ? "#6366f1" : "#ef4444",
                    }}
                  />
                </span>
                <span className="w-40 shrink-0 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {pair.similarity === null
                    ? "no direction to compare"
                    : signed(pair.similarity)}
                </span>
              </div>
            ))}
          </div>

          <Legend>
            The bar runs from a similarity of &minus;1 at the far left through
            zero at the middle to +1 at the far right, so a bar past halfway
            means the two texts point the same way. A word coloured grey carries
            no subject, and a word the collection never used is drawn grey too,
            since it has no place to read. Under either counting rule the list of
            numbers is as long as the vocabulary, so its width is reported
            instead of its contents.
          </Legend>
          {message && (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
}
