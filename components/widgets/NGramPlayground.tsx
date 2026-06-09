"use client";

// One sentence read by one model, with every step of the reading shown.
//
// Type a sentence, choose how many words the model reads back and how much it
// pretends to have seen, and the table underneath is the whole calculation: at
// each position, what the counts said, and what probability came out of them.
// The two things worth playing with are the button that turns the pretending
// off, which makes almost any sentence impossible, and the widest window, which
// makes almost every count a one. The drawn sentence at the bottom is the same
// model asked to write instead of to read. The API fits, reads and draws; the
// browser lays it out.

import { useEffect, useState } from "react";
import {
  FitView,
  RuleChoice,
  messageFor,
  readOneText,
} from "@/lib/concepts/n-grams";
import {
  ACTIVE_CLASS,
  BUTTON_CLASS,
  Stat,
  Word,
  Words,
  readPerplexity,
  readProbability,
  readStrength,
} from "./nGramParts";

const RUNNING_SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";
const STRENGTHS = [0.001, 0.005, 0.02, 0.1, 0.5, 1, 2];
const ORDERS = [1, 2, 3, 4, 5, 6];
const DEBOUNCE_MS = 220;

export function NGramPlayground() {
  const [text, setText] = useState(RUNNING_SENTENCE);
  const [order, setOrder] = useState(2);
  const [rule, setRule] = useState<RuleChoice>("add_a_constant");
  const [strengthIndex, setStrengthIndex] = useState(1);
  const [seed, setSeed] = useState(0);
  const [view, setView] = useState<FitView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const strength = STRENGTHS[strengthIndex];

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const answer = await readOneText(order, rule, strength, text, seed);
        if (cancelled) return;
        setView(answer);
        setMessage(null);
      } catch (error) {
        if (cancelled) return;
        setMessage(messageFor(error));
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, order, rule, strength, seed]);

  return (
    <div>
      <label
        className="mb-1 block text-xs text-slate-500 dark:text-slate-400"
        htmlFor="n-gram-text"
      >
        A sentence for the model to read
      </label>
      <input
        id="n-gram-text"
        type="text"
        value={text}
        maxLength={200}
        onChange={(event) => setText(event.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          words in each window
        </span>
        {ORDERS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setOrder(value)}
            className={order === value ? ACTIVE_CLASS : BUTTON_CLASS}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setRule("counts_as_they_stand")}
          className={
            rule === "counts_as_they_stand" ? ACTIVE_CLASS : BUTTON_CLASS
          }
        >
          Counts as they stand
        </button>
        <button
          type="button"
          onClick={() => setRule("add_a_constant")}
          className={rule === "add_a_constant" ? ACTIVE_CLASS : BUTTON_CLASS}
        >
          Pretend every word followed
        </button>
        {rule === "add_a_constant" && (
          <span className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={STRENGTHS.length - 1}
              step={1}
              value={strengthIndex}
              onChange={(event) => setStrengthIndex(Number(event.target.value))}
              className="w-40"
              aria-label="how many times every word is pretended to have followed"
            />
            <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
              {readStrength(strength)} times
            </span>
          </span>
        )}
      </div>

      {message && (
        <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/60 dark:bg-amber-950/30 dark:text-amber-200">
          {message}
        </p>
      )}

      {!view ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">…</p>
      ) : (
        <div className="mt-4">
          <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
            The sentence as the model reads it, with its edges put in and every
            word it was never taught replaced.
          </p>
          <Words words={view.framed} />

          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                  <th className="py-1.5 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    reading back
                  </th>
                  <th className="py-1.5 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    predicting
                  </th>
                  <th className="py-1.5 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    times seen
                  </th>
                  <th className="py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    probability
                  </th>
                </tr>
              </thead>
              <tbody>
                {view.steps.map((step, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                  >
                    <td className="py-1.5 pr-4">
                      <Words
                        words={step.context === "" ? [] : step.context.split(" ")}
                        tone="muted"
                      />
                    </td>
                    <td className="py-1.5 pr-4">
                      <Word text={step.word} tone="learned" />
                    </td>
                    <td className="py-1.5 pr-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {step.count} of {step.context_total}
                    </td>
                    <td
                      className={`py-1.5 font-mono text-xs ${step.probability === 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-slate-200"}`}
                    >
                      {readProbability(step.probability)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="perplexity" value={readPerplexity(view.perplexity)} />
            <Stat
              label="bits per word"
              value={
                view.cross_entropy === null
                  ? "unbounded"
                  : view.cross_entropy.toFixed(3)
              }
            />
            <Stat
              label="words it was never taught"
              value={`${view.n_unknown} of ${view.n_predicted}`}
            />
            <Stat
              label="runs it never counted"
              value={`${view.n_unseen_runs} of ${view.steps.length}`}
            />
          </div>

          <p className="mt-4 mb-1 text-xs text-slate-500 dark:text-slate-400">
            The same model asked to write a sentence rather than score one.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              {view.generated.join(" ") || "(it stopped straight away)"}
            </p>
            <button
              type="button"
              onClick={() => setSeed((current) => current + 1)}
              className={BUTTON_CLASS}
            >
              Draw again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
