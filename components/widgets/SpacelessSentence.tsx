"use client";

// The running sentence with its spaces taken out, and what the rules from
// earlier in this section answer for it.
//
// The API removes the spaces, counts the characters, works out how many ways
// that many characters could be cut, and puts both the spaceless English and a
// Chinese sentence to each of the five rules; the browser lays the answers out
// so the two failures can be seen beside each other. Nothing here is fitted or
// learned.

import { useEffect, useState } from "react";
import {
  RuleOnText,
  SetupView,
  fetchSetup,
  grouped,
  messageFor,
} from "@/lib/concepts/maximum-matching";
import { Loading, Stat } from "./maximumMatchingParts";

function RuleRow({ rule }: { rule: RuleOnText }) {
  return (
    <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
      <td className="py-1.5 pr-4 text-slate-600 dark:text-slate-400">
        {rule.rule}
      </td>
      <td className="py-1.5 pr-4 text-right font-mono text-slate-900 dark:text-slate-100">
        {rule.n_pieces}
      </td>
      <td className="break-all py-1.5 font-mono text-xs text-slate-700 dark:text-slate-300">
        {rule.pieces.join(" | ")}
      </td>
    </tr>
  );
}

export function SpacelessSentence() {
  const [setup, setSetup] = useState<SetupView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showing, setShowing] = useState<"english" | "chinese">("english");

  useEffect(() => {
    (async () => {
      try {
        setSetup(await fetchSetup());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!setup) {
    return <Loading message={message} />;
  }

  const english = showing === "english";
  const rules = english
    ? setup.earlier_rules_on_the_spaceless_sentence
    : setup.earlier_rules_on_the_park_sentence;
  const text = english ? setup.spaceless_sentence : setup.park_sentence;
  const characters = english
    ? setup.n_spaceless_characters
    : setup.n_park_characters;
  const cuts = english ? setup.n_cuts : setup.n_park_cuts;
  const answer = english
    ? setup.n_words_with_spaces
    : setup.n_words_a_reader_finds_in_the_park_sentence;

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="mb-3 flex flex-wrap gap-2">
        {(["english", "chinese"] as const).map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => setShowing(choice)}
            className={`rounded-md border px-3 py-1 text-sm ${
              showing === choice
                ? "border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {choice === "english"
              ? "our sentence, spaces removed"
              : "a sentence written without spaces"}
          </button>
        ))}
      </div>

      {english && (
        <>
          <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            As it was written, {setup.n_sentence_characters} characters of which{" "}
            {setup.n_spaces} are spaces
          </p>
          <p className="break-all font-mono text-sm text-slate-700 dark:text-slate-300">
            {setup.sentence.replace(/ /g, "·")}
          </p>
        </>
      )}

      <p className="mb-1 mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
        {english ? "The same sentence with nothing between its words" : "As it is written"}
      </p>
      <p className="break-all font-mono text-base text-slate-900 dark:text-slate-100">
        {text}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="characters" value={`${characters}`} />
        <Stat label="ways to cut them" value={grouped(cuts)} />
        <Stat label="words a reader finds" value={`${answer}`} />
      </div>

      <p className="mb-1 mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
        What each rule from earlier in this section answers
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                rule
              </th>
              <th className="py-1.5 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                pieces
              </th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">
                what it gives back
              </th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <RuleRow key={rule.rule} rule={rule} />
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {english
          ? "Every one of them is looking for something this text no longer has. The seven words are still in there and no rule finds one of them."
          : "Four of the five hand back the whole line as a single word, and the fifth hands back one word per character."}
      </p>
    </div>
  );
}
