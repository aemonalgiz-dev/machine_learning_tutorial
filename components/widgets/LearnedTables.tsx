"use client";

// Everything one fit learned from a handful of segmented sentences, small enough
// to read whole.
//
// The API counts the sentences, smooths the counts and hands back both, so the
// browser can print the fraction a number came from rather than the number on
// its own. Three tables: where a run may start, which place may follow which,
// and how often each place produced each character. The grey cells of the middle
// table are the steps that cannot happen in any cutting of any text, and they
// carry no count and no smoothing.

import { useEffect, useState } from "react";
import {
  TAG_ORDER,
  Tables,
  TablesView,
  fetchTables,
  fraction,
  messageFor,
  tablesFor,
} from "@/lib/concepts/segmenting-with-a-hidden-model";
import {
  Loading,
  Sentences,
  Stat,
  TAG_COLOURS,
  TAG_TITLES,
} from "./hiddenModelParts";

function StartTable({ tables }: { tables: Tables }) {
  const admissible = tables.starts.filter((row) => row.admissible);
  return (
    <table className="w-full border-collapse text-left text-xs">
      <thead>
        <tr className="text-slate-500 dark:text-slate-400">
          <th className="py-1 pr-3 font-medium">a run starts in</th>
          <th className="py-1 pr-3 font-medium">counted</th>
          <th className="py-1 pr-3 font-medium">smoothed</th>
          <th className="py-1 font-medium">share</th>
        </tr>
      </thead>
      <tbody>
        {tables.starts.map((row) => (
          <tr
            key={row.tag}
            className="border-t border-slate-100 dark:border-slate-800"
          >
            <td className="py-1 pr-3">
              <span
                className="font-mono"
                style={{ color: TAG_COLOURS[row.tag] }}
              >
                {row.tag}
              </span>{" "}
              <span className="text-slate-500 dark:text-slate-400">
                {row.tag_name}
              </span>
            </td>
            <td className="py-1 pr-3 font-mono">
              {row.admissible ? `${row.count} of ${row.total}` : "cannot happen"}
            </td>
            <td className="py-1 pr-3 font-mono text-slate-500 dark:text-slate-400">
              {row.admissible
                ? fraction(
                    row.count,
                    tables.smoothing,
                    row.total,
                    admissible.length,
                  )
                : ""}
            </td>
            <td className="py-1 font-mono">
              {row.probability === null ? "" : row.probability.toFixed(4)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StepTable({ tables }: { tables: Tables }) {
  return (
    <table className="w-full border-collapse text-center text-xs">
      <thead>
        <tr className="text-slate-500 dark:text-slate-400">
          <th className="py-1 pr-2 text-left font-medium">then</th>
          {TAG_ORDER.map((tag) => (
            <th key={tag} className="py-1 font-mono font-medium">
              <span style={{ color: TAG_COLOURS[tag] }}>{tag}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {TAG_ORDER.map((previous) => (
          <tr
            key={previous}
            className="border-t border-slate-100 dark:border-slate-800"
          >
            <th className="py-1 pr-2 text-left font-mono font-medium">
              <span style={{ color: TAG_COLOURS[previous] }}>{previous}</span>
            </th>
            {TAG_ORDER.map((following) => {
              const step = tables.steps.find(
                (item) =>
                  item.previous === previous && item.following === following,
              );
              if (!step) {
                return <td key={following} />;
              }
              return (
                <td
                  key={following}
                  title={
                    step.admissible
                      ? `${TAG_TITLES[previous]}, then ${TAG_TITLES[following]}: counted ${step.count} of ${step.total}`
                      : `${TAG_TITLES[previous]} cannot be followed by ${TAG_TITLES[following]} in any cutting of any text`
                  }
                  className={`py-1.5 font-mono ${
                    step.admissible
                      ? "text-slate-900 dark:text-slate-100"
                      : "bg-slate-100 text-slate-300 dark:bg-slate-800/70 dark:text-slate-600"
                  }`}
                >
                  {step.admissible ? (
                    <>
                      <span className="block">
                        {step.probability?.toFixed(4)}
                      </span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                        {step.count} of {step.total}
                      </span>
                    </>
                  ) : (
                    "×"
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CharacterTable({ tables }: { tables: Tables }) {
  const floors = new Map(tables.floors.map((row) => [row.tag, row.probability]));
  return (
    <table className="w-full border-collapse text-center text-xs">
      <thead>
        <tr className="text-slate-500 dark:text-slate-400">
          <th className="py-1 pr-2 text-left font-medium">place</th>
          {tables.alphabet.map((character) => (
            <th key={character} className="py-1 font-mono font-medium">
              {character}
            </th>
          ))}
          <th className="py-1 font-medium">anything else</th>
        </tr>
      </thead>
      <tbody>
        {TAG_ORDER.map((tag) => (
          <tr key={tag} className="border-t border-slate-100 dark:border-slate-800">
            <th className="py-1 pr-2 text-left font-mono font-medium">
              <span style={{ color: TAG_COLOURS[tag] }}>{tag}</span>
            </th>
            {tables.alphabet.map((character) => {
              const row = tables.characters.find(
                (item) => item.tag === tag && item.character === character,
              );
              return (
                <td
                  key={character}
                  title={
                    row
                      ? `${TAG_TITLES[tag]}, producing ${character}: counted ${row.count} of ${row.total}`
                      : ""
                  }
                  className="py-1.5 font-mono"
                >
                  <span className="block">{row?.probability.toFixed(4)}</span>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                    {row?.count} of {row?.total}
                  </span>
                </td>
              );
            })}
            <td className="py-1.5 font-mono text-amber-700 dark:text-amber-300">
              {floors.get(tag)?.toFixed(4)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function LearnedTables({
  corpusKeys = ["two sentences"],
}: {
  corpusKeys?: string[];
}) {
  const [view, setView] = useState<TablesView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState(corpusKeys[0]);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchTables());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) {
    return <Loading message={message} />;
  }

  const tables = tablesFor(view, chosen);

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      {corpusKeys.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {corpusKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setChosen(key)}
              className={`rounded-md border px-3 py-1 text-sm ${
                chosen === key
                  ? "border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
              }`}
            >
              {tablesFor(view, key).label}
            </button>
          ))}
        </div>
      )}

      <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        What it was shown
      </p>
      <Sentences sentences={tables.sentences} />

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="sentences" value={`${tables.n_sentences}`} />
        <Stat label="words in them" value={`${tables.n_words}`} />
        <Stat label="different characters" value={`${tables.n_alphabet}`} />
        <Stat label="added to every count" value={`${tables.smoothing}`} />
      </div>

      <p className="mt-4 mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        Where a run may start
      </p>
      <StartTable tables={tables} />

      <p className="mt-4 mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        Which place may follow which, reading a row then a column
      </p>
      <div className="overflow-x-auto">
        <StepTable tables={tables} />
      </div>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        {tables.n_forbidden_steps} of the sixteen cells are struck out, and they
        are struck out before any counting rather than because nothing was
        counted in them.
      </p>

      <p className="mt-4 mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        How often each place produced each character
      </p>
      <div className="overflow-x-auto">
        <CharacterTable tables={tables} />
      </div>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        Each row is smoothed over the {tables.n_alphabet} characters plus one
        spare slot, so {tables.n_slots} outcomes in all, which is what leaves a
        share over for a character nobody wrote down.
      </p>
    </div>
  );
}
