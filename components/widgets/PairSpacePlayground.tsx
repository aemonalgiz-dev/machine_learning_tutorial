"use client";

// The 300 evaluation pictures placed by a tower trained on pairs, or by a
// classifier trained on the same three kinds, turning on a sphere.
//
// A pair loss reads only differences between positions, so the API first
// moves the middle of the collection to the origin, then scales every
// position to length one, projects onto the three directions of widest
// spread with principal components fitted on all 300, and pushes the result
// back onto the sphere. The five nearest pictures listed under the drawing are
// found in the full space, not on the drawing, so they are the answer the
// space itself gives. The browser only turns the sphere and paints.

import { useEffect, useMemo, useRef, useState } from "react";
import type { KindName } from "@/lib/concepts/a-vector-for-a-picture";
import {
  SphereAnswer,
  SpaceName,
  fetchSphere,
} from "@/lib/concepts/learning-the-metric-itself";
import {
  ALL_KINDS,
  Buttons,
  KIND_COLOUR,
  KindLabel,
  Pending,
  PictureCells,
  Stat,
  asKind,
  messageOf,
} from "@/components/widgets/learningTheMetricShared";

const VIEW = { width: 620, height: 420 };
const CENTRE = { x: 310, y: 210 };
const RADIUS = 168;
const TILT = 0.42;

function turned(point: { x: number; y: number; z: number }, spin: number) {
  const x = point.x * Math.cos(spin) - point.z * Math.sin(spin);
  const z = point.x * Math.sin(spin) + point.z * Math.cos(spin);
  return {
    x,
    y: point.y * Math.cos(TILT) - z * Math.sin(TILT),
    z: point.y * Math.sin(TILT) + z * Math.cos(TILT),
  };
}

function circlePath(kind: "latitude" | "longitude", at: number, spin: number) {
  const points: string[] = [];
  for (let step = 0; step <= 64; step += 1) {
    const angle = (step / 64) * Math.PI * 2;
    const raw =
      kind === "latitude"
        ? { x: Math.cos(angle) * Math.cos(at), y: Math.sin(at), z: Math.sin(angle) * Math.cos(at) }
        : { x: Math.cos(angle) * Math.cos(at), y: Math.sin(angle), z: Math.cos(angle) * Math.sin(at) };
    const spun = turned(raw, spin);
    points.push(`${CENTRE.x + spun.x * RADIUS},${CENTRE.y - spun.y * RADIUS}`);
  }
  return `M${points.join("L")}`;
}

function brightness(answer: SphereAnswer, index: number): number[][] {
  const span = answer.brightest - answer.darkest;
  return answer.levels[index].map((row) =>
    row.map((level) => answer.darkest + (level / answer.grey_levels) * span),
  );
}

