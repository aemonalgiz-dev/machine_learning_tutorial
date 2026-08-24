"use client";

// One gap opened up, with every feature that voted on it and by how much.
//
// The API lists the features of the chosen gap, reads the weight each of them
// carries out of the fit, and totals them; a test asserts that the total is the
// score the segmenter itself gives that gap, to the last bit, so this is the
// decision taken apart rather than an account of it. The browser draws each
// weight as a bar either side of a centre line and prints the three subtotals.
// What to look at is how many of the bars naming particular characters are
// missing altogether, which is what a feature that has never been seen looks
// like.

import { useEffect, useState } from "react";
import {
  FeatureVote,
  GapsView,
  fetchGaps,
  messageFor,
  openedFor,
  signed,
} from "@/lib/concepts/learning-boundaries-from-examples";
import { Loading, Stat } from "./pointwiseParts";

const FAMILY_COLOURS: Record<string, string> = {
  "base rate": "#a855f7",
  "which character": "#0ea5e9",
  "what kind of character": "#f59e0b",
};

function VoteRow({ vote, widest }: { vote: FeatureVote; widest: number }) {
  const share = Math.min(1, Math.abs(vote.weight) / widest);
  return (
    <li className="flex items-center gap-2 py-0.5 text-xs">
      <span className="w-14 shrink-0 text-right font-mono text-slate-500 dark:text-slate-400">
        {vote.reach}
      </span>
      <span className="w-28 shrink-0 truncate font-mono text-slate-800 dark:text-slate-200">
        {vote.reads === "" ? "always" : vote.reads}
      </span>
      <span className="flex min-w-0 grow items-center">
        <span className="flex h-3 grow justify-end">
          {vote.weight < 0 && (
            <span
              className="h-3 rounded-l"
              style={{
                width: `${share * 100}%`,
                backgroundColor: FAMILY_COLOURS[vote.family],
                opacity: 0.75,
              }}
            />
          )}
        </span>
        <span className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
        <span className="flex h-3 grow">
          {vote.weight > 0 && (
            <span
              className="h-3 rounded-r"
              style={{
                width: `${share * 100}%`,
                backgroundColor: FAMILY_COLOURS[vote.family],
              }}
            />
          )}
        </span>
      </span>
      <span
        className={`w-20 shrink-0 text-right font-mono ${
          vote.seen
            ? "text-slate-800 dark:text-slate-200"
            : "text-slate-400 dark:text-slate-600"
        }`}
      >
        {vote.seen ? signed(vote.weight) : "no weight"}
      </span>
    </li>
  );
}

export function GapVotes({ gapKeys }: { gapKeys: string[] }) {
  const [view, setView] = useState<GapsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState(gapKeys[0]);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchGaps());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) {
    return <Loading message={message} />;
  }

  const opened = openedFor(view, chosen);
  const widest = Math.max(
    0.5,
    ...opened.votes.map((vote) => Math.abs(vote.weight)),
  );
  const before = opened.text.slice(Math.max(0, opened.gap - 4), opened.gap + 1);
  const after = opened.text.slice(opened.gap + 1, opened.gap + 6);

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      {gapKeys.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {gapKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setChosen(key)}
              className={`rounded-md border px-3 py-1 text-left text-sm ${
                chosen === key
                  ? "border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
              }`}
            >
              {openedFor(view, key).label}
            </button>
          ))}
        </div>
      )}

      <p className="mb-2 font-mono text-sm text-slate-500 dark:text-slate-400">
        …{before}
        <span className="mx-0.5 text-sky-500">|</span>
        {after}…
      </p>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        Learned from {opened.corpus_label}. Every row below is one thing the gap
        was asked, and the bar is the weight it carries.
      </p>

      <ul className="border-y border-slate-100 py-1 dark:border-slate-800/60">
        {opened.votes.map((vote) => (
          <VoteRow key={vote.feature} vote={vote} widest={widest} />
        ))}
      </ul>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="base rate" value={signed(opened.base_rate_total)} />
        <Stat
          label="which characters, in all"
          value={signed(opened.identity_total)}
        />
        <Stat
          label="what kinds, in all"
          value={signed(opened.kind_total)}
        />
        <Stat label="the score of the gap" value={signed(opened.total)} />
      </div>

      <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
        {opened.n_identity_seen} of {opened.n_identity} questions about which
        characters these are carry any weight at all;{" "}
        {opened.n_kind_seen} of {opened.n_kind} about what kinds they are do.
        The gap is {opened.cut ? "cut" : "kept together"}, and a reader
        {opened.expected === null
          ? " has not said what it should be"
          : opened.expected
            ? " cuts it too"
            : " keeps it together"}
        .
      </p>

      <p className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        {Object.entries(FAMILY_COLOURS).map(([family, colour]) => (
          <span key={family} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-4 rounded"
              style={{ backgroundColor: colour }}
            />
            {family}
          </span>
        ))}
      </p>
    </div>
  );
}
