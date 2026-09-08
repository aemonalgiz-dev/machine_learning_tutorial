"use client";

// The playground: count a text as a Markov chain and ask it the page's questions.
//
// Pick a text and an alphabet, and the API counts every step, divides each row
// by its total, and then asks the table what the page asks of it: where a walk
// is after some number of steps from each start, how far that is from where it
// settles, where it settles against how often each state occurs in the text,
// and whether what the table says two steps ahead is what the text itself does
// two steps apart. The ideal case is text the chain wrote itself, where the
// one-step assumption is true by construction and that last check comes out
// close to zero. The API counts, divides and walks; the browser draws.

import { useEffect, useState } from "react";
import {
  Alphabet,
  FitView,
  Source,
  countOneText,
  messageFor,
} from "@/lib/concepts/markov-chains";
import {
  ALICE_CALLING_HER_CAT,
  ALICE_SENTENCE_COUNT,
  PLAYGROUND_MAX_STEPS,
  PLAYGROUND_SMOOTHINGS,
  RUN_LENGTH,
} from "./markovChainsFixtures";
import {
  ACTIVE_CLASS,
  BUTTON_CLASS,
  Grid,
  Heatmap,
  INDIGO,
  SLATE,
  Stat,
  TwoStateDiagram,
  readProbability,
  stateMark,
  stateName,
} from "./markovParts";

const DEBOUNCE_MS = 220;
const PREVIEW_LENGTH = 320;

export function MarkovPlayground() {
  const [source, setSource] = useState<Source>("counted_chapters");
  const [typed, setTyped] = useState(ALICE_CALLING_HER_CAT);
  const [aliceStart, setAliceStart] = useState(0);
  const [alphabet, setAlphabet] = useState<Alphabet>("vowels_and_consonants");
  const [smoothingIndex, setSmoothingIndex] = useState(0);
  const [nSteps, setNSteps] = useState(2);
  const [seed, setSeed] = useState(0);
  const [view, setView] = useState<FitView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const smoothing = PLAYGROUND_SMOOTHINGS[smoothingIndex];

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const answer = await countOneText({
          source,
          text: typed,
          alice_start: aliceStart,
          alphabet,
          smoothing,
          n_steps: nSteps,
          random_seed: seed,
        });
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
  }, [source, typed, aliceStart, alphabet, smoothing, nSteps, seed]);

  const pickRun = () => {
    setAliceStart(
      Math.floor(Math.random() * (ALICE_SENTENCE_COUNT - RUN_LENGTH + 1)),
    );
    setSource("alice_run");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSource("counted_chapters")}
          className={source === "counted_chapters" ? ACTIVE_CLASS : BUTTON_CLASS}
        >
          The first two chapters
        </button>
        <button
          type="button"
          onClick={() => setSource("written_by_the_chain")}
          className={
            source === "written_by_the_chain" ? ACTIVE_CLASS : BUTTON_CLASS
          }
        >
          An Ideal Case
        </button>
        <button
          type="button"
          onClick={pickRun}
          className={source === "alice_run" ? ACTIVE_CLASS : BUTTON_CLASS}
        >
          Six sentences at random
        </button>
        <button
          type="button"
          onClick={() => {
            setTyped(ALICE_CALLING_HER_CAT);
            setSource("typed");
          }}
          className={
            source === "typed" && typed === ALICE_CALLING_HER_CAT
              ? ACTIVE_CLASS
              : BUTTON_CLASS
          }
        >
          Alice calling her cat
        </button>
      </div>

      <label
        className="mt-3 mb-1 block text-xs text-slate-500 dark:text-slate-400"
        htmlFor="markov-text"
      >
        Or type a text of your own, and each sentence is counted on its own
      </label>
      <textarea
        id="markov-text"
        value={typed}
        rows={2}
        maxLength={4000}
        onChange={(event) => {
          setTyped(event.target.value);
          setSource("typed");
        }}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setAlphabet("vowels_and_consonants")}
          className={
            alphabet === "vowels_and_consonants" ? ACTIVE_CLASS : BUTTON_CLASS
          }
        >
          Vowels and consonants
        </button>
        <button
          type="button"
          onClick={() => setAlphabet("letters")}
          className={alphabet === "letters" ? ACTIVE_CLASS : BUTTON_CLASS}
        >
          Every letter and the space
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          smoothing
          <input
            type="range"
            min={0}
            max={PLAYGROUND_SMOOTHINGS.length - 1}
            step={1}
            value={smoothingIndex}
            onChange={(event) => setSmoothingIndex(Number(event.target.value))}
            className="w-32"
          />
          <span className="font-mono text-slate-700 dark:text-slate-300">
            {smoothing === 0 ? "none" : `${smoothing} per cell`}
          </span>
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          steps ahead
          <input
            type="range"
            min={0}
            max={PLAYGROUND_MAX_STEPS}
            step={1}
            value={nSteps}
            onChange={(event) => setNSteps(Number(event.target.value))}
            className="w-32"
          />
          <span className="font-mono text-slate-700 dark:text-slate-300">
            {nSteps}
          </span>
        </label>
      </div>

      {message && (
        <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/60 dark:bg-amber-950/30 dark:text-amber-200">
          {message}
        </p>
      )}

      {!view ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">…</p>
      ) : (
        <Counted view={view} onDraw={() => setSeed((current) => current + 1)} />
      )}
    </div>
  );
}

