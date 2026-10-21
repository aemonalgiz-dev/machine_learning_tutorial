import type { Data, Tool } from "./engine";

const isRecord = (value: Data): value is Record<string, Data> => value !== null && typeof value === "object" && !Array.isArray(value);
const text = (value: Data): value is string => typeof value === "string" && value.trim().length > 0;
const textList = (value: Data): value is string[] => Array.isArray(value) && value.every(text);
const own = (record: Record<string, Data>, key: string) => Object.hasOwn(record, key);
const requireBooleans = (values: Data[]) => { if (values.some(value => typeof value !== "boolean")) throw Error("Connect a true-or-false check to each permission input."); };

export const agentGuardrailTools: Record<string, Tool> = {
  agRequestedTool: {
    title: "Read the proposed tool name", why: "A model proposal is data. Extract its requested tool without treating its explanation as permission.", inputs: ["Model proposal"],
    run: ([proposal]) => isRecord(proposal) && text(proposal.tool) ? proposal.tool : "",
  },
  agToolGrant: {
    title: "Compare with server grants", why: "The application supplies this exact allowlist. Neither a document nor a model response can add a grant.", inputs: ["Requested tool name", "Server-granted tool names"],
    run: ([name, grants]) => text(name) && textList(grants) && grants.includes(name),
  },
  agScreenStatus: {
    title: "Read the screening result", why: "A missing or malformed screening response is unavailable, never a successful check.", inputs: ["Recorded screen result"],
    run: ([screen]) => isRecord(screen) && ["pass", "flag"].includes(String(screen.status)) && typeof screen.status === "string" ? screen.status : "unavailable",
  },
  agScreenRoute: {
    title: "Keep permission ahead of screening", why: "A favourable classifier result cannot authorise a tool. Allowed calls still wait when this policy requires a screen and its result is flagged or unavailable.", inputs: ["Tool granted?", "Screen status"],
    run: ([permitted, status]) => {
      requireBooleans([permitted]);
      if (typeof status !== "string" || !["pass", "flag", "unavailable"].includes(status)) throw Error("Connect the screening status here.");
      return !permitted ? "deny tool" : status === "pass" ? "continue to argument checks" : "hold for review";
    },
  },
  agTenantMatch: {
    title: "Match the tenant", why: "The authenticated caller and the stored object must belong to the same tenant for this policy.", inputs: ["Server-authenticated principal", "Stored asset record"],
    run: ([principal, asset]) => isRecord(principal) && isRecord(asset) && text(principal.tenant) && principal.tenant === asset.tenant,
  },
  agAssetGrant: {
    title: "Check this asset grant", why: "Being in the same tenant does not grant access to every asset. Check the stored asset ID against the caller's current grants.", inputs: ["Server-authenticated principal", "Stored asset record"],
    run: ([principal, asset]) => isRecord(principal) && isRecord(asset) && text(asset.id) && textList(principal.assets) && principal.assets.includes(asset.id),
  },
  agOperationGrant: {
    title: "Check the operation grant", why: "Permission to read a manual does not permit creating an inspection or exporting records.", inputs: ["Server-authenticated principal", "Requested operation"],
    run: ([principal, operation]) => isRecord(principal) && text(operation) && textList(principal.operations) && principal.operations.includes(operation),
  },
  agPermissionRoute: {
    title: "Require every access check", why: "This policy needs tenant, asset and operation checks to pass together. Missing evidence of permission takes the deny route.", inputs: ["Tenant matches?", "Asset granted?", "Operation granted?"],
    run: values => { requireBooleans(values); return values.every(value => value === true) ? "allow this operation" : "deny"; },
  },
  agProjectFields: {
    title: "Keep only the needed fields", why: "Construct a new payload from explicitly selected field names. Extra fields on the source record are left behind.", inputs: ["Maintenance record", "Needed field names"],
    run: ([record, fields]) => {
      if (!isRecord(record) || !textList(fields) || !fields.length) throw Error("Supply a record and a nonempty list of needed fields.");
      if (fields.some(key => !own(record, key))) throw Error("A requested field is absent; do not silently send an incomplete payload.");
      return Object.fromEntries(fields.map(key => [key, record[key]]));
    },
  },
  agFieldRelease: {
    title: "Check each field's release label", why: "Each selected field needs the application's approved release label. Unlabelled fields stay withheld.", inputs: ["Projected payload", "Server field classifications"],
    run: ([payload, labels]) => isRecord(payload) && isRecord(labels) && Object.keys(payload).length > 0 && Object.keys(payload).every(key => own(labels, key) && labels[key] === "approved"),
  },
  agDestinationGrant: {
    title: "Check the configured destination", why: "Use an application-configured service ID. This toy gate does not resolve URLs, redirects or network addresses.", inputs: ["Destination service ID", "Approved service IDs"],
    run: ([destination, allowed]) => text(destination) && textList(allowed) && allowed.includes(destination),
  },
  agReleasePayload: {
    title: "Release the checked payload", why: "Keep the payload withheld unless its fields and destination both pass. This workshop returns a record and never sends a network request.", inputs: ["Projected payload", "Fields approved?", "Destination approved?"],
    run: ([payload, fields, destination]) => {
      requireBooleans([fields, destination]);
      if (!isRecord(payload)) throw Error("Connect the projected record here.");
      return fields && destination ? { route: "ready for configured service", payload } : { route: "withhold", payload: {} };
    },
  },
  agDraftShape: {
    title: "Check the draft fields", why: "Require exactly asset, citation and text, each a nonblank string, before interpreting their meaning.", inputs: ["Proposed maintenance draft"],
    run: ([draft]) => {
      const valid = isRecord(draft) && Object.keys(draft).length === 3 && ["asset", "citation", "text"].every(key => own(draft, key) && text(draft[key]));
      return valid ? { valid: true, draft } : { valid: false, draft: {} };
    },
  },
  agDraftEvidence: {
    title: "Match the requested asset and citation", why: "The draft must concern the requested asset and cite a supplied excerpt for that asset. This does not establish that its sentence follows from the excerpt.", inputs: ["Draft field check", "Requested asset ID", "Supplied citation-to-asset map"],
    run: ([checked, requested, evidence]) => {
      if (!isRecord(checked) || !isRecord(checked.draft)) throw Error("Connect the draft field check here.");
      const draft = checked.draft;
      const valid = checked.valid === true && text(requested) && draft.asset === requested && text(draft.citation) && isRecord(evidence) && own(evidence, draft.citation) && evidence[draft.citation] === requested;
      return valid ? { route: "draft for review", text: draft.text } : { route: "repair draft", text: "" };
    },
  },
  agEscapeDraft: {
    title: "Encode text for an HTML text node", why: "Encode markup characters before embedding draft text inside an HTML text node. This rule is not a URL, JavaScript, SQL or shell validator.", inputs: ["Checked draft route"],
    run: ([checked]) => {
      if (!isRecord(checked) || typeof checked.text !== "string" || typeof checked.route !== "string" || !["draft for review", "repair draft"].includes(checked.route)) throw Error("Connect the checked draft route here.");
      const encoded = checked.text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;");
      return { route: checked.route, htmlText: encoded };
    },
  },
};
