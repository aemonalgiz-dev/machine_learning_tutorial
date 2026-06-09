"use client";

// One neighbour vote, taken four times, with the heights in a different unit
// each time.
//
// The crowd is drawn once in centimetres and kilograms with the query as a
// ringed green dot you can drag. The four panels beneath are the same crowd
// and the same query with the height column rewritten in millimetres,
// centimetres and metres, and then with both columns standardized. Each panel
// draws the lines to the people that reading consulted and prints the vote,
// and the share readout is how much of the squared distance to those people
// came from the height column. The API takes every vote; the browser draws.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { HeightUnit, UnitNeighbours, UnitVote, voteByUnit } from "@/lib/concepts/feature-scaling";
import { ADULT, CHILD, CROWD, DECIDED_QUERY, QUERY } from "./featureScalingFixtures";

const DOMAIN = { xMin: 100, xMax: 200, yMin: 10, yMax: 100 };
const VIEW = { width: 640, height: 300 };
const PAD = { left: 48, right: 16, top: 12, bottom: 36 };
const PANEL = { width: 300, height: 190 };
const PANEL_PAD = { left: 30, right: 10, top: 10, bottom: 24 };

const UNIT_TITLES: Record<HeightUnit, string> = {
  millimetres: "height in millimetres",
  centimetres: "height in centimetres",
  metres: "height in metres",
  standardized: "both columns standardized",
};

