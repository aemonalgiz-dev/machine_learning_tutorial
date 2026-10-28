import type { Data, Tool } from "./engine";

type Document = Record<string, Data>;
function document(value: Data): Document {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("Connect a document with named fields.");
  return value as Document;
}
function documents(value: Data): Document[] {
  if (!Array.isArray(value)) throw Error("Connect a list of documents.");
  return value.map(document);
}
function text(value: Data): string {
  if (typeof value !== "string") throw Error("Use a text key or field name.");
  return value;
}
function number(value: Data): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw Error("Use a finite number.");
  return value;
}
function path(value: Data, name: string): Data {
  let current = value;
  for (const field of name.split(".")) {
    const item = document(current);
    if (!field || !Object.hasOwn(item, field)) throw Error(`The path ${name} is missing. Use a presence check when absence is allowed.`);
    current = item[field];
  }
  return current;
}
const pathSetting = [{ key: "path", label: "Field path", initial: "asset_id" }];

/** Small record operations. These do not parse MongoDB queries or run Redis. */
export const NOSQL_FOUNDATION_TOOLS: Record<string, Tool> = {
  nsBuckets: {
    title: "Collect records under a key", why: "Collect complete records into a list under each selected field value. Repeated asset keys append visits to their history; they do not overwrite earlier visits.", inputs: ["Records"], settings: pathSetting,
    run: ([input], settings) => {
      const buckets = new Map<string, Data[]>();
      for (const row of documents(input)) { const key = text(path(row, String(settings.path))); if (!buckets.has(key)) buckets.set(key, []); buckets.get(key)!.push(row); }
      return Object.fromEntries(buckets);
    },
  },
  nsLookup: {
    title: "Look up one exact key", why: "Return a found flag separately from the stored value. A stored null is still a found key; a missing key has found false.", inputs: ["Keyed records", "Exact key"],
    run: ([input, key]) => { const records = document(input), name = text(key); return Object.hasOwn(records, name) ? { found: true, value: records[name] } : { found: false, value: null }; },
  },
  nsUnwrap: {
    title: "Use a lookup or its fallback", why: "Choose by the found flag. Do not mistake zero, an empty list or null for a cache miss.", inputs: ["Lookup result", "Value for a missing key"],
    run: ([input, fallback]) => { const result = document(input); if (typeof result.found !== "boolean" || !Object.hasOwn(result, "value")) throw Error("Connect the result from Look up one exact key."); return result.found ? result.value : fallback; },
  },
  nsCompositeKey: {
    title: "Encode all key parts", why: "Encode the ordered text parts as a JSON array. This teaching convention preserves boundaries even if a part contains a colon.", inputs: ["Ordered key parts"],
    run: ([input]) => { if (!Array.isArray(input) || !input.length || input.some(item => typeof item !== "string")) throw Error("Connect a nonempty list of text key parts."); return JSON.stringify(input); },
  },
  nsPath: {
    title: "Read a document path", why: "Follow named objects one field at a time. This component requires the complete path; it never silently turns a missing field into null.", inputs: ["Document"], settings: pathSetting,
    run: ([input], settings) => path(input, String(settings.path)),
  },
  nsProbe: {
    title: "Check whether a field exists", why: "Report present and value separately. A present field containing null differs from a field the writer never supplied.", inputs: ["Document", "Field name"],
    run: ([input, field]) => { const row = document(input), key = text(field); return Object.hasOwn(row, key) ? { present: true, value: row[key] } : { present: false, value: null }; },
  },
  nsBefore: {
    title: "Is the clock before expiry?", why: "Use the cached copy only while now is strictly earlier than expiresAt. Equality reaches the expiry boundary.", inputs: ["Current time", "Expiry time"],
    run: ([now, expiry]) => number(now) < number(expiry),
  },
  nsChoose: {
    title: "Choose using a Boolean", why: "Select the first branch only for true. This workshop evaluates both connected branches to make their values inspectable; it does not issue conditional server requests.", inputs: ["Condition", "When true", "When false"],
    run: ([condition, yes, no]) => { if (typeof condition !== "boolean") throw Error("Connect a Boolean condition."); return condition ? yes : no; },
  },
  nsNest: {
    title: "Attach a named object", why: "Copy the parent and attach the supplied object under one field. Keep the original reference so the source of current metadata remains visible.", inputs: ["Parent document", "Related object"], settings: [{key:"field",label:"Attached field",initial:"supplier"}],
    run: ([parent, value], settings) => ({ ...document(parent), [String(settings.field)]: document(value) }),
  },
  nsUnwind: {
    title: "Make one row per array member", why: "Make one output row for each array member, retaining its parent's other fields. An empty array contributes no member rows. Inspect the repeated parent fields before choosing what can be counted or summed.", inputs: ["Documents"], settings: [{ key: "field", label: "Array field", initial: "readings" }],
    run: ([input], settings) => documents(input).flatMap(row => { const values = row[String(settings.field)]; if (!Array.isArray(values)) throw Error("Every document needs an array at the chosen field."); return values.map(value => ({ ...row, [String(settings.field)]: value })); }),
  },
  nsFilterPath: {
    title: "Keep matching document values", why: "Filter by a required nested path. Equality compares primitive values exactly; >= requires finite numbers. This is a stated teaching rule, not MongoDB's full matching semantics.", inputs: ["Documents", "Compared value"], settings: [...pathSetting, {key:"operator",label:"Comparison",initial:"=",options:["=",">="]}],
    run: ([input, wanted], settings) => {
      if (settings.operator !== "=" && settings.operator !== ">=") throw Error("Choose = or >=.");
      if (wanted !== null && typeof wanted === "object") throw Error("Compare a primitive value.");
      return documents(input).filter(row => { const value=path(row,String(settings.path)); return settings.operator === "=" ? value === wanted : number(value) >= number(wanted); });
    },
  },
  nsProjectPaths: {
    title: "Keep selected document paths", why: "Project named paths into an output record. Dotted output names are labels for this inspection table, not nested MongoDB projection objects.", inputs: ["Documents"], settings: [{key:"paths",label:"Comma-separated paths",initial:"asset_id"}],
    run: ([input],settings) => { const names=String(settings.paths).split(",").map(x=>x.trim()); if(names.some(x=>!x)||new Set(names).size!==names.length)throw Error("Choose distinct nonempty paths.");return documents(input).map(row=>Object.fromEntries(names.map(name=>[name,path(row,name)]))); },
  },
  nsUnique: {
    title: "Keep one copy of each result", why: "Remove duplicate projected records while retaining their first appearance. Each input record must use the same field order in this teaching component.", inputs: ["Projected records"],
    run: ([input]) => { const seen=new Set<string>();return documents(input).filter(row=>{const key=JSON.stringify(row);if(seen.has(key))return false;seen.add(key);return true;}); },
  },
  nsEqual: {
    title: "Compare exact scalar values", why: "Compare the stored version with the version the editor read. Both values must be primitive, with no type conversion.", inputs: ["Stored value", "Expected value"],
    run: ([left,right]) => {if(left!==null&&typeof left==="object"||right!==null&&typeof right==="object")throw Error("Compare primitive values.");return left===right;},
  },
  nsSetField: {
    title: "Set one top-level field", why: "Copy the document and replace one named field. Unrelated fields remain intact. The field name is a literal, not an update-expression parser.", inputs: ["Document", "New value"], settings: [{key:"field",label:"Field to set",initial:"status"}],
    run: ([input,value],settings) => ({...document(input),[String(settings.field)]:value}),
  },
  nsIncrement: {
    title: "Increment one numeric field", why: "Add the supplied amount to one finite numeric field on a copied document. The workshop shows the operation; only a server can make the combined version check and update atomic.", inputs: ["Document", "Amount"], settings: [{key:"field",label:"Numeric field",initial:"version"}],
    run: ([input,amount],settings) => { const row=document(input), field=String(settings.field);return {...row,[field]:number(path(row,field))+number(amount)}; },
  },
  nsGroupSum: {
    title: "Sum values under a group key", why: "Read a text group key and numeric amount from each row, then produce one total per group in sorted key order. The input grain determines what is being added.", inputs: ["Rows"], settings: [{key:"key",label:"Group path",initial:"site"},{key:"amount",label:"Amount path",initial:"visits.minutes"}],
    run: ([input],settings) => {const sums=new Map<string,number>();for(const row of documents(input)){const key=text(path(row,String(settings.key)));sums.set(key,(sums.get(key)??0)+number(path(row,String(settings.amount))));}return [...sums].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([key,total])=>({key,total}));},
  },
};
