"use client";

// A block of numbers, and the axis a normalising layer reads it along.
//
// The grid is a batch, rows down and features across, and every cell can be
// edited by clicking it. Pick a layer and the band shows which way its
// statistics run, down each column for the batch layer and along each row for
// the other two, with the mean and deviation that band was standardised by
// printed in its margin. The small number under each raw value is what the
// layer answered. For the batch layer a toggle swaps in the same rows passed
// while predicting, after one training pass and one step, which is the only
// layer for which that is a different question. Every statistic and every
// normalised value is the library's through the API; the browser only lays
// them out.

import { useEffect, useRef, useState } from "react";
import { ApiError, NormalisationLayer, ReducedStatistic } from "@/lib/api";
import {
  NormalisedBlock,
  normaliseBlock,
} from "@/lib/concepts/normalisation-layers";
import {
  PLAYGROUND_MAX_ROWS,
  THREE_FEATURES,
  TWENTY_OF_THE_CROWD,
  WORKED_BLOCK,
  randomPeople,
} from "./normalisationLayersFixtures";

const MIN_ROWS = 2;
const MAX_ROWS = PLAYGROUND_MAX_ROWS;
const MIN_FEATURES = 2;
const MAX_FEATURES = 6;
const MAX_MAGNITUDE = 1_000_000;

type Mode = "training" | "predicting";

const LAYERS: { layer: NormalisationLayer; label: string }[] = [
  { layer: "batch", label: "Batch" },
  { layer: "layer", label: "Layer" },
  { layer: "rms", label: "RMS" },
];

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const ACTIVE_BUTTON_CLASS =
  "rounded-md border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition dark:border-indigo-500 dark:bg-indigo-500";

const SMALL_BUTTON_CLASS =
  "rounded border border-slate-300 bg-white px-2 text-sm font-medium leading-6 text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800";

const BAND_CLASS = "bg-indigo-500/10 dark:bg-indigo-400/15";

function formatMean(value: number): string {
  return String(Number(value.toFixed(4)));
}

function captionFor(layer: NormalisationLayer, mode: Mode): string {
  if (layer === "batch" && mode === "predicting") {
    return "The same rows, answered by the running figures after one training pass and one step. They began at a mean of 0 and a variance of 1 and have moved a tenth of the way toward the batch.";
  }
  if (layer === "batch") {
    return "The band runs down each column, so every statistic is read across the batch, and a cell’s answer depends on which rows travelled with it.";
  }
  if (layer === "layer") {
    return "The band runs along each row, so every statistic is read from that row alone, and a row’s answer is the same whatever else arrived.";
  }
  return "The band runs along each row and nothing is subtracted. Each row is divided by its own root mean square as it stands.";
}

