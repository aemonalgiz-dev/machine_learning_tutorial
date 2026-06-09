"use client";

// The middle-versus-ends pattern no straight boundary can express, and the
// constant that a classifier settles for instead.
//
// The three standardised people sit on one line at −1, 0 and +1, and the
// teenager-versus-rest classifier has to call the middle one yes and both
// ends no. A single threshold splits the line into a left and a right, so
// wherever the reader drags it, one end shares a side with the middle. The
// second panel gives up on the feature and asks what one constant
// probability for everyone costs: the log loss over one yes and two nos is
// lowest at exactly one third, the observed rate. Both are definitions
// drawn; the library's own fit reaches the same third and the same
// intercept of ln(1/2), which the page quotes from the API.

import { useState } from "react";

const PEOPLE = [
  { position: -1, name: "child", positive: false },
  { position: 0, name: "teenager", positive: true },
  { position: 1, name: "adult", positive: false },
];

const LINE = { width: 640, height: 110 };
const LINE_PAD = { left: 40, right: 40 };

const LOSS = { width: 640, height: 220 };
const LOSS_PAD = { left: 52, right: 16, top: 12, bottom: 36 };

function lineX(position: number) {
  return LINE_PAD.left + ((position + 1.5) / 3) * (LINE.width - LINE_PAD.left - LINE_PAD.right);
}

function constantLoss(probability: number) {
  return -(Math.log(probability) + 2 * Math.log(1 - probability)) / 3;
}

export function ImpossibleSeparation() {
  const [threshold, setThreshold] = useState(0.4);
  const [constant, setConstant] = useState(0.5);

  const plot = { width: LOSS.width - LOSS_PAD.left - LOSS_PAD.right, height: LOSS.height - LOSS_PAD.top - LOSS_PAD.bottom };
  const lossX = (probability: number) => LOSS_PAD.left + probability * plot.width;
  const lossTop = 2.5;
  const lossY = (loss: number) => LOSS_PAD.top + (1 - Math.min(loss, lossTop) / lossTop) * plot.height;
  const lossCurve = Array.from({ length: 97 }, (_, index) => {
    const probability = 0.02 + (0.96 * index) / 96;
    return `${index === 0 ? "M" : "L"} ${lossX(probability).toFixed(1)} ${lossY(constantLoss(probability)).toFixed(1)}`;
  }).join(" ");

  const called = PEOPLE.map((person) => person.position >= threshold);
  const correct = PEOPLE.filter((person, index) => called[index] === person.positive).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">One threshold on one line</p>
        <svg viewBox={`0 0 ${LINE.width} ${LINE.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
          <rect x={lineX(threshold)} y={20} width={lineX(1.5) - lineX(threshold)} height={50} className="fill-emerald-100/70 dark:fill-emerald-900/30" />
          <rect x={lineX(-1.5)} y={20} width={lineX(threshold) - lineX(-1.5)} height={50} className="fill-rose-100/70 dark:fill-rose-900/30" />
          <line x1={lineX(-1.5)} y1={45} x2={lineX(1.5)} y2={45} stroke="currentColor" className="text-slate-400" strokeWidth={2} />
          <line x1={lineX(threshold)} y1={14} x2={lineX(threshold)} y2={76} stroke="#0f172a" strokeWidth={2.5} strokeDasharray="5 3" className="dark:stroke-slate-100" />
          {PEOPLE.map((person, index) => (
            <g key={person.name}>
              <circle cx={lineX(person.position)} cy={45} r={10} fill={person.positive ? "#10b981" : "#ef4444"} stroke={called[index] === person.positive ? "white" : "#0f172a"} strokeWidth={called[index] === person.positive ? 1.5 : 3} />
              <text x={lineX(person.position)} y={92} textAnchor="middle" className="fill-slate-500 text-[11px] dark:fill-slate-400">{person.name}, {person.positive ? "yes" : "no"}</text>
            </g>
          ))}
          <text x={lineX(1.5)} y={12} textAnchor="end" className="fill-emerald-700 text-[10px] dark:fill-emerald-300">called yes</text>
          <text x={lineX(-1.5)} y={12} className="fill-rose-700 text-[10px] dark:fill-rose-300">called no</text>
        </svg>
        <input type="range" min={-1.5} max={1.5} step={0.05} value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} className="mt-2 w-full accent-slate-700" />
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          {correct} of 3 right. Wherever the threshold sits, the middle shares a side with one end, and {correct === 2 ? "one person is called wrongly, ringed in black" : "two are called wrongly"}. No placement isolates the middle.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">One constant probability for everyone</p>
        <svg viewBox={`0 0 ${LOSS.width} ${LOSS.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
          {[0, 1, 2].map((tick) => (
            <g key={tick}>
              <line x1={LOSS_PAD.left} y1={lossY(tick)} x2={LOSS_PAD.left + plot.width} y2={lossY(tick)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <text x={LOSS_PAD.left - 8} y={lossY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">{tick}</text>
            </g>
          ))}
          <line x1={lossX(1 / 3)} y1={LOSS_PAD.top} x2={lossX(1 / 3)} y2={LOSS_PAD.top + plot.height} stroke="#10b981" strokeDasharray="4 3" />
          <path d={lossCurve} fill="none" stroke="#6366f1" strokeWidth={2.5} />
          <circle cx={lossX(constant)} cy={lossY(constantLoss(constant))} r={6} fill="#6366f1" stroke="white" strokeWidth={1.5} />
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
            <text key={tick} x={lossX(tick)} y={LOSS_PAD.top + plot.height + 16} textAnchor="middle" className="fill-slate-400 text-[11px]">{tick}</text>
          ))}
          <text x={lossX(1 / 3)} y={LOSS_PAD.top + 12} textAnchor="middle" className="fill-emerald-700 text-[10px] dark:fill-emerald-300">1/3</text>
          <text x={LOSS_PAD.left + plot.width / 2} y={LOSS.height - 4} textAnchor="middle" className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">the constant probability q given to everyone</text>
        </svg>
        <input type="range" min={0.02} max={0.98} step={0.01} value={constant} onChange={(event) => setConstant(Number(event.target.value))} className="mt-2 w-full accent-indigo-600" />
        <div className="mt-1 grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-700 dark:text-slate-200">
          <div className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">to the yes: {constant.toFixed(2)}</div>
          <div className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">to each no: {(1 - constant).toFixed(2)}</div>
          <div className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">log loss: {constantLoss(constant).toFixed(4)}</div>
        </div>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          Lowest at q = 1/3, one yes in three, and the intercept that produces it is ln(1/3 ÷ 2/3) = ln(1/2) = −0.6931.
        </p>
      </div>
    </div>
  );
}
