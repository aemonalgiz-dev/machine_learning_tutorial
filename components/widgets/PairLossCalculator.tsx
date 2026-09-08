"use client";

// Two positions in a plane, and what the contrastive loss makes of them.
//
// Drag either point. The API computes the distance, the loss under the
// pair's label and under the other label, and the slope of the loss at each
// point, with the same function the training uses; the arrows are the
// directions a step would move each point, which is against its slope. The
// curve on the right is the definition itself drawn over distance, with the
// API's answer marked on it, since a curve of a formula needs no fitting.

import { useEffect, useRef, useState } from "react";
import {
  PairLossAnswer,
  measurePairLoss,
} from "@/lib/concepts/learning-the-metric-itself";
import {
  Buttons,
  Pending,
  Stat,
  messageOf,
} from "@/components/widgets/learningTheMetricShared";

const PLANE = { size: 280, reach: 1.6 };
const CURVE = { width: 280, height: 200, left: 34, right: 8, top: 14, bottom: 28 };
const DISTANCE_TOP = 2.5;

type Point = [number, number];

function toScreen([x, y]: Point): Point {
  const scale = PLANE.size / (2 * PLANE.reach);
  return [PLANE.size / 2 + x * scale, PLANE.size / 2 - y * scale];
}

function fromScreen(screenX: number, screenY: number): Point {
  const scale = PLANE.size / (2 * PLANE.reach);
  const clamp = (value: number) =>
    Math.round(Math.max(-1.5, Math.min(1.5, value)) * 100) / 100;
  return [
    clamp((screenX - PLANE.size / 2) / scale),
    clamp((PLANE.size / 2 - screenY) / scale),
  ];
}

function lossCurve(sameKind: boolean, margin: number): string {
  const x = (distance: number) =>
    CURVE.left + (distance / DISTANCE_TOP) * (CURVE.width - CURVE.left - CURVE.right);
  const y = (loss: number) =>
    CURVE.height -
    CURVE.bottom -
    (Math.min(loss, 2) / 2) * (CURVE.height - CURVE.top - CURVE.bottom);
  const points: string[] = [];
  for (let step = 0; step <= 100; step += 1) {
    const distance = (step / 100) * DISTANCE_TOP;
    const loss = sameKind
      ? 0.5 * distance * distance
      : 0.5 * Math.max(0, margin - distance) ** 2;
    points.push(`${x(distance).toFixed(1)},${y(loss).toFixed(1)}`);
  }
  return `M${points.join("L")}`;
}

function Arrow({ from, slope, colour }: { from: Point; slope: number[]; colour: string }) {
  const [startX, startY] = toScreen(from);
  const step = 0.5;
  const [endX, endY] = toScreen([from[0] - step * slope[0], from[1] - step * slope[1]]);
  if (Math.hypot(endX - startX, endY - startY) < 2) return null;
  return (
    <line
      x1={startX}
      y1={startY}
      x2={endX}
      y2={endY}
      stroke={colour}
      strokeWidth={2}
      markerEnd="url(#pair-loss-arrow)"
    />
  );
}

