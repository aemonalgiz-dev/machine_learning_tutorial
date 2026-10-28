import type { Data, Tool } from "./engine";

function record(value: Data, label: string): Record<string, Data> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw Error(`${label} needs a record with named fields.`);
  return value;
}
function strings(value: Data, label: string): string[] {
  if (!Array.isArray(value) || value.some(item => typeof item !== "string")) throw Error(`${label} needs a list of text values.`);
  return value as string[];
}
function count(value: Data, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) throw Error(`${label} must be a nonnegative whole number.`);
  return value;
}
const actionFields = ["requestId", "asset", "operation", "revision"];

export const agentFrameworkTools: Record<string, Tool> = {
  afAnswerShape: {
    title: "Check the answer fields", why: "The display needs answer text and a list of citation IDs before it can inspect the evidence.", inputs: ["Proposed answer record"],
    run: ([candidate]) => {
      const r = record(candidate, "Proposed answer");
      const valid = typeof r.answer === "string" && r.answer.trim().length > 0 && Array.isArray(r.citations) && r.citations.every(v => typeof v === "string") && Object.keys(r).every(k => ["answer", "citations"].includes(k));
      return { valid, citations: valid ? r.citations : [] };
    },
  },
  afEvidenceGate: {
    title: "Check citation membership", why: "Every claimed citation must come from the manual excerpts supplied to this run. Membership alone does not prove that the excerpt supports the answer.", inputs: ["Answer field check", "Available excerpt IDs"],
    run: ([checked, evidence]) => {
      const r = record(checked, "Answer field check"), ids = strings(evidence, "Available excerpts");
      const cited = strings(r.citations, "Citations");
      return r.valid === true && cited.length > 0 && cited.every(id => ids.includes(id)) ? "accept for content review" : "repair answer";
    },
  },
  afToolPolicy: {
    title: "Check the tool permission", why: "A model's requested tool name is compared with the application's allowed names before any handler runs.", inputs: ["Requested tool name", "Allowed tool names"],
    run: ([name, allowed]) => {
      if (typeof name !== "string") throw Error("The requested tool needs a name.");
      return { name, allowed: strings(allowed, "Allowed tools").includes(name) };
    },
  },
  afBudgetRoute: {
    title: "Apply the call budget", why: "A permitted call still needs room in the execution budget. Denied requests remain denied even when budget remains.", inputs: ["Tool permission check", "Calls already executed", "Maximum executed calls"],
    run: ([policy, used, limit]) => {
      const r = record(policy, "Tool permission check"), n = count(used, "Executed calls"), maximum = count(limit, "Call limit");
      if (typeof r.name !== "string" || typeof r.allowed !== "boolean") throw Error("Connect the tool permission check here.");
      return !r.allowed ? "denied" : n >= maximum ? "budget exhausted" : `execute ${r.name}`;
    },
  },
  afLoadThread: {
    title: "Load this thread's evidence", why: "Read the evidence previously saved for this maintenance request, identified by its thread ID. That saved state is the checkpoint. Another thread’s evidence must stay separate.", inputs: ["Checkpoint records by thread", "Thread ID"],
    run: ([checkpoints, thread]) => {
      const r = record(checkpoints, "Checkpoints");
      if (typeof thread !== "string" || !thread) throw Error("Supply a nonempty thread ID.");
      const found = Object.hasOwn(r, thread) ? r[thread] : [];
      if (!Array.isArray(found)) throw Error("A thread checkpoint contains a list of evidence records.");
      return found;
    },
  },
  afMergeEvidence: {
    title: "Merge evidence by ID", why: "New IDs are appended. An existing ID receives its newer text in the same position, so replaying an update does not duplicate it.", inputs: ["Existing evidence", "Incoming evidence updates"],
    run: ([old, incoming]) => {
      if (!Array.isArray(old) || !Array.isArray(incoming)) throw Error("Both evidence inputs need lists of records.");
      const result: Data[] = [], positions = new Map<string, number>();
      for (const item of [...old, ...incoming]) {
        const r = record(item, "Evidence");
        if (typeof r.id !== "string" || !r.id || typeof r.text !== "string") throw Error("Every excerpt needs a nonempty id and text.");
        const copy = { id: r.id, text: r.text };
        const position = positions.get(r.id);
        if (position === undefined) { positions.set(r.id, result.length); result.push(copy); }
        else result[position] = copy;
      }
      return result;
    },
  },
  afBoundApproval: {
    title: "Match approval to the proposal", why: "Approval belongs to this request, asset, operation and revision. Changing any field needs a new decision.", inputs: ["Current inspection proposal", "Recorded approval"],
    run: ([proposal, approval]) => {
      const p = record(proposal, "Proposal"), a = record(approval, "Approval");
      return a.approved === true && actionFields.every(key => typeof p[key] === "string" && p[key] !== "" && p[key] === a[key]);
    },
  },
  afApprovalFresh: {
    title: "Check the approval expiry", why: "The approval remains valid only before its recorded expiry. The timestamp is supplied by the application.", inputs: ["Current time", "Approval expiry time"],
    run: ([now, expires]) => count(now, "Current time") < count(expires, "Expiry time"),
  },
  afApprovalDecision: {
    title: "Require every approval check", why: "The action needs a matching decision, an unexpired approval and a reviewer still permitted to approve it.", inputs: ["Proposal matches approval?", "Approval unexpired?", "Reviewer currently permitted?"],
    run: inputs => {
      if (inputs.some(v => typeof v !== "boolean")) throw Error("Connect boolean approval checks to these inputs.");
      return inputs.every(v => v === true) ? "authorised for this action" : "request review";
    },
  },
  afQualifiedTool: {
    title: "Keep the server with the tool", why: "A tool name can occur on several servers. Retain the configured server identity when choosing its handler.", inputs: ["Requested server and tool"],
    run: ([request]) => {
      const r = record(request, "Request");
      if (typeof r.server !== "string" || !r.server || typeof r.tool !== "string" || !r.tool || r.server.includes("/") || r.tool.includes("/")) throw Error("Use nonempty server and tool names without slashes in this toy registry.");
      return `${r.server}/${r.tool}`;
    },
  },
  afAllowedEndpoint: {
    title: "Check the endpoint allowlist", why: "Discovery makes a tool visible. The host still decides whether this server and tool are allowed for the current request.", inputs: ["Server-qualified tool name", "Allowed server-qualified names"],
    run: ([name, allowed]) => {
      if (typeof name !== "string") throw Error("Connect a server-qualified tool name.");
      return strings(allowed, "Allowed endpoints").includes(name) ? name : null;
    },
  },
  afResolveEndpoint: {
    title: "Resolve the approved handler", why: "Find the named handler only after permission checks. A missing registered tool is unavailable; it does not fall back to another server.", inputs: ["Allowed endpoint or null", "Registered handler labels"],
    run: ([name, registry]) => {
      const r = record(registry, "Handler registry");
      if (name === null) return "blocked";
      if (typeof name !== "string") throw Error("Connect the allowlist result here.");
      if (!Object.hasOwn(r, name)) return "unavailable";
      if (typeof r[name] !== "string") throw Error("Each handler label must be text.");
      return r[name];
    },
  },
};
