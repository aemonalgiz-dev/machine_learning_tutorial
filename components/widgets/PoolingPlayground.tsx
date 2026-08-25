"use client";

// A picture, a window sliding across it, and who is blamed on the way back.
//
// The left grid is the picture, every cell a number the reader can change by
// clicking it, and the right grid is what the pooling layer answered, one
// number per window. Sliders set the window and the stride, a toggle keeps
// the largest value or the average, and hovering an answer outlines on the
// picture the window that produced it, with the winning cell marked under a
// maximum. The overlay prints what each input cell receives when a slope of
// one arrives at every answer, which is the page's whole point, one at the
// winners and nothing elsewhere under a maximum, a share everywhere under an
// average, and more than one where windows overlap. Every pooled number,
// every share and every winner is the library's through the API. The browser
// edits the picture, nudges it sideways, and lays the two grids out.

import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  Grid,
  Pooling,
  PoolingKind,
  applyPooling,
} from "@/lib/concepts/pooling";
import { FLAT_PATCH, PATCH, randomPatch, verticalStroke } from "./poolingFixtures";

const SMALLEST_SIDE = 2;
const LARGEST_SIDE = 8;
const LARGEST_VALUE = 1_000_000;

// Every row shifted one cell to the right, a zero entering on the left and
// the last cell falling off the edge.
function nudgedRight(picture: Grid): Grid {
  return picture.map((row) => [0, ...row.slice(0, -1)]);
}

// The same picture on a different side, keeping whatever cells still fit and
// filling any new ones with zero.
function resized(picture: Grid, side: number): Grid {
  return Array.from({ length: side }, (_, row) =>
    Array.from({ length: side }, (_, column) => picture[row]?.[column] ?? 0),
  );
}

const SIDES: number[] = [];
for (let side = SMALLEST_SIDE; side <= LARGEST_SIDE; side++) SIDES.push(side);

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const CHOSEN_CLASS =
  "rounded-md border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white dark:border-indigo-500 dark:bg-indigo-500";

