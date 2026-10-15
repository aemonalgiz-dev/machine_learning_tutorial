import { foundationFreshCases } from "./journey-fresh/foundations";
import { modelFreshCases } from "./journey-fresh/models";
import { applicationFreshCases } from "./journey-fresh/applications";
import { agentFoundationFreshCases } from "./journey-fresh/agent-foundations";
import { agentFrameworkFreshCases } from "./journey-fresh/agent-frameworks";
import { agentObservabilityFreshCases } from "./journey-fresh/agent-observability";
import type { FreshJourneyCase } from "./journey-fresh";

export const freshJourneyCases: Record<string, FreshJourneyCase> = {
  ...foundationFreshCases, ...modelFreshCases, ...applicationFreshCases,
  ...agentFoundationFreshCases, ...agentFrameworkFreshCases, ...agentObservabilityFreshCases,
};

export function freshCaseFor(id: string): FreshJourneyCase {
  const fresh = freshJourneyCases[id];
  if (!fresh) throw new Error(`Write a fresh workshop case for ${id}.`);
  return fresh;
}
