"use client";

// The page's playground: give a text the collection never saw a position.
//
// A reader picks an architecture, a number of passes and a text, and the API
// runs the descent against the frozen tables and reports where the text landed,
// how far its position is from each subject, and which fitted documents came
// out nearest. The browser draws the two bars and the neighbour list; the API
// does every piece of arithmetic.

import { useEffect, useState } from "react";
import {
  ApiError,
  ArchitectureName,
  Inferred,
  inferPosition,
} from "@/lib/concepts/paragraph-vectors";
import {
  COOKING,
  Choice,
  Legend,
  SAILING,
  Stat,
  Waiting,
  colourForTopic,
} from "./paragraphVectorsShared";

const TEXTS: { label: string; value: string }[] = [
  { label: "a cooking text", value: "butter garlic onion simmer broth whisk flour ladle" },
  { label: "a sailing text", value: "anchor tide rudder harbour keel gust mooring mainsail" },
  { label: "a text about both", value: "butter garlic simmer anchor tide rudder" },
  { label: "three words only", value: "butter garlic simmer" },
  { label: "words never used here", value: "quantum lattice photon" },
];

const PASS_COUNTS = [1, 5, 20, 50, 100, 200, 400];

export function ParagraphVectorWorkbench() {
  const [architecture, setArchitecture] =
    useState<ArchitectureName>("distributed-memory");
  const [text, setText] = useState(TEXTS[0].value);
  const [passes, setPasses] = useState(20);
  const [seed, setSeed] = useState(0);
  const [result, setResult] = useState<Inferred | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  // Which request the shown answer belongs to. Comparing it against the
  // current one is what says whether a descent is still running, without a
  // separate flag an effect would have to set before its first await.
  const [answered, setAnswered] = useState<string | null>(null);

  const asked = JSON.stringify({ architecture, text, passes, seed });
  const busy = answered !== asked && message === null;

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const answer = await inferPosition({
          architecture,
          text,
          passes,
          randomSeed: seed,
          nNearest: 5,
        });
        if (current) {
          setResult(answer);
          setMessage(null);
          setAnswered(JSON.stringify({ architecture, text, passes, seed }));
        }
      } catch (error) {
        if (!current) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      current = false;
    };
  }, [architecture, text, passes, seed]);

  const bar = (value: number, colour: string) => {
    const width = Math.max(0, Math.min(1, (value + 1) / 2)) * 100;
    const zero = 50;
    return (
      <div className="relative h-4 w-full overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
        <div
          className="absolute top-0 h-full"
          style={{
            left: `${Math.min(zero, width)}%`,
            width: `${Math.abs(width - zero)}%`,
            backgroundColor: colour,
          }}
        />
        <div
          className="absolute top-0 h-full w-px bg-slate-400 dark:bg-slate-600"
          style={{ left: `${zero}%` }}
        />
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Choice
          options={[
            { label: "distributed memory", value: "distributed-memory" as const },
            { label: "bag of words", value: "bag-of-words" as const },
          ]}
          value={architecture}
          onChange={setArchitecture}
        />
        <Choice
          options={TEXTS.map((entry) => ({ label: entry.label, value: entry.value }))}
          value={text}
          onChange={setText}
          accent={SAILING}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          passes
          <input
            type="range"
            min={0}
            max={PASS_COUNTS.length - 1}
            step={1}
            value={PASS_COUNTS.indexOf(passes)}
            onChange={(event) => setPasses(PASS_COUNTS[Number(event.target.value)])}
            className="w-40"
          />
          <span className="w-8 font-mono text-slate-900 dark:text-slate-100">
            {passes}
          </span>
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          starting draw
          <input
            type="range"
            min={0}
            max={9}
            step={1}
            value={seed}
            onChange={(event) => setSeed(Number(event.target.value))}
            className="w-28"
          />
          <span className="w-4 font-mono text-slate-900 dark:text-slate-100">
            {seed}
          </span>
        </label>
      </div>

      <p className="mb-4 rounded-md bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
        {text}
      </p>

      {!result ? (
        <Waiting message={message} />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat
              label="towards cooking"
              value={result.scores.cooking.toFixed(4)}
            />
            <Stat
              label="towards sailing"
              value={result.scores.sailing.toFixed(4)}
            />
            <Stat label="length of the answer" value={result.length.toFixed(4)} />
            <Stat label="seconds" value={result.seconds.toFixed(4)} />
          </div>

          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-slate-600 dark:text-slate-400">
                cooking
              </span>
              {bar(result.scores.cooking, COOKING)}
            </div>
            <div className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-slate-600 dark:text-slate-400">
                sailing
              </span>
              {bar(result.scores.sailing, SAILING)}
            </div>
          </div>

          {result.unknown_words.length > 0 && (
            <p className="mb-3 text-xs text-amber-600 dark:text-amber-400">
              {result.nothing_to_descend_on
                ? "None of these words was used by the collection, so there was nothing to walk towards and the answer is the random position it started at."
                : `Ignored, having never been used by the collection: ${result.unknown_words.join(", ")}.`}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                    nearest documents
                  </th>
                  <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                    about
                  </th>
                  <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                    cosine
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.nearest.map((entry) => (
                  <tr
                    key={entry.position}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                  >
                    <td className="py-1.5 pr-4 font-mono text-xs text-slate-800 dark:text-slate-200">
                      {entry.text}
                    </td>
                    <td
                      className="py-1.5 pr-4 text-xs font-medium"
                      style={{ color: colourForTopic(entry.topic) }}
                    >
                      {entry.topic}
                    </td>
                    <td className="py-1.5 font-mono text-slate-800 dark:text-slate-200">
                      {entry.similarity.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Legend>
            The answer leans towards {result.scores.leans_towards}. Twenty passes
            is what the published work gives a new text; under distributed memory
            that is not enough here, and the list above fills with the wrong
            subject until the count is raised. Moving the starting draw with the
            passes low changes the answer, which is the whole of Part 6.
            {busy ? " Working…" : ""}
          </Legend>
        </>
      )}
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
