import { foundationFreshCases } from "./journey-fresh/foundations";
import { modelFreshCases } from "./journey-fresh/models";
import { applicationFreshCases } from "./journey-fresh/applications";
import type { FreshJourneyCase } from "./journey-fresh";

export const freshJourneyCases: Record<string, FreshJourneyCase> = {
  ...foundationFreshCases, ...modelFreshCases, ...applicationFreshCases,
};

export function freshCaseFor(id: string): FreshJourneyCase {
  const fresh = freshJourneyCases[id];
  if (!fresh) throw new Error(`Write a fresh workshop case for ${id}.`);
  return fresh;
}
