import type { ReadingScene as Demonstration, Strip } from "@/lib/intuition/types";
import { NetworkDiagram } from "./NetworkDiagram";

function Items({ row }: { row: Strip }) {
  if (row.items.length === 1) return <span className={`break-words ${row.active?.includes(0) ? "font-semibold text-accent" : ""}`}>{row.active?.includes(0) && <span className="sr-only">Highlighted: </span>}{row.items[0]}</span>;
  return <ul className="space-y-1.5 pl-4 list-disc marker:text-accent">{row.items.map((item, i) =>
    <li key={i} className={`break-words ${row.active?.includes(i) ? "font-semibold text-accent" : ""}`}>
      {row.active?.includes(i) && <span className="sr-only">Highlighted: </span>}{item}
    </li>)}
  </ul>;
}

export function ReadingScene({ scene }: { scene: Demonstration }) {
  if (scene.kind === "notes") return <dl className="divide-y divide-line">
    {scene.rows.map((row, i) => <div key={i} className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-5">
      <dt className="font-semibold text-foreground">{row.label}</dt>
      <dd className="min-w-0 leading-relaxed text-foreground"><Items row={row} /></dd>
    </div>)}
  </dl>;

  if (scene.kind === "flow") return <ol className="space-y-0">
    {scene.rows.map((row, i) => <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
      <div className="relative flex w-7 shrink-0 justify-center">
        <span className="relative z-10 flex size-7 items-center justify-center rounded-full border border-accent bg-background font-mono text-xs text-accent">{i + 1}</span>
        {i < scene.rows.length - 1 && <span aria-hidden="true" className="absolute top-8 -bottom-3 w-px bg-accent/50 after:absolute after:bottom-0 after:-left-1 after:size-2 after:rotate-45 after:border-b after:border-r after:border-accent" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-2 font-semibold text-foreground">{row.label}</p>
        <div className="leading-relaxed text-foreground"><Items row={row} /></div>
      </div>
    </li>)}
  </ol>;

  if (scene.kind === "table") return <div>
    <div className="hidden overflow-x-auto sm:block" role="region" aria-label="Example data" tabIndex={0}>
      <table className="w-full border-collapse text-left text-sm leading-relaxed">
        <caption className="sr-only">{scene.caption}</caption>
        <thead><tr className="border-b-2 border-line">
          {[scene.rowHeading, ...scene.columns].map((column, i) => <th key={i} scope="col" className="px-3 pb-3 align-bottom font-semibold text-muted first:pl-0">{column}</th>)}
        </tr></thead>
        <tbody>{scene.records.map((row, i) => <tr key={i} className="border-b border-line last:border-0 hover:bg-accent/5">
          <th scope="row" className="py-3 pr-3 align-top font-semibold text-foreground">{row.label}</th>
          {row.cells.map((cell, j) => <td key={j} className={`whitespace-pre-line break-words px-3 py-3 align-top ${row.active?.includes(j) ? "bg-accent/10 font-semibold text-accent" : "text-foreground"}`}>
            {row.active?.includes(j) && <span className="sr-only">Highlighted: </span>}{cell}
          </td>)}
        </tr>)}</tbody>
      </table>
    </div>
    <ol className="space-y-5 sm:hidden" aria-label={scene.rowHeading}>
      {scene.records.map((row, i) => <li key={i} className="border-l-2 border-accent/50 pl-3">
        <p className="mb-2 font-semibold text-foreground">{row.label}</p>
        <dl className="space-y-2">{row.cells.map((cell, j) => <div key={j}>
          <dt className="text-xs text-muted">{scene.columns[j]}</dt>
          <dd className={`whitespace-pre-line break-words leading-relaxed ${row.active?.includes(j) ? "font-semibold text-accent" : "text-foreground"}`}>{cell}</dd>
        </div>)}</dl>
      </li>)}
    </ol>
  </div>;

  if (scene.kind === "timeline") return <div>
    <p className="mb-4 text-sm font-medium text-muted">Recorded history <span aria-hidden="true">→</span> prediction time <span aria-hidden="true">→</span> future</p>
    <ol className="flex flex-col gap-3 sm:flex-row sm:gap-0" aria-label="Days in time order">
      {scene.days.map((day, i) => <li key={i} data-time-role={day.role} className={`relative min-w-0 flex-1 border-l-2 pl-4 sm:border-l-0 sm:border-t-2 sm:px-2 sm:pt-4 ${day.role === "known" ? "border-teal-500" : "border-dashed border-amber-500"} ${day.role === "target" ? "sm:border-l-2" : ""}`}>
        <span className={`mb-2 block text-xs font-semibold ${day.role === "known" ? "text-teal-600 dark:text-teal-400" : "text-amber-600 dark:text-amber-400"}`}>{day.role === "known" ? "Recorded" : day.role === "target" ? "Predict this day" : "Later"}</span>
        <p className="text-sm font-semibold text-foreground">{day.label}</p>
        <p className="my-1 text-lg font-semibold text-foreground">{day.role === "known" ? day.value : "?"}<span className="ml-1 text-xs font-normal text-muted">{day.role === "known" ? scene.unit : "not observed yet"}</span></p>
        {day.role === "target" && <p className="text-xs text-muted">Keep out of the inputs</p>}
      </li>)}
    </ol>
    {scene.prediction && <div className="mt-6 border-l-4 border-amber-500 bg-amber-500/5 p-3">
      <p className="text-sm text-muted">{scene.prediction.label}</p>
      <p className="mt-1 font-mono text-lg font-semibold text-foreground">{scene.prediction.value} {scene.unit}</p>
    </div>}
    {scene.calculation && <pre className="mt-4 whitespace-pre-wrap break-words text-sm">{scene.calculation}</pre>}
  </div>;

  if (scene.kind === "calculation") return <div className="border-l-2 border-accent/60 pl-4">
    <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-8 text-foreground">{scene.lines.join("\n")}</pre>
  </div>;

  if (scene.kind === "sequence") return <div className="space-y-6">
    {scene.rows.map((row, i) => <div key={i}>
      <p className="mb-2 text-sm font-semibold text-muted">{row.label}</p>
      {row.items.length === 1 ? <p className="whitespace-pre-wrap break-words text-lg text-foreground">{row.items[0]}</p> :
        <ol className="flex flex-wrap gap-x-4 gap-y-3" aria-label={row.label}>{row.items.map((item, j) => <li key={j} className={`min-w-0 max-w-full border-b-2 pb-2 ${row.active?.includes(j) ? "border-accent font-semibold text-accent" : "border-line text-foreground"}`}>
          <span className="mb-1 block text-xs text-muted">{scene.positionLabel} {j + 1}</span>
          <span className="whitespace-pre-wrap break-words text-lg">{item}</span>
          {row.active?.includes(j) && <span className="sr-only"> (highlighted)</span>}
        </li>)}</ol>}
    </div>)}
  </div>;

  if (scene.kind === "numberline") {
    const values = scene.rows.flatMap(row => row.values).concat(scene.reference === undefined ? [] : [scene.reference]);
    const low = Math.min(...values), high = Math.max(...values);
    const x = (v: number) => 20 + (v - low) / (high - low || 1) * 420;
    return <div className="space-y-4">
      {scene.referenceLabel && <p className="text-sm text-accent">{scene.referenceLabel}</p>}
      {scene.rows.map((row, i) => <div key={i}>
        <p className="text-sm font-semibold text-foreground">{row.label}</p>
        <svg viewBox="0 0 460 80" role="img" aria-label={`${row.label}: ${row.values.join(", ")}. All groups use the same scale.`} className="w-full">
          <line x1="20" x2="440" y1="48" y2="48" className="stroke-muted" />
          {scene.reference !== undefined && <line x1={x(scene.reference)} x2={x(scene.reference)} y1="6" y2="55" className="stroke-accent" strokeDasharray="4 3" />}
          {row.values.map((value, j) => <circle key={j} cx={x(value)} cy={34 - row.values.slice(0,j).filter(v=>v===value).length * 12} r="5" className="fill-teal-500"><title>{value}</title></circle>)}
          {[low, (low+high)/2, high].map((v,j)=><text key={j} x={x(v)} y="70" textAnchor="middle" fontSize="13" className="fill-muted">{Number(v.toFixed(2))}</text>)}
        </svg>
        <p className="text-xs text-muted">Values: <span className="font-mono">{row.values.join(", ")}</span></p>
      </div>)}
    </div>;
  }

  if (scene.kind === "network") {
    return <NetworkDiagram scene={scene} />;
  }
}
