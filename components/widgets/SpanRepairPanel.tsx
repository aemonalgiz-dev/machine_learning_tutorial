"use client";

// The same sentence spaced two ways, and the two ways of putting it back.
//
// The API cuts both texts, joins the pieces with one space each, and separately
// puts each piece back at the span it was cut from, comparing both against the
// original character for character. The browser shows that the two texts give
// the same seven pieces, so the difference between them survives only in the
// spans.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { SplitView, splitTexts } from "@/lib/concepts/splitting-on-spaces";
import { ODD_SPACING, RUNNING_SENTENCE, visible } from "./spaceSplitFixtures";

const LABELS = ["one space between every pair", "a doubled space and a break"];

export function SpanRepairPanel() {
  const [views, setViews] = useState<SplitView[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const answer = await splitTexts([RUNNING_SENTENCE, ODD_SPACING]);
        setViews(answer.texts);
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!views) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {views.map((view, position) => (
        <div
          key={LABELS[position]}
          className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {LABELS[position]}
            </p>
            <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
              {view.n_characters} characters, {view.n_pieces} pieces,{" "}
              {view.n_characters_in_pieces} of them inside a piece
            </p>
          </div>
          <p className="mt-1 whitespace-pre-wrap font-mono text-xs text-slate-600 dark:text-slate-400">
            {visible(view.source)}
          </p>
          <p className="mt-2 font-mono text-xs text-slate-800 dark:text-slate-200">
            {view.pieces
              .map((piece) => `${piece.text} [${piece.start}, ${piece.end})`)
              .join("   ")}
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Row
              title="joined with one space each"
              text={view.glued}
              exact={view.glue_is_exact}
            />
            <Row
              title="put back at the spans"
              text={view.rebuilt}
              exact={view.rebuild_is_exact}
            />
          </div>
        </div>
      ))}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Both texts give the same {views[0].n_pieces} pieces and the same{" "}
        {views[0].n_characters_in_pieces} characters inside them. A space is
        drawn as {"␣"} and a line break as {"⏎"}.
      </p>
    </div>
  );
}

function Row({
  title,
  text,
  exact,
}: {
  title: string;
  text: string;
  exact: boolean;
}) {
  return (
    <div
      className={`rounded-md border px-3 py-2 ${
        exact
          ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-700 dark:bg-emerald-950/20"
          : "border-amber-300 bg-amber-50/60 dark:border-amber-700 dark:bg-amber-950/20"
      }`}
    >
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {title}
      </div>
      <div className="mt-1 whitespace-pre-wrap font-mono text-xs text-slate-900 dark:text-slate-100">
        {visible(text)}
      </div>
      <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        {exact ? "identical to what went in" : "not what went in"}
      </div>
    </div>
  );
}
