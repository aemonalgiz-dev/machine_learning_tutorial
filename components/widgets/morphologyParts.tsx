"use client";

// The pieces every widget on the finite-state morphology page draws with.
//
// A word read by a grammar is always drawn the same way here: one chip per
// piece, with the label the grammar gave it underneath, so a reader can see
// that the answer names the pieces rather than only placing them. The API
// decides every piece and every label; nothing in this file reads a grammar.

import { ReactNode } from "react";
import { AnalysisView, Morph, WordView } from "@/lib/concepts/finite-state-morphology";

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

export function Loading({ message }: { message: string | null }) {
  return (
    <p className="text-sm text-slate-500 dark:text-slate-400">
      {message ?? "…"}
    </p>
  );
}

export function Chip({
  text,
  tone,
  title,
}: {
  text: string;
  tone: "stem" | "ending" | "quiet" | "missing";
  title?: string;
}) {
  const tones = {
    stem: "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-500/60 dark:bg-sky-950/40 dark:text-sky-200",
    ending:
      "border-violet-300 bg-violet-50 text-violet-900 dark:border-violet-500/60 dark:bg-violet-950/30 dark:text-violet-200",
    quiet:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
    missing:
      "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/60 dark:bg-amber-950/30 dark:text-amber-200",
  };
  return (
    <span
      title={title}
      className={`inline-block rounded border px-1.5 py-0.5 font-mono text-sm ${tones[tone]}`}
    >
      {text}
    </span>
  );
}

function toneFor(morph: Morph): "stem" | "ending" {
  return morph.label.startsWith("+") ? "ending" : "stem";
}

// One reading laid out as pieces with their labels underneath.
export function Reading({ analysis }: { analysis: AnalysisView }) {
  return (
    <div className="flex flex-wrap items-start gap-2">
      {analysis.morphs.map((morph) => (
        <div key={`${morph.start}-${morph.text}`} className="text-center">
          <Chip text={morph.text} tone={toneFor(morph)} title={morph.meaning} />
          <div className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {morph.label}
          </div>
          <div className="max-w-28 text-[11px] leading-tight text-slate-500 dark:text-slate-400">
            {morph.meaning}
          </div>
        </div>
      ))}
    </div>
  );
}

// Every reading a grammar found for one word, or the fact that it found none.
export function Readings({ view }: { view: WordView }) {
  if (!view.is_readable) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50/60 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/60 dark:bg-amber-950/20 dark:text-amber-200">
        No path through this grammar spells{" "}
        <span className="font-mono">{view.word}</span>, so there is no reading
        of it at all, and it is handed on whole.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {view.analyses.map((analysis, position) => (
        <div key={analysis.tags}>
          <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
            reading {position + 1} of {view.n_analyses}, {analysis.n_morphemes}{" "}
            pieces, written{" "}
            <span className="font-mono">{analysis.tags}</span>
          </p>
          <Reading analysis={analysis} />
        </div>
      ))}
    </div>
  );
}

export function Panel({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        {heading}
      </p>
      {children}
    </div>
  );
}

export function Bar({
  share,
  label,
  tone = "sky",
}: {
  share: number;
  label: string;
  tone?: "sky" | "violet";
}) {
  const fill = tone === "sky" ? "fill-sky-500" : "fill-violet-500";
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-600 dark:text-slate-400">
        <span>{label}</span>
        <span className="font-mono">{(share * 100).toFixed(1)}%</span>
      </div>
      <svg viewBox="0 0 100 6" className="h-3 w-full" preserveAspectRatio="none">
        <rect
          x="0"
          y="0"
          width="100"
          height="6"
          className="fill-slate-200 dark:fill-slate-800"
        />
        <rect
          x="0"
          y="0"
          width={Math.max(share * 100, 0.4)}
          height="6"
          className={fill}
        />
      </svg>
    </div>
  );
}
