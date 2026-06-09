"use client";

// Every candidate the word list allows, drawn over the text it was drawn from.
//
// The API builds the candidates and finds the best path; the browser lays the
// positions out along a line and draws each candidate as an arc from where it
// starts to where it ends, stacked so that longer candidates ride higher. The
// arcs on the best path are filled in, the rest are outlines, and a reading is
// any set of arcs that runs from the left end to the right without a gap or an
// overlap. Each arc is labelled with what the candidate scores.

import { useEffect, useState } from "react";
import {
  Analysis,
  ScenariosView,
  fetchScenarios,
  messageFor,
  scenarioFor,
} from "@/lib/concepts/the-word-lattice";
import { CountsLine, Legend, Loading, WordsOfAReading, entriesOf } from "./wordLatticeParts";

const STEP = 62;
const LEFT = 26;
const BASE_Y = 128;
const ROW = 30;

function positionX(position: number): number {
  return LEFT + position * STEP;
}

function Board({ analysis }: { analysis: Analysis }) {
  const characters = Array.from(analysis.text);
  const width = LEFT * 2 + characters.length * STEP;
  const tallest = Math.max(...analysis.edges.map((edge) => edge.length), 1);
  const height = BASE_Y + 26;
  const top = BASE_Y - tallest * ROW - 30;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 ${top} ${width} ${height - top}`}
        style={{ minWidth: `${Math.min(width, 760)}px` }}
        className="w-full select-none rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400"
      >
        <line
          x1={positionX(0)}
          y1={BASE_Y}
          x2={positionX(characters.length)}
          y2={BASE_Y}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.4}
        />
        {Array.from({ length: characters.length + 1 }).map((_, position) => (
          <g key={`node-${position}`}>
            <circle
              cx={positionX(position)}
              cy={BASE_Y}
              r={3.5}
              fill="currentColor"
              opacity={0.55}
            />
            <text
              x={positionX(position)}
              y={BASE_Y + 20}
              textAnchor="middle"
              fontSize={10}
              fill="currentColor"
            >
              {position}
            </text>
          </g>
        ))}
        {characters.map((character, position) => (
          <text
            key={`character-${position}`}
            x={positionX(position) + STEP / 2}
            y={BASE_Y - 8}
            textAnchor="middle"
            fontSize={18}
            fill="currentColor"
            opacity={0.75}
          >
            {character}
          </text>
        ))}
        {analysis.edges.map((edge) => {
          const startX = positionX(edge.start);
          const endX = positionX(edge.end);
          const apex = BASE_Y - edge.length * ROW;
          const colour = edge.on_best_path
            ? "#10b981"
            : edge.frequency > 0
              ? "#0ea5e9"
              : "#f59e0b";
          return (
            <g key={`${edge.start}-${edge.end}-${edge.word}`}>
              <title>
                {`${edge.word}, characters ${edge.start} to ${edge.end}, ` +
                  `${edge.frequency === 0 ? "no entry, worth one count" : `counted ${edge.frequency} times`}` +
                  `, scoring ${edge.log_score.toFixed(4)}`}
              </title>
              <path
                d={`M ${startX} ${BASE_Y - 6} Q ${(startX + endX) / 2} ${apex - 16} ${endX} ${BASE_Y - 6}`}
                fill="none"
                stroke={colour}
                strokeWidth={edge.on_best_path ? 2.6 : 1.2}
                opacity={edge.on_best_path ? 1 : 0.55}
              />
              <text
                x={(startX + endX) / 2}
                y={apex - 6}
                textAnchor="middle"
                fontSize={12}
                fill={colour}
                opacity={edge.on_best_path ? 1 : 0.85}
              >
                {edge.word}
              </text>
              <text
                x={(startX + endX) / 2}
                y={apex + 7}
                textAnchor="middle"
                fontSize={9}
                fill={colour}
                opacity={0.8}
              >
                {edge.log_score.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function LatticeBoard({
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

  const analysis = scenarioFor(scenarios, chosen);
  const entries = entriesOf(analysis.edges);

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
        {analysis.word_list_label}, {analysis.n_words_in_list} words counted{" "}
        {analysis.total_frequency} times between them
      </p>

      <Board analysis={analysis} />

      <p className="mt-3 mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        The best path, scoring {analysis.best.total_log_score.toFixed(4)}
      </p>
      <WordsOfAReading words={analysis.best.words} entries={entries} />
      <div className="mt-3">
        <CountsLine
          n_characters={analysis.n_characters}
          n_cuts={analysis.n_cuts}
          n_readings={analysis.n_readings}
          n_edges={analysis.n_edges}
        />
      </div>
      <Legend />
    </div>
  );
}
