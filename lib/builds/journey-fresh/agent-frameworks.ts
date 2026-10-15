import type { FreshJourneyCase } from "../journey-fresh";

export const agentFrameworkFreshCases: Record<string, FreshJourneyCase> = {
  "agent-pydantic-ai": {
    name: "One valid citation hides another invented reference",
    prompt: "Botie cites manual-2 and manual-9, but this request supplied only manual-2 and manual-4. Predict the route. Is one available citation enough for the whole list to pass?",
    data: { candidate: { answer: "Inspect the coupling and mounting.", citations: ["manual-2", "manual-9"] }, available: ["manual-2", "manual-4"] }, expected: "repair answer",
    why: "Every citation in this contract must belong to the supplied evidence. Passing one member does not excuse an absent reference elsewhere in the list.",
  },
  "agent-langchain": {
    name: "A permitted lookup with no execution slots",
    prompt: "The service intentionally sets the call budget to zero while its catalogue is being rebuilt. read_manual remains in the allowlist. Predict the next route with no calls executed yet.",
    data: { name: "read_manual", allowed: ["read_manual"], used: 0, limit: 0 }, expected: "budget exhausted",
    why: "Permission to use an operation and permission to consume more runtime work are separate conditions. A zero budget has no initial free call.",
  },
  "agent-langgraph": {
    name: "Replayed updates arrive in a different order",
    prompt: "The saved request has M2 then M5. Incoming records update M5 first and M2 second. Predict the resulting evidence list while preserving the position where each ID first appeared.",
    data: { checkpoints: { R21: [{ id: "M2", text: "Old coupling check." }, { id: "M5", text: "Old alignment check." }] }, thread: "R21", incoming: [{ id: "M5", text: "Revised alignment check." }, { id: "M2", text: "Revised coupling check." }] },
    expected: [{ id: "M2", text: "Revised coupling check." }, { id: "M5", text: "Revised alignment check." }],
    why: "Update arrival order decides the latest text for an ID, but this reducer preserves first-seen positions. Replacing the whole list would change that ordering policy.",
  },
  "agent-human-approval": {
    name: "The reviewer’s authority changed while Botie waited",
    prompt: "The action exactly matches its unexpired approval, but the reviewer is no longer permitted to approve inspections. Predict the route before trying this fresh shift.",
    data: { proposal: { requestId: "R21", asset: "P4", operation: "inspect", revision: "2" }, approval: { requestId: "R21", asset: "P4", operation: "inspect", revision: "2", approved: true }, now: 70, expires: 90, permitted: false }, expected: "request review",
    why: "The stored yes does not override the current authority check. Matching the payload and timestamp alone is insufficient for this policy.",
  },
  "agent-mcp": {
    name: "Two permitted servers still have different handlers",
    prompt: "Both endpoints are now allowed, but the request explicitly selects archive/read_manual. Predict the handler label. Permission to call either server does not make their records interchangeable.",
    data: { request: { server: "archive", tool: "read_manual" }, allowed: ["maintenance/read_manual", "archive/read_manual"], registry: { "maintenance/read_manual": "Current manual excerpts", "archive/read_manual": "Archived manual revisions" } }, expected: "Archived manual revisions",
    why: "The selected connection remains part of dispatch after the allowlist passes. A resolver that always takes the first allowed read_manual would fetch the wrong source.",
  },
};
