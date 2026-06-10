"use client";

// One picture through the small U, with or without its skip connections, at
// any of the three weight seeds.
//
// The picture, its true shape with the pixels on either side of the edge
// marked, the probability the network gives every pixel of being shape, and
// the answer coloured by where it went wrong. The first held-out picture of
// each of the four kinds is here, and four rings, the kind the network never
// saw while training. The API trains and scores; the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { fetchUReport, SEEDS, UReport } from "@/lib/concepts/u-net";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  Stat,
} from "@/components/widgets/filtersAndEdgesShared";
import {
  CellMap,
  Framed,
  Loading,
} from "@/components/widgets/convolutionalNetworksShared";
import { ErrorLegend, fixed, MaskMap } from "@/components/widgets/uNetShared";

export function UNetExplorer() {
  const [skip, setSkip] = useState(true);
  const [seed, setSeed] = useState(0);
  const [choice, setChoice] = useState(0);
  const [report, setReport] = useState<UReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    fetchUReport(skip, seed)
      .then((answer) => {
        if (current) {
          setReport(answer);
          setMessage(null);
        }
      })
      .catch((error) => {
        if (current)
          setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      });
    return () => {
      current = false;
    };
  }, [skip, seed]);

  const showing = report && report.skip === skip && report.seed === seed ? report : null;
  if (!showing) return <Loading message={message} />;

  const pictures = [...showing.examples, ...showing.ring_examples];
  const picture = pictures[choice];
  const size = picture.truth.length * picture.truth[0].length;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-slate-600 dark:text-slate-400">network:</span>
        <button className={skip ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS} onClick={() => setSkip(true)}>
          with the skip connections
        </button>
        <button className={!skip ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS} onClick={() => setSkip(false)}>
          without them
        </button>
        <span className="ml-3 mr-1 text-xs text-slate-600 dark:text-slate-400">weight seed:</span>
        {SEEDS.map((value) => (
          <button
            key={value}
            className={value === seed ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
            onClick={() => setSeed(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-slate-600 dark:text-slate-400">picture:</span>
        {pictures.map((entry, index) => (
          <button
            key={index}
            className={index === choice ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
            onClick={() => setChoice(index)}
          >
            {index < showing.examples.length ? entry.kind_words : `${entry.kind_words} ${index - showing.examples.length + 1}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Framed title="the picture" width="w-full">
          <CellMap rows={picture.picture} scale="brightness" largest={1} label="the picture" />
        </Framed>
        <Framed title="the true shape, edge pixels marked" width="w-full">
          <MaskMap truth={picture.truth} boundary={picture.boundary} mode="truth" label="the true shape" />
        </Framed>
        <Framed title="probability of shape, black 0 to yellow 1" width="w-full">
          <CellMap rows={picture.probability} scale="magnitude" largest={1} label="the probability of shape at each pixel" />
        </Framed>
        <Framed title="the answer, by where it went wrong" width="w-full">
          <MaskMap truth={picture.truth} called={picture.called} mode="errors" label="the answer against the truth" />
        </Framed>
      </div>
      <div className="mt-2">
        <ErrorLegend />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Stat label="pixels right" value={`${picture.pixels_right} of ${size}`} />
        <Stat label="overlap with the true shape" value={fixed(picture.overlap)} />
        <Stat label="edge pixels right" value={`${picture.boundary_right} of ${picture.n_boundary}`} />
        <Stat label="mean overlap, 240 held-out pictures" value={fixed(showing.held_out.mean_overlap)} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        A pixel is called shape where its probability is above one half. The overlap is the pixels called shape and truly shape, over the pixels that are either. The rings are a kind neither network was trained on.
      </p>
    </div>
  );
}
