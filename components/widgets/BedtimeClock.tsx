"use client";

// Times of day on a clock face, centred on two different means.
//
// Each time is a dot on the rim, midnight at the top. The ordinary mean the
// scaler learns is marked in rose; the circular mean, read off the direction
// of the average of the dots, is marked in green, and the average itself is
// drawn inside the face at the distance from the centre the API reports, so a
// set of times that cancel draws it at the centre, where it has no direction.
// The slider moves every time later by the same amount, which is where the
// ordinary mean jumps as a time crosses midnight. The API centres and averages;
// the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ClockView, centreTimes } from "@/lib/concepts/centring-on-the-mean";
import { A_WEEK_OF_BEDTIMES, CENTRED, OPPOSITE_TIMES, RAW, TWO_BEDTIMES } from "./centringFixtures";

const FACE = { width: 360, height: 320 };
const CENTRE = { x: 180, y: 160 };
const RADIUS = 120;

function clockTime(hours: number): string {
  let whole = Math.floor(hours);
  let minutes = Math.round((hours - whole) * 60);
  if (minutes === 60) {
    whole += 1;
    minutes = 0;
  }
  return `${String(whole % 24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function onFace(hours: number, distance: number) {
  const angle = (hours / 24) * 2 * Math.PI;
  return { x: CENTRE.x + distance * Math.sin(angle), y: CENTRE.y - distance * Math.cos(angle) };
}

export function BedtimeClock() {
  const [base, setBase] = useState<number[]>(TWO_BEDTIMES);
  const [shift, setShift] = useState(0);
  const [view, setView] = useState<ClockView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setView(await centreTimes(base.map((hour) => (hour + shift) % 24)));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 40);
    return () => clearTimeout(timer);
  }, [base, shift]);

  const choices: [string, number[]][] = [
    ["two bedtimes", TWO_BEDTIMES],
    ["a week of bedtimes", A_WEEK_OF_BEDTIMES],
    ["six and six", OPPOSITE_TIMES],
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex gap-1">
          {choices.map(([label, hours]) => (
            <button
              key={label}
              onClick={() => { setBase(hours); setShift(0); }}
              className={
                "rounded px-2 py-0.5 text-xs font-medium transition " +
                (base === hours
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {label}
            </button>
          ))}
        </span>
        <label className="flex flex-1 items-center gap-2">
          every time later by
          <input type="range" min={0} max={23.5} step={0.5} value={shift} onChange={(event) => setShift(Number(event.target.value))} className="flex-1 accent-indigo-600" />
          <span className="w-16 text-right font-mono">{shift.toFixed(1)} h</span>
        </label>
      </div>

      {!view ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>
      ) : (
        <>
          <svg viewBox={`0 0 ${FACE.width} ${FACE.height}`} className="mx-auto mt-3 w-full max-w-md select-none rounded-lg bg-slate-50 dark:bg-slate-950">
            <circle cx={CENTRE.x} cy={CENTRE.y} r={RADIUS} fill="none" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={2} />
            {Array.from({ length: 24 }, (_, hour) => {
              const inner = onFace(hour, RADIUS - (hour % 6 === 0 ? 10 : 5));
              const outer = onFace(hour, RADIUS);
              return <line key={hour} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} className="stroke-slate-400 dark:stroke-slate-600" strokeWidth={1} />;
            })}
            {[
              [0, "midnight"],
              [6, "06:00"],
              [12, "noon"],
              [18, "18:00"],
            ].map(([hour, label]) => {
              const place = onFace(Number(hour), RADIUS + 18);
              return (
                <text key={String(hour)} x={place.x} y={place.y + 4} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">{label}</text>
              );
            })}
            {view.circular_centre !== null && (
              <line x1={CENTRE.x} y1={CENTRE.y} x2={onFace(view.circular_centre, RADIUS).x} y2={onFace(view.circular_centre, RADIUS).y} stroke={CENTRED} strokeWidth={1.5} strokeDasharray="4 3" />
            )}
            {view.hours.map((hour, index) => {
              const place = onFace(hour, RADIUS);
              return <circle key={index} cx={place.x} cy={place.y} r={6} fill="#334155" stroke="white" strokeWidth={1.5} />;
            })}
            <circle cx={onFace(view.arithmetic_centre, RADIUS).x} cy={onFace(view.arithmetic_centre, RADIUS).y} r={8} fill="none" stroke={RAW} strokeWidth={3} />
            {view.circular_centre !== null && (
              <>
                <circle cx={onFace(view.circular_centre, RADIUS).x} cy={onFace(view.circular_centre, RADIUS).y} r={8} fill="none" stroke={CENTRED} strokeWidth={3} />
                <circle cx={onFace(view.circular_centre, RADIUS * view.resultant_length).x} cy={onFace(view.circular_centre, RADIUS * view.resultant_length).y} r={4} fill={CENTRED} />
              </>
            )}
            {view.circular_centre === null && <circle cx={CENTRE.x} cy={CENTRE.y} r={4} fill={CENTRED} />}
          </svg>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 text-xs text-slate-600 dark:text-slate-400">
            <span style={{ color: RAW }}>rose ring, the ordinary mean</span>
            <span style={{ color: CENTRED }}>green ring, the circular mean, and the averaged point inside</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="ordinary mean" value={clockTime(view.arithmetic_centre)} />
            <Stat label="circular mean" value={view.circular_centre === null ? "none" : clockTime(view.circular_centre)} />
            <Stat label="averaged point, share of the way out" value={view.resultant_length < 1e-9 ? view.resultant_length.toExponential(1) : view.resultant_length.toFixed(3)} />
            <Stat label="furthest time, ordinary and circular" value={`${Math.max(...view.arithmetic_offsets.map(Math.abs)).toFixed(2)} h, ${view.circular_offsets ? `${Math.max(...view.circular_offsets.map(Math.abs)).toFixed(2)} h` : "none"}`} />
          </div>
        </>
      )}
      {message && view && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
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
