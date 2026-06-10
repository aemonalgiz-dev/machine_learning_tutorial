"use client";

// The third chapter scored under every length of memory, in Markov's classes.
//
// Width zero knows only how common vowels are; width one is the chain the page
// has been counting; width k is a chain whose states are runs of k classes.
// Indigo is each chain as counted, which calls the chapter impossible once a
// run of classes turns up that the first two chapters never produced; amber is
// the same chains with half a step added to every cell. Every width is scored
// on the same positions. The API fits and scores every chain; the browser
// draws.

import { useEffect, useState } from "react";
import { MemoryView, fetchMemory, messageFor } from "@/lib/concepts/markov-chains";
import { AMBER, Caption, INDIGO, Loading, ROSE, Stat } from "./markovParts";

const WIDTH = 640;
const HEIGHT = 240;
const PAD_LEFT = 50;
const PAD_RIGHT = 16;
const PAD_TOP = 22;
const PAD_BOTTOM = 38;

export function MarkovMemorySweep() {
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

  const smoothings = Array.from(new Set(view.class_rows.map((row) => row.smoothing)));
  const widths = Array.from(new Set(view.class_rows.map((row) => row.width)));
  const scored = view.class_rows
    .map((row) => row.bits)
    .filter((bits): bits is number => bits !== null);
  const low = Math.floor(Math.min(...scored) * 50) / 50;
  const high = Math.ceil(Math.max(...scored) * 50) / 50;
  const toX = (width: number) =>
    PAD_LEFT + (width / widths[widths.length - 1]) * (WIDTH - PAD_LEFT - PAD_RIGHT);
  const toY = (bits: number) =>
    PAD_TOP + ((high - bits) / (high - low)) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
  const colours = [INDIGO, AMBER];
  const ticks: number[] = [];
  for (let tick = low; tick <= high + 1e-9; tick += 0.04) ticks.push(tick);

  const bestOf = (smoothing: number) =>
    view.class_rows
      .filter((row) => row.smoothing === smoothing && row.bits !== null)
      .reduce((chosen, row) =>
        (row.bits as number) < (chosen.bits as number) ? row : chosen,
      );

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {ticks.map((tick) => (
          <g key={tick.toFixed(2)}>
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
              {tick.toFixed(2)}
            </text>
          </g>
        ))}
        {smoothings.map((smoothing, index) => {
          const rows = view.class_rows.filter((row) => row.smoothing === smoothing);
          const drawn = rows.filter((row) => row.bits !== null);
          return (
            <g key={smoothing}>
              <path
                d={drawn
                  .map(
                    (row, position) =>
                      `${position === 0 ? "M" : "L"} ${toX(row.width).toFixed(1)} ${toY(row.bits as number).toFixed(1)}`,
                  )
                  .join(" ")}
                fill="none"
                stroke={colours[index]}
                strokeWidth={2}
              />
              {rows.map((row) =>
                row.bits === null ? (
                  <text
                    key={row.width}
                    x={toX(row.width)}
                    y={PAD_TOP - 6}
                    textAnchor="middle"
                    fill={ROSE}
                    className="font-mono text-[11px]"
                  >
                    impossible
                  </text>
                ) : (
                  <circle
                    key={row.width}
                    cx={toX(row.width)}
                    cy={toY(row.bits)}
                    r={3.5}
                    fill={colours[index]}
                  >
                    <title>{`${row.width} classes remembered, ${row.bits.toFixed(4)} bits`}</title>
                  </circle>
                ),
              )}
            </g>
          );
        })}
        {widths.map((width) => (
          <text
            key={width}
            x={toX(width)}
            y={HEIGHT - PAD_BOTTOM + 14}
            textAnchor="middle"
            className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
          >
            {width}
          </text>
        ))}
        <text
          x={(PAD_LEFT + WIDTH - PAD_RIGHT) / 2}
          y={HEIGHT - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          classes remembered, and bits per class on the third chapter
        </text>
      </svg>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="positions scored" value={view.class_positions.toLocaleString()} />
        <Stat label="positions set aside" value={view.class_positions_set_aside} />
        {smoothings.map((smoothing) => (
          <Stat
            key={smoothing}
            label={
              smoothing === 0
                ? "best as counted"
                : `best with ${smoothing} added per cell`
            }
            value={`${bestOf(smoothing).width} back, ${(bestOf(smoothing).bits as number).toFixed(4)}`}
          />
        ))}
      </div>
      <Caption>
        Indigo is each chain as counted and amber the same chains smoothed by
        a half. A position is set aside only when the widest chain has never
        met the run of classes before it, so every width is scored on exactly
        the same letters.
      </Caption>
    </div>
  );
}
