"use client";

// The pieces every widget on the one-decision-per-gap page draws with.
//
// A text is always drawn the same way here: one box per character, with the
// gaps between them carrying a signed bar, so a reader can see at once which
// gaps were cut and how strongly. A piece is a chip coloured by whether the
// marked-up sentences held that word. The API decides every one of those things
// and computes every number; nothing in this file scores a gap or adds a weight.

import { ReactNode } from "react";
import { GapDecision } from "@/lib/concepts/learning-boundaries-from-examples";

export const CUT_COLOUR = "#0ea5e9";
export const JOIN_COLOUR = "#94a3b8";
export const WRONG_COLOUR = "#f43f5e";

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

export function Chip({
  text,
  tone,
  title,
}: {
  text: string;
  tone: "known" | "new" | "quiet" | "right" | "wrong";
  title?: string;
}) {
  const tones = {
    known:
      "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-500/60 dark:bg-sky-950/40 dark:text-sky-200",
    new: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/60 dark:bg-amber-950/30 dark:text-amber-200",
    quiet:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
    right:
      "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-500/70 dark:bg-emerald-950/30 dark:text-emerald-200",
    wrong:
      "border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-500/70 dark:bg-rose-950/30 dark:text-rose-200",
  };
  return (
    <span
      title={title}
      className={`inline-block rounded border px-1.5 py-0.5 font-mono text-sm ${tones[tone]}`}
    >
      {text === " " ? "·" : text}
    </span>
  );
}

// One answer drawn as its pieces, told apart by whether the marked-up sentences
// held that word, since a piece assembled here for the first time is the thing a
// method that holds no word list exists to produce.
export function WordsRow({
  words,
  known,
}: {
  words: string[];
  known: Set<string>;
}) {
  if (words.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Nothing to read.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {words.map((word, position) => (
        <Chip
          key={`${position}-${word}`}
          text={word}
          tone={known.has(word) ? "known" : "new"}
          title={
            known.has(word)
              ? "a word the marked-up sentences contained"
              : "a piece assembled here for the first time"
          }
        />
      ))}
    </div>
  );
}

export function AnswerLine({
  name,
  words,
  known,
  note,
}: {
  name: string;
  words: string[];
  known: Set<string>;
  note?: ReactNode;
}) {
  return (
    <li className="flex flex-wrap items-start gap-3 border-b border-slate-100 py-2 last:border-0 dark:border-slate-800/60">
      <span className="w-44 shrink-0 pt-0.5 text-xs text-slate-500 dark:text-slate-400">
        {name}
      </span>
      <span className="min-w-0 grow">
        <WordsRow words={words} known={known} />
        {note && (
          <span className="mt-1 block text-xs text-slate-600 dark:text-slate-400">
            {note}
          </span>
        )}
      </span>
      <span className="shrink-0 text-right text-[11px] text-slate-500 dark:text-slate-400">
        {words.length} pieces
      </span>
    </li>
  );
}

export function Loading({ message }: { message: string | null }) {
  return (
    <p className="text-sm text-slate-500 dark:text-slate-400">
      {message ?? "…"}
    </p>
  );
}

export function Sentences({ sentences }: { sentences: string[][] }) {
  return (
    <ul className="space-y-1">
      {sentences.map((sentence, position) => (
        <li key={position} className="flex flex-wrap gap-1">
          {sentence.map((word, place) => (
            <Chip key={`${place}-${word}`} text={word} tone="quiet" />
          ))}
        </li>
      ))}
    </ul>
  );
}

// The characters of one run with the gaps between them drawn as signed bars.
//
// Every bar is one independent answer, which is the whole shape of this method,
// and a bar is drawn in red when the answer disagrees with the reading a person
// gives. The scale is shared across the whole run so the heights compare.
export function GapBars({
  text,
  gaps,
  chosen,
  onChoose,
}: {
  text: string;
  gaps: GapDecision[];
  chosen?: number | null;
  onChoose?: (index: number) => void;
}) {
  const widest = Math.max(1, ...gaps.map((gap) => Math.abs(gap.score)));
  const byPosition = new Map(gaps.map((gap) => [gap.position, gap]));
  const characters = Array.from(text);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max items-end">
        {characters.map((character, position) => {
          const gap = byPosition.get(position);
          return (
            <div key={position} className="flex items-end">
              <span
                className={`inline-block w-6 shrink-0 rounded border py-1 text-center font-mono text-sm ${
                  character === " "
                    ? "border-transparent text-slate-400 dark:text-slate-600"
                    : "border-slate-200 text-slate-900 dark:border-slate-700 dark:text-slate-100"
                }`}
              >
                {character === " " ? "␣" : character}
              </span>
              {gap && (
                <button
                  type="button"
                  onClick={onChoose ? () => onChoose(gap.index) : undefined}
                  title={`the gap between ${gap.before} and ${gap.after}, scoring ${gap.score.toFixed(4)}`}
                  className={`mx-px flex h-14 w-4 shrink-0 flex-col justify-center ${
                    onChoose ? "cursor-pointer" : "cursor-default"
                  } ${
                    chosen === gap.index
                      ? "rounded bg-slate-200 dark:bg-slate-700"
                      : ""
                  }`}
                >
                  <span className="flex h-7 items-end justify-center">
                    <span
                      className="w-2 rounded-t"
                      style={{
                        height: `${
                          gap.score > 0
                            ? (Math.abs(gap.score) / widest) * 26
                            : 0
                        }px`,
                        backgroundColor:
                          gap.correct === false ? WRONG_COLOUR : CUT_COLOUR,
                      }}
                    />
                  </span>
                  <span className="flex h-7 items-start justify-center">
                    <span
                      className="w-2 rounded-b"
                      style={{
                        height: `${
                          gap.score <= 0
                            ? (Math.abs(gap.score) / widest) * 26
                            : 0
                        }px`,
                        backgroundColor:
                          gap.correct === false ? WRONG_COLOUR : JOIN_COLOUR,
                      }}
                    />
                  </span>
                </button>
              )}
              {!gap && position < characters.length - 1 && (
                <span className="mx-px h-14 w-4 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GapLegend({ withWrong }: { withWrong?: boolean }) {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-4 rounded"
          style={{ backgroundColor: CUT_COLOUR }}
        />
        above the line, cut here
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-4 rounded"
          style={{ backgroundColor: JOIN_COLOUR }}
        />
        below it, keep going
      </span>
      {withWrong && (
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-4 rounded"
            style={{ backgroundColor: WRONG_COLOUR }}
          />
          a gap answered against the reading a person gives
        </span>
      )}
    </p>
  );
}
