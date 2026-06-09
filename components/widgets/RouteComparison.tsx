"use client";

// One person, both routes, every stage, side by side.
//
// The left column is the softmax route: this person's three linear scores,
// their exponentials, the shared total, and the probabilities as one
// divided bar. The right column is one-vs-rest: three separate log-odds,
// three separate sigmoids, three independent gauges, and a total that is
// whatever it happens to be. Under each is the class the route would call.
// The person can be any of the three worked people or anyone in the crowd,
// and the standardised coordinates the fits actually saw are shown beside
// the raw ones. Both fits are the library's through the API.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ClassedPoint, MulticlassAnswer, classifyAmongThree } from "@/lib/concepts/multiclass-classification";

export const THREE_PEOPLE: ClassedPoint[] = [
  { x: 120, y: 25, label: 0 },
  { x: 150, y: 50, label: 1 },
  { x: 180, y: 75, label: 2 },
];

export const CROWD: ClassedPoint[] = [
  { x: 118, y: 24, label: 0 },
  { x: 120, y: 25, label: 0 },
  { x: 122, y: 28, label: 0 },
  { x: 125, y: 31, label: 0 },
  { x: 145, y: 57, label: 1 },
  { x: 147, y: 41, label: 1 },
  { x: 156, y: 53, label: 1 },
  { x: 159, y: 57, label: 1 },
  { x: 162, y: 61, label: 1 },
  { x: 178, y: 78, label: 2 },
  { x: 180, y: 80, label: 2 },
  { x: 183, y: 83, label: 2 },
  { x: 186, y: 77, label: 2 },
];

export const CLASS_NAMES = ["child", "teenager", "adult"];
export const CLASS_COLOURS = ["#f59e0b", "#10b981", "#6366f1"];

function sigmoid(z: number) {
  return 1 / (1 + Math.exp(-z));
}

export function RouteComparison() {
  const [points, setPoints] = useState<ClassedPoint[]>(THREE_PEOPLE);
  const [person, setPerson] = useState(1);
  const [softmax, setSoftmax] = useState<MulticlassAnswer | null>(null);
  const [oneVsRest, setOneVsRest] = useState<MulticlassAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [first, second] = await Promise.all([
          classifyAmongThree(points, "softmax"),
          classifyAmongThree(points, "one_vs_rest"),
        ]);
        setSoftmax(first);
        setOneVsRest(second);
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [points]);

  const chosen = points[person];
  const softmaxScores = softmax ? softmax.linear_scores[person] : null;
  const exponentials = softmaxScores ? softmaxScores.map((score) => Math.exp(score)) : null;
  const total = exponentials ? exponentials.reduce((sum, value) => sum + value, 0) : null;
  const softmaxProbabilities = softmax ? softmax.scores[person] : null;
  const restScores = oneVsRest ? oneVsRest.linear_scores[person] : null;
  const restOutputs = oneVsRest ? oneVsRest.scores[person] : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button onClick={() => { setPoints(THREE_PEOPLE); setPerson(1); }} className={`rounded-md border px-3 py-1 text-sm font-medium ${points === THREE_PEOPLE ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-200" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>
          the three people
        </button>
        <button onClick={() => { setPoints(CROWD); setPerson(6); }} className={`rounded-md border px-3 py-1 text-sm font-medium ${points === CROWD ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-200" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>
          the crowd
        </button>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          person
          <select value={person} onChange={(event) => setPerson(Number(event.target.value))} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
            {points.map((each, index) => (
              <option key={index} value={index}>
                {CLASS_NAMES[each.label]}, {each.x} cm, {each.y} kg
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 font-mono text-xs text-slate-700 dark:text-slate-200 sm:grid-cols-4">
        <div className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">height {chosen.x} cm</div>
        <div className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">weight {chosen.y} kg</div>
        <div className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">standardised height {softmax ? softmax.standardised_points[person][0].toFixed(3) : "…"}</div>
        <div className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">standardised weight {softmax ? softmax.standardised_points[person][1].toFixed(3) : "…"}</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Softmax, one model, one divided bar</p>
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-left font-sans text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-1 pr-2">class</th>
                <th className="py-1 pr-2">z</th>
                <th className="py-1 pr-2">e^z</th>
                <th className="py-1">÷ total → p</th>
              </tr>
            </thead>
            <tbody>
              {CLASS_NAMES.map((name, index) => (
                <tr key={name} style={{ color: CLASS_COLOURS[index] }}>
                  <td className="py-1 pr-2 font-sans">{name}</td>
                  <td className="py-1 pr-2">{softmaxScores ? softmaxScores[index].toFixed(4) : "…"}</td>
                  <td className="py-1 pr-2">{exponentials ? exponentials[index].toFixed(2) : "…"}</td>
                  <td className="py-1 font-semibold">{softmaxProbabilities ? softmaxProbabilities[index].toFixed(4) : "…"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">shared total {total ? total.toFixed(2) : "…"}</p>
          <div className="mt-2 flex h-6 w-full overflow-hidden rounded-md">
            {softmaxProbabilities?.map((probability, index) => (
              <div key={index} style={{ width: `${probability * 100}%`, backgroundColor: CLASS_COLOURS[index] }} />
            ))}
          </div>
          <p className="mt-1 font-mono text-xs text-slate-700 dark:text-slate-200">
            total {softmax ? softmax.row_sums[person].toFixed(4) : "…"}, calls {softmax ? CLASS_NAMES[softmax.predictions[person]] : "…"}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">One-vs-rest, three models, three gauges</p>
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-left font-sans text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-1 pr-2">this class or not</th>
                <th className="py-1 pr-2">log-odds</th>
                <th className="py-1">σ → q</th>
              </tr>
            </thead>
            <tbody>
              {CLASS_NAMES.map((name, index) => (
                <tr key={name} style={{ color: CLASS_COLOURS[index] }}>
                  <td className="py-1 pr-2 font-sans">{name}</td>
                  <td className="py-1 pr-2">{restScores ? restScores[index].toFixed(4) : "…"}</td>
                  <td className="py-1 font-semibold">{restOutputs ? restOutputs[index].toFixed(4) : "…"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">no shared total</p>
          <div className="mt-2 space-y-1">
            {restOutputs?.map((output, index) => (
              <div key={index} className="h-3 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
                <div style={{ width: `${Math.max(0.5, Math.min(1, restScores ? sigmoid(restScores[index]) : output) * 100)}%`, backgroundColor: CLASS_COLOURS[index] }} className="h-full" />
              </div>
            ))}
          </div>
          <p className="mt-1 font-mono text-xs text-slate-700 dark:text-slate-200">
            total {oneVsRest ? oneVsRest.row_sums[person].toFixed(4) : "…"}, calls {oneVsRest ? CLASS_NAMES[oneVsRest.predictions[person]] : "…"}
          </p>
        </div>
      </div>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