function formatValue(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function formatBlame(value: number): string {
  if (value === 0) return "·";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(4).replace(/\.?0+$/, "");
}

export function PoolingPlayground() {
  const [picture, setPicture] = useState<Grid>(PATCH);
  const [draw, setDraw] = useState(1);
  const [windowSide, setWindowSide] = useState(2);
  const [stride, setStride] = useState(2);
  const [kind, setKind] = useState<PoolingKind>("max");
  const [showBlame, setShowBlame] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [pooling, setPooling] = useState<Pooling | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const requestCount = useRef(0);

  const side = picture.length;

  // Every change asks the API again. A reply that arrives after a later
  // request went out is dropped, so the grids never show a stale answer.
  useEffect(() => {
    const requestNumber = ++requestCount.current;
    (async () => {
      try {
        const answer = await applyPooling(picture, windowSide, stride, kind);
        if (requestNumber !== requestCount.current) return;
        setPooling(answer);
        setMessage(null);
      } catch (error) {
        if (requestNumber !== requestCount.current) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [picture, windowSide, stride, kind]);

  const fitSlidersTo = (nextSide: number) => {
    setWindowSide((current) => Math.min(current, nextSide));
    setStride((current) => Math.min(current, nextSide));
  };

  const startFrom = (cells: Grid) => {
    setPicture(cells);
    fitSlidersTo(cells.length);
    setHovered(null);
  };

  const resizeTo = (nextSide: number) => {
    setPicture((current) => resized(current, nextSide));
    fitSlidersTo(nextSide);
    setHovered(null);
  };

  const nudge = () => {
    setPicture((current) => nudgedRight(current));
    setHovered(null);
  };

  const setCell = (row: number, column: number, value: number) => {
    setPicture((current) =>
      current.map((cells, rowIndex) =>
        rowIndex === row
          ? cells.map((cell, columnIndex) =>
              columnIndex === column ? value : cell,
            )
          : cells,
      ),
    );
  };

  // The overlays are read cell by cell, so they are drawn only once the
  // answer describes the picture that is on screen.
  const current =
    pooling && pooling.height === side && pooling.width === side
      ? pooling
      : null;
  const hoveredWindow =
    current && hovered !== null ? (current.windows[hovered] ?? null) : null;

  const brightest = Math.max(1, ...picture.flat().map(Math.abs));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button onClick={() => startFrom(PATCH)} className={BUTTON_CLASS}>
          A four by four patch
        </button>
        <button
          onClick={() => startFrom(verticalStroke())}
          className={BUTTON_CLASS}
        >
          A vertical stroke
        </button>
        <button onClick={() => startFrom(FLAT_PATCH)} className={BUTTON_CLASS}>
          A flat patch
        </button>
        <button
          onClick={() => {
            setDraw((count) => count + 1);
            startFrom(randomPatch(side, draw));
          }}
          className={BUTTON_CLASS}
        >
          A random patch
        </button>
        <button onClick={nudge} className={BUTTON_CLASS}>
          Nudge right
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          Picture side
          <select
            value={side}
            onChange={(event) => resizeTo(Number(event.target.value))}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            {SIDES.map((choice) => (
              <option key={choice} value={choice}>
                {choice}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          Window
          <input
            type="range"
            min={1}
            max={side}
            value={windowSide}
            onChange={(event) => setWindowSide(Number(event.target.value))}
            className="w-24 accent-indigo-600"
          />
          <span className="w-4 font-mono">{windowSide}</span>
        </label>
        <label className="flex items-center gap-2">
          Stride
          <input
            type="range"
            min={1}
            max={side}
            value={stride}
            onChange={(event) => setStride(Number(event.target.value))}
            className="w-24 accent-indigo-600"
          />
          <span className="w-4 font-mono">{stride}</span>
        </label>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setKind("max")}
            className={kind === "max" ? CHOSEN_CLASS : BUTTON_CLASS}
          >
            Max
          </button>
          <button
            onClick={() => setKind("average")}
            className={kind === "average" ? CHOSEN_CLASS : BUTTON_CLASS}
          >
            Average
          </button>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showBlame}
            onChange={() => setShowBlame((flag) => !flag)}
            className="accent-indigo-600"
          />
          Show who gets trained
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-2">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${side}, minmax(0, 1fr))` }}
          >
            {picture.map((cells, row) =>
              cells.map((value, column) => {
                const inWindow =
                  hoveredWindow !== null &&
                  current !== null &&
                  row >= hoveredWindow.top &&
                  row < hoveredWindow.top + current.window &&
                  column >= hoveredWindow.left &&
                  column < hoveredWindow.left + current.window;
                const isWinner =
                  hoveredWindow?.winner?.row === row &&
                  hoveredWindow?.winner?.column === column;
                const corrected = showBlame
                  ? (current?.corrected[row]?.[column] ?? false)
                  : false;
                const blame = showBlame
                  ? (current?.blame[row]?.[column] ?? null)
                  : null;
                return (
                  <PictureCell
                    key={`${row}-${column}`}
                    value={value}
                    intensity={Math.abs(value) / brightest}
                    inWindow={inWindow}
                    isWinner={isWinner}
                    corrected={corrected}
                    blame={blame}
                    onCommit={(next) => setCell(row, column, next)}
                  />
                );
              }),
            )}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            The picture. Click a cell to change it.
          </span>
        </div>

        <span
          aria-hidden="true"
          className="text-2xl text-slate-400 dark:text-slate-600"
        >
          →
        </span>

        <div className="flex flex-col items-center gap-2">
          {pooling ? (
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${pooling.pooled_width}, minmax(0, 1fr))`,
              }}
              onMouseLeave={() => setHovered(null)}
            >
              {pooling.windows.map((entry, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setHovered(index)}
                  className={
                    "flex h-10 w-10 items-center justify-center rounded font-mono text-base font-semibold text-slate-900 dark:text-slate-100" +
                    (hovered === index ? " ring-2 ring-indigo-500" : "")
                  }
                  style={{
                    backgroundColor: `rgba(79, 70, 229, ${0.08 + 0.55 * Math.min(1, Math.abs(entry.answer) / brightest)})`,
                  }}
                >
                  {formatValue(entry.answer)}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-200 font-mono text-slate-500 dark:bg-slate-800">
              …
            </div>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400">
            The pooled map. Hover an answer to see its window.
          </span>
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        With the overlay on, the small number under each cell is what it
        receives when a slope of one arrives at every answer, and the ringed
        cells are the ones that receive anything at all.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Pooled to"
          value={
            pooling ? `${pooling.pooled_height} × ${pooling.pooled_width}` : "…"
          }
        />
        <Stat
          label="Windows swept"
          value={pooling ? String(pooling.windows.length) : "…"}
        />
        <Stat
          label="Cells receiving correction"
          value={
            pooling
              ? `${pooling.n_corrected} of ${pooling.height * pooling.width}`
              : "…"
          }
        />
        <Stat
          label="Shares in one window total"
          value={
            pooling && pooling.windows.length > 0
              ? String((hoveredWindow ?? pooling.windows[0]).share_total)
              : "…"
          }
        />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function PictureCell({
  value,
  intensity,
  inWindow,
  isWinner,
  corrected,
  blame,
  onCommit,
}: {
  value: number;
  intensity: number;
  inWindow: boolean;
  isWinner: boolean;
  corrected: boolean;
  blame: number | null;
  onCommit: (next: number) => void;
}) {
  const ring = isWinner
    ? " ring-2 ring-amber-500"
    : inWindow
      ? " ring-2 ring-indigo-500"
      : corrected
        ? " ring-2 ring-emerald-500"
        : "";
  return (
    <div
      className={
        "flex h-10 w-10 flex-col items-center justify-center rounded" + ring
      }
      style={{
        backgroundColor: `rgba(79, 70, 229, ${0.08 + 0.55 * Math.min(1, intensity)})`,
      }}
    >
      <EditableValue value={value} onCommit={onCommit} />
      {blame !== null && (
        <span className="font-mono text-[10px] leading-3 text-slate-700 dark:text-slate-300">
          {formatBlame(blame)}
        </span>
      )}
    </div>
  );
}

// One picture value. A click turns it into a text box, and Enter or leaving
// the box commits what was typed, clamped to the API's magnitude bound.
// Escape, or an entry that is not a number, leaves the value as it was.
function EditableValue({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (next: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const abandoned = useRef(false);

  const finish = () => {
    if (draft === null) return;
    if (!abandoned.current) {
      const parsed = Number(draft);
      if (draft.trim() !== "" && Number.isFinite(parsed)) {
        onCommit(Math.max(-LARGEST_VALUE, Math.min(LARGEST_VALUE, parsed)));
      }
    }
    abandoned.current = false;
    setDraft(null);
  };

  if (draft === null) {
    return (
      <button
        type="button"
        onClick={() => setDraft(String(value))}
        className="w-full rounded font-mono text-sm font-semibold leading-4 text-slate-900 hover:text-indigo-700 dark:text-slate-100 dark:hover:text-indigo-300"
      >
        {formatValue(value)}
      </button>
    );
  }

  return (
    <input
      autoFocus
      type="text"
      inputMode="decimal"
      value={draft}
      onFocus={(event) => event.target.select()}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={finish}
      onKeyDown={(event) => {
        if (event.key === "Enter") finish();
        if (event.key === "Escape") {
          abandoned.current = true;
          finish();
        }
      }}
      className="w-9 rounded border border-indigo-400 bg-white px-0.5 text-center font-mono text-sm font-semibold text-slate-900 outline-none dark:bg-slate-900 dark:text-slate-100"
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="break-all font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