export function PairLossCalculator() {
  const [first, setFirst] = useState<Point>([0, 0]);
  const [second, setSecond] = useState<Point>([0.36, 0.48]);
  const [sameKind, setSameKind] = useState(true);
  const [margin, setMargin] = useState(1);
  const [answer, setAnswer] = useState<PairLossAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const dragging = useRef<"first" | "second" | null>(null);
  const svg = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    let current = true;
    const timer = setTimeout(() => {
      measurePairLoss({ first, second, same_kind: sameKind, margin })
        .then((loaded) => {
          if (current) {
            setAnswer(loaded);
            setMessage(null);
          }
        })
        .catch((error) => {
          if (current) setMessage(messageOf(error));
        });
    }, 120);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [first, second, sameKind, margin]);

  const move = (clientX: number, clientY: number) => {
    if (!dragging.current || !svg.current) return;
    const box = svg.current.getBoundingClientRect();
    const scale = PLANE.size / box.width;
    const point = fromScreen((clientX - box.left) * scale, (clientY - box.top) * scale);
    if (dragging.current === "first") setFirst(point);
    else setSecond(point);
  };

  const scale = PLANE.size / (2 * PLANE.reach);
  const [firstX, firstY] = toScreen(first);
  const [secondX, secondY] = toScreen(second);
  const curveX = (distance: number) =>
    CURVE.left + (Math.min(distance, DISTANCE_TOP) / DISTANCE_TOP) * (CURVE.width - CURVE.left - CURVE.right);
  const curveY = (loss: number) =>
    CURVE.height - CURVE.bottom - (Math.min(loss, 2) / 2) * (CURVE.height - CURVE.top - CURVE.bottom);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Buttons
          options={[
            { value: "same", label: "same kind" },
            { value: "different", label: "different kinds" },
          ]}
          value={sameKind ? "same" : "different"}
          onChange={(next) => setSameKind(next === "same")}
        />
        <Buttons
          label="margin:"
          options={[0.5, 1, 1.5].map((value) => ({ value, label: String(value) }))}
          value={margin}
          onChange={setMargin}
        />
        <button
          type="button"
          onClick={() => {
            setFirst([0, 0]);
            setSecond([0.36, 0.48]);
            setMargin(1);
          }}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300"
        >
          back to the pair worked by hand
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <svg
          ref={svg}
          viewBox={`0 0 ${PLANE.size} ${PLANE.size}`}
          className="w-full touch-none select-none rounded-lg bg-slate-50 dark:bg-slate-950"
          role="img"
          aria-label="Two positions in a plane, each draggable"
          onPointerMove={(event) => move(event.clientX, event.clientY)}
          onPointerUp={() => {
            dragging.current = null;
          }}
          onPointerLeave={() => {
            dragging.current = null;
          }}
        >
          <defs>
            <marker id="pair-loss-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#0f172a" />
            </marker>
          </defs>
          <line x1={0} x2={PLANE.size} y1={PLANE.size / 2} y2={PLANE.size / 2} className="stroke-slate-200 dark:stroke-slate-800" />
          <line y1={0} y2={PLANE.size} x1={PLANE.size / 2} x2={PLANE.size / 2} className="stroke-slate-200 dark:stroke-slate-800" />
          {!sameKind && (
            <circle
              cx={firstX}
              cy={firstY}
              r={margin * scale}
              fill="none"
              stroke="#f43f5e"
              strokeDasharray="4 3"
              strokeOpacity={0.7}
            />
          )}
          <line x1={firstX} y1={firstY} x2={secondX} y2={secondY} className="stroke-slate-400" strokeDasharray="2 2" />
          {answer && answer.slope_on_first.length === 2 && (
            <>
              <Arrow from={first} slope={answer.slope_on_first} colour="#0f172a" />
              <Arrow from={second} slope={answer.slope_on_second} colour="#0f172a" />
            </>
          )}
          {(
            [
              ["first", first, "#6366f1"],
              ["second", second, sameKind ? "#6366f1" : "#f59e0b"],
            ] as const
          ).map(([name, point, colour]) => {
            const [x, y] = toScreen(point);
            return (
              <circle
                key={name}
                cx={x}
                cy={y}
                r={8}
                fill={colour}
                stroke="white"
                strokeWidth={2}
                className="cursor-grab"
                onPointerDown={(event) => {
                  dragging.current = name;
                  event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId);
                }}
              />
            );
          })}
          <text x={6} y={14} fontSize={10} className="fill-slate-500 dark:fill-slate-400">
            first ({first[0].toFixed(2)}, {first[1].toFixed(2)}), second ({second[0].toFixed(2)}, {second[1].toFixed(2)})
          </text>
        </svg>
        <svg
          viewBox={`0 0 ${CURVE.width} ${CURVE.height}`}
          className="w-full rounded-lg bg-slate-50 dark:bg-slate-950"
          role="img"
          aria-label="The loss drawn over the distance between the two positions"
        >
          <g className="text-slate-500 dark:text-slate-400" fontSize={9} fill="currentColor">
            {[0, 0.5, 1, 1.5, 2].map((tick) => (
              <g key={tick}>
                <line x1={CURVE.left} x2={CURVE.width - CURVE.right} y1={curveY(tick)} y2={curveY(tick)} stroke="currentColor" strokeOpacity={0.15} />
                <text x={CURVE.left - 4} y={curveY(tick) + 3} textAnchor="end">
                  {tick}
                </text>
              </g>
            ))}
            {[0, 0.5, 1, 1.5, 2, 2.5].map((tick) => (
              <text key={tick} x={curveX(tick)} y={CURVE.height - 14} textAnchor="middle">
                {tick}
              </text>
            ))}
            <text x={(CURVE.width + CURVE.left) / 2} y={CURVE.height - 3} textAnchor="middle">
              distance between the two positions
            </text>
            <text x={CURVE.left} y={10}>
              loss of this one pair
            </text>
          </g>
          <line
            x1={curveX(margin)}
            x2={curveX(margin)}
            y1={CURVE.top}
            y2={CURVE.height - CURVE.bottom}
            stroke="#f43f5e"
            strokeDasharray="4 3"
            strokeOpacity={0.6}
          />
          <path d={lossCurve(true, margin)} fill="none" stroke="#6366f1" strokeWidth={sameKind ? 2.2 : 1} strokeOpacity={sameKind ? 1 : 0.35} />
          <path d={lossCurve(false, margin)} fill="none" stroke="#f59e0b" strokeWidth={sameKind ? 1 : 2.2} strokeOpacity={sameKind ? 0.35 : 1} />
          {answer && (
            <circle cx={curveX(answer.distance)} cy={curveY(answer.loss)} r={4.5} fill="#0f172a" stroke="white" strokeWidth={1.5} />
          )}
        </svg>
      </div>
      {!answer ? (
        <Pending message={message} />
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="distance" value={answer.distance.toFixed(4)} />
            <Stat label="loss under this label" value={answer.loss.toFixed(4)} />
            <Stat label="if the two were one kind" value={answer.loss_if_same.toFixed(4)} />
            <Stat label="if they were two kinds" value={answer.loss_if_different.toFixed(4)} />
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Slope at the first point ({answer.slope_on_first.map((value) => value.toFixed(4)).join(", ")}), and at the second its negative.{" "}
            {!answer.direction_defined
              ? "The two points coincide, so the push has a size and nothing to point along, and the slope is returned as zero."
              : !sameKind && answer.beyond_margin
                ? "The pair is beyond the margin, so it is left alone."
                : "The arrows show which way a step would move each point."}
          </p>
          {message && <p className="mt-1 text-sm text-rose-600">{message}</p>}
        </>
      )}
    </div>
  );
}
