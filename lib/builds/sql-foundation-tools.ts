import type { Data, Tool } from "./engine";

type Row = Record<string, Data>;
function rows(value: Data): Row[] {
  if (!Array.isArray(value) || value.some(row => !row || typeof row !== "object" || Array.isArray(row))) throw Error("Connect a list of records with named fields.");
  return value as Row[];
}
function names(value: string | number): string[] {
  const result = String(value).split(",").map(key => key.trim()).filter(Boolean);
  if (!result.length || new Set(result).size !== result.length) throw Error("Use distinct field names separated by commas.");
  return result;
}
function cell(row: Row, key: string): Data {
  if (!Object.hasOwn(row, key)) throw Error(`The record has no ${key} field.`);
  return row[key];
}
function scalar(value: Data): number | string | null {
  if (value === null || typeof value === "string" || typeof value === "number" && Number.isFinite(value)) return value;
  throw Error("This teaching component compares finite numbers, text or null.");
}
function compare(a: Data, b: Data): number {
  const left = scalar(a), right = scalar(b);
  if (left === right) return 0;
  if (left === null) return -1;
  if (right === null) return 1;
  if (typeof left !== typeof right) throw Error("Use the same non-null value type within a compared column.");
  return left < right ? -1 : 1;
}
const operations = ["count rows", "count values", "sum", "avg", "min", "max"];
function aggregate(input: Row[], field: string, operation: string): Data {
  if (!operations.includes(operation)) throw Error("Choose an aggregate operation.");
  if (operation === "count rows") return input.length;
  const values = input.map(row => cell(row, field)).filter(value => value !== null);
  if (operation === "count values") return values.length;
  if (!values.length) return null;
  if (operation === "min" || operation === "max") return values.reduce((a,b) => (operation === "min" ? compare(a,b) <= 0 : compare(a,b) >= 0) ? a : b);
  if (values.some(value => typeof value !== "number" || !Number.isFinite(value))) throw Error("Sum and average need finite numeric values or null.");
  const total = (values as number[]).reduce((sum,value) => sum + value,0);
  return operation === "sum" ? total : total / values.length;
}
const aggregateSettings = [{ key: "field", label: "Value field", initial: "minutes" }, { key: "operation", label: "Aggregate", initial: "sum", options: operations }, { key: "output", label: "Result field", initial: "total_minutes" }];

