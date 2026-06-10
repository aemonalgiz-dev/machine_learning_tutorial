"use client";

// Where two letters of memory lose to one, and then to none.
//
// The third chapter scored in bits per letter under three models, across seven
// smoothings. Grey knows only how common each letter is, indigo is the letter
// chain, and rose is the chain whose states are pairs of letters. The pair
// chain cannot be scored at all without smoothing, since the third chapter
// takes steps it never counted, and with too much of it the pair chain falls
// below the model that remembers nothing, because the added counts land on
// pairs that cannot follow. Every model is scored on the same positions. The
// API fits and scores each; the browser draws.

import { useEffect, useState } from "react";
import { MemoryView, fetchMemory, messageFor } from "@/lib/concepts/markov-chains";
import { Caption, INDIGO, Loading, ROSE, SLATE, Stat } from "./markovParts";

const WIDTH = 640;
const HEIGHT = 250;
const PAD_LEFT = 50;
const PAD_RIGHT = 16;
const PAD_TOP = 22;
const PAD_BOTTOM = 40;

const LINES = [
  { width: 0, name: "letter shares alone", colour: SLATE },
  { width: 1, name: "one letter of memory", colour: INDIGO },
  { width: 2, name: "two letters of memory", colour: ROSE },
];

export function MarkovSmoothingSweep() {
  const [view, setView] = useState<MemoryView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchMemory());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) return <Loading message={message} />;

  const smoothings = Array.from(new Set(view.letter_rows.map((row) => row.smoothing)));
  const scored = view.letter_rows
    .map((row) => row.bits)
    .filter((bits): bits is number => bits !== null);
  const low = Math.floor(Math.min(...scored) * 5) / 5;
  const high = Math.ceil(Math.max(...scored) * 5) / 5;
  const toX = (index: number) =>
    PAD_LEFT + (index / (smoothings.length - 1)) * (WIDTH - PAD_LEFT - PAD_RIGHT);
  const toY = (bits: number) =>
    PAD_TOP + ((high - bits) / (high - low)) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
  const ticks: number[] = [];
  for (let tick = low; tick <= high + 1e-9; tick += 0.2) ticks.push(tick);
  const at = (width: number, smoothing: number) =>
    view.letter_rows.find((row) => row.width === width && row.smoothing === smoothing);
  const pairs = view.letter_rows.filter((row) => row.width === 2 && row.bits !== null);
  const bestPair = pairs.reduce((chosen, row) =>
    (row.bits as number) < (chosen.bits as number) ? row : chosen,
  );
  const heaviest = smoothings[smoothings.length - 1];

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {ticks.map((tick) => (
          <g key={tick.toFixed(1)}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={toY(tick)}
              y2={toY(tick)}
              className="stroke-slate-200 dark:stroke-slate-800"
            />
            <text
              x={PAD_LEFT - 6}
              y={toY(tick) + 3}
              textAnchor="end"
              className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
            >
              {tick.toFixed(1)}
            </text>
          </g>
        ))}
        {LINES.map((line) => {
          const points = smoothings
            .map((smoothing, index) => ({ index, row: at(line.width, smoothing) }))
            .filter((point) => point.row !== undefined);
          const drawn = points.filter((point) => point.row?.bits !== null);
          return (
            <g key={line.name}>
              <path
                d={drawn
                  .map(
                    (point, position) =>
                      `${position === 0 ? "M" : "L"} ${toX(point.index).toFixed(1)} ${toY(point.row?.bits as number).toFixed(1)}`,
                  )
                  .join(" ")}
                fill="none"
                stroke={line.colour}
                strokeWidth={2}
              />
              {points.map((point) =>
                point.row?.bits === null || point.row?.bits === undefined ? (
                  <text
                    key={point.index}
                    x={toX(point.index)}
                    y={PAD_TOP - 6}
                    textAnchor="middle"
                    fill={line.colour}
                    className="font-mono text-[10px]"
                  >
                    impossible
                  </text>
                ) : (
                  <circle
                    key={point.index}
                    cx={toX(point.index)}
                    cy={toY(point.row.bits)}
                    r={3.5}
                    fill={line.colour}
                  >
                    <title>{`${line.name}, ${point.row.bits.toFixed(4)} bits`}</title>
                  </circle>
                ),
              )}
            </g>
          );
        })}
        {smoothings.map((smoothing, index) => (
          <text
            key={smoothing}
            x={toX(index)}
            y={HEIGHT - PAD_BOTTOM + 14}
            textAnchor="middle"
            className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
          >
            {smoothing === 0 ? "none" : smoothing}
          </text>
        ))}
        <text
          x={(PAD_LEFT + WIDTH - PAD_RIGHT) / 2}
          y={HEIGHT - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          steps added to every cell before dividing, and bits per letter on the
          third chapter
        </text>
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
        {LINES.map((line) => (
          <span key={line.name} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: line.colour }}
            />
            {line.name}
          </span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label={`two letters, best, at ${bestPair.smoothing}`}
          value={(bestPair.bits as number).toFixed(4)}
        />
        <Stat
          label={`two letters, at ${heaviest}`}
          value={at(2, heaviest)?.bits?.toFixed(4) ?? "…"}
        />
        <Stat
          label={`letter shares alone, at ${heaviest}`}
          value={at(0, heaviest)?.bits?.toFixed(4) ?? "…"}
        />
        <Stat
          label="positions scored"
          value={view.letter_positions.toLocaleString()}
        />
      </div>
      <Caption>
        The best setting for the pair chain was read off the same chapter it
        is scored on, so its number is the most flattering one available. The
        axis steps are not evenly spaced in value; each is one setting tried.
      </Caption>
    </div>
  );
}
