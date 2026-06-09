"use client";

// How much of a text the written grammar can read at all.
//
// The API hands the sentence to two different ways of finding words, tries the
// grammar on every piece each of them produced, and separately measures a
// paragraph of ordinary prose both by occurrence and by distinct word, with and
// without fifty structureless words listed by hand. The browser draws the bars
// and lists the words that came back with nothing.

import { useEffect, useState } from "react";
import {
  CoverageView,
  fetchCoverage,
  messageFor,
} from "@/lib/concepts/finite-state-morphology";
import { Bar, Chip, Loading } from "./morphologyParts";

export function WhatItCanRead({
  showSentence = true,
  showParagraph = true,
}: {
  showSentence?: boolean;
  showParagraph?: boolean;
}) {
  const [coverage, setCoverage] = useState<CoverageView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCoverage(await fetchCoverage());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!coverage) {
    return <Loading message={message} />;
  }

  const paragraphs = coverage.coverages.slice(1);
  const listed = paragraphs[paragraphs.length - 1];

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      {showSentence && (
        <>
          <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Our sentence, handed to the grammar two different ways
          </p>
          <p className="mb-3 font-mono text-sm text-slate-900 dark:text-slate-100">
            {coverage.sentence}
          </p>
          <div className="space-y-3">
            {coverage.splitters.map((splitter) => (
              <div key={splitter.rule}>
                <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {splitter.rule}, {splitter.pieces.length} pieces, of which{" "}
                  {splitter.n_readable} can be read
                </p>
                <div className="flex flex-wrap gap-1">
                  {splitter.pieces.map((piece, position) => (
                    <Chip
                      key={`${position}-${piece.text}`}
                      text={piece.text}
                      tone={piece.is_readable ? "stem" : "missing"}
                      title={
                        piece.is_readable
                          ? "the grammar has a path that spells this"
                          : "nothing in the grammar spells this"
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showParagraph && (
        <>
          <p className="mb-1 mt-5 text-xs font-medium text-slate-500 dark:text-slate-400">
            A paragraph of ordinary prose, {paragraphs[0].n_tokens} words of
            which {paragraphs[0].n_types} are different
          </p>
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
            {coverage.paragraph}
          </p>
          <div className="space-y-3">
            {paragraphs.map((view) => (
              <div key={view.grammar_label} className="space-y-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {view.grammar_label}, {view.n_written_lines} lines
                </p>
                <Bar
                  share={view.token_share}
                  label={`words read, counting every occurrence (${view.n_readable_tokens} of ${view.n_tokens})`}
                />
                <Bar
                  share={view.type_share}
                  tone="violet"
                  label={`words read, counting each different word once (${view.n_readable_types} of ${view.n_types})`}
                />
              </div>
            ))}
          </div>

          <p className="mb-1 mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            What is still left over, {listed.unreadable_types.length} words,
            each of which would need its own line
          </p>
          <div className="flex flex-wrap gap-1">
            {listed.unreadable_types.map((word) => (
              <Chip key={word} text={word} tone="missing" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
