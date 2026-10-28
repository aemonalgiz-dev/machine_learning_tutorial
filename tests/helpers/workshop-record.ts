import type { Construction } from "../../lib/builds/engine";

/** A complete saved account draft, rather than an obsolete browser-only graph. */
export function workshopRecord(graph: Construction, zoom = 1) {
  return {
    graph, attemptId: "fixture-workshop", undo: [], redo: [], caseIndex: 0,
    results: {}, tested: {}, customData: null, prediction: "", hintsShown: 0,
    example: false, animate: false, zoom,
  };
}
