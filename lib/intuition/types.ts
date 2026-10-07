export type Point = [number, number, number?];
export type Strip = { label: string; items: string[]; active?: number[] };
export type Scene =
  | { kind: "strips"; caption: string; rows: Strip[]; connected?: boolean }
  | { kind: "plot"; caption: string; points: Point[]; xLabel: string; yLabel: string; paths?: number[][][]; guides?: number[][]; labels?: string[]; bounds?: [number, number, number, number]; equalScale?: boolean }
  | { kind: "tiles"; caption: string; panels: { label: string; cells: number[][]; selected?: number[] }[] }
  | { kind: "bars"; caption: string; items: { label: string; value: number; display?: string }[] };

export interface IntuitionStep {
  title: string;
  explanation: string;
  scene: Scene;
  alternative?: { label: string; explanation: string; scene: Scene };
}

export interface LessonIntuition {
  opening: string[];
  steps: IntuitionStep[];
  connectionTitle: string;
  connection: string[];
}

export const strips = (caption: string, rows: [string, string[], number[]?][], connected = false): Scene => ({
  kind: "strips", caption, connected, rows: rows.map(([label, items, active]) => ({ label, items, ...(active ? { active } : {}) })),
});
export const plot = (caption: string, points: Point[], xLabel: string, yLabel: string, options: Partial<Extract<Scene, { kind: "plot" }>> = {}): Scene => ({ kind: "plot", caption, points, xLabel, yLabel, ...options });
export const tiles = (caption: string, panels: [string, number[][], number[]?][]): Scene => ({ kind: "tiles", caption, panels: panels.map(([label, cells, selected]) => ({ label, cells, ...(selected ? { selected } : {}) })) });
export const bars = (caption: string, items: [string, number, string?][]): Scene => ({ kind: "bars", caption, items: items.map(([label, value, display]) => ({ label, value, ...(display ? { display } : {}) })) });
export const step = (title: string, explanation: string, scene: Scene, alternative?: IntuitionStep["alternative"]): IntuitionStep => ({ title, explanation, scene, ...(alternative ? { alternative } : {}) });
// Plots within a walkthrough show the same quantities. Reserve space for every
// step, including alternatives, so changing a rule does not move fixed data.
// A lesson using different quantities can supply explicit bounds per scene.
export const story = (opening: string[], steps: IntuitionStep[], connectionTitle: string, connection: string[]): LessonIntuition => {
  const plots = steps.flatMap(item => [item.scene, ...(item.alternative ? [item.alternative.scene] : [])])
    .filter((scene): scene is Extract<Scene, { kind: "plot" }> => scene.kind === "plot");
  const points = plots.flatMap(scene => [
    ...scene.points,
    ...(scene.paths ?? []).flat(),
    ...(scene.guides ?? []).flatMap(line => [[line[0], line[1]], [line[2], line[3]]]),
  ]);
  if (!points.length) return { opening, steps, connectionTitle, connection };
  const xs = points.map(point => point[0]), ys = points.map(point => point[1]);
  const bounds: [number, number, number, number] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const prepare = (scene: Scene): Scene => scene.kind === "plot" ? { ...scene, bounds: scene.bounds ?? bounds } : scene;
  return {
    opening, connectionTitle, connection,
    steps: steps.map(item => ({
      ...item, scene: prepare(item.scene),
      ...(item.alternative ? { alternative: { ...item.alternative, scene: prepare(item.alternative.scene) } } : {}),
    })),
  };
};
