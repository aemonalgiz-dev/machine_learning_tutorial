"use client";

// Three shapes learned as a distribution, and a damaged copy rebuilt from it.
//
// The small grids are the shapes the machine was shown, the Hopfield page's T,
// L and cross written as lit and dark cells, and the machine keeps none of
// them. What it learns is one weight from every cell to every hidden unit, and
// the bars are the hidden units, each one's height the probability it turns
// on for the shape you clicked. The large grid is the probe. Click a cell to
// flip it, or damage five at once, then press reconstruct to push the probe up
// through the hidden layer and back down, and the shaded grid beside it is
// what comes out, each cell darkened by the probability the machine gives it.
// The chart is the free energy of every stored shape and of the probe, lower
// meaning more plausible to the machine, with the figure before any learning
// drawn hollow beside each. The sliders change the fit itself, so every move
// of one is a fresh fit from the same seed. Every probability, every
// reconstruction and every free energy is the library's through the API. The
// browser flips cells, picks which five to damage, and lays the answer out.

import { useEffect, useState } from "react";
import {
  ApiError,
  BoltzmannFit,
  BoltzmannReconstruction,
  fitBoltzmann,
  reconstructWithBoltzmann,
} from "@/lib/api";
import {
  DAMAGED_CELLS,
  PATTERNS,
  THREE_SHAPES,
} from "./boltzmannFixtures";

const MIN_HIDDEN_UNITS = 1;
const MAX_HIDDEN_UNITS = 8;
const DEFAULT_HIDDEN_UNITS = 3;
const MIN_EPOCHS = 1;
const MAX_EPOCHS = 500;
const DEFAULT_EPOCHS = 500;

const BARS = { width: 400, height: 150 };
const BARS_PAD = { left: 10, right: 10, top: 18, bottom: 24 };
const BARS_PLOT = {
  width: BARS.width - BARS_PAD.left - BARS_PAD.right,
  height: BARS.height - BARS_PAD.top - BARS_PAD.bottom,
};

const CHART = { width: 300, height: 220 };
const CHART_PAD = { left: 44, right: 12, top: 12, bottom: 46 };
const CHART_PLOT = {
  width: CHART.width - CHART_PAD.left - CHART_PAD.right,
  height: CHART.height - CHART_PAD.top - CHART_PAD.bottom,
};

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800";

const PRIMARY_BUTTON_CLASS =
  "rounded-md border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-40 dark:border-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400";

