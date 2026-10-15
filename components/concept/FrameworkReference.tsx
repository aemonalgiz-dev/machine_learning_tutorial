import type { FrameworkReference as Reference } from "@/lib/lessons/types";
import { PythonCode } from "./PythonCode";

/** Provider-dependent recipes stay separate from the runnable browser exercises. */
export function FrameworkReference({ reference }: { reference: Reference }) {
  return <section aria-label={reference.title} className="my-8 min-w-0 space-y-4 rounded-xl border border-line bg-surface p-4 sm:p-6" data-framework-reference>
    <div>
      <p className="text-xs font-mono text-muted">Run in your own environment</p>
      <h3 className="mt-2 text-lg font-semibold text-foreground">{reference.title}</h3>
    </div>
    {reference.description.map(text => <p key={text}>{text}</p>)}
    <div className="space-y-2 text-sm text-muted">
      {reference.setup.map(text => <p key={text}>{text}</p>)}
    </div>
    {reference.language === "python" ? <PythonCode source={reference.code} label="Python reference" /> : <div className="min-w-0 overflow-hidden rounded-lg border border-line">
      <div className="border-b border-line px-4 py-2 text-xs font-mono text-muted">{reference.language}</div>
      <pre className="max-h-[32rem] overflow-auto p-4 text-sm leading-relaxed" tabIndex={0} aria-label={`${reference.title} code`}><code>{reference.code}</code></pre>
    </div>}
    {reference.interpretation.map(text => <p key={text}>{text}</p>)}
    <p className="text-sm text-muted"><a className="text-accent underline underline-offset-4" href={reference.source.url} target="_blank" rel="noreferrer">{reference.source.title}</a>. Documentation checked <time dateTime={reference.checkedOn}>{reference.checkedOn}</time>.</p>
  </section>;
}
