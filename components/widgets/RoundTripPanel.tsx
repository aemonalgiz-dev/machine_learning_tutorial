"use client";

// What survives being taken apart, on the sentence that separates the two rules.
//
// The API splits the quoted sentence by the Moses rules and by the Penn
// Treebank rules, splits it again with the marks a file format would swallow
// rewritten, and reports for each whether the pieces joined with nothing
// between them give back everything in the sentence that is not spacing, and
// whether putting every rewriting back recovers it. It also splits a pair of
// texts written differently on purpose, one of them in the spelling the
// annotation rules produce. The browser draws the three readings and then the
// pair.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ReversibilityView,
  RuleView,
  fetchReversibility,
} from "@/lib/concepts/moses-rules";

export function RoundTripPanel() {
  const [view, setView] = useState<ReversibilityView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchReversibility());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
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

  const pair = view.ambiguity;

  return (
    <div>
      <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
        {view.quoted.source}
      </div>

      <div className="mt-2 space-y-2">
        <Reading
          title="these rules"
          rule={view.quoted.on_these_rules}
        />
        <Reading
          title="the annotation rules"
          rule={view.quoted.on_annotation_rules}
        />
        <Reading
          title="these rules, with the marks a file format would swallow rewritten"
          rule={view.quoted_with_marks_rewritten.on_these_rules}
        />
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          two texts that are not the same text, one of them already written in
          the spelling the annotation rules produce
        </div>
        <div className="mt-2 space-y-2">
          <Pair
            source={pair.first}
            here={pair.first_on_these_rules}
            there={pair.first_on_annotation_rules}
          />
          <Pair
            source={pair.second}
            here={pair.second_on_these_rules}
            there={pair.second_on_annotation_rules}
          />
        </div>
        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          The last column is the same both times, so from those pieces alone
          there is no telling which of the two texts was read. The first column
          differs, which is what having every piece be a stretch of the source
          buys.
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Stat
          label="of 18 sentences whose pieces join back here"
          value={`${view.n_joining_here}`}
        />
        <Stat
          label="the same under the annotation rules"
          value={`${view.n_joining_by_annotation}`}
        />
        <Stat
          label="joined with one space each and identical"
          value={`${view.n_glue_exact_here}`}
        />
        <Stat
          label="the same when cut at the spaces only"
          value={`${view.n_glue_exact_on_spaces}`}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The last two readouts are the honest half. Joining the pieces back in
        order recovers every character that is not spacing, and it does not
        recover the spacing, so something downstream still has to decide where
        the spaces go.
      </p>
    </div>
  );
}

function Reading({ title, rule }: { title: string; rule: RuleView }) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        rule.undoing_recovers_the_source
          ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-700 dark:bg-emerald-950/20"
          : "border-rose-300 bg-rose-50/40 dark:border-rose-700 dark:bg-rose-950/20"
      }`}
    >
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {title} ({rule.n_pieces} pieces, {rule.n_rewritten} of them no longer
        their source)
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {rule.pieces.map((piece) => (
          <span
            key={`${piece.start}-${piece.end}-${piece.text}`}
            className={`rounded px-1.5 py-0.5 font-mono text-xs ${
              piece.is_rewritten
                ? "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                : "bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200"
            }`}
          >
            {piece.text}
          </span>
        ))}
      </div>
      <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        {rule.pieces_join_to_the_source
          ? "the pieces joined in order are the sentence, less its spacing"
          : rule.undoing_recovers_the_source
            ? "the pieces joined in order are not the sentence, and putting every rewriting back makes them so"
            : "the pieces joined in order are not the sentence, and nothing here puts them back"}
      </div>
    </div>
  );
}

function Pair({
  source,
  here,
  there,
}: {
  source: string;
  here: string[];
  there: string[];
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-3">
      <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
        {source}
      </div>
      <Chips pieces={here} />
      <Chips pieces={there} />
    </div>
  );
}

function Chips({ pieces }: { pieces: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {pieces.map((piece, position) => (
        <span
          key={`${position}-${piece}`}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200"
        >
          {piece}
        </span>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
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
