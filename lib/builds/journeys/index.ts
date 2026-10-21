import { foundationJourneys } from "./foundations";
import { modelJourneys } from "./models";
import { applicationJourneys } from "./applications";
import { agentFoundationJourneys } from "./agent-foundations";
import { agentFrameworkJourneys } from "./agent-frameworks";
import { agentObservabilityJourneys } from "./agent-observability";
import { agentGuardrailJourneys } from "./agent-guardrails";
import { agentReliabilityJourneys } from "./agent-reliability";
import { agentAssuranceJourneys } from "./agent-assurance";
import { agentIterationJourneys } from "./agent-iteration";
import { modelEvaluationJourneys } from "./model-evaluation";
import { agentSafetyJourneys } from "./agent-safety";
import { sqlFoundationJourneys } from "./sql-foundations";
import { sqlAnalysisJourneys } from "./sql-analysis";
import { sqlSystemJourneys } from "./sql-systems";
import { NOSQL_FOUNDATION_JOURNEYS } from "./nosql-foundations";
import { NOSQL_SYSTEM_JOURNEYS } from "./nosql-systems";
import { GRAPH_DATABASE_JOURNEYS } from "./graph-databases";
import type { JourneyPlan } from "../journey-plan";

/** Missing authorship is a build error, not a request to manufacture a template. */
export const journeyPlans: Record<string, JourneyPlan> = {
  ...foundationJourneys, ...modelJourneys, ...applicationJourneys,
  ...agentFoundationJourneys, ...agentFrameworkJourneys, ...agentObservabilityJourneys,
  ...agentGuardrailJourneys, ...agentReliabilityJourneys, ...agentAssuranceJourneys,
  ...agentIterationJourneys,
  ...modelEvaluationJourneys,
  ...agentSafetyJourneys,
  ...sqlFoundationJourneys, ...sqlAnalysisJourneys, ...sqlSystemJourneys,
  ...NOSQL_FOUNDATION_JOURNEYS, ...NOSQL_SYSTEM_JOURNEYS, ...GRAPH_DATABASE_JOURNEYS,
};

export function planFor(id: string): JourneyPlan {
  const plan = journeyPlans[id];
  if (!plan) throw new Error(`Write a workshop journey for ${id}.`);
  return plan;
}
