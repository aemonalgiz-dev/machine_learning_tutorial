import { foundationFreshCases } from "./journey-fresh/foundations";
import { modelFreshCases } from "./journey-fresh/models";
import { applicationFreshCases } from "./journey-fresh/applications";
import { agentFoundationFreshCases } from "./journey-fresh/agent-foundations";
import { agentFrameworkFreshCases } from "./journey-fresh/agent-frameworks";
import { agentObservabilityFreshCases } from "./journey-fresh/agent-observability";
import { agentGuardrailFreshCases } from "./journey-fresh/agent-guardrails";
import { agentReliabilityFreshCases } from "./journey-fresh/agent-reliability";
import { agentAssuranceFreshCases } from "./journey-fresh/agent-assurance";
import { agentIterationFreshCases } from "./journey-fresh/agent-iteration";
import { modelEvaluationFreshCases } from "./journey-fresh/model-evaluation";
import { sqlFoundationFreshCases } from "./journey-fresh/sql-foundations";
import { sqlAnalysisFreshCases } from "./journey-fresh/sql-analysis";
import { sqlSystemFreshCases } from "./journey-fresh/sql-systems";
import { NOSQL_FOUNDATION_FRESH } from "./journey-fresh/nosql-foundations";
import { NOSQL_SYSTEM_FRESH } from "./journey-fresh/nosql-systems";
import { GRAPH_DATABASE_FRESH } from "./journey-fresh/graph-databases";
import type { FreshJourneyCase } from "./journey-fresh";

export const freshJourneyCases: Record<string, FreshJourneyCase> = {
  ...foundationFreshCases, ...modelFreshCases, ...applicationFreshCases,
  ...agentFoundationFreshCases, ...agentFrameworkFreshCases, ...agentObservabilityFreshCases,
  ...agentGuardrailFreshCases, ...agentReliabilityFreshCases, ...agentAssuranceFreshCases,
  ...agentIterationFreshCases,
  ...modelEvaluationFreshCases,
  ...sqlFoundationFreshCases, ...sqlAnalysisFreshCases, ...sqlSystemFreshCases,
  ...NOSQL_FOUNDATION_FRESH, ...NOSQL_SYSTEM_FRESH, ...GRAPH_DATABASE_FRESH,
};

export function freshCaseFor(id: string): FreshJourneyCase {
  const fresh = freshJourneyCases[id];
  if (!fresh) throw new Error(`Write a fresh workshop case for ${id}.`);
  return fresh;
}
