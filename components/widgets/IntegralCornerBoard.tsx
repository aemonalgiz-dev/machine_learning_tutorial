"use client";

// A box drawn on a picture, and the four table entries that answer its total.
//
// The left panel is the picture with the chosen box outlined and its four
// corners marked, one plus and three of them where a sign matters; the right
// panel is the table of running totals with those same four entries lit up.
// Drag on either panel to move the box, or use the buttons. The API
// accumulates the table, names the four entries and adds them up both ways;
// the browser only draws what comes back.

import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  IntegralReading,
  PictureName,
  readABox,
} from "@/lib/concepts/haar-cascades";
import { PixelGrid, Stat, greyOf } from "./HaarCascadeParts";

const PLUS = "#4f46e5";
const MINUS = "#e11d48";

interface Preset {
  label: string;
  picture: PictureName;
  top: number;
  left: number;
  height: number;
  width: number;
}

const PRESETS: Preset[] = [
  { label: "A box in the middle", picture: "counted", top: 1, left: 2, height: 3, width: 3 },
  { label: "One pixel", picture: "counted", top: 3, left: 4, height: 1, width: 1 },
  { label: "Hard against the corner", picture: "counted", top: 0, left: 0, height: 2, width: 3 },
  { label: "The whole picture", picture: "counted", top: 0, left: 0, height: 6, width: 7 },
  { label: "The square in the workbench", picture: "workbench", top: 6, left: 5, height: 11, width: 11 },
  { label: "The workbench, whole", picture: "workbench", top: 0, left: 0, height: 48, width: 48 },
];

