import type { Data } from "@/lib/builds/engine";
import { WorkshopValue } from "./WorkshopValue";

/** Show spatial arrangement and stored values together, including during edits. */
export function PixelGrid({ value, maximum, label, change }: { value: Data; maximum: number; label: string; change?: (value: Data) => void }) {
  if (!Array.isArray(value) || !value.length || !value.every(row => Array.isArray(row) && row.length > 0 && row.length === (value[0] as Data[]).length && row.every(x => x === null || typeof x === "number"))) return <WorkshopValue value={value} />;
  const rows = value as (number | null)[][];
  const scale = Number.isFinite(maximum) && maximum > 0 ? maximum : 1;
  return <div className="max-w-full overflow-auto">
    <table className="border-separate border-spacing-1 font-mono text-xs" aria-label={label}>
      <caption className="pb-3 text-left font-sans text-sm text-muted">{label}. Rows and columns start at zero. Shades use a scale from 0 to {scale}.</caption>
      <thead><tr><td /><th scope="col" colSpan={rows[0].length} className="text-left font-normal text-muted">Column</th></tr><tr><th scope="col" className="pr-2 font-normal text-muted">Row</th>{rows[0].map((_, c) => <th key={c} scope="col" className="pb-1 font-normal text-muted">{c}</th>)}</tr></thead>
      <tbody>{rows.map((row, r) => <tr key={r}><th scope="row" className="pr-2 font-normal text-muted">{r}</th>{row.map((pixel, c) => {
        const level = Math.round(255 * Math.max(0, Math.min(1, (pixel ?? 0) / scale)));
        const style = { backgroundColor: `rgb(${level}, ${level}, ${level})`, color: level >= 150 ? "#0b1220" : "#ffffff" };
        return <td key={c} className="rounded border border-slate-500 text-center" style={style}>{change ? <input aria-label={`${label}, row ${r}, column ${c}`} type="number" step="any" value={pixel ?? ""} className="min-h-11 w-12 rounded bg-transparent px-1 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 sm:w-16" onChange={event => change(rows.map((old, y) => old.map((x, col) => y === r && col === c ? event.target.value === "" ? null : Number(event.target.value) : x)))} /> : <span className="inline-block min-w-10 px-2 py-3 sm:min-w-12">{pixel === null ? "?" : Number(pixel.toFixed(3))}</span>}</td>;
      })}</tr>)}</tbody>
    </table>
  </div>;
}
