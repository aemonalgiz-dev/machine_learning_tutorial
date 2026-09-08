"use client";

// The pieces every widget on the Markov chains page draws.
//
// A two-state chain is small enough to show as a grid of four numbers and as a
// picture of two circles with arrows between them, and a twenty-seven state
// chain is only readable as a grid of shaded cells, so all three drawings live
// here. So does the one way a state is named, since the space is a state of the
// letter chain and an invisible one, and a vowel is easier to read as a word
// than as a V. The API computes; these only draw.

import { ReactNode, useId } from "react";

export const BUTTON_CLASS =
  "rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700";
export const ACTIVE_CLASS =
  "rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition";

export const INDIGO = "#6366f1";
export const AMBER = "#f59e0b";
export const SLATE = "#94a3b8";
export const ROSE = "#f43f5e";
export const EMERALD = "#10b981";

// A state as a reader names it in a sentence.
export function stateName(state: string): string {
  if (state === "V") return "vowel";
  if (state === "C") return "consonant";
  if (state === " ") return "space";
  return state;
}

// A state as a mark in a crowded chart, where the space has to be visible.
export function stateMark(state: string): string {
  return state === " " ? "␣" : state;
}

// A probability written for reading rather than for arithmetic.
export function readProbability(value: number): string {
  if (value === 0) return "0";
  if (Math.abs(value) >= 0.0005) return value.toFixed(4);
  return value.toExponential(1);
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md bg-slate-50 px-2.5 py-1.5 dark:bg-slate-950/60">
      <p className="text-[11px] leading-tight text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="font-mono text-sm text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

export function Loading({ message }: { message: string | null }) {
  return (
    <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>
  );
}

export function Caption({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{children}</p>
  );
}

// A small square table, rows where a step starts and columns where it ends.
export function Grid({
  title,
  states,
  rows,
  read,
}: {
  title: string;
  states: string[];
  rows: number[][];
  read: (value: number) => string;
}) {
  return (
    <div>
      <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">{title}</p>
      <table className="border-collapse text-sm">
        <thead>
          <tr>
            <th />
            {states.map((state) => (
              <th
                key={state}
                className="px-2 pb-1 text-[11px] font-normal text-slate-500 dark:text-slate-400"
              >
                {stateName(state)} next
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={states[rowIndex]}>
              <th className="pr-2 text-right text-[11px] font-normal text-slate-500 dark:text-slate-400">
                after a {stateName(states[rowIndex])}
              </th>
              {row.map((value, columnIndex) => (
                <td
                  key={states[columnIndex]}
                  className="border border-slate-200 px-2 py-1 text-center font-mono text-slate-800 dark:border-slate-700 dark:text-slate-200"
                >
                  {read(value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Two states and the four arrows between them, each as thick as its chance.
export function TwoStateDiagram({ table }: { table: number[][] }) {
  const marker = `markov-arrow-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const arcs = [
    { key: "vc", d: "M 110 60 Q 160 20 210 60", p: table[0][1], x: 160, y: 30 },
    { key: "cv", d: "M 210 100 Q 160 140 110 100", p: table[1][0], x: 160, y: 142 },
    { key: "vv", d: "M 70 64 C 22 30, 22 130, 70 96", p: table[0][0], x: 30, y: 44 },
    { key: "cc", d: "M 250 64 C 298 30, 298 130, 250 96", p: table[1][1], x: 290, y: 44 },
  ];
  return (
    <svg viewBox="0 0 320 160" className="w-full max-w-xs select-none">
      <defs>
        <marker
          id={marker}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={SLATE} />
        </marker>
      </defs>
      {arcs.map((arc) =>
        arc.p === 0 ? null : (
          <g key={arc.key}>
            <path
              d={arc.d}
              fill="none"
              stroke={SLATE}
              strokeWidth={1 + 5 * arc.p}
              markerEnd={`url(#${marker})`}
            />
            <text
              x={arc.x}
              y={arc.y}
              textAnchor="middle"
              className="fill-slate-600 font-mono text-[11px] dark:fill-slate-300"
            >
              {arc.p.toFixed(3)}
            </text>
          </g>
        ),
      )}
      <circle cx={90} cy={80} r={26} fill={INDIGO} />
      <text x={90} y={84} textAnchor="middle" className="fill-white text-[11px] font-semibold">
        vowel
      </text>
      <circle cx={230} cy={80} r={26} fill="#64748b" />
      <text x={230} y={84} textAnchor="middle" className="fill-white text-[10px] font-semibold">
        consonant
      </text>
    </svg>
  );
}

// A table too big for numbers, drawn as cells shaded by their probability.
// The shade follows the square root, so a cell of a hundredth is still
// visible beside one of a half.
export function Heatmap({
  title,
  states,
  rows,
}: {
  title: string;
  states: string[];
  rows: number[][];
}) {
  const cell = 12;
  const margin = 14;
  const size = margin + states.length * cell;
  return (
    <div>
      <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">{title}</p>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-sm select-none rounded bg-slate-50 dark:bg-slate-950"
      >
        {states.map((state, index) => (
          <g key={`labels-${state}`}>
            <text
              x={margin + index * cell + cell / 2}
              y={10}
              textAnchor="middle"
              className="fill-slate-500 font-mono text-[8px] dark:fill-slate-400"
            >
              {stateMark(state)}
            </text>
            <text
              x={7}
              y={margin + index * cell + cell / 2 + 3}
              textAnchor="middle"
              className="fill-slate-500 font-mono text-[8px] dark:fill-slate-400"
            >
              {stateMark(state)}
            </text>
          </g>
        ))}
        {rows.map((row, rowIndex) =>
          row.map((value, columnIndex) => (
            <rect
              key={`${rowIndex}-${columnIndex}`}
              x={margin + columnIndex * cell}
              y={margin + rowIndex * cell}
              width={cell - 1}
              height={cell - 1}
              fill={INDIGO}
              opacity={value === 0 ? 0.04 : 0.12 + 0.88 * Math.sqrt(value)}
            >
              <title>
                {`${stateName(states[rowIndex])} then ${stateName(states[columnIndex])}, ${readProbability(value)}`}
              </title>
            </rect>
          )),
        )}
      </svg>
    </div>
  );
}
