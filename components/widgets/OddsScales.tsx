"use client";

// Probability, odds and log-odds, three scales locked together.
//
// Move the marker on any of the three and the other two follow, because
// they are one quantity written three ways. The tokens make the odds
// concrete: probability is passes out of everyone, odds are passes against
// fails. The three scales share a centre, a probability of one half, odds of
// one, log-odds of zero, and the log-odds scale is the one a straight line
// can live on, which is why logistic regression is linear there and nowhere
// else. Nothing is fitted; these are the conversions drawn.

import { useState } from "react";

const TOKENS = 20;
const VIEW = { width: 640, height: 70 };
const PAD = { left: 60, right: 30 };
const LOG_REACH = 5;

function clampProbability(value: number): number {
  return Math.min(0.995, Math.max(0.005, value));
}

export function OddsScales() {
  const [probability, setProbability] = useState(0.75);
  const odds = probability / (1 - probability);
  const logOdds = Math.log(odds);

  const passes = Math.round(probability * TOKENS);

  const track = VIEW.width - PAD.left - PAD.right;
  const probabilityX = (value: number) => PAD.left + value * track;
  const oddsX = (value: number) => PAD.left + (Math.log10(Math.max(0.005, value)) + 2.3) / 4.6 * track;
  const logOddsX = (value: number) => PAD.left + ((Math.max(-LOG_REACH, Math.min(LOG_REACH, value)) + LOG_REACH) / (2 * LOG_REACH)) * track;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 pb-3">
        {Array.from({ length: TOKENS }, (_, index) => (
          <span key={index} className={`h-4 w-4 rounded-full ${index < passes ? "bg-emerald-500" : "bg-rose-400"}`} />
        ))}
        <span className="ml-3 text-sm text-slate-600 dark:text-slate-300">
          {passes} pass, {TOKENS - passes} fail out of {TOKENS}
        </span>
      </div>

      <Scale
        title="probability, passes out of everyone"
        value={probability}
        display={probability.toFixed(3)}
        ticks={[0, 0.25, 0.5, 0.75, 1]}
        toX={probabilityX}
        centre={0.5}
        onChange={(value) => setProbability(clampProbability(value))}
        min={0.005}
        max={0.995}
        step={0.005}
        accent="#6366f1"
      />
      <Scale
        title="odds, passes against fails"
        value={odds}
        display={odds >= 1 ? `${odds.toFixed(2)} to 1` : `1 to ${(1 / odds).toFixed(2)}`}
        ticks={[0.01, 0.1, 1, 10, 100]}
        toX={oddsX}
        centre={1}
        onChange={(value) => setProbability(clampProbability(value / (1 + value)))}
        min={-2.3}
        max={2.3}
        step={0.01}
        sliderValue={Math.log10(odds)}
        fromSlider={(slider) => 10 ** slider}
        accent="#f59e0b"
      />
      <Scale
        title="log-odds, where the straight line lives"
        value={logOdds}
        display={logOdds.toFixed(3)}
        ticks={[-4, -2, 0, 2, 4]}
        toX={logOddsX}
        centre={0}
        onChange={(value) => setProbability(clampProbability(1 / (1 + Math.exp(-value))))}
        min={-LOG_REACH}
        max={LOG_REACH}
        step={0.01}
        accent="#10b981"
      />

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="p" value={probability.toFixed(3)} />
        <Stat label="p / (1 − p)" value={odds.toFixed(3)} />
        <Stat label="ln(p / (1 − p))" value={logOdds.toFixed(3)} />
      </div>
    </div>
  );
}

function Scale({
  title,
  value,
  display,
  ticks,
  toX,
  centre,
  onChange,
  min,
  max,
  step,
  sliderValue,
  fromSlider,
  accent,
}: {
  title: string;
  value: number;
  display: string;
  ticks: number[];
  toX: (value: number) => number;
  centre: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  sliderValue?: number;
  fromSlider?: (slider: number) => number;
  accent: string;
}) {
  const y = 40;
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        <span>{title}</span>
        <span className="font-mono">{display}</span>
      </div>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
        <line x1={PAD.left} y1={y} x2={VIEW.width - PAD.right} y2={y} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth={2} />
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={toX(tick)} y1={y - 6} x2={toX(tick)} y2={y + 6} stroke="currentColor" className="text-slate-400" />
            <text x={toX(tick)} y={y + 20} textAnchor="middle" className="fill-slate-400 text-[10px]">{tick}</text>
          </g>
        ))}
        <line x1={toX(centre)} y1={y - 14} x2={toX(centre)} y2={y + 8} stroke="currentColor" className="text-slate-500" strokeDasharray="3 2" />
        <circle cx={toX(value)} cy={y} r={7} fill={accent} stroke="white" strokeWidth={2} />
      </svg>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={sliderValue ?? value}
        onChange={(event) => onChange(fromSlider ? fromSlider(Number(event.target.value)) : Number(event.target.value))}
        className="w-full"
        style={{ accentColor: accent }}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
