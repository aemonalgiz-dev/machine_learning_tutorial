"use client";

// Ten full stops whose answer can be stated, put to three rules and scored.
//
// The API splits each probe by the Moses rules, by the Penn Treebank rules and
// by the written-out table of exceptions, reports the pieces each gives, says
// for each whether the focal stop stayed on the word, and compares that with an
// answer written down before any rule ran. The browser draws one row per probe
// with the three verdicts beside the stated answer, and the totals underneath.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { FullStopsView, StopProbe, fetchFullStops } from "@/lib/concepts/moses-rules";

export function StopProbePanel() {
  const [view, setView] = useState<FullStopsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchFullStops());
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

  const board = view.scoreboard;

  return (
    <div>
      <div className="space-y-2">
        {view.probes.map((probe) => (
          <Row key={probe.text} probe={probe} />
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                over the ten stops above
              </th>
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                these rules
              </th>
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                the annotation rules
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                a table of exceptions
              </th>
            </tr>
          </thead>
          <tbody>
            <Totals
              label="placed where it belongs"
              values={[
                `${board.n_right_here}`,
                `${board.n_right_by_annotation}`,
                `${board.n_right_by_the_table}`,
              ]}
            />
            <Totals
              label="answered kept"
              values={[
                `${board.n_answers_here}`,
                `${board.n_answers_by_annotation}`,
                `${board.n_answers_by_the_table}`,
              ]}
            />
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Eight of the ten stops belong to the word in front of them and two end a
        sentence, so a rule that answers kept every time scores{" "}
        {board.n_wanting_kept} without telling anything apart, and one of the
        three does exactly that.
      </p>

      <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50/60 px-3 py-2 dark:border-amber-700 dark:bg-amber-950/20">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          three more stops, kept out of the score because there is no answer to
          score against
        </div>
        <div className="mt-2 space-y-2">
          {view.undecidable.map((probe) => (
            <div key={probe.text}>
              <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {probe.text}
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                <Verdict label="these rules" kept={probe.kept_here} />
                <Verdict
                  label="the annotation rules"
                  kept={probe.kept_by_annotation}
                />
              </div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {probe.look_at}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ probe }: { probe: StopProbe }) {
  return (
    <div className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {probe.label}
      </div>
      <div className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
        {probe.text}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-700 dark:text-slate-200">
          the stop belongs to {probe.belongs_to_the_word ? probe.word : "the sentence"}
        </span>
        <Scored label="these rules" kept={probe.kept_here} right={probe.right_here} />
        <Scored
          label="the annotation rules"
          kept={probe.kept_by_annotation}
          right={probe.right_by_annotation}
        />
        <Scored
          label="a table"
          kept={probe.kept_by_the_table}
          right={probe.right_by_the_table}
        />
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {probe.on_these_rules.map((piece, position) => (
          <span
            key={`${position}-${piece}`}
            className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            {piece}
          </span>
        ))}
      </div>
      <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        {probe.look_at}
      </div>
    </div>
  );
}

function Scored({
  label,
  kept,
  right,
}: {
  label: string;
  kept: boolean;
  right: boolean;
}) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-xs ${
        right
          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "bg-rose-100 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
      }`}
    >
      {label} {kept ? "kept" : "split"}
    </span>
  );
}

function Verdict({ label, kept }: { label: string; kept: boolean }) {
  return (
    <span className="rounded bg-white px-1.5 py-0.5 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
      {label} {kept ? "kept" : "split"}
    </span>
  );
}

function Totals({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
      <td className="py-2 pr-6 text-slate-700 dark:text-slate-300">{label}</td>
      {values.map((value, column) => (
        <td
          key={`${column}-${value}`}
          className="py-2 pr-6 font-mono text-slate-900 last:pr-0 dark:text-slate-100"
        >
          {value} of 10
        </td>
      ))}
    </tr>
  );
}
