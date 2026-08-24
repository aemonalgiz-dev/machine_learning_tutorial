"use client";

// A whole fit of the two-list corpus with the pieces switched on, and any word
// at all looked up in it afterwards.
//
// The reader sets how short and how long a piece may be, how many rows the
// pieces share, how many passes and how large a first step, then asks for any
// word, whether the corpus held it or not. What comes back is the objective
// falling, the two mean cosines that say whether the lists came apart, the
// word's own pieces with the ones that reach a trained row marked, and the
// words that ended up nearest it. The API fits and measures; the browser draws.

import { FormEvent, useEffect, useState } from "react";
import {
  ApiError,
  FasttextFit,
  fitFasttext,
} from "@/lib/concepts/fasttext";
import {
  Legend,
  MONEY,
  NeighbourBars,
  Stat,
  VERB,
  Waiting,
  WordChoice,
} from "./fasttextShared";

const CURVE = { width: 640, height: 170 };
const PAD = { left: 52, right: 16, top: 16, bottom: 32 };

const WORDS = ["playing", "walked", "market", "banking", "walkway", "queue", "zap"];

export function FasttextPlayground() {
  const [minimumLength, setMinimumLength] = useState(3);
  const [maximumLength, setMaximumLength] = useState(6);
  const [nBuckets, setNBuckets] = useState(2000);
  const [epochs, setEpochs] = useState(5);
  const [learningRate, setLearningRate] = useState(0.025);
  const [word, setWord] = useState("playing");
  const [typed, setTyped] = useState("");
  const [fit, setFit] = useState<FasttextFit | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBusy(true);
      try {
        const next = await fitFasttext({
          minimumLength,
          maximumLength: Math.max(minimumLength, maximumLength),
          nBuckets,
          epochs,
          learningRate,
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
  }, [minimumLength, maximumLength, nBuckets, epochs, learningRate, word]);

  function lookUp(event: FormEvent) {
    event.preventDefault();
    const wanted = typed.trim().toLowerCase();
    if (wanted) setWord(wanted);
  }

  if (!fit) return <Waiting message={message} />;

  const losses = fit.epochs.map((entry) => entry.mean_loss);
  const top = Math.max(...losses) * 1.05;
  const bottom = Math.min(...losses) * 0.95;
  const innerWidth = CURVE.width - PAD.left - PAD.right;
  const innerHeight = CURVE.height - PAD.top - PAD.bottom;
  const curveX = (index: number) =>
    PAD.left +
    (losses.length === 1 ? innerWidth / 2 : (index / (losses.length - 1)) * innerWidth);
  const curveY = (loss: number) =>
    PAD.top + (1 - (loss - bottom) / (top - bottom || 1)) * innerHeight;
  const path = losses
    .map((loss, index) => `${index === 0 ? "M" : "L"}${curveX(index)},${curveY(loss)}`)
    .join(" ");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          shortest piece
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
          longest piece
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
        <label className="flex items-center gap-2">
          rows for the pieces
          <select
            value={nBuckets}
            onChange={(event) => setNBuckets(Number(event.target.value))}
            className="rounded border border-slate-300 bg-white px-1 py-0.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
          >
            {[10, 50, 200, 2000, 20000].map((size) => (
              <option key={size} value={size}>
                {size.toLocaleString()}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          passes
          <input
            type="range"
            min={1}
            max={6}
            step={1}
            value={epochs}
            onChange={(event) => setEpochs(Number(event.target.value))}
            className="w-20 accent-indigo-600"
          />
          <span className="w-4 text-right font-mono">{epochs}</span>
        </label>
        <label className="flex items-center gap-2">
          first step
          <input
            type="range"
            min={0.01}
            max={0.1}
            step={0.005}
            value={learningRate}
            onChange={(event) => setLearningRate(Number(event.target.value))}
            className="w-24 accent-indigo-600"
          />
          <span className="w-12 text-right font-mono">{learningRate.toFixed(3)}</span>
        </label>
      </div>

      <svg
        viewBox={`0 0 ${CURVE.width} ${CURVE.height}`}
        className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        style={{ opacity: busy ? 0.45 : 1 }}
      >
        <path d={path} fill="none" stroke="#10b981" strokeWidth={2} />
        {losses.map((loss, index) => (
          <g key={index}>
            <circle cx={curveX(index)} cy={curveY(loss)} r={4} fill="#10b981" />
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
        <text
          x={PAD.left - 6}
          y={PAD.top + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
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
        <Stat label="alike, same list" value={fit.within_topic.toFixed(4)} />
        <Stat label="alike, across lists" value={fit.across_topic.toFixed(4)} />
        <Stat
          label="pieces the corpus owns"
          value={fit.n_distinct_pieces.toLocaleString()}
        />
        <Stat label="rows they land in" value={fit.n_distinct_rows.toLocaleString()} />
      </div>

      <form onSubmit={lookUp} className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-600 dark:text-slate-300">nearest to</span>
        <WordChoice words={WORDS} value={fit.word} onChange={setWord} />
        <input
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          placeholder="or any word"
          className="w-32 rounded border border-slate-300 bg-white px-2 py-0.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          type="submit"
          className="rounded border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          look it up
        </button>
      </form>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {fit.word_seen
          ? `${fit.word} appears in the corpus, so it has a row of its own as well as its ${fit.n_word_pieces} pieces.`
          : `${fit.word} appears in no sentence, so its answer is its ${fit.n_word_pieces} pieces alone, ${fit.shared_buckets} of which reach a row some corpus word wrote to.`}
      </p>

      <div className="mt-2 flex flex-wrap gap-1">
        {fit.word_pieces.map((piece) => (
          <span
            key={piece}
            className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            {piece}
          </span>
        ))}
      </div>

      {fit.word_refusal ? (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {fit.word_refusal}
        </p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat label="mean cosine to the verb forms" value={fit.mean_to_verbs.toFixed(4)} />
            <Stat label="mean cosine to the money words" value={fit.mean_to_money.toFixed(4)} />
          </div>
          <div className="mt-3">
            <NeighbourBars entries={fit.neighbours} />
          </div>
        </>
      )}

      <Legend>
        {fit.n_sentences} sentences, {fit.n_occurrences.toLocaleString()} word
        occurrences and {fit.n_words} distinct words, half the sentences drawn from a
        list of verb forms (<span style={{ color: VERB }}>indigo</span>) and half from
        a list of words about money (<span style={{ color: MONEY }}>amber</span>).
        Nothing told the fit which list a word came from, so a neighbour in the other
        colour is the spelling leading somewhere the corpus did not.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
