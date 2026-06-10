"use client";

// The angle between two people, measured from zero and from the average person.
//
// The left panel draws every person as an arrow from zero height and zero
// weight, the right panel the same people after both columns were centred, so
// their arrows start at the average person. Click two people to compare the
// cosine between their arrows in the two panels. Underneath, a three-person
// vote held out one person at a time, by straight-line distance and by angle,
// on the recorded and on the centred columns. Every cosine and every vote is
// the API's; the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { CrowdMeasurements, fetchCrowdMeasurements } from "@/lib/concepts/centring-on-the-mean";
import { ADULT, CENTRED, CHILD, CROWD, RAW } from "./centringFixtures";

const PANEL = { width: 300, height: 240 };
const PAD = 22;

type Domain = { xMin: number; xMax: number; yMin: number; yMax: number };

export function AnglesFromTheMean() {
  const [crowd, setCrowd] = useState<CrowdMeasurements | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pair, setPair] = useState<[number, number]>([7, 9]);

  useEffect(() => {
    (async () => {
      try {
        setCrowd(await fetchCrowdMeasurements());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!crowd) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const choose = (index: number) => {
    if (index === pair[1]) return;
    setPair([pair[1], index]);
  };

  const raw = CROWD.map((person) => ({ x: person.x, y: person.y }));
  const centred = crowd.centring.centred_heights.map((height, index) => ({ x: height, y: crowd.centring.centred_weights[index] }));
  const reach = Math.max(...centred.map((point) => Math.max(Math.abs(point.x), Math.abs(point.y)))) * 1.15;

  const rawCosine = crowd.angles.raw_cosines[pair[0]][pair[1]];
  const centredCosine = crowd.angles.centred_cosines[pair[0]][pair[1]];
  const degrees = (cosine: number) => ((Math.acos(Math.max(-1, Math.min(1, cosine))) * 180) / Math.PI).toFixed(1);
  const describe = (index: number) => `${CROWD[index].x} cm, ${CROWD[index].y} kg`;
  const count = (accuracy: number) => `${Math.round(accuracy * CROWD.length)} of ${CROWD.length}`;

  const panel = (title: string, points: { x: number; y: number }[], domain: Domain, colour: string) => {
    const panelX = (value: number) => PAD + ((value - domain.xMin) / (domain.xMax - domain.xMin)) * (PANEL.width - 2 * PAD);
    const panelY = (value: number) => PANEL.height - PAD - ((value - domain.yMin) / (domain.yMax - domain.yMin)) * (PANEL.height - 2 * PAD);
    return (
      <div className="rounded-lg border p-3" style={{ borderColor: `${colour}66` }}>
        <p className="mb-2 text-sm font-medium" style={{ color: colour }}>{title}</p>
        <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          <line x1={panelX(0)} x2={panelX(0)} y1={PAD / 2} y2={PANEL.height - PAD / 2} className="stroke-slate-300 dark:stroke-slate-700" />
          <line x1={PAD / 2} x2={PANEL.width - PAD / 2} y1={panelY(0)} y2={panelY(0)} className="stroke-slate-300 dark:stroke-slate-700" />
          {pair.map((index) => (
            <line key={`ray-${index}`} x1={panelX(0)} y1={panelY(0)} x2={panelX(points[index].x)} y2={panelY(points[index].y)} stroke={colour} strokeWidth={2} />
          ))}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={panelX(point.x)}
              cy={panelY(point.y)}
              r={pair.includes(index) ? 6.5 : 4.5}
              fill={CROWD[index].label === 0 ? CHILD : ADULT}
              stroke={pair.includes(index) ? colour : "white"}
              strokeWidth={pair.includes(index) ? 2.5 : 1}
              className="cursor-pointer"
              onClick={() => choose(index)}
            />
          ))}
          <circle cx={panelX(0)} cy={panelY(0)} r={3.5} className="fill-slate-900 dark:fill-slate-100" />
        </svg>
      </div>
    );
  };

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {panel("measured from no height and no weight", raw, { xMin: -10, xMax: 195, yMin: -8, yMax: 90 }, RAW)}
        {panel("measured from the average person", centred, { xMin: -reach, xMax: reach, yMin: -reach, yMax: reach }, CENTRED)}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Children in amber, adults in indigo. Click a person to replace the older of the two chosen; the pair is now {describe(pair[0])} and {describe(pair[1])}.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="cosine, from zero" value={rawCosine.toFixed(4)} />
        <Stat label="angle, from zero" value={`${degrees(rawCosine)}°`} />
        <Stat label="cosine, from the average" value={centredCosine.toFixed(4)} />
        <Stat label="angle, from the average" value={`${degrees(centredCosine)}°`} />
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">three nearest chosen by</th>
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">recorded columns</th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">centred columns</th>
            </tr>
          </thead>
          <tbody>
            {crowd.angles.votes.map((vote) => (
              <tr key={vote.rule} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-2 pr-6 text-slate-700 dark:text-slate-300">{vote.rule === "angle" ? "angle" : "straight-line distance"}</td>
                <td className="py-2 pr-6 font-mono text-slate-800 dark:text-slate-200">{count(vote.raw_accuracy)} right</td>
                <td className="py-2 font-mono text-slate-800 dark:text-slate-200">{count(vote.centred_accuracy)} right</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
