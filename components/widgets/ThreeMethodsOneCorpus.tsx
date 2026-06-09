"use client";

// Three methods handed the identical three sentences, asked the same six
// characters.
//
// The API counts a word list from those sentences and fits the places from the
// same sentences, so nothing separates the three answers except what each method
// is able to say. The browser prints the sentences, then the three answers, then
// the answer a reader gives. Whichever pieces the training sentences never held
// are drawn in amber, and the whole of the difference is that only one row has
// any of them.

import { useEffect, useState } from "react";
import {
  SetupView,
  fetchSetup,
  messageFor,
} from "@/lib/concepts/segmenting-with-a-hidden-model";
import { AnswerLine, Chip, Loading, Sentences, Stat } from "./hiddenModelParts";

export function ThreeMethodsOneCorpus({
  show = "novel",
}: {
  show?: "novel" | "name";
}) {
  const [view, setView] = useState<SetupView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchSetup());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) {
    return <Loading message={message} />;
  }

  const novel = show === "novel";
  const known = new Set(novel ? view.corpus_words : ["研究", "生命", "起源"]);
  const text = novel ? view.text : view.name_sentence;
  const rows = novel
    ? [
        { name: "the greedy scan", words: view.from_a_greedy_scan },
        { name: "the best whole path", words: view.from_a_word_list },
        { name: "the places", words: view.from_the_tagger },
        { name: "what a reader answers", words: view.reader_reading },
      ]
    : [
        { name: "the best whole path", words: view.name_from_a_word_list },
        { name: "the places", words: view.name_from_the_tagger },
        { name: "the two together", words: view.name_from_both },
        { name: "what a reader answers", words: view.name_reading },
      ];

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      {novel && (
        <>
          <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            All three were shown these sentences and nothing else
          </p>
          <Sentences sentences={view.corpus_sentences} />
        </>
      )}

      <p className="mt-3 mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        Asked to read{" "}
        <span className="font-mono text-slate-900 dark:text-slate-100">
          {text}
        </span>
      </p>
      <ul>
        {rows.map((row) => (
          <AnswerLine
            key={row.name}
            name={row.name}
            words={row.words}
            known={known}
          />
        ))}
      </ul>

      {novel && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Stat
            label="words in the sentences"
            value={`${view.corpus_words.length}`}
          />
          <Stat
            label="words in the text"
            value={`${view.reader_reading.length}`}
          />
          <Stat
            label="of them the sentences held"
            value={`${view.reader_reading.length - view.n_new_words}`}
          />
        </div>
      )}

      <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Chip text="word" tone="known" /> a word the sentences contained
        <Chip text="word" tone="new" /> a piece none of them did
      </p>
    </div>
  );
}
