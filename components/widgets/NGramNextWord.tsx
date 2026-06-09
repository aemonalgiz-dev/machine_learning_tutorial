"use client";

// What the model says about the next word, for four contexts and two settings.
//
// Each bar is one word of the vocabulary and its height is the probability the
// model gives that word here, the ten likeliest drawn and the rest of the
// vocabulary left off the end. The readout underneath is how many bits the
// answer costs on average and how many equally likely words that is worth, so
// a certain answer and a flat one can be compared as numbers rather than by
// eye. The API fits and asks; the browser draws.

import { useEffect, useState } from "react";
import {
  ContextAnswer,
  SmoothingView,
  fetchSmoothing,
  messageFor,
} from "@/lib/concepts/n-grams";
import {
  ACTIVE_CLASS,
  BUTTON_CLASS,
  Stat,
  Word,
  readProbability,
  readStrength,
} from "./nGramParts";

const WIDTH = 640;
const HEIGHT = 240;
const PAD_LEFT = 44;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 58;

export function NGramNextWord() {
  const [view, setView] = useState<SmoothingView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [label, setLabel] = useState("after “the”");
  const [strength, setStrength] = useState(1.0);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchSmoothing());
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

  const labels = view.answers
    .map((answer) => answer.label)
    .filter((name, index, all) => all.indexOf(name) === index);
  const strengths = view.answers
    .map((answer) => answer.strength)
    .filter((value, index, all) => all.indexOf(value) === index);

  const answer: ContextAnswer =
    view.answers.find(
      (entry) => entry.label === label && entry.strength === strength,
    ) ?? view.answers[0];

  const tallest = Math.max(...answer.top.map((row) => row.probability), 1e-9);
  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const barWidth = (plotWidth / answer.top.length) * 0.68;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {labels.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setLabel(name)}
            className={label === name ? ACTIVE_CLASS : BUTTON_CLASS}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          pretending every word followed
        </span>
        {strengths.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStrength(value)}
            className={strength === value ? ACTIVE_CLASS : BUTTON_CLASS}
          >
            {readStrength(value)} times
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={PAD_LEFT}
          y1={HEIGHT - PAD_BOTTOM}
          x2={WIDTH - PAD_RIGHT}
          y2={HEIGHT - PAD_BOTTOM}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
        />
        <text
          x={PAD_LEFT - 6}
          y={PAD_TOP + 8}
          textAnchor="end"
          className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
        >
          {readProbability(tallest)}
        </text>
        {answer.top.map((row, index) => {
          const height = (row.probability / tallest) * plotHeight;
          const centre =
            PAD_LEFT + ((index + 0.5) / answer.top.length) * plotWidth;
          return (
            <g key={`${index}-${row.word}`}>
              <rect
                x={centre - barWidth / 2}
                y={HEIGHT - PAD_BOTTOM - height}
                width={barWidth}
                height={Math.max(height, 0.5)}
                fill="#6366f1"
                opacity={0.85}
              />
              <text
                x={centre}
                y={HEIGHT - PAD_BOTTOM + 14}
                textAnchor="end"
                transform={`rotate(-35 ${centre} ${HEIGHT - PAD_BOTTOM + 14})`}
                className="fill-slate-600 font-mono text-[10px] dark:fill-slate-300"
              >
                {row.word}
              </text>
            </g>
          );
        })}
        <text
          x={WIDTH - PAD_RIGHT}
          y={PAD_TOP + 8}
          textAnchor="end"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          the ten likeliest of {answer.n_words} words
        </text>
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          the context:
        </span>
        {answer.context.map((word, index) => (
          <Word key={`${index}-${word}`} text={word} />
        ))}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="times it stood before a word" value={answer.context_total} />
        <Stat label="different words that followed" value={answer.n_followers} />
        <Stat label="bits the next word costs" value={answer.entropy.toFixed(4)} />
        <Stat
          label="equally likely words that is"
          value={Math.pow(2, answer.entropy).toFixed(2)}
        />
      </div>
    </div>
  );
}