/** Visible record operations for SQL intuition. Actual SQL exercises run SQLite. */
export const sqlFoundationTools: Record<string, Tool> = {
  sqlText: {
    title: "Text comparison value", why: "Supply a literal text value for a comparison. It is a value, not a field name.", inputs: [], settings: [{key:"value",label:"Text",initial:"loose"}],
    run: (_,settings) => String(settings.value),
  },
  sqlProject: {
    title: "Choose table columns", why: "Keep the named fields on every row. Projection does not remove duplicate rows.", inputs: ["Rows"], settings: [{ key: "columns", label: "Columns, separated by commas", initial: "asset_id,site" }],
    run: ([value],settings) => { const fields = names(settings.columns); return rows(value).map(row => Object.fromEntries(fields.map(key => [key,cell(row,key)]))); },
  },
  sqlDistinct: {
    title: "Keep distinct rows", why: "Remove repeated complete result rows after choosing their columns. Null values in the same positions count as duplicates here.", inputs: ["Projected rows"],
    run: ([value]) => { const seen = new Set<string>(); return rows(value).filter(row => { const key = JSON.stringify(Object.keys(row).sort().map(name => [name,row[name]])); if (seen.has(key)) return false; seen.add(key); return true; }); },
  },
  sqlFilter: {
    title: "Keep rows passing a comparison", why: "A comparison involving null is unknown and does not pass WHERE. This component requires matching numeric or text types.", inputs: ["Rows", "Comparison value"], settings: [{ key: "field", label: "Field to compare", initial: "minutes" }, { key: "operator", label: "Comparison", initial: ">=", options: ["=","!=",">",">=","<","<="] }],
    run: ([value,target],settings) => {
      const operator = String(settings.operator);
      if (!["=","!=",">",">=","<","<="].includes(operator)) throw Error("Choose a comparison operator.");
      scalar(target);
      return rows(value).filter(row => { const actual = cell(row,String(settings.field)); scalar(actual); if (actual === null || target === null) return false; const d=compare(actual,target); return operator === "=" ? d===0 : operator === "!=" ? d!==0 : operator === ">" ? d>0 : operator === ">=" ? d>=0 : operator === "<" ? d<0 : d<=0; });
    },
  },
  sqlSort: {
    title: "Order rows by named fields", why: "Compare each sort field in order. Add a unique final key when equal values need a reproducible order. Ascending nulls come first, as in SQLite's default.", inputs: ["Rows"], settings: [{ key: "order", label: "Order, for example minutes DESC, inspection_id ASC", initial: "asset_id ASC" }],
    run: ([value],settings) => {
      const terms=String(settings.order).split(",").map(term=> { const match=/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*(ASC|DESC)?\s*$/i.exec(term); if(!match)throw Error("Use field names followed by ASC or DESC."); return {field:match[1],direction:match[2]?.toUpperCase()==="DESC"?-1:1}; });
      const input=rows(value); input.forEach(row=>terms.forEach(term=>scalar(cell(row,term.field))));
      return [...input].sort((a,b)=> {for(const term of terms){const result=compare(cell(a,term.field),cell(b,term.field))*term.direction;if(result)return result;}return 0;});
    },
  },
  sqlLimit: {
    title: "Take the first rows", why: "Keep the first requested number of rows. Connect a deliberate ordering before choosing a reproducible top list.", inputs: ["Ordered rows","Maximum rows"],
    run: ([value,limit]) => { if(typeof limit!=="number"||!Number.isInteger(limit)||limit<0)throw Error("Use a nonnegative whole-number limit.");return rows(value).slice(0,limit); },
  },
  sqlNullFilter: {
    title: "Check for a missing value", why: "IS NULL and IS NOT NULL explicitly test missingness. An equality comparison with null cannot do this job.", inputs: ["Rows"], settings: [{key:"field",label:"Field",initial:"minutes"},{key:"mode",label:"Keep",initial:"is null",options:["is null","is not null"]}],
    run: ([value],settings) => { if(!["is null","is not null"].includes(String(settings.mode)))throw Error("Choose a missing-value test.");return rows(value).filter(row=>(cell(row,String(settings.field))===null)===(settings.mode==="is null")); },
  },
  sqlCaseBand: {
    title: "Label a measured threshold", why: "Append a label: unknown for null, inspect at or above the threshold, monitor below it. This is the explicit CASE policy used in the lesson.", inputs: ["Rows","Inspection threshold"], settings: [{key:"field",label:"Measured field",initial:"temperature"},{key:"output",label:"Label field",initial:"action"}],
    run: ([value,threshold],settings) => {if(typeof threshold!=="number"||!Number.isFinite(threshold))throw Error("Use a finite threshold.");return rows(value).map(row=>{const v=cell(row,String(settings.field));if(v!==null&&(typeof v!=="number"||!Number.isFinite(v)))throw Error("Measurements must be numbers or null.");return {...row,[String(settings.output)]:v===null?"unknown":(v as number)>=threshold?"inspect":"monitor"};});},
  },
  sqlAggregate: {
    title: "Summarise all rows", why: "Create one result row. Count rows includes missing cells; count values excludes nulls. Sum and average of no known values are null.", inputs: ["Rows"], settings: aggregateSettings,
    run: ([value],settings) => [{[String(settings.output)]:aggregate(rows(value),String(settings.field),String(settings.operation))}],
  },
  sqlGroup: {
    title: "Summarise each group", why: "Collect rows sharing the group key and calculate an aggregate inside each group. Null group keys form one group.", inputs: ["Rows"], settings: [{key:"key",label:"Group field",initial:"asset_id"},...aggregateSettings],
    run: ([value],settings) => {const groups=new Map<string,{key:Data;rows:Row[]}>(); for(const row of rows(value)){const key=scalar(cell(row,String(settings.key))),id=JSON.stringify(key);if(!groups.has(id))groups.set(id,{key,rows:[]});groups.get(id)!.rows.push(row);}return [...groups.values()].map(group=>({[String(settings.key)]:group.key,[String(settings.output)]:aggregate(group.rows,String(settings.field),String(settings.operation))}));},
  },
  sqlJoin: {
    title: "Match rows on a key", why: "Emit one row per matching pair. A left join also retains unmatched left rows with null right fields. Duplicate keys produce multiple pairs; null equality never matches.", inputs: ["Left rows","Right rows"], settings: [{key:"leftKey",label:"Left match field",initial:"asset_id"},{key:"rightKey",label:"Right match field",initial:"asset_id"},{key:"kind",label:"Join",initial:"inner",options:["inner","left"]},{key:"rightFields",label:"Right fields to carry",initial:"minutes"},{key:"rightPrefix",label:"Prefix for right fields",initial:"inspection_"}],
    run: ([left,right],settings) => {
      if(!["inner","left"].includes(String(settings.kind)))throw Error("Choose inner or left.");const l=rows(left),r=rows(right),fields=names(settings.rightFields),prefix=String(settings.rightPrefix);
      r.forEach(row=>{scalar(cell(row,String(settings.rightKey)));fields.forEach(key=>cell(row,key));});
      const result:Row[]=[];for(const row of l){const key=scalar(cell(row,String(settings.leftKey)));if(fields.some(field=>Object.hasOwn(row,prefix+field)))throw Error("Choose a right prefix that does not overwrite a left field.");const matches=r.filter(other=>key!==null&&cell(other,String(settings.rightKey))!==null&&compare(key,cell(other,String(settings.rightKey)))===0);if(matches.length)for(const match of matches)result.push({...row,...Object.fromEntries(fields.map(field=>[prefix+field,cell(match,field)]))});else if(settings.kind==="left")result.push({...row,...Object.fromEntries(fields.map(field=>[prefix+field,null]))});}return result;
    },
  },
};
