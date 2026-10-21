import type { FreshJourneyCase } from "../journey-fresh";

export const agentGuardrailFreshCases: Record<string, FreshJourneyCase> = {
  "agent-prompt-injection": {
    name: "A permitted read is flagged by the screen",
    prompt: "The application grants read_manual and Botie requests it. This time the required screen flags the request. Predict the route under the lesson’s policy, keeping permission separate from the screen’s judgement.",
    data: { proposal: { tool: "read_manual", reason: "Find the coupling inspection note." }, grants: ["read_manual"], screen: { status: "flag" } }, expected: "hold for review",
    why: "The granted tool is not denied for lack of permission, but the required screen has not passed. This is the policy’s hold route, not proof that the request is malicious.",
  },
  "agent-authorization": {
    name: "The asset is in the right tenant but outside the assignment",
    prompt: "The caller belongs to north and can read P2 and P4. The stored P9 also belongs to north. Predict whether this read is allowed without widening the caller’s assignment.",
    data: { principal: { tenant: "north", assets: ["P2", "P4"], operations: ["read"] }, asset: { tenant: "north", id: "P9" }, operation: "read" }, expected: "deny",
    why: "Tenant and operation checks pass, but the asset grant does not. A tenant-only rule would accidentally allow every object in that organisation.",
  },
  "agent-data-boundaries": {
    name: "A new field has no release classification",
    prompt: "The lookup selects asset and siteCode. Both fields exist, and manual-index is approved, but only asset has a release label. Predict the payload and route without assuming the new field is approved.",
    data: { record: { asset: "P4", siteCode: "NORTH-2", contact: "Private contact" }, needed: ["asset", "siteCode"], labels: { asset: "approved" }, destination: "manual-index", allowed: ["manual-index"] }, expected: { route: "withhold", payload: {} },
    why: "An unclassified selected field does not inherit permission from a neighbouring field or an approved destination. The entire proposed release is withheld by this policy.",
  },
  "agent-output-guardrails": {
    name: "Matching IDs still carry literal markup",
    prompt: "The P4 draft cites M4, which belongs to P4. Predict its display result when the note includes quotation marks, angle brackets and an ampersand. Keep those characters as text for the stated HTML context.",
    data: { candidate: { asset: "P4", citation: "M4", text: 'Read <note title="P4"> & verify.' }, requested: "P4", evidence: { M4: "P4" } }, expected: { route: "draft for review", htmlText: "Read &lt;note title=&quot;P4&quot;&gt; &amp; verify." },
    why: "The identifiers pass, so the draft remains available for review. Context-specific encoding prevents this note’s characters from becoming HTML markup; it does not establish the advice’s truth.",
  },
};