export function IntegralCornerBoard() {
  const [preset, setPreset] = useState(0);
  const [reading, setReading] = useState<IntegralReading | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const dragFrom = useRef<{ top: number; left: number } | null>(null);
  const chosen = PRESETS[preset];
  const [box, setBox] = useState({
    top: chosen.top,
    left: chosen.left,
    height: chosen.height,
    width: chosen.width,
  });
  const [picture, setPicture] = useState<PictureName>(chosen.picture);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const next = await readABox(
          picture,
          box.top,
          box.left,
          box.height,
          box.width,
        );
        if (live) {
          setReading(next);
          setMessage(null);
        }
      } catch (error) {
        if (live) {
          setMessage(
            error instanceof ApiError ? error.message : "Something went wrong.",
          );
        }
      }
    })();
    return () => {
      live = false;
    };
  }, [picture, box]);

  const choose = useCallback((position: number) => {
    const next = PRESETS[position];
    setPreset(position);
    setPicture(next.picture);
    setBox({
      top: next.top,
      left: next.left,
      height: next.height,
      width: next.width,
    });
  }, []);

  if (!reading && !message) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">…</p>;
  }
  if (!reading) {
    return <p className="text-sm text-rose-600 dark:text-rose-400">{message}</p>;
  }

  const rows = reading.picture.rows;
  const brightest = Math.max(...rows.flat(), 1);
  const small = reading.picture.width <= 8;
  const cell = small ? 40 : 10;
  const tableCell = small ? 40 : 10;
  const marker = small ? 7 : 2.6;

  const pixelAt = (event: MouseEvent<SVGRectElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const column = Math.floor(
      ((event.clientX - bounds.left) / bounds.width) * reading.picture.width,
    );
    const row = Math.floor(
      ((event.clientY - bounds.top) / bounds.height) * reading.picture.height,
    );
    return {
      top: Math.max(0, Math.min(reading.picture.height - 1, row)),
      left: Math.max(0, Math.min(reading.picture.width - 1, column)),
    };
  };

  const startDrag = (event: MouseEvent<SVGRectElement>) => {
    const from = pixelAt(event);
    dragFrom.current = from;
    setBox({ top: from.top, left: from.left, height: 1, width: 1 });
  };

  const continueDrag = (event: MouseEvent<SVGRectElement>) => {
    const from = dragFrom.current;
    if (!from) return;
    const to = pixelAt(event);
    setBox({
      top: Math.min(from.top, to.top),
      left: Math.min(from.left, to.left),
      height: Math.abs(to.top - from.top) + 1,
      width: Math.abs(to.left - from.left) + 1,
    });
  };

  const endDrag = () => {
    dragFrom.current = null;
  };

  const arithmetic = reading.corners
    .map((corner, index) =>
      index === 0
        ? `${corner.value}`
        : `${corner.sign > 0 ? "+" : "−"} ${corner.value}`,
    )
    .join(" ");

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {PRESETS.map((one, position) => (
          <button
            key={one.label}
            type="button"
            onClick={() => choose(position)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              position === preset
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {one.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            The picture, {reading.picture.height} by {reading.picture.width}.
            Drag to move the box.
          </p>
          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-950">
            <PixelGrid
              rows={rows}
              cell={cell}
              brightest={brightest}
              showValues={small}
              outline={small}
              className="cursor-crosshair"
            >
              <rect
                x={box.left * cell}
                y={box.top * cell}
                width={box.width * cell}
                height={box.height * cell}
                fill="rgba(79,70,229,0.22)"
                stroke={PLUS}
                strokeWidth={small ? 2 : 1.2}
              />
              <rect
                x={0}
                y={0}
                width={reading.picture.width * cell}
                height={reading.picture.height * cell}
                fill="transparent"
                onMouseDown={startDrag}
                onMouseMove={continueDrag}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
              />
            </PixelGrid>
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            The running totals, one row and one column larger, with the four
            entries that answer the box.
          </p>
          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-950">
            <svg
              viewBox={`0 0 ${(reading.picture.width + 1) * tableCell} ${
                (reading.picture.height + 1) * tableCell
              }`}
              className="w-full select-none"
              role="img"
            >
              {reading.table.map((row, rowIndex) =>
                row.map((value, columnIndex) => {
                  const corner = reading.corners.find(
                    (one) => one.row === rowIndex && one.column === columnIndex,
                  );
                  return (
                    <g key={`${rowIndex}-${columnIndex}`}>
                      <rect
                        x={columnIndex * tableCell}
                        y={rowIndex * tableCell}
                        width={tableCell + 0.4}
                        height={tableCell + 0.4}
                        fill={
                          corner
                            ? corner.sign > 0
                              ? PLUS
                              : MINUS
                            : greyOf(
                                value,
                                Math.max(
                                  ...reading.table[reading.table.length - 1],
                                  1,
                                ),
                              )
                        }
                        opacity={corner ? 1 : 0.55}
                        stroke={small ? "rgba(148,163,184,0.45)" : undefined}
                        strokeWidth={small ? 0.4 : undefined}
                      />
                      {small && (
                        <text
                          x={columnIndex * tableCell + tableCell / 2}
                          y={rowIndex * tableCell + tableCell / 2 + 4}
                          textAnchor="middle"
                          fontSize={11}
                          fontFamily="ui-monospace, monospace"
                          fill={corner ? "#ffffff" : "#94a3b8"}
                          fontWeight={corner ? 700 : 400}
                        >
                          {value}
                        </text>
                      )}
                      {corner && !small && (
                        <circle
                          cx={columnIndex * tableCell + tableCell / 2}
                          cy={rowIndex * tableCell + tableCell / 2}
                          r={marker}
                          fill={corner.sign > 0 ? PLUS : MINUS}
                        />
                      )}
                    </g>
                  );
                }),
              )}
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Stat label="pixels in the box" value={`${reading.rectangle.n_pixels}`} />
        <Stat label="table entries read" value={`${reading.n_lookups}`} />
        <Stat
          label="from the four corners"
          value={`${reading.from_the_table}`}
          tone={PLUS}
        />
        <Stat
          label="from adding the pixels"
          value={`${reading.from_the_pixels}`}
        />
      </div>

      <p className="mt-2 font-mono text-xs text-slate-600 dark:text-slate-400">
        {arithmetic} = {reading.from_the_table}
      </p>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Blue entries are added and red ones taken away. Over every one of the{" "}
        {reading.agreement.n_rectangles} boxes the{" "}
        {reading.agreement.picture_height} by {reading.agreement.picture_width}{" "}
        picture holds, the four-corner total and the sum of the pixels agree{" "}
        {reading.agreement.n_agreeing} times, with a largest gap of{" "}
        {reading.agreement.largest_gap}.
      </p>
      {message && (
        <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{message}</p>
      )}
    </div>
  );
}
