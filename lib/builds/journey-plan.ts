/** Lesson-authored teaching decisions. Controls can be shared; the problem cannot. */
export interface JourneyPlan {
  premise: string;
  /** Opening on a comparison is useful when the learner first needs to notice a problem. */
  order: "build-first" | "investigate-first";
  construction: { title: string; start: string; outcome: string; hints?: string[] };
  /** An intentional subtree of the recipe, never selected by operation count. */
  preparation?: { path: number[]; title: string; challenge: string; why: string; hints?: string[] };
  investigation: {
    title: string;
    caseIndex: number;
    kind: "predict" | "compare" | "diagnose" | "decide";
    question: string;
    /** Used for a scalar, array, matrix or text prediction. */
    predictionLabel?: string;
    /** Interpretation and design decisions, grounded in the visible inputs. */
    options?: { label: string; feedback: string; correct?: boolean }[];
    outcome: string;
  };
  /** Specific earlier capabilities, not merely the previous URL in the catalogue. */
  connections: { lessonId: string; skill: string; why: string }[];
  reflection: { prompt: string; carryForward: string };
}
