"use client";

// What a bagged member and a boosted member are each fitted to, and what
// the two frames make of the same stump.
//
// The targets panel lays out the first three members of a bagged committee
// beside the first three rounds of a boosted one. A bagged member's picture
// is the heights of the training rows its resample drew, a dot per draw so
// a row drawn twice is drawn twice; a boosted round's picture is every
// training row against the miss the committee so far had there, which is
// the only thing that round ever sees. The curves panel draws three
// committees of one size on the sixty-measurement throw, deep bagged trees,
// bagged stumps and boosted stumps, with each one's scores. The API fits
// all three on the same seeded deal; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { FittedTarget, VersusBagging, compareWithBagging } from "@/lib/concepts/gradient-boosting";
import { BAGGING_COLOUR, BOOSTING_COLOUR, STUMPS_COLOUR, THROW_DOMAIN } from "./gradientBoostingFixtures";

const SMALL = { width: 200, height: 150 };
const SMALL_PAD = { left: 30, right: 8, top: 10, bottom: 22 };
const VIEW = { width: 640, height: 320 };
const PAD = { left: 52, right: 16, top: 14, bottom: 34 };

export function MemberTargets({
  points,
  nMembers = 50,
  learningRate = 0.3,
  panel = "targets",
}: {
  points: Point[];
  nMembers?: number;
  learningRate?: number;
  panel?: "targets" | "curves";
}) {
  const [versus, setVersus] = useState<VersusBagging | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setVersus(await compareWithBagging(points, nMembers, learningRate));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [points, nMembers, learningRate]);

  if (!versus) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  if (panel === "targets") {
    return (
      <div>
        <p className="mb-2 text-sm font-medium" style={{ color: BAGGING_COLOUR }}>
          Bagged members, each fitted to the heights of its own resample
        </p>
        <div className="grid grid-cols-3 gap-2">
          {versus.bagged_deep.fitted_targets.map((target) => (
            <TargetPanel key={target.position} target={target} colour={BAGGING_COLOUR} yMin={THROW_DOMAIN.yMin} yMax={THROW_DOMAIN.yMax} caption={`member ${target.position + 1}, ${target.distinct_rows} of ${versus.training_times.length} rows`} />
          ))}
        </div>
        <p className="mb-2 mt-4 text-sm font-medium" style={{ color: BOOSTING_COLOUR }}>
          Boosted rounds, each fitted to what the committee so far still gets wrong
        </p>
        <div className="grid grid-cols-3 gap-2">
          {versus.boosted.fitted_targets.map((target) => {
            const largest = Math.max(...versus.boosted.fitted_targets.flatMap((each) => each.targets.map((value) => Math.abs(value))));
            const sum = target.targets.reduce((total, value) => total + value * value, 0);
            return (
              <TargetPanel key={target.position} target={target} colour={BOOSTING_COLOUR} yMin={-largest} yMax={largest} zeroLine caption={`round ${target.position + 1}, all ${target.distinct_rows} rows, squared misses ${sum.toFixed(1)}`} />
            );
          })}
        </div>
        {message && <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
      </div>
    );
  }

  const plotWidth = VIEW.width - PAD.left - PAD.right;
  const plotHeight = VIEW.height - PAD.top - PAD.bottom;
  const toX = (x: number) => PAD.left + ((x - THROW_DOMAIN.xMin) / (THROW_DOMAIN.xMax - THROW_DOMAIN.xMin)) * plotWidth;
  const toY = (y: number) => PAD.top + (1 - (y - THROW_DOMAIN.yMin) / (THROW_DOMAIN.yMax - THROW_DOMAIN.yMin)) * plotHeight;
  const path = (curve: { x: number; y: number }[]) =>
    curve.map((point, index) => `${index === 0 ? "M" : "L"} ${toX(point.x).toFixed(1)} ${toY(point.y).toFixed(1)}`).join(" ");
  const held = new Set(versus.held_out_indices);
  const committees = [
    { scores: versus.bagged_deep, colour: BAGGING_COLOUR, label: "deep bagged trees" },
    { scores: versus.bagged_stumps, colour: STUMPS_COLOUR, label: "bagged stumps" },
    { scores: versus.boosted, colour: BOOSTING_COLOUR, label: "boosted stumps" },
  ];
  const number = (value: number | null) => (value === null ? "none" : value.toFixed(4));

  return (
    <div>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {[0, 5, 10, 15, 20, 25].map((tick) => (
          <g key={`y${tick}`}>
            <line x1={PAD.left} y1={toY(tick)} x2={PAD.left + plotWidth} y2={toY(tick)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <text x={PAD.left - 8} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">{tick}</text>
          </g>
        ))}
        {[0, 1, 2, 3, 4].map((tick) => (
          <text key={`x${tick}`} x={toX(tick)} y={PAD.top + plotHeight + 16} textAnchor="middle" className="fill-slate-400 text-[11px]">{tick}</text>
        ))}
        {points.map((point, index) => (
          <circle key={index} cx={toX(point.x)} cy={toY(point.y)} r={3.5} className={held.has(index) ? "fill-white stroke-slate-500 dark:fill-slate-900 dark:stroke-slate-400" : "fill-slate-600 stroke-white dark:fill-slate-300 dark:stroke-slate-900"} strokeWidth={1.2} />
        ))}
        {committees.map((committee) => (
          <path key={committee.label} d={path(committee.scores.curve)} fill="none" stroke={committee.colour} strokeWidth={2.2} />
        ))}
        <text x={PAD.left + plotWidth / 2} y={VIEW.height - 4} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">Time (s)</text>
      </svg>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">{nMembers} members</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">training R²</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">held-out R²</th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">out-of-bag R²</th>
            </tr>
          </thead>
          <tbody>
            {committees.map((committee) => (
              <tr key={committee.label} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-1.5 pr-4 font-medium" style={{ color: committee.colour }}>{committee.label}</td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{number(committee.scores.train_r_squared)}</td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{number(committee.scores.held_out_r_squared)}</td>
                <td className="py-1.5 font-mono text-slate-800 dark:text-slate-200">{number(committee.scores.out_of_bag_r_squared)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Hollow readings are the {versus.held_out_indices.length} held out; the boosted stumps use a rate of {learningRate.toFixed(2)}, and only the bagged committees can score themselves out of bag.
      </p>
      {message && <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}

function TargetPanel({
  target,
  colour,
  yMin,
  yMax,
  zeroLine = false,
  caption,
}: {
  target: FittedTarget;
  colour: string;
  yMin: number;
  yMax: number;
  zeroLine?: boolean;
  caption: string;
}) {
  const plotWidth = SMALL.width - SMALL_PAD.left - SMALL_PAD.right;
  const plotHeight = SMALL.height - SMALL_PAD.top - SMALL_PAD.bottom;
  const toX = (x: number) => SMALL_PAD.left + ((x - THROW_DOMAIN.xMin) / (THROW_DOMAIN.xMax - THROW_DOMAIN.xMin)) * plotWidth;
  const toY = (y: number) => SMALL_PAD.top + (1 - (y - yMin) / (yMax - yMin)) * plotHeight;
  return (
    <div>
      <svg viewBox={`0 0 ${SMALL.width} ${SMALL.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {zeroLine && <line x1={SMALL_PAD.left} y1={toY(0)} x2={SMALL.width - SMALL_PAD.right} y2={toY(0)} stroke="currentColor" className="text-slate-300 dark:text-slate-700" />}
        {[yMin, yMax].map((tick) => (
          <text key={tick} x={SMALL_PAD.left - 4} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[9px]">{tick.toFixed(0)}</text>
        ))}
        {target.times.map((time, index) => (
          <circle key={index} cx={toX(time)} cy={toY(target.targets[index])} r={2.6} fill={colour} opacity={0.55} />
        ))}
        <text x={SMALL.width / 2} y={SMALL.height - 6} textAnchor="middle" className="fill-slate-400 text-[9px]">time</text>
      </svg>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{caption}</p>
    </div>
  );
}
