"use client";

// How well each method reads held-out sentences, against how many tagged
// sentences it was given.
//
// The API generates one language with a fixed seed, fits both methods on the
// first two sentences of a training corpus, then the first five, and so on,
// scores each of them on the same two hundred held-out sentences, and reports
// precision and recall over word spans. The browser draws the three curves
// against a logarithmic count of sentences. The crossing is the whole point: one
// method is ahead while most of the held-out words are new and the other is
// ahead once almost none of them are.

import { useEffect, useState } from "react";
import {
  ScaleCorpus,
  ScaleView,
  corpusFor,
  fetchScale,
  messageFor,
  percent,
} from "@/lib/concepts/segmenting-with-a-hidden-model";
import { Loading, Stat, WordsRow } from "./hiddenModelParts";

const WIDTH = 660;
const HEIGHT = 280;
const PAD_LEFT = 46;
const PAD_RIGHT = 16;
const PAD_TOP = 14;
const PAD_BOTTOM = 42;

const SERIES = [
  { name: "the places, learned from the tagging", colour: "#0ea5e9" },
  { name: "a word list counted from the same sentences", colour: "#f43f5e" },
  { name: "the list with the places filling its gaps", colour: "#10b981" },
] as const;

function Curves({ corpus }: { corpus: ScaleCorpus }) {
  const steps = corpus.steps;
  const lowest = Math.log10(steps[0].n_sentences);
  const highest = Math.log10(steps[steps.length - 1].n_sentences);

  const x = (sentences: number) =>
    PAD_LEFT +
    ((Math.log10(sentences) - lowest) / (highest - lowest)) *
      (WIDTH - PAD_LEFT - PAD_RIGHT);
  const y = (score: number) =>
    HEIGHT - PAD_BOTTOM - score * (HEIGHT - PAD_TOP - PAD_BOTTOM);

  const values = [
    steps.map((step) => step.tagger.f_measure),
    steps.map((step) => step.word_list.f_measure),
    steps.map((step) => step.together.f_measure),
  ];

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ minWidth: "440px" }}
        className="w-full select-none rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((mark) => (
          <g key={`mark-${mark}`}>
            <line
              x1={PAD_LEFT}
              y1={y(mark)}
              x2={WIDTH - PAD_RIGHT}
              y2={y(mark)}
              stroke="currentColor"
              strokeWidth={0.5}
              opacity={0.2}
            />
            <text
              x={PAD_LEFT - 8}
              y={y(mark) + 3}
              textAnchor="end"
              fontSize={9}
              fill="currentColor"
            >
              {mark.toFixed(2)}
            </text>
          </g>
        ))}
        {steps.map((step) => (
          <text
            key={`tick-${step.n_sentences}`}
            x={x(step.n_sentences)}
            y={HEIGHT - PAD_BOTTOM + 15}
            textAnchor="middle"
            fontSize={9}
            fill="currentColor"
          >
            {step.n_sentences}
          </text>
        ))}
        <text
          x={(WIDTH + PAD_LEFT) / 2}
          y={HEIGHT - 8}
          textAnchor="middle"
          fontSize={10}
          fill="currentColor"
        >
          tagged sentences learned from
        </text>
        {SERIES.map((line, index) => (
          <g key={line.name}>
            <polyline
              points={steps
                .map(
                  (step, position) =>
                    `${x(step.n_sentences)},${y(values[index][position])}`,
                )
                .join(" ")}
              fill="none"
              stroke={line.colour}
              strokeWidth={2}
            />
            {steps.map((step, position) => (
              <circle
                key={`${line.name}-${step.n_sentences}`}
                cx={x(step.n_sentences)}
                cy={y(values[index][position])}
                r={3}
                fill={line.colour}
              >
                <title>
                  {`${line.name}, at ${step.n_sentences} sentences: ${values[
                    index
                  ][position].toFixed(4)}`}
                </title>
              </circle>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}

export function CorpusSizeCurve({
  corpusKeys = ["characters", "letters"],
}: {
  corpusKeys?: string[];
}) {
  const [view, setView] = useState<ScaleView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState(corpusKeys[0]);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchScale());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) {
    return <Loading message={message} />;
  }

  const corpus = corpusFor(view, chosen);
  const [low, high] = corpus.turns_between;
  const first = corpus.steps[0];
  const last = corpus.steps[corpus.steps.length - 1];

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      {corpusKeys.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {corpusKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setChosen(key)}
              className={`rounded-md border px-3 py-1 text-sm ${
                chosen === key
                  ? "border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
              }`}
            >
              {corpusFor(view, key).label}
            </button>
          ))}
        </div>
      )}

      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        {corpus.n_words} words over {corpus.n_alphabet} characters, scored on the
        same {corpus.n_test_sentences} held-out sentences throughout. A word
        counts as found only when both its ends land where the sentence put them.
      </p>

      <Curves corpus={corpus} />

      <div className="mt-3 flex flex-wrap gap-4">
        {SERIES.map((line) => (
          <span
            key={line.name}
            className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
          >
            <span
              className="inline-block h-2 w-4 rounded"
              style={{ backgroundColor: line.colour }}
            />
            {line.name}
          </span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="the two cross between" value={`${low} and ${high}`} />
        <Stat
          label="new words at the crossing"
          value={percent(
            (corpus.steps.find((step) => step.n_sentences === low) ?? first)
              .share_unseen,
          )}
        />
        <Stat label="new words at the end" value={percent(last.share_unseen)} />
        <Stat
          label="a character settles"
          value={`${corpus.bits_told.toFixed(4)} of ${corpus.tag_bits.toFixed(4)} bits`}
        />
      </div>

      <p className="mt-3 mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        One held-out sentence, at{" "}
        {corpus.steps[Math.floor(corpus.steps.length / 3)].n_sentences}{" "}
        sentences learned from
      </p>
      <p className="mb-1 font-mono text-sm break-all text-slate-900 dark:text-slate-100">
        {corpus.example_text}
      </p>
      <div className="space-y-1">
        <WordsRow
          words={corpus.example_truth}
          known={new Set(corpus.example_truth)}
        />
        <WordsRow
          words={corpus.example_from_the_tagger}
          known={new Set(corpus.example_truth)}
        />
        <WordsRow
          words={corpus.example_from_a_word_list}
          known={new Set(corpus.example_truth)}
        />
      </div>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        The sentence as written, then the places, then the word list. Blue is a
        piece the sentence really contains and amber is one it does not.
      </p>
    </div>
  );
}
