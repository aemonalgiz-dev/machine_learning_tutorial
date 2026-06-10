"use client";

// Two real pairs of held-out pictures, placed by the tower trained on pairs.
//
// Each pair shows its two pictures, the eight numbers the tower gave each,
// the gap between them, and what the contrastive loss makes of that gap under
// the pair's true label and under the other one. The API computes all of it
// with the training's own loss function; the browser draws the bars.

import { useEffect, useState } from "react";
import {
  WorkedPairAnswer,
  fetchWorkedPairs,
} from "@/lib/concepts/learning-the-metric-itself";
import {
  Buttons,
  KIND_COLOUR,
  Pending,
  PictureCells,
  Stat,
  asKind,
  messageOf,
} from "@/components/widgets/learningTheMetricShared";

const BARS = { width: 300, height: 86, middle: 43, scale: 14 };

function PositionBars({
  first,
  second,
  firstColour,
  secondColour,
}: {
  first: number[];
  second: number[];
  firstColour: string;
  secondColour: string;
}) {
  const slot = (BARS.width - 20) / first.length;
  return (
    <svg
      viewBox={`0 0 ${BARS.width} ${BARS.height}`}
      className="w-full rounded-lg bg-slate-50 dark:bg-slate-950"
      role="img"
      aria-label="The eight numbers of each position, side by side"
    >
      <line x1={10} x2={BARS.width - 10} y1={BARS.middle} y2={BARS.middle} className="stroke-slate-300 dark:stroke-slate-700" />
      {first.map((value, index) => {
        const x = 10 + index * slot;
        const other = second[index];
        return (
          <g key={index}>
            <rect
              x={x + slot * 0.15}
              width={slot * 0.3}
              y={value >= 0 ? BARS.middle - value * BARS.scale : BARS.middle}
              height={Math.abs(value) * BARS.scale}
              fill={firstColour}
            />
            <rect
              x={x + slot * 0.5}
              width={slot * 0.3}
              y={other >= 0 ? BARS.middle - other * BARS.scale : BARS.middle}
              height={Math.abs(other) * BARS.scale}
              fill={secondColour}
              opacity={0.75}
            />
            <text x={x + slot * 0.5} y={BARS.height - 3} fontSize={8} textAnchor="middle" className="fill-slate-400">
              {index + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function WorkedPairBoard() {
  const [answer, setAnswer] = useState<WorkedPairAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [which, setWhich] = useState(0);

  useEffect(() => {
    let current = true;
    fetchWorkedPairs()
      .then((loaded) => {
        if (current) setAnswer(loaded);
      })
      .catch((error) => {
        if (current) setMessage(messageOf(error));
      });
    return () => {
      current = false;
    };
  }, []);

  if (!answer) return <Pending message={message} />;
  const pair = answer.pairs[which];
  const firstKind = asKind(pair.first.kind);
  const secondKind = asKind(pair.second.kind);
  const secondColour =
    firstKind === secondKind ? "#a5b4fc" : KIND_COLOUR[secondKind];

  return (
    <div>
      <div className="mb-3">
        <Buttons
          options={answer.pairs.map((candidate, index) => ({
            value: index,
            label: candidate.title,
          }))}
          value={which}
          onChange={setWhich}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-3">
          <PictureCells rows={pair.first.rows} cell={6} kind={firstKind} />
          <PictureCells rows={pair.second.rows} cell={6} kind={secondKind} />
        </div>
        <div className="min-w-[16rem] flex-1">
          <PositionBars
            first={pair.first_position}
            second={pair.second_position}
            firstColour={KIND_COLOUR[firstKind]}
            secondColour={secondColour}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The {answer.width} numbers of each position, the first picture&rsquo;s
            on the left of each slot.
          </p>
        </div>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <tbody className="font-mono text-slate-700 dark:text-slate-300">
            {(
              [
                ["first", pair.first_position],
                ["second", pair.second_position],
                ["gap", pair.gap],
              ] as const
            ).map(([label, values]) => (
              <tr key={label} className="border-b border-slate-100 dark:border-slate-800/60">
                <td className="py-1 pr-3 font-sans text-slate-500 dark:text-slate-400">{label}</td>
                {values.map((value, index) => (
                  <td key={index} className="py-1 pr-2 text-right">
                    {value.toFixed(4)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="distance between positions" value={pair.distance.toFixed(4)} />
        <Stat label={`loss, as ${pair.same_kind ? "one kind" : "two kinds"}`} value={pair.loss.toFixed(4)} />
        <Stat label="loss if one kind" value={pair.loss_if_same.toFixed(4)} />
        <Stat label="loss if two kinds" value={pair.loss_if_different.toFixed(4)} />
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The margin is {answer.margin}. The same two pictures are{" "}
        {pair.pixel_distance.toFixed(4)} apart pixel by pixel, over 256 numbers
        rather than {answer.width}.
      </p>
    </div>
  );
}
