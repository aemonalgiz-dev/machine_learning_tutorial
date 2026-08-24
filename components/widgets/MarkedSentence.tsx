"use client";

// One sentence taken all the way through: raw, marked, cut into units, and
// then the units as they are before anything has been learned.
//
// The API marks the running sentence and hands back the stream and the units
// it is cut into; the browser lays the three rows out so a reader can check
// character by character that nothing was dropped between them. There are no
// fitted quantities here at all, which is the point of the section it sits in.

import { useEffect, useState } from "react";
import {
  MarkingView,
  fetchMarking,
  messageFor,
} from "@/lib/concepts/sentencepiece";
import { MARK, MarkedText, Piece } from "./sentencePieceParts";

export function MarkedSentence() {
  const [marking, setMarking] = useState<MarkingView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setMarking(await fetchMarking());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!marking) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const spaces = [...marking.sentence].filter(
    (character) => character === " ",
  ).length;

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        As it was written, {marking.sentence.length} characters of which{" "}
        {spaces} are spaces
      </p>
      <p className="break-all font-mono text-sm text-slate-700 dark:text-slate-300">
        {marking.sentence.replace(/ /g, "·")}
      </p>

      <p className="mb-1 mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
        Every space replaced by the mark, and one put in front
      </p>
      <MarkedText text={marking.marked_sentence} />

      <p className="mb-2 mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
        Cut at the marks, {marking.marked_units.length} units
      </p>
      <div className="flex flex-wrap gap-1">
        {marking.marked_units.map((unit, index) => (
          <Piece key={`${index}-${unit}`} text={unit} tone="learned" />
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        The mark is {MARK}, codepoint {marking.mark_codepoint}, chosen because
        it looks like a space and turns up in no ordinary text. Nothing above
        this line is learned, and nothing about English was consulted to
        produce it.
      </p>
    </div>
  );
}
