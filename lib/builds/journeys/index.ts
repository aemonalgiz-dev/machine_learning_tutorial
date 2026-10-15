import { foundationJourneys } from "./foundations";
import { modelJourneys } from "./models";
import { applicationJourneys } from "./applications";
import type { JourneyPlan } from "../journey-plan";

/** Missing authorship is a build error, not a request to manufacture a template. */
export const journeyPlans: Record<string, JourneyPlan> = {
  ...foundationJourneys, ...modelJourneys, ...applicationJourneys,
};

export function planFor(id: string): JourneyPlan {
  const plan = journeyPlans[id];
  if (!plan) throw new Error(`Write a workshop journey for ${id}.`);
  return plan;
}