export function PairSpacePlayground() {
  const [answer, setAnswer] = useState<SphereAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [space, setSpace] = useState<SpaceName>("pairs");
  const [showHeldBack, setShowHeldBack] = useState(true);
  const [showRings, setShowRings] = useState(true);
  const [chosen, setChosen] = useState<number | null>(null);
  const [spin, setSpin] = useState(0.6);
  const [turning, setTurning] = useState(true);
  const dragging = useRef<number | null>(null);

  useEffect(() => {
    let current = true;
    fetchSphere()
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

  useEffect(() => {
    if (!turning) return;
    let frame = 0;
    const step = () => {
      setSpin((previous) => previous + 0.004);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [turning]);

  const view = answer?.spaces.find((candidate) => candidate.space === space);

  const mistakes = useMemo(() => {
    if (!view) return [];
    return view.points
      .map((point, index) => ({ point, index }))
      .filter(({ point }) => view.points[point.neighbours[0]].kind !== point.kind)
      .map(({ index }) => index);
  }, [view]);

  if (!answer || !view) return <Pending message={message} />;

  const heldBack = answer.held_back;
  const visible = (kind: string) =>
    (kind !== heldBack || showHeldBack) && (kind !== "ring" || showRings);
  const placed = view.points
    .map((point, index) => ({ point, index, at: turned(point, spin) }))
    .filter(({ point }) => visible(point.kind))
    .sort((first, second) => first.at.z - second.at.z);

  const firstOf = (kind: string) =>
    view.points.findIndex((point) => point.kind === kind);
  const selected = chosen ?? firstOf(heldBack);
  const selectedPoint = view.points[selected];
  const ownKind = selectedPoint.neighbours.filter(
    (neighbour) => view.points[neighbour].kind === selectedPoint.kind,
  ).length;
  const nearestOwn = (kind: string) => {
    const ofKind = view.points.filter((point) => point.kind === kind);
    return ofKind.filter((point) => view.points[point.neighbours[0]].kind === kind)
      .length;
  };
  const nextMistake = () => {
    if (mistakes.length === 0) return;
    const later = mistakes.find((index) => index > selected);
    setChosen(later ?? mistakes[0]);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Buttons
          options={[
            { value: "pairs" as SpaceName, label: "trained on pairs" },
            { value: "classifier_three" as SpaceName, label: "a classifier’s layer" },
          ]}
          value={space}
          onChange={setSpace}
        />
        <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={showHeldBack}
            onChange={(event) => setShowHeldBack(event.target.checked)}
          />
          show the held-back {heldBack}s
        </label>
        <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={showRings}
            onChange={(event) => setShowRings(event.target.checked)}
          />
          show the rings
        </label>
        <button
          type="button"
          onClick={() => setTurning((previous) => !previous)}
          className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300"
        >
          {turning ? "stop turning" : "start turning"}
        </button>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full cursor-grab touch-none select-none active:cursor-grabbing"
        role="img"
        aria-label="The evaluation pictures placed as directions on a turning sphere"
        onPointerDown={(event) => {
          dragging.current = event.clientX;
          setTurning(false);
        }}
        onPointerMove={(event) => {
          if (dragging.current === null) return;
          const moved = event.clientX - dragging.current;
          dragging.current = event.clientX;
          setSpin((previous) => previous + moved * 0.01);
        }}
        onPointerUp={() => {
          dragging.current = null;
        }}
        onPointerLeave={() => {
          dragging.current = null;
        }}
      >
        <circle
          cx={CENTRE.x}
          cy={CENTRE.y}
          r={RADIUS}
          className="fill-slate-50 stroke-slate-200 dark:fill-slate-900/40 dark:stroke-slate-800"
        />
        {[-0.9, -0.45, 0, 0.45, 0.9].map((at) => (
          <path
            key={`lat-${at}`}
            d={circlePath("latitude", at, spin)}
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth={0.7}
          />
        ))}
        {[0, 0.52, 1.05, 1.57, 2.09, 2.62].map((at) => (
          <path
            key={`lon-${at}`}
            d={circlePath("longitude", at, spin)}
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth={0.7}
          />
        ))}
        {placed.map(({ point, index, at }) => {
          const front = at.z > 0;
          const depth = (at.z + 1) / 2;
          const unseen = !point.in_training;
          const isChosen = index === selected;
          const isNeighbour = selectedPoint.neighbours.includes(index);
          return (
            <circle
              key={index}
              cx={CENTRE.x + at.x * RADIUS}
              cy={CENTRE.y - at.y * RADIUS}
              r={(isChosen ? 5 : unseen ? 3.2 : 2.6) + depth * 2.2}
              fill={unseen ? "white" : KIND_COLOUR[asKind(point.kind)]}
              stroke={
                isChosen || isNeighbour
                  ? "#0f172a"
                  : unseen
                    ? KIND_COLOUR[asKind(point.kind)]
                    : "white"
              }
              strokeWidth={isChosen ? 2.4 : isNeighbour ? 1.6 : unseen ? 1.6 : front ? 0.6 : 0}
              opacity={front || isChosen ? 0.95 : 0.25}
              className="cursor-pointer"
              onClick={() => {
                setChosen(index);
                setTurning(false);
              }}
            >
              <title>{`${point.kind}, picture ${index}`}</title>
            </circle>
          );
        })}
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
        {ALL_KINDS.map((kind: KindName) => (
          <KindLabel key={kind} kind={kind} />
        ))}
        <span>hollow dots are kinds this space was never shown</span>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">take a picture:</span>
          {["cross", "square", "disc", heldBack, "ring"]
            .filter((kind, position, all) => all.indexOf(kind) === position)
            .map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setChosen(firstOf(kind))}
                className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                a {kind}
              </button>
            ))}
          <button
            type="button"
            onClick={nextMistake}
            className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            next picture whose nearest is another kind ({mistakes.length})
          </button>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
              picture {selected}, a {selectedPoint.kind}
            </p>
            <PictureCells
              rows={brightness(answer, selected)}
              cell={5}
              kind={asKind(selectedPoint.kind)}
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
              its five nearest in this space, nearest first
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedPoint.neighbours.map((neighbour) => (
                <button
                  key={neighbour}
                  type="button"
                  onClick={() => setChosen(neighbour)}
                  className="text-left"
                >
                  <PictureCells
                    rows={brightness(answer, neighbour)}
                    cell={3}
                    kind={asKind(view.points[neighbour].kind)}
                  />
                  <span className="mt-1 block text-[10px] text-slate-500 dark:text-slate-400">
                    {view.points[neighbour].kind}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {ownKind} of its five nearest are {selectedPoint.kind}s.{" "}
          {selectedPoint.in_training
            ? `This space was trained on ${selectedPoint.kind}s.`
            : `This space never saw a ${selectedPoint.kind}.`}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="numbers per picture" value={String(view.width)} />
        <Stat label="of the spread drawn" value={`${(view.kept_share * 100).toFixed(1)}%`} />
        <Stat
          label={`${heldBack}s whose nearest is a ${heldBack}`}
          value={`${nearestOwn(heldBack)} of 60`}
        />
        <Stat label="rings whose nearest is a ring" value={`${nearestOwn("ring")} of 60`} />
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Both spaces come from networks trained on crosses, squares and discs
        only, from weight seed {answer.seed}. The held-out half of each of the
        four kinds and 60 rings make 300 pictures, and a picture&rsquo;s nearest
        neighbours are searched among all of them by straight-line distance.
      </p>
    </div>
  );
}
