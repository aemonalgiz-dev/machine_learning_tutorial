import type { FreshJourneyCase } from "../journey-fresh";

export const agentReliabilityFreshCases: Record<string, FreshJourneyCase> = {
  "agent-or-workflow": {
    name: "A slower multi-agent candidate passes the same tasks",
    prompt: "Workflow and agent both fail a required task. The multi-agent candidate passes, but one request takes longer than the declared latency limit. Predict the selection before running the existing construction.",
    data: { trials: [{ name: "workflow", rank: 1, passed: [true, false], latency_ms: [300, 500], cost_units: [2, 2] }, { name: "agent", rank: 2, passed: [true, false], latency_ms: [900, 1000], cost_units: [4, 5] }, { name: "multi-agent", rank: 3, passed: [true, true], latency_ms: [1200, 2400], cost_units: [7, 8] }], policy: { min_passes: 2, max_latency_ms: 2000, max_cost_units: 20 } },
    expected: "review requirements",
    why: "Completing the task checks does not remove the stated operating requirement. No candidate satisfies both in this fixture, so the program retains the review outcome instead of silently accepting a slower system.",
  },
  "agent-retries-and-effects": {
    name: "The receiver is still processing the approved operation",
    prompt: "The receipt for R12-inspect-1 has the correct payload and is pending. The retry window still has room. Predict which action respects work already in flight.",
    data: { command: { key: "R12-inspect-1", payload: { asset: "P12", operation: "inspect" }, effect: "write", idempotent: true }, receipts: [{ key: "R12-inspect-1", payload: { asset: "P12", operation: "inspect" }, status: "pending" }], outcome: "unknown", schedule: { base_ms: 300, cap_ms: 1200, jitter_fraction: 0.25, timeout_ms: 400, max_attempts: 4 }, state: { attempts: 2, now_ms: 500, deadline_ms: 2000 } },
    expected: { route: "query operation status", delay_ms: 0, result: null },
    why: "The pending receipt identifies processing already under way. Query its status within a bounded policy instead of treating remaining retry capacity as a reason to create another operation.",
  },
  "agent-resource-budgets": {
    name: "An affordable call cannot finish inside the remaining deadline",
    prompt: "The ledger has room for the proposed history lookup, and the dependency circuit is closed. Its timeout extends past the run deadline. Predict the refusal reason and the unchanged remainder.",
    data: { proposals: [{ id: "history-lookup", input_tokens: 100, timeout_ms: 401, reserve: { tokens: 200, cost_units: 4, model_requests: 0, tool_calls: 1 } }], limits: { tokens: 1000, cost_units: 20, model_requests: 5, tool_calls: 5 }, used: { tokens: 100, cost_units: 2, model_requests: 1, tool_calls: 0 }, reserved: { tokens: 200, cost_units: 4, model_requests: 1, tool_calls: 1 }, control: { cancelled: false, circuit: "closed", probe_granted: false }, clock: { now_ms: 1600, deadline_ms: 2000, max_input_tokens: 300 } },
    expected: { accepted: [], rejected: [{ id: "history-lookup", reason: "deadline" }], remaining: { tokens: 700, cost_units: 14, model_requests: 3, tool_calls: 4 } },
    why: "Affordability does not extend the run deadline. Refusing before dispatch leaves the proposed call’s resources available rather than charging work that never began.",
  },
};
