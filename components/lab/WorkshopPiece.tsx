"use client";

import { useId, useState, type PointerEvent, type KeyboardEvent } from "react";
import type { Data, Piece, Tool } from "@/lib/builds/engine";
import { WorkshopValue } from "./WorkshopValue";
import styles from "./BuildWorkshop.module.css";

type Setting = NonNullable<Tool["settings"]>[number];

function SettingField({ setting, value, name, disabled, onChange, onValidity }: {
  setting: Setting; value: number | string; name: string; disabled: boolean;
  onChange: (value: number | string) => void; onValidity: (valid: boolean) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const id = useId(), numeric = typeof setting.initial === "number";
  const text = draft ?? String(value);
  const valid = !numeric || (text.trim() !== "" && Number.isFinite(Number(text)));
  function commit() {
    if (draft === null || !valid) return;
    const next = numeric ? Number(draft) : draft;
    if (next !== value) onChange(next);
    setDraft(null);
  }
  return <div className={styles.setting}>
    <label htmlFor={id}>{setting.label}</label>
    {setting.options ? <select id={id} aria-label={`${name} ${setting.label}`} disabled={disabled} value={value} onChange={e => onChange(e.target.value)}>
      {setting.options.map(option => <option key={option}>{option}</option>)}
    </select> : <input id={id} aria-label={`${name} ${setting.label}`} type="text" inputMode={numeric ? "decimal" : "text"}
      disabled={disabled} value={text} aria-invalid={!valid} aria-describedby={!valid ? `${id}-error` : undefined}
      onChange={e => { const next = e.target.value; setDraft(next); onValidity(!numeric || (next.trim() !== "" && Number.isFinite(Number(next)))); }}
      onBlur={commit} onKeyDown={e => {
        if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); }
        if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setDraft(null); onValidity(true); }
      }}/>}
    {!valid && <p id={`${id}-error`} className={styles.fieldError}>Enter a number. Escape restores the previous value.</p>}
  </div>;
}

export function WorkshopPiece({ piece, name, labels, connections, settings, value, hasSignal, busy, selected, active, error, missingPort,
  armed, targetPort, connecting, onSelect, onBodySelect, onMove, onMoveKey, onOutput, onOutputKey, onInput, onSetting, onValidity }: {
  piece: Piece; name: string; labels: string[]; connections: (string | undefined)[]; settings: Setting[];
  value: Data | undefined; hasSignal: boolean; busy: boolean; selected: boolean; active: boolean; error: boolean; missingPort?: number;
  armed: boolean; targetPort?: number; connecting: boolean;
  onSelect: () => void; onBodySelect: () => void; onMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onMoveKey: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onOutput: (event: PointerEvent<HTMLButtonElement>) => void; onOutputKey: () => void;
  onInput: (port: number) => void; onSetting: (key: string, value: number | string) => void;
  onValidity: (key: string, valid: boolean) => void;
}) {
  const id = useId();
  const source = piece.tool.startsWith("source:"), result = piece.tool === "output";
  return <div data-piece={piece.id} role="group" aria-label={`${name} machine`}
    className={`${styles.machine} ${source ? styles.source : ""} ${result ? styles.outputMachine : ""} ${selected ? styles.selected : ""} ${active ? styles.active : ""} ${error ? styles.error : ""}`}
    style={{ left: piece.x, top: piece.y }} onClick={e => { if (!(e.target as Element).closest("button,input,select,textarea,label")) onBodySelect(); }}>
    <button className={styles.handle} aria-label={`Inspect or move ${name}`} onPointerDown={onMove} onFocus={onSelect} onClick={onSelect} onKeyDown={onMoveKey}>
      <span>{name}</span><span className={styles.grip} aria-hidden="true">⠿</span>
    </button>
    {labels.length > 0 && <div className={styles.inputs}>
      {labels.map((label, i) => <button key={label} disabled={busy} data-input-piece={piece.id} data-input-port={i}
        aria-label={`${name} input ${i + 1}: ${label}`}
        aria-describedby={`${id}-input-${i}`}
        className={`${styles.inlet} ${connections[i] ? styles.connectedInput : ""} ${connecting ? styles.availableInput : ""} ${targetPort === i ? styles.targetInput : ""} ${missingPort === i ? styles.missingInput : ""}`}
        onClick={e => { e.stopPropagation(); onInput(i); }}>
        <span data-socket="input" className={styles.inputSocket} aria-hidden="true">{i + 1}</span>
        <span className={styles.inputText}><span className={styles.inputLabel}>{label}</span>
          <span id={`${id}-input-${i}`} className={styles.inputStatus}>{connections[i] ? `From ${connections[i]}` : "Connect an output here"}</span>
        </span>
      </button>)}
    </div>}
    {settings.length > 0 && <div className={styles.settings} aria-label={`${name} settings`}>
      {settings.map(setting => <SettingField key={setting.key} setting={setting} value={piece.settings[setting.key] ?? setting.initial} name={name} disabled={busy}
        onChange={value => onSetting(setting.key, value)} onValidity={valid => onValidity(setting.key, valid)}/>)}
    </div>}
    <div className={styles.outputSection}>
      <div className={styles.outputHeading}><span>{source ? "Example data" : result ? "Received result" : "Output"}</span>
        {!result && <button data-socket="output" disabled={busy} aria-label={`${name} output`} aria-pressed={armed} className={styles.outlet}
          onPointerDown={onOutput} onClick={e => { e.stopPropagation(); if (e.detail === 0) onOutputKey(); }}>→</button>}
      </div>
      {value !== undefined ? <div className={styles.readout} data-testid="component-value"><WorkshopValue value={value}/></div>
        : <p className={styles.waiting}>{hasSignal ? "No value returned" : result ? "Your answer will arrive here." : "Run to see the result."}</p>}
    </div>
  </div>;
}