export function BoltzmannPlayground() {
  const [hiddenUnits, setHiddenUnits] = useState(DEFAULT_HIDDEN_UNITS);
  const [epochs, setEpochs] = useState(DEFAULT_EPOCHS);
  const [fit, setFit] = useState<BoltzmannFit | null>(null);
  const [selected, setSelected] = useState(0);
  const [probe, setProbe] = useState<number[]>(THREE_SHAPES[0].cells);
  const [reconstruction, setReconstruction] =
    useState<BoltzmannReconstruction | null>(null);
  const [reconstructing, setReconstructing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setFit(await fitBoltzmann(PATTERNS, hiddenUnits, epochs));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [hiddenUnits, epochs]);

  const chooseShape = (index: number) => {
    setSelected(index);
    setProbe(THREE_SHAPES[index].cells);
    setReconstruction(null);
  };

  const flipCell = (index: number) => {
    setProbe((current) =>
      current.map((value, position) =>
        position === index ? 1 - value : value,
      ),
    );
    setReconstruction(null);
  };

  const damage = () => {
    setProbe((current) =>
      current.map((value, position) =>
        DAMAGED_CELLS.includes(position) ? 1 - value : value,
      ),
    );
    setReconstruction(null);
  };

  const changeHiddenUnits = (value: number) => {
    setHiddenUnits(value);
    setReconstruction(null);
  };

  const changeEpochs = (value: number) => {
    setEpochs(value);
    setReconstruction(null);
  };

  const reconstruct = async () => {
    setReconstructing(true);
    try {
      setReconstruction(
        await reconstructWithBoltzmann(PATTERNS, hiddenUnits, epochs, probe),
      );
      setMessage(null);
    } catch (error) {
      if (error instanceof ApiError) setMessage(error.message);
      else setMessage("Something went wrong.");
    } finally {
      setReconstructing(false);
    }
  };

  const chosen = THREE_SHAPES[selected];
  const storedHidden = fit ? fit.patterns[selected].hidden_probabilities : null;
  const probeHidden = reconstruction
    ? reconstruction.probe.hidden_probabilities
    : null;

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4 pb-3">
        {THREE_SHAPES.map((entry, index) => (
          <button
            key={entry.name}
            onClick={() => chooseShape(index)}
            title={`Show the hidden units for ${entry.name} and start the probe from it`}
            className="group flex flex-col items-center gap-1"
          >
            <PatternGrid
              cells={entry.cells}
              small
              highlighted={index === selected}
            />
            <span className="text-xs text-slate-500 group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-400">
              {entry.name}
            </span>
          </button>
        ))}
        <div className="ml-auto flex flex-col gap-1">
          <label className="flex items-center justify-end gap-2 text-sm text-slate-600 dark:text-slate-300">
            Hidden units
            <input
              type="range"
              min={MIN_HIDDEN_UNITS}
              max={MAX_HIDDEN_UNITS}
              step={1}
              value={hiddenUnits}
              onChange={(event) => changeHiddenUnits(Number(event.target.value))}
              className="w-32 accent-indigo-600"
            />
            <span className="w-8 text-right font-mono text-sm">
              {hiddenUnits}
            </span>
          </label>
          <label className="flex items-center justify-end gap-2 text-sm text-slate-600 dark:text-slate-300">
            Epochs
            <input
              type="range"
              min={MIN_EPOCHS}
              max={MAX_EPOCHS}
              step={1}
              value={epochs}
              onChange={(event) => changeEpochs(Number(event.target.value))}
              className="w-32 accent-indigo-600"
            />
            <span className="w-8 text-right font-mono text-sm">{epochs}</span>
          </label>
        </div>
      </div>

      <HiddenUnitBars
        stored={storedHidden}
        storedName={chosen.name}
        probe={probeHidden}
        unitCount={hiddenUnits}
      />

      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button onClick={damage} className={BUTTON_CLASS}>
          Damage five cells
        </button>
        <button
          onClick={reconstruct}
          disabled={reconstructing || !fit}
          className={PRIMARY_BUTTON_CLASS}
        >
          Reconstruct
        </button>
      </div>

      <div className="flex flex-wrap items-start justify-center gap-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-2">
          <PatternGrid cells={probe} onFlip={flipCell} />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            The probe. Click a cell to flip it.
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <ShadedGrid
            probabilities={
              reconstruction ? reconstruction.probe.reconstruction : null
            }
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {reconstruction
              ? "What comes back, shaded by probability."
              : "Press reconstruct to see what comes back."}
          </span>
        </div>

        <FreeEnergyChart fit={fit} reconstruction={reconstruction} />
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Each move of a slider is a fresh fit from the same seed, and nothing is
        carried over from the fit before it.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Reconstruction error"
          value={fit ? fit.reconstruction_error.toFixed(4) : "…"}
        />
        <Stat
          label="Epochs run"
          value={
            fit
              ? fit.converged
                ? `${fit.epochs_run}, settled`
                : String(fit.epochs_run)
              : "…"
          }
        />
        <Stat
          label={`Free energy of ${chosen.name}`}
          value={fit ? fit.patterns[selected].free_energy.toFixed(2) : "…"}
          note={
            fit
              ? `${fit.patterns[selected].initial_free_energy.toFixed(2)} before learning`
              : undefined
          }
        />
        <Stat
          label="Free energy of the probe"
          value={
            reconstruction ? reconstruction.probe.free_energy.toFixed(2) : "…"
          }
          note={
            reconstruction
              ? `${reconstruction.probe.initial_free_energy.toFixed(2)} before learning`
              : undefined
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

function PatternGrid({
  cells,
  onFlip,
  highlighted = false,
  small = false,
}: {
  cells: number[];
  onFlip?: (index: number) => void;
  highlighted?: boolean;
  small?: boolean;
}) {
  const size = small ? "h-3.5 w-3.5" : "h-8 w-8";
  return (
    <div
      className={
        "grid grid-cols-5 rounded-sm " +
        (small ? "gap-0.5 p-0.5" : "gap-1") +
        (highlighted ? " ring-2 ring-indigo-500 ring-offset-1" : "")
      }
    >
      {cells.map((value, index) => {
        const lit = value > 0;
        const className =
          size +
          " rounded-sm " +
          (lit ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700") +
          (onFlip ? " cursor-pointer hover:opacity-80" : "");
        if (onFlip) {
          return (
            <button
              key={index}
              type="button"
              aria-label={`cell ${index + 1}, ${lit ? "lit" : "dark"}`}
              onClick={() => onFlip(index)}
              className={className}
            />
          );
        }
        return <div key={index} className={className} />;
      })}
    </div>
  );
}

// The reconstruction, one cell per visible unit with the indigo laid over a
// dark base at the probability the machine gave it, so a certain cell is solid,
// an uncertain one is a wash, and a cell the machine is sure is off is bare.
function ShadedGrid({ probabilities }: { probabilities: number[] | null }) {
  const values = probabilities ?? THREE_SHAPES[0].cells.map(() => 0);
  return (
    <div className="grid grid-cols-5 gap-1">
      {values.map((probability, index) => (
        <div
          key={index}
          title={probabilities ? probability.toFixed(2) : undefined}
          className="relative h-8 w-8 rounded-sm bg-slate-200 dark:bg-slate-700"
        >
          <div
            className="absolute inset-0 rounded-sm bg-indigo-600"
            style={{ opacity: probability }}
          />
        </div>
      ))}
    </div>
  );
}

function HiddenUnitBars({
  stored,
  storedName,
  probe,
  unitCount,
}: {
  stored: number[] | null;
  storedName: string;
  probe: number[] | null;
  unitCount: number;
}) {
  const count = stored ? stored.length : unitCount;
  const groupWidth = BARS_PLOT.width / count;
  const barWidth = Math.min(28, groupWidth * 0.32);
  const baseline = BARS_PAD.top + BARS_PLOT.height;
  const heightOf = (probability: number) => probability * BARS_PLOT.height;
  const showValues = count <= 4;

  return (
    <div className="flex flex-col items-center gap-1 pb-3">
      <svg
        viewBox={`0 0 ${BARS.width} ${BARS.height}`}
        className="w-full max-w-md select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={BARS_PAD.left}
          y1={baseline}
          x2={BARS_PAD.left + BARS_PLOT.width}
          y2={baseline}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1}
        />
        {Array.from({ length: count }, (_, index) => {
          const centre = BARS_PAD.left + (index + 0.5) * groupWidth;
          const storedValue = stored ? stored[index] : 0;
          const probeValue = probe ? probe[index] : null;
          const storedX =
            probeValue === null ? centre - barWidth / 2 : centre - barWidth - 1;
          return (
            <g key={index}>
              <rect
                x={storedX}
                y={baseline - heightOf(storedValue)}
                width={barWidth}
                height={heightOf(storedValue)}
                className="fill-indigo-600"
              />
              {showValues && stored && (
                <text
                  x={storedX + barWidth / 2}
                  y={baseline - heightOf(storedValue) - 4}
                  textAnchor="middle"
                  className="fill-indigo-600 text-[10px] font-medium dark:fill-indigo-400"
                >
                  {storedValue.toFixed(2)}
                </text>
              )}
              {probeValue !== null && (
                <>
                  <rect
                    x={centre + 1}
                    y={baseline - heightOf(probeValue)}
                    width={barWidth}
                    height={heightOf(probeValue)}
                    className="fill-amber-500"
                  />
                  {showValues && (
                    <text
                      x={centre + 1 + barWidth / 2}
                      y={baseline - heightOf(probeValue) - 4}
                      textAnchor="middle"
                      className="fill-amber-600 text-[10px] font-medium dark:fill-amber-400"
                    >
                      {probeValue.toFixed(2)}
                    </text>
                  )}
                </>
              )}
              <text
                x={centre}
                y={baseline + 15}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400"
              >
                unit {index + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        The hidden units for {storedName}
        {probe ? ", with the probe beside each in amber" : ""}. Height is the
        probability the unit turns on.
      </span>
    </div>
  );
}

interface EnergyEntry {
  label: string;
  learned: number | null;
  initial: number | null;
}

function FreeEnergyChart({
  fit,
  reconstruction,
}: {
  fit: BoltzmannFit | null;
  reconstruction: BoltzmannReconstruction | null;
}) {
  const entries: EnergyEntry[] = THREE_SHAPES.map((entry, index) => ({
    label: entry.label,
    learned: fit ? fit.patterns[index].free_energy : null,
    initial: fit ? fit.patterns[index].initial_free_energy : null,
  }));
  entries.push({
    label: "probe",
    learned: reconstruction ? reconstruction.probe.free_energy : null,
    initial: reconstruction ? reconstruction.probe.initial_free_energy : null,
  });

  const values = entries
    .flatMap((entry) => [entry.learned, entry.initial])
    .filter((value): value is number => value !== null);
  const highest = Math.max(0, ...values);
  const lowest = Math.min(0, ...values);
  const span = highest - lowest || 1;
  const toY = (value: number) =>
    CHART_PAD.top + ((highest - value) / span) * CHART_PLOT.height;
  const zeroY = toY(0);
  const groupWidth = CHART_PLOT.width / entries.length;
  const barWidth = Math.min(18, groupWidth * 0.3);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="w-72 select-none"
      >
        <line
          x1={CHART_PAD.left}
          y1={CHART_PAD.top}
          x2={CHART_PAD.left}
          y2={CHART_PAD.top + CHART_PLOT.height}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1}
        />
        <line
          x1={CHART_PAD.left}
          y1={zeroY}
          x2={CHART_PAD.left + CHART_PLOT.width}
          y2={zeroY}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1}
        />
        <text
          x={CHART_PAD.left - 6}
          y={zeroY + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400"
        >
          0
        </text>
        {values.length > 0 && (
          <text
            x={CHART_PAD.left - 6}
            y={toY(lowest) + 4}
            textAnchor="end"
            className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400"
          >
            {lowest.toFixed(1)}
          </text>
        )}

        {entries.map((entry, index) => {
          const centre = CHART_PAD.left + (index + 0.5) * groupWidth;
          const hollowX = centre - barWidth - 1;
          const solidX = centre + 1;
          return (
            <g key={entry.label}>
              {entry.initial !== null && (
                <rect
                  x={hollowX}
                  y={Math.min(zeroY, toY(entry.initial))}
                  width={barWidth}
                  height={Math.abs(toY(entry.initial) - zeroY)}
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-400 dark:text-slate-500"
                  strokeWidth={1.5}
                >
                  <title>{`${entry.initial.toFixed(2)} before learning`}</title>
                </rect>
              )}
              {entry.learned !== null && (
                <>
                  <rect
                    x={solidX}
                    y={Math.min(zeroY, toY(entry.learned))}
                    width={barWidth}
                    height={Math.abs(toY(entry.learned) - zeroY)}
                    className={
                      entry.label === "probe"
                        ? "fill-amber-500"
                        : "fill-indigo-600"
                    }
                  >
                    <title>{`${entry.learned.toFixed(2)} after learning`}</title>
                  </rect>
                  <text
                    x={solidX + barWidth / 2}
                    y={
                      entry.learned < 0
                        ? toY(entry.learned) + 11
                        : toY(entry.learned) - 4
                    }
                    textAnchor="middle"
                    className="fill-slate-600 text-[9px] font-medium dark:fill-slate-300"
                  >
                    {entry.learned.toFixed(1)}
                  </text>
                </>
              )}
              <text
                x={centre}
                y={CHART.height - 18}
                textAnchor="middle"
                className={
                  "text-[10px] font-medium " +
                  (entry.learned === null
                    ? "fill-slate-400 dark:fill-slate-600"
                    : "fill-slate-500 dark:fill-slate-400")
                }
              >
                {entry.label}
              </text>
            </g>
          );
        })}

        <text
          x={CHART_PAD.left + CHART_PLOT.width / 2}
          y={CHART.height - 4}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400"
        >
          Free energy, lower is more plausible
        </text>
      </svg>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        Solid after learning, hollow before any.
      </span>
    </div>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
      {note && (
        <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {note}
        </div>
      )}
    </div>
  );
}
