import type { ReactNode } from "react";
import styles from "./BuildWorkshop.module.css";

export function WorkshopTestBadge({ result, children, muted = false }: { result?: boolean; children?: ReactNode; muted?: boolean }) {
  return <span className={styles.testBadge} data-result={muted || result === undefined ? "pending" : result ? "pass" : "fail"}>
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      {result === undefined ? <circle cx="10" cy="10" r="6"/> : result ? <path d="m4 10 4 4 8-9"/> : <path d="m5 5 10 10M15 5 5 15"/>}
    </svg>
    {children ?? (result === undefined ? "Not tested" : result ? "Passed" : "Failed")}
  </span>;
}
