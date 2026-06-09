"use client";

// Three score planes over the feature plane, and the map of which is highest.
//
// Each class's linear score is a flat plane over height and weight, and the
// model calls whichever plane is highest at a point. The left view is the
// three planes in a rotatable room, drawn from the API's score lattice; the
// right view is the same lattice seen from above, coloured by the highest
// plane, which is the decision map. Move the probe and both views show the
// three scores at that spot and which one wins. The two ridges where planes
// cross are straight lines, because two planes meet along a line, and that
// is where the boundaries come from. The route toggle swaps the softmax
// planes for the one-vs-rest log-odds planes.

import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { MulticlassAnswer, MulticlassRoute, classifyAmongThree } from "@/lib/concepts/multiclass-classification";
import { CUBE_EDGES, Orbit, Point3, project, toCube } from "@/lib/threeD";
import { CLASS_COLOURS, CLASS_NAMES, CROWD } from "./RouteComparison";

const ROOM = 360;
const HALF = ROOM / 2;
const SCALE = 128;
const MAP = 320;
const MAP_PAD = 30;

export function ScoreSurfaces() {
  const [route, setRoute] = useState<MulticlassRoute>("softmax");
  const [answer, setAnswer] = useState<MulticlassAnswer | null>(null);
  const [probe, setProbe] = useState({ row: 12, column: 12 });
  const [orbit, setOrbit] = useState<Orbit>({ yaw: -0.8, pitch: 0.4 });
  const [message, setMessage] = useState<string | null>(null);
  const dragging = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await classifyAmongThree(CROWD, route));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [route]);

  const onPointerDown = (event: React.PointerEvent) => {
    dragging.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = event.clientX - dragging.current.x;
    const dy = event.clientY - dragging.current.y;
    dragging.current = { x: event.clientX, y: event.clientY };
    setOrbit((current) => ({ yaw: current.yaw + dx * 0.008, pitch: Math.min(1.3, Math.max(-0.2, current.pitch + dy * 0.008)) }));
  };
  const onPointerUp = () => {
    dragging.current = null;
  };

  if (!answer) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const cells = answer.regions.cells;
  const lattice = answer.score_lattice;
  const flat = lattice.flat(2);
  const scoreMin = Math.min(...flat);
  const scoreMax = Math.max(...flat);
  const cellX = (column: number) => answer.regions.x_min + ((answer.regions.x_max - answer.regions.x_min) * column) / (cells - 1);
  const cellY = (row: number) => answer.regions.y_min + ((answer.regions.y_max - answer.regions.y_min) * row) / (cells - 1);
  const toRoom = (column: number, row: number, score: number): Point3 => ({
    x: toCube(column, 0, cells - 1),
    y: toCube(row, 0, cells - 1),
    z: toCube(score, scoreMin, scoreMax),
  });

  // Each plane as a sparse wireframe, every fourth lattice line.
  const stride = 5;
  const segments: { a: Point3; b: Point3; colour: string }[] = [];
  lattice.forEach((plane, classIndex) => {
    for (let row = 0; row < cells; row += stride) {
      for (let column = 0; column < cells - 1; column++) {
        segments.push({ a: toRoom(column, row, plane[row][column]), b: toRoom(column + 1, row, plane[row][column + 1]), colour: CLASS_COLOURS[classIndex] });
      }
    }
    for (let column = 0; column < cells; column += stride) {
      for (let row = 0; row < cells - 1; row++) {
        segments.push({ a: toRoom(column, row, plane[row][column]), b: toRoom(column, row + 1, plane[row + 1][column]), colour: CLASS_COLOURS[classIndex] });
      }
    }
  });
  const projected = segments
    .map((segment) => {
      const a = project(segment.a, orbit, HALF, SCALE);
      const b = project(segment.b, orbit, HALF, SCALE);
      return { a, b, colour: segment.colour, depth: (a.depth + b.depth) / 2 };
    })
    .sort((first, second) => second.depth - first.depth);
  const frame = CUBE_EDGES.map(([a, b]) => ({ a: project(a, orbit, HALF, SCALE), b: project(b, orbit, HALF, SCALE) }));

  const probeScores = lattice.map((plane) => plane[probe.row][probe.column]);
  const winner = probeScores.indexOf(Math.max(...probeScores));
  const probeRoom = lattice.map((plane) => project(toRoom(probe.column, probe.row, plane[probe.row][probe.column]), orbit, HALF, SCALE));
  const probeFloor = project({ x: toCube(probe.column, 0, cells - 1), y: toCube(probe.row, 0, cells - 1), z: -1 }, orbit, HALF, SCALE);

  const mapCell = (MAP - 2 * MAP_PAD) / cells;
  const mapX = (column: number) => MAP_PAD + column * mapCell;
  const mapY = (row: number) => MAP - MAP_PAD - (row + 1) * mapCell;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {(["softmax", "one_vs_rest"] as MulticlassRoute[]).map((option) => (
            <button key={option} onClick={() => setRoute(option)} className={"rounded px-3 py-1 text-sm font-medium transition " + (route === option ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}>
              {option === "softmax" ? "softmax" : "one-vs-rest"}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2">
          probe height
          <input type="range" min={0} max={cells - 1} step={1} value={probe.column} onChange={(event) => setProbe({ ...probe, column: Number(event.target.value) })} className="w-28 accent-slate-600" />
          <span className="w-12 font-mono">{cellX(probe.column).toFixed(0)}</span>
        </label>
        <label className="flex items-center gap-2">
          weight
          <input type="range" min={0} max={cells - 1} step={1} value={probe.row} onChange={(event) => setProbe({ ...probe, row: Number(event.target.value) })} className="w-28 accent-slate-600" />
          <span className="w-12 font-mono">{cellY(probe.row).toFixed(0)}</span>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <svg viewBox={`0 0 ${ROOM} ${ROOM}`} className="w-full cursor-grab touch-none select-none rounded-lg bg-slate-50 active:cursor-grabbing dark:bg-slate-950" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
            {frame.map((edge, index) => (
              <line key={index} x1={edge.a.px} y1={edge.a.py} x2={edge.b.px} y2={edge.b.py} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            ))}
            {projected.map((segment, index) => (
              <line key={index} x1={segment.a.px} y1={segment.a.py} x2={segment.b.px} y2={segment.b.py} stroke={segment.colour} strokeWidth={1} opacity={0.6} />
            ))}
            <line x1={probeFloor.px} y1={probeFloor.py} x2={probeRoom[winner].px} y2={probeRoom[winner].py} stroke="#0f172a" strokeDasharray="3 3" className="dark:stroke-slate-200" />
            {probeRoom.map((point, index) => (
              <circle key={index} cx={point.px} cy={point.py} r={index === winner ? 6 : 4} fill={CLASS_COLOURS[index]} stroke={index === winner ? "#0f172a" : "white"} strokeWidth={index === winner ? 2 : 1} />
            ))}
          </svg>
          <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-500">Drag to turn. Height runs across, weight into the depth, score upward.</p>
        </div>
        <div>
          <svg viewBox={`0 0 ${MAP} ${MAP}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
            {answer.regions.labels.map((row, rowIndex) =>
              row.map((label, columnIndex) => (
                <rect key={`${rowIndex}-${columnIndex}`} x={mapX(columnIndex)} y={mapY(rowIndex)} width={mapCell + 0.5} height={mapCell + 0.5} fill={CLASS_COLOURS[label]} opacity={0.25} />
              )),
            )}
            {CROWD.map((person, index) => (
              <circle key={index} cx={mapX((person.x - answer.regions.x_min) / (answer.regions.x_max - answer.regions.x_min) * (cells - 1)) + mapCell / 2} cy={mapY((person.y - answer.regions.y_min) / (answer.regions.y_max - answer.regions.y_min) * (cells - 1)) + mapCell / 2} r={4} fill={CLASS_COLOURS[person.label]} stroke="white" strokeWidth={1} />
            ))}
            <circle cx={mapX(probe.column) + mapCell / 2} cy={mapY(probe.row) + mapCell / 2} r={7} fill="none" stroke="#0f172a" strokeWidth={2.5} className="dark:stroke-slate-100" />
            <text x={MAP / 2} y={MAP - 8} textAnchor="middle" className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">height (cm)</text>
            <text x={10} y={MAP / 2} textAnchor="middle" transform={`rotate(-90 10 ${MAP / 2})`} className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">weight (kg)</text>
          </svg>
          <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-500">The same lattice from above, coloured by the highest plane.</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {probeScores.map((score, index) => (
          <div key={index} className={`rounded-lg px-3 py-2 ${index === winner ? "ring-2 ring-slate-900 dark:ring-slate-100" : ""}`} style={{ backgroundColor: `${CLASS_COLOURS[index]}22` }}>
            <div className="text-xs" style={{ color: CLASS_COLOURS[index] }}>{CLASS_NAMES[index]} score at the probe</div>
            <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">{score.toFixed(3)}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The probe at {cellX(probe.column).toFixed(0)} cm and {cellY(probe.row).toFixed(0)} kg is called {CLASS_NAMES[winner]}, because that plane is highest there.
        {route === "softmax" ? " Under softmax the child plane is held flat at zero as the reference." : " Under one-vs-rest each plane is its own binary fit's log-odds."}
      </p>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
