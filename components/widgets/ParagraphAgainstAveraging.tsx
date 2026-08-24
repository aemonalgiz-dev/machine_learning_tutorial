"use client";

// The learned document positions against the plain average of a document's
// word positions, scored the same way and timed the same way.
//
// The bar runs from the least alike pair inside one subject to the most alike
// pair across the two, so a bar whose ends are in the right order has a gap and
// a bar whose ends have crossed does not. The API fits, pools and times; the
// browser draws the three bars and the two clocks.

import { useEffect, useState } from "react";
import {
  AgainstAveraging,
  ApiError,
  fetchAgainstAveraging,
} from "@/lib/concepts/paragraph-vectors";
import {
  COOKING,
  FALLING,
  Legend,
  RISING,
  SAILING,
  Waiting,
} from "./paragraphVectorsShared";

const VIEW = { width: 640, height: 190 };
const PAD = { left: 210, right: 34, top: 22, bottom: 38 };

export function ParagraphAgainstAveraging() {
  const [data, setData] = useState<AgainstAveraging | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setData(await fetchAgainstAveraging());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!data) return <Waiting message={message} />;

  const rules = data.rules;
  const innerWidth = VIEW.width - PAD.left - PAD.right;
  const innerHeight = VIEW.height - PAD.top - PAD.bottom;
  const step = innerHeight / rules.length;
  const plotX = (value: number) => PAD.left + ((value + 0.2) / 1.25) * innerWidth;

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {rules.map((rule, index) => {
          const centre = PAD.top + step * (index + 0.5);
          const worst = plotX(rule.summary.worst_within);
          const best = plotX(rule.summary.best_across);
          const crossed = rule.summary.margin < 0;
          return (
            <g key={rule.rule}>
              <text
                x={PAD.left - 8}
                y={centre + 4}
                textAnchor="end"
                className="fill-slate-600 text-[10px] dark:fill-slate-400"
              >
                {rule.rule}
              </text>
              <line
                x1={Math.min(worst, best)}
                x2={Math.max(worst, best)}
                y1={centre}
                y2={centre}
                stroke={crossed ? RISING : FALLING}
                strokeWidth={3}
                opacity={0.5}
              />
              <circle cx={best} cy={centre} r={5} fill={SAILING} />
              <circle cx={worst} cy={centre} r={5} fill={COOKING} />
              <text
                x={PAD.left + innerWidth + 6}
                y={centre + 4}
                className="text-[10px]"
                fill={crossed ? RISING : FALLING}
              >
                {rule.summary.margin.toFixed(3)}
              </text>
            </g>
          );
        })}
        {[0, 0.5, 1].map((tick) => (
          <text
            key={tick}
            x={plotX(tick)}
            y={VIEW.height - PAD.bottom + 16}
            textAnchor="middle"
            className="fill-slate-500 text-[10px] dark:fill-slate-400"
          >
            {tick.toFixed(1)}
          </text>
        ))}
        <text
          x={PAD.left + innerWidth / 2}
          y={VIEW.height - 4}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          cosine between two documents
        </text>
      </svg>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                rule
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                held-out text, cooking
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                held-out text, sailing
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                seconds before the first text
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                seconds per text
              </th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr
                key={rule.rule}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1.5 pr-4 text-xs text-slate-800 dark:text-slate-200">
                  {rule.rule}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {rule.held_out.cooking.toFixed(4)}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {rule.held_out.sailing.toFixed(4)}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {rule.seconds_to_prepare.toFixed(3)}
                </td>
                <td className="py-1.5 font-mono text-slate-800 dark:text-slate-200">
                  {rule.seconds_per_text.toFixed(5)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Legend>
        The <span style={{ color: COOKING }}>indigo</span> dot is the least alike
        pair inside one subject and the <span style={{ color: SAILING }}>blue</span>{" "}
        dot the most alike pair across the two, so the bar is green where indigo
        lies to the right of blue and red where the two have crossed. Both learned
        rules are red here and the average of the words is green, which is the
        page&rsquo;s least comfortable measurement.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
