"use client";

// A whole fit of the two-list corpus, run on request, with the dials that
// matter exposed.
//
// The reader picks which side predicts which, how the answer is scored, how
// far the window reaches, how many passes and how large a first step, and gets
// back the objective falling pass by pass, the two mean cosines that say
// whether the lists came apart, and the words that ended up nearest whichever
// one is chosen. The API fits and measures; the browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  ArchitectureName,
  ObjectiveName,
  Word2vecFit,
  fitWord2vec,
} from "@/lib/concepts/word2vec";
import { Choice, FALLING, Legend, MONEY, Stat, VERB, Waiting, colourFor } from "./word2vecShared";

const CURVE = { width: 640, height: 180 };
const PAD = { left: 52, right: 16, top: 16, bottom: 32 };

const WORDS = ["walked", "talking", "play", "market", "bond", "yield", "saying"];

export function Word2vecPlayground() {
  const [architecture, setArchitecture] = useState<ArchitectureName>("skip-gram");
  const [objective, setObjective] = useState<ObjectiveName>("negative-sampling");
  const [learningRate, setLearningRate] = useState(0.05);
  const [epochs, setEpochs] = useState(5);
  const [window, setWindow] = useState(3);
  const [word, setWord] = useState("walked");
  const [fit, setFit] = useState<Word2vecFit | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBusy(true);
      try {
        const next = await fitWord2vec({
          architecture,
          objective,
          learningRate,
          epochs,
          window,
          word,
          nNeighbours: 8,
        });
        if (!cancelled) {
          setFit(next);
          setMessage(null);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [architecture, objective, learningRate, epochs, window, word]);

  if (!fit) return <Waiting message={message} />;

  const losses = fit.epochs.map((entry) => entry.mean_loss);
  const top = Math.max(...losses) * 1.05;
  const bottom = Math.min(...losses) * 0.95;
  const innerWidth = CURVE.width - PAD.left - PAD.right;
  const innerHeight = CURVE.height - PAD.top - PAD.bottom;
  const curveX = (index: number) =>
    PAD.left + (losses.length === 1 ? innerWidth / 2 : (index / (losses.length - 1)) * innerWidth);
  const curveY = (loss: number) =>
    PAD.top + (1 - (loss - bottom) / (top - bottom || 1)) * innerHeight;
  const path = losses
    .map((loss, index) => `${index === 0 ? "M" : "L"}${curveX(index)},${curveY(loss)}`)
    .join(" ");
  const strongest = Math.max(...fit.neighbours.map((entry) => entry.similarity), 0.001);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <Choice
          options={[
            { label: "skip-gram", value: "skip-gram" as ArchitectureName },
            { label: "bag of words", value: "bag-of-words" as ArchitectureName },
          ]}
          value={architecture}
          onChange={setArchitecture}
        />
        <Choice
          options={[
            { label: "negative sampling", value: "negative-sampling" as ObjectiveName },
            { label: "a tree", value: "tree" as ObjectiveName },
          ]}
          value={objective}
          onChange={setObjective}
          accent={MONEY}
        />
        <label className="flex items-center gap-2">
          first step
          <input
            type="range"
            min={0.01}
            max={0.15}
            step={0.005}
            value={learningRate}
            onChange={(event) => setLearningRate(Number(event.target.value))}
            className="w-28 accent-indigo-600"
          />
          <span className="w-12 text-right font-mono">{learningRate.toFixed(3)}</span>
        </label>
        <label className="flex items-center gap-2">
          passes
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={epochs}
            onChange={(event) => setEpochs(Number(event.target.value))}
            className="w-24 accent-indigo-600"
          />
          <span className="w-4 text-right font-mono">{epochs}</span>
        </label>
        <label className="flex items-center gap-2">
          reach
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={window}
            onChange={(event) => setWindow(Number(event.target.value))}
            className="w-20 accent-indigo-600"
          />
          <span className="w-4 text-right font-mono">{window}</span>
        </label>
      </div>

      <svg
        viewBox={`0 0 ${CURVE.width} ${CURVE.height}`}
        className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        style={{ opacity: busy ? 0.45 : 1 }}
      >
        <path d={path} fill="none" stroke={FALLING} strokeWidth={2} />
        {losses.map((loss, index) => (
          <g key={index}>
            <circle cx={curveX(index)} cy={curveY(loss)} r={4} fill={FALLING} />
            <text
              x={curveX(index)}
              y={CURVE.height - PAD.bottom + 14}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {index + 1}
            </text>
          </g>
        ))}
        <text x={PAD.left - 6} y={PAD.top + 4} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">
          {top.toFixed(2)}
        </text>
        <text
          x={PAD.left - 6}
          y={CURVE.height - PAD.bottom + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          {bottom.toFixed(2)}
        </text>
        <text
          x={PAD.left + innerWidth / 2}
          y={CURVE.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          mean cost per training pair, against the pass number
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="near each other, same list" value={fit.within_topic.toFixed(4)} />
        <Stat label="near each other, across lists" value={fit.across_topic.toFixed(4)} />
        <Stat label="training pairs seen" value={fit.total_pairs.toLocaleString()} />
        <Stat label="numbers in the answer" value={fit.kept_numbers.toString()} />
      </div>

      <div className="mt-3">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span>nearest to</span>
          <span className="flex flex-wrap gap-1">
            {WORDS.map((choice) => (
              <button
                key={choice}
                onClick={() => setWord(choice)}
                style={choice === word ? { backgroundColor: "#334155", color: "white" } : undefined}
                className={
                  "rounded px-2 py-0.5 font-mono text-xs transition " +
                  (choice === word
                    ? ""
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
                }
              >
                {choice}
              </button>
            ))}
          </span>
        </div>
        <div className="space-y-1">
          {fit.neighbours.map((entry) => (
            <div key={entry.word} className="flex items-center gap-2">
              <span className="w-20 shrink-0 font-mono text-xs text-slate-700 dark:text-slate-300">
                {entry.word}
              </span>
              <span className="h-3 flex-1 rounded bg-slate-100 dark:bg-slate-800">
                <span
                  className="block h-3 rounded"
                  style={{
                    width: `${Math.max(2, (entry.similarity / strongest) * 100)}%`,
                    backgroundColor: colourFor(entry.topic),
                  }}
                />
              </span>
              <span className="w-14 shrink-0 text-right font-mono text-xs text-slate-500 dark:text-slate-400">
                {entry.similarity.toFixed(3)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Legend>
        {fit.n_sentences} sentences, {fit.n_occurrences.toLocaleString()} word
        occurrences and {fit.n_words} distinct words, half the sentences drawn
        from a list of verb forms (
        <span style={{ color: VERB }}>indigo</span>) and half from a list of
        words about money (<span style={{ color: MONEY }}>amber</span>). Nothing
        told the fit which list a word came from, so a neighbour in the other
        colour is the fit getting it wrong.
      </Legend>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
