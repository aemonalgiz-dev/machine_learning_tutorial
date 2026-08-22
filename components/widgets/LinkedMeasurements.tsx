"use client";

// Height alone, weight alone, and the two together.
//
// The same eleven people drawn three ways, a number line for each feature
// and the scatter that pairs them. Selecting a person lights them up in all
// three, which is the point: a person's position on the height line and
// their position on the weight line are two numbers that mostly say the
// same thing, and the scatter shows how much. Nothing is computed here;
// the widget draws the data.

import { useState } from "react";
import { CROWD, FIRST } from "./pcaFixtures";

const LINE = { width: 640, height: 44 };
const SCATTER = { width: 640, height: 300 };
const PAD = { left: 48, right: 16, top: 12, bottom: 34 };
const DOMAIN = { xMin: 110, xMax: 190, yMin: 15, yMax: 90 };

export function LinkedMeasurements() {
  const [selected, setSelected] = useState<number>(4);

  const lineX = (value: number, low: number, high: number) => PAD.left + ((value - low) / (high - low)) * (LINE.width - PAD.left - PAD.right);
  const plotX = (value: number) => PAD.left + ((value - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * (SCATTER.width - PAD.left - PAD.right);
  const plotY = (value: number) => PAD.top + (1 - (value - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * (SCATTER.height - PAD.top - PAD.bottom);
  const person = CROWD[selected];

  const numberLine = (label: string, read: (point: { x: number; y: number }) => number, low: number, high: number, unit: string) => (
    <svg viewBox={`0 0 ${LINE.width} ${LINE.height}`} className="w-full select-none">
      <line x1={PAD.left} x2={LINE.width - PAD.right} y1={LINE.height / 2} y2={LINE.height / 2} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
      <text x={PAD.left - 6} y={LINE.height / 2 + 4} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">{label}</text>
      {CROWD.map((point, index) => (
        <circle key={index} cx={lineX(read(point), low, high)} cy={LINE.height / 2} r={index === selected ? 7 : 5} fill={index === selected ? FIRST : "#64748b"} stroke="white" strokeWidth={1.5} className="cursor-pointer" onClick={() => setSelected(index)} />
      ))}
      <text x={lineX(read(person), low, high)} y={LINE.height / 2 - 10} textAnchor="middle" className="fill-slate-700 text-[10px] font-medium dark:fill-slate-200">{read(person)} {unit}</text>
    </svg>
  );

  return (
    <div>
      {numberLine("height", (point) => point.x, DOMAIN.xMin, DOMAIN.xMax, "cm")}
      {numberLine("weight", (point) => point.y, DOMAIN.yMin, DOMAIN.yMax, "kg")}
      <svg viewBox={`0 0 ${SCATTER.width} ${SCATTER.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <line x1={plotX(person.x)} x2={plotX(person.x)} y1={PAD.top} y2={SCATTER.height - PAD.bottom} stroke={FIRST} strokeDasharray="3 3" strokeWidth={1} />
        <line x1={PAD.left} x2={SCATTER.width - PAD.right} y1={plotY(person.y)} y2={plotY(person.y)} stroke={FIRST} strokeDasharray="3 3" strokeWidth={1} />
        {CROWD.map((point, index) => (
          <circle key={index} cx={plotX(point.x)} cy={plotY(point.y)} r={index === selected ? 8 : 6} fill={index === selected ? FIRST : "#64748b"} stroke="white" strokeWidth={1.5} className="cursor-pointer" onClick={() => setSelected(index)} />
        ))}
        <text x={PAD.left + (SCATTER.width - PAD.left - PAD.right) / 2} y={SCATTER.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">height, cm</text>
        <text x={14} y={SCATTER.height / 2} textAnchor="middle" transform={`rotate(-90 14 ${SCATTER.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">weight, kg</text>
      </svg>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Person {selected + 1} is {person.x} cm and {person.y} kg. Click anyone, in any of the three views. Knowing where someone sits on the height line says a good deal about where they sit on the weight line, and the scatter is the picture of how much.
      </p>
    </div>
  );
}
