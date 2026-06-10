"use client";

// The trained U, with its skip connections at seed 0, reading a picture twice
// the size it was trained on.
//
// Four held-out pictures laid out two by two make one picture of 32 by 32,
// and the same weights are rebuilt to read it. The picture, its true shapes,
// and the probability of shape the network gives every pixel. The API
// rebuilds and scores; the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { fetchLarger, LargerResponse } from "@/lib/concepts/u-net";
import { Stat } from "@/components/widgets/filtersAndEdgesShared";
import {
  CellMap,
  Framed,
  Loading,
} from "@/components/widgets/convolutionalNetworksShared";
import { fixed, MaskMap } from "@/components/widgets/uNetShared";

export function UNetLargerPicture() {
  const [larger, setLarger] = useState<LargerResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchLarger()
      .then(setLarger)
      .catch((error) =>
        setMessage(error instanceof ApiError ? error.message : "Something went wrong."),
      );
  }, []);

  if (!larger) return <Loading message={message} />;

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        <Framed title={`the picture, ${larger.side} by ${larger.side}`} width="w-full">
          <CellMap rows={larger.picture} scale="brightness" largest={1} label="four pictures laid out as one" />
        </Framed>
        <Framed title="the true shapes" width="w-full">
          <MaskMap truth={larger.truth} mode="truth" label="the true shapes" />
        </Framed>
        <Framed title="probability of shape" width="w-full">
          <CellMap rows={larger.probability} scale="magnitude" largest={1} label="the probability of shape at each pixel" />
        </Framed>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Stat label="overlap on the larger picture" value={fixed(larger.scores.mean_overlap)} />
        <Stat label="pixels right" value={`${Math.round(larger.scores.pixel_accuracy * larger.side * larger.side)} of ${larger.side * larger.side}`} />
        <Stat label="calls that differ from the four read apart" value={String(larger.changed_pixels)} />
        <Stat label={`blank picture at ${larger.blank_brightness}, pixels called shape`} value={String(larger.blank_called_with_skip)} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Nothing was retrained. Every layer in the U reads its input window by window, so the same weights serve a picture of any side the two poolings halve evenly.
      </p>
    </div>
  );
}