function toView(point: Point, width: number, height: number, pad: typeof PAD) {
  const px = pad.left + ((point.x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * (width - pad.left - pad.right);
  const py = pad.top + (1 - (point.y - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * (height - pad.top - pad.bottom);
  return { px, py };
}

export function UnitDistortion() {
  const [query, setQuery] = useState<Point>(DECIDED_QUERY);
  const [k, setK] = useState(3);
  const [answer, setAnswer] = useState<UnitNeighbours | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await voteByUnit(CROWD, query, k));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [query, k]);

  const eventToPoint = useCallback((clientX: number, clientY: number): Point => {
    const rect = svgRef.current!.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * VIEW.width;
    const py = ((clientY - rect.top) / rect.height) * VIEW.height;
    const x = DOMAIN.xMin + ((px - PAD.left) / (VIEW.width - PAD.left - PAD.right)) * (DOMAIN.xMax - DOMAIN.xMin);
    const y = DOMAIN.yMin + (1 - (py - PAD.top) / (VIEW.height - PAD.top - PAD.bottom)) * (DOMAIN.yMax - DOMAIN.yMin);
    return {
      x: Math.min(DOMAIN.xMax, Math.max(DOMAIN.xMin, Math.round(x))),
      y: Math.min(DOMAIN.yMax, Math.max(DOMAIN.yMin, Math.round(y))),
    };
  }, []);

  const onPointerDown = (event: React.PointerEvent) => {
    dragging.current = true;
    svgRef.current?.setPointerCapture(event.pointerId);
    setQuery(eventToPoint(event.clientX, event.clientY));
  };
  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging.current) return;
    setQuery(eventToPoint(event.clientX, event.clientY));
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  const queryView = toView(query, VIEW.width, VIEW.height, PAD);
  const verdicts = answer ? answer.votes.map((vote) => vote.prediction) : [];
  const disagree = new Set(verdicts).size > 1;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex flex-1 items-center gap-2">
          neighbours consulted, k
          <input type="range" min={1} max={7} step={1} value={k} onChange={(event) => setK(Number(event.target.value))} className="flex-1 accent-indigo-600" />
          <span className="w-6 text-right font-mono">{k}</span>
        </label>
        <span className="font-mono">query {query.x} cm, {query.y} kg</span>
        <button onClick={() => setQuery(DECIDED_QUERY)} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
          the decided person
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="mt-3 w-full touch-none select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {[100, 125, 150, 175, 200].map((tick) => {
          const { px } = toView({ x: tick, y: DOMAIN.yMin }, VIEW.width, VIEW.height, PAD);
          return (
            <text key={tick} x={px} y={VIEW.height - PAD.bottom + 16} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">{tick}</text>
          );
        })}
        {[25, 50, 75, 100].map((tick) => {
          const { py } = toView({ x: DOMAIN.xMin, y: tick }, VIEW.width, VIEW.height, PAD);
          return (
            <text key={tick} x={PAD.left - 6} y={py + 3} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">{tick}</text>
          );
        })}
        <text x={PAD.left + (VIEW.width - PAD.left - PAD.right) / 2} y={VIEW.height - 4} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">height, cm</text>
        <text x={12} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 12 ${VIEW.height / 2})`} className="fill-slate-500 text-[10px] dark:fill-slate-400">weight, kg</text>
        {CROWD.map((person, index) => {
          const { px, py } = toView(person, VIEW.width, VIEW.height, PAD);
          return <circle key={index} cx={px} cy={py} r={5.5} fill={person.label === 0 ? CHILD : ADULT} stroke="white" strokeWidth={1.5} />;
        })}
        <circle cx={queryView.px} cy={queryView.py} r={8} fill={QUERY} stroke="white" strokeWidth={2} className="cursor-grab" />
        <circle cx={queryView.px} cy={queryView.py} r={12} fill="none" stroke={QUERY} strokeWidth={1.5} />
      </svg>

      {!answer ? (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>
      ) : (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {answer.votes.map((vote) => (
              <VotePanel key={vote.unit} vote={vote} query={query} />
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {disagree
              ? "The four readings do not agree about this person. Nothing about them changed between panels; only the unit the height was written in."
              : "The four readings agree about this person. Drag the query toward the middle of the crowd, where the two columns pull against each other, to find one they do not."}
            {" "}Standardizing divided height by {answer.height_deviation.toFixed(1)} cm and weight by {answer.weight_deviation.toFixed(1)} kg.
          </p>
        </>
      )}
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}

function VotePanel({ vote, query }: { vote: UnitVote; query: Point }) {
  const queryView = toView(query, PANEL.width, PANEL.height, PANEL_PAD);
  const shares = vote.neighbours.map((neighbour) => neighbour.height_share).filter((share): share is number => share !== null);
  const meanShare = shares.length ? shares.reduce((sum, share) => sum + share, 0) / shares.length : null;
  const verdictColour = vote.prediction === 0 ? CHILD : ADULT;
  return (
    <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-800">
      <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">{UNIT_TITLES[vote.unit]}</p>
      <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
        {vote.neighbours.map((neighbour) => {
          const person = CROWD[neighbour.index];
          const { px, py } = toView(person, PANEL.width, PANEL.height, PANEL_PAD);
          return <line key={neighbour.index} x1={queryView.px} y1={queryView.py} x2={px} y2={py} stroke={person.label === 0 ? CHILD : ADULT} strokeWidth={1.5} strokeDasharray="3 3" />;
        })}
        {CROWD.map((person, index) => {
          const { px, py } = toView(person, PANEL.width, PANEL.height, PANEL_PAD);
          const chosen = vote.neighbours.some((neighbour) => neighbour.index === index);
          return <circle key={index} cx={px} cy={py} r={chosen ? 5 : 3.5} fill={person.label === 0 ? CHILD : ADULT} opacity={chosen ? 1 : 0.45} stroke="white" strokeWidth={1} />;
        })}
        <circle cx={queryView.px} cy={queryView.py} r={6} fill={QUERY} stroke="white" strokeWidth={1.5} />
        <text x={PANEL_PAD.left + (PANEL.width - PANEL_PAD.left - PANEL_PAD.right) / 2} y={PANEL.height - 4} textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-slate-400">drawn in centimetres; the vote was taken in the unit above</text>
      </svg>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <Stat label="verdict" value={vote.prediction === 0 ? "child" : "adult"} colour={verdictColour} />
        <Stat label="votes child, adult" value={`${vote.neighbours.length - vote.votes_for_one}, ${vote.votes_for_one}`} />
        <Stat label="height's share of distance" value={meanShare === null ? "…" : meanShare.toFixed(2)} />
      </div>
    </div>
  );
}

function Stat({ label, value, colour }: { label: string; value: string; colour?: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100" style={colour ? { color: colour } : undefined}>{value}</div>
    </div>
  );
}
