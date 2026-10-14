"use client";

import { useId, useRef, useState } from "react";
import type { Data } from "@/lib/builds/engine";
import styles from "./BuildWorkshop.module.css";

// A small, editable copy of a fixture. The original remains the test oracle.
function InputValue({ label, value, disabled, onChange, onValidity }: {
  label: string; value: Data; disabled: boolean;
  onChange: (value: Data) => void; onValidity: (valid: boolean) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState("");
  const numeric = typeof value === "number", text = typeof value === "string";
  const formatted = text || numeric ? String(value) : JSON.stringify(value, null, 2);
  function update(raw: string) {
    setDraft(raw);
    try {
      if (numeric && (!raw.trim() || !Number.isFinite(Number(raw)))) throw Error("Enter a finite number.");
      const next: Data = numeric ? Number(raw) : text ? raw : JSON.parse(raw);
      let count = 0;
      const check = (item: Data, depth = 0): void => {
        if (++count > 512 || depth > 10) throw Error("Keep this experiment to 512 values and at most 10 nested levels.");
        if (typeof item === "number" && !Number.isFinite(item)) throw Error("Use finite numbers.");
        if (typeof item === "string" && item.length > 4096) throw Error("Keep text to 4,096 characters for this experiment.");
        if (Array.isArray(item)) item.forEach(child => check(child, depth + 1));
        else if (item && typeof item === "object") Object.values(item).forEach(child => check(child, depth + 1));
      };
      check(next);
      setError(""); onValidity(true); onChange(next);
    } catch (reason) {
      setError(reason instanceof SyntaxError ? "Use JSON, for example [2, 4, 6] for a list. Put text in double quotes." : (reason as Error).message);
      onValidity(false);
    }
  }
  const props = { id, disabled, value: draft ?? formatted, "aria-label": label, "aria-invalid": Boolean(error), "aria-describedby": error ? `${id}-error` : undefined, maxLength: 12000 };
  return <div className={styles.experimentField}>
    <label htmlFor={id}>{label}</label>
    {numeric ? <input {...props} inputMode="decimal" onChange={e => update(e.target.value)}/>
      : <textarea {...props} rows={text ? 2 : Math.min(7, formatted.split("\n").length)} spellCheck={false} onChange={e => update(e.target.value)}/>}
    {error && <p id={`${id}-error`} className={styles.fieldError}>{error}</p>}
  </div>;
}

function SourceInput({ name, value, disabled, onChange, onValidity }: {
  name: string; value: Data; disabled: boolean;
  onChange: (value: Data) => void; onValidity: (key: string, valid: boolean) => void;
}) {
  const [json, setJson] = useState(false);
  const vector = Array.isArray(value) && value.length > 0 && value.length <= 24 && value.every(item => typeof item === "number");
  const matrix = Array.isArray(value) && value.length > 0 && value.length <= 8 && value.every(row => Array.isArray(row) && row.length > 0 && row.length <= 8 && row.every(item => typeof item === "number"));
  if (!vector && !matrix && !json) return <InputValue label={name} value={value} disabled={disabled} onChange={onChange} onValidity={valid => onValidity(name, valid)}/>;
  const rows: number[][] = matrix ? value as number[][] : [value as number[]];
  function changeMode() {
    onValidity(name, true);
    if (vector || matrix) rows.forEach((row, r) => row.forEach((_, c) => onValidity(matrix ? `${name}, row ${r + 1}, column ${c + 1}` : `${name}, item ${c + 1}`, true)));
    setJson(!json);
  }
  if (json) return <div><InputValue key="json" label={name} value={value} disabled={disabled} onChange={onChange} onValidity={valid => onValidity(name, valid)}/>{(vector || matrix) && <button type="button" className={styles.inputMode} disabled={disabled} onClick={changeMode}>Edit {name} as cells</button>}</div>;
  return <fieldset className={styles.experimentArray}><legend>{name}</legend><div className={styles.experimentRows}>
    {rows.map((row, r) => <div key={r} className={styles.experimentRow}>
      {matrix && <span className={styles.rowLabel}>Row {r + 1}</span>}
      {row.map((cell, c) => {
        const label = matrix ? `${name}, row ${r + 1}, column ${c + 1}` : `${name}, item ${c + 1}`;
        return <InputValue key={c} label={label} value={cell} disabled={disabled} onValidity={valid => onValidity(label, valid)} onChange={next => {
          const copy = rows.map(cells => [...cells]); copy[r][c] = next as number;
          onChange(matrix ? copy : copy[0]);
        }}/>;
      })}
    </div>)}
  </div><button type="button" className={styles.inputMode} disabled={disabled} onClick={changeMode}>Edit {name} as JSON</button><p className="mt-1 text-xs text-muted">Use JSON to add or remove entries.</p></fieldset>;
}

export function WorkshopInputs({ sources, data, disabled, onChange, onValidity }: {
  sources: Record<string, string>; data: Record<string, Data>; disabled: boolean;
  onChange: (data: Record<string, Data>) => void; onValidity: (valid: boolean) => void;
}) {
  const errors = useRef<Record<string, boolean>>({});
  function validity(key: string, valid: boolean) {
    errors.current = { ...errors.current, [key]: !valid };
    onValidity(!Object.values(errors.current).some(Boolean));
  }
  return <div className={styles.experimentFields}>{Object.entries(data).map(([key, value]) =>
    <SourceInput key={key} name={sources[key] ?? key} value={value} disabled={disabled} onValidity={validity} onChange={next => onChange({ ...data, [key]: next })}/>
  )}</div>;
}
