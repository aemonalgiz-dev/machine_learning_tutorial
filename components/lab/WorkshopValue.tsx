import { show,type Data } from "@/lib/builds/engine";
import { graphDisplay } from "@/lib/builds/graph-display";
import { NetworkDiagram } from "../concept/NetworkDiagram";

/** Keep small collections visible as individual values rather than JSON syntax. */
export function WorkshopValue({value}:{value:Data}) {
  const graph = graphDisplay(value);
  if (graph) return <div className="min-w-0 rounded-lg border border-line bg-background p-2">
    <NetworkDiagram scene={graph} />
    <details className="mt-3 text-xs"><summary className="cursor-pointer text-muted">Inspect the node and relationship records</summary><pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-accent">{JSON.stringify(value, null, 2)}</pre></details>
  </div>;
  if(Array.isArray(value)&&value.length>0&&value.length<=12&&value.every(row=>Array.isArray(row)&&row.length>0&&row.length<=12&&row.every(item=>typeof item==="number"))) {
    const rows=value as number[][];
    if(rows.every(row=>row.length===rows[0].length))return <div className="max-w-full overflow-auto rounded-lg border border-line bg-background p-2"><table className="border-separate border-spacing-1 font-mono text-xs" aria-label={`${rows.length} rows by ${rows[0].length} columns`}><tbody>{rows.map((row,i)=><tr key={i}>{row.map((item,j)=><td key={j} className="min-w-9 rounded bg-raised px-2 py-2 text-center text-accent">{show(item)}</td>)}</tr>)}</tbody></table></div>;
  }
  if(Array.isArray(value)&&value.length>0&&value.length<=30&&value.every(item=>item===null||typeof item!=="object"))return <ol className="flex max-w-full flex-wrap gap-2 rounded-lg border border-line bg-background p-2" aria-label="Values in order">{value.map((item,i)=><li key={i} className="min-w-9 max-w-full rounded border border-line bg-raised px-2 py-1 text-center"><span className="block font-mono text-[10px] text-muted">{i}</span><span className="block break-words font-mono text-xs text-accent">{typeof item==="string"?item:show(item)}</span></li>)}</ol>;
  return <pre className="max-h-40 max-w-full overflow-auto whitespace-pre-wrap break-words rounded-lg bg-background p-3 font-mono text-xs text-accent">{typeof value==="string"?value:value && typeof value === "object" ? JSON.stringify(value, (_, entry) => typeof entry === "number" ? Number(entry.toFixed(4)) : entry, 2) : show(value)}</pre>;
}
