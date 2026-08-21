"use client";

// Where five seeds send the first direction, on two clouds side by side.
//
// Each panel draws its people, the eigensolver's first direction as a faint
// dashed line through the mean, and one solid line per seed for the direction
// the rule's walk landed on. On the measured four every seed's line lies on
// the dashed one and the panel looks like a single line. On the circle the
// eigenvalues tie, the eigensolver's choice is arbitrary and so is the rule's,
// and the five lines fan out. Every direction is a fit of the library through
// the API.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Sweeps, sweepHebbian } from "@/lib/concepts/hebbian-pca";
import { FIRST, PEOPLE, PEOPLE_LABEL, PeopleKey, RULE, SECOND, TROUBLE } from "./hebbianPcaFixtures";

const PANEL = { width: 300, height: 260 };
const PAD = 24;
const COLOURS = [FIRST, SECOND, RULE, TROUBLE, "#0ea5e9"];

export function SeedDirections({ left = "four", right = "circle" }: { left?: PeopleKey; right?: PeopleKey }) {
  const [answers, setAnswers] = useState<[Sweeps, Sweeps] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [first, second] = await Promise.all([sweepHebbian(PEOPLE[left]), sweepHebbian(PEOPLE[right])]);
        if (!live) return;
        setAnswers([first, second]);
        setMessage(null);
      } catch (error) {
        if (!live) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      live = false;
    };
  }, [left, right]);

  if (!answers) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const panel = (key: PeopleKey, sweeps: Sweeps) => {
    const points = PEOPLE[key];
    const mean = {
      x: points.reduce((total, point) => total + point.x, 0) / points.length,
      y: points.reduce((total, point) => total + point.y, 0) / points.length,
    };
    const span = Math.max(...points.map((point) => Math.abs(point.x - mean.x)), ...points.map((point) => Math.abs(point.y - mean.y))) * 1.4 || 1;
    const plotX = (value: number) => PAD + ((value - (mean.x - span)) / (2 * span)) * (PANEL.width - 2 * PAD);
    const plotY = (value: number) => PAD + (1 - (value - (mean.y - span)) / (2 * span)) * (PANEL.height - 2 * PAD);
    const reach = span * 0.9;
    const twin = sweeps.eigen[0];
    const spread = Math.max(...sweeps.seeds.map((seed) => seed.angle_to_first_seed_degrees));
    return (
      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">{PEOPLE_LABEL[key]}</p>
        <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          <line x1={plotX(mean.x - reach * twin.dx)} y1={plotY(mean.y - reach * twin.dy)} x2={plotX(mean.x + reach * twin.dx)} y2={plotY(mean.y + reach * twin.dy)} stroke="#64748b" strokeWidth={3} strokeDasharray="6 4" opacity={0.5} />
          {sweeps.seeds.map((seed, index) => (
            <line key={seed.seed} x1={plotX(mean.x - reach * 0.8 * seed.dx)} y1={plotY(mean.y - reach * 0.8 * seed.dy)} x2={plotX(mean.x + reach * 0.8 * seed.dx)} y2={plotY(mean.y + reach * 0.8 * seed.dy)} stroke={COLOURS[index % COLOURS.length]} strokeWidth={1.8} />
          ))}
          {points.map((point, index) => (
            <circle key={index} cx={plotX(point.x)} cy={plotY(point.y)} r={4.5} fill="#334155" stroke="white" strokeWidth={1.2} />
          ))}
        </svg>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <Stat label="eigen shares" value={sweeps.eigen.map((component) => component.share.toFixed(3)).join(" / ")} />
          <Stat label="widest gap between seeds" value={`${spread < 0.001 ? spread.toExponential(1) : spread.toFixed(1)}°`} />
          <Stat label="worst angle to the eigen direction" value={`${Math.max(...sweeps.seeds.map((seed) => seed.angle_degrees)).toFixed(3)}°`} />
          <Stat label="lengths" value={`${Math.min(...sweeps.seeds.map((seed) => seed.length)).toFixed(4)} to ${Math.max(...sweeps.seeds.map((seed) => seed.length)).toFixed(4)}`} />
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {panel(left, answers[0])}
        {panel(right, answers[1])}
      </div>
      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The dashed grey line is the eigensolver&rsquo;s first direction; each coloured line is where one of five seeds sent the rule&rsquo;s first unit after two hundred epochs.
      </p>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
