"use client";

// The same eight words in two orders, against two starting draws of one order.
//
// A rule reads the order the words came in only where the first column is below
// the other two, since two starting draws of one ordering measure how much of
// the difference is the descent rather than the text. The API runs every
// descent and the pooling; the browser draws the comparison.

import { useEffect, useState } from "react";
import {
  ApiError,
  OrderProbe as OrderProbeData,
  fetchOrderProbe,
} from "@/lib/concepts/paragraph-vectors";
import { COOKING, FALLING, Legend, NEUTRAL, Waiting } from "./paragraphVectorsShared";

const VIEW = { width: 640, height: 200 };
const PAD = { left: 200, right: 60, top: 22, bottom: 38 };

export function ParagraphOrderProbe() {
  const [data, setData] = useState<OrderProbeData | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setData(await fetchOrderProbe());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!data) return <Waiting message={message} />;

  const rows = data.rows;
  const innerWidth = VIEW.width - PAD.left - PAD.right;
  const innerHeight = VIEW.height - PAD.top - PAD.bottom;
  const step = innerHeight / rows.length;
  const lowest = 0.5;
  const plotX = (value: number) =>
    PAD.left + ((Math.max(lowest, value) - lowest) / (1 - lowest)) * innerWidth;

  return (
    <div>
      <p className="mb-3 font-mono text-xs text-slate-700 dark:text-slate-300">
        {data.text}
        <br />
        {data.shuffled}
      </p>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {rows.map((row, index) => {
          const centre = PAD.top + step * (index + 0.5);
          const label =
            row.passes > 0 ? `${row.rule}, ${row.passes} passes` : row.rule;
          return (
            <g key={label}>
              <text
                x={PAD.left - 8}
                y={centre + 4}
                textAnchor="end"
                className="fill-slate-600 text-[10px] dark:fill-slate-400"
              >
                {label}
              </text>
              <line
                x1={plotX(row.two_starts_first)}
                x2={plotX(row.two_starts_second)}
                y1={centre}
                y2={centre}
                stroke={NEUTRAL}
                strokeWidth={7}
                strokeLinecap="round"
                opacity={0.55}
              />
              <circle
                cx={plotX(row.two_orders)}
                cy={centre}
                r={5}
                fill={row.reads_order ? FALLING : COOKING}
              />
              <text
                x={PAD.left + innerWidth + 8}
                y={centre + 4}
                className="fill-slate-700 text-[10px] dark:fill-slate-300"
              >
                {row.two_orders.toFixed(4)}
              </text>
            </g>
          );
        })}
        {[0.5, 0.75, 1].map((tick) => (
          <text
            key={tick}
            x={plotX(tick)}
            y={VIEW.height - PAD.bottom + 16}
            textAnchor="middle"
            className="fill-slate-500 text-[10px] dark:fill-slate-400"
          >
            {tick.toFixed(2)}
          </text>
        ))}
        <text
          x={PAD.left + innerWidth / 2}
          y={VIEW.height - 4}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          cosine between the two answers
        </text>
      </svg>

      <Legend>
        The grey band is the control, which is how far apart two starting draws
        of the identical ordering come out; the dot is how far apart the two
        orderings come out. A dot inside or to the right of the band means the
        rule did not read the order, and the one{" "}
        <span style={{ color: FALLING }}>green</span> dot, where it sits well to
        the left, is the only row on the page where the order of the words
        changed the answer by more than the descent&rsquo;s own noise.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
