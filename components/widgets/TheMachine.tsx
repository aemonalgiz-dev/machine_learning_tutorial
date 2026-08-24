"use client";

// The small grammar drawn as the machine it is: states, and steps between them.
//
// The API sends every state and every line of the grammar; the browser places
// the states, groups the lines by where they lead, and draws one labelled step
// per group. Nothing here decides what may follow what, and the table below the
// drawing is the same grammar written out line by line, so a reader can check
// the picture against the text it was drawn from.

import { useEffect, useState } from "react";
import {
  GrammarView,
  Line,
  fetchMachine,
  grammarFor,
  messageFor,
} from "@/lib/concepts/finite-state-morphology";
import { Loading, Stat } from "./morphologyParts";

const END = "the end of the word";

function grouped(lines: Line[]): { goesTo: string; surfaces: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const line of lines) {
    const held = groups.get(line.goes_to) ?? [];
    if (!held.includes(line.surface)) {
      held.push(line.surface);
    }
    groups.set(line.goes_to, held);
  }
  return [...groups].map(([goesTo, surfaces]) => ({ goesTo, surfaces }));
}

function Diagram({ grammar }: { grammar: GrammarView }) {
  const start = grammar.states.find((state) => state.is_start);
  const middle = grammar.states.filter((state) => !state.is_start);
  if (!start) {
    return null;
  }

  const height = 90 + middle.length * 74;
  const startY = height / 2;
  const middleY = (position: number) => 56 + position * 74;

  const fromStart = grouped(start.lines);
  const toEndFromStart = fromStart.find((group) => group.goesTo === END);

  return (
    <svg
      viewBox={`0 0 760 ${height}`}
      className="w-full"
      role="img"
      aria-label="The states of the grammar and the steps between them"
    >
      <defs>
        <marker
          id="morph-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-400" />
        </marker>
      </defs>

      {middle.map((state, position) => {
        const group = fromStart.find((each) => each.goesTo === state.name);
        const y = middleY(position);
        return (
          <g key={state.name}>
            {group && (
              <>
                <path
                  d={`M 118 ${startY} C 220 ${startY}, 220 ${y}, 300 ${y}`}
                  className="fill-none stroke-slate-300 dark:stroke-slate-600"
                  strokeWidth="1.5"
                  markerEnd="url(#morph-arrow)"
                />
                <text
                  x="212"
                  y={(startY + y) / 2 - 6}
                  textAnchor="middle"
                  className="fill-slate-500 font-mono text-[11px] dark:fill-slate-400"
                >
                  {group.surfaces.join("  ")}
                </text>
              </>
            )}
            <rect
              x="300"
              y={y - 17}
              width="230"
              height="34"
              rx="8"
              className="fill-violet-50 stroke-violet-300 dark:fill-violet-950/40 dark:stroke-violet-500/60"
              strokeWidth="1.5"
            />
            <text
              x="415"
              y={y + 4}
              textAnchor="middle"
              className="fill-slate-800 text-[12px] dark:fill-slate-100"
            >
              {state.name}
            </text>
            <path
              d={`M 530 ${y} C 600 ${y}, 600 ${startY}, 676 ${startY}`}
              className="fill-none stroke-slate-300 dark:stroke-slate-600"
              strokeWidth="1.5"
              markerEnd="url(#morph-arrow)"
            />
            <text
              x="608"
              y={(startY + y) / 2 - 6}
              textAnchor="middle"
              className="fill-slate-500 font-mono text-[11px] dark:fill-slate-400"
            >
              {grouped(state.lines)
                .flatMap((each) => each.surfaces)
                .join("  ")}
            </text>
          </g>
        );
      })}

      {toEndFromStart && (
        <>
          <path
            d={`M 118 ${startY + 14} C 340 ${height - 6}, 460 ${height - 6}, 676 ${startY + 14}`}
            className="fill-none stroke-slate-300 dark:stroke-slate-600"
            strokeWidth="1.5"
            markerEnd="url(#morph-arrow)"
          />
          <text
            x="397"
            y={height - 10}
            textAnchor="middle"
            className="fill-slate-500 font-mono text-[11px] dark:fill-slate-400"
          >
            {toEndFromStart.surfaces.join("  ")}
          </text>
        </>
      )}

      <rect
        x="14"
        y={startY - 17}
        width="104"
        height="34"
        rx="8"
        className="fill-sky-50 stroke-sky-400 dark:fill-sky-950/40 dark:stroke-sky-500"
        strokeWidth="2"
      />
      <text
        x="66"
        y={startY + 4}
        textAnchor="middle"
        className="fill-slate-800 text-[12px] dark:fill-slate-100"
      >
        {start.name}
      </text>

      <circle
        cx="710"
        cy={startY}
        r="26"
        className="fill-emerald-50 stroke-emerald-400 dark:fill-emerald-950/40 dark:stroke-emerald-500"
        strokeWidth="2"
      />
      <circle
        cx="710"
        cy={startY}
        r="20"
        className="fill-none stroke-emerald-400 dark:stroke-emerald-500"
        strokeWidth="1"
      />
      <text
        x="710"
        y={startY + 4}
        textAnchor="middle"
        className="fill-slate-800 text-[11px] dark:fill-slate-100"
      >
        end
      </text>
    </svg>
  );
}

export function TheMachine({ grammarKey = "small" }: { grammarKey?: string }) {
  const [grammar, setGrammar] = useState<GrammarView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setGrammar(grammarFor(await fetchMachine(), grammarKey));
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, [grammarKey]);

  if (!grammar) {
    return <Loading message={message} />;
  }

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="states" value={`${grammar.n_states}`} />
        <Stat label="lines written" value={`${grammar.n_written_lines}`} />
        <Stat label="words accepted" value={`${grammar.n_forms}`} />
        <Stat label="readings of those" value={`${grammar.n_paths}`} />
      </div>

      <Diagram grammar={grammar} />

      <p className="mb-1 mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
        The same grammar written out, one line per step
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                in state
              </th>
              <th className="py-1 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                read
              </th>
              <th className="py-1 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                call it
              </th>
              <th className="py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                then go to
              </th>
            </tr>
          </thead>
          <tbody>
            {grammar.states.flatMap((state) =>
              state.lines.map((line, position) => (
                <tr
                  key={`${state.name}-${position}-${line.surface}-${line.label}-${line.goes_to}`}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                >
                  <td className="py-1 pr-4 text-xs text-slate-500 dark:text-slate-400">
                    {position === 0 ? state.name : ""}
                  </td>
                  <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">
                    {line.surface}
                  </td>
                  <td className="py-1 pr-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {line.label}
                  </td>
                  <td className="py-1 text-xs text-slate-600 dark:text-slate-400">
                    {line.goes_to}
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {grammar.sample_forms.length < grammar.n_forms
          ? `The first ${grammar.sample_forms.length} words it accepts, of ${grammar.n_forms}`
          : `Every word this grammar accepts, all ${grammar.n_forms} of them`}
      </p>
      <p className="font-mono text-xs text-slate-700 dark:text-slate-300">
        {grammar.sample_forms.join(", ")}
      </p>
    </div>
  );
}
