import type { Data, Tool } from "./engine";

function record(value: Data, label: string): Record<string, Data> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw Error(`${label} needs named fields.`);
  return value;
}
function integer(value: Data, label: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw Error(`${label} must be a nonnegative whole number.`);
  return value;
}
function text(value: Data, label: string): string {
  if (typeof value !== "string" || !value.trim()) throw Error(`${label} needs nonempty text.`);
  return value;
}
function choice(value: Data, allowed: string[], label: string): string {
  if (typeof value !== "string" || !allowed.includes(value)) throw Error(`${label} must be one of: ${allowed.join(", ")}.`);
  return value;
}
function equal(a: Data, b: Data): boolean {
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => equal(v, b[i]));
  if (a && b && typeof a === "object" && typeof b === "object" && !Array.isArray(a) && !Array.isArray(b)) return Object.keys(a).length === Object.keys(b).length && Object.keys(a).every(k => Object.hasOwn(b, k) && equal(a[k], b[k]));
  return a === b;
}
const resources = ["tokens", "cost_units", "model_requests", "tool_calls"] as const;
function amounts(value: Data, label: string): Record<string, number> {
  const r = record(value, label);
  return Object.fromEntries(resources.map(key => [key, integer(r[key], `${label}: ${key}`)]));
}

export const agentReliabilityTools: Record<string, Tool> = {
  arSummariseTrials: {
    title: "Summarise each controller's trials", why: "Keep task results, worst observed latency and total measured cost together for each tested controller.", inputs: ["Controller trial records"],
    run: ([input]) => {
      if (!Array.isArray(input)) throw Error("Supply a list of controller records.");
      const names = new Set<string>(); let count: number | undefined;
      return input.map(value => {
        const r = record(value, "Controller"), name = text(r.name, "Controller name"), rank = integer(r.rank, "Autonomy rank");
        if (names.has(name)) throw Error("Controller names must be unique."); names.add(name);
        if (!Array.isArray(r.passed) || !r.passed.length || r.passed.some(v => typeof v !== "boolean")) throw Error("Each controller needs a nonempty list of boolean task results.");
        if (count !== undefined && count !== r.passed.length) throw Error("Test every controller on the same number of cases, in the same order."); count = r.passed.length;
        if (!Array.isArray(r.latency_ms) || !Array.isArray(r.cost_units) || r.latency_ms.length !== count || r.cost_units.length !== count) throw Error("Align latency and cost with every task result.");
        const latency = r.latency_ms.map(v => integer(v, "Latency")), cost = r.cost_units.map(v => integer(v, "Cost"));
        return { name, rank, passes: r.passed.filter(Boolean).length, cases: count, worst_ms: Math.max(...latency), total_cost: cost.reduce((a, b) => a + b, 0) };
      });
    },
  },
  arEligibleControllers: {
    title: "Keep controllers that meet the requirements", why: "A controller must meet the task, time and cost requirements before simplicity can decide between candidates.", inputs: ["Trial summaries", "Acceptance requirements"],
    run: ([input, requirements]) => {
      const p = record(requirements, "Requirements"), passes = integer(p.min_passes, "Required passes"), latency = integer(p.max_latency_ms, "Maximum latency"), cost = integer(p.max_cost_units, "Maximum total cost");
      if (!Array.isArray(input)) throw Error("Connect the trial summaries.");
      return input.filter(value => { const r = record(value, "Summary"); return integer(r.passes, "Passes") >= passes && integer(r.worst_ms, "Worst latency") <= latency && integer(r.total_cost, "Total cost") <= cost; });
    },
  },
  arChooseController: {
    title: "Choose the least autonomy that passed", why: "Choose the lowest declared autonomy rank, then lower measured cost, then name. An empty shortlist needs review.", inputs: ["Eligible controller summaries"],
    run: ([input]) => {
      if (!Array.isArray(input)) throw Error("Connect the eligible controller list.");
      const rows = input.map(value => { const r = record(value, "Controller summary"); return { name: text(r.name, "Name"), rank: integer(r.rank, "Rank"), cost: integer(r.total_cost, "Cost") }; });
      rows.sort((a, b) => a.rank - b.rank || a.cost - b.cost || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
      return rows[0]?.name ?? "review requirements";
    },
  },
  arReceiptLookup: {
    title: "Look up the operation receipt", why: "The receiving service binds one key to one payload. Reusing that key for changed work is a conflict.", inputs: ["Operation request", "Service receipt records"],
    run: ([command, input]) => {
      const r = record(command, "Operation"), key = text(r.key, "Operation key"); record(r.payload, "Operation payload");
      if (!Array.isArray(input)) throw Error("Receipts must be a list.");
      const keys = new Set<string>(); let found: Record<string, Data> | undefined;
      for (const value of input) {
        const item = record(value, "Receipt"), k = text(item.key, "Receipt key");
        if (keys.has(k)) throw Error("The receipt ledger cannot have duplicate keys."); keys.add(k);
        record(item.payload, "Receipt payload"); choice(item.status, ["completed", "pending"], "Receipt status");
        if (item.status === "completed" && !Object.hasOwn(item, "result")) throw Error("A completed receipt needs its stored result, which may explicitly be null.");
        if (k === key) found = item;
      }
      if (!found) return { status: "absent", result: null };
      if (!equal(r.payload, found.payload)) return { status: "conflict", result: null };
      return { status: found.status, result: found.status === "completed" ? found.result ?? null : null };
    },
  },
  arRetrySafety: {
    title: "Classify whether another attempt is safe", why: "A timeout can hide a completed write. Only read operations or a receiver-enforced idempotency contract can be retried automatically here.", inputs: ["Operation request", "Last attempt outcome"],
    run: ([command, outcome]) => {
      const r = record(command, "Operation");
      choice(r.effect, ["read", "write"], "Operation effect");
      if (typeof r.idempotent !== "boolean") throw Error("Declare a boolean idempotency contract.");
      choice(outcome, ["success", "transient", "permanent", "unknown"], "Outcome");
      if (outcome === "success") return "done";
      if (outcome === "permanent") return "repair request";
      return r.effect === "read" || r.idempotent === true ? "retry permitted" : "reconcile outcome";
    },
  },
  arRetryWindow: {
    title: "Fit the next attempt inside the deadline", why: "The delay, per-attempt timeout and attempts already spent all affect whether another request can start.", inputs: ["Retry schedule", "Run clock and attempt count"],
    run: ([schedule, state]) => {
      const p = record(schedule, "Schedule"), s = record(state, "Run state");
      const base = integer(p.base_ms, "Base delay"), cap = integer(p.cap_ms, "Delay cap"), timeout = integer(p.timeout_ms, "Attempt timeout"), limit = integer(p.max_attempts, "Maximum attempts"), used = integer(s.attempts, "Attempts already started"), now = integer(s.now_ms, "Current time"), deadline = integer(s.deadline_ms, "Deadline");
      if (typeof p.jitter_fraction !== "number" || !Number.isFinite(p.jitter_fraction) || p.jitter_fraction < 0 || p.jitter_fraction > 1) throw Error("Use a jitter fraction from zero to one.");
      if (timeout === 0) throw Error("Use a positive attempt timeout.");
      const ceiling = Math.min(cap, base * 2 ** Math.min(used > 0 ? used - 1 : 0, 52));
      const delay_ms = Math.floor(ceiling * p.jitter_fraction);
      return { delay_ms, allowed: used < limit && now < deadline && now + delay_ms + timeout <= deadline };
    },
  },
  arRetryRoute: {
    title: "Choose the recovery action", why: "A stored success or conflicting key takes precedence over another attempt. Retry permission still needs time and attempt budget.", inputs: ["Receipt lookup", "Retry safety decision", "Retry window"],
    run: ([receipt, safety, window]) => {
      const r = record(receipt, "Receipt lookup"), w = record(window, "Retry window");
      const result = (route: string, delay_ms = 0, value: Data = null): Data => ({ route, delay_ms, result: value });
      choice(r.status, ["absent", "completed", "pending", "conflict"], "Receipt lookup status");
      choice(safety, ["done", "repair request", "retry permitted", "reconcile outcome"], "Retry safety result");
      if (typeof w.allowed !== "boolean") throw Error("Connect the retry window."); integer(w.delay_ms, "Retry delay");
      if (r.status === "conflict") return result("reject changed payload");
      if (r.status === "completed") return result("return stored result", 0, r.result);
      if (r.status === "pending") return result("query operation status");
      if (safety !== "retry permitted") return result(String(safety));
      return w.allowed ? result("retry same operation key", Number(w.delay_ms)) : result("stop at run limit");
    },
  },
  arAvailableBudget: {
    title: "Subtract spent and reserved work", why: "Work already in flight still occupies budget. Every named resource must remain within its own cap.", inputs: ["Run limits", "Settled usage", "Reservations still in flight"],
    run: ([limits, used, reserved]) => {
      const l = amounts(limits, "Limits"), u = amounts(used, "Settled usage"), r = amounts(reserved, "Reservations");
      const remaining = Object.fromEntries(resources.map(key => [key, l[key] - u[key] - r[key]]));
      if (Object.values(remaining).some(value => value < 0)) throw Error("Usage and reservations already exceed a limit. Reconcile the ledger before admitting more work.");
      return remaining;
    },
  },
  arDispatchStatus: {
    title: "Check cancellation and dependency health", why: "An open circuit stops new calls to that dependency. A cancelled run admits no new work.", inputs: ["Run control state"],
    run: ([value]) => {
      const r = record(value, "Run control");
      if (typeof r.cancelled !== "boolean" || typeof r.probe_granted !== "boolean") throw Error("Supply boolean cancelled and probe_granted fields.");
      choice(r.circuit, ["closed", "open", "half-open"], "Circuit state");
      if (r.cancelled) return "cancelled";
      if (r.circuit === "open" || r.circuit === "half-open" && !r.probe_granted) return "circuit unavailable";
      return r.circuit === "half-open" ? "one probe" : "dispatch available";
    },
  },
  arReserveBatch: {
    title: "Reserve proposed calls in queue order", why: "Each accepted call reduces the shared remainder before the next is checked. The run deadline and per-request context cap also apply.", inputs: ["Proposed call records", "Available resource budget", "Dispatch status", "Clock and request limit"],
    run: ([input, available, dispatch, constraints]) => {
      if (!Array.isArray(input)) throw Error("Supply proposed calls as a list.");
      const remaining = amounts(available, "Available budget"), c = record(constraints, "Clock and limit"), now = integer(c.now_ms, "Current time"), deadline = integer(c.deadline_ms, "Deadline"), contextLimit = integer(c.max_input_tokens, "Per-request input cap");
      choice(dispatch, ["cancelled", "circuit unavailable", "one probe", "dispatch available"], "Dispatch status");
      const ids = new Set<string>(), accepted: string[] = [], rejected: Data[] = [];
      for (const value of input) {
        const p = record(value, "Proposed call"), id = text(p.id, "Call ID"), need = amounts(p.reserve, "Reservation"), duration = integer(p.timeout_ms, "Call timeout"), context = integer(p.input_tokens, "Input tokens");
        if (ids.has(id)) throw Error("Proposed call IDs must be unique."); ids.add(id);
        if (!duration || need.tokens < context) throw Error("Use a positive timeout and reserve at least the input tokens.");
        let reason = "";
        if (dispatch === "cancelled" || dispatch === "circuit unavailable") reason = String(dispatch);
        else if (dispatch === "one probe" && accepted.length) reason = "probe slot used";
        else if (context > contextLimit) reason = "request too large";
        else if (now >= deadline || now + duration > deadline) reason = "deadline";
        else if (resources.some(key => need[key] > remaining[key])) reason = "resource budget";
        if (reason) rejected.push({ id, reason });
        else { accepted.push(id); for (const key of resources) remaining[key] -= need[key]; }
      }
      return { accepted, rejected, remaining };
    },
  },
};
