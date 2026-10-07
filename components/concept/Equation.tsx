import { ReactNode } from "react";

// Keep the operation separate from the explanation, including in live widgets.
export function Equation({ children }: { children: ReactNode }) {
  return (
    <pre className="my-3 overflow-x-auto rounded-md border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
      <code>{children}</code>
    </pre>
  );
}
