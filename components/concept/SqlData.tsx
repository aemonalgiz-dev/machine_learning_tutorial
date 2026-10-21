import type { SqlTable } from "@/lib/exercises";

export function SqlData({ tables, label = "Tables for this query" }: { tables: SqlTable[]; label?: string }) {
  return <div className="my-4 min-w-0 space-y-4" aria-label={label}>
    {tables.map((table, index) => <div key={index} className="min-w-0 overflow-hidden rounded-lg border border-line">
      <div className="border-b border-line bg-raised px-3 py-2 font-mono text-xs text-foreground">{table.name ?? "Query result"}</div>
      <div className="max-h-80 overflow-auto" tabIndex={0} aria-label={`${table.name ?? 'Query result'} rows`}>
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-surface"><tr>{table.columns.map((name, column) => <th key={column} className="border-b border-line px-3 py-2 font-mono text-xs font-semibold">{name}</th>)}</tr></thead>
          <tbody>{table.rows.map((row, r) => <tr key={r} className="border-b border-line last:border-0">{row.map((value, c) => <td key={c} className="max-w-72 break-words px-3 py-2 align-top">{value === null ? <span className="font-mono text-xs italic text-muted">NULL</span> : String(value)}</td>)}</tr>)}</tbody>
        </table>
        {!table.rows.length && <p className="p-3 text-sm text-muted">No rows.</p>}
      </div>
      {table.truncated && <p className="border-t border-line px-3 py-2 text-xs text-muted">Showing the first 50 rows of this fixture. Open the setup below for the full dataset.</p>}
    </div>)}
  </div>;
}
