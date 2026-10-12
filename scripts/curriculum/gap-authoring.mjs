import { choice, truth, view } from "./authoring.mjs";

export const question = (data, prompt, options, answer, because) => ({
  ...choice(prompt, options, answer, because), given: { description: "Use the information below.", data },
});
export const claim = (data, prompt, answer, because) => ({
  ...truth(prompt, answer, because), given: { description: "Consider this example.", data },
});
export const picture = (title, explanation, panels) => view(title, explanation, [], {
  kind: "tiles", caption: "Invented pixel values. Row and column addresses start at zero; the numbers show the stored values.", showValues: true,
  panels: panels.map(([label, cells]) => {
    const largest = Math.max(...cells.flat());
    return { label, cells, ...(largest <= 1 ? { maximum: 1 } : largest > 3 ? { maximum: 255 } : {}) };
  }),
});
export const points = (title, explanation, coordinates, labels, paths = []) => view(title, explanation, [], {
  kind: "plot", caption: "Invented observations. Distances use the displayed coordinates.",
  points: coordinates, labels, paths, xLabel: "Horizontal position", yLabel: "Vertical position", equalScale: true,
});
