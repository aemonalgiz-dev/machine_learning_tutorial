"use client";

// Two decision maps for one crowd, and a probe that reads both.
//
// Both routes call every person in the crowd correctly, so accuracy cannot
// tell them apart, and the two maps show what accuracy hides: the regions
// differ, and so do the numbers at any point that is not a training person.
// Move the probe and the readout gives the softmax probabilities and the
// one-vs-rest outputs there, with the class each route would call. The two
// fits and their lattices are the API's.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { MulticlassAnswer, classifyAmongThree } from "@/lib/concepts/multiclass-classification";
import { CLASS_COLOURS, CLASS_NAMES, CROWD } from "./RouteComparison";

const MAP = 300;
const MAP_PAD = 26;

function softmaxOf(scores: number[]): number[] {
  const largest = Math.max(...scores);
  const exponentials = scores.map((score) => Math.exp(score - largest));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / total);
}

function sigmoid(z: number) {
  return 1 / (1 + Math.exp(-z));
}

export function RegionsSideBySide() {
  const [softmax, setSoftmax] = useState<MulticlassAnswer | null>(null);
  const [oneVsRest, setOneVsRest] = useState<MulticlassAnswer | null>(null);
  const [probe, setProbe] = useState({ row: 8, column: 17 });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [first, second] = await Promise.all([
          classifyAmongThree(CROWD, "softmax"),
          classifyAmongThree(CROWD, "one_vs_rest"),
        ]);
        setSoftmax(first);
        setOneVsRest(second);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!softmax || !oneVsRest) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const cells = softmax.regions.cells;
  const mapCell = (MAP - 2 * MAP_PAD) / cells;
  const mapX = (column: number) => MAP_PAD + column * mapCell;
  const mapY = (row: number) => MAP - MAP_PAD - (row + 1) * mapCell;
  const cellX = (column: number) => softmax.regions.x_min + ((softmax.regions.x_max - softmax.regions.x_min) * column) / (cells - 1);
  const cellY = (row: number) => softmax.regions.y_min + ((softmax.regions.y_max - softmax.regions.y_min) * row) / (cells - 1);

  // The probe reads the lattice cell the API scored; the squash applied to
  // the stored linear scores is each route's own, softmax or sigmoid.
  const softmaxScores = softmax.score_lattice.map((plane) => plane[probe.row][probe.column]);
  const softmaxProbabilities = softmaxOf(softmaxScores);
  const restOutputs = oneVsRest.score_lattice.map((plane) => sigmoid(plane[probe.row][probe.column]));
  const softmaxCall = softmaxProbabilities.indexOf(Math.max(...softmaxProbabilities));
  const restCall = restOutputs.indexOf(Math.max(...restOutputs));
  const disagreements = softmax.regions.labels.flat().filter((label, index) => label !== oneVsRest.regions.labels.flat()[index]).length;

  const drawMap = (answer: MulticlassAnswer, title: string) => (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
      <svg viewBox={`0 0 ${MAP} ${MAP}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {answer.regions.labels.map((row, rowIndex) =>
          row.map((label, columnIndex) => (
            <rect key={`${rowIndex}-${columnIndex}`} x={mapX(columnIndex)} y={mapY(rowIndex)} width={mapCell + 0.5} height={mapCell + 0.5} fill={CLASS_COLOURS[label]} opacity={0.25} />
          )),
        )}
        {CROWD.map((person, index) => (
          <circle key={index} cx={mapX(((person.x - answer.regions.x_min) / (answer.regions.x_max - answer.regions.x_min)) * (cells - 1)) + mapCell / 2} cy={mapY(((person.y - answer.regions.y_min) / (answer.regions.y_max - answer.regions.y_min)) * (cells - 1)) + mapCell / 2} r={4} fill={CLASS_COLOURS[person.label]} stroke="white" strokeWidth={1} />
        ))}
        <circle cx={mapX(probe.column) + mapCell / 2} cy={mapY(probe.row) + mapCell / 2} r={7} fill="none" stroke="#0f172a" strokeWidth={2.5} className="dark:stroke-slate-100" />
      </svg>
      <p className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-300">accuracy {answer.accuracy.toFixed(3)}, log loss {answer.log_loss.toFixed(4)}</p>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
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
        {drawMap(softmax, "Softmax regions")}
        {drawMap(oneVsRest, "One-vs-rest regions")}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">at the probe</th>
              {CLASS_NAMES.map((name, index) => (
                <th key={name} className="py-1.5 pr-4 font-semibold" style={{ color: CLASS_COLOURS[index] }}>{name}</th>
              ))}
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">total</th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">calls</th>
            </tr>
          </thead>
          <tbody className="font-mono text-slate-800 dark:text-slate-200">
            <tr className="border-b border-slate-100 dark:border-slate-800/60">
              <td className="py-1.5 pr-4 font-sans">softmax probabilities</td>
              {softmaxProbabilities.map((value, index) => <td key={index} className="py-1.5 pr-4">{value.toFixed(3)}</td>)}
              <td className="py-1.5 pr-4">{softmaxProbabilities.reduce((sum, value) => sum + value, 0).toFixed(3)}</td>
              <td className="py-1.5 font-sans">{CLASS_NAMES[softmaxCall]}</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-4 font-sans">one-vs-rest outputs</td>
              {restOutputs.map((value, index) => <td key={index} className="py-1.5 pr-4">{value.toFixed(3)}</td>)}
              <td className="py-1.5 pr-4">{restOutputs.reduce((sum, value) => sum + value, 0).toFixed(3)}</td>
              <td className="py-1.5 font-sans">{CLASS_NAMES[restCall]}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The two maps disagree on {disagreements} of {cells * cells} cells. Both call every training person correctly.
      </p>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
