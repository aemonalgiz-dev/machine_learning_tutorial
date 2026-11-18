import { show,type Data } from "@/lib/builds/engine";
import { graphDisplay } from "@/lib/builds/graph-display";
import { NetworkDiagram } from "../concept/NetworkDiagram";

const isRecord = (value: Data): value is Record<string, Data> => value !== null && typeof value === "object" && !Array.isArray(value);
const isScalar = (value: Data) => value === null || typeof value !== "object";
const isTableCell = (value: Data) => isScalar(value) || Array.isArray(value) && value.length <= 8 && value.every(isScalar);
const scalarText = (value: Data) => typeof value === "string"
  ? !value.trim() || ["null", "true", "false", "NaN", "Infinity", "-Infinity"].includes(value) || Number.isFinite(Number(value)) ? JSON.stringify(value) : value
  : show(value);

function RecordEntry({record,name}:{record:Record<string,Data>;name:string}) {
  return Object.hasOwn(record, name) ? <>{scalarText(record[name])}</> : <span className="font-sans italic text-muted">Not provided</span>;
}

/** Keep names beside their values; reserve JSON for large or deeply nested data. */
export function WorkshopValue({value}:{value:Data}) {
  return <Value value={value} depth={0} />;
}

function Value({value,depth}:{value:Data;depth:number}) {
  const graph = graphDisplay(value);
  if (graph) return <div className="min-w-0 rounded-lg border border-line bg-background p-2">
    <NetworkDiagram scene={graph} />
    <details className="mt-3 text-xs"><summary className="cursor-pointer text-muted">Inspect the node and relationship records</summary><pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-accent">{JSON.stringify(value, null, 2)}</pre></details>
  </div>;
  if (Array.isArray(value) && value.length > 0 && value.length <= 12 && value.every(item => isRecord(item) && Object.values(item).every(isTableCell))) {
    const records = value as Record<string, Data>[];
    const columns = [...new Set(records.flatMap(item => Object.keys(item)))];
    if (columns.length > 0 && columns.length <= 8) return <div className="@container max-w-full">
      <ol aria-label="Record data" className="divide-y divide-line rounded-lg border border-line bg-background @[28rem]:hidden">
        {records.map((record, index) => <li key={index} className="p-2"><dl className="space-y-1">{columns.map(key => <div key={key} className="grid grid-cols-2 gap-2 text-xs leading-5">
          <dt className="break-words font-mono text-muted">{key}</dt><dd className="min-w-0 break-words font-mono text-accent"><RecordEntry record={record} name={key}/></dd>
        </div>)}</dl></li>)}
      </ol>
      <div className="hidden max-w-full overflow-auto rounded-lg border border-line bg-background @[28rem]:block"><table className="w-full border-collapse text-left text-xs" aria-label="Record data">
        <thead><tr>{columns.map(key => <th key={key} scope="col" className="border-b border-line bg-raised px-3 py-2 font-mono font-medium text-foreground">{key}</th>)}</tr></thead>
        <tbody>{records.map((record, index) => <tr key={index}>{columns.map(key => <td key={key} className="border-b border-line px-3 py-2 font-mono text-accent">
          <RecordEntry record={record} name={key}/>
        </td>)}</tr>)}</tbody>
      </table></div>
    </div>;
  }
  if(Array.isArray(value)&&value.length>0&&value.length<=12&&value.every(row=>Array.isArray(row)&&row.length>0&&row.length<=12&&row.every(item=>typeof item==="number"))) {
    const rows=value as number[][];
    if(rows.every(row=>row.length===rows[0].length))return <div className="max-w-full overflow-auto rounded-lg border border-line bg-background p-2"><table className="border-separate border-spacing-1 font-mono text-xs" aria-label={`${rows.length} rows by ${rows[0].length} columns`}><tbody>{rows.map((row,i)=><tr key={i}>{row.map((item,j)=><td key={j} className="min-w-9 rounded bg-raised px-2 py-2 text-center text-accent">{show(item)}</td>)}</tr>)}</tbody></table></div>;
  }
  if(Array.isArray(value)&&value.length>0&&value.length<=30&&value.every(item=>item===null||typeof item!=="object"))return <ol className="flex max-w-full flex-wrap gap-2 rounded-lg border border-line bg-background p-2" aria-label="Values in order">{value.map((item,i)=><li key={i} className="min-w-9 max-w-full rounded border border-line bg-raised px-2 py-1 text-center"><span className="block font-mono text-[10px] text-muted">{i}</span><span className="block break-words font-mono text-xs text-accent">{scalarText(item)}</span></li>)}</ol>;
  if (isRecord(value) && Object.keys(value).length > 0 && Object.keys(value).length <= 10 && depth < 2) return <dl className="min-w-0 divide-y divide-line rounded-lg border border-line bg-background px-3">
    {Object.entries(value).map(([key, entry]) => <div key={key} className="grid min-w-0 gap-2 py-3 sm:grid-cols-[minmax(6rem,1fr)_minmax(0,2fr)]">
      <dt className="break-words font-mono text-xs text-muted">{key}</dt>
      <dd className="min-w-0 break-words font-mono text-xs text-accent">{isScalar(entry) ? scalarText(entry) : <Value value={entry} depth={depth + 1} />}</dd>
    </div>)}
  </dl>;
  return <pre className="max-h-40 max-w-full overflow-auto whitespace-pre-wrap break-words rounded-lg bg-background p-3 font-mono text-xs text-accent">{value && typeof value === "object" ? JSON.stringify(value, (_, entry) => typeof entry === "number" ? Number(entry.toFixed(4)) : entry, 2) : scalarText(value)}</pre>;
}
