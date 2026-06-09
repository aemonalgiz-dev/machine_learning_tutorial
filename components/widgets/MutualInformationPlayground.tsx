"use client";

// The whole method, end to end, on the twenty-four documents.
//
// Five settings decide how far a word's context reaches, how much the context
// rates are flattened, how much is taken off every score before it is clipped,
// how many numbers a word ends up with and how the sizes of the kept
// directions are folded into them. The readouts say how much of the table
// survived, how far the two topics came apart and what the nearest words are.
// The API counts, scores, decomposes and measures; the browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  MutualInformationFit,
  fitScores,
} from "@/lib/concepts/pointwise-mutual-information";
import {
  ACCENT,
  Choice,
  Legend,
  Slider,
  Stat,
  Waiting,
  colourFor,
} from "./mutualInformationShared";

const WORDS = [
  { label: "flour", value: "flour" },
  { label: "rope", value: "rope" },
  { label: "and", value: "and" },
  { label: "oven", value: "oven" },
];

export function MutualInformationPlayground() {
  const [window_, setWindow] = useState(5);
  const [dimension, setDimension] = useState(4);
  const [smoothing, setSmoothing] = useState(0.75);
  const [shift, setShift] = useState(0);
  const [exponent, setExponent] = useState(0.5);
  const [word, setWord] = useState("flour");
  const [fit, setFit] = useState<MutualInformationFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fitScores({
          window: window_,
          dimension,
          contextSmoothing: smoothing,
          shift,
          singularValueExponent: exponent,
          word,
          nNeighbours: 6,
        });
        if (!cancelled) {
          setFit(next);
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
  }, [window_, dimension, smoothing, shift, exponent, word]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Slider
          label="how far a word’s context reaches"
          value={window_}
          minimum={1}
          maximum={8}
          step={1}
          format={(value) => `${value} either side`}
          onChange={setWindow}
        />
        <Slider
          label="how many numbers a word gets"
          value={dimension}
          minimum={2}
          maximum={12}
          step={1}
          format={(value) => String(value)}
          onChange={setDimension}
        />
        <Slider
          label="flattening the context rates"
          value={smoothing}
          minimum={0.25}
          maximum={1}
          step={0.05}
          format={(value) => (value === 1 ? "none" : value.toFixed(2))}
          onChange={setSmoothing}
        />
        <Slider
          label="taken off before the clip"
          value={shift}
          minimum={0}
          maximum={1.8}
          step={0.1}
          format={(value) => value.toFixed(1)}
          onChange={setShift}
        />
        <Slider
          label="how much the direction sizes count"
          value={exponent}
          minimum={0}
          maximum={1}
          step={0.25}
          format={(value) => value.toFixed(2)}
          onChange={setExponent}
        />
        <div className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-300">
          <span>the word to look around</span>
          <Choice options={WORDS} value={word} onChange={setWord} accent={ACCENT} />
        </div>
      </div>

      {!fit ? (
        <div className="mt-4">
          <Waiting message={message} />
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="scores kept above zero" value={String(fit.n_kept)} />
            <Stat label="cells left at zero" value={String(fit.n_zero)} />
            <Stat
              label="two words of one topic, on average"
              value={fit.within_topic === null ? "none" : fit.within_topic.toFixed(4)}
            />
            <Stat
              label="a word of each topic, on average"
              value={fit.across_topic === null ? "none" : fit.across_topic.toFixed(4)}
            />
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat
              label="numbers in the table"
              value={String(fit.numbers_in_the_table)}
            />
            <Stat
              label="numbers in the answer"
              value={String(fit.numbers_in_the_vectors)}
            />
            <Stat
              label="how much of the table is lost"
              value={fit.reconstruction_error.toFixed(4)}
            />
            <Stat label="seconds" value={fit.seconds.toFixed(3)} />
          </div>

          <div className="mt-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              nearest words to {word}
            </p>
            <p className="mt-1 flex flex-wrap gap-3 font-mono text-xs">
              {fit.neighbours.length === 0 ? (
                <span className="text-slate-500 dark:text-slate-400">
                  nothing to report
                </span>
              ) : (
                fit.neighbours.map((near) => (
                  <span key={near.word} style={{ color: colourFor(near.topic) }}>
                    {near.word} {near.similarity.toFixed(4)}
                  </span>
                ))
              )}
            </p>
          </div>

          {fit.note && (
            <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              {fit.note}
            </p>
          )}
        </>
      )}

      <Legend>
        Amber words come from the cooking half, blue from the sailing half and
        grey are the three both halves use. Push the fourth slider past 1.6 and
        the whole table goes to zero, which is worth doing once.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
