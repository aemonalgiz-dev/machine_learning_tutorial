import styles from "./Botie.module.css";

export type BotieMood = "ready" | "thinking" | "curious" | "happy";

/** Code-native artwork: the same character can react without loading a video. */
export function Botie({ mood = "ready", size = 112, decorative = false }: { mood?: BotieMood; size?: number; decorative?: boolean }) {
  return <svg viewBox="0 0 140 150" width={size} height={size * 150 / 140} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : `Botie, ${mood === "happy" ? "celebrating your experiment" : mood === "thinking" ? "watching the experiment" : mood === "curious" ? "ready to help you try again" : "your robot workshop companion"}`} aria-hidden={decorative || undefined} className={`${styles.botie} ${styles[mood] ?? ""} shrink-0`}>
    <ellipse cx="70" cy="139" rx="32" ry="5" fill="currentColor" opacity=".1" />
    <g className={styles.body}>
      <path d="M70 29V17" stroke="#e7a923" strokeWidth="5" strokeLinecap="round" />
      <circle className={styles.antenna} cx="70" cy="12" r="7" fill="#ffcb55" stroke="#79560e" strokeWidth="2" />
      <g className={styles.leftArm}><path d="M35 96L21 109" stroke="#82aabf" strokeWidth="9" strokeLinecap="round" /><circle cx="18" cy="112" r="7" fill="#ffcb55" stroke="#79560e" strokeWidth="2" /></g>
      <g className={styles.rightArm}><path d="M104 96L119 108" stroke="#82aabf" strokeWidth="9" strokeLinecap="round" /><circle cx="122" cy="111" r="7" fill="#ffcb55" stroke="#79560e" strokeWidth="2" /></g>
      <path d="M53 122v8M87 122v8" stroke="#82aabf" strokeWidth="10" strokeLinecap="round" />
      <rect x="36" y="81" width="68" height="43" rx="18" fill="#e8f0ed" stroke="#557386" strokeWidth="3" />
      <path d="M55 88l15 13 15-13" fill="#ffcb55" stroke="#a57916" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="70" cy="113" r="4" fill="#82aabf" />
      <rect x="17" y="46" width="11" height="23" rx="5" fill="#82aabf" /><rect x="112" y="46" width="11" height="23" rx="5" fill="#82aabf" />
      <rect x="25" y="28" width="90" height="62" rx="24" fill="#ffcb55" stroke="#79560e" strokeWidth="3" />
      <path d="M40 35h44" stroke="#fff0bf" strokeWidth="4" strokeLinecap="round" />
      <rect x="34" y="40" width="72" height="39" rx="16" fill="#112b3b" />
      <g className={styles.eyes} fill="#b5f5ea">
        {mood === "happy" ? <g fill="none" stroke="#b5f5ea" strokeWidth="4" strokeLinecap="round"><path d="M46 57q7-10 14 0M80 57q7-10 14 0" /></g> : <><rect x="48" y="50" width="10" height={mood === "curious" ? 9 : 13} rx="5" /><rect x="82" y="50" width="10" height="13" rx="5" /></>}
      </g>
      <path d={mood === "happy" ? "M62 67q8 10 16 0Z" : mood === "curious" ? "M65 69q6-3 10 0" : "M64 67q6 6 12 0"} fill={mood === "happy" ? "#b5f5ea" : "none"} stroke="#b5f5ea" strokeWidth="2" strokeLinecap="round" />
      <circle cx="43" cy="68" r="4" fill="#f49c83" opacity=".6" /><circle cx="97" cy="68" r="4" fill="#f49c83" opacity=".6" />
    </g>
  </svg>;
}

export function BotieSays({ children, mood = "ready", className = "" }: { children: React.ReactNode; mood?: BotieMood; className?: string }) {
  return <div className={`flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 sm:p-4 ${className}`}>
    <Botie mood={mood} size={78} decorative />
    <div className="min-w-0"><p className="mb-1 font-mono text-xs font-semibold text-accent">BOTIE</p><div className="text-sm leading-6 text-foreground">{children}</div></div>
  </div>;
}
