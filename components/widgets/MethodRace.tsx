"use client";

// Two methods on the same marked-up sentences, scored the same way.
//
// The API generates a language with a fixed seed, fits both methods on the
// first two sentences of one corpus, then the first five, and so on, and scores
// each of them on the same two hundred held-out sentences with a word counting
// as found only when both its ends land where the sentence put them. The browser
// draws the two curves against a logarithmic count of sentences and prints the
// recall split by whether the word had been seen. What to look at is where the
// curves cross, and that they cross in opposite directions on the two languages.

import { useEffect, useState } from "react";
import {
  ComparisonView,
  LanguageRace,
  fetchComparison,
  languageFor,
  messageFor,
  percent,
} from "@/lib/concepts/learning-boundaries-from-examples";
import { Loading, Stat } from "./pointwiseParts";

const WIDTH = 660;
const HEIGHT = 280;
const PAD_LEFT = 46;
const PAD_RIGHT = 16;
const PAD_TOP = 14;
const PAD_BOTTOM = 42;

const SERIES = [
  { name: "one answer per gap", colour: "#0ea5e9" },
  { name: "the best whole sequence", colour: "#f43f5e" },
] as const;

function Curves({ language }: { language: LanguageRace }) {
  const steps = language.steps;
  const lowest = Math.log10(steps[0].n_sentences);
  const highest = Math.log10(steps[steps.length - 1].n_sentences);

  const x = (sentences: number) =>
    PAD_LEFT +
    ((Math.log10(sentences) - lowest) / (highest - lowest)) *
      (WIDTH - PAD_LEFT - PAD_RIGHT);
  const y = (score: number) =>
    HEIGHT - PAD_BOTTOM - score * (HEIGHT - PAD_TOP - PAD_BOTTOM);

  const values = [
    steps.map((step) => step.pointwise.f_measure),
    steps.map((step) => step.sequence.f_measure),
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
          marked-up sentences learned from
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

export function MethodRace({
  languageKeys = ["characters", "letters"],
}: {
  languageKeys?: string[];
}) {
  const [view, setView] = useState<ComparisonView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState(languageKeys[0]);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchComparison());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) {
    return <Loading message={message} />;
  }

  const language = languageFor(view, chosen);
  const [behind, ahead] = language.crosses_between;
  const last = language.steps[language.steps.length - 1];

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      {languageKeys.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {languageKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setChosen(key)}
              className={`rounded-md border px-3 py-1 text-left text-sm ${
                chosen === key
                  ? "border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
              }`}
            >
              {languageFor(view, key).label}
            </button>
          ))}
        </div>
      )}

      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        {language.n_words} words over {language.n_alphabet} characters, scored on
        the same {language.n_test_sentences} held-out sentences throughout, both
        methods handed the identical sentences at every size.
      </p>

      <Curves language={language} />

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
        <Stat
          label="one gap at a time takes the lead between"
          value={ahead === 0 ? "never here" : `${behind} and ${ahead}`}
        />
        <Stat
          label="at the end, one gap at a time"
          value={last.pointwise.f_measure.toFixed(4)}
        />
        <Stat
          label="at the end, the whole sequence"
          value={last.sequence.f_measure.toFixed(4)}
        />
        <Stat
          label="held-out words that are new, at the end"
          value={percent(last.share_unseen)}
        />
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {[
                "sentences",
                "marked gaps",
                "one gap, on words it was shown",
                "sequence, on words it was shown",
                "one gap, on words it was not",
                "sequence, on words it was not",
              ].map((heading) => (
                <th
                  key={heading}
                  className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {language.steps.map((step) => (
              <tr
                key={step.n_sentences}
                className="border-b border-slate-100 font-mono last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1 pr-3">{step.n_sentences}</td>
                <td className="py-1 pr-3">{step.n_marked_gaps}</td>
                <td className="py-1 pr-3">
                  {step.pointwise.recall_on_seen.toFixed(4)}
                </td>
                <td className="py-1 pr-3">
                  {step.sequence.recall_on_seen.toFixed(4)}
                </td>
                <td className="py-1 pr-3">
                  {step.share_unseen === 0
                    ? "none left"
                    : step.pointwise.recall_on_unseen.toFixed(4)}
                </td>
                <td className="py-1 pr-3">
                  {step.share_unseen === 0
                    ? "none left"
                    : step.sequence.recall_on_unseen.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
