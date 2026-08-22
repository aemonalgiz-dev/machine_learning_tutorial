"use client";

// Five measurements of the same sixty people, and how much they overlap.
//
// The table is the correlation between every pair of measurements, shaded
// by strength, and the row beneath it is the first component's loading on
// each. Five columns, all leaning the same way on one direction, is the
// picture of a dataset with more columns than major patterns. Every
// number is the API's.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { BodyMeasurements, fetchBodyMeasurements } from "@/lib/concepts/pca";

const LABELS: Record<string, string> = {
  height: "height",
  arm_span: "arm span",
  leg_length: "leg length",
  sitting_height: "sitting height",
  shoe_size: "shoe size",
};

export function MeasurementCorrelations() {
  const [body, setBody] = useState<BodyMeasurements | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setBody(await fetchBodyMeasurements());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!body) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const first = body.components[0];
  const second = body.components[1];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-slate-500 dark:text-slate-400">
            <th className="py-1 pr-2 text-left font-medium">correlation</th>
            {body.names.map((name) => (
              <th key={name} className="py-1 px-1 text-center font-medium">{LABELS[name]}</th>
            ))}
          </tr>
        </thead>
        <tbody className="font-mono">
          {body.names.map((rowName, rowIndex) => (
            <tr key={rowName} className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-1 pr-2 font-sans text-slate-600 dark:text-slate-300">{LABELS[rowName]}</td>
              {body.names.map((columnName, columnIndex) => {
                const value = body.correlation[rowIndex][columnIndex];
                return (
                  <td key={columnName} className="py-1 px-1 text-center" style={{ backgroundColor: `rgba(99, 102, 241, ${0.1 + 0.6 * Math.abs(value)})`, color: Math.abs(value) > 0.6 ? "white" : undefined }}>
                    {value.toFixed(2)}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="border-t-2 border-slate-300 dark:border-slate-700">
            <td className="py-1 pr-2 font-sans text-slate-600 dark:text-slate-300">loading on component 1</td>
            {body.names.map((name) => (
              <td key={name} className="py-1 px-1 text-center font-semibold">{first.loadings[name].toFixed(2)}</td>
            ))}
          </tr>
          <tr className="border-t border-slate-200 dark:border-slate-800">
            <td className="py-1 pr-2 font-sans text-slate-600 dark:text-slate-300">loading on component 2</td>
            {body.names.map((name) => (
              <td key={name} className="py-1 px-1 text-center">{second.loadings[name].toFixed(2)}</td>
            ))}
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {body.rows.length} people. The first component carries {(first.share * 100).toFixed(1)} percent of the standardised variance and leans on every measurement with the same sign; the second carries {(second.share * 100).toFixed(1)} percent and sets sitting height against shoe size and leg length, which is the shape of a body rather than its size.
      </p>
    </div>
  );
}