function Counted({ view, onDraw }: { view: FitView; onDraw: () => void }) {
  const twoStates = view.alphabet === "vowels_and_consonants";
  const preview =
    view.source === "typed"
      ? null
      : view.shown.length > PREVIEW_LENGTH
        ? `${view.shown.slice(0, PREVIEW_LENGTH)}…`
        : view.shown;

  return (
    <div className="mt-4 space-y-4">
      {preview && (
        <p className="break-words rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
          {preview}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="symbols counted" value={view.n_symbols.toLocaleString()} />
        <Stat
          label="steps counted"
          value={view.n_steps_counted.toLocaleString()}
        />
        <Stat label="sequences, each counted apart" value={view.n_sequences} />
        <Stat
          label="two steps on, table against text"
          value={view.two_step_gap === null ? "…" : view.two_step_gap.toFixed(4)}
        />
      </div>

      {view.table === null ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/60 dark:bg-amber-950/30 dark:text-amber-200">
          {view.table_note}
        </p>
      ) : twoStates ? (
        <div className="flex flex-wrap items-start gap-4">
          <Grid
            title="steps counted"
            states={view.states}
            rows={view.counts}
            read={(value) => value.toLocaleString()}
          />
          <Grid
            title="each row divided by its total"
            states={view.states}
            rows={view.table}
            read={readProbability}
          />
          {view.after && (
            <Grid
              title={`${view.n_steps} steps ahead`}
              states={view.states}
              rows={view.after}
              read={readProbability}
            />
          )}
          {view.states.length === 2 && <TwoStateDiagram table={view.table} />}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Heatmap
            title="one step ahead, the row is the symbol now"
            states={view.states}
            rows={view.table}
          />
          {view.after && (
            <Heatmap
              title={`${view.n_steps} steps ahead`}
              states={view.states}
              rows={view.after}
            />
          )}
        </div>
      )}

      <div>
        <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
          Where the chain settles, in indigo, against how often each state
          occurs in the text it was counted on, in grey
        </p>
        {view.stationary_note && (
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
            {view.stationary_note}
          </p>
        )}
        <ShareBars
          states={view.states}
          settled={view.stationary}
          text={view.text_shares}
        />
      </div>

      {view.distances && (
        <DistanceCurve distances={view.distances} nSteps={view.n_steps} />
      )}

      {view.walk && (
        <div>
          <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
            A walk drawn from the table, starting where the text starts
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="flex-1 break-words rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              {view.walk}
            </p>
            <button type="button" onClick={onDraw} className={BUTTON_CLASS}>
              Draw again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ShareBars({
  states,
  settled,
  text,
}: {
  states: string[];
  settled: number[] | null;
  text: number[];
}) {
  const width = 640;
  const height = 120;
  const padBottom = 18;
  const group = (width - 20) / states.length;
  const bar = Math.min(14, group / 2.6);
  const largest = Math.max(...text, ...(settled ?? [0]), 0.01);
  const toHeight = (value: number) =>
    (value / largest) * (height - padBottom - 8);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
    >
      {states.map((state, index) => {
        const left = 10 + index * group + group / 2 - bar;
        return (
          <g key={state}>
            {settled && (
              <rect
                x={left}
                y={height - padBottom - toHeight(settled[index])}
                width={bar}
                height={toHeight(settled[index])}
                fill={INDIGO}
              >
                <title>{`${stateName(state)} settled ${readProbability(settled[index])}`}</title>
              </rect>
            )}
            <rect
              x={left + bar}
              y={height - padBottom - toHeight(text[index])}
              width={bar}
              height={toHeight(text[index])}
              fill={SLATE}
            >
              <title>{`${stateName(state)} in the text ${readProbability(text[index])}`}</title>
            </rect>
            <text
              x={left + bar}
              y={height - 5}
              textAnchor="middle"
              className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
            >
              {states.length === 2 ? stateName(state) : stateMark(state)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DistanceCurve({
  distances,
  nSteps,
}: {
  distances: number[];
  nSteps: number;
}) {
  const width = 640;
  const height = 150;
  const padLeft = 48;
  const padRight = 12;
  const padTop = 10;
  const padBottom = 26;
  const floor = -12;
  const toX = (step: number) =>
    padLeft + (step / (distances.length - 1)) * (width - padLeft - padRight);
  const toY = (value: number) => {
    const logged = Math.max(floor, Math.log10(Math.max(value, 1e-300)));
    return padTop + (-logged / -floor) * (height - padTop - padBottom);
  };
  const ticks = [1, 1e-3, 1e-6, 1e-9, 1e-12];
  const shown = distances[Math.min(nSteps, distances.length - 1)];

  return (
    <div>
      <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
        How far the walk from the worst start is from where the chain settles,
        step by step, on a logarithmic scale
      </p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={padLeft}
              x2={width - padRight}
              y1={toY(tick)}
              y2={toY(tick)}
              className="stroke-slate-200 dark:stroke-slate-800"
            />
            <text
              x={padLeft - 6}
              y={toY(tick) + 3}
              textAnchor="end"
              className="fill-slate-500 font-mono text-[9px] dark:fill-slate-400"
            >
              {tick === 1 ? "1" : tick.toExponential(0)}
            </text>
          </g>
        ))}
        <path
          d={distances
            .map(
              (value, step) =>
                `${step === 0 ? "M" : "L"} ${toX(step).toFixed(1)} ${toY(value).toFixed(1)}`,
            )
            .join(" ")}
          fill="none"
          stroke={INDIGO}
          strokeWidth={2}
        />
        {nSteps < distances.length && (
          <circle cx={toX(nSteps)} cy={toY(shown)} r={4} fill={INDIGO} />
        )}
        <text
          x={(padLeft + width - padRight) / 2}
          y={height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          steps taken
        </text>
      </svg>
      {nSteps < distances.length && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          After {nSteps} steps the worst start is {readProbability(shown)} from
          settled.
        </p>
      )}
    </div>
  );
}
