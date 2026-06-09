"use client";

// A weight-normalised layer against the dense layer holding the same weights.
//
// Three neurons reading five of the crowd, in standard units, through a
// hyperbolic tangent. The weight-normalised layer stores a direction and a
// length per neuron and rebuilds the weight vector from the two; the dense
// layer stores the weight vectors it produces. The readouts are how far their
// answers differ, which is zero, how far the library's gradient in the new
// coordinates is from a finite difference, how far the form that forgets
// the projection is from it, the radial component each form leaves along
// the direction, and where one step at the same stride lands each layer's
// effective weights. Every number is the library's through the API.

import { useEffect, useState } from "react";
import {
  CrowdExperiment,
  failureMessage,
  fetchCrowdExperiment,
} from "@/lib/concepts/normalisation-layers";
import { formatMagnitude, formatSigned } from "./normalisationLayersFixtures";

export function ReparameterisationCheck() {
  const [experiment, setExperiment] = useState<CrowdExperiment | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setExperiment(await fetchCrowdExperiment());
      } catch (error) {
        setMessage(failureMessage(error));
      }
    })();
  }, []);

  if (!experiment) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "… the first visit trains a hundred and thirty small networks, which takes ten to twenty seconds"}
      </p>
    );
  }

  const check = experiment.reparameterisation;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">neuron</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">stored direction</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">length</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">direction slope</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">length slope</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">length after one step</th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">dense length after</th>
            </tr>
          </thead>
          <tbody>
            {check.directions.map((direction, neuron) => (
              <tr key={neuron} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-1.5 pr-4 text-slate-500 dark:text-slate-400">{neuron + 1}</td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">({direction.map((value) => formatSigned(value, 1)).join(", ")})</td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{check.magnitudes[neuron]}</td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">({check.direction_slopes[neuron].map((value) => formatSigned(value, 4)).join(", ")})</td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{formatSigned(check.magnitude_slopes[neuron], 4)}</td>
                <td className="py-1.5 pr-4 font-mono text-indigo-700 dark:text-indigo-300">{check.lengths_after[neuron].toFixed(4)}</td>
                <td className="py-1.5 font-mono text-slate-800 dark:text-slate-200">{check.dense_lengths_after[neuron].toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="answers, weight-normalised to dense" value={formatMagnitude(check.output_gap)} />
        <Stat label="direction slope to finite difference" value={formatMagnitude(check.direction_gap)} />
        <Stat label="unprojected form to finite difference" value={check.unprojected_gap.toFixed(4)} />
        <Stat label="largest true direction slope" value={check.largest_direction_slope.toFixed(4)} />
        <Stat label="radial component, library" value={formatMagnitude(check.radial_component)} />
        <Stat label="radial component, unprojected" value={check.unprojected_radial_component.toFixed(4)} />
        <Stat label="length slope to finite difference" value={formatMagnitude(check.magnitude_gap)} />
        <Stat label={`destinations after one step at ${check.rate}`} value={check.destination_gap.toFixed(4)} />
      </div>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
