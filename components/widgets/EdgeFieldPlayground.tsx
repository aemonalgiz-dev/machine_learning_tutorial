"use client";

// One operator swept across the workbench scene, drawn four ways at once.
//
// Choose the picture, the weights and what is read outside the frame, and the
// API sweeps the picture twice and answers the rate of change across, the rate
// down, the length those two make and the angle they point at. The browser
// turns each of those into a colour, and the fourth panel draws a short stroke
// per pixel instead, because an angle wraps round and a colour ramp does not.
// Every number under the panels is the API's.

import { useEffect, useState } from "react";
import {
  EdgeRuleName,
  GradientMaps,
  OperatorName,
  SceneName,
  messageFor,
  sweepField,
} from "@/lib/concepts/filters-and-edges";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  Failure,
  MapPanel,
  PANEL_CLASS,
  PixelMap,
  Stat,
  largestOf,
  smallestOf,
} from "./filtersAndEdgesShared";

const SCENES: { name: SceneName; label: string }[] = [
  { name: "workbench", label: "the scene" },
  { name: "without_ramp", label: "without the ramp" },
  { name: "relit", label: "under a brighter lamp" },
];

const OPERATORS: { name: OperatorName; label: string }[] = [
  { name: "central_difference", label: "Central difference" },
  { name: "prewitt", label: "Prewitt" },
  { name: "sobel", label: "Sobel" },
  { name: "scharr", label: "Scharr" },
];

const EDGE_RULES: { name: EdgeRuleName; label: string }[] = [
  { name: "extend", label: "Repeat the edge" },
  { name: "pad_with_zero", label: "Outside is black" },
  { name: "wrap", label: "Read the far side" },
  { name: "keep_valid", label: "Answer where it fits" },
];

export function EdgeFieldPlayground() {
  const [scene, setScene] = useState<SceneName>("workbench");
  const [operator, setOperator] = useState<OperatorName>("sobel");
  const [edgeRule, setEdgeRule] = useState<EdgeRuleName>("extend");
  const [maps, setMaps] = useState<GradientMaps | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const answer = await sweepField({ scene, operator, edge_rule: edgeRule });
        if (!live) return;
        setMaps(answer);
        setMessage(null);
      } catch (error) {
        if (live) setMessage(messageFor(error));
      }
    })();
    return () => {
      live = false;
    };
  }, [scene, operator, edgeRule]);

  const rate = maps?.largest_rate ?? 1;
  const sharp = maps?.largest_magnitude ?? 1;

  return (
    <div className={PANEL_CLASS}>
      <div className="flex flex-wrap items-center gap-4 pb-3 text-xs text-slate-600 dark:text-slate-300">
        <span className="flex flex-wrap items-center gap-1">
          picture
          {SCENES.map((choice) => (
            <button
              key={choice.name}
              onClick={() => setScene(choice.name)}
              className={
                scene === choice.name ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS
              }
            >
              {choice.label}
            </button>
          ))}
        </span>
        <span className="flex flex-wrap items-center gap-1">
          weights
          {OPERATORS.map((choice) => (
            <button
              key={choice.name}
              onClick={() => setOperator(choice.name)}
              className={
                operator === choice.name ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS
              }
            >
              {choice.label}
            </button>
          ))}
        </span>
        <span className="flex flex-wrap items-center gap-1">
          outside the frame
          {EDGE_RULES.map((choice) => (
            <button
              key={choice.name}
              onClick={() => setEdgeRule(choice.name)}
              className={
                edgeRule === choice.name ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS
              }
            >
              {choice.label}
            </button>
          ))}
        </span>
      </div>

      {maps ? (
        <div className="flex flex-wrap justify-center gap-4">
          <MapPanel
            title="brightness"
            scale="brightness"
            low={smallestOf(maps.picture).toFixed(2)}
            high={largestOf(maps.picture).toFixed(2)}
          >
            <PixelMap
              rows={maps.picture}
              scale="brightness"
              largest={largestOf(maps.picture)}
              darkest={smallestOf(maps.picture)}
            />
          </MapPanel>
          <MapPanel
            title="rate of change across"
            scale="signed"
            low={(-rate).toFixed(2)}
            high={rate.toFixed(2)}
          >
            <PixelMap rows={maps.horizontal} scale="signed" largest={rate} />
          </MapPanel>
          <MapPanel
            title="rate of change down"
            scale="signed"
            low={(-rate).toFixed(2)}
            high={rate.toFixed(2)}
          >
            <PixelMap rows={maps.vertical} scale="signed" largest={rate} />
          </MapPanel>
          <MapPanel
            title="how sharp the change is"
            scale="magnitude"
            low="0"
            high={sharp.toFixed(2)}
          >
            <PixelMap rows={maps.magnitude} scale="magnitude" largest={sharp} />
          </MapPanel>
          <MapPanel
            title="which way it rises"
            scale="magnitude"
            low="0"
            high={sharp.toFixed(2)}
            note="a stroke along the gradient, drawn only where the change is sharp enough for an angle to mean anything"
          >
            <PixelMap
              rows={maps.magnitude}
              scale="magnitude"
              largest={sharp}
              strokes={maps.direction}
              strokeAt={maps.magnitude}
            />
          </MapPanel>
        </div>
      ) : (
        <p className="py-12 text-center text-slate-400">…</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Picture"
          value={maps ? `${maps.height} by ${maps.width}` : "…"}
        />
        <Stat
          label="Answer"
          value={maps ? `${maps.answer_height} by ${maps.answer_width}` : "…"}
        />
        <Stat
          label="Sharpest change"
          value={maps ? maps.largest_magnitude.toFixed(4) : "…"}
        />
        <Stat
          label="Largest single rate"
          value={maps ? maps.largest_rate.toFixed(4) : "…"}
        />
      </div>

      <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-500">
        {maps
          ? `${maps.operator_label} over ${maps.scene_label}. Where the weights hang off, the rule is to ${maps.edge_rule_label.toLowerCase()}. ` +
            (maps.answer_height === maps.height
              ? "Every pixel gets an answer."
              : `The answer is ${maps.height - maps.answer_height} rows and ${maps.width - maps.answer_width} columns smaller than the picture.`)
          : "…"}
      </p>

      <Failure message={message} />
    </div>
  );
}