export function NormalisationPlayground() {
  const [rows, setRows] = useState<number[][]>(WORKED_BLOCK);
  const [layer, setLayer] = useState<NormalisationLayer>("batch");
  const [mode, setMode] = useState<Mode>("training");
  const [answer, setAnswer] = useState<NormalisedBlock | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await normaliseBlock(rows, layer));
        setMessage(null);
      } catch (error) {
        setAnswer(null);
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [rows, layer]);

  const width = rows[0].length;
  const columnBands = layer === "batch";
  const predicting = columnBands && mode === "predicting";
  // An answer fetched for the previous layer would print one axis's numbers
  // under the other axis's bands, so the grid waits for the fresh one.
  const fresh = answer && answer.layer === layer ? answer : null;
  const shown = fresh
    ? predicting
      ? fresh.as_predicting
      : fresh.normalised
    : null;
  const statistics = fresh
    ? predicting
      ? fresh.predicting_statistics
      : fresh.statistics
    : null;

  const setCell = (rowIndex: number, columnIndex: number, value: number) => {
    setRows((current) =>
      current.map((row, r) =>
        r === rowIndex
          ? row.map((cell, c) => (c === columnIndex ? value : cell))
          : row,
      ),
    );
  };

  const addRow = () => {
    if (rows.length >= MAX_ROWS) return;
    setRows((current) => [...current, [...current[current.length - 1]]]);
  };

  const removeRow = () => {
    if (rows.length <= MIN_ROWS) return;
    setRows((current) => current.slice(0, -1));
  };

  const addFeature = () => {
    if (width >= MAX_FEATURES) return;
    setRows((current) => current.map((row) => [...row, row[row.length - 1]]));
  };

  const removeFeature = () => {
    if (width <= MIN_FEATURES) return;
    setRows((current) => current.map((row) => row.slice(0, -1)));
  };

  const gridStyle = {
    gridTemplateColumns: `3.25rem repeat(${width}, minmax(0, 1fr))${
      columnBands ? "" : " 7.5rem"
    }`,
    columnGap: columnBands ? "0.5rem" : "0",
    rowGap: columnBands ? "0" : "0.5rem",
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => setRows(TWENTY_OF_THE_CROWD)}
          className={BUTTON_CLASS}
        >
          An Ideal Case
        </button>
        <button
          onClick={() => setRows(randomPeople())}
          className={BUTTON_CLASS}
        >
          Random people
        </button>
        <button onClick={() => setRows(WORKED_BLOCK)} className={BUTTON_CLASS}>
          The whole-number four
        </button>
        <button
          onClick={() => setRows(THREE_FEATURES)}
          className={BUTTON_CLASS}
        >
          Three features
        </button>
        <div className="ml-auto flex items-center gap-1">
          {LAYERS.map((choice) => (
            <button
              key={choice.layer}
              onClick={() => setLayer(choice.layer)}
              className={
                choice.layer === layer ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS
              }
            >
              {choice.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          Rows <span className="w-5 font-mono">{rows.length}</span>
          <button
            onClick={removeRow}
            disabled={rows.length <= MIN_ROWS}
            className={SMALL_BUTTON_CLASS}
            aria-label="remove a row"
          >
            −
          </button>
          <button
            onClick={addRow}
            disabled={rows.length >= MAX_ROWS}
            className={SMALL_BUTTON_CLASS}
            aria-label="add a row"
          >
            +
          </button>
        </span>
        <span className="flex items-center gap-1.5">
          Features <span className="w-3 font-mono">{width}</span>
          <button
            onClick={removeFeature}
            disabled={width <= MIN_FEATURES}
            className={SMALL_BUTTON_CLASS}
            aria-label="remove a feature"
          >
            −
          </button>
          <button
            onClick={addFeature}
            disabled={width >= MAX_FEATURES}
            className={SMALL_BUTTON_CLASS}
            aria-label="add a feature"
          >
            +
          </button>
        </span>
        {columnBands && (
          <span className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setMode("training")}
              className={
                mode === "training" ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS
              }
            >
              While training
            </button>
            <button
              onClick={() => setMode("predicting")}
              className={
                mode === "predicting" ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS
              }
            >
              While predicting
            </button>
          </span>
        )}
      </div>

      <div
        className="grid items-stretch rounded-lg bg-slate-50 p-3 dark:bg-slate-950"
        style={gridStyle}
      >
        <div />
        {rows[0].map((_, columnIndex) => (
          <div
            key={`h${columnIndex}`}
            className={
              "pt-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400 " +
              (columnBands ? BAND_CLASS + " rounded-t-lg" : "")
            }
          >
            feature {columnIndex + 1}
          </div>
        ))}
        {!columnBands && <div />}

        {rows.map((row, rowIndex) => (
          <GridRow
            key={`r${rowIndex}`}
            rowIndex={rowIndex}
            row={row}
            shown={shown?.[rowIndex] ?? null}
            statistic={columnBands ? null : (statistics?.[rowIndex] ?? null)}
            columnBands={columnBands}
            layer={layer}
            onCommit={setCell}
          />
        ))}

        {columnBands && (
          <>
            <div />
            {rows[0].map((_, columnIndex) => (
              <div
                key={`s${columnIndex}`}
                className={
                  BAND_CLASS +
                  " rounded-b-lg px-1 pb-2 pt-1 text-center font-mono text-xs text-slate-600 dark:text-slate-300"
                }
              >
                <StatisticLines
                  statistic={statistics?.[columnIndex] ?? null}
                  layer={layer}
                />
              </div>
            ))}
          </>
        )}
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        {captionFor(layer, mode)} Click a cell to change it.
      </p>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function GridRow({
  rowIndex,
  row,
  shown,
  statistic,
  columnBands,
  layer,
  onCommit,
}: {
  rowIndex: number;
  row: number[];
  shown: number[] | null;
  statistic: ReducedStatistic | null;
  columnBands: boolean;
  layer: NormalisationLayer;
  onCommit: (rowIndex: number, columnIndex: number, value: number) => void;
}) {
  return (
    <>
      <div className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
        row {rowIndex + 1}
      </div>
      {row.map((value, columnIndex) => {
        const answered = shown?.[columnIndex];
        return (
          <div
            key={`c${columnIndex}`}
            className={
              BAND_CLASS +
              " px-1 py-1.5 text-center " +
              (!columnBands && columnIndex === 0 ? "rounded-l-lg" : "")
            }
          >
            <EditableValue
              value={value}
              onCommit={(next) => onCommit(rowIndex, columnIndex, next)}
            />
            <div className="font-mono text-xs text-indigo-700 dark:text-indigo-300">
              {answered === undefined ? "…" : answered.toFixed(4)}
            </div>
          </div>
        );
      })}
      {!columnBands && (
        <div
          className={
            BAND_CLASS +
            " flex flex-col justify-center rounded-r-lg px-2 font-mono text-xs text-slate-600 dark:text-slate-300"
          }
        >
          <StatisticLines statistic={statistic} layer={layer} />
        </div>
      )}
    </>
  );
}

function StatisticLines({
  statistic,
  layer,
}: {
  statistic: ReducedStatistic | null;
  layer: NormalisationLayer;
}) {
  if (!statistic) return <div>…</div>;
  if (layer === "rms") {
    return <div>rms {statistic.deviation.toFixed(7)}</div>;
  }
  return (
    <>
      <div>mean {formatMean(statistic.mean ?? 0)}</div>
      <div>dev {statistic.deviation.toFixed(7)}</div>
    </>
  );
}

// One raw value. A click turns it into a text box, and Enter or leaving the
// box commits what was typed, clamped to the API's magnitude bound. Escape
// or an unreadable entry leaves the value as it was.
function EditableValue({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (next: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const cancelled = useRef(false);

  const commit = () => {
    if (draft === null) return;
    if (!cancelled.current) {
      const parsed = Number(draft);
      if (draft.trim() !== "" && Number.isFinite(parsed)) {
        onCommit(Math.max(-MAX_MAGNITUDE, Math.min(MAX_MAGNITUDE, parsed)));
      }
    }
    cancelled.current = false;
    setDraft(null);
  };

  if (draft === null) {
    return (
      <button
        type="button"
        onClick={() => setDraft(String(value))}
        className="w-full rounded font-mono text-base font-semibold text-slate-900 hover:bg-white/70 hover:text-indigo-600 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
      >
        {value}
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
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") commit();
        if (event.key === "Escape") {
          cancelled.current = true;
          commit();
        }
      }}
      className="w-full rounded border border-indigo-400 bg-white px-1 text-center font-mono text-base font-semibold text-slate-900 outline-none dark:bg-slate-900 dark:text-slate-100"
    />
  );
}
