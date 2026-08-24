"use client";

// Every place every character could be in, scored, with the winning run of
// places joined up.
//
// The API fits the model on the chosen sentences, scores all four places at
// every character out of that model's own numbers, and reports which place each
// character ended up in. The browser lays the characters out left to right and
// the four places top to bottom, prints the running total in each cell, and
// draws a line from each winning cell back to the cell it was reached from. A
// cell with no number is a place that character could not be in at all, which is
// what the steps that cannot happen look like from inside the search.

import { useEffect, useState } from "react";
import {
  ScenariosView,
  TAG_ORDER,
  Tagging,
  fetchScenarios,
  messageFor,
  scenarioFor,
} from "@/lib/concepts/segmenting-with-a-hidden-model";
import {
  AnswerLine,
  Loading,
  PlacesLegend,
  TAG_COLOURS,
  TAG_TITLES,
} from "./hiddenModelParts";

const COLUMN = 66;
const ROW = 40;
const LEFT = 34;
const TOP = 34;

function Grid({ tagging }: { tagging: Tagging }) {
  const columns = tagging.columns;
  const width = LEFT + columns.length * COLUMN + 12;
  const height = TOP + TAG_ORDER.length * ROW + 46;

  const centreX = (position: number) => LEFT + position * COLUMN + COLUMN / 2;
  const centreY = (row: number) => TOP + row * ROW + ROW / 2;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ minWidth: `${Math.min(width, 700)}px` }}
        className="w-full select-none rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400"
      >
        {TAG_ORDER.map((tag, row) => (
          <text
            key={`label-${tag}`}
            x={LEFT - 12}
            y={centreY(row) + 4}
            textAnchor="end"
            fontSize={13}
            fontFamily="monospace"
            fill={TAG_COLOURS[tag]}
          >
            {tag}
          </text>
        ))}
        {columns.map((column, position) => (
          <text
            key={`character-${position}`}
            x={centreX(position)}
            y={TOP - 12}
            textAnchor="middle"
            fontSize={16}
            fill="currentColor"
            opacity={column.in_alphabet ? 0.85 : 0.45}
          >
            {column.character}
          </text>
        ))}

        {columns.map((column, position) => {
          if (position === 0) {
            return null;
          }
          const winner = column.cells.find((cell) => cell.on_best_path);
          if (!winner || !winner.came_from) {
            return null;
          }
          const fromRow = TAG_ORDER.indexOf(winner.came_from);
          const toRow = TAG_ORDER.indexOf(column.tag);
          return (
            <line
              key={`join-${position}`}
              x1={centreX(position - 1) + 22}
              y1={centreY(fromRow)}
              x2={centreX(position) - 22}
              y2={centreY(toRow)}
              stroke={TAG_COLOURS[column.tag]}
              strokeWidth={2}
              opacity={0.8}
            />
          );
        })}

        {columns.map((column, position) =>
          column.cells.map((cell) => {
            const row = TAG_ORDER.indexOf(cell.tag);
            const missing = cell.score === null;
            return (
              <g key={`cell-${position}-${cell.tag}`}>
                <title>
                  {`${column.character}, ${TAG_TITLES[cell.tag]}` +
                    (missing
                      ? ", which cannot happen here"
                      : `, running total ${cell.score?.toFixed(4)}`)}
                </title>
                <rect
                  x={centreX(position) - 26}
                  y={centreY(row) - 13}
                  width={52}
                  height={26}
                  rx={5}
                  fill={
                    cell.on_best_path ? TAG_COLOURS[cell.tag] : "currentColor"
                  }
                  opacity={cell.on_best_path ? 0.22 : missing ? 0.04 : 0.08}
                  stroke={cell.on_best_path ? TAG_COLOURS[cell.tag] : "none"}
                  strokeWidth={1.4}
                />
                <text
                  x={centreX(position)}
                  y={centreY(row) + 4}
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily="monospace"
                  fill={cell.on_best_path ? TAG_COLOURS[cell.tag] : "currentColor"}
                  opacity={missing ? 0.5 : cell.on_best_path ? 1 : 0.7}
                >
                  {missing ? "×" : cell.score?.toFixed(2)}
                </text>
              </g>
            );
          }),
        )}

        {columns.map((column, position) => (
          <text
            key={`chosen-${position}`}
            x={centreX(position)}
            y={TOP + TAG_ORDER.length * ROW + 22}
            textAnchor="middle"
            fontSize={13}
            fontFamily="monospace"
            fill={TAG_COLOURS[column.tag]}
          >
            {column.tag}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function TagTrellis({
  scenarioKeys = ["research"],
}: {
  scenarioKeys?: string[];
}) {
  const [scenarios, setScenarios] = useState<ScenariosView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState(scenarioKeys[0]);

  useEffect(() => {
    (async () => {
      try {
        setScenarios(await fetchScenarios());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!scenarios) {
    return <Loading message={message} />;
  }

  const tagging = scenarioFor(scenarios, chosen);
  const known = new Set(tagging.words_in_the_corpus);

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      {scenarioKeys.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {scenarioKeys.map((key) => (
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
              {scenarioFor(scenarios, key).label}
            </button>
          ))}
        </div>
      )}

      <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        Learned from {tagging.corpus_label}, holding{" "}
        {tagging.words_in_the_corpus.length} different words
      </p>

      <Grid tagging={tagging} />

      <ul className="mt-3">
        <AnswerLine
          name="the places, read off"
          words={tagging.words}
          known={known}
          note={
            <>
              total {tagging.total_log_score.toFixed(4)}, and{" "}
              {tagging.n_new_words === 0
                ? "every piece is a word the sentences held"
                : `${tagging.n_new_words} of them the sentences never held`}
            </>
          }
        />
        <AnswerLine
          name="a list of the same words"
          words={tagging.from_a_word_list}
          known={known}
        />
        {tagging.reader_reading && (
          <AnswerLine
            name="what a reader answers"
            words={tagging.reader_reading}
            known={known}
          />
        )}
      </ul>

      <PlacesLegend />
    </div>
  );
}
